// Props for the sun-angle experiment: energy beans, parallel beams on flat ground, ground tiles, the torch and small icons.
import { C, TAU, clamp, lerp, prog, easeOut, txt } from './lib.mjs';
import { face, glow } from './cast.mjs';

const INK = '#0a0828';

// Energy bean: a glowing golden jelly bean with a tiny face.
export function bean(ctx, t, x, y, r, o = {}) {
  const { a = 1, mood = 'happy', rot = 0, squash = 0 } = o;
  if (a <= 0 || r <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  glow(ctx, x, y, r * 0.4, r * 2.3, 'rgba(255,220,90,0.42)');
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1 + squash * 0.3, 1 - squash * 0.3);
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r * 1.1);
  g.addColorStop(0, '#fffbe0'); g.addColorStop(0.5, '#ffd84a'); g.addColorStop(1, '#ff9f1c');
  ctx.fillStyle = g; ctx.strokeStyle = INK; ctx.lineWidth = Math.max(3, r * 0.12);
  ctx.beginPath(); ctx.ellipse(0, 0, r * 0.86, r, 0, 0, TAU); ctx.fill(); ctx.stroke();
  face(ctx, t, 0, r * 0.1, r * 0.55, { mood, ink: '#5a2a00' });
  ctx.restore();
}

// Parallel beam of cross-section width w, travelling down-right at elevation `elev` (radians above the ground),
// hitting flat ground y=gy centred on cx. A point at offset u across the beam lands at x = cx - u / sin(elev).
export function beamGeom(cx, gy, elev, w, len) {
  const d = [Math.cos(elev), Math.sin(elev)], n = [-Math.sin(elev), Math.cos(elev)];
  const sc = [cx - d[0] * len, gy - d[1] * len];
  const half = w / 2 / Math.sin(elev);
  return { d, n, w, len, elev, cx, gy, sc, f1: cx - half, f2: cx + half };
}
export const beamAt = (g, u, s) => [g.sc[0] + g.n[0] * u + g.d[0] * s, g.sc[1] + g.n[1] * u + g.d[1] * s];
export const landS = (g, u) => g.len - (Math.cos(g.elev) * u) / Math.sin(g.elev);

function beamPath(ctx, g) {
  const h = g.w / 2;
  ctx.beginPath();
  for (const [u, s] of [[-h, 0], [h, 0], [h, landS(g, h)], [-h, landS(g, -h)]]) ctx.lineTo(...beamAt(g, u, s));
  ctx.closePath();
}

// Golden beam with travelling wavefront ripples. reveal ∈ [0,1] grows the beam from its source to the ground.
export function drawBeam(ctx, t, g, o = {}) {
  const { a = 1, reveal = 1, ripples = true, bar = 1, glowA = 1 } = o;
  if (a <= 0 || reveal <= 0) return;
  const maxS = Math.max(landS(g, g.w / 2), landS(g, -g.w / 2)), sF = reveal * maxS + 1, big = g.w * 3;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  beamPath(ctx, g); ctx.clip();
  ctx.beginPath();
  for (const [u, s] of [[-big, 0], [big, 0], [big, sF], [-big, sF]]) ctx.lineTo(...beamAt(g, u, s));
  ctx.closePath(); ctx.clip();
  const [x0, y0] = beamAt(g, 0, 0), [x1, y1] = beamAt(g, 0, g.len);
  const lg = ctx.createLinearGradient(x0, y0, x1, y1);
  lg.addColorStop(0, `rgba(255,214,90,${0.32 * glowA})`); lg.addColorStop(1, `rgba(255,200,70,${0.72 * glowA})`);
  ctx.fillStyle = lg; ctx.fillRect(0, 0, 1080, 1920);
  if (ripples) {
    ctx.strokeStyle = 'rgba(255,252,230,0.7)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let s = ((t * 140) % 90) - 90; s < maxS; s += 90) {
      ctx.beginPath(); ctx.moveTo(...beamAt(g, -g.w / 2, s)); ctx.lineTo(...beamAt(g, g.w / 2, s)); ctx.stroke();
    }
  }
  ctx.strokeStyle = 'rgba(255,236,160,0.95)'; ctx.lineWidth = 4;
  for (const u of [-g.w / 2, g.w / 2]) {
    ctx.beginPath(); ctx.moveTo(...beamAt(g, u, 0)); ctx.lineTo(...beamAt(g, u, landS(g, u))); ctx.stroke();
  }
  ctx.restore();
  if (bar > 0) crossBar(ctx, g, bar * a);
}

