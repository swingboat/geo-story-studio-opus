// Large-scale cosmic drawings: the eight planets, the Milky Way disk, other galaxies, the observation circle.
import { C, clamp } from './lib.mjs';
import { glow, earth } from './bodies.mjs';

const TAU = Math.PI * 2;
export function rnd(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ---------- planets ----------
// Illustrative orbit radii (not to scale) and looks, Mercury → Neptune.
export const PLANETS = [
  { name: '水星', r: 9, orbit: 120, col: ['#c9c3bb', '#8f877d'], speed: 1.6 },
  { name: '金星', r: 14, orbit: 165, col: ['#fff0c2', '#d9b46a'], speed: 1.2 },
  { name: '地球', r: 16, orbit: 215, col: null, speed: 1.0 },
  { name: '火星', r: 12, orbit: 262, col: ['#ff9a6b', '#c4492b'], speed: 0.8 },
  { name: '木星', r: 34, orbit: 330, col: ['#f3d2a2', '#c58a55'], speed: 0.45, bands: true },
  { name: '土星', r: 28, orbit: 395, col: ['#f7e3a8', '#cfa85c'], speed: 0.33, ring: true },
  { name: '天王星', r: 20, orbit: 450, col: ['#c9f5f5', '#6fc8d6'], speed: 0.24 },
  { name: '海王星', r: 19, orbit: 500, col: ['#8fb6ff', '#3359d6'], speed: 0.18 },
];

export function planet(ctx, t, x, y, p) {
  if (!p.col) { earth(ctx, t, x, y, p.r, { face: false, light: Math.atan2(-y, -x) }); return; }
  const r = p.r;
  if (p.ring) {
    ctx.save();
    ctx.strokeStyle = 'rgba(240,220,160,0.75)'; ctx.lineWidth = r * 0.22;
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.9, r * 0.6, -0.35, Math.PI, TAU); ctx.stroke();
    ctx.restore();
  }
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, p.col[0]); g.addColorStop(1, p.col[1]);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  if (p.bands) {
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
    ctx.fillStyle = 'rgba(160,90,50,0.45)';
    for (const k of [-0.45, 0.05, 0.5]) ctx.fillRect(x - r, y + k * r, 2 * r, r * 0.16);
    ctx.fillStyle = 'rgba(200,80,60,0.8)';
    ctx.beginPath(); ctx.ellipse(x + r * 0.3, y + r * 0.32, r * 0.18, r * 0.1, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  if (p.ring) {
    ctx.save();
    ctx.strokeStyle = 'rgba(240,220,160,0.85)'; ctx.lineWidth = r * 0.22;
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.9, r * 0.6, -0.35, 0, Math.PI); ctx.stroke();
    ctx.restore();
  }
}

// ---------- the Milky Way: an original two-armed barred-spiral sketch made of star particles ----------
const MW = [];
for (let i = 0; i < 1600; i++) {
  const arm = i % 4, u = Math.pow(rnd(i * 3 + 1), 0.8);
  const a = arm * (Math.PI / 2) + u * 4.2 + (rnd(i * 3 + 2) - 0.5) * 0.32 * (1 - u * 0.4);
  const d = 0.12 + 0.88 * u;
  const j = (rnd(i * 7 + 5) - 0.5) * 0.06;
  const hot = rnd(i * 11 + 3);
  MW.push({ x: Math.cos(a) * d + j, y: Math.sin(a) * d + j, s: 0.6 + rnd(i * 5 + 4) * 1.6, u, hot, ph: rnd(i) * 6.28 });
}
for (let i = 0; i < 500; i++) {
  const a = rnd(i * 13 + 9) * TAU, d = Math.pow(rnd(i * 17 + 2), 1.6) * 0.32;
  MW.push({ x: Math.cos(a) * d * 1.3, y: Math.sin(a) * d * 0.8, s: 0.6 + rnd(i * 19) * 1.2, u: d, hot: 0.95, ph: rnd(i + 99) * 6.28 });
}

export function milkyWay(ctx, t, x, y, r, o = {}) {
  const { tilt = 0.62, rot = -0.35, a = 1 } = o;
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y); ctx.scale(1, tilt); ctx.rotate(rot);
  glow(ctx, 0, 0, 0, r * 1.08, 'rgba(110,120,230,0.22)');
  glow(ctx, 0, 0, 0, r * 0.55, 'rgba(190,150,255,0.18)');
  for (const p of MW) {
    const tw = 0.65 + 0.35 * Math.sin(t * 2.5 + p.ph);
    const col = p.hot > 0.9 ? '255,226,170' : p.hot > 0.6 ? '200,215,255' : '160,190,255';
    ctx.fillStyle = `rgba(${col},${(1 - p.u * 0.4) * tw})`;
    const rr = Math.max(1, p.s * r / 380);
    ctx.beginPath(); ctx.arc(p.x * r, p.y * r, rr, 0, TAU); ctx.fill();
  }
  glow(ctx, 0, 0, 0, r * 0.26, 'rgba(255,236,190,0.95)');
  glow(ctx, 0, 0, 0, r * 0.1, 'rgba(255,255,240,1)');
  ctx.restore();
}
// Screen position of a point given in disk coordinates (u,v) ∈ [-1,1], matching milkyWay's transform.
export function onDisk(x, y, r, u, v, o = {}) {
  const { tilt = 0.62, rot = -0.35 } = o;
  const c = Math.cos(rot), s = Math.sin(rot);
  return [x + (u * c - v * s) * r, y + (u * s + v * c) * r * tilt];
}

