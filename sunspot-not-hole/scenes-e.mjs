// Scenes 8–10: the ~11-year sunspot cycle and solar activity, exam key points (layers), and the wrap-up.
import { W, C, TAU, S, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, around, burst, talkLevel, confetti, rnd } from './lib.mjs';
import { astronaut, glow } from './cast.mjs';
import { title, tag, stamp } from './props.mjs';
import { sunBuddy, sunglasses } from './sun.mjs';
import { diskSpots } from './spot.mjs';
import { flare, label } from './gear.mjs';
import { SPOTS } from './scenes-a.mjs';

const INK = '#0a0828';
// a busy disk for the activity maximum
const MANY = [...Array(11)].map((_, i) => ({ u: (rnd(i + 3) - 0.5) * 1.3, v: (i % 2 ? 1 : -1) * (0.15 + rnd(i + 11) * 0.3), s: 0.06 + rnd(i + 21) * 0.08, seed: i + 2 }));
const FEW = [{ u: 0.25, v: -0.28, s: 0.07, seed: 4 }];

function miniSun(ctx, t, x, y, r, list, o = {}) {
  sunBuddy(ctx, t, x, y, r, { faceA: 0, breathe: 0.5, inside: () => diskSpots(ctx, 0, x, y, r, list, o) });
}

// ---------- scene 8: the cycle ----------
function cycleScene(ctx, t) {
  const t0 = S('cycle'), tMany = at('cycle', '多'), tFew = at('cycle', '少'), tY = S('years'), t11 = at('years', '十一年'), tVar = at('years', '长短不一');
  const tMark = S('mark'), tFl = at('mark', '耀斑'), tSign = at('mark', '标志');
  title(ctx, t, t0 - 0.1, '黑子：有时多，有时少', null, { size: 74, t1: tMark - 0.15 });
  title(ctx, t, tMark, '黑子多少 → 太阳活动强弱', null, { size: 66, color: C.gold });

  // the Sun itself shows off: spots swarm in, then thin out
  const bigA = 1 - prog(t, tY - 0.3, tY + 0.2);
  if (bigA > 0) {
    const n = t < tMany ? 3 : t < tFew ? MANY.length : 1;
    const list = t < tMany ? SPOTS.slice(0, 3) : t < tFew ? MANY : FEW;
    ctx.save(); ctx.globalAlpha *= bigA;
    around(ctx, 540, 820, pop(t, t0 - 0.2, 0.5), 1, () => sunBuddy(ctx, t, 540, 820, 220, {
      talk: talkLevel(t, ['cycle']), mood: 'happy', look: 0.2,
      inside: () => diskSpots(ctx, 0, 540, 820, 220, list, { grow: (i) => (i < n ? 1 : 0) }),
    }));
    ctx.restore();
  }

  // low → high → low, on a time line
  const xs = [200, 540, 880], y = 780;
  const kinds = [['低谷', FEW], ['活动较强', MANY], ['下一次低谷', FEW]];
  kinds.forEach(([name, list], i) => {
    const p = pop(t, tY + 0.1 + i * 0.55, 0.5);
    around(ctx, xs[i], y, p, p, () => {
      miniSun(ctx, t, xs[i], y, i === 1 ? 135 : 105, list);
      label(ctx, name, xs[i], y + 200, { size: 42, color: i === 1 ? C.gold : C.white });
    });
  });
  // flares crackle on the busy Sun
  if (t > tFl - 0.3) [0, 0.45, 0.9, 1.5, 2.2].forEach((d, i) => flare(ctx, t, tFl - 0.2 + d, 540 + Math.cos(i * 2.3) * 110, y + Math.sin(i * 2.3) * 100, 60, i * 1.3));
  const fa = pop(t, tFl - 0.1, 0.45);
  around(ctx, 540, 560, fa, fa, () => tag(ctx, 540, 560, '耀斑等活动也更频繁', null, { color: '#ffe9a8', size: 42 }));

  // the span bracket
  const bp = easeOut(prog(t, t11 - 0.4, t11 + 0.3));
  if (bp > 0) {
    const by = 1060, x0 = xs[0], x1 = lerp(xs[0], xs[2], bp);
    ctx.save();
    ctx.strokeStyle = C.sky; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, by - 26); ctx.lineTo(x0, by); ctx.lineTo(x1, by); if (bp >= 1) ctx.lineTo(x1, by - 26); ctx.stroke();
    ctx.restore();
    const np = pop(t, t11 - 0.1, 0.5);
    around(ctx, 540, 1140, np, np, () => {
      txt(ctx, '平均约 11 年', 540, 1140, { size: 76, color: C.sky, stroke: INK, sw: 12 });
    });
    const vp = fadeIn(t, tVar - 0.2, 0.4);
    if (vp > 0) { ctx.save(); ctx.globalAlpha *= vp; label(ctx, '每一轮长短、强弱都不一样', 540, 1230, { size: 40, color: 'rgba(255,255,255,0.85)' }); ctx.restore(); }
  }
  stamp(ctx, 540, 1350, '太阳活动强弱的标志', pop(t, tSign - 0.15, 0.5), { size: 58, color: C.gold, rot: -0.04 });
}

