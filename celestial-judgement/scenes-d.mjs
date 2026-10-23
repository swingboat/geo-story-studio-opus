// Scenes 9–11: the quiz (Moon vs meteor phenomenon), the four-word recap, and the brand outro.
import { W, C, SANS, NUM, S, E, at, prog, lerp, easeOut, pop, fadeIn, txt, card, around, burst, stamp, confetti, LOGO, LOGO_BOX } from './lib.mjs';
import { moon, sun, nebula, glow, rock } from './bodies.mjs';
import { streak, satellite, tick } from './props.mjs';

// ---------- scene 9: quiz ----------
function optionCard(ctx, t, x, y, letter, label, t0, state, drawIcon) {
  const p = pop(t, t0, 0.45);
  const win = state === 'win', lose = state === 'lose';
  around(ctx, x, y, p * (win ? 1.06 + 0.02 * Math.sin(t * 6) : lose ? 0.92 : 1), p * (lose ? 0.55 : 1), () => {
    card(ctx, x - 215, y - 270, 430, 540, { fill: win ? '#e9fff4' : C.cream, edge: win ? C.ok : C.ink, ew: win ? 12 : 6, r: 40 });
    ctx.fillStyle = win ? C.ok : C.gold;
    ctx.beginPath(); ctx.arc(x - 215, y - 270, 54, 0, Math.PI * 2); ctx.fill();
    txt(ctx, letter, x - 215, y - 266, { size: 64, font: NUM, color: C.ink });
    ctx.save();
    ctx.beginPath(); ctx.roundRect(x - 185, y - 240, 370, 330, 28); ctx.clip();
    ctx.fillStyle = '#0d1440'; ctx.fillRect(x - 185, y - 240, 370, 330);
    drawIcon(x, y - 75);
    ctx.restore();
    txt(ctx, label, x, y + 165, { size: 62, color: C.ink });
  });
}

function quiz(ctx, t) {
  const tp = pop(t, S('quiz') - 0.2, 0.45);
  around(ctx, W / 2, 420, tp, tp, () => {
    card(ctx, W / 2 - 200, 360, 400, 116, { fill: C.gold, edge: C.ink, ew: 6, r: 58 });
    txt(ctx, '小测验', W / 2, 420, { size: 72, color: C.ink });
  }, Math.sin(t * 4) * 0.04);
  const ans = at('answer', '月球'), done = t >= ans;
  optionCard(ctx, t, 290, 860, 'A', '月球', at('quiz', '月球'), done ? 'win' : '', (x, y) => moon(ctx, t, x, y, 110, { face: done, mood: 'proud' }));
  optionCard(ctx, t, 790, 860, 'B', '流星现象', at('quiz', '流星现象'), done ? 'lose' : '', (x, y) => streak(ctx, x + 90, y + 70, 1, 0.8, 300, 40));
  // think timer: a ring that drains between the question and the answer
  const q1 = E('quiz'), rp = prog(t, q1, ans);
  if (t > q1 - 0.2 && !done) {
    const a = fadeIn(t, q1 - 0.2, 0.2);
    ctx.save(); ctx.globalAlpha *= a;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.arc(W / 2, 1270, 70, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = C.gold; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(W / 2, 1270, 70, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - rp)); ctx.stroke();
    txt(ctx, '?', W / 2, 1274, { size: 80, font: NUM, color: C.white });
    ctx.restore();
  }
  if (done) {
    const np = pop(t, ans + 0.25, 0.45);
    around(ctx, 290, 1230, np, np, () => {
      card(ctx, 110, 1190, 360, 84, { fill: C.ok, edge: C.ink, ew: 4, drop: 0, r: 42 });
      txt(ctx, '天然卫星', 270, 1234, { size: 48, color: C.ink });
      tick(ctx, 425, 1232, 0.6, '#178a5a');
    });
    around(ctx, 790, 1230, np, np * 0.8, () => txt(ctx, '发光现象', 790, 1232, { size: 48, color: C.amber, stroke: C.ink, sw: 8 }));
  }
  burst(ctx, t, ans, 290, 790, { r: 360, n: 16 });
  confetti(ctx, t, ans);
}

// ---------- scene 10: recap — 对象 · 现象 · 局部 · 运行状态 ----------
const KEYS = [
  { w: '对象', ex: '月球 · 星云', color: C.mint, x: 290, y: 720, icon: (ctx, t, x, y) => { moon(ctx, t, x - 45, y, 48, { face: false }); nebula(ctx, t, x + 60, y, 0.22, { face: false }); } },
  { w: '现象', ex: '流星亮迹', color: C.amber, x: 790, y: 720, icon: (ctx, t, x, y) => streak(ctx, x + 70, y + 35, 1, 0.5, 220, 30) },
  { w: '局部', ex: '太阳黑子', color: C.hot, x: 290, y: 1110, icon: (ctx, t, x, y) => sun(ctx, t, x, y, 58, { spots: 1, rays: false }) },
  { w: '运行状态', ex: '卫星入轨', color: C.sky, x: 790, y: 1110, icon: (ctx, t, x, y) => satellite(ctx, t, x, y, 0.32, { open: 1, rot: Math.sin(t) * 0.2 }) },
];