// ---------- other galaxies ----------
export function spiral(ctx, x, y, r, o = {}) {
  const { tilt = 0.5, rot = 0, hue = '200,215,255', seed = 0 } = o;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, tilt);
  glow(ctx, 0, 0, 0, r, `rgba(${hue},0.22)`);
  ctx.fillStyle = `rgba(${hue},0.75)`;
  for (let arm = 0; arm < 2; arm++)
    for (let i = 0; i < 26; i++) {
      const u = i / 26, a = arm * Math.PI + u * 3.4 + seed, d = r * (0.15 + 0.8 * u);
      const rr = Math.max(0.8, r * 0.05 * (1 - u * 0.6));
      ctx.beginPath(); ctx.arc(Math.cos(a) * d, Math.sin(a) * d, rr, 0, TAU); ctx.fill();
    }
  glow(ctx, 0, 0, 0, r * 0.3, 'rgba(255,240,210,0.95)');
  ctx.restore();
}
export function elliptical(ctx, x, y, r, o = {}) {
  const { rot = 0, flat = 0.7, hue = '255,220,180' } = o;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, flat);
  glow(ctx, 0, 0, 0, r, `rgba(${hue},0.35)`);
  glow(ctx, 0, 0, 0, r * 0.45, `rgba(${hue},0.8)`);
  glow(ctx, 0, 0, 0, r * 0.15, 'rgba(255,255,240,1)');
  ctx.restore();
}
export function edgeOn(ctx, x, y, r, o = {}) {
  const { rot = 0, hue = '210,220,255' } = o;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, 0.16);
  glow(ctx, 0, 0, 0, r, `rgba(${hue},0.6)`);
  ctx.restore();
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(40,20,30,0.5)'; ctx.fillRect(-r * 0.8, -1.5, r * 1.6, 3);
  glow(ctx, 0, 0, 0, r * 0.22, 'rgba(255,240,210,0.95)');
  ctx.restore();
}

// A deterministic field of galaxies; `n` of them, scattered with radius up to `spread` around (cx,cy).
export const FIELD = [...Array(46)].map((_, i) => {
  const a = rnd(i * 3 + 7) * TAU, d = 0.18 + Math.sqrt(rnd(i * 5 + 1)) * 0.95;
  return { u: Math.cos(a) * d, v: Math.sin(a) * d, r: 22 + rnd(i * 7) * 38, kind: i % 3, rot: rnd(i * 9) * 3.1,
    tilt: 0.3 + rnd(i * 11) * 0.6, hue: ['200,215,255', '255,210,235', '255,225,180', '190,240,255'][i % 4], layer: rnd(i * 13 + 4) };
});
export function galaxyField(ctx, cx, cy, spread, a = 1, filter = () => true) {
  for (const g of FIELD) {
    if (!filter(g)) continue;
    const ga = clamp(a(g));
    if (ga <= 0) continue;
    ctx.save();
    ctx.globalAlpha *= ga;
    const x = cx + g.u * spread, y = cy + g.v * spread * 1.25;
    if (g.kind === 0) spiral(ctx, x, y, g.r, { tilt: g.tilt, rot: g.rot, hue: g.hue, seed: g.rot });
    else if (g.kind === 1) elliptical(ctx, x, y, g.r * 0.8, { rot: g.rot, flat: 0.5 + g.tilt * 0.5, hue: g.hue });
    else edgeOn(ctx, x, y, g.r, { rot: g.rot, hue: g.hue });
    ctx.restore();
  }
}

export function dashedCircle(ctx, x, y, r, p = 1, o = {}) {
  if (p <= 0) return;
  const { color = C.gold, w = 6, dash = [22, 18], off = 0 } = o;
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash(dash); ctx.lineDashOffset = off;
  // a full sweep that does not start at 0 renders nothing in @napi-rs/canvas, so close the circle from 0
  ctx.beginPath();
  if (p >= 1) ctx.arc(x, y, r, 0, TAU);
  else ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(p));
  ctx.stroke();
  ctx.restore();
}

// Small grey rocks scattered along a ring (asteroid-belt hint between Mars and Jupiter).
export function belt(ctx, t, cx, cy, rx, ry, a = 1) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(190,180,170,0.7)';
  for (let i = 0; i < 90; i++) {
    const ang = (i / 90) * TAU + rnd(i) * 0.06 + t * 0.05, k = 1 + (rnd(i + 5) - 0.5) * 0.08;
    ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * rx * k, cy + Math.sin(ang) * ry * k, 1.5 + rnd(i + 9) * 2, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
