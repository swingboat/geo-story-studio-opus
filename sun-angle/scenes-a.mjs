// Scenes 1–2: the globe teaser (same sunlight, different angles) and the fair-test setup with locked conditions.
import { W, C, TAU, S, E, at, prog, lerp, clamp, easeOut, pop, txt, around, card, talkLevel, shakeOf, burst } from './lib.mjs';
import { astronaut, glow } from './cast.mjs';
import { title, tag, stamp } from './props.mjs';
import { sunBuddy, earthBuddy } from './sun.mjs';
import { lockIcon, clockIcon, bean } from './beam.mjs';

const INK = '#0a0828';
const EX = 700, EY = 900, ER = 270, BAND = 80;
const BANDS = [
  { y: EY, col: '#ff8a3c', label: '照得正', sub: '受照范围小' },
  { y: EY - 0.82 * ER, col: '#ffe08a', label: '照得斜', sub: '受照范围大' },
];
const hitX = (y) => EX - Math.sqrt(ER * ER - (y - EY) * (y - EY));

// A horizontal band of parallel sunlight from x0 to the globe's surface, with ripples flowing right.
function band(ctx, t, b, x0, p, a = 1) {
  if (p <= 0) return;
  const y1 = b.y - BAND / 2, y2 = b.y + BAND / 2, xr = x0 + (hitX(b.y) + 40 - x0) * p;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.beginPath(); ctx.rect(x0, y1, xr - x0, BAND); ctx.clip();
  ctx.beginPath(); ctx.moveTo(x0, y1);
  for (let y = y1; y <= y2; y += 4) ctx.lineTo(hitX(y), y);
  ctx.lineTo(x0, y2); ctx.closePath(); ctx.clip();
  const g = ctx.createLinearGradient(x0, 0, hitX(b.y), 0);
  g.addColorStop(0, 'rgba(255,214,90,0.55)'); g.addColorStop(1, 'rgba(255,196,60,0.9)');
  ctx.fillStyle = g; ctx.fillRect(x0, y1, 800, BAND);
  ctx.strokeStyle = 'rgba(255,252,230,0.75)'; ctx.lineWidth = 4;
  for (let x = x0 + ((t * 140) % 60); x < 1000; x += 60) { ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke(); }
  ctx.restore();
}

// The lit arc on the globe where a band lands.
function litArc(ctx, t, b, p) {
  if (p <= 0) return;
  const a1 = Math.PI + Math.asin((b.y - BAND / 2 - EY) / ER) * -1, a2 = Math.PI + Math.asin((b.y + BAND / 2 - EY) / ER) * -1;
  ctx.save();
  ctx.globalAlpha *= clamp(p);
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = 26;
  ctx.beginPath(); ctx.arc(EX, EY, ER, Math.min(a1, a2), Math.max(a1, a2)); ctx.stroke();
  ctx.strokeStyle = b.col; ctx.lineWidth = 16 + 4 * Math.sin(t * 8);
  ctx.beginPath(); ctx.arc(EX, EY, ER, Math.min(a1, a2), Math.max(a1, a2)); ctx.stroke();
  ctx.restore();
}

