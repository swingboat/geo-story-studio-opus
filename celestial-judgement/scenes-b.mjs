// Scenes 5–6: applicant 3 "流星" shows off, gets stopped, and the object (流星体) is split from the phenomenon (流星).
import { W, C, SANS, S, E, at, atEnd, prog, lerp, easeOut, easeIO, pop, fadeIn, txt, card, around, burst, stamp, nameTag, talkLevel, arrow } from './lib.mjs';
import { face, rock, glow } from './bodies.mjs';
import { streak, ticket, atmosphere } from './props.mjs';

// ---------- scene 5: "我是流星！看我多亮！" — then "等等！" ----------
function showOff(ctx, t) {
  const t0 = S('metHi') - 0.35;
  around(ctx, W / 2, 400, pop(t, t0 + 0.3, 0.45), 1, () => ticket(ctx, W / 2, 400, 3));
  // swoops in from the upper left, then hovers and wiggles while it brags
  const p = easeOut(prog(t, t0, t0 + 0.9));
  const freeze = t >= at('wait', '等等');
  const tt = freeze ? at('wait', '等等') : t;
  const hx = lerp(-150, 700, p) + Math.sin(tt * 3) * 18 * p, hy = lerp(380, 860, p) + Math.cos(tt * 2.4) * 14 * p;
  const shine = pop(t, at('metHi', '多亮'), 0.5);
  if (shine > 0) glow(ctx, hx, hy, 0, 260 * shine, `rgba(255,220,140,${0.5 * shine})`);
  streak(ctx, hx, hy, 1, 0.56, 620, 70 + 20 * shine);
  face(ctx, t, hx - 10, hy, 62, { talk: talkLevel(t, ['metHi']), mood: freeze ? 'wow' : 'happy' });
  burst(ctx, t, at('metHi', '多亮'), hx, hy, { r: 260, n: 12 });
  // "freeze frame" — blue tint and a big red 等等！
  const fz = fadeIn(t, at('wait', '等等'), 0.15);
  if (fz > 0) {
    ctx.save();
    ctx.globalAlpha *= fz * 0.25;
    ctx.fillStyle = '#4060ff'; ctx.fillRect(0, 0, W, 1920);
    ctx.restore();
  }
  stamp(ctx, t, at('wait', '等等'), 300, 620, '等等！', { color: C.no, size: 110, rot: -0.1 });
  // label the glow itself: a phenomenon
  const lp = pop(t, at('wait', '现象'), 0.45);
  around(ctx, 600, 1180, lp, lp, () => {
    arrow(ctx, 600, 1110, 640, 960, { color: C.amber, w: 8, head: 28 });
    card(ctx, 330, 1120, 540, 110, { fill: 'rgba(8,10,40,0.9)', edge: C.amber, ew: 6, drop: 0, r: 55 });
    txt(ctx, '这道亮光 = 现象', 600, 1176, { size: 54, color: C.amber });
  });
}

// ---------- scene 6: the rock is the object; the trail it makes in the air is the phenomenon ----------
const AIR_TOP = 800, AIR_BOT = 1360;
const P0 = [190, 470], P1 = [360, 690], P2 = [820, 1240];

function rockPos(t) {
  const a = S('body'), b = at('enter', '冲进'), c = b + 1.7;
  if (t < b) {
    const p = easeOut(prog(t, a, b));
    return [lerp(P0[0], P1[0], p), lerp(P0[1], P1[1], p), 0];
  }
  const p = easeIO(prog(t, b, c));
  const x = lerp(P1[0], P2[0], p), y = lerp(P1[1], P2[1], p);
  // after arriving it keeps creeping forward a little: still the head of the trail
  const k = prog(t, c, c + 4) * 30;
  return [x + k * 0.6, y + k * 0.8, p];
}

function split(ctx, t) {
  atmosphere(ctx, AIR_TOP, AIR_BOT);
  const ap = fadeIn(t, at('enter', '大气层') - 0.2, 0.4);
  ctx.save(); ctx.globalAlpha *= ap;
  txt(ctx, '大气层', 940, AIR_BOT - 60, { size: 46, color: '#bfe6ff' });
  ctx.restore();
  txt(ctx, '太空', 930, 720, { size: 46, color: 'rgba(255,255,255,0.6)' });
  const [x, y, p] = rockPos(t);
  const inAir = clamp01((y - AIR_TOP + 40) / 120);
  const dx = P2[0] - P1[0], dy = P2[1] - P1[1];
  // trail only exists inside the air, never above it
  const len = Math.max(0, Math.min(Math.hypot(x - P1[0], y - P1[1]), (y - AIR_TOP) / (dy / Math.hypot(dx, dy))));
  if (inAir > 0) streak(ctx, x, y, dx, dy, len * 1.05, 60, inAir);
  rock(ctx, x, y, 46, t * 1.5, inAir);
  face(ctx, t, x, y, 30, { mood: inAir > 0.5 ? 'wow' : 'happy' });
  // labels: object (top right) and phenomenon (lower left), each with a pointer
  const ot = at('body', '流星体');
  const op = pop(t, ot, 0.45);
  if (op > 0) {
    nameTag(ctx, t, ot, 720, 520, '流星体', '太空中的物体', { color: C.sky, size: 76 });
    arrow(ctx, 560, 560, x + 60, y - 30, { color: C.sky, w: 6, head: 22, p: prog(t, ot + 0.3, ot + 0.6), dash: [10, 10] });
  }
  const mt = at('enter', '亮迹');
  nameTag(ctx, t, mt, 290, 1160, '流星', '大气中的亮迹', { color: C.amber, size: 76 });
  if (t > mt) arrow(ctx, 400, 1080, lerp(P1[0], x, 0.55) - 20, lerp(P1[1], y, 0.55) + 30, { color: C.amber, w: 6, head: 22, p: prog(t, mt + 0.3, mt + 0.6), dash: [10, 10] });
  // 物体 ≠ 现象
  const sp = at('split', '分开');
  stamp(ctx, t, at('split', '物体'), W / 2, 860, '物体 ≠ 现象', { color: C.pink, size: 92, rot: -0.06 });
  burst(ctx, t, sp, W / 2, 860, { r: 380, n: 16 });
}
const clamp01 = (v) => Math.min(1, Math.max(0, v));

export const scenes = [
  { from: S('metHi') - 0.35, to: S('body') - 0.3, draw: showOff },
  { from: S('body') - 0.3, to: S('spotHi') - 0.35, draw: split },
];

export const events = [
  { t: S('metHi') - 0.35, type: 'whoosh', d: 0.9, from: 3000, to: 600, amp: 1.2 },
  { t: at('metHi', '多亮'), type: 'sparkle', amp: 1.4 },
  { t: at('wait', '等等'), type: 'alarm' },
  { t: at('wait', '等等') + 0.05, type: 'stamp', shake: 18 },
  { t: at('wait', '现象'), type: 'pop', f: 900 },
  { t: at('body', '流星体'), type: 'ding', n: 84 },
  { t: at('enter', '冲进'), type: 'whoosh', d: 1.5, from: 2400, to: 400, amp: 1.2 },
  { t: at('enter', '冲进') + 0.4, type: 'sizzle', d: 1.4 },
  { t: at('enter', '亮迹'), type: 'ding', n: 88 },
  { t: at('split', '物体'), type: 'stamp', shake: 14 },
];
