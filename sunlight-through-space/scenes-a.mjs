// Scenes 1–2: the question (with the "hot-air bridge" gag) and solar radiation leaving the Sun as EM waves.
import { W, C, TAU, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, around, burst, talkLevel, rnd } from './lib.mjs';
import { astronaut, glow } from './cast.mjs';
import { title, tag, stamp } from './props.mjs';
import { sunBuddy, earthBuddy, lightWave } from './sun.mjs';
import { ringTrain, waveRing, energyDot, wavePoint, bubble, thought, bigCross } from './waves.mjs';

const INK = '#0a0828';
const SUN = [230, 640], SR = 170, EARTH = [850, 1260], ER = 115;

// The imagined bridge: an arch from Sun to Earth with wobbling hot-air puffs; `fall` crumbles it.
function hotBridge(ctx, t, p, fall) {
  const [x1, y1] = [SUN[0] + 120, SUN[1] + 140], [x2, y2] = [EARTH[0] - 90, EARTH[1] - 80];
  const cx = (x1 + x2) / 2 + 60, cy = Math.min(y1, y2) - 420;
  const pt = (f) => [(1 - f) ** 2 * x1 + 2 * (1 - f) * f * cx + f * f * x2, (1 - f) ** 2 * y1 + 2 * (1 - f) * f * cy + f * f * y2];
  const n = 20;
  for (let i = 0; i < n; i++) {
    const f = i / (n - 1);
    if (f > p) break;
    let [x, y] = pt(f);
    const drop = Math.max(0, fall - rnd(i) * 0.4) ** 2 * 1400;
    y += drop; x += (rnd(i + 7) - 0.5) * drop * 0.4;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(drop * 0.004 * (rnd(i + 3) - 0.5));
    ctx.fillStyle = i % 2 ? '#ff9a5c' : '#ffb27a'; ctx.strokeStyle = INK; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.roundRect(-34, -22, 68, 44, 12); ctx.fill(); ctx.stroke();
    ctx.restore();
    if (fall <= 0 && i % 3 === 1) {
      ctx.strokeStyle = 'rgba(255,120,60,0.8)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let k = 0; k < 6; k++) ctx.lineTo(x + Math.sin(k * 1.3 + t * 6 + i) * 8, y - 34 - k * 12);
      ctx.stroke();
    }
  }
  const [lx, ly] = pt(0.5);
  if (p > 0.6 && fall <= 0) txt(ctx, '热空气大桥', lx, ly + 90, { size: 46, color: '#ffd1a8', stroke: INK, sw: 10 });
}