function globeScene(ctx, t) {
  const tS = S('sunFair'), tQ = S('secret'), tAng = at('secret', '角度');
  title(ctx, t, 0.3, '同样晒太阳', '为什么受热不一样？', { size: 92, t1: tQ - 0.2 });
  title(ctx, t, tQ, '秘密：照射角度', null, { size: 92, color: C.gold });
  const ep = pop(t, 0.2, 0.6);
  around(ctx, EX, EY, ep, ep, () => earthBuddy(ctx, t, EX, EY, ER, { light: Math.PI, lit: 1, look: -0.5, mood: t > tAng ? 'wow' : 'happy' }));
  BANDS.forEach((b, i) => {
    const p = easeOut(prog(t, 0.7 + i * 0.25, 1.7 + i * 0.25));
    band(ctx, t, b, 250, p);
    litArc(ctx, t, b, prog(t, 1.6 + i * 0.25, 2.0 + i * 0.25) * (0.55 + 0.45 * prog(t, tAng - 0.2, tAng + 0.2)));
  });
  // "same width" brackets while the Sun pleads its case
  const bp = easeOut(prog(t, at('sunFair', '一样') - 0.2, at('sunFair', '一样') + 0.3));
  if (bp > 0) BANDS.forEach((b) => {
    ctx.save(); ctx.globalAlpha *= bp; ctx.strokeStyle = C.gas; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(300, b.y - BAND / 2); ctx.lineTo(282, b.y - BAND / 2); ctx.lineTo(282, b.y + BAND / 2); ctx.lineTo(300, b.y + BAND / 2); ctx.stroke();
    ctx.restore();
  });
  if (bp > 0) tag(ctx, 330, EY + 120, '一样宽的阳光', null, { color: C.gas, size: 36, a: bp * (1 - prog(t, tAng - 0.3, tAng)) });
  // the secret: two lit patches, one tight and one stretched
  BANDS.forEach((b, i) => {
    const p = pop(t, tAng + i * 0.2, 0.5);
    const [tx, ty] = i ? [470, 545] : [300, 1050];
    around(ctx, tx, ty, p, p, () => tag(ctx, tx, ty, b.label, b.sub, { color: b.col, size: 42 }));
  });
  // the Sun, wronged but generous
  const sp = pop(t, 0.4, 0.6);
  const [shx, shy] = shakeOf(t, tS, 16, 0.6);
  around(ctx, 110, 790, sp, sp, () => sunBuddy(ctx, t, 110 + shx, 790 + shy, 120, {
    talk: talkLevel(t, ['sunFair']), mood: t > tS && t < at('sunFair', '我对') ? 'sad' : 'happy', look: 0.6,
  }));
  // 小宇 floats in with the question
  const kp = easeOut(prog(t, S('hook') - 0.4, S('hook') + 0.4));
  if (kp > 0) {
    astronaut(ctx, t, lerp(1250, 860, kp), 1290, 0.6, { talk: talkLevel(t, ['hook']), mood: t > tAng ? 'wow' : 'happy', look: -1, lookY: -0.6, scratch: prog(t, at('hook', '为什么'), at('hook', '为什么') + 0.3) * (1 - prog(t, tS, tS + 0.3)) });
    const qp = pop(t, at('hook', '更热'), 0.45) * (1 - prog(t, tQ, tQ + 0.3));
    [[-110, -150, 70, -0.2], [-20, -210, 90, 0.1], [80, -160, 60, 0.25]].forEach(([dx, dy, s, r], i) =>
      around(ctx, 860 + dx, 1290 + dy, pop(t, at('hook', '更热') + i * 0.12, 0.4) * (qp > 0 ? 1 : 0), 1, () =>
        txt(ctx, '?', 860 + dx, 1290 + dy + Math.sin(t * 4 + i) * 6, { size: s, color: C.gold, stroke: INK, sw: 10, font: 'RoundB' }), r));
  }
}

// ---------- fair test: lock everything except the angle ----------
const ROWS = [
  ['同样的光束', 'fair', '同样的光束', C.gold],
  ['同样的时长', 'fair', '照同样长', C.sky],
  ['同样的平地', 'fair', '落在同样', C.dust],
];

function rowIcon(ctx, t, i, x, y) {
  if (i === 0) {
    for (let k = -1; k <= 1; k++) {
      ctx.fillStyle = 'rgba(255,214,90,0.9)'; ctx.fillRect(x - 46 + (k + 1) * 34, y - 50, 24, 100);
    }
    bean(ctx, t, x, y + 6 + Math.sin(t * 4) * 6, 22);
  } else if (i === 1) clockIcon(ctx, x, y, 52, prog(t, at('fair', '照同样长'), at('fair', '落在同样')) * 1.5);
  else {
    ctx.fillStyle = '#a6744a'; ctx.strokeStyle = INK; ctx.lineWidth = 5;
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.roundRect(x - 75 + k * 50, y - 14, 46, 32, 8); ctx.fill(); ctx.stroke(); }
  }
}

