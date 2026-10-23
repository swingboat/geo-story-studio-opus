// Scenes 7–8: the three examples side by side, then the closing quiz.
import { W, C, S, E, SEG, DURATION, at, prog, lerp, easeIO, easeOut, pop, fadeIn, txt, card, around, burst, confetti, talkLevel } from './lib.mjs';
import { sun, earth, moon, tick, cross } from './bodies.mjs';
import { STAMP, stamp, bulb, orbitIcon, sunglasses, bubble } from './props.mjs';

// ---------- scene 7: summary ----------
const ROWS = [
  ['太阳', '恒星', '自己发光发热', STAMP.star, (ctx, t, x, y) => sun(ctx, t, x, y, 72)],
  ['地球', '行星', '绕太阳转 · 可见光靠反射', STAMP.planet, (ctx, t, x, y) => earth(ctx, t, x, y, 70, { light: Math.PI })],
  ['月球', '天然卫星', '绕地球转 · 月光靠反射', STAMP.moon, (ctx, t, x, y) => moon(ctx, t, x, y, 62, { light: Math.PI })],
];

function summaryScene(ctx, t) {
  const tp = pop(t, S('sum') - 0.2, 0.5);
  around(ctx, 540, 330, tp, tp, () => txt(ctx, '三个例子，一起记', 540, 330, { size: 84, color: C.gold, stroke: C.space, sw: 12 }));
  ROWS.forEach(([name, cat, note, col, draw], i) => {
    const y = 560 + i * 245, t0 = at('sum', name), tc = at('sum', cat);
    const p = pop(t, t0 - 0.2, 0.45);
    const hot = t >= t0 - 0.1 && (i === 2 || t < at('sum', ROWS[i + 1][0]) - 0.1) && t < E('sum') + 0.3;
    around(ctx, 540, y, p * (hot ? 1.04 : 1), p, () => {
      card(ctx, 70, y - 105, 940, 210, { fill: hot ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)', edge: hot ? col : 'rgba(255,255,255,0.25)', ew: hot ? 6 : 3, drop: 0, r: 40 });
      draw(ctx, t, 190, y);
      txt(ctx, name, 300, y - 38, { size: 60, align: 'left', color: C.white });
      txt(ctx, note, 300, y + 44, { size: 36, align: 'left', color: '#c9d6f0' });
      stamp(ctx, 830, y - 30, 0.62, cat, col, prog(t, tc - 0.05, tc + 0.25), -0.12);
    });
  });
  // the two questions to ask
  [['光从哪来', '光'], ['谁绕谁转', '绕']].forEach(([label, w], i) => {
    const p = pop(t, at('sumRule', w) - 0.15, 0.45);
    const x = 290 + i * 500, y = 1310;
    around(ctx, x, y, p, p, () => {
      card(ctx, x - 220, y - 52, 440, 104, { fill: C.gold, ew: 0, drop: 8, r: 52 });
      if (i === 0) bulb(ctx, x - 150, y + 2, 0.7, 1);
      else orbitIcon(ctx, t, x - 150, y, 0.8);
      txt(ctx, `${i ? '再看' : '先看'}${label}`, x + 40, y + 2, { size: 46, color: C.ink });
    });
  });
}

// ---------- scene 8: quiz ----------
const OPTS = [['A', '恒星'], ['B', '行星'], ['C', '天然卫星']];

function quizScene(ctx, t) {
  const t0 = S('quiz'), tAns = at('answer', 'C'), tEnd = S('moonEnd'), tCta = S('cta');
  const tp = pop(t, t0 - 0.2, 0.5) * (1 - prog(t, tEnd - 0.4, tEnd - 0.1));
  around(ctx, 540, 300, tp, tp, () => {
    card(ctx, 330, 250, 420, 100, { fill: C.red, ew: 0, drop: 8, r: 50 });
    txt(ctx, '考考你', 540, 302, { size: 64, color: '#fff' });
  }, Math.sin(t * 3) * 0.04);
  // the moon, smug again once the answer is out
  const mp = pop(t, t0, 0.5);
  const my = 610 + Math.sin(t * 2) * 10, cool = easeOut(prog(t, tEnd - 0.2, tEnd + 0.3));
  around(ctx, 540, my, mp, mp, () => {
    moon(ctx, t, 540, my, 160, { light: Math.PI * 1.2, talk: talkLevel(t, ['moonEnd']), look: Math.sin(t * 1.2) * 0.5 });
    if (cool > 0) around(ctx, 540, my, 1, cool, () => sunglasses(ctx, 540, my - lerp(200, 0, cool), 128));
  });
  const qp = pop(t, at('quiz', '哪一类') - 0.1, 0.4) * (1 - prog(t, tAns - 0.2, tAns));
  around(ctx, 740, 470, qp, qp, () => txt(ctx, '?', 740, 470 + Math.sin(t * 7) * 8, { size: 140, color: C.gold, stroke: C.space, sw: 12 }));
  // countdown in the pause before the answer
  const cdStart = E('quiz') + 0.2, step = Math.max(0.5, (tAns - 0.3 - cdStart) / 3);
  for (let k = 0; k < 3; k++) {
    const a = cdStart + k * step, p = prog(t, a, a + step);
    if (p <= 0 || p >= 1) continue;
    around(ctx, 860, 640, lerp(1.4, 0.9, easeOut(p)), 1 - p * p, () =>
      txt(ctx, String(3 - k), 860, 640, { size: 180, color: C.white, stroke: C.red, sw: 14 }));
  }
  OPTS.forEach(([k, label], i) => {
    const y = 930 + i * 140, p = pop(t, at('quiz', '属于') + i * 0.15, 0.4);
    const right = i === 2, rev = easeOut(prog(t, tAns - 0.05, tAns + 0.3));
    const fill = right ? (rev > 0.5 ? C.gold : 'rgba(255,255,255,0.12)') : `rgba(255,255,255,${0.12 - 0.06 * rev})`;
    around(ctx, 540, y, p * (right ? 1 + 0.08 * rev * (1 + Math.sin(t * 6) * 0.3) : 1), p * (right ? 1 : 1 - 0.5 * rev), () => {
      card(ctx, 170, y - 55, 740, 110, { fill, edge: right && rev > 0.5 ? '#fff' : 'rgba(255,255,255,0.3)', ew: 4, drop: 0, r: 55 });
      txt(ctx, `${k}. ${label}`, 260, y + 2, { size: 58, align: 'left', color: right && rev > 0.5 ? C.ink : C.white });
      if (rev > 0) (right ? tick : cross)(ctx, 840, y, 0.8 * rev);
    });
  });
  burst(ctx, t, tAns, 540, 1210, { r: 380, n: 16, size: 30 });
  const bp = pop(t, tEnd - 0.1, 0.4) * (1 - prog(t, tCta - 0.2, tCta));
  around(ctx, 540, 380, bp, bp, () => bubble(ctx, 540, 380, '我是靠反光出道的！', { size: 50, tx: 560, ty: 470 }));
  const cp = pop(t, tCta - 0.1, 0.5);
  around(ctx, 540, 380, cp, cp, () => {
    card(ctx, 190, 330, 700, 100, { fill: '#fff', ew: 0, drop: 8, r: 50 });
    txt(ctx, '答对的，评论区扣个', 500, 382, { size: 52, color: C.ink });
    txt(ctx, 'C', 800, 380, { size: 78, color: C.red, font: 'RoundB' });
  }, Math.sin(t * 5) * 0.03);
  confetti(ctx, t, tAns + 0.1, 140);
}

export const scenesD = [
  { id: 'summary', from: S('sum') - 0.35, to: S('quiz') - 0.35, draw: summaryScene },
  { id: 'quiz', from: S('quiz') - 0.35, to: DURATION + 1, draw: quizScene },
];

const cdStart = E('quiz') + 0.2, cdStep = Math.max(0.5, (at('answer', 'C') - 0.3 - cdStart) / 3);
export const eventsD = [
  { type: 'whoosh', t: S('sum') - 0.4, d: 0.5 },
  ...ROWS.map(([name], i) => ({ type: 'pop', t: at('sum', name) - 0.15, f: 600 + i * 150 })),
  ...ROWS.map(([, cat]) => ({ type: 'stamp', t: at('sum', cat), shake: 6 })),
  { type: 'note', t: at('sumRule', '光') - 0.1, n: 79 },
  { type: 'note', t: at('sumRule', '绕') - 0.1, n: 84 },
  { type: 'whoosh', t: S('quiz') - 0.4, d: 0.5 },
  ...OPTS.map((_, i) => ({ type: 'pop', t: at('quiz', '属于') + i * 0.15, f: 700 + i * 120 })),
  ...[0, 1, 2].map((k) => ({ type: 'tick', t: cdStart + k * cdStep, n: 76 + k * 2 })),
  { type: 'tada', t: at('answer', 'C') - 0.05 },
  { type: 'confetti', t: at('answer', 'C') + 0.1 },
  { type: 'sparkle', t: S('moonEnd') },
  { type: 'boing', t: S('cta'), amp: 0.6 },
];
void W; void SEG; void easeIO; void fadeIn;
