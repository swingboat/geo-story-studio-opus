// Scenes 4–5: eight energy beans fall straight down onto 2 tiles (4 each), then slanted onto 4 tiles (2 each).
import { W, C, TAU, S, E, at, prog, lerp, clamp, easeIO, easeOut, pop, txt, around, card, burst } from './lib.mjs';
import { title, tag } from './props.mjs';
import { bean, beamGeom, beamAt, drawBeam, beanBatch, beanSlots, landTimes, ground, spanBracket, angleMark } from './beam.mjs';

const INK = '#0a0828';
const GY = 1180, SQ = 160, BW = 320;
const GV = beamGeom(540, GY, Math.PI / 2, BW, 600);
const GS = beamGeom(600, GY, Math.PI / 6, BW, 520);

// Bean speeds chosen so the batch lands right on the spoken "挤在" / "摊在".
const fallV = (g, t0, t1) => Math.max(...beanSlots(g).map((b) => b.L)) / (t1 - t0);
const T_V0 = at('direct', '同样'), V_V = fallV(GV, T_V0, at('direct', '挤在'));
const T_S0 = at('slant', '同样'), V_S = fallV(GS, T_S0, at('slant', '摊在'));

function directScene(ctx, t) {
  const tB = S('beans'), tD = S('direct'), tN = at('directSq', '四颗');
  title(ctx, t, tB - 0.2, '能量豆', '同样一束光 = 同样多的能量', { size: 92, t1: tD - 0.1 });
  title(ctx, t, tD, '接近垂直', '能量挤在一起', { size: 92 });
  const heat = easeOut(prog(t, at('direct', '挤在'), tN));
  ground(ctx, t, 60, 1020, GY, SQ, 380, { lit1: GV.f1, lit2: GV.f2, heat, faces: heat > 0, counts: 4, countA: prog(t, tN - 0.1, tN + 0.5) });
  drawBeam(ctx, t, GV, { reveal: easeOut(prog(t, tD - 0.2, tD + 0.9)), bar: prog(t, tD + 0.6, tD + 1.0) });
  // intro: eight big beans line up, then shrink into the beam's cross-section
  const k = easeIO(prog(t, tD - 0.1, tD + 0.6));
  const slots = beanSlots(GV);
  if (k < 1) {
    slots.forEach((b, i) => {
      const p = pop(t, at('beans', '能量豆') - 0.5 + i * 0.07, 0.4);
      const [sx, sy] = beamAt(GV, b.u, 0);
      const x = lerp(540 + (i - 3.5) * 112, sx, k), y = lerp(800 + Math.sin(t * 4 + i) * 10 * (1 - k), sy, k);
      bean(ctx, t, x, y, lerp(44, 22, k) * p, { mood: i % 3 ? 'happy' : 'starry' });
    });
    const tp = pop(t, at('beans', '能量豆'), 0.45) * (1 - k);
    around(ctx, W / 2, 960, tp, tp, () => tag(ctx, W / 2, 960, '8 颗能量豆', null, { color: C.gold, size: 48 }));
  } else beanBatch(ctx, t, GV, T_V0, { r: 22, v: V_V, landedMood: 'wow' });
  // "smaller area" bracket and the right-angle mark
  spanBracket(ctx, GV.f1, GV.f2, GY + 170, '面积小', prog(t, at('direct', '较小') - 0.2, at('direct', '较小') + 0.3), C.gas);
  const rp = prog(t, tD + 0.8, tD + 1.2);
  if (rp > 0) {
    ctx.save(); ctx.globalAlpha *= rp; ctx.strokeStyle = C.pink; ctx.lineWidth = 6;
    ctx.strokeRect(GV.f1 - 46, GY - 46, 46, 46); ctx.restore();
  }
  burst(ctx, t, tN, 540, GY - 60, { n: 12, r: 230 });
}

