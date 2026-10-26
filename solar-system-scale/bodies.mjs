// Cartoon bodies for the solar-system scale explainer: Sun, the eight planets (with faces), a student and map pins.
import { C, NUM, SANS, ZH, clamp, rand, txt, measure } from './lib.mjs';

const TAU = Math.PI * 2;

// d = mean diameter (Earth = 1, NASA/JPL mean radii); a = semi-major axis (AU, J2000); m = model distance (m) with Earth = 1 cm
export const PLANETS = [
  { name: '水星', key: 'mercury', d: 0.38, a: 0.39, m: 45.4, kind: 'terr' },
  { name: '金星', key: 'venus', d: 0.95, a: 0.72, m: 84.9, kind: 'terr' },
  { name: '地球', key: 'earth', d: 1.0, a: 1.0, m: 117.4, kind: 'terr' },
  { name: '火星', key: 'mars', d: 0.53, a: 1.52, m: 178.9, kind: 'terr' },
  { name: '木星', key: 'jupiter', d: 10.97, a: 5.2, m: 610.8, kind: 'giant' },
  { name: '土星', key: 'saturn', d: 9.14, a: 9.54, m: 1119.7, kind: 'giant' },
  { name: '天王星', key: 'uranus', d: 3.98, a: 19.19, m: 2252.9, kind: 'far' },
  { name: '海王星', key: 'neptune', d: 3.86, a: 30.07, m: 3530.4, kind: 'far' },
];
export const P = Object.fromEntries(PLANETS.map((p) => [p.name, p]));
export const SUN_D = 109.2; // Sun diameter in Earth diameters

export function glow(ctx, x, y, r0, r1, color) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r1, 0, TAU); ctx.fill();
}

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

// Night side away from `light` (angle toward the light source).
function shade(ctx, x, y, r, light) {
  const lx = Math.cos(light), ly = Math.sin(light);
  const g = ctx.createLinearGradient(x + lx * r, y + ly * r, x - lx * r, y - ly * r);
  g.addColorStop(0, 'rgba(255,255,255,0.22)');
  g.addColorStop(0.45, 'rgba(0,0,30,0)');
  g.addColorStop(1, 'rgba(0,0,30,0.55)');
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}

export function sun(ctx, t, x, y, r, o = {}) {
  const { rays = true } = o;
  glow(ctx, x, y, r * 0.8, r * 1.9, 'rgba(255,190,60,0.42)');
  if (rays) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(t * 0.3);
    ctx.fillStyle = C.sun;
    for (let i = 0; i < 12; i++) {
      ctx.rotate(TAU / 12);
      const len = r * (1.25 + 0.07 * Math.sin(t * 5 + i));
      ctx.beginPath(); ctx.moveTo(-r * 0.15, -r * 0.92); ctx.lineTo(0, -len); ctx.lineTo(r * 0.15, -r * 0.92); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  const g = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.1, x, y, r);
  g.addColorStop(0, '#fff6b8'); g.addColorStop(0.6, C.sun); g.addColorStop(1, C.sunHot);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  if (r > 30) {
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
    for (let i = 0; i < 60; i++) {
      const a = rand(i) * TAU, d = Math.sqrt(rand(i + 50)) * r;
      ctx.fillStyle = `rgba(255,250,210,${0.12 + 0.1 * Math.sin(t * 2 + i)})`;
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * 0.05, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  if (o.face) face(ctx, t, x, y, r * 0.8, o);
}

// Saturn's ring as a tilted annulus; half = 'back' (behind the ball) or 'front'.
function rings(ctx, x, y, r, rot, half) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, 0.3);
  ctx.beginPath(); ctx.rect(-r * 3, half === 'back' ? -r * 3 : 0, r * 6, r * 3); ctx.clip();
  for (const [r0, r1, a] of [[1.24, 1.52, 0.55], [1.55, 1.95, 0.85], [2.02, 2.27, 0.6]]) {
    ctx.fillStyle = `rgba(236,214,160,${a})`;
    ctx.beginPath(); ctx.arc(0, 0, r * r1, 0, TAU); ctx.arc(0, 0, r * r0, 0, TAU, true); ctx.fill('evenodd');
  }
  ctx.restore();
}

