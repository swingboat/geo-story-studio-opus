// Scenes 7–9: the long-hair-in-the-wind analogy, an exam-style reading of the tail direction, the recap and Halley's 2061 farewell.
import { W, C, SANS, NUM, S, at, prog, lerp, clamp, easeIO, easeOut, pop, fadeIn, txt, around, arrow, burst, stamp, card, rand, confetti, talkLevel } from './lib.mjs';
import { sun, comet, label } from './comet.mjs';

const TAU = Math.PI * 2;

// ---------- scene 7: hair in the wind always blows the same way ----------
function walker(ctx, t, x, y, face) {
  ctx.save();
  // long hair streams to the right (downwind) no matter which way she faces
  ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    ctx.strokeStyle = i % 2 ? '#3b2a4a' : '#523a63';
    ctx.lineWidth = 16;
    ctx.beginPath();
    for (let k = 0; k <= 14; k++) {
      const s = k / 14;
      const px = x + 20 + s * 300, py = y - 60 + i * 12 + s * 40 + Math.sin(s * 7 - t * 9 + i) * 16 * s;
      k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  }
  // legs
  const step = Math.sin(t * 8) * 22;
  ctx.strokeStyle = C.ink; ctx.lineWidth = 16;
  ctx.beginPath(); ctx.moveTo(x - 15, y + 170); ctx.lineTo(x - 15 + step, y + 280); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 15, y + 170); ctx.lineTo(x + 15 - step, y + 280); ctx.stroke();
  // dress
  ctx.fillStyle = C.pink; ctx.strokeStyle = C.ink; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(x - 40, y + 60); ctx.lineTo(x + 40, y + 60); ctx.lineTo(x + 85, y + 190); ctx.lineTo(x - 85, y + 190); ctx.closePath(); ctx.fill(); ctx.stroke();
  // head
  ctx.fillStyle = '#ffd9b8';
  ctx.beginPath(); ctx.arc(x, y - 20, 75, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#3b2a4a';
  ctx.beginPath(); ctx.arc(x, y - 40, 78, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
  ctx.fillStyle = C.ink;
  ctx.beginPath(); ctx.arc(x + face * 30, y - 20, 9, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(x + face * 30, y + 15, 14, 0.2, Math.PI - 0.2); ctx.lineWidth = 5; ctx.stroke();
  ctx.restore();
}

function windScene(ctx, t) {
  const t0 = S('wind');
  sun(ctx, t, 120, 760, 110, { mood: 'puff' });
  // wind streaks from the left
  ctx.save();
  ctx.strokeStyle = 'rgba(180,230,255,0.6)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const ph = (t * 0.9 + rand(i + 3)) % 1, y = 560 + i * 55, x = 220 + ph * 900;
    ctx.globalAlpha = Math.sin(Math.PI * ph);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + 50, y - 20, x + 90, y + 20, x + 140, y); ctx.stroke();
  }
  ctx.restore();
  txt(ctx, '风', 300, 520, { size: 64, color: C.ion, stroke: C.ink, sw: 10 });
  // she walks right, then turns and walks left; the hair keeps blowing right
  const flip = at('wind', '往哪走');
  const back = t >= flip;
  const x = back ? lerp(640, 520, prog(t, flip, flip + 2.5)) : lerp(480, 600, prog(t, t0, flip));
  walker(ctx, t, x, 800, back ? -1 : 1);
  const wa = fadeIn(t, t0 + 0.3, 0.3);
  if (wa > 0) {
    ctx.save(); ctx.globalAlpha *= wa;
    if (back) arrow(ctx, x - 30, 1150, x - 230, 1150, { color: C.white, w: 12, head: 36 });
    else arrow(ctx, x + 30, 1150, x + 230, 1150, { color: C.white, w: 12, head: 36 });
    txt(ctx, '走路方向', back ? x - 130 : x + 130, 1210, { size: 38, font: SANS, color: C.white });
    ctx.restore();
  }
  label(ctx, '头发 → 总朝下风', 790, 620, C.gold, 48);
  // mapping chip
  const pm = pop(t, at('wind', '同一边'), 0.45);
  around(ctx, W / 2, 1320, pm, pm, () => {
    card(ctx, 90, 1265, 900, 110, { fill: 'rgba(10,12,48,0.92)', edge: C.gold, ew: 5, r: 40, drop: 0 });
    txt(ctx, '风 ≈ 光压 + 太阳风　头发 ≈ 彗尾', W / 2, 1322, { size: 46, color: C.white });
  });
}

