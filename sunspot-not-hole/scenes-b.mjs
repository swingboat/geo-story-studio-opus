// Scenes 3–4: the spot sits on the photosphere (hot gas, not a shell or a hole); it is cooler, hence darker — but still thousands of degrees.
import { W, C, TAU, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, around, burst, card, talkLevel, shakeOf, arrow } from './lib.mjs';
import { astronaut, glow } from './cast.mjs';
import { title, tag } from './props.mjs';
import { sunBuddy } from './sun.mjs';
import { diskSpots, sunspot, granules, heatBar } from './spot.mjs';
import { umbrella, steam, label } from './gear.mjs';
import { SPOTS } from './scenes-a.mjs';

const INK = '#0a0828';
const DISK = [540, 860], DR = 300;
const PANEL = [110, 520, 860, 600];

// A cartoon pit (what a "hole" would look like) for the strike-through gag.
function pit(ctx, x, y, r) {
  ctx.save();
  ctx.fillStyle = '#05030f'; ctx.strokeStyle = '#3a3a5a'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.45, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(120,120,170,0.5)'; ctx.lineWidth = 3;
  for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(x, y + i * 6, r * (1 - i * 0.22), r * 0.45 * (1 - i * 0.22), 0, 0, Math.PI); ctx.stroke(); }
  ctx.restore();
}

function strike(ctx, x, y, s, p) {
  if (p <= 0) return;
  ctx.save(); ctx.lineCap = 'round';
  for (const [col, w] of [[INK, 30], [C.no, 18]]) {
    ctx.strokeStyle = col; ctx.lineWidth = w * s;
    ctx.beginPath(); ctx.moveTo(x - 70 * s, y - 70 * s); ctx.lineTo(x + lerp(-70, 70, p) * s, y + lerp(-70, 70, p) * s); ctx.stroke();
  }
  ctx.restore();
}

// Close-up of the photosphere with one big spot in the middle.
function closeUp(ctx, t, x, y, w, h, spotR) {
  granules(ctx, t, x, y, w, h, { cell: 52 });
  ctx.save();
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 30); ctx.clip();
  sunspot(ctx, x + w / 2, y + h / 2, spotR, { seed: 3 });
  ctx.restore();
  ctx.strokeStyle = C.gold; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 30); ctx.stroke();
}

// ---------- scene 3: on the photosphere ----------
function photoScene(ctx, t) {
  const t0 = S('photo'), tHole = at('photo', '不是洞'), tPh = at('photo', '光球'), tGas = S('gas');
  const tShell = at('gas', '硬壳'), tHot = at('gas', '炽热的气体');
  title(ctx, t, t0, '黑子不是洞', '它长在太阳的光球上', { size: 84, t1: tGas - 0.1 });
  title(ctx, t, tGas, '光球 = 看到的太阳表面', '一层炽热的气体', { size: 70 });

  // the whole disk, then we zoom into the big spot
  const z = easeIO(prog(t, tGas - 0.2, tGas + 0.7));
  const sp = SPOTS[0], fx = DISK[0] + sp.u * DR, fy = DISK[1] + sp.v * DR;
  if (z < 1) {
    ctx.save(); ctx.globalAlpha *= 1 - z;
    const k = lerp(1, 4, z);
    around(ctx, fx, fy, k, 1, () => {
      sunBuddy(ctx, t, DISK[0], DISK[1], DR, { faceA: 0, inside: () => diskSpots(ctx, 0, DISK[0], DISK[1], DR, SPOTS) });
    });
    ctx.restore();
    // "it's not a hole": a pit pops up beside the spot and gets struck out
    const pp = pop(t, tHole - 0.2, 0.4) * (1 - z);
    around(ctx, 230, 1180, pp, pp, () => {
      pit(ctx, 230, 1180, 90);
      label(ctx, '洞？', 230, 1080, { size: 50, color: C.white });
    });
    strike(ctx, 230, 1170, 1.1, prog(t, tHole + 0.1, tHole + 0.4) * (1 - z));
    const lp = pop(t, tPh - 0.15, 0.45) * (1 - z);
    around(ctx, 830, 1230, lp, lp, () => {
      arrow(ctx, 800, 1170, 720, 1090, { color: C.gold, w: 8, head: 28 });
      tag(ctx, 830, 1230, '光球', '太阳的可见表面', { color: C.gold, size: 52 });
    });
  }
  if (z > 0) {
    const [x, y, w, h] = PANEL;
    const cx = x + w / 2, cy = y + h / 2;
    around(ctx, cx, cy, lerp(0.25, 1, z), z, () => closeUp(ctx, t, x, y, w, h, 120));
    // rising gas puffs over the granules: it is gas, it boils
    const ga = fadeIn(t, tHot - 0.2, 0.4);
    for (let i = 0; i < 8 && ga > 0; i++) {
      const p = (t * 0.45 + i / 8) % 1, gx = x + 80 + ((i * 113) % (w - 160));
      glow(ctx, gx, y + h - p * h * 0.9, 0, 30, `rgba(255,255,220,${0.55 * ga * Math.sin(Math.PI * p)})`);
    }
    const c1 = pop(t, tShell - 0.15, 0.45), c2 = pop(t, tHot - 0.15, 0.45);
    around(ctx, 300, 1250, c1, c1, () => {
      card(ctx, 110, 1180, 380, 140, { fill: 'rgba(8,10,36,0.9)', edge: C.no, ew: 5, drop: 0 });
      txt(ctx, '固体硬壳', 300, 1250, { size: 50, color: '#ffb3c0' });
    });
    strike(ctx, 300, 1250, 1, prog(t, tShell + 0.2, tShell + 0.5));
    around(ctx, 780, 1250, c2, c2, () => {
      card(ctx, 590, 1180, 380, 140, { fill: 'rgba(8,10,36,0.9)', edge: C.mint, ew: 5, drop: 0 });
      txt(ctx, '炽热的气体', 780, 1250, { size: 50, color: C.mint });
    });
  }
}