// Planet by Chinese name at (x,y) radius r. o: { face, talk, mood, light, ring }
export function planet(ctx, t, name, x, y, r, o = {}) {
  const p = P[name];
  const { light = Math.PI, ringRot = -0.38 } = o;
  if (r < 1.2) {
    ctx.fillStyle = C[p.key];
    ctx.beginPath(); ctx.arc(x, y, Math.max(r, 0.8), 0, TAU); ctx.fill();
    return;
  }
  if (p.key === 'saturn' && o.ring !== false) rings(ctx, x, y, r, ringRot, 'back');
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  ctx.fillStyle = C[p.key]; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  const blob = (bx, by, rx, ry, col, rot = 0) => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x + bx * r, y + by * r, rx * r, ry * r, rot, 0, TAU); ctx.fill();
  };
  if (p.key === 'mercury') {
    for (let i = 0; i < 7; i++) blob(rand(i) * 1.6 - 0.8, rand(i + 9) * 1.6 - 0.8, 0.09 + 0.12 * rand(i + 4), 0.09 + 0.12 * rand(i + 4), 'rgba(90,82,76,0.45)');
  } else if (p.key === 'venus') {
    for (let i = 0; i < 4; i++) blob(-0.1 + 0.2 * rand(i), -0.6 + i * 0.4, 1.0, 0.1, 'rgba(255,240,200,0.45)', 0.15);
  } else if (p.key === 'earth') {
    for (let k = 0; k < 6; k++) {
      const cx = ((rand(k * 3) * 2.6 - 1.3 + t * 0.04) % 2.6) - 0.2;
      blob(cx, (rand(k * 5) - 0.5) * 1.5, 0.2 + 0.25 * rand(k), 0.12 + 0.15 * rand(k + 1), C.land, rand(k + 2) * 3);
    }
    for (let k = 0; k < 4; k++) blob(rand(k + 30) * 1.8 - 0.9, rand(k + 40) * 1.6 - 0.8, 0.3, 0.06, 'rgba(255,255,255,0.55)', 0.2);
  } else if (p.key === 'mars') {
    for (let k = 0; k < 5; k++) blob(rand(k + 7) * 1.4 - 0.7, rand(k + 3) * 1.0 - 0.4, 0.25, 0.12, 'rgba(120,40,25,0.4)', rand(k));
    blob(0, -0.98, 0.45, 0.2, '#fff4ee');
  } else if (p.key === 'jupiter' || p.key === 'saturn') {
    const band = p.key === 'jupiter' ? C.jupBand : C.satBand;
    const ys = p.key === 'jupiter' ? [-0.62, -0.32, 0.05, 0.38, 0.7] : [-0.5, -0.1, 0.35];
    ys.forEach((yy, i) => blob(0, yy, 1.3, 0.07 + 0.04 * (i % 2), band));
    if (p.key === 'jupiter') blob(0.32, 0.22, 0.2, 0.11, '#c9502f');
  } else if (p.key === 'uranus') {
    blob(0, -0.2, 1.2, 0.12, 'rgba(255,255,255,0.18)');
  } else if (p.key === 'neptune') {
    blob(-0.25, 0.15, 0.2, 0.11, 'rgba(20,40,120,0.6)');
    blob(0.15, -0.35, 0.3, 0.05, 'rgba(255,255,255,0.6)');
  }
  shade(ctx, x, y, r, light);
  ctx.restore();
  if (p.key === 'saturn' && o.ring !== false) rings(ctx, x, y, r, ringRot, 'front');
  if (o.face && r >= 18) face(ctx, t, x, y + r * 0.08, r * 0.78, o);
}

// Side-view high-school student in a blue-and-white school tracksuit, feet at (x, yFeet), height h px.
export function student(ctx, t, x, yFeet, h, o = {}) {
  const { flip = 1, wave = 0 } = o;
  const s = h / 362; // head top sits at -362 in local units
  ctx.save();
  ctx.translate(x, yFeet); ctx.scale(s * flip, s);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // legs; the belt is centred at ~59% of the height (≈1.03 m for a 1.75 m student)
  ctx.strokeStyle = '#2d4d9a'; ctx.lineWidth = 26;
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 14, -205); ctx.lineTo(k * 16, -14); ctx.stroke(); }
  ctx.fillStyle = '#f4f4f4';
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.roundRect(k * 16 - 20, -16, 40, 16, 8); ctx.fill(); }
  // torso
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.roundRect(-40, -285, 80, 95, 30); ctx.fill();
  ctx.fillStyle = '#2d6be0';
  ctx.fillRect(-40, -266, 80, 16);
  ctx.fillStyle = '#1f3c80';
  ctx.beginPath(); ctx.roundRect(-40, -232, 80, 34, 10); ctx.fill();
  // arms (one waves)
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 22;
  ctx.beginPath(); ctx.moveTo(-34, -258); ctx.lineTo(-48, -170); ctx.stroke();
  // angle from straight down; ~2.6 rad lifts the hand above the head
  const ang = 0.2 + wave * (2.4 + 0.3 * Math.sin(t * 12));
  ctx.beginPath(); ctx.moveTo(34, -258); ctx.lineTo(34 + Math.sin(ang) * 90, -258 + Math.cos(ang) * 90); ctx.stroke();
  // head
  ctx.fillStyle = '#ffd9b8';
  ctx.beginPath(); ctx.arc(0, -316, 34, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2a1d1a';
  ctx.beginPath(); ctx.arc(0, -326, 36, Math.PI * 1.05, Math.PI * 2.05); ctx.fill();
  ctx.fillStyle = C.ink;
  ctx.beginPath(); ctx.arc(-12, -312, 4.5, 0, TAU); ctx.arc(14, -312, 4.5, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(2, -302, 10, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  ctx.restore();
}

// Map pin with a tag: icon planet in the bubble, name + note beside. The icon is a marker, not drawn to scale.
export function pin(ctx, t, x, y, name, note, o = {}) {
  const { a = 1, side = 1, color = '#ffffff', icon = true, sc = 1 } = o;
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(side * 60, -46); ctx.stroke();
  const tw = Math.max(measure(ctx, name, 44), note ? measure(ctx, note, 36, NUM) : 0) + (icon ? 96 : 40);
  const bx = side > 0 ? 50 : -50 - tw, by = -100;
  ctx.fillStyle = 'rgba(8,10,40,0.9)';
  ctx.strokeStyle = color; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(bx, by, tw, note ? 104 : 64, 22); ctx.fill(); ctx.stroke();
  if (icon && P[name]) planet(ctx, t, name, bx + 42, by + (note ? 52 : 32), 24, { ringRot: -0.3 });
  const tx = bx + (icon ? 78 : 20);
  txt(ctx, name, tx, by + 34, { size: 44, color, align: 'left' });
  if (note) txt(ctx, note, tx, by + 80, { size: 36, font: NUM, color: C.gold, align: 'left' });
  ctx.restore();
}

export { SANS, ZH };
