// Scenes 1–2: the sticker-slapping hook, then "a nebula is a cloud of gas and dust".
import { W, C, TAU, rnd, S, E, at, prog, lerp, easeOut, easeIO, pop, fadeIn, txt, around, burst, shakeOf, talkLevel } from './lib.mjs';
import { nebulaCloud, ringNebula, sticker, gasDot, dustGrain, tag, glow } from './cast.mjs';

export function title(ctx, t, t0, main, sub, o = {}) {
  const { y = 330, color = C.white, subColor = C.gold } = o;
  const p = pop(t, t0, 0.5);
  around(ctx, W / 2, y, p, fadeIn(t, t0, 0.25), () => {
    txt(ctx, main, W / 2, y, { size: 84, color, stroke: '#0a0828', sw: 14 });
    if (sub) txt(ctx, sub, W / 2, y + 86, { size: 42, color: subColor });
  });
}

// ---------- scene 1: are all pretty clouds star cradles? ----------
const ORI = [360, 770, 330], RING = [740, 1190, 190];

function hookScene(ctx, t) {
  const t1 = at('stick', '啪'), t2 = at('stick', '啪', 1), tAll = at('stick', '统统');
  const tNo = at('ringNo', '等等'), tOff = at('ringNo', '我可不是');
  title(ctx, t, 0.3, '星云，都是摇篮？', '漂亮的“云”，也有不同身世');
  const [ox, oy, orr] = ORI, [rx, ry, rr] = RING;
  nebulaCloud(ctx, t, ox + Math.sin(t * 0.6) * 10, oy, orr * easeOut(prog(t, 0.2, 1.2)), { a: fadeIn(t, 0.2, 0.8) });
  const [sx, sy] = shakeOf(t, tNo, 18, 0.5);
  const angry = t > tNo - 0.1 && t < E('ringNo') + 0.4;
  ringNebula(ctx, t, rx + sx, ry + sy, rr * easeOut(prog(t, 0.7, 1.7)), {
    a: fadeIn(t, 0.7, 0.8), starR: 52, talk: talkLevel(t, ['ringNo']), mood: angry ? 'grumpy' : 'happy',
  });
  // question marks bob between the two clouds
  const q = pop(t, 1.3, 0.5) * (1 - prog(t, t1 - 0.3, t1));
  around(ctx, 720, 700, q, q, () => txt(ctx, '？', 720, 700 + Math.sin(t * 3) * 14, { size: 150, color: C.gold, stroke: '#0a0828', sw: 12 }), 0.15);
  // sticker 1 slaps onto the Orion-like cloud
  const s1 = easeOut(prog(t, t1 - 0.25, t1));
  if (s1 > 0) sticker(ctx, lerp(-200, ox + 10, s1), lerp(500, oy + 170, s1), lerp(1.6, 0.95, s1), -0.12);
  burst(ctx, t, t1, ox + 10, oy + 170, { n: 8, r: 160 });
  // sticker 2 slaps onto the ring, then gets flicked away
  const s2 = easeOut(prog(t, t2 - 0.25, t2));
  const off = prog(t, tOff, tOff + 0.9);
  if (s2 > 0 && off < 1) {
    const fx = lerp(lerp(1300, rx, s2), 1400, off * off), fy = lerp(ry + 200, ry + 200, s2) - Math.sin(off * Math.PI) * 380 + off * 300;
    sticker(ctx, fx + sx, fy + sy, lerp(1.6, 0.85, s2), 0.1 + off * 5);
  }
  burst(ctx, t, t2, rx, ry + 200, { n: 8, r: 160 });
  // "统统" — the rest of the sky gets stickered too
  for (let i = 0; i < 3; i++) {
    const ti = tAll + i * 0.18, k = pop(t, ti, 0.3) * (1 - prog(t, tOff, tOff + 0.4));
    const [x, y] = [[860, 560], [200, 1180], [930, 860]][i];
    around(ctx, x, y, k * 0.5, k, () => sticker(ctx, x, y, 1, (i - 1) * 0.2));
  }
  // the ring's protest
  const np = pop(t, tNo, 0.35) * (1 - prog(t, E('ringNo') + 0.3, E('ringNo') + 0.6));
  around(ctx, rx + 60, ry - 270, np, np, () => {
    txt(ctx, '等等！', rx + 60, ry - 270, { size: 104, color: C.no, stroke: '#0a0828', sw: 14 });
  }, -0.12);
  burst(ctx, t, tOff, rx, ry, { n: 12, r: 240, colors: [C.no, C.gold, C.ring] });
}

// ---------- scene 2: gas + dust ----------
const CLOUD = [540, 700, 330], LENS = [540, 1160, 200], SPOT = [610, 790, 46];

