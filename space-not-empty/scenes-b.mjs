// Scenes 3–4: how thin is it? (a sugar cube of air vs ten cubes of space) and "very thin ≠ nothing at all".
import { C, TAU, rnd, S, E, at, prog, lerp, easeOut, easeIO, pop, fadeIn, txt, around, burst, talkLevel, shakeOf } from './lib.mjs';
import { astronaut, gasDot, atomBuddy, glow } from './cast.mjs';
import { title, tag, stamp, cube, neqSign } from './props.mjs';

const INK = '#0a0828';

// "约 10¹⁹ 个分子" with a proper superscript.
function power(ctx, x, y, size, color) {
  ctx.save();
  ctx.font = `${size}px YuanB, RoundB, UniB, HiraGB`;
  const a = '约 10', b = '19', c = ' 个分子';
  const wa = ctx.measureText(a).width, wc = ctx.measureText(c).width;
  ctx.font = `${size * 0.55}px YuanB, RoundB, UniB, HiraGB`;
  const wb = ctx.measureText(b).width;
  ctx.restore();
  const x0 = x - (wa + wb + wc) / 2;
  txt(ctx, a, x0, y, { size, color, align: 'left', stroke: INK, sw: 10 });
  txt(ctx, b, x0 + wa, y - size * 0.38, { size: size * 0.55, color, align: 'left', stroke: INK, sw: 8 });
  txt(ctx, c, x0 + wa + wb, y, { size, color, align: 'left', stroke: INK, sw: 10 });
}

// ---------- scene 3: sugar cube comparison ----------
const CROWD = [...Array(260)].map((_, i) => [rnd(i + 5), rnd(i + 400), rnd(i + 800)]);
const GRID = [...Array(10)].map((_, i) => [205 + (i % 5) * 168, 1060 + Math.floor(i / 5) * 205]);
// the lone atom's wander path through the ten cubes
const PATH = [0, 1, 6, 7, 2, 3, 8, 9, 4];