// ---------- scene 8: exam-style reading — where is the Sun? ----------
const OPTS = [['A', '东北', 1, -1], ['B', '西南', -1, 1], ['C', '东南', 1, 1], ['D', '西北', -1, -1]];

function exam(ctx, t) {
  const t0 = S('exam');
  card(ctx, 70, 300, 940, 860, { fill: 'rgba(10,14,52,0.94)', edge: C.gold, ew: 6, r: 40, drop: 0 });
  txt(ctx, '高考常见判读：太阳在哪个方位？', W / 2, 370, { size: 46, color: C.gold });
  // compass (上北下南)
  arrow(ctx, 955, 560, 955, 450, { color: C.white, w: 8, head: 28 });
  txt(ctx, '北', 955, 420, { size: 38, color: C.white });
  const cx = 540, cy = 760;
  // the comet: tail toward the northeast (upper right); flight arrow to the northwest — a distractor
  const sx = cx - 2000, sy = cy + 2000;
  comet(ctx, t, { x: cx, y: cy, r: 32, sx, sy, vel: -Math.PI * 0.75, len: 250, mood: 'happy' });
  arrow(ctx, cx - 40, cy - 40, cx - 170, cy - 170, { color: C.white, w: 8, head: 28 });
  txt(ctx, '飞行方向', cx - 170, cy - 40, { size: 32, font: SANS, color: C.white });
  if (t > at('exam', '不看飞行')) {
    const xp = easeOut(prog(t, at('exam', '不看飞行'), at('exam', '不看飞行') + 0.3));
    ctx.strokeStyle = C.no; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 150, cy - 150); ctx.lineTo(lerp(cx - 150, cx - 70, xp), lerp(cy - 150, cy - 70, xp)); ctx.stroke();
    if (xp >= 1) { ctx.beginPath(); ctx.moveTo(cx - 70, cy - 150); ctx.lineTo(cx - 150, cy - 70); ctx.stroke(); }
  }
  // four candidate positions
  const tAns = at('exam', '反方向');
  for (const [k, name, dx, dy] of OPTS) {
    const px = cx + dx * 290, py = cy + dy * 280, right = k === 'B';
    const on = right && t >= tAns;
    const sc = on ? pop(t, tAns, 0.45) : 1;
    around(ctx, px, py, sc, 1, () => {
      if (on) sun(ctx, t, px, py, 52, { face: true });
      else {
        ctx.save(); ctx.setLineDash([10, 10]); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(px, py, 50, 0, TAU); ctx.stroke(); ctx.restore();
      }
      txt(ctx, `${k} ${name}`, px, py + 85, { size: 40, color: on ? C.gold : 'rgba(255,255,255,0.75)' });
    });
  }
  if (t >= tAns) burst(ctx, t, tAns, cx - 300, cy + 280, { n: 12, r: 160, size: 22 });
  // rule chips
  const r1 = pop(t, at('exam', '看太阳'), 0.4);
  around(ctx, 300, 1260, r1, r1, () => {
    card(ctx, 70, 1205, 460, 110, { fill: C.ok, edge: C.ink, ew: 5, r: 40, drop: 8 });
    txt(ctx, '✓ 彗尾看太阳', 300, 1262, { size: 48, color: C.ink });
  });
  const r2 = pop(t, at('exam', '不看飞行'), 0.4);
  around(ctx, 780, 1260, r2, r2, () => {
    card(ctx, 560, 1205, 450, 110, { fill: C.no, edge: C.ink, ew: 5, r: 40, drop: 8 });
    txt(ctx, '✗ 不看飞行方向', 785, 1262, { size: 46, color: C.white });
  });
}