// ---------- scene 4: cooler, so darker — yet still thousands of degrees ----------
function coolScene(ctx, t) {
  const t0 = S('why'), tCool = at('cool', '更冷'), t55 = at('cool', '五千五百'), tLow = at('cool', '一两千度');
  const tShade = S('shade'), tHot = S('hot'), tK = at('hot', '好几千');
  title(ctx, t, t0 - 0.1, '为什么它看起来黑？', null, { size: 76, t1: tCool - 0.2 });
  title(ctx, t, tCool - 0.1, '因为它比周围更冷', '“冷”是和周围光球比', { size: 80 });

  const [x, y, w] = [140, 520, 800], h = 340;
  closeUp(ctx, t, x, y, w, h, 95);
  // compare tags on the panel
  const a1 = pop(t, t55 - 0.2, 0.45), a2 = pop(t, tLow - 0.2, 0.45);
  around(ctx, 300, y + 60, a1, a1, () => tag(ctx, 300, y + 60, '周围光球', null, { color: C.gold, size: 40 }));
  around(ctx, 540, y + h - 50, a2, a2, () => tag(ctx, 540, y + h - 50, '黑子：更冷', null, { color: C.sky, size: 40 }));

  // two thermometers, then they make room for the gag
  const out = easeIO(prog(t, tShade - 0.4, tShade + 0.1));
  const thA = fadeIn(t, t55 - 0.3, 0.4) * (1 - out);
  if (thA > 0) {
    ctx.save(); ctx.globalAlpha *= thA;
    const lvA = easeOut(prog(t, t55 - 0.2, t55 + 0.8)) * 0.92;
    const lvB = easeOut(prog(t, tLow - 0.2, tLow + 0.8)) * 0.6;
    heatBar(ctx, 330, 1290, 330, lvA, '#ff8a3c');
    heatBar(ctx, 750, 1290, 330, lvB, '#ffc070');
    label(ctx, '约5500℃', 330, 1385, { size: 46, color: C.gold });
    if (lvB > 0.05) label(ctx, '低一两千度', 750, 1385, { size: 46, color: C.sky });
    ctx.restore();
  }

  // 小宇 brings a beach umbrella to "cool off" in the spot … and gets toasted
  const kid = easeOut(prog(t, tShade - 0.3, tShade + 0.4));
  if (kid > 0) {
    const toast = prog(t, tK - 0.1, tK + 0.4);
    const [jx, jy] = shakeOf(t, tK, 18, 0.6);
    const kx = lerp(-200, 330, kid) + jx, ky = 1150 + jy;
    umbrella(ctx, kx + 150, 1390, 0.8, easeOut(prog(t, tShade + 0.2, tShade + 0.7)));
    if (toast > 0) glow(ctx, kx, ky, 0, 260, `rgba(255,90,40,${0.45 * toast})`);
    astronaut(ctx, t, kx, ky, 0.62, {
      talk: talkLevel(t, ['shade']), look: 1, mood: toast > 0.5 ? 'wow' : 'happy',
      wave: t < tHot ? 1 : 0, scratch: toast > 0.5 ? 1 : 0,
    });
    steam(ctx, t, kx, ky - 160, toast);
    const sa = pop(t, tHot - 0.2, 0.45);
    around(ctx, 800, 1170, sa, sa, () => {
      sunBuddy(ctx, t, 800, 1170, 120, { talk: talkLevel(t, ['hot']), mood: 'wow', look: -0.8 });
    });
    const ka = pop(t, tK - 0.1, 0.45);
    around(ctx, 800, 1350, ka, ka, () => tag(ctx, 800, 1350, '仍有几千℃！', null, { color: C.no, size: 48 }));
  }
}

export const scenes = [
  { id: 'photo', from: S('photo') - 0.25, to: S('why') - 0.25, draw: photoScene },
  { id: 'cool', from: S('why') - 0.25, to: S('glow') - 0.25, draw: coolScene },
];

export const events = [
  { type: 'pop', t: at('photo', '不是洞') - 0.2, f: 420 },
  { type: 'scribble', t: at('photo', '不是洞') + 0.1, d: 0.35 },
  { type: 'stamp', t: at('photo', '光球') - 0.1 },
  { type: 'whoosh', t: S('gas') - 0.2, d: 0.8, from: 300, to: 2400 },
  { type: 'scribble', t: at('gas', '硬壳') + 0.2, d: 0.35 },
  { type: 'ding', t: at('gas', '炽热的气体'), n: 86 },
  ...[...Array(6)].map((_, i) => ({ type: 'tick', t: at('cool', '五千五百') - 0.2 + i * 0.12, n: 70 + i * 2 })),
  ...[...Array(4)].map((_, i) => ({ type: 'tick', t: at('cool', '一两千度') - 0.2 + i * 0.12, n: 72 - i * 2 })),
  { type: 'boing', t: S('shade') - 0.2 },
  { type: 'pop', t: S('shade') + 0.3, f: 900 },
  { type: 'alarm', t: at('hot', '好几千') - 0.1 },
  { type: 'wind', t: at('hot', '好几千'), d: 1.6 },
];
