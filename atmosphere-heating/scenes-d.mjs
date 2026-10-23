// Scenes 7–8: recap of the three routes, then back to the mountain — farther from the "stove", usually colder.
import {
  C, S, E, at, prog, lerp, clamp, easeIO, easeOut, pop, fadeIn,
  txt, card, around, arrow, burst, confetti,
} from './lib.mjs';
import { sun, hiker, glow, groundBody } from './chars.mjs';
import { mountain, heatToken, routeIcon, disclaimer } from './props.mjs';
import { routeCard } from './scenes-b.mjs';

const GY = 1110;

// ---------- scene 7: recap ----------
function recapScene(ctx, t) {
  const keys = [at('recap', '辐射'), at('recap', '对流'), at('recap', '相变')];
  const tUp = at('recap', '从下往上'), tWarm = at('recap', '烘暖');
  // a big warm arrow rising from the ground behind the cards
  const ap = easeOut(prog(t, tUp - 0.2, tUp + 0.8));
  if (ap > 0) {
    ctx.save();
    const g = ctx.createLinearGradient(0, GY, 0, 560);
    g.addColorStop(0, 'rgba(255,110,60,0.55)'); g.addColorStop(1, 'rgba(255,200,80,0.05)');
    ctx.fillStyle = g;
    const top = lerp(GY, 560, ap);
    ctx.beginPath();
    ctx.moveTo(260, GY); ctx.lineTo(260, top + 120); ctx.lineTo(140, top + 120); ctx.lineTo(470, top);
    ctx.lineTo(800, top + 120); ctx.lineTo(680, top + 120); ctx.lineTo(680, GY); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  groundBody(ctx, t, 60, 940, GY, 150, { heat: 1, face: [500, GY + 80], faceR: 80, shimmer: 0.4 });
  keys.forEach((k, i) => {
    const x = 210 + i * 290, p = pop(t, k - 0.2, 0.45);
    const lift = Math.sin(Math.PI * prog(t, k - 0.1, k + 0.4)) * 20;
    around(ctx, x, 780, p, p, () => routeCard(ctx, t, i, x, 780 - lift, { done: prog(t, k + 0.1, k + 0.5) }));
  });
  const wp = pop(t, tWarm - 0.1, 0.5);
  around(ctx, 470, 1010, wp, wp, () => txt(ctx, '从下往上，把大气烘暖', 470, 1010, { size: 56, color: C.gold, stroke: C.space, sw: 12 }));
  burst(ctx, t, tWarm, 470, 1010, { r: 300, n: 14, colors: [C.gold, C.warm, C.hot, C.vapor] });
  disclaimer(ctx, 1290, 1);
}

// ---------- scene 8: back on the summit ----------
const PEAK = [520, 800];
function finaleScene(ctx, t) {
  const tTropo = at('cold', '对流层'), tFar = at('cold', '越远'), tCold = at('cold', '越冷'), tCta = S('cta');
  sun(ctx, t, 850, 600, 58, { mood: 'happy' });
  // warm glow hugging the mountain foot = the stove
  glow(ctx, 500, 1260, 40, 520, `rgba(255,120,50,${0.45 + 0.1 * Math.sin(t * 3)})`);
  mountain(ctx, 150, 960, 1260, PEAK[0], PEAK[1]);
  groundBody(ctx, t, 60, 960, 1225, 60, { heat: 1, shimmer: 0.5 });
  // heat parcels rise from the foot and fade on the way up
  for (let i = 0; i < 6; i++) {
    const ph = (t * 0.35 + i / 6) % 1;
    const x = 300 + ((i * 113) % 420) + Math.sin(t * 2 + i) * 20, y = lerp(1200, 820, ph);
    heatToken(ctx, t, x, y, lerp(1, 0.4, ph), (1 - ph) * fadeIn(t, S('cold'), 0.5));
  }
  // vertical temperature bar: warm at the bottom, cold at the top
  const bp = easeOut(prog(t, tFar - 0.3, tCold + 0.2));
  if (bp > 0) {
    ctx.save();
    const g = ctx.createLinearGradient(0, 1240, 0, 640);
    g.addColorStop(0, C.hot); g.addColorStop(0.5, C.gold); g.addColorStop(1, C.cool);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.roundRect(80, lerp(1240, 640, bp), 48, (1240 - 640) * bp, 24); ctx.fill();
    ctx.strokeStyle = C.white; ctx.lineWidth = 5; ctx.stroke();
    ctx.restore();
    around(ctx, 104, 1180, 1, fadeIn(t, tFar, 0.3), () => txt(ctx, '暖', 170, 1180, { size: 46, color: C.warm, stroke: C.space, sw: 8 }));
    around(ctx, 104, 680, 1, fadeIn(t, tCold, 0.3), () => txt(ctx, '冷', 170, 680, { size: 46, color: C.cool, stroke: C.space, sw: 8 }));
  }
  const tp = pop(t, tTropo - 0.1, 0.4) * (1 - prog(t, tCta - 0.2, tCta + 0.1));
  around(ctx, 500, 565, tp, tp, () => {
    card(ctx, 160, 515, 680, 100, { fill: 'rgba(10,22,60,0.9)', edge: C.gold, ew: 5, r: 50, drop: 0 });
    txt(ctx, '对流层：离暖炉越远，通常越冷', 500, 566, { size: 42, color: C.gold });
  });
  const shiver = clamp(prog(t, tCold - 0.2, tCold + 0.3));
  hiker(ctx, t, PEAK[0], PEAK[1] + 6, 0.5, { shiver: t > tCta + 1 ? 0.15 : shiver, point: t > tCta + 1 ? 1 : 0, mood: 'happy' });
  // the kid "gets it": the three routes orbit around the summit
  const op = pop(t, tCta + 0.9, 0.5);
  [0, 1, 2].forEach((i) => {
    const a = t * 1.4 + (i * Math.PI * 2) / 3;
    const x = PEAK[0] + Math.cos(a) * 190, y = PEAK[1] - 120 + Math.sin(a) * 70;
    around(ctx, x, y, op, op, () => {
      ctx.fillStyle = 'rgba(10,22,60,0.85)';
      ctx.beginPath(); ctx.arc(x, y, 58, 0, Math.PI * 2); ctx.fill();
      routeIcon(ctx, t, i, x, y, 0.62);
    });
  });
  const ep = pop(t, at('cta', '三条') - 0.1, 0.5);
  around(ctx, 470, 565, ep, ep, () => {
    card(ctx, 140, 515, 660, 100, { fill: C.gold, ew: 0, r: 50, drop: 8 });
    txt(ctx, '记住这三条送热路线!', 470, 566, { size: 50, color: C.space });
  });
  confetti(ctx, t, E('cta') - 0.3, 120);
}

export const scenes = [
  { from: S('recap') - 0.3, to: S('cold') - 0.3, draw: recapScene },
  { from: S('cold') - 0.3, to: 999, draw: finaleScene },
];

export const events = [
  { type: 'whoosh', t: S('recap') - 0.3, d: 0.4 },
  { type: 'note', t: at('recap', '辐射') - 0.2, n: 72 },
  { type: 'note', t: at('recap', '对流') - 0.2, n: 76 },
  { type: 'note', t: at('recap', '相变') - 0.2, n: 79 },
  { type: 'whoosh', t: at('recap', '从下往上') - 0.2, d: 0.9, from: 300, to: 2400 },
  { type: 'tada', t: at('recap', '烘暖') - 0.1, amp: 0.7 },
  { type: 'whoosh', t: S('cold') - 0.3, d: 0.4 },
  { type: 'pop', t: at('cold', '对流层') - 0.1, f: 800 },
  { type: 'wind', t: at('cold', '越冷') - 0.2, d: 2.0 },
  { type: 'sparkle', t: S('cta') + 0.9 },
  { type: 'ding', t: at('cta', '三条'), n: 88 },
  { type: 'confetti', t: E('cta') - 0.3 },
];
