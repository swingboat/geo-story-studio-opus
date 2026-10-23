// Characters: faces, the sun, the hiker kid, the ground ("地面君") and the air / vapour / CO2 buddies.
import { C, clamp, lerp } from './lib.mjs';

const TAU = Math.PI * 2;

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

// Blend two #rrggbb colours (k = 0 → a, 1 → b).
export function mix(a, b, k) {
  const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], clamp(k)))).join(',')})`;
}

export function tick(ctx, x, y, s, color = C.ok) {
  ctx.save();
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 40 * s, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 10 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - 18 * s, y + 1 * s); ctx.lineTo(x - 5 * s, y + 15 * s); ctx.lineTo(x + 20 * s, y - 14 * s); ctx.stroke();
  ctx.restore();
}

// Hiker kid. (x,y) = feet. o.shiver 0..1 shakes, tints blue and adds a scarf; o.point raises the right arm.
export function hiker(ctx, t, x, y, s, o = {}) {
  const { talk = 0, mood = 'happy', shiver = 0, point = 0, flip = 1 } = o;
  const jx = Math.sin(t * 70) * 5 * shiver, bob = Math.sin(t * 3) * 6 * (1 - shiver);
  ctx.save();
  ctx.translate(x + jx * s, y + bob * s); ctx.scale(s * flip, s);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // backpack
  ctx.fillStyle = '#3d8c6e';
  ctx.beginPath(); ctx.roundRect(-78, -185, 60, 110, 20); ctx.fill();
  // legs + boots
  ctx.strokeStyle = '#34406b'; ctx.lineWidth = 30;
  ctx.beginPath(); ctx.moveTo(-22, -70); ctx.lineTo(-26, -16); ctx.moveTo(22, -70); ctx.lineTo(28, -16); ctx.stroke();
  ctx.fillStyle = '#6b3e26';
  ctx.beginPath(); ctx.roundRect(-50, -22, 44, 24, 10); ctx.roundRect(8, -22, 46, 24, 10); ctx.fill();
  // puffer jacket
  ctx.fillStyle = mix('#ff8a3d', '#7fb2ff', shiver * 0.5);
  ctx.beginPath(); ctx.roundRect(-58, -178, 116, 118, 42); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 5;
  for (const yy of [-140, -105]) { ctx.beginPath(); ctx.moveTo(-50, yy); ctx.lineTo(50, yy); ctx.stroke(); }
  // arms
  ctx.strokeStyle = mix('#ff8a3d', '#7fb2ff', shiver * 0.5); ctx.lineWidth = 28;
  const hug = shiver > 0.3;
  ctx.beginPath(); ctx.moveTo(-50, -150);
  hug ? ctx.lineTo(10, -120) : ctx.lineTo(-82, -96);
  ctx.stroke();
  const pa = lerp(0.9, -1.1 + Math.sin(t * 8) * 0.15, clamp(point));
  ctx.beginPath(); ctx.moveTo(50, -150);
  hug && point < 0.1 ? ctx.lineTo(-10, -112) : ctx.lineTo(50 + Math.cos(pa) * 64, -150 + Math.sin(pa) * 64);
  ctx.stroke();
  // head
  ctx.fillStyle = mix('#ffd7b5', '#d9e6ff', shiver * 0.6);
  ctx.beginPath(); ctx.arc(0, -246, 72, 0, TAU); ctx.fill();
  // beanie with pom-pom
  ctx.fillStyle = '#e8414f';
  ctx.beginPath(); ctx.arc(0, -262, 74, Math.PI * 1.02, Math.PI * 1.98); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.roundRect(-78, -272, 156, 24, 12); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -340, 20, 0, TAU); ctx.fill();
  // scarf when cold
  if (shiver > 0.05) {
    ctx.globalAlpha *= clamp(shiver * 2);
    ctx.fillStyle = '#4cc9f0';
    ctx.beginPath(); ctx.roundRect(-56, -192, 112, 28, 14); ctx.fill();
    ctx.beginPath(); ctx.roundRect(22, -186, 26, 66, 10); ctx.fill();
  }
  ctx.restore();
  face(ctx, t, x + jx * s, y + bob * s - 232 * s, 60 * s, { talk, mood: shiver > 0.5 && talk < 0.05 ? 'sad' : mood });
}

// Little steam squiggles rising from (x,y).
function steam(ctx, t, x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 7 * s; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.9 + i / 3) % 1;
    ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.8;
    ctx.beginPath();
    for (let k = 0; k <= 10; k++) {
      const yy = y - ph * 60 * s - k * 6 * s, xx = x + (i - 1) * 40 * s + Math.sin(k * 0.8 + t * 6 + i) * 8 * s;
      k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
    }
    ctx.stroke();
  }
  ctx.restore();
}

// The ground slab "地面君" from x0..x1 with its top at y. heat 0..1 warms the soil; o.face draws a face at (fx, fy).
export function groundBody(ctx, t, x0, x1, y, depth, o = {}) {
  const { heat = 0, face: fc, talk = 0, mood = 'happy', grass = true, shimmer = heat } = o;
  ctx.save();
  if (heat > 0.05) glow(ctx, (x0 + x1) / 2, y, 40, (x1 - x0) * 0.6, `rgba(255,120,50,${0.35 * heat})`);
  const g = ctx.createLinearGradient(0, y, 0, y + depth);
  g.addColorStop(0, mix(C.soil, C.soilHot, heat));
  g.addColorStop(1, mix('#4a2f22', '#7a2f1e', heat));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.roundRect(x0, y, x1 - x0, depth, [26, 26, 10, 10]); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for (let i = 0; i < 14; i++) {
    const px = x0 + 30 + ((i * 137) % (x1 - x0 - 60)), py = y + 50 + ((i * 71) % Math.max(20, depth - 70));
    ctx.beginPath(); ctx.ellipse(px, py, 16, 9, 0, 0, TAU); ctx.fill();
  }
  if (grass) {
    ctx.fillStyle = mix(C.grass, '#c9b03a', heat * 0.6);
    ctx.beginPath(); ctx.roundRect(x0, y - 8, x1 - x0, 26, 14); ctx.fill();
    for (let xx = x0 + 14; xx < x1 - 10; xx += 30) {
      const sway = Math.sin(t * 2 + xx * 0.05) * 4;
      ctx.beginPath(); ctx.moveTo(xx - 7, y); ctx.lineTo(xx + sway, y - 22); ctx.lineTo(xx + 7, y); ctx.fill();
    }
  }
  ctx.restore();
  if (shimmer > 0.1) for (let xx = x0 + 120; xx < x1 - 60; xx += 260) steam(ctx, t + xx, xx, y - 30, 0.9, `rgba(255,170,90,${shimmer})`);
  if (fc) face(ctx, t, fc[0], fc[1], o.faceR ?? 110, { talk, mood: heat > 0.6 && mood === 'happy' && !talk ? 'wow' : mood });
}

// Air / vapour / CO2 buddy. warm 0..1 recolours it from cool blue to orange and adds a glow.
export function buddy(ctx, t, x, y, r, o = {}) {
  const { kind = 'air', warm = 0, talk = 0, mood = 'happy', jiggle = 1 } = o;
  const wob = Math.sin(t * 4 + x * 0.03) * 4 * jiggle * (1 + warm * 2);
  x += Math.sin(t * 9 + y) * warm * 3 * jiggle; y += wob;
  if (warm > 0.05) glow(ctx, x, y, r * 0.6, r * 1.9, `rgba(255,140,60,${0.45 * warm})`);
  ctx.save();
  if (kind === 'co2') {
    ctx.fillStyle = mix('#e86b6b', '#ff9f43', warm);
    for (const k of [-1, 1]) { ctx.beginPath(); ctx.arc(x + k * r * 1.05, y, r * 0.62, 0, TAU); ctx.fill(); }
    ctx.fillStyle = mix('#7d7a96', '#c98a5a', warm);
    ctx.beginPath(); ctx.arc(x, y, r * 0.82, 0, TAU); ctx.fill();
    ctx.restore();
    face(ctx, t, x, y, r * 0.68, { talk, mood });
    return;
  }
  if (kind === 'vapor') {
    ctx.fillStyle = mix(C.vapor, '#ffb36b', warm * 0.7);
    ctx.beginPath();
    ctx.moveTo(x, y - r * 1.35);
    ctx.bezierCurveTo(x + r * 0.5, y - r * 0.7, x + r, y - r * 0.2, x + r, y + r * 0.25);
    ctx.arc(x, y + r * 0.25, r, 0, Math.PI);
    ctx.bezierCurveTo(x - r, y - r * 0.2, x - r * 0.5, y - r * 0.7, x, y - r * 1.35);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.ellipse(x - r * 0.45, y - r * 0.1, r * 0.14, r * 0.3, 0.4, 0, TAU); ctx.fill();
    ctx.restore();
    face(ctx, t, x, y + r * 0.25, r * 0.7, { talk, mood });
    return;
  }
  // fluffy air parcel
  ctx.fillStyle = mix('#a9d8ff', C.warm, warm);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    ctx.moveTo(x + Math.cos(a) * r * 0.62 + r * 0.4, y + Math.sin(a) * r * 0.62);
    ctx.arc(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.4, 0, TAU);
  }
  ctx.arc(x, y, r * 0.7, 0, TAU);
  ctx.fill();
  ctx.restore();
  face(ctx, t, x, y + r * 0.05, r * 0.72, { talk, mood: warm > 0.6 && mood === 'happy' ? 'wow' : mood });
}
