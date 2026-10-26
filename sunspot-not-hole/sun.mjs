// The Sun character (from sun-energy). `inside(ctx)` draws extra surface detail (sunspots) clipped to the disk.
import { TAU, rnd, clamp, lerp } from './lib.mjs';
import { face, glow } from './cast.mjs';

const INK = '#2b1a55';

// Wavy corona spikes around (x,y).
function rays(ctx, t, x, y, r, a) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(t * 0.15);
  const n = 16;
  ctx.fillStyle = 'rgba(255,190,60,0.85)';
  ctx.beginPath();
  for (let i = 0; i <= n * 2; i++) {
    const ang = (i / (n * 2)) * TAU;
    const len = i % 2 ? r * 1.06 : r * (1.26 + 0.07 * Math.sin(t * 3 + i * 1.7));
    ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function ball(ctx, x, y, r) {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, '#fff7c2'); g.addColorStop(0.55, '#ffc23a'); g.addColorStop(1, '#ff7f1f');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}

// Concentric interior: convective ring with boiling loops, radiative zone, glowing core.
export const ZONE = { core: 0.25, rad: 0.7 };
export function interior(ctx, t, x, y, r, o = {}) {
  const { hiCore = 0, hiRad = 0, hiConv = 0 } = o;
  ctx.fillStyle = '#ff7a2c';
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  // convection cells: little rolling loops in the outer ring
  ctx.save();
  ctx.strokeStyle = `rgba(255,220,140,${0.35 + 0.4 * hiConv})`; ctx.lineWidth = r * 0.018;
  const rc = (ZONE.rad + 1) / 2 * r, cw = (1 - ZONE.rad) * r * 0.36;
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * TAU;
    const cx = x + Math.cos(a) * rc, cy = y + Math.sin(a) * rc;
    ctx.beginPath(); ctx.ellipse(cx, cy, cw, cw * 0.8, a, 0, TAU); ctx.stroke();
    const s = t * 2.2 * (i % 2 ? 1 : -1) + i;
    ctx.fillStyle = 'rgba(255,240,190,0.8)';
    ctx.beginPath(); ctx.arc(cx + Math.cos(s) * cw, cy + Math.sin(s) * cw * 0.8, r * 0.014, 0, TAU); ctx.fill();
  }
  ctx.restore();
  const g = ctx.createRadialGradient(x, y, r * ZONE.core, x, y, r * ZONE.rad);
  g.addColorStop(0, '#ffd166'); g.addColorStop(1, '#ffa040');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r * ZONE.rad, 0, TAU); ctx.fill();
  if (hiRad > 0) {
    ctx.strokeStyle = `rgba(255,255,255,${0.7 * hiRad})`; ctx.lineWidth = r * 0.012;
    ctx.beginPath(); ctx.arc(x, y, r * ZONE.rad, 0, TAU); ctx.stroke();
  }
  const pulse = 1 + 0.05 * Math.sin(t * 6) * (0.4 + hiCore);
  glow(ctx, x, y, 0, r * ZONE.core * (1.6 + hiCore), `rgba(255,255,220,${0.5 + 0.4 * hiCore})`);
  const cg = ctx.createRadialGradient(x, y, 0, x, y, r * ZONE.core * pulse);
  cg.addColorStop(0, '#ffffff'); cg.addColorStop(1, '#fff0a0');
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.arc(x, y, r * ZONE.core * pulse, 0, TAU); ctx.fill();
}

// The Sun buddy. cut ∈ [0,1] slides open a window on its right half to show the interior.
export function sunBuddy(ctx, t, x, y, r, o = {}) {
  const { talk = 0, mood = 'happy', look = 0, lookY = 0, faceA = 1, cut = 0, shades = 0, glowA = 1, breathe = 1, hi = {}, ash = 0, inside } = o;
  const k = 1 + 0.025 * Math.sin(t * 2.2) * breathe;
  glow(ctx, x, y, r * 0.6, r * 2.3 * k, `rgba(255,170,60,${0.38 * glowA})`);
  rays(ctx, t, x, y, r * k, glowA);
  ball(ctx, x, y, r);
  // granulation speckles
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  for (let i = 0; i < 40; i++) {
    const a = rnd(i) * TAU, d = Math.sqrt(rnd(i + 50)) * r;
    ctx.fillStyle = `rgba(255,120,30,${0.12 + 0.1 * Math.sin(t * 2 + i)})`;
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * 0.06, 0, TAU); ctx.fill();
  }
  if (ash > 0) {
    ctx.fillStyle = `rgba(75,70,82,${0.88 * clamp(ash)})`;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  if (inside) inside(ctx);
  if (cut > 0) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y - r, r * clamp(cut), r * 2); ctx.clip();
    interior(ctx, t, x, y, r, hi);
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = r * 0.025;
    ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = Math.max(4, r * 0.03);
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  if (faceA > 0) {
    ctx.save(); ctx.globalAlpha *= faceA;
    const fx = cut > 0 ? x - r * 0.45 * clamp(cut * 2) : x;
    const fr = cut > 0 ? r * lerp(0.62, 0.42, clamp(cut * 2)) : r * 0.62;
    face(ctx, t, fx, y + r * 0.06, fr, { talk, mood, look, lookY, ink: '#7a2e0e' });
    if (shades > 0) sunglasses(ctx, fx + look * fr * 0.1, y + r * 0.06 - fr * 0.14, fr, shades);
    ctx.restore();
  }
}

// Cool shades that drop down onto a face of radius fr.
export function sunglasses(ctx, x, y, fr, p) {
  const s = fr / 100;
  ctx.save();
  ctx.translate(x, y - (1 - p) * 160 * s);
  ctx.globalAlpha *= clamp(p * 2);
  ctx.fillStyle = '#141428'; ctx.strokeStyle = '#141428'; ctx.lineWidth = 7 * s;
  for (const k of [-1, 1]) {
    ctx.beginPath(); ctx.roundRect(k * 36 * s - 28 * s, -18 * s, 56 * s, 38 * s, 14 * s); ctx.fill();
  }
  ctx.beginPath(); ctx.moveTo(-10 * s, -6 * s); ctx.quadraticCurveTo(0, -14 * s, 10 * s, -6 * s); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.roundRect(k * 36 * s - 18 * s, -12 * s, 14 * s, 8 * s, 4 * s); ctx.fill(); }
  ctx.restore();
}

