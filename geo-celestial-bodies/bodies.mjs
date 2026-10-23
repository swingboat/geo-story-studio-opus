// Cartoon drawings: celestial bodies with faces, the kid astronaut, orbits, galaxies and tick/cross marks.
import { C, clamp, lerp } from './lib.mjs';

const TAU = Math.PI * 2;

function rnd(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Cute face centred at (x,y) for a body of radius r.
export function face(ctx, t, x, y, r, o = {}) {
  const { talk = 0, mood = 'happy', look = 0 } = o;
  const s = r / 100;
  const blink = (t + x * 0.001) % 3.7 < 0.12 ? 0.15 : 1;
  ctx.save();
  ctx.translate(x + look * 10 * s, y);
  ctx.fillStyle = C.ink;
  for (const k of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(k * 32 * s, -12 * s, 9 * s, 13 * s * blink, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(k * 32 * s + 3 * s, -17 * s, 3.5 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = C.ink;
  }
  ctx.fillStyle = 'rgba(255,110,140,0.45)';
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(k * 52 * s, 12 * s, 13 * s, 8 * s, 0, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = C.ink; ctx.fillStyle = '#7a1f2b'; ctx.lineWidth = 5 * s; ctx.lineCap = 'round';
  if (talk > 0.05 || mood === 'wow') {
    ctx.beginPath(); ctx.ellipse(0, 20 * s, 12 * s, (5 + 12 * Math.max(talk, mood === 'wow' ? 0.8 : 0)) * s, 0, 0, TAU); ctx.fill();
  } else if (mood === 'sad') {
    ctx.beginPath(); ctx.arc(0, 32 * s, 14 * s, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(0, 8 * s, 18 * s, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  }
  ctx.restore();
}

export function glow(ctx, x, y, r0, r1, color) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r1, 0, TAU); ctx.fill();
}

export function sun(ctx, t, x, y, r, o = {}) {
  glow(ctx, x, y, r * 0.8, r * 2.1, 'rgba(255,190,60,0.45)');
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(t * 0.4);
  ctx.fillStyle = C.sun;
  for (let i = 0; i < 12; i++) {
    ctx.rotate(TAU / 12);
    const len = r * (1.32 + 0.08 * Math.sin(t * 5 + i));
    ctx.beginPath(); ctx.moveTo(-r * 0.16, -r * 0.9); ctx.lineTo(0, -len); ctx.lineTo(r * 0.16, -r * 0.9); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#fff3a8'); g.addColorStop(0.6, C.sun); g.addColorStop(1, C.sunHot);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  if (o.spot) {
    ctx.fillStyle = 'rgba(120,50,10,0.75)';
    ctx.beginPath(); ctx.ellipse(x + r * 0.42, y + r * 0.35, r * 0.13, r * 0.1, 0.4, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + r * 0.58, y + r * 0.22, r * 0.07, r * 0.06, 0, 0, TAU); ctx.fill();
  }
  if (o.face !== false) face(ctx, t, x, y, r * 0.95, o);
}

// Side lit from `light` (angle pointing toward the light source); the far side is shaded.
function shade(ctx, x, y, r, light) {
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  const lx = Math.cos(light), ly = Math.sin(light);
  const g = ctx.createLinearGradient(x + lx * r, y + ly * r, x - lx * r, y - ly * r);
  g.addColorStop(0, 'rgba(255,255,255,0.18)');
  g.addColorStop(0.45, 'rgba(0,0,30,0)');
  g.addColorStop(0.75, 'rgba(0,0,30,0.45)');
  g.addColorStop(1, 'rgba(0,0,30,0.7)');
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  ctx.restore();
}

export function earth(ctx, t, x, y, r, o = {}) {
  const { light = Math.PI, spin = t * 0.25 } = o;
  glow(ctx, x, y, r * 0.95, r * 1.25, 'rgba(110,190,255,0.35)');
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  ctx.fillStyle = C.earth; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  ctx.fillStyle = C.land;
  const blobs = [[-0.4, -0.35, 0.38, 0.26], [0.35, 0.1, 0.3, 0.42], [-0.2, 0.5, 0.33, 0.18], [0.9, -0.5, 0.25, 0.2]];
  for (const [bx, by, rx, ry] of blobs) {
    const px = ((bx + spin) % 2.6 + 2.6) % 2.6 - 1.3;
    ctx.beginPath(); ctx.ellipse(x + px * r, y + by * r, rx * r, ry * r, 0.3, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath(); ctx.ellipse(x, y - r * 0.95, r * 0.5, r * 0.14, 0, 0, TAU); ctx.fill();
  ctx.restore();
  shade(ctx, x, y, r, light);
  if (o.face !== false) face(ctx, t, x, y + r * 0.05, r * 0.8, o);
}

export function moon(ctx, t, x, y, r, o = {}) {
  const { light = Math.PI } = o;
  ctx.fillStyle = C.moon;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.fillStyle = C.moonDark;
  for (const [cx, cy, cr] of [[-0.45, -0.4, 0.18], [0.4, -0.15, 0.13], [-0.1, 0.5, 0.15], [0.5, 0.45, 0.09]]) {
    ctx.beginPath(); ctx.arc(x + cx * r, y + cy * r, cr * r, 0, TAU); ctx.fill();
  }
  shade(ctx, x, y, r, light);
  if (o.face !== false) face(ctx, t, x, y + r * 0.05, r * 0.8, o);
}

// Comet head at (x,y); tail streams along `dir` (radians), away from the sun.
export function comet(ctx, t, x, y, r, dir, len) {
  ctx.save();
  for (let k = 0; k < 3; k++) {
    const spread = 0.5 + k * 0.22, L = len * (1 - k * 0.2);
    const g = ctx.createLinearGradient(x, y, x + Math.cos(dir) * L, y + Math.sin(dir) * L);
    g.addColorStop(0, k === 0 ? 'rgba(170,240,255,0.85)' : 'rgba(140,200,255,0.4)');
    g.addColorStop(1, 'rgba(140,200,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(dir + Math.PI / 2) * r * spread * 1.2, y + Math.sin(dir + Math.PI / 2) * r * spread * 1.2);
    ctx.quadraticCurveTo(x + Math.cos(dir) * L * 0.6, y + Math.sin(dir) * L * 0.6 + Math.sin(t * 3 + k) * 10,
      x + Math.cos(dir + 0.12 * (k - 1)) * L, y + Math.sin(dir + 0.12 * (k - 1)) * L);
    ctx.lineTo(x + Math.cos(dir - Math.PI / 2) * r * spread * 1.2, y + Math.sin(dir - Math.PI / 2) * r * spread * 1.2);
    ctx.closePath(); ctx.fill();
  }
  glow(ctx, x, y, r * 0.5, r * 2, 'rgba(180,240,255,0.6)');
  ctx.fillStyle = '#e8f7ff';
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.fillStyle = '#8a8fa8';
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(x + (rnd(i) - 0.5) * r * 1.2, y + (rnd(i + 7) - 0.5) * r * 1.2, r * 0.12, 0, TAU); ctx.fill(); }
  ctx.restore();
}

export function nebula(ctx, t, x, y, s) {
  const cols = ['rgba(255,95,170,0.5)', 'rgba(130,110,255,0.5)', 'rgba(60,210,230,0.42)', 'rgba(255,170,90,0.38)'];
  for (let i = 0; i < 14; i++) {
    const a = rnd(i) * TAU + t * 0.08 * (i % 2 ? 1 : -1);
    const d = rnd(i + 3) * 170 * s;
    glow(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.6, 0, (90 + rnd(i + 5) * 110) * s, cols[i % 4]);
  }
  for (let i = 0; i < 4; i++) {
    const tw = 0.6 + 0.4 * Math.sin(t * 4 + i * 2);
    const px = x + (rnd(i + 20) - 0.5) * 240 * s, py = y + (rnd(i + 30) - 0.5) * 150 * s;
    glow(ctx, px, py, 0, 26 * s * tw, 'rgba(255,255,255,0.9)');
  }
}

export function rock(ctx, x, y, r, rot = 0, heat = 0) {
  if (heat > 0) glow(ctx, x, y, r * 0.6, r * (1.6 + heat), `rgba(255,140,40,${0.7 * heat})`);
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU, rr = r * (0.8 + 0.25 * rnd(i + 40));
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = heat > 0.5 ? '#c96a3b' : '#8d7f73'; ctx.fill();
  ctx.strokeStyle = '#4c4038'; ctx.lineWidth = Math.max(2, r * 0.08); ctx.stroke();
  ctx.fillStyle = 'rgba(60,45,35,0.5)';
  ctx.beginPath(); ctx.arc(-r * 0.25, -r * 0.15, r * 0.18, 0, TAU); ctx.arc(r * 0.3, r * 0.25, r * 0.13, 0, TAU); ctx.fill();
  ctx.restore();
}

export function station(ctx, x, y, s, rot = 0) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = '#2f5fb3'; ctx.strokeStyle = '#9ec8ff'; ctx.lineWidth = 3;
  for (const k of [-1, 1]) {
    ctx.fillRect(k * 70 - (k < 0 ? 90 : 0), -34, 90, 68); ctx.strokeRect(k * 70 - (k < 0 ? 90 : 0), -34, 90, 68);
    for (let i = 1; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(k * 70 - (k < 0 ? 90 : 0) + i * 22.5, -34); ctx.lineTo(k * 70 - (k < 0 ? 90 : 0) + i * 22.5, 34); ctx.stroke();
    }
  }
  ctx.fillStyle = '#e9edf5';
  ctx.beginPath(); ctx.roundRect(-70, -16, 140, 32, 14); ctx.fill();
  ctx.beginPath(); ctx.roundRect(-18, -50, 36, 100, 14); ctx.fill();
  ctx.fillStyle = C.red;
  ctx.fillRect(-12, -6, 24, 12);
  ctx.restore();
}

export function galaxy(ctx, t, x, y, r, tilt = 0.45, hue = 0) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(1, tilt); ctx.rotate(t * 0.15);
  glow(ctx, 0, 0, 0, r * 1.05, hue ? 'rgba(255,170,220,0.22)' : 'rgba(150,170,255,0.25)');
  for (let arm = 0; arm < 2; arm++) {
    for (let i = 0; i < 70; i++) {
      const u = i / 70, a = arm * Math.PI + u * 3.6, d = r * (0.12 + 0.88 * u);
      const jx = (rnd(i + arm * 100) - 0.5) * r * 0.12, jy = (rnd(i + arm * 100 + 50) - 0.5) * r * 0.12;
      ctx.fillStyle = `rgba(${hue ? '255,210,240' : '210,225,255'},${0.9 - u * 0.6})`;
      ctx.beginPath(); ctx.arc(Math.cos(a) * d + jx, Math.sin(a) * d + jy, Math.max(1.2, r * 0.018 * (1 - u * 0.5)), 0, TAU); ctx.fill();
    }
  }
  glow(ctx, 0, 0, 0, r * 0.28, 'rgba(255,240,200,0.95)');
  ctx.restore();
}

export function orbit(ctx, cx, cy, rx, ry, p = 1, color = 'rgba(255,255,255,0.35)') {
  if (p <= 0) return;
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.setLineDash([10, 12]);
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(p)); ctx.stroke();
  ctx.restore();
}
export const onOrbit = (cx, cy, rx, ry, a) => [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];

export function tick(ctx, x, y, s, color = C.ok) {
  ctx.save();
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 40 * s, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 10 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - 18 * s, y + 1 * s); ctx.lineTo(x - 5 * s, y + 15 * s); ctx.lineTo(x + 20 * s, y - 14 * s); ctx.stroke();
  ctx.restore();
}
export function cross(ctx, x, y, s, color = C.no) {
  ctx.save();
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 40 * s, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 10 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 15 * s, y - 15 * s); ctx.lineTo(x + 15 * s, y + 15 * s);
  ctx.moveTo(x + 15 * s, y - 15 * s); ctx.lineTo(x - 15 * s, y + 15 * s); ctx.stroke();
  ctx.restore();
}

// The curious kid astronaut. (x,y) = feet; o.talk opens the mouth, o.wave raises an arm, o.think tilts the head.
export function kid(ctx, t, x, y, s, o = {}) {
  const { talk = 0, wave = 0, mood = 'happy', float = 1 } = o;
  const bob = Math.sin(t * 2.2) * 10 * float;
  ctx.save();
  ctx.translate(x, y + bob * s); ctx.scale(s, s);
  ctx.rotate(Math.sin(t * 1.3) * 0.05 * float);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // backpack
  ctx.fillStyle = '#c5cbe0';
  ctx.beginPath(); ctx.roundRect(-72, -190, 144, 120, 26); ctx.fill();
  // legs
  ctx.strokeStyle = '#eef1fa'; ctx.lineWidth = 34;
  ctx.beginPath(); ctx.moveTo(-26, -70); ctx.lineTo(-30, -14); ctx.moveTo(26, -70); ctx.lineTo(32, -14); ctx.stroke();
  ctx.fillStyle = '#5b6b9a';
  ctx.beginPath(); ctx.roundRect(-52, -22, 46, 24, 10); ctx.roundRect(8, -22, 46, 24, 10); ctx.fill();
  // body
  ctx.fillStyle = '#f6f8ff';
  ctx.beginPath(); ctx.roundRect(-58, -175, 116, 115, 40); ctx.fill();
  ctx.fillStyle = C.sunHot; ctx.fillRect(-58, -112, 116, 12);
  ctx.fillStyle = C.sky; ctx.beginPath(); ctx.roundRect(-22, -150, 44, 28, 6); ctx.fill();
  // arms
  ctx.strokeStyle = '#eef1fa'; ctx.lineWidth = 28;
  ctx.beginPath(); ctx.moveTo(-50, -150); ctx.lineTo(-84, -96); ctx.stroke();
  const wa = lerp(0.9, -0.9 + Math.sin(t * 10) * 0.35, clamp(wave));
  ctx.beginPath(); ctx.moveTo(50, -150); ctx.lineTo(50 + Math.cos(wa) * 62, -150 + Math.sin(wa) * 62); ctx.stroke();
  // helmet
  ctx.fillStyle = '#f6f8ff';
  ctx.beginPath(); ctx.arc(0, -250, 92, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffd7b5';
  ctx.beginPath(); ctx.arc(0, -246, 70, 0, TAU); ctx.fill();
  ctx.fillStyle = '#3a2c5c';
  ctx.beginPath(); ctx.arc(0, -262, 70, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
  ctx.restore();
  face(ctx, t, x, y + bob * s - 236 * s, 64 * s, { talk, mood });
  ctx.save();
  ctx.translate(x, y + bob * s); ctx.scale(s, s);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(0, -250, 80, Math.PI * 1.15, Math.PI * 1.45); ctx.stroke();
  ctx.strokeStyle = '#c5cbe0'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(0, -250, 92, 0, TAU); ctx.stroke();
  ctx.restore();
}