function hookScene(ctx, t) {
  const tFar = at('hook1', '那么远'), tSpace = at('hook1', '太空'), tHeat = at('hook2', '热'), tQ = at('hook2', '怎么');
  const tBr = S('bridge'), tNo = S('noBridge'), tMail = S('sunMail'), tEm = at('sunMail', '电磁波');
  title(ctx, t, 0.3, '隔着太空', '阳光怎样把能量送过来？', { size: 84, t1: tBr - 0.2 });
  title(ctx, t, tMail - 0.1, '太阳：我有快递！', null, { size: 76, color: C.gold });
  // Sun and Earth slide in from their corners
  const sp = easeOut(prog(t, 0.1, 1.0)), ep = easeOut(prog(t, 0.4, 1.3));
  const shades = easeOut(prog(t, at('sunMail', '我') - 0.1, at('sunMail', '我') + 0.3));
  sunBuddy(ctx, t, lerp(-200, SUN[0], sp), lerp(400, SUN[1], sp), SR, {
    talk: talkLevel(t, ['sunMail']), mood: t > tNo ? 'happy' : 'happy', look: 1, lookY: 1, shades,
  });
  earthBuddy(ctx, t, lerp(W + 200, EARTH[0], ep), lerp(1500, EARTH[1], ep), ER, {
    light: Math.atan2(SUN[1] - EARTH[1], SUN[0] - EARTH[0]), lit: 0.6, look: -1, mood: t > tHeat && t < tMail ? 'wow' : 'happy',
  });
  // the long, empty-looking stretch of space between them
  const dp = easeIO(prog(t, tFar - 0.2, tSpace + 0.3)) * (1 - prog(t, tBr - 0.3, tBr));
  if (dp > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 5; ctx.setLineDash([18, 16]); ctx.lineDashOffset = -t * 40;
    const [ax, ay] = [SUN[0] + 130, SUN[1] + 130], [bx, by] = [EARTH[0] - 90, EARTH[1] - 90];
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lerp(ax, bx, dp), lerp(ay, by, dp)); ctx.stroke();
    ctx.restore();
    const lp = pop(t, tSpace - 0.1, 0.45) * (1 - prog(t, tBr - 0.3, tBr));
    around(ctx, 690, 820, lp, lp, () => tag(ctx, 690, 820, '广阔的太空', null, { color: C.sky, size: 46 }), 0.08);
  }
  // 小宇 floats in the middle, puzzled
  const kp = easeOut(prog(t, 0.2, 1.1));
  const scratch = prog(t, tNo, tNo + 0.3) * (1 - prog(t, tMail + 0.4, tMail + 0.8));
  astronaut(ctx, t, lerp(-200, 330, kp), 1120, 0.62, {
    talk: talkLevel(t, ['hook1', 'hook2', 'bridge']), look: t > tMail ? -1 : 1, lookY: t > tMail ? -1 : 0,
    mood: t > tNo && t < tMail ? 'sad' : t > tEm ? 'starry' : 'happy', scratch, arm: -0.3,
  });
  // question marks bloom around him
  const qp = prog(t, tQ - 0.1, tQ + 0.4) * (1 - prog(t, tBr - 0.2, tBr + 0.1));
  [[-150, -170, 70], [130, -230, 90], [190, -60, 60]].forEach(([dx, dy, s], i) => {
    const p = pop(t, tQ + i * 0.12, 0.4) * (qp > 0 ? 1 : 0);
    around(ctx, 330 + dx, 1120 + dy, p, p, () => txt(ctx, '?', 330 + dx, 1120 + dy + Math.sin(t * 4 + i) * 8, { size: s * 1.4, color: C.gold, stroke: INK, sw: 10, font: 'RoundB' }));
  });
  // the hot-air bridge daydream, then a big ✕
  const bp = easeOut(prog(t, tBr + 0.1, tBr + 1.2)), fall = prog(t, tNo + 0.3, tNo + 1.3);
  if (bp > 0 && fall < 1) hotBridge(ctx, t, bp, fall);
  const xp = easeOut(prog(t, tNo - 0.05, tNo + 0.35)) * (1 - prog(t, tMail - 0.3, tMail));
  bigCross(ctx, 640, 860, 110, xp);
  const np = pop(t, at('noBridge', '桥') - 0.1, 0.4) * (1 - prog(t, tMail - 0.3, tMail));
  stamp(ctx, 650, 470, '没有这座桥', np, { color: C.no, size: 64 });
  // the Sun's parcel: a gold box wrapped in wave ribbons
  const mp = pop(t, tEm - 0.1, 0.5);
  around(ctx, 600, 820, mp, mp, () => {
    ctx.save();
    ctx.translate(600, 820 + Math.sin(t * 3) * 10); ctx.rotate(-0.1);
    ctx.fillStyle = '#f2b04c'; ctx.strokeStyle = INK; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.roundRect(-110, -80, 220, 160, 18); ctx.fill(); ctx.stroke();
    ctx.restore();
    lightWave(ctx, t, 490, 800, 710, 800, { amp: 12, wl: 46, w: 9, color: '#fff7c2' });
    txt(ctx, '电磁波快递', 600, 990, { size: 54, color: C.energy, stroke: INK, sw: 10 });
  });
  burst(ctx, t, tEm, 600, 820, { n: 12, r: 260 });
}

// ---------- the Sun sends out solar radiation as electromagnetic waves ----------
const RAYS = [-2.75, -2.05, -1.1, -0.4, 0.4, 1.1, 2.05, 2.75];

