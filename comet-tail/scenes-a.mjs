// Scenes 1–2: the "扫把星" hook with its question, then Halley far from the Sun — a tail-less dirty snowball.
import { W, C, SANS, NUM, S, E, at, prog, lerp, easeIO, easeOut, pop, fadeIn, txt, around, arrow, burst, stamp, card, talkLevel } from './lib.mjs';
import { sun, nucleus, comet, label } from './comet.mjs';

// ---------- scene 1: a broom-star sweeps the sky; does its tail always trail behind? ----------
function broom(ctx, x, y, s, rot) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = '#b07a3c'; ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.roundRect(-8, -150, 16, 170, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f2c35a';
  ctx.beginPath(); ctx.moveTo(-26, 15); ctx.lineTo(26, 15); ctx.lineTo(60, 110); ctx.lineTo(-60, 110); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#b07a3c'; ctx.lineWidth = 3;
  for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(i * 5, 22); ctx.lineTo(i * 12.5, 104); ctx.stroke(); }
  ctx.fillStyle = '#d0473a';
  ctx.fillRect(-28, 8, 56, 14);
  ctx.restore();
}

function hook(ctx, t) {
  // the comet glides from upper right to lower left, tail streaming behind it (the everyday picture)
  const p = easeIO(prog(t, 0, S('hi')));
  const x = lerp(820, 560, p), y = lerp(680, 820, p), vel = Math.atan2(820 - 680, 560 - 820);
  comet(ctx, t, { x, y, r: 46, sx: x + Math.cos(vel) * 4000, sy: y + Math.sin(vel) * 4000, vel, len: 560, mood: 'happy', look: vel });
  // title: 古人叫它「扫把星」
  const p1 = pop(t, at('hook', '古人') - 0.05, 0.35);
  around(ctx, W / 2, 380, p1, p1, () => txt(ctx, '古人叫它', W / 2 - 150, 380, { size: 64, color: C.white, stroke: C.ink, sw: 10 }));
  const p2 = pop(t, at('hook', '扫把星'), 0.45);
  around(ctx, W / 2 + 160, 380, p2, p2, () => {
    txt(ctx, '扫把星', W / 2 + 160, 380, { size: 96, color: C.gold, stroke: C.ink, sw: 12 });
    broom(ctx, W / 2 + 390, 340, 0.55, 0.5 + 0.12 * Math.sin(t * 5));
  });
  // the question: does the tail always trail behind?
  const q = at('q', '真的');
  const pa = fadeIn(t, at('q', '尾巴'), 0.35);
  if (pa > 0) {
    ctx.save(); ctx.globalAlpha *= pa;
    arrow(ctx, x - 70, y + 70, x - 270, y + 180, { color: C.white, w: 12, head: 40, p: pa });
    txt(ctx, '飞行方向', x - 290, y + 240, { size: 40, font: SANS, color: C.white, stroke: C.ink, sw: 8 });
    ctx.restore();
  }
  const pq = pop(t, q, 0.5);
  around(ctx, W / 2, 1240, pq, pq, () => {
    card(ctx, 110, 1150, 860, 180, { fill: 'rgba(10,12,48,0.9)', edge: C.gold, ew: 6, r: 40, drop: 0 });
    txt(ctx, '尾巴一定拖在身后？', W / 2 - 30, 1240, { size: 70, color: C.white });
    const b = 1 + 0.15 * Math.sin(t * 9);
    around(ctx, 880, 1235, b, 1, () => txt(ctx, '？', 880, 1235, { size: 110, color: C.gold, stroke: C.ink, sw: 10 }));
  });
}