// Cyan bar marking the beam's cross-section width at its source.
export function crossBar(ctx, g, a = 1, label = '同样宽') {
  if (a <= 0) return;
  const [ax, ay] = beamAt(g, -g.w / 2, 0), [bx, by] = beamAt(g, g.w / 2, 0);
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.strokeStyle = INK; ctx.lineWidth = 18; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
  ctx.strokeStyle = C.gas; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
  if (label) {
    const [lx, ly] = beamAt(g, 0, -46);
    txt(ctx, label, lx, ly, { size: 34, color: C.gas, stroke: INK, sw: 8 });
  }
  ctx.restore();
}

// Where the n beans of a batch (spread evenly across the beam) land, and how long each takes.
export function beanSlots(g, n = 8) {
  return [...Array(n)].map((_, i) => {
    const u = -g.w / 2 + (g.w * (i + 0.5)) / n;
    return { u, L: landS(g, u), x: g.cx - u / Math.sin(g.elev) };
  });
}

// A batch of n beans released together at t0 from the cross-section, flying at speed v until they land on the ground.
export function beanBatch(ctx, t, g, t0, o = {}) {
  const { n = 8, r = 24, v = 520, a = 1, mood = 'happy', landedMood = mood } = o;
  for (const b of beanSlots(g, n)) {
    const s = Math.min(b.L, Math.max(0, (t - t0) * v));
    const landed = s >= b.L, tl = t0 + b.L / v;
    if (landed) {
      const sq = Math.exp(-(t - tl) * 7) * Math.abs(Math.cos((t - tl) * 18));
      bean(ctx, t, b.x, g.gy - r * 0.95, r, { a, mood: landedMood, squash: sq });
    } else {
      const [x, y] = beamAt(g, b.u, s);
      bean(ctx, t, x, y, r, { a, mood, rot: g.elev - Math.PI / 2 });
    }
  }
}
export const landTimes = (g, t0, n = 8, v = 520) => beanSlots(g, n).map((b) => t0 + b.L / v);

// Flat ground with a row of square tiles of size sq aligned to ox; tiles inside [lit1, lit2] glow by `heat`.
export function ground(ctx, t, x0, x1, gy, sq, ox, o = {}) {
  const { lit1 = 0, lit2 = 0, heat = 0, faces = false, hotMood = 'starry', coolMood = 'happy', counts = null, countA = 0 } = o;
  ctx.save();
  const sg = ctx.createLinearGradient(0, gy, 0, gy + 150);
  sg.addColorStop(0, '#7a4e2c'); sg.addColorStop(1, 'rgba(60,34,22,0)');
  ctx.fillStyle = sg; ctx.fillRect(x0, gy, x1 - x0, 150);
  const k0 = Math.floor((x0 - ox) / sq), k1 = Math.ceil((x1 - ox) / sq);
  let ci = 0;
  for (let k = k0; k < k1; k++) {
    const a = ox + k * sq, b = a + sq, inside = a >= lit1 - 1 && b <= lit2 + 1;
    const h = inside ? heat : 0;
    ctx.fillStyle = `rgb(${lerp(166, 255, h) | 0},${lerp(116, 170, h) | 0},${lerp(72, 60, h) | 0})`;
    ctx.strokeStyle = INK; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.roundRect(Math.max(a, x0) + 3, gy + 3, Math.min(b, x1) - Math.max(a, x0) - 6, 54, 12); ctx.fill(); ctx.stroke();
    if (inside && h > 0) glow(ctx, (a + b) / 2, gy + 20, 10, sq * 0.75, `rgba(255,190,80,${0.45 * h})`);
    if (faces && inside && b <= x1 && a >= x0) face(ctx, t, (a + b) / 2, gy + 32, 26, { mood: h > 0.7 ? hotMood : coolMood, ink: '#3b1d0c' });
    if (counts && inside && countA > 0) {
      const p = easeOut(clamp(countA - ci * 0.12));
      if (p > 0) txt(ctx, `${counts}颗`, (a + b) / 2, gy + 110, { size: 44 * (0.6 + 0.4 * p), color: C.gold, stroke: INK, sw: 8 });
      ci++;
    }
  }
  ctx.strokeStyle = 'rgba(255,230,180,0.5)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x1, gy); ctx.stroke();
  ctx.restore();
}