function whatScene(ctx, t) {
  const tGas = at('what1', '气体'), tDust = at('what1', '尘埃'), tMeta = at('what2', '恒星摇篮');
  const tSome = at('what2', '一些区域'), t0 = S('what1') - 0.2;
  title(ctx, t, t0, '先认清：什么是星云', '气体 + 尘埃，组成云状区域');
  const [cx, cy, cr] = CLOUD;
  nebulaCloud(ctx, t, cx, cy, cr, { a: 1, dust: fadeIn(t, tDust - 0.2, 0.6) });
  // magnifier: a spot on the cloud blown up into a lens of particles
  const lensIn = easeOut(prog(t, tGas - 0.5, tGas)), lensOut = 1 - prog(t, tMeta - 0.4, tMeta);
  const la = lensIn * lensOut;
  if (la > 0) {
    const [lx, ly, lr] = LENS, [px, py, pr] = SPOT;
    ctx.save();
    ctx.globalAlpha *= la;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.moveTo(px - pr, py); ctx.lineTo(lx - lr, ly); ctx.moveTo(px + pr, py); ctx.lineTo(lx + lr, ly); ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 5; ctx.strokeStyle = C.white;
    ctx.beginPath(); ctx.arc(px, py, pr, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(10,8,40,0.92)';
    ctx.beginPath(); ctx.arc(lx, ly, lr * lensIn, 0, TAU); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.arc(lx, ly, lr * lensIn - 6, 0, TAU); ctx.clip();
    for (let i = 0; i < 26; i++) {
      const a = rnd(i) * TAU + t * (0.2 + rnd(i + 5) * 0.4), d = Math.sqrt(rnd(i + 30)) * lr * 0.85;
      gasDot(ctx, lx + Math.cos(a) * d, ly + Math.sin(a) * d * 0.9, 9, fadeIn(t, tGas + i * 0.02, 0.3));
    }
    for (let i = 0; i < 12; i++) {
      const a = rnd(i + 70) * TAU - t * 0.25, d = Math.sqrt(rnd(i + 90)) * lr * 0.8;
      const k = pop(t, tDust + i * 0.04, 0.35);
      if (k > 0) dustGrain(ctx, lx + Math.cos(a) * d, ly + Math.sin(a) * d, 13 * k, t + i, 1);
    }
    ctx.restore();
    ctx.lineWidth = 12; ctx.strokeStyle = '#cfd6ff';
    ctx.beginPath(); ctx.arc(lx, ly, lr * lensIn, 0, TAU); ctx.stroke();
    ctx.restore();
    const gp = pop(t, tGas, 0.4) * lensOut, dp = pop(t, tDust, 0.4) * lensOut;
    around(ctx, 180, 1060, gp, gp, () => { gasDot(ctx, 180, 1000, 14); tag(ctx, 180, 1090, '气体', null, { color: C.gas, size: 48 }); });
    around(ctx, 900, 1060, dp, dp, () => { dustGrain(ctx, 900, 1000, 18, 0.4); tag(ctx, 900, 1090, '尘埃', null, { color: C.dust, size: 48 }); });
  }
  // the "cradle" sticker only fits some regions of the cloud
  const sIn = pop(t, tMeta, 0.45), shrink = easeIO(prog(t, tSome - 0.3, tSome + 0.4));
  if (sIn > 0) {
    const zx = cx - 110, zy = cy - 50;
    const ring = fadeIn(t, tSome - 0.2, 0.4);
    if (ring > 0) {
      glow(ctx, zx, zy, 0, 120, `rgba(255,220,140,${0.35 * ring})`);
      ctx.save();
      ctx.globalAlpha *= ring;
      ctx.strokeStyle = C.gold; ctx.lineWidth = 6; ctx.setLineDash([16, 10]); ctx.lineDashOffset = -t * 40;
      ctx.beginPath(); ctx.arc(zx, zy, 100, 0, TAU); ctx.stroke();
      ctx.restore();
    }
    const x = lerp(W / 2, zx, shrink), y = lerp(1140, zy + 150, shrink);
    around(ctx, x, y, sIn * lerp(1.3, 0.7, shrink), 1, () => sticker(ctx, x, y, 1, lerp(0, -0.08, shrink)));
    const np = pop(t, tSome + 0.3, 0.4);
    around(ctx, 540, 1150, np, np, () => {
      txt(ctx, '“摇篮”只贴在这类区域', 540, 1120, { size: 58, color: C.gold, stroke: '#0a0828', sw: 12 });
      txt(ctx, '其他地方：并没有在形成恒星', 540, 1200, { size: 40, color: 'rgba(255,255,255,0.8)' });
    });
  }
}

export const scenesA = [
  { id: 'hook', from: 0, to: S('what1') - 0.25, draw: hookScene },
  { id: 'what', from: S('what1') - 0.25, to: S('orion1') - 0.25, draw: whatScene },
];

export const eventsA = [
  { type: 'sparkle', t: 0.4 },
  { type: 'boing', t: 1.3 },
  { type: 'stamp', t: at('stick', '啪') },
  { type: 'stamp', t: at('stick', '啪', 1) },
  ...[0, 1, 2].map((i) => ({ type: 'pop', t: at('stick', '统统') + i * 0.18, f: 600 + i * 150 })),
  { type: 'alarm', t: at('ringNo', '等等') },
  { type: 'whoosh', t: at('ringNo', '我可不是'), d: 0.7, from: 600, to: 3000 },
  { type: 'ding', t: at('what1', '气体'), n: 84 },
  ...[0, 1, 2, 3].map((i) => ({ type: 'pop', t: at('what1', '尘埃') + i * 0.1, f: 500 + i * 80, amp: 0.6 })),
  { type: 'stamp', t: at('what2', '恒星摇篮') },
  { type: 'sparkle', t: at('what2', '一些区域') },
];
