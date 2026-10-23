// Cartoon celestial characters: faces, Moon, Sun with sunspots, nebula, Earth and space rocks.
import { C, clamp, rand } from './lib.mjs';

const TAU = Math.PI * 2;

// Cute face centred at (x,y) for a body of radius r. mood: happy | wow | sad | proud
export function face(ctx, t, x, y, r, o = {}) {
  const { talk = 0, mood = 'happy', look = 0, ink = C.ink } = o;
  const s = r / 100;
  const blink = (t + x * 0.0013) % 3.7 < 0.12 ? 0.15 : 1;
  ctx.save();
  ctx.translate(x + look * 10 * s, y);
  for (const k of [-1, 1]) {
    ctx.fillStyle = ink;
    ctx.beginPath(); ctx.ellipse(k * 32 * s, -12 * s, 9 * s, (mood === 'proud' ? 5 : 13) * s * blink, 0, 0, TAU); ctx.fill();
    if (mood !== 'proud') {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(k * 32 * s + 3 * s, -17 * s, 3.5 * s, 0, TAU); ctx.fill();
    }
  }
  ctx.fillStyle = 'rgba(255,110,140,0.45)';
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(k * 52 * s, 12 * s, 13 * s, 8 * s, 0, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = ink; ctx.fillStyle = '#7a1f2b'; ctx.lineWidth = 5 * s; ctx.lineCap = 'round';
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

// Side lit from `light` (angle pointing toward the light source); the far side is shaded.
function shade(ctx, x, y, r, light) {
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  const lx = Math.cos(light), ly = Math.sin(light);
  const g = ctx.createLinearGradient(x + lx * r, y + ly * r, x - lx * r, y - ly * r);
  g.addColorStop(0, 'rgba(255,255,255,0.18)');
  g.addColorStop(0.45, 'rgba(0,0,30,0)');
  g.addColorStop(0.75, 'rgba(0,0,30,0.4)');
  g.addColorStop(1, 'rgba(0,0,30,0.65)');
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  ctx.restore();
}

export function moon(ctx, t, x, y, r, o = {}) {
  const { light = Math.PI * 1.15 } = o;
  glow(ctx, x, y, r * 0.9, r * 1.4, 'rgba(220,230,255,0.25)');
  ctx.fillStyle = C.moon;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.fillStyle = C.moonDark;
  for (const [cx, cy, cr] of [[-0.45, -0.45, 0.18], [0.42, -0.2, 0.13], [-0.15, 0.55, 0.15], [0.55, 0.45, 0.09], [-0.65, 0.2, 0.08]]) {
    ctx.beginPath(); ctx.arc(x + cx * r, y + cy * r, cr * r, 0, TAU); ctx.fill();
  }
  shade(ctx, x, y, r, light);
  if (o.face !== false) face(ctx, t, x, y + r * 0.05, r * 0.8, o);
}

// Sunspot groups on the sun's disc, as fractions of r: [x, y, size]. Darker than surroundings, never pure black.
export const SPOTS = [[0.38, 0.3, 0.14], [0.55, 0.18, 0.07], [-0.45, -0.25, 0.09], [-0.34, -0.36, 0.05]];

export function sun(ctx, t, x, y, r, o = {}) {
  const { rays = true, spots = 0 } = o;
  glow(ctx, x, y, r * 0.8, r * 2.0, 'rgba(255,190,60,0.42)');
  if (rays) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(t * 0.3);
    ctx.fillStyle = C.sun;
    for (let i = 0; i < 12; i++) {
      ctx.rotate(TAU / 12);
      const len = r * (1.28 + 0.07 * Math.sin(t * 5 + i));
      ctx.beginPath(); ctx.moveTo(-r * 0.15, -r * 0.92); ctx.lineTo(0, -len); ctx.lineTo(r * 0.15, -r * 0.92); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  const g = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.1, x, y, r);
  g.addColorStop(0, '#fff6b8'); g.addColorStop(0.6, C.sun); g.addColorStop(1, C.sunHot);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  // photosphere granulation
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  for (let i = 0; i < 60; i++) {
    const a = rand(i) * TAU, d = Math.sqrt(rand(i + 50)) * r;
    ctx.fillStyle = `rgba(255,250,210,${0.12 + 0.1 * Math.sin(t * 2 + i)})`;
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * 0.05, 0, TAU); ctx.fill();
  }
  ctx.restore();
  if (spots > 0) sunspots(ctx, x, y, r, spots);
  if (o.face) face(ctx, t, x, y, r * 0.9, o);
}

// Penumbra + umbra: brown-orange, clearly darker than the photosphere but not black.
export function sunspots(ctx, x, y, r, a = 1) {
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  for (const [sx, sy, ss] of SPOTS) {
    const px = x + sx * r, py = y + sy * r, rr = ss * r;
    ctx.fillStyle = 'rgba(196,96,20,0.75)';
    ctx.beginPath(); ctx.ellipse(px, py, rr * 1.5, rr * 1.25, 0.4, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(120,50,14,0.9)';
    ctx.beginPath(); ctx.ellipse(px, py, rr * 0.85, rr * 0.7, 0.4, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// Soft gas-and-dust cloud: overlapping glows, no hard edge; drifting dust grains show it is spread-out matter.
export function nebula(ctx, t, x, y, s, o = {}) {
  const cols = ['rgba(255,95,170,0.45)', 'rgba(130,110,255,0.45)', 'rgba(60,210,230,0.38)', 'rgba(255,170,90,0.32)'];
  for (let i = 0; i < 14; i++) {
    const a = rand(i) * TAU + t * 0.08 * (i % 2 ? 1 : -1);
    const d = rand(i + 3) * 170 * s;
    glow(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.65, 0, (90 + rand(i + 5) * 110) * s, cols[i % 4]);
  }
  for (let i = 0; i < 46; i++) {
    const a = rand(i + 70) * TAU + t * (0.1 + rand(i + 80) * 0.2);
    const d = (40 + rand(i + 90) * 220) * s;
    ctx.fillStyle = `rgba(255,235,255,${0.25 + 0.35 * rand(i + 60)})`;
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.6, (2 + rand(i) * 3) * s, 0, TAU); ctx.fill();
  }
  for (let i = 0; i < 3; i++) {
    const tw = 0.6 + 0.4 * Math.sin(t * 4 + i * 2);
    glow(ctx, x + (rand(i + 20) - 0.5) * 260 * s, y + (rand(i + 30) - 0.5) * 160 * s, 0, 22 * s * tw, 'rgba(255,255,255,0.9)');
  }
  if (o.face !== false) face(ctx, t, x, y + 10 * s, 85 * s, { ...o, ink: '#3a1450' });
}

export function earth(ctx, t, x, y, r) {
  ctx.save();
  glow(ctx, x, y, r * 0.95, r * 1.2, 'rgba(120,200,255,0.5)');
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  ctx.fillStyle = C.earth; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.fillStyle = C.land;
  for (let k = 0; k < 6; k++) {
    const cx = x + ((rand(k * 3) * 2.6 - 1.3 + t * 0.04) % 2.6) * r, cy = y + (rand(k * 5) - 0.5) * r * 1.5;
    ctx.beginPath(); ctx.ellipse(cx, cy, r * (0.2 + 0.25 * rand(k)), r * (0.12 + 0.15 * rand(k + 1)), rand(k + 2) * 3, 0, TAU); ctx.fill();
  }
  const sh = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
  sh.addColorStop(0.35, 'rgba(0,0,30,0)'); sh.addColorStop(1, 'rgba(0,0,30,0.7)');
  ctx.fillStyle = sh; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

// Lumpy space rock; heat > 0 adds a hot glow.
export function rock(ctx, x, y, r, rot = 0, heat = 0) {
  if (heat > 0) glow(ctx, x, y, r * 0.6, r * (1.6 + heat), `rgba(255,140,40,${0.7 * heat})`);
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU, rr = r * (0.8 + 0.25 * rand(i + 40));
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = heat > 0.5 ? '#c96a3b' : '#8d7f73'; ctx.fill();
  ctx.strokeStyle = '#4c4038'; ctx.lineWidth = Math.max(2, r * 0.08); ctx.stroke();
  ctx.fillStyle = 'rgba(60,45,35,0.5)';
  ctx.beginPath(); ctx.arc(-r * 0.25, -r * 0.15, r * 0.18, 0, TAU); ctx.arc(r * 0.3, r * 0.25, r * 0.13, 0, TAU); ctx.fill();
  ctx.restore();
}
