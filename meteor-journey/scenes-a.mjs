// Scenes 1–3: the wish hook + "不一定" stamp, the journey map, and meeting the rock (流星体).
import { W, C, SANS, S, at, atEnd, prog, lerp, easeIO, easeOut, pop, fadeIn, txt, around, arrow, burst, stamp, nameTag, talkLevel } from './lib.mjs';
import { rock, rockGuy, streak, ground, person } from './bodies.mjs';

// ---------- scene 1: a wish under a shooting star ----------
const GY = 1180;
// A meteor that crosses the sky from (x0,y0) toward (x1,y1) between t0 and t1, fading out at the end.
function flyer(ctx, t, t0, t1, x0, y0, x1, y1, w = 16) {
  const p = prog(t, t0, t1);
  if (p <= 0 || p >= 1) return null;
  const e = easeIO(p);
  const x = lerp(x0, x1, e), y = lerp(y0, y1, e);
  const a = Math.min(1, p * 6) * (1 - prog(p, 0.75, 1));
  streak(ctx, x, y, x1 - x0, y1 - y0, 160 + 260 * Math.min(1, p * 3), w, a);
  return [x, y];
}

function wish(ctx, t) {
  ground(ctx, GY, { color: '#14213f', top: '#3c5a8a', curve: 40 });
  person(ctx, t, 300, GY + 30, 1.1, { pose: t < at('no', '不一定') ? 'wish' : 'point' });
  flyer(ctx, t, 0.15, 1.6, 1000, 420, 520, 800);
  // the second one fizzles out in mid-air: most never reach the ground
  const t2 = at('no', '大多数') - 0.5;
  flyer(ctx, t, t2, t2 + 1.3, 980, 520, 620, 880, 14);
  burst(ctx, t, t2 + 1.15, 640, 860, { n: 12, r: 90, size: 14, colors: [C.amber, C.gold, '#fff'] });
  // landing spot marker with a question mark, crossed out once the answer lands
  const mp = fadeIn(t, at('hook', '地上'), 0.3);
  around(ctx, 700, GY + 40, mp, mp, () => {
    ctx.save();
    ctx.setLineDash([16, 12]); ctx.strokeStyle = C.gold; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.ellipse(700, GY + 40, 120, 34, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    const zero = t >= at('no', '一颗');
    txt(ctx, zero ? '0 颗' : '陨石？', 700, GY - 30, { size: zero ? 76 : 62, color: zero ? C.no : C.gold, stroke: C.ink, sw: 10 });
  });
  // hook title, word by word
  const lines = [['看见流星', 'hook', '看见'], ['地上就一定有陨石？', 'hook', '地上']];
  lines.forEach(([s, id, w], i) => {
    const p = pop(t, at(id, w) - 0.05, 0.35);
    around(ctx, W / 2, 330 + i * 140, p, p, () =>
      txt(ctx, s, W / 2, 330 + i * 140, { size: i ? 82 : 110, color: i ? C.white : C.gold, stroke: C.ink, sw: 16 }));
  });
  stamp(ctx, t, at('no', '不一定'), W / 2, 700, '不一定！', { size: 130 });
}

// ---------- scene 2: the journey map (space -> sky -> ground), names still hidden ----------
const STOPS = [
  { y: 560, label: '太空里', x: 300 },
  { y: 860, label: '大气中', x: 560 },
  { y: 1160, label: '地面上', x: 780 },
];

function journey(ctx, t) {
  const t0 = S('three');
  // layered bands
  const bands = [['rgba(255,255,255,0.03)', 420], ['rgba(90,170,255,0.12)', 720], ['rgba(70,120,80,0.35)', 1020]];
  bands.forEach(([c, y], i) => {
    const a = fadeIn(t, t0 + i * 0.15, 0.4);
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = c; ctx.fillRect(0, y, W, 300); ctx.restore();
  });
  STOPS.forEach((s, i) => {
    const ti = S('three') + 0.1 + i * 0.35;
    const p = pop(t, ti, 0.45);
    if (i > 0) {
      const q = STOPS[i - 1];
      arrow(ctx, q.x + 60, q.y + 60, s.x - 50, s.y - 70, { p: easeOut(prog(t, ti - 0.2, ti + 0.2)), color: 'rgba(255,255,255,0.7)', w: 7, head: 24, dash: [18, 14] });
    }
    around(ctx, s.x, s.y, p, p, () => {
      if (i === 1) streak(ctx, s.x, s.y, 1, 1, 220, 40, 1);
      rock(ctx, s.x, s.y, i === 2 ? 46 : 70, { seed: 5, heat: i === 1 ? 0.8 : 0, crust: i === 2 ? 1 : 0, rot: t * 0.4 });
      txt(ctx, s.label, s.x + (i === 2 ? -230 : 200), s.y, { size: 52, font: SANS, color: 'rgba(255,255,255,0.85)' });
      const q = pop(t, at('three', '三个名字') + i * 0.12, 0.4);
      around(ctx, s.x, s.y - 120, q, q, () => txt(ctx, '？', s.x, s.y - 120, { size: 80, color: C.gold, stroke: C.ink, sw: 10 }));
    });
  });
}

// ---------- scene 3: meet the rock — in space it is a 流星体 ----------
const SIZES = [
  { word: '灰尘', x: 170, r: 5, label: '灰尘' },
  { word: '大到', x: 420, r: 60, label: '我', guy: true },
  { word: '小行星', x: 790, r: 170, label: '小行星' },
];

function meet(ctx, t) {
  const sz = easeIO(prog(t, S('size') - 0.4, S('size') + 0.2));
  const enter = easeOut(prog(t, S('hi') - 0.4, S('hi') + 0.3));
  const gx = lerp(W / 2, SIZES[1].x, sz), gy = lerp(lerp(1300, 760, enter), 920, sz) + Math.sin(t * 2) * 10;
  const gr = lerp(200, SIZES[1].r, sz);
  // drifting space dust
  for (let i = 0; i < 6; i++) {
    const x = (150 + i * 170 + t * 12 * (i % 2 ? 1 : -1)) % W, y = 480 + ((i * 197) % 600);
    rock(ctx, x, y, 8 + (i % 3) * 5, { seed: 20 + i, rot: t * (0.3 + i * 0.1) });
  }
  if (sz > 0) {
    [SIZES[0], SIZES[2]].forEach((s, k) => {
      const p = pop(t, at('size', s.word) - 0.05, 0.45);
      around(ctx, s.x, 920, p, p, () => {
        if (s.r < 10) {
          for (let j = 0; j < 7; j++) { ctx.fillStyle = '#d8cfc6'; ctx.beginPath(); ctx.arc(s.x - 30 + (j % 4) * 20, 920 + Math.floor(j / 4) * 18 - 9, 3 + (j % 3), 0, 7); ctx.fill(); }
        } else rock(ctx, s.x, 920, s.r, { seed: 11, rot: t * 0.1 });
      });
      const lp = fadeIn(t, at('size', s.word), 0.3);
      ctx.save(); ctx.globalAlpha *= lp;
      txt(ctx, s.label, s.x, 1145, { size: 52, color: C.white, stroke: C.ink, sw: 8 });
      ctx.restore();
      if (k === 0) arrow(ctx, 250, 920, 330, 920, { p: lp, color: 'rgba(255,255,255,0.6)', w: 6, head: 22 });
      if (k === 1) arrow(ctx, 510, 920, 590, 920, { p: lp, color: 'rgba(255,255,255,0.6)', w: 6, head: 22 });
    });
    ctx.save(); ctx.globalAlpha *= sz;
    txt(ctx, '我', SIZES[1].x, 1145, { size: 52, color: C.gold, stroke: C.ink, sw: 8 });
    ctx.restore();
  }
  rockGuy(ctx, t, gx, gy, gr, {
    mood: t < atEnd('hi', '小石头') ? 'excited' : 'happy', talk: talkLevel(t, ['hi']), wave: 1 - sz, rot: Math.sin(t * 1.3) * 0.05,
  });
  burst(ctx, t, at('hi', '嗨'), W / 2, 760, { r: 280, n: 12 });
  // name tag: 流星体 — an object, not the light
  const tagY = lerp(1150, 520, sz);
  nameTag(ctx, t, at('name1', '流星体') - 0.05, W / 2, tagY, '流星体', '还在太空里的“物体”', { color: C.sky, num: '1' });
  stamp(ctx, t, at('size', '都算'), W / 2, 1270, '都算！', { color: C.ok, size: 90, rot: 0.08 });
}

export const scenesA = [
  { from: 0, to: S('three') - 0.25, draw: wish },
  { from: S('three') - 0.25, to: S('hi') - 0.35, draw: journey },
  { from: S('hi') - 0.35, to: S('go') - 0.2, draw: meet },
];

export const eventsA = [
  { t: 0.2, type: 'whoosh', d: 1.0, from: 2600, to: 500 },
  { t: at('hook', '看见'), type: 'pop', f: 600 },
  { t: at('hook', '地上'), type: 'pop', f: 800 },
  { t: at('no', '不一定'), type: 'stamp', shake: 20 },
  { t: at('no', '大多数') - 0.5, type: 'whoosh', d: 1.1, from: 2600, to: 700 },
  { t: at('no', '大多数') + 0.65, type: 'fizz' },
  { t: at('no', '一颗'), type: 'buzz' },
  ...[0, 1, 2].map((i) => ({ t: S('three') + 0.1 + i * 0.35, type: 'note', n: 67 + i * 4 })),
  { t: at('three', '三个名字'), type: 'sparkle' },
  { t: at('hi', '嗨'), type: 'boing' },
  { t: at('name1', '流星体'), type: 'ding', n: 84 },
  { t: at('size', '灰尘'), type: 'pop', f: 1200 },
  { t: at('size', '小行星'), type: 'pop', f: 420 },
  { t: at('size', '都算'), type: 'stamp', shake: 10 },
];