function emScene(ctx, t) {
  const t0 = S('em'), tRad = at('em', '太阳辐射'), tWave = at('em2', '电磁波'), tEnergy = at('em2', '能量'), tSpace = at('em2', '太空');
  const X = W / 2, Y = 900, R = 190;
  title(ctx, t, t0, '太阳辐射', '上一期的主角', { size: 88, t1: tWave - 0.2 });
  title(ctx, t, tWave, '能量，随电磁波出发', null, { size: 72 });
  // "previous episode" sticker
  const ep = pop(t, t0 + 0.1, 0.45) * (1 - prog(t, tWave - 0.2, tWave + 0.1));
  around(ctx, 830, 520, ep, ep, () => tag(ctx, 830, 520, '上一期', '太阳为什么能发光发热', { color: C.pink, size: 40 }), 0.06);
  // rings emerge after "太阳辐射" and keep drifting outward
  const ra = prog(t, tRad - 0.2, tRad + 0.6);
  ringTrain(ctx, t, X, Y, R * 1.15, R * 2.6, { n: 3, a: ra * (1 - 0.55 * prog(t, tWave - 0.2, tWave + 0.6)), speed: 0.45 });
  // waves leave in every direction once "电磁波" is said
  const wp = easeOut(prog(t, tWave - 0.2, tWave + 1.2));
  RAYS.forEach((a, i) => {
    const x1 = X + Math.cos(a) * R * 1.2, y1 = Y + Math.sin(a) * R * 1.2, x2 = X + Math.cos(a) * 600, y2 = Y + Math.sin(a) * 600;
    lightWave(ctx, t + i * 0.3, x1, y1, x2, y2, { p: clamp(wp * 1.15 - (i % 3) * 0.05), amp: 14, wl: 56, w: 6, a: 0.85 });
    // energy dots ride the waves after "能量"
    const da = prog(t, tEnergy - 0.1, tEnergy + 0.3);
    if (da > 0) {
      const f = ((t - tEnergy) * 0.4 + i * 0.13) % 1;
      const [px, py] = wavePoint(t + i * 0.3, x1, y1, x2, y2, f, 14, 56);
      energyDot(ctx, t, px, py, 18, da * Math.sin(Math.PI * f) * 1.6);
    }
  });
  sunBuddy(ctx, t, X, Y, R, { mood: t > tSpace ? 'starry' : 'happy', shades: 1 - prog(t, t0, t0 + 0.4), talk: 0 });
  const tp = pop(t, tRad - 0.1, 0.45) * (1 - prog(t, tWave - 0.3, tWave));
  around(ctx, X, 1240, tp, tp, () => tag(ctx, X, 1240, '太阳辐射', '从太阳出发，射向太空', { color: C.energy, size: 56 }));
  const wq = pop(t, tWave - 0.05, 0.45);
  around(ctx, X, 1240, wq, wq, () => tag(ctx, X, 1240, '电磁波', '带着能量向外传播', { color: C.gold, size: 60 }), -0.04);
  const sq = pop(t, tSpace - 0.1, 0.45);
  around(ctx, 860, 1400, sq, sq, () => tag(ctx, 860, 1400, '奔向太空 →', null, { color: C.sky, size: 40 }), 0.05);
}

export const scenes = [
  { id: 'hook', from: 0, to: S('em') - 0.3, draw: hookScene },
  { id: 'em', from: S('em') - 0.3, to: S('sound') - 0.3, draw: emScene },
];

export const events = [
  { type: 'whoosh', t: 0.2, d: 0.9, from: 300, to: 1600, amp: 0.6 },
  { type: 'pop', t: at('hook1', '太空'), f: 800 },
  ...[0, 1, 2].map((i) => ({ type: 'pop', t: at('hook2', '怎么') + i * 0.12, f: 900 + i * 200 })),
  { type: 'scribble', t: S('bridge') + 0.1, d: 1.0 },
  { type: 'buzz', t: S('noBridge') - 0.05 },
  { type: 'slam', t: at('noBridge', '桥') },
  { type: 'boing', t: S('sunMail') + 0.1 },
  { type: 'sparkle', t: at('sunMail', '电磁波') },
  { type: 'ding', t: at('em', '太阳辐射'), n: 84 },
  { type: 'whoosh', t: at('em2', '电磁波') - 0.2, d: 1.1, from: 500, to: 2800, amp: 0.6 },
  { type: 'sparkle', t: at('em2', '能量'), amp: 0.8 },
  { type: 'pop', t: at('em2', '太空'), f: 1000 },
];