function recap(ctx, t) {
  const hp = pop(t, S('recap') - 0.1, 0.45);
  around(ctx, W / 2, 420, hp, hp, () => {
    txt(ctx, '天体判断', W / 2, 400, { size: 90, color: C.white, stroke: C.ink, sw: 14 });
    txt(ctx, '先分清这 4 件事', W / 2, 500, { size: 52, color: C.gold, stroke: C.ink, sw: 10 });
  });
  for (const k of KEYS) {
    const t0 = at('recap', k.w), p = pop(t, t0 - 0.05, 0.45);
    around(ctx, k.x, k.y, p, p, () => {
      card(ctx, k.x - 225, k.y - 170, 450, 340, { fill: 'rgba(10,14,50,0.9)', edge: k.color, ew: 7, drop: 0, r: 36 });
      ctx.save();
      ctx.beginPath(); ctx.roundRect(k.x - 200, k.y - 150, 400, 140, 24); ctx.clip();
      k.icon(ctx, t, k.x, k.y - 80);
      ctx.restore();
      txt(ctx, k.w, k.x, k.y + 45, { size: k.w.length > 2 ? 68 : 80, color: k.color });
      txt(ctx, k.ex, k.x, k.y + 122, { size: 38, font: SANS, color: 'rgba(255,255,255,0.85)' });
    });
  }
}

// ---------- scene 11: brand card (the corner logo fades out while this is on screen) ----------
function outro(ctx, t) {
  const t0 = S('outro') - 0.3;
  const p = easeOut(prog(t, t0, t0 + 0.6));
  const { sx, sy, sw, sh } = LOGO_BOX;
  const w = 820, h = (w * sh) / sw, x = (W - w) / 2, y = 700;
  glow(ctx, W / 2, y + h / 2, 0, 560, `rgba(120,90,255,${0.3 * p})`);
  ctx.save();
  ctx.globalAlpha *= p;
  ctx.translate(W / 2, y + h / 2); ctx.scale(lerp(0.8, 1, p), lerp(0.8, 1, p)); ctx.translate(-W / 2, -(y + h / 2));
  ctx.drawImage(LOGO, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
  const tp = pop(t, at('outro', '下期见'), 0.45);
  around(ctx, W / 2, 1250, tp, tp, () => {
    card(ctx, W / 2 - 300, 1190, 600, 120, { fill: C.gold, edge: C.ink, ew: 6, r: 60 });
    txt(ctx, '关注 · 下期见！', W / 2, 1250, { size: 64, color: C.ink });
  });
  // the five applicants orbit the logo, celebrating
  const icons = [
    (x, y) => moon(ctx, t, x, y, 40, { face: false }), (x, y) => nebula(ctx, t, x, y, 0.2, { face: false }),
    (x, y) => streak(ctx, x + 30, y + 15, 1, 0.5, 110, 16), (x, y) => sun(ctx, t, x, y, 38, { spots: 1, rays: false }),
    (x, y) => satellite(ctx, t, x, y, 0.22, { open: 1 }),
  ];
  icons.forEach((draw, i) => {
    const a = (i / 5) * Math.PI * 2 + (t - t0) * 0.6;
    const ip = easeOut(prog(t, t0 + 0.2 + i * 0.08, t0 + 0.7 + i * 0.08));
    around(ctx, W / 2 + Math.cos(a) * 480, 830 + Math.sin(a) * 330, ip, ip, () => draw(W / 2 + Math.cos(a) * 480, 830 + Math.sin(a) * 330));
  });
}

export const scenes = [
  { from: S('quiz') - 0.35, to: S('recap') - 0.3, draw: quiz },
  { from: S('recap') - 0.3, to: S('outro') - 0.3, draw: recap },
  { from: S('outro') - 0.3, to: 999, draw: outro },
];

export const events = [
  { t: S('quiz') - 0.2, type: 'ding', n: 88 },
  { t: at('quiz', '月球'), type: 'pop', f: 600 },
  { t: at('quiz', '流星现象'), type: 'pop', f: 900 },
  ...[0, 1, 2].map((i) => ({ t: E('quiz') + 0.15 + i * 0.4, type: 'tick', n: 84 })),
  { t: at('answer', '月球'), type: 'tada' },
  { t: at('answer', '月球') + 0.05, type: 'confetti' },
  ...['对象', '现象', '局部', '运行状态'].map((w, i) => ({ t: at('recap', w), type: 'note', n: 72 + i * 3 })),
  { t: S('outro') - 0.3, type: 'sparkle' },
  { t: at('outro', '下期见'), type: 'boing' },
];
