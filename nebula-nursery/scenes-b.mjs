// Scene 3: the Orion Nebula nursery — a dense clump collapses under gravity and a baby protostar appears.
import { C, TAU, rnd, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, around, burst, arrow, shakeOf, talkLevel } from './lib.mjs';
import { nebulaCloud, protostar, gasDot, dustGrain, tag, glow } from './cast.mjs';
import { title } from './scenes-a.mjs';

const CORE = [540, 900];

function fastForward(ctx, t, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(8,10,36,0.85)';
  ctx.beginPath(); ctx.roundRect(250, 1385, 580, 70, 35); ctx.fill();
  ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.stroke();
  // blinking double-triangle fast-forward glyph
  const on = Math.floor(t * 4) % 2 ? 1 : 0.55;
  ctx.fillStyle = `rgba(255,201,60,${on})`;
  for (const dx of [0, 26]) {
    ctx.beginPath(); ctx.moveTo(290 + dx, 1400); ctx.lineTo(318 + dx, 1420); ctx.lineTo(290 + dx, 1440); ctx.closePath(); ctx.fill();
  }
  txt(ctx, '快进示意 · 真实过程非常漫长', 570, 1421, { size: 34, color: C.white });
  ctx.restore();
}

function orionScene(ctx, t) {
  const t0 = S('orion1') - 0.25, tName = at('orion1', '猎户座'), tForm = at('orion1', '恒星形成');
  const tHi = S('orionHi'), tBirth = at('orionHi', '孕育');
  const tDense = at('collapse', '致密'), tGrav = at('collapse', '引力'), tProto = at('collapse', '原恒星');
  const tBaby = S('baby'), tWa = at('baby', '哇'), tGrow = at('baby', '长大');
  title(ctx, t, t0, '有些，正在孕育恒星', '猎户座大星云 · 恒星形成区');

  // --- phase 1: the Orion Nebula as a cozy character ---
  const zoomIn = easeIO(prog(t, tDense - 0.6, tDense + 0.4));
  const cr = lerp(360, 900, zoomIn), cy = lerp(880, 900, zoomIn);
  const bob = Math.sin(t * 1.6) * 8;
  nebulaCloud(ctx, t, 540, cy + bob, cr * easeOut(prog(t, t0, t0 + 0.8)), {
    a: lerp(1, 0.35, zoomIn), faceA: fadeIn(t, tHi - 0.4, 0.4) * (1 - zoomIn), talk: talkLevel(t, ['orionHi']),
    stars: t > tBirth ? 2 : 1,
  });
  const np = pop(t, tName, 0.4) * (1 - zoomIn);
  around(ctx, 540, 1300, np, np, () => tag(ctx, 540, 1300, '猎户座大星云', '一片恒星形成区', { color: C.nebPink, size: 52 }));
  const bp = pop(t, tForm, 0.4) * (1 - zoomIn);
  around(ctx, 860, 640, bp, bp, () => {
    ctx.fillStyle = C.ok;
    ctx.beginPath(); ctx.arc(860, 640, 62, 0, TAU); ctx.fill();
    txt(ctx, '育婴', 860, 625, { size: 34, color: C.ink });
    txt(ctx, '中', 860, 664, { size: 34, color: C.ink });
  }, 0.2);
  // hearts float up while Orion brags about its babies
  for (let i = 0; i < 6; i++) {
    const ti = tBirth + i * 0.25, p = prog(t, ti, ti + 1.6);
    if (p <= 0 || p >= 1 || zoomIn > 0.5) continue;
    const x = 540 + (rnd(i + 3) - 0.5) * 520, y = 820 - p * 260;
    ctx.save();
    ctx.globalAlpha *= Math.sin(p * Math.PI);
    txt(ctx, '♥', x, y, { size: 46 + rnd(i) * 20, color: C.pink });
    ctx.restore();
  }

  // --- phase 2: zoom into a dense clump; gravity pulls gas & dust together ---
  const clumpA = fadeIn(t, tDense - 0.2, 0.6);
  if (clumpA > 0) {
    const [x, y] = CORE;
    const c = easeIO(prog(t, tGrav - 0.1, tProto + 0.1));
    const shrink = lerp(310, 120, c);
    ctx.save();
    ctx.globalAlpha *= clumpA;
    glow(ctx, x, y, 0, shrink * 1.3, 'rgba(120,70,190,0.55)');
    glow(ctx, x, y, 0, shrink * 0.8, `rgba(255,170,110,${0.15 + 0.6 * c})`);
    ctx.strokeStyle = `rgba(255,255,255,${0.45 * (1 - c)})`; ctx.lineWidth = 4; ctx.setLineDash([14, 10]);
    ctx.beginPath(); ctx.arc(x, y, shrink, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);
    for (let i = 0; i < 44; i++) {
      const d0 = 140 + rnd(i + 11) * 300, a0 = rnd(i + 17) * TAU;
      const ci = clamp(c * (0.8 + 0.4 * rnd(i + 23)));
      const d = lerp(d0, 18, ci), a = a0 + ci * 2.4 + Math.sin(t + i) * 0.03;
      const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * 0.9;
      const fade = clamp((d - 30) / 60);
      if (i % 3) gasDot(ctx, px, py, 8, fade); else dustGrain(ctx, px, py, 11, a, fade);
    }
    ctx.restore();
    const gA = fadeIn(t, tGrav - 0.1, 0.3) * (1 - prog(t, tProto - 0.2, tProto + 0.2));
    if (gA > 0) {
      ctx.save();
      ctx.globalAlpha *= gA;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + 0.5, pulse = (t * 1.6 + i * 0.15) % 1;
        const r1 = 460 - pulse * 60, r2 = r1 - 110;
        arrow(ctx, x + Math.cos(a) * r1, y + Math.sin(a) * r1, x + Math.cos(a) * r2, y + Math.sin(a) * r2, { color: C.gold, w: 9, head: 28 });
      }
      txt(ctx, '引力', x + 300, y - 330, { size: 64, color: C.gold, stroke: '#0a0828', sw: 12 });
      ctx.restore();
    }
    const dA = pop(t, tDense, 0.4) * (1 - prog(t, tGrav - 0.2, tGrav + 0.2));
    around(ctx, x, y - 380, dA, dA, () => tag(ctx, x, y - 380, '致密云团', null, { color: C.lilac, size: 46 }));
  }
  fastForward(ctx, t, fadeIn(t, tGrav, 0.3) * (1 - prog(t, E('baby') + 0.2, E('baby') + 0.5)));

  // --- phase 3: the protostar is "born" and cries ---
  const pp = pop(t, tProto, 0.6);
  if (pp > 0) {
    const [x, y] = CORE;
    const grow = easeOut(prog(t, tBaby - 0.3, tBaby + 0.4));
    const [sx, sy] = shakeOf(t, tWa, 10, 0.6);
    const r = lerp(80, 135, grow) * pp + Math.sin(t * 3) * 2;
    const crying = t > tWa - 0.05 && t < tWa + 0.7;
    protostar(ctx, t, x + sx, y + sy - 30, r, { talk: crying ? 0 : talkLevel(t, ['baby']), mood: crying ? 'cry' : 'happy', heat: 0.8 + 0.2 * Math.sin(t * 4) });
    const lp = pop(t, tProto + 0.25, 0.4);
    around(ctx, x, y + 225, lp, lp, () => tag(ctx, x, y + 225, '原恒星', '裹着气体尘埃，还在“长身体”', { color: C.gold, size: 50 }));
    const wp = pop(t, tWa, 0.3) * (1 - prog(t, tWa + 0.8, tWa + 1.1));
    around(ctx, x + 250, y - 200, wp, wp, () => txt(ctx, '哇——！', x + 250, y - 200, { size: 100, color: C.gold, stroke: '#0a0828', sw: 14 }), 0.12);
    // growth progress bar
    const ga = fadeIn(t, tGrow - 0.3, 0.3);
    if (ga > 0) {
      const fill = 0.12 + (0.18 * ((t - tGrow + 3) % 3)) / 3;
      ctx.save();
      ctx.globalAlpha *= ga;
      ctx.fillStyle = 'rgba(8,10,36,0.85)';
      ctx.beginPath(); ctx.roundRect(290, 1270, 500, 56, 28); ctx.fill();
      ctx.fillStyle = C.gold;
      ctx.beginPath(); ctx.roundRect(298, 1278, 484 * clamp(fill), 40, 20); ctx.fill();
      txt(ctx, '成长中…', 540, 1299, { size: 32, color: C.white, stroke: '#0a0828', sw: 6 });
      ctx.restore();
    }
  }
  burst(ctx, t, tProto, CORE[0], CORE[1], { n: 14, r: 300, size: 26 });
}

export const scenesB = [{ id: 'orion', from: S('orion1') - 0.25, to: S('ring1') - 0.35, draw: orionScene }];

export const eventsB = [
  { type: 'sparkle', t: at('orion1', '猎户座') },
  { type: 'ding', t: at('orion1', '恒星形成'), n: 86 },
  ...[0, 1, 2].map((i) => ({ type: 'pop', t: at('orionHi', '孕育') + i * 0.25, f: 900 + i * 120, amp: 0.5 })),
  { type: 'whoosh', t: at('collapse', '致密') - 0.6, d: 1.0, from: 300, to: 1500 },
  { type: 'wind', t: at('collapse', '引力') - 0.1, d: at('collapse', '原恒星') - at('collapse', '引力') + 0.2 },
  { type: 'tada', t: at('collapse', '原恒星') },
  { type: 'boing', t: at('baby', '哇') },
  { type: 'sparkle', t: at('baby', '长大') },
];