// ---------- scene 9: recap + 2061 farewell ----------
const STEPS = [
  ['sum', '太阳加热', '① 太阳加热：冰升华，放出气体和尘埃', C.gold],
  ['sum', '光压', '② 光压 → 尘埃尾（宽、弯）', C.dust],
  ['sum', '太阳风', '③ 太阳风 → 离子尾（细、直）', C.ion],
  ['sum', '背向太阳', '彗尾总是背向太阳', C.white],
];

function finale(ctx, t) {
  const out = easeIO(prog(t, S('bye') - 0.2, S('bye') + 0.5));
  // recap cards slide up and fade when Halley says goodbye
  ctx.save();
  ctx.globalAlpha *= 1 - out;
  txt(ctx, '一句话记住', W / 2, 330, { size: 60, color: C.gold, stroke: C.ink, sw: 10 });
  STEPS.forEach(([id, w, s, col], i) => {
    const p = pop(t, at(id, w) - 0.1, 0.45);
    const y = 470 + i * 190;
    around(ctx, W / 2, y, p, p, () => {
      const last = i === 3;
      card(ctx, 80, y - 70, 920, 140, { fill: last ? C.gold : 'rgba(10,12,48,0.92)', edge: last ? C.ink : col, ew: 5, r: 36, drop: last ? 10 : 0 });
      txt(ctx, s, W / 2, y + 2, { size: last ? 58 : 46, color: last ? C.ink : col });
    });
  });
  ctx.restore();
  if (out <= 0) return;
  // Halley heads back out, tail leading the way, with a 2061 date
  const tb = S('bye');
  const p = prog(t, tb, tb + 6);
  const x = lerp(480, 600, p), y = lerp(760, 820, p);
  ctx.save(); ctx.globalAlpha *= out;
  sun(ctx, t, 140, 640, 80, { face: true });
  comet(ctx, t, { x, y, r: 70, sx: 140, sy: 640, vel: Math.atan2(60, 120), len: 520, mood: 'happy', talk: talkLevel(t, ['bye']), look: -Math.PI * 0.7 });
  const pc = pop(t, at('bye', '七十六年'), 0.45);
  around(ctx, 300, 1100, pc, pc, () => {
    card(ctx, 90, 1040, 420, 120, { fill: 'rgba(10,12,48,0.92)', edge: C.ion, ew: 5, r: 36, drop: 0 });
    txt(ctx, '周期 约', 210, 1100, { size: 44, color: C.white });
    txt(ctx, '76', 340, 1096, { size: 70, font: NUM, color: C.ion });
    txt(ctx, '年', 430, 1100, { size: 44, color: C.white });
  });
  const pd = pop(t, at('bye', '二零六一年'), 0.5);
  around(ctx, 780, 1150, pd, pd, () => {
    txt(ctx, '2061', 780, 1130, { size: 150, font: NUM, color: C.gold, stroke: C.ink, sw: 14 });
    txt(ctx, '下次见', 780, 1240, { size: 54, color: C.white, stroke: C.ink, sw: 8 });
  });
  ctx.restore();
  confetti(ctx, t, at('bye', '抬头'));
}

export const scenes = [
  { from: S('wind') - 0.3, to: S('exam') - 0.3, draw: windScene },
  { from: S('exam') - 0.3, to: S('sum') - 0.3, draw: exam },
  { from: S('sum') - 0.3, to: 999, draw: finale },
];

export const events = [
  { t: S('wind'), type: 'wind', d: 4.5 },
  { t: at('wind', '往哪走'), type: 'boing' },
  { t: at('wind', '同一边'), type: 'pop', f: 800 },
  { t: S('exam'), type: 'tick', n: 84 },
  { t: at('exam', '看太阳'), type: 'ding', n: 86 },
  { t: at('exam', '不看飞行'), type: 'buzz' },
  { t: at('exam', '反方向'), type: 'tada', amp: 0.8 },
  ...STEPS.map(([id, w], i) => ({ t: at(id, w) - 0.1, type: 'note', n: 67 + i * 3 })),
  { t: S('bye') - 0.1, type: 'whoosh', d: 0.8 },
  { t: at('bye', '七十六年'), type: 'pop', f: 800 },
  { t: at('bye', '二零六一年'), type: 'stamp', shake: 12 },
  { t: at('bye', '抬头'), type: 'confetti' },
  { t: at('bye', '抬头') + 0.1, type: 'tada' },
];