function densityScene(ctx, t) {
  const tQ = S('kidHow'), tCube = at('cube', '方糖'), tAir = S('air'), tPack = at('air', '挤'), tBig = at('air', '一千亿亿');
  const tIsm = S('ism'), tTen = at('ism', '十块方'), tOne = at('ism', '一个原子');
  title(ctx, t, tQ, '到底有多稀？', '拿一块小方糖来比一比', { t1: tIsm - 0.3 });
  title(ctx, t, tIsm, '空气 vs 星际介质', '同样比方糖，差得太远了', { size: 72, subColor: C.gas });
  // 小宇 scratches his helmet, then drifts away
  const aside = easeIO(prog(t, tCube - 0.5, tCube + 0.2)), kOut = easeIO(prog(t, tAir - 0.4, tAir + 0.6));
  const kq = pop(t, tQ + 0.3, 0.4) * (1 - aside);
  astronaut(ctx, t, lerp(lerp(540, 190, aside), -260, kOut), lerp(950, 1230, aside), lerp(1.1, 0.7, aside), {
    talk: talkLevel(t, ['kidHow']), scratch: 1 - prog(t, E('kidHow'), E('kidHow') + 0.4), arm: -0.7, lookY: -1, look: aside,
    mood: t > tCube ? 'wow' : 'happy',
  });
  around(ctx, 740, 660, kq, kq, () => txt(ctx, '？', 740, 660 + Math.sin(t * 4) * 10, { size: 140, color: C.gold, stroke: INK, sw: 12 }), 0.2);
  // the sugar cube → a glass cube of Earth air
  const cp = pop(t, tCube - 0.1, 0.5);
  const toCorner = easeIO(prog(t, tIsm - 0.3, tIsm + 0.6));
  const cs = lerp(320, 200, toCorner) * cp;
  const cx = lerp(540, 270, toCorner), cy0 = lerp(820, 640, toCorner);
  const [jx, jy] = shakeOf(t, tBig, 16, 0.6);
  const glass = prog(t, tAir - 0.2, tAir + 0.4);
  if (cs > 1) {
    const cy = cy0 + jy;
    if (glass < 1) cube(ctx, cx + jx, cy, cs, { sugar: true });
    if (glass > 0) {
      ctx.save(); ctx.globalAlpha *= glass;
      cube(ctx, cx + jx, cy, cs, { edge: C.sky, tint: 'rgba(76,201,240,0.10)', top: 'rgba(76,201,240,0.16)' }, (p) => {
        const n = Math.floor(CROWD.length * easeOut(prog(t, tPack - 0.2, tPack + 0.9)));
        for (let i = 0; i < n; i++) {
          const [u, v, w] = CROWD[i];
          const [x, y] = p(u * 0.9 + 0.05 + Math.sin(t * 23 + i) * 0.012, v * 0.9 + 0.05 + Math.cos(t * 19 + i * 2) * 0.012, w * 0.9 + 0.05);
          ctx.fillStyle = i % 4 ? '#9bf0f4' : '#ffd08a';
          ctx.beginPath(); ctx.arc(x, y, cs * 0.014 + 1.5, 0, TAU); ctx.fill();
        }
      });
      ctx.restore();
    }
    const lp = fadeIn(t, tCube + 0.2, 0.4) * (1 - glass);
    if (lp > 0) tag(ctx, cx, cy0 + cs * 0.95, '1 立方厘米', '差不多一块小方糖', { a: lp, color: C.white, size: 50 });
    const ap = pop(t, tAir + 0.1, 0.45), ly = cy0 + cs * 0.95;
    around(ctx, cx, ly, ap, ap, () => tag(ctx, cx, ly, '地球上的空气', null, { color: C.sky, size: lerp(50, 40, toCorner) }));
  }
  // the crowd count
  const bp = pop(t, tBig - 0.05, 0.5);
  const bx = lerp(540, 270, toCorner), by = lerp(1275, 935, toCorner);
  around(ctx, bx, by, bp * lerp(1, 0.6, toCorner), bp, () => {
    power(ctx, bx, by - 40, 76, C.gold);
    ctx.save(); ctx.globalAlpha *= 1 - toCorner;
    txt(ctx, '= 一千亿亿个！', bx, by + 60, { size: 56, color: C.white, stroke: INK, sw: 10 });
    ctx.restore();
  });
  burst(ctx, t, tBig, 540, 1230, { n: 12, r: 360 });
  // ten cubes of the thinnest interstellar medium, holding a single atom between them
  if (t > tTen - 0.3) {
    GRID.forEach(([x, y], i) => {
      const k = pop(t, tTen + i * 0.07, 0.4);
      around(ctx, x, y, k, k, () => cube(ctx, x, y, 130, { edge: 'rgba(255,255,255,0.75)', tint: 'rgba(160,140,255,0.08)', lw: 4 }));
    });
    const op = prog(t, tOne - 0.2, E('kidLonely') + 2);
    const seg = op * (PATH.length - 1), i0 = Math.min(PATH.length - 2, Math.floor(seg)), f = easeIO(seg - i0);
    const [ax, ay] = GRID[PATH[i0]], [bx, by] = GRID[PATH[i0 + 1]];
    const ap = pop(t, tOne - 0.15, 0.5);
    const x = lerp(ax, bx, f), y = lerp(ay, by, f) - 10;
    if (ap > 0) {
      glow(ctx, x, y, 0, 70 * ap, 'rgba(92,225,230,0.5)');
      gasDot(ctx, x, y, 14 * ap);
      ctx.save(); ctx.globalAlpha *= Math.min(1, ap);
      ctx.strokeStyle = C.gas; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -t * 30;
      ctx.beginPath(); ctx.arc(x, y, 46, 0, TAU); ctx.stroke();
      ctx.restore();
    }
    const lp = pop(t, tTen - 0.1, 0.45);
    around(ctx, 780, 600, lp, lp, () => tag(ctx, 780, 600, '星际介质', '最稀的地方', { color: C.gas, size: 50 }));
    const op1 = pop(t, tOne + 0.1, 0.45);
    around(ctx, 780, 760, op1, op1, () => {
      txt(ctx, '10 块方糖', 780, 730, { size: 52, color: C.white, stroke: INK, sw: 10 });
      txt(ctx, '才约 1 个原子', 780, 800, { size: 58, color: C.gas, stroke: INK, sw: 10 });
    });
  }
}

// ---------- scene 4: the lonely atom, then "very thin ≠ nothing" ----------
const L = [290, 800], R = [790, 800];