function fairScene(ctx, t) {
  const t0 = S('fair'), tAng = at('only', '照射角度');
  title(ctx, t, t0, '公平比较', '只许改一样东西', { size: 92 });
  ROWS.forEach(([s, id, w, col], i) => {
    const y = 525 + i * 210, tp = at(id, w);
    const p = pop(t, tp - 0.25, 0.5);
    around(ctx, W / 2, y + 85, p, p, () => {
      card(ctx, 110, y, 860, 170, { fill: 'rgba(8,10,36,0.9)', edge: col, ew: 6, drop: 10 });
      rowIcon(ctx, t, i, 225, y + 85);
      txt(ctx, s, 340, y + 85, { size: 58, color: '#fff', align: 'left' });
      const lp = pop(t, tp + 0.45, 0.4);
      around(ctx, 880, y + 88, lerp(2.2, 1, Math.min(1, lp)) * lp, lp, () => lockIcon(ctx, 880, y + 88, 1, 0, col));
    });
  });
  // the one free variable: a dial whose needle keeps swinging
  const dp = pop(t, tAng - 0.2, 0.6);
  around(ctx, W / 2, 1310, dp, dp, () => {
    card(ctx, 110, 1180, 860, 265, { fill: 'rgba(8,10,36,0.92)', edge: C.pink, ew: 8, drop: 12 });
    glow(ctx, W / 2, 1310, 40, 420, 'rgba(255,143,171,0.18)');
    txt(ctx, '照射角度', 360, 1265, { size: 64, color: C.pink });
    txt(ctx, '唯一可以变', 360, 1360, { size: 40, color: '#fff' });
    const cx = 790, cy = 1400, r = 150;
    ctx.save();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - r - 20, cy); ctx.lineTo(cx + r + 20, cy); ctx.stroke();
    for (let k = 0; k <= 6; k++) {
      const a = Math.PI + (k / 6) * Math.PI;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.lineTo(cx + Math.cos(a) * (r - 22), cy + Math.sin(a) * (r - 22)); ctx.stroke();
    }
    const elev = lerp(Math.PI / 2, Math.PI / 6, 0.5 + 0.5 * Math.sin((t - tAng) * 2.6));
    ctx.strokeStyle = C.gold; ctx.lineWidth = 14; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - Math.cos(elev) * (r - 10), cy - Math.sin(elev) * (r - 10)); ctx.stroke();
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(cx, cy, 16, 0, TAU); ctx.fill();
    ctx.restore();
    lockIcon(ctx, 580, 1300, 0.8, easeOut(prog(t, tAng + 0.3, tAng + 0.7)), C.pink);
  });
  burst(ctx, t, tAng + 0.3, 580, 1300, { n: 10, r: 160 });
}

export const scenes = [
  { id: 'globe', from: 0, to: S('fair') - 0.3, draw: globeScene },
  { id: 'fair', from: S('fair') - 0.3, to: S('kidTorch') - 0.3, draw: fairScene },
];

export const events = [
  { type: 'pop', t: 0.25, f: 520 }, { type: 'pop', t: 0.45, f: 760 },
  { type: 'whoosh', t: 0.7, d: 1.2, from: 400, to: 2200, amp: 0.5 },
  { type: 'boing', t: S('hook') - 0.2 },
  ...[0, 1, 2].map((i) => ({ type: 'pop', t: at('hook', '更热') + i * 0.12, f: 800 + i * 160 })),
  { type: 'buzz', t: S('sunFair') },
  { type: 'ding', t: at('sunFair', '一样'), n: 84 },
  { type: 'slam', t: S('secret') },
  { type: 'sparkle', t: at('secret', '角度') },
  ...ROWS.map(([, id, w], i) => ({ type: 'pop', t: at(id, w) - 0.2, f: 600 + i * 120 })),
  ...ROWS.map(([, id, w]) => ({ type: 'stamp', t: at(id, w) + 0.5 })),
  { type: 'tada', t: at('only', '照射角度'), amp: 0.8 },
];