// ---------- scene 9: exam key points ----------
function examScene(ctx, t) {
  const t0 = S('exam'), tSpot = at('exam', '光球层'), tFlare = at('exam', '色球层'), t11 = at('exam', '十一年');
  title(ctx, t, t0, '考试划重点', null, { size: 92, color: C.no });
  const rows = [['黑子', '光球层', at('exam', '黑子'), C.gold], ['耀斑', '色球层', at('exam', '耀斑'), C.pink], ['活动周期', '约 11 年', t11 - 0.3, C.sky]];
  rows.forEach(([k, v, t1, col], i) => {
    const p = pop(t, t1 - 0.1, 0.45), ry = 500 + i * 110;
    around(ctx, 540, ry, p, p, () => {
      ctx.fillStyle = 'rgba(8,10,36,0.88)';
      ctx.beginPath(); ctx.roundRect(170, ry - 46, 740, 92, 46); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.stroke();
      txt(ctx, k, 330, ry, { size: 46, color: col });
      txt(ctx, '→', 520, ry, { size: 46, color: '#fff', font: 'RoundB' });
      txt(ctx, v, 720, ry, { size: 46, color: '#fff' });
    });
  });

  // a slice of the Sun's atmosphere: photosphere, chromosphere, corona
  const cx = 540, cy = 1560, r = 560, da = pop(t, t0 + 0.2, 0.6);
  around(ctx, cx, 1200, da, da, () => {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 820, W, 640); ctx.clip();
    glow(ctx, cx, cy, r, r + 260, 'rgba(230,240,255,0.32)');
    ctx.fillStyle = '#ff5a6e';
    ctx.beginPath(); ctx.arc(cx, cy, r + 34, 0, TAU); ctx.fill();
    const g = ctx.createRadialGradient(cx, cy - r * 0.4, r * 0.2, cx, cy, r);
    g.addColorStop(0, '#fff2b0'); g.addColorStop(1, '#ffb12e');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
    diskSpots(ctx, 0, cx, cy, r, [{ u: -0.2, v: -0.86, s: 0.07, seed: 3 }]);
    ctx.restore();
    // the flare on the chromosphere repeats every 1.4 s once it has been named
    const loop = t < tFlare ? t : tFlare + ((t - tFlare) % 1.4);
    flare(ctx, loop, tFlare, cx + Math.cos(-1.1) * (r + 17), cy + Math.sin(-1.1) * (r + 17), 70, 0.45);
    ctx.restore();
    const la = (t1) => fadeIn(t, t1 - 0.2, 0.3);
    ctx.save(); ctx.globalAlpha *= la(tSpot); label(ctx, '光球层：黑子', 300, 1130, { size: 40, color: C.gold }); ctx.restore();
    ctx.save(); ctx.globalAlpha *= la(tFlare); label(ctx, '色球层：耀斑', 830, 1000, { size: 40, color: '#ffb3c0' }); ctx.restore();
    ctx.save(); ctx.globalAlpha *= la(tSpot); label(ctx, '日冕层', 170, 900, { size: 36, color: '#e6ecff' }); ctx.restore();
  });
}

