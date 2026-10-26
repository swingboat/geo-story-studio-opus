// Scenes E: two rulers side by side, why Earth's distance matters, the exam card, the summary and goodbye.
import { C, NUM, SANS, S, E, at, prog, lerp, clamp, easeOut, pop, fadeIn, txt, card, around, arrow, stamp, burst, confetti, talkLevel, rand } from './lib.mjs';
import { planet, sun, glow, PLANETS, SUN_D } from './bodies.mjs';

function title(ctx, t, t0, s, color = C.gold) {
  const p = pop(t, t0, 0.45);
  around(ctx, 540, 265, p, p, () => txt(ctx, s, 540, 265, { size: 72, color, stroke: C.ink, sw: 10 }));
}

function chip(ctx, x, y, s, color, size = 40) {
  const w = s.length * size + 44;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect(x, y - size * 0.85, w, size * 1.7, size * 0.85); ctx.fill();
  txt(ctx, s, x + w / 2, y + 2, { size, color: C.ink });
  return w;
}

// ---------- ruler: size ruler vs distance ruler ----------
function rulers(ctx, t) {
  title(ctx, t, S('ruler') - 0.1, '课本插图：二选一');
  // size card — one scale for discs, the Sun is only a rim at this scale
  const pa = pop(t, at('ruler', '二选一') - 0.2, 0.45);
  around(ctx, 540, 600, pa, pa, () => {
    card(ctx, 70, 400, 940, 400, { fill: '#0d1338', edge: C.gold, ew: 6, drop: 0, r: 36 });
    ctx.save();
    ctx.beginPath(); ctx.roundRect(70, 400, 940, 400, 36); ctx.clip();
    const K = 8, cy = 640;
    sun(ctx, t, 150 - SUN_D * K, cy, SUN_D * K, { rays: false });
    let x = 200;
    for (const p of PLANETS) {
      const r = p.d * K;
      x += r;
      planet(ctx, t, p.name, x, cy, Math.max(r, 2), { ringRot: -0.3, light: Math.PI });
      const up = p.name === '海王星';
      if (r > 20) txt(ctx, p.name, x, up ? cy - r - 30 : cy + r + (p.name === '土星' ? 50 : 34), { size: 30, font: SANS, color: C.white });
      x += r + (p.d > 3 ? 26 : 16);
    }
    ctx.restore();
    chip(ctx, 100, 450, '比大小 · 直径尺', C.gold);
    txt(ctx, '太阳', 110, 760, { size: 32, font: SANS, color: C.ink, align: 'left' });
  });
  // distance card — semi-major axes on one line
  const pb = pop(t, at('ruler', '距离') - 0.2, 0.45);
  around(ctx, 540, 1080, pb, pb, () => {
    card(ctx, 70, 880, 940, 400, { fill: '#0d1338', edge: C.sky, ew: 6, drop: 0, r: 36 });
    chip(ctx, 100, 930, '比远近 · 距离尺', C.sky);
    const x0 = 150, x1 = 940, y = 1130, au = (x1 - x0) / 30.07;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1 + 20, y); ctx.stroke();
    for (let a = 0; a <= 30; a += 5) {
      ctx.beginPath(); ctx.moveTo(x0 + a * au, y); ctx.lineTo(x0 + a * au, y + 14); ctx.stroke();
      txt(ctx, String(a), x0 + a * au, y + 40, { size: 26, font: NUM, color: 'rgba(255,255,255,0.7)' });
    }
    txt(ctx, 'AU', x1 + 40, y + 40, { size: 26, font: NUM, color: 'rgba(255,255,255,0.7)' });
    glow(ctx, x0, y, 0, 30, 'rgba(255,200,60,0.9)');
    PLANETS.forEach((p, i) => {
      const x = x0 + p.a * au;
      ctx.fillStyle = C[p.key];
      ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
      if (p.a > 4) txt(ctx, p.name, x, y - 40, { size: 30, font: SANS, color: C.white });
    });
    txt(ctx, '水金地火', x0 + 10, y - 82, { size: 30, font: SANS, color: C.mint, align: 'left' });
    arrow(ctx, x0 + 40, y - 60, x0 + 22, y - 18, { color: C.mint, w: 4, head: 16 });
  });
}

// ---------- life: not too near, not too far ----------
const CHAIN = [
  ['日地距离适中', () => at('life', '不远不近')],
  ['温度适宜', () => at('life', '温度')],
  ['液态水', () => at('life', '液态')],
  ['生命', () => at('life', '生命')],
];