// ---------- scene 2: Halley far out — cold, dark and tail-less; then the dirty snowball inside ----------
function far(ctx, t) {
  const t0 = S('hi');
  // a tiny, distant Sun
  const sp = fadeIn(t, t0 + 0.2, 0.5);
  around(ctx, 170, 470, sp, sp, () => {
    sun(ctx, t, 170, 470, 18, { face: false, glow: 0.7 });
    txt(ctx, '太阳（很远很远）', 200, 540, { size: 34, font: SANS, color: 'rgba(255,230,160,0.85)', align: 'left' });
  });
  // the nucleus: shivers while far away, then gets cut open
  const cut = easeOut(prog(t, at('core', '冰和尘埃') - 0.2, at('core', '冰和尘埃') + 0.5));
  const shiver = t < S('core') ? Math.sin(t * 60) * 4 : 0;
  const cx = 540 + shiver, cy = 880;
  const enter = easeOut(prog(t, t0, t0 + 0.6));
  around(ctx, cx, cy, enter, enter, () =>
    nucleus(ctx, t, cx, cy, 200, { mood: 'cold', talk: talkLevel(t, ['hi']), frost: 1, cut, look: Math.PI * 0.9 }));
  // "no tail" cue after the line about tails
  const nt = at('hi', '一根尾巴');
  const pn = pop(t, nt, 0.4) * (1 - prog(t, S('core') - 0.2, S('core') + 0.2));
  around(ctx, 860, 1060, pn, pn, () => {
    ctx.save();
    ctx.setLineDash([14, 12]); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(740, 900); ctx.quadraticCurveTo(900, 980, 1000, 1180); ctx.stroke();
    ctx.restore();
    txt(ctx, '尾巴：0', 860, 1240, { size: 64, color: C.no, stroke: C.ink, sw: 10 });
  });
  // cutaway labels: 冰 / 尘埃
  if (cut > 0.3) {
    const a = prog(cut, 0.3, 1);
    ctx.save(); ctx.globalAlpha *= a;
    label(ctx, '冰', 800, 720, C.ice, 56);
    arrow(ctx, 790, 760, 700, 820, { color: C.ice, w: 6, head: 22 });
    label(ctx, '尘埃', 830, 1050, C.amber, 56);
    arrow(ctx, 790, 1010, 700, 960, { color: C.amber, w: 6, head: 22 });
    label(ctx, '彗核', 280, 640, C.white, 56);
    ctx.restore();
  }
  stamp(ctx, t, at('core', '脏雪球'), 300, 1150, '脏雪球', { color: C.sky, size: 90, rot: -0.1 });
  // size card for Halley
  const ps = pop(t, at('core', '十几公里') - 0.1, 0.45);
  around(ctx, W / 2, 1330, ps, ps, () => {
    card(ctx, 170, 1270, 740, 120, { fill: 'rgba(10,12,48,0.92)', edge: C.ice, ew: 5, r: 30, drop: 0 });
    txt(ctx, '哈雷彗核 约', 390, 1332, { size: 46, color: C.white });
    txt(ctx, '15×8', 640, 1328, { size: 64, font: NUM, color: C.gold });
    txt(ctx, '公里', 800, 1332, { size: 46, color: C.white });
  });
}

export const scenes = [
  { from: 0, to: S('hi') - 0.3, draw: hook },
  { from: S('hi') - 0.3, to: S('hot') - 0.3, draw: far },
];

export const events = [
  { t: 0.15, type: 'whoosh', d: 1.2, from: 2400, to: 600 },
  { t: at('hook', '古人'), type: 'pop', f: 600 },
  { t: at('hook', '扫把星'), type: 'boing' },
  { t: at('q', '尾巴'), type: 'whoosh', d: 0.4 },
  { t: at('q', '真的'), type: 'ding', n: 84 },
  { t: S('hi') - 0.2, type: 'sparkle' },
  { t: S('hi') + 0.3, type: 'wind', d: 3.5 },
  { t: at('hi', '一根尾巴'), type: 'buzz' },
  { t: at('core', '冰和尘埃'), type: 'scribble', d: 0.7 },
  { t: at('core', '脏雪球'), type: 'stamp', shake: 16 },
  { t: at('core', '十几公里') - 0.1, type: 'pop', f: 900 },
];