// ---------- scene 10: wrap-up ----------
function outroScene(ctx, t) {
  const t0 = S('sum'), tBye = S('kidBye'), tSun = S('sunBye'), tGlass = at('sunBye', '滤光镜');
  title(ctx, t, t0, '一句话记住', '看起来黑，不等于黑洞', { size: 88, color: C.gold, subColor: C.white });
  const sx = 600, sy = 830, sr = 210;
  const sIn = pop(t, t0 - 0.1, 0.5);
  around(ctx, sx, sy, sIn, sIn, () => sunBuddy(ctx, t, sx, sy, sr, {
    talk: talkLevel(t, ['sunBye']), mood: 'happy', look: t > tBye ? -0.8 : 0,
    inside: () => diskSpots(ctx, 0, sx, sy, sr, SPOTS),
  }));
  [['较冷', at('sum', '较冷'), C.sky, [250, 600]], ['较暗', at('sum', '较暗'), '#d9a26a', [900, 600]], ['仍在发光', at('sum', '发光'), C.gold, [890, 1090]]]
    .forEach(([s, t1, col, [x, y]]) => {
      const p = pop(t, t1 - 0.1, 0.45);
      around(ctx, x, y, p, p, () => tag(ctx, x, y, s, null, { color: col, size: 50 }));
    });

  // 小宇 floats in, then puts on solar-filter glasses
  const k = easeOut(prog(t, tBye - 0.5, tBye + 0.4));
  if (k > 0) {
    const kx = lerp(-200, 230, k), ky = 1170, s = 0.72;
    astronaut(ctx, t, kx, ky, s, { talk: talkLevel(t, ['kidBye']), look: 1, lookY: -0.6, mood: t > tSun ? 'starry' : 'happy', wave: t > tSun + 0.3 ? 1 : 0 });
    const bob = Math.sin(t * 1.8) * 10 * s;
    const fr = 58 * s;
    sunglasses(ctx, kx + 6 * s, ky + bob + 20 * s - fr * 0.14, fr, easeOut(prog(t, tGlass - 0.2, tGlass + 0.3)));
  }
  burst(ctx, t, tGlass + 0.2, 230, 1150, { n: 10, r: 240 });
  confetti(ctx, t, tSun + 2.4);
}

export const scenes = [
  { id: 'cycle', from: S('cycle') - 0.25, to: S('exam') - 0.25, draw: cycleScene },
  { id: 'exam', from: S('exam') - 0.25, to: S('sum') - 0.25, draw: examScene },
  { id: 'outro', from: S('sum') - 0.25, to: Infinity, draw: outroScene },
];

export const events = [
  ...[...Array(8)].map((_, i) => ({ type: 'pop', t: at('cycle', '多') + i * 0.06, f: 700 + i * 90, amp: 0.5 })),
  { type: 'whoosh', t: S('years') - 0.2, d: 0.5, from: 600, to: 2000 },
  ...[0, 1, 2].map((i) => ({ type: 'note', t: S('years') + 0.1 + i * 0.55, n: [67, 74, 67][i] })),
  { type: 'scribble', t: at('years', '十一年') - 0.4, d: 0.6 },
  { type: 'ding', t: at('years', '十一年'), n: 84 },
  ...[0, 0.45, 0.9, 1.5, 2.2].map((d) => ({ type: 'whoosh', t: at('mark', '耀斑') - 0.25 + d, d: 0.25, from: 3000, to: 900, amp: 0.4 })),
  { type: 'stamp', t: at('mark', '标志') - 0.1 },
  { type: 'alarm', t: S('exam') },
  ...['黑子', '耀斑', '十一年'].map((w, i) => ({ type: 'note', t: at('exam', w) - 0.1, n: 76 + i * 3 })),
  ...['较冷', '较暗', '发光'].map((w, i) => ({ type: 'pop', t: at('sum', w) - 0.1, f: 600 + i * 150 })),
  { type: 'boing', t: S('kidBye') - 0.3 },
  { type: 'sparkle', t: at('sunBye', '滤光镜') + 0.1 },
  { type: 'tada', t: S('sunBye') + 2.4 },
  { type: 'confetti', t: S('sunBye') + 2.4 },
];