function slantScene(ctx, t) {
  const t0 = S('slant'), tN = at('slantSq', '两颗'), tM = S('perM2');
  title(ctx, t, t0, '更倾斜', '能量摊开了', { size: 92, t1: tM - 0.2 });
  title(ctx, t, tM, '每平方米', '分到的能量更少', { size: 92 });
  const heat = 0.5 * easeOut(prog(t, at('slant', '摊在'), tN));
  ground(ctx, t, 0, W, GY, SQ, 280, { lit1: GS.f1, lit2: GS.f2, heat, faces: heat > 0, coolMood: 'happy', counts: 2, countA: prog(t, tN - 0.1, tN + 0.7) });
  drawBeam(ctx, t, GS, { reveal: easeOut(prog(t, t0 - 0.2, t0 + 0.9)) });
  beanBatch(ctx, t, GS, T_S0, { r: 24, v: V_S });
  angleMark(ctx, GS.f1, GY, GS.elev, 110, null, prog(t, t0 + 0.6, t0 + 1.0));
  spanBracket(ctx, GS.f1, GS.f2, GY + 170, '面积大', prog(t, at('slant', '更大') - 0.2, at('slant', '更大') + 0.4), C.gas);
  // the ghost of the straight-down footprint, for comparison
  const gp = prog(t, at('slant', '更大') + 0.2, at('slant', '更大') + 0.6);
  if (gp > 0) {
    ctx.save(); ctx.globalAlpha *= gp; ctx.setLineDash([14, 10]); ctx.strokeStyle = C.pink; ctx.lineWidth = 5;
    ctx.strokeRect(GS.cx - BW / 2, GY - 2, BW, 62); ctx.restore();
  }
  // per-square comparison card: 4 beans vs 2 beans
  const cp = pop(t, at('perM2', '每平方米') - 0.1, 0.55);
  around(ctx, W / 2, 590, cp, cp, () => {
    card(ctx, 140, 470, 800, 240, { fill: 'rgba(8,10,36,0.92)', edge: C.gold, ew: 6, drop: 10 });
    [[330, '接近垂直', 4, '#ffb347'], [750, '更倾斜', 2, '#ffe08a']].forEach(([x, s, n, col]) => {
      txt(ctx, s, x, 520, { size: 40, color: '#fff' });
      ctx.fillStyle = col; ctx.strokeStyle = INK; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.roundRect(x - 120, 620, 240, 54, 12); ctx.fill(); ctx.stroke();
      for (let i = 0; i < n; i++) bean(ctx, t, x + (i - (n - 1) / 2) * 52, 592, 22, { mood: n > 2 ? 'starry' : 'happy' });
    });
    txt(ctx, '>', W / 2, 610, { size: 90, color: C.gold, stroke: INK, sw: 10, font: 'RoundB' });
  });
}

export const scenes = [
  { id: 'direct', from: S('beans') - 0.3, to: S('slant') - 0.3, draw: directScene },
  { id: 'slant', from: S('slant') - 0.3, to: S('kidButter') - 0.3, draw: slantScene },
];

export const events = [
  ...[...Array(8)].map((_, i) => ({ type: 'pop', t: at('beans', '能量豆') - 0.5 + i * 0.07, f: 500 + i * 70, amp: 0.7 })),
  { type: 'whoosh', t: S('direct') - 0.2, d: 1.0, from: 2400, to: 600, amp: 0.4 },
  { type: 'whoosh', t: T_V0, d: 0.7, from: 1600, to: 400, amp: 0.35 },
  ...landTimes(GV, T_V0, 8, V_V).filter((_, i) => i % 2 === 0).map((t, i) => ({ type: 'pop', t, f: 420 + i * 30, amp: 0.8 })),
  { type: 'stamp', t: at('directSq', '四颗') },
  { type: 'sparkle', t: at('directSq', '四颗') + 0.1 },
  { type: 'whoosh', t: T_S0, d: 1.0, from: 1600, to: 400, amp: 0.35 },
  ...landTimes(GS, T_S0, 8, V_S).map((t, i) => ({ type: 'pop', t, f: 380 + i * 25, amp: 0.6 })),
  { type: 'stamp', t: at('slantSq', '两颗') },
  { type: 'note', t: at('slantSq', '两颗') + 0.15, n: 64 },
  { type: 'ding', t: at('perM2', '每平方米'), n: 79 },
];