function life(ctx, t) {
  title(ctx, t, S('life') - 0.1, '地球：不远不近', C.sky);
  // temperature band from hot (near the Sun) to cold (far)
  const ba = fadeIn(t, S('life') + 0.2, 0.4);
  ctx.save(); ctx.globalAlpha *= ba;
  const g = ctx.createLinearGradient(140, 0, 1000, 0);
  g.addColorStop(0, '#ff4d2e'); g.addColorStop(0.3, '#ffb347'); g.addColorStop(0.5, '#3ddc97'); g.addColorStop(0.72, '#4cc9f0'); g.addColorStop(1, '#3a4fd8');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.roundRect(140, 640, 860, 60, 30); ctx.fill();
  txt(ctx, '近：太热', 170, 750, { size: 36, font: SANS, color: '#ffb0a0', align: 'left' });
  txt(ctx, '远：太冷', 970, 750, { size: 36, font: SANS, color: '#a9c8ff', align: 'right' });
  ctx.restore();
  sun(ctx, t, 30, 670, 130, { rays: true });
  const ep = pop(t, at('life', '地球') - 0.1, 0.45);
  const bob = Math.sin(t * 3) * 8;
  around(ctx, 540, 520 + bob, ep, ep, () => {
    planet(ctx, t, '地球', 540, 520 + bob, 100, { face: true, mood: 'happy', light: Math.PI });
    // water droplets and a sprout appear as they are named
    const wa = fadeIn(t, at('life', '液态'), 0.3);
    for (let i = 0; i < 3; i++) {
      const a = -2.2 + i * 0.5, dx = Math.cos(a) * 140, dy = Math.sin(a) * 140 + ((t * 40 + i * 20) % 30);
      ctx.fillStyle = `rgba(95,190,255,${wa})`;
      ctx.beginPath(); ctx.ellipse(540 + dx, 520 + bob + dy, 12, 17, 0, 0, Math.PI * 2); ctx.fill();
    }
    const sp = easeOut(prog(t, at('life', '生命'), at('life', '生命') + 0.5));
    if (sp > 0) {
      ctx.strokeStyle = '#3ddc97'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(540, 420 + bob); ctx.lineTo(540, 420 + bob - 50 * sp); ctx.stroke();
      ctx.fillStyle = '#3ddc97';
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(540 + s * 24 * sp, 420 + bob - 50 * sp, 26 * sp, 12 * sp, s * -0.5, 0, Math.PI * 2); ctx.fill(); }
    }
  });
  // cause → effect chain
  CHAIN.forEach(([s, t0], i) => {
    const x = i % 2 ? 760 : 320, y = 900 + Math.floor(i / 2) * 200;
    const p = pop(t, t0() - 0.1, 0.45);
    around(ctx, x, y, p, p, () => {
      card(ctx, x - 180, y - 60, 360, 120, { fill: C.cream, edge: C.ink, ew: 5, drop: 10, r: 60 });
      txt(ctx, s, x, y + 2, { size: 46, color: C.ink });
    });
    if (i < 3 && t > CHAIN[i + 1][1]() - 0.3) {
      const q = easeOut(prog(t, CHAIN[i + 1][1]() - 0.3, CHAIN[i + 1][1]()));
      if (i === 1) arrow(ctx, 700, 975, 380, 1035, { color: C.gold, w: 8, head: 26, p: q });
      else arrow(ctx, x + 184, y, x + 258, y, { color: C.gold, w: 8, head: 24, p: q });
    }
  });
}

// ---------- exam: order from the Sun with the asteroid belt ----------
const ORDER = ['水星', '金星', '地球', '火星', '木星', '土星', '天王星', '海王星'];
const KEYW = ['水', '金地', '金地', '火', '木', '土', '天', '海'];
const OX = [95, 200, 305, 410, 670, 775, 880, 985];