// Bracket under the ground spanning [a,b] with a label.
export function spanBracket(ctx, a, b, y, label, p = 1, color = C.gas) {
  if (p <= 0) return;
  const m = (a + b) / 2, h = ((b - a) / 2) * easeOut(p);
  ctx.save();
  ctx.globalAlpha *= clamp(p * 1.5);
  ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(m - h, y - 18); ctx.lineTo(m - h, y); ctx.lineTo(m + h, y); ctx.lineTo(m + h, y - 18); ctx.stroke();
  if (label) txt(ctx, label, m, y + 44, { size: 40, color, stroke: INK, sw: 8 });
  ctx.restore();
}

// Angle arc at (x,y) between the ground (pointing right→left) and the incoming beam.
export function angleMark(ctx, x, y, elev, r, label, a = 1) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.strokeStyle = C.pink; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(x, y, r, Math.PI, Math.PI + elev); ctx.stroke();
  if (label) txt(ctx, label, x - Math.cos(elev / 2) * (r + 50), y - Math.sin(elev / 2) * (r + 50), { size: 36, color: C.pink, stroke: INK, sw: 8 });
  ctx.restore();
}

// Flashlight held at its tail (x,y), pointing along ang. Returns the centre of its lens.
export function torch(ctx, x, y, ang, len = 170) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang);
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineJoin = 'round';
  ctx.fillStyle = '#ff5d73';
  ctx.beginPath(); ctx.roundRect(-10, -22, len * 0.7, 44, 14); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffd166';
  ctx.beginPath(); ctx.moveTo(len * 0.62, -22); ctx.lineTo(len, -38); ctx.lineTo(len, 38); ctx.lineTo(len * 0.62, 22); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fffbe0';
  ctx.beginPath(); ctx.ellipse(len, 0, 9, 34, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.fillRect(len * 0.18, -8, 26, 16);
  ctx.restore();
  return [x + Math.cos(ang) * len, y + Math.sin(ang) * len];
}

export function lockIcon(ctx, x, y, s, open = 0, color = C.gold) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = INK; ctx.lineWidth = 16; ctx.lineCap = 'round';
  const lift = open * 24;
  const shackle = () => {
    ctx.beginPath(); ctx.moveTo(-22, -14 - lift); ctx.lineTo(-22, -38 - lift);
    ctx.arc(0, -38 - lift, 22, Math.PI, TAU); ctx.lineTo(22, open > 0.5 ? -34 - lift : -14); ctx.stroke();
  };
  shackle();
  ctx.strokeStyle = '#d6dcf5'; ctx.lineWidth = 8;
  shackle();
  ctx.fillStyle = color; ctx.strokeStyle = INK; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.roundRect(-34, -18, 68, 52, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0, 4, 7, 0, TAU); ctx.fill();
  ctx.restore();
}

// Clock face whose hand sweeps `turns` full turns.
export function clockIcon(ctx, x, y, r, turns = 0, color = C.sky) {
  ctx.save();
  ctx.fillStyle = '#fff'; ctx.strokeStyle = INK; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = color;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78, r * 0.05, 0, TAU); ctx.fill();
  }
  ctx.strokeStyle = INK; ctx.lineCap = 'round';
  const hand = (ang, l, w) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang) * l, y + Math.sin(ang) * l); ctx.stroke(); };
  hand(-Math.PI / 2 + turns * TAU / 12, r * 0.45, 9);
  hand(-Math.PI / 2 + turns * TAU, r * 0.7, 6);
  ctx.restore();
}