function thinScene(ctx, t) {
  const t0 = S('kidLonely'), tNo = S('notZero'), tHave = at('notZero', '也是有');
  const tNeq = at('neq', '完全没有'), tEnd = at('neq', '一回事');
  title(ctx, t, t0 + 0.2, '这不就等于没有？', '一个原子，孤零零的…', { subColor: C.gas, t1: tNo - 0.2 });
  title(ctx, t, tNo, '少，也是有！', '比较同样大小的空间', { subColor: C.mint, t1: tEnd - 0.3 });
  const split = easeIO(prog(t, tNo - 0.1, tNo + 0.7));
  // two equal cubes slide in for the comparison
  for (const [[x, y], k] of [[L, 0], [R, 1]]) {
    const p = pop(t, tNo + k * 0.2, 0.5);
    around(ctx, x, y, p, p, () => cube(ctx, x, y, 300, { edge: k ? 'rgba(255,255,255,0.55)' : C.gas, tint: 'rgba(160,140,255,0.07)' }));
  }
  // the lonely atom: alone and sad, then cheered up once it counts
  const happy = t > tHave - 0.1;
  const [jx, jy] = shakeOf(t, tHave, 10, 0.4);
  const ax = lerp(540, L[0], split) + Math.sin(t * 0.9) * lerp(60, 18, split) + jx;
  const ay = lerp(760, L[1] - 20, split) + Math.cos(t * 1.1) * lerp(30, 14, split) + jy;
  atomBuddy(ctx, t, ax, ay, lerp(90, 52, split), { mood: happy ? 'wow' : 'sad', look: split > 0.5 ? 1 : 0, a: fadeIn(t, t0 - 0.2, 0.4) });
  const dots = fadeIn(t, t0 + 0.6, 0.3) * (1 - split);
  if (dots > 0) {
    ctx.save(); ctx.globalAlpha *= dots;
    txt(ctx, '…', ax + 140, ay - 90 + Math.sin(t * 3) * 6, { size: 90, color: C.white });
    ctx.restore();
  }
  burst(ctx, t, tHave, L[0], L[1], { n: 10, r: 220, colors: [C.mint, C.gas, C.gold] });
  const hp = pop(t, tHave, 0.45);
  around(ctx, L[0] + 120, L[1] - 190, hp, hp, () => stamp(ctx, L[0] + 120, L[1] - 190, '有！', 1, { color: C.mint, size: 64, rot: 0.12 }));
  // labels under the cubes
  const lb = fadeIn(t, tNo + 0.5, 0.4);
  if (lb > 0) {
    tag(ctx, L[0], 1110, '非常稀薄', '有，但很少', { a: lb, color: C.gas, size: 52 });
    tag(ctx, R[0], 1110, '完全没有', '一个也没有', { a: lb, color: 'rgba(255,255,255,0.8)', size: 52 });
  }
  neqSign(ctx, 540, 800, 0.9, pop(t, tNeq - 0.1, 0.5));
  burst(ctx, t, tNeq, 540, 800, { n: 10, r: 200, colors: [C.no, C.gold] });
  stamp(ctx, 540, 360, '非常稀薄 ≠ 完全没有', pop(t, tEnd - 0.2, 0.5), { color: C.gold, size: 70, rot: -0.04 });
  // 小宇 asks his question from the corner, then floats off
  const kOut = easeIO(prog(t, tNo - 0.2, tNo + 0.6));
  astronaut(ctx, t, lerp(220, -200, kOut), 1180, 0.75, { talk: talkLevel(t, ['kidLonely']), look: 1, lookY: -1, mood: 'wow', arm: -0.6 });
}

export const scenes = [
  { id: 'density', from: S('kidHow') - 0.3, to: S('kidLonely') - 0.3, draw: densityScene },
  { id: 'thin', from: S('kidLonely') - 0.3, to: S('uneven') - 0.3, draw: thinScene },
];

export const events = [
  { type: 'boing', t: S('kidHow') + 0.3, amp: 0.7 },
  { type: 'pop', t: at('cube', '方糖') - 0.05, f: 650 },
  { type: 'ding', t: S('air') + 0.1, n: 91, amp: 0.7 },
  { type: 'scribble', t: at('air', '挤') - 0.1, d: 1.3 },
  ...[...Array(10)].map((_, i) => ({ type: 'pop', t: at('air', '挤') + i * 0.09, f: 500 + i * 70, amp: 0.4 })),
  { type: 'slam', t: at('air', '一千亿亿') },
  { type: 'sparkle', t: at('air', '一千亿亿') + 0.1 },
  ...[...Array(10)].map((_, i) => ({ type: 'note', t: at('ism', '十块方') + i * 0.07, n: 72 + i, amp: 0.6 })),
  { type: 'ding', t: at('ism', '一个原子') - 0.1, n: 96 },
  { type: 'boing', t: S('kidLonely') + 0.2, amp: 0.5 },
  { type: 'pop', t: S('notZero'), f: 700 }, { type: 'pop', t: S('notZero') + 0.2, f: 900 },
  { type: 'stamp', t: at('notZero', '也是有') },
  { type: 'tada', t: at('notZero', '也是有') + 0.1, amp: 0.6 },
  { type: 'slam', t: at('neq', '完全没有') - 0.05 },
  { type: 'stamp', t: at('neq', '一回事') - 0.2 },
];