function exam(ctx, t) {
  title(ctx, t, S('exam') - 0.1, '考点：距日顺序');
  card(ctx, 50, 560, 980, 520, { fill: 'rgba(10,12,44,0.92)', edge: C.gold, ew: 6, drop: 0, r: 40 });
  glow(ctx, 50, 760, 0, 90, 'rgba(255,200,60,0.8)');
  ORDER.forEach((n, i) => {
    const t0 = at('exam', KEYW[i]) + (i === 2 ? 0.12 : 0);
    const p = pop(t, t0 - 0.05, 0.4);
    around(ctx, OX[i], 760, p, p, () => {
      planet(ctx, t, n, OX[i], 760, 38, { ringRot: -0.3, light: Math.PI });
      txt(ctx, n[0], OX[i], 850, { size: 56, color: C.white });
    });
  });
  // the asteroid belt between Mars and Jupiter
  const ba = fadeIn(t, at('exam', '小行星') - 0.1, 0.3);
  if (ba > 0) {
    ctx.save(); ctx.globalAlpha *= ba;
    ctx.fillStyle = '#c9c1b6';
    for (let i = 0; i < 60; i++) {
      ctx.beginPath(); ctx.arc(490 + rand(i) * 100, 680 + rand(i + 40) * 160, 2 + 4 * rand(i + 80), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    const lp = pop(t, at('exam', '小行星') - 0.1, 0.45);
    around(ctx, 540, 960, lp, lp, () => {
      card(ctx, 360, 922, 360, 76, { fill: '#c9c1b6', edge: C.ink, ew: 4, drop: 0, r: 38 });
      txt(ctx, '小行星带', 540, 962, { size: 44, color: C.ink });
    });
    arrow(ctx, 540, 920, 540, 860, { color: '#c9c1b6', w: 5, head: 18, p: lp });
    const ha = fadeIn(t, at('exam', '火星') - 0.1, 0.3);
    ctx.save(); ctx.globalAlpha *= ha;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 6;
    for (const x of [410, 670]) { ctx.beginPath(); ctx.arc(x, 760, 52, 0, Math.PI * 2); ctx.stroke(); }
    txt(ctx, '火星和木星轨道之间', 540, 1040, { size: 36, font: SANS, color: C.gold });
    ctx.restore();
  }
  stamp(ctx, t, at('exam', '考试'), 880, 470, '必考', { color: C.no, size: 72, rot: 0.12 });
}

// ---------- summary and goodbye ----------
const LINES = [['行星很小', () => at('sum', '行星'), C.sky], ['距离很大', () => at('sum', '距离'), C.gold], ['太阳系很空旷', () => at('sum', '空旷'), C.mint]];

function finale(ctx, t) {
  title(ctx, t, S('sum'), '一句话');
  LINES.forEach(([s, t0, color], i) => {
    const p = pop(t, t0() - 0.1, 0.45);
    around(ctx, 540, 450 + i * 150, p, p, () => {
      card(ctx, 190, 390 + i * 150, 700, 120, { fill: 'rgba(10,12,44,0.92)', edge: color, ew: 6, drop: 0, r: 60 });
      txt(ctx, s, 540, 452 + i * 150, { size: 62, color });
    });
  });
  // Earth waves goodbye next to a squeezed textbook diagram
  const bp = pop(t, S('bye') - 0.2, 0.5);
  around(ctx, 300, 1130, bp, bp, () => {
    planet(ctx, t, '地球', 300, 1130 + Math.sin(t * 4) * 8, 130, { face: true, talk: talkLevel(t, ['bye']), light: Math.PI * 0.9 });
  });
  const bk = pop(t, at('bye', '太阳系') - 0.2, 0.45);
  const sq = easeOut(prog(t, at('bye', '压缩'), at('bye', '压缩') + 0.35));
  around(ctx, 760, 1120, bk, bk, () => {
    ctx.save(); ctx.translate(760, 1120); ctx.scale(1 - 0.25 * sq + 0.05 * Math.sin(sq * Math.PI * 3), 1); ctx.translate(-760, -1120);
    card(ctx, 600, 1020, 320, 200, { fill: '#fbf3df', ew: 0, drop: 8, r: 18 });
    ctx.save(); ctx.beginPath(); ctx.roundRect(600, 1020, 320, 200, 18); ctx.clip();
    sun(ctx, t, 560, 1130, 70, { rays: false });
    [['水星', 650, 5], ['金星', 672, 8], ['地球', 696, 8], ['火星', 718, 6], ['木星', 752, 18], ['土星', 796, 15], ['天王星', 838, 11], ['海王星', 875, 11]]
      .forEach(([n, x, r]) => planet(ctx, t, n, x, 1130, r, { ringRot: -0.3 }));
    ctx.restore();
    ctx.restore();
  });
  stamp(ctx, t, at('bye', '压缩') + 0.1, 760, 1270, '压缩版', { color: C.no, size: 54, rot: -0.1 });
  confetti(ctx, t, E('bye') + 0.1);
}

export const scenes = [
  { from: S('ruler') - 0.3, to: S('life') - 0.3, draw: rulers },
  { from: S('life') - 0.3, to: S('exam') - 0.3, draw: life },
  { from: S('exam') - 0.3, to: S('sum') - 0.3, draw: exam },
  { from: S('sum') - 0.3, to: 1e9, draw: finale },
];

export const events = [
  { t: S('ruler') - 0.1, type: 'boing' },
  { t: at('ruler', '二选一') - 0.2, type: 'pop' },
  { t: at('ruler', '距离') - 0.2, type: 'pop' },
  { t: at('life', '地球') - 0.1, type: 'boing' },
  ...CHAIN.map(([, t0]) => ({ t: t0() - 0.1, type: 'note', n: 72 })),
  { t: at('exam', '考试'), type: 'stamp', shake: 8 },
  ...ORDER.map((n, i) => ({ t: at('exam', KEYW[i]) + (i === 2 ? 0.12 : 0) - 0.05, type: 'note', n: 72 + [0, 2, 4, 5, 7, 9, 11, 12][i] })),
  { t: at('exam', '小行星') - 0.1, type: 'sparkle' },
  ...LINES.map(([, t0], i) => ({ t: t0() - 0.1, type: 'note', n: 76 + i * 3 })),
  { t: S('bye') - 0.2, type: 'boing' },
  { t: at('bye', '压缩'), type: 'boing' },
  { t: at('bye', '压缩') + 0.1, type: 'stamp' },
  { t: E('bye') + 0.1, type: 'confetti' },
  { t: E('bye') + 0.1, type: 'tada' },
];
