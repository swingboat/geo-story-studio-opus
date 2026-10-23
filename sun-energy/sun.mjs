// The Sun character (with optional cutaway into core / radiative / convective zones), the Earth, and nuclei.
import { C, TAU, rnd, clamp, lerp, txt } from './lib.mjs';
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
  const { talk = 0, mood = 'happy', look = 0, lookY = 0, faceA = 1, cut = 0, shades = 0, glowA = 1, breathe = 1, hi = {}, ash = 0 } = o;
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

// Earth buddy, lit from direction `light` (radians: where the Sun is).
export function earthBuddy(ctx, t, x, y, r, o = {}) {
  const { talk = 0, mood = 'happy', look = 0, light = Math.PI, lit = 1, shades = 0 } = o;
  glow(ctx, x, y, r * 0.8, r * 1.5, `rgba(90,170,255,${0.3 + 0.25 * lit})`);
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  ctx.fillStyle = C.earth; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.fillStyle = C.land;
  for (const [dx, dy, rx, ry] of [[-0.45, -0.35, 0.38, 0.26], [0.35, 0.1, 0.32, 0.42], [-0.3, 0.45, 0.28, 0.2], [0.55, -0.55, 0.2, 0.14]]) {
    const sh = ((t * 0.05) % 2) * r;
    ctx.beginPath(); ctx.ellipse(x + dx * r + sh - (sh > r ? 2 * r : 0), y + dy * r, rx * r, ry * r, 0.4, 0, TAU); ctx.fill();
  }
  // night side shading away from the light
  const lx = x + Math.cos(light) * r, ly = y + Math.sin(light) * r;
  const g = ctx.createLinearGradient(lx, ly, x - Math.cos(light) * r, y - Math.sin(light) * r);
  g.addColorStop(0, `rgba(255,240,180,${0.35 * lit})`); g.addColorStop(0.5, 'rgba(0,0,30,0)'); g.addColorStop(1, `rgba(5,8,40,${0.55 - 0.15 * lit})`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = Math.max(4, r * 0.04);
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  face(ctx, t, x, y + r * 0.08, r * 0.6, { talk, mood, look, ink: '#10264a' });
  if (shades > 0) sunglasses(ctx, x + look * r * 0.06, y + r * 0.08 - r * 0.6 * 0.14, r * 0.6, shades);
}

// A single nucleon. kind 'p' = proton (+), 'n' = neutron. withFace gives the hydrogen nucleus a little face.
export function nucleon(ctx, t, x, y, r, kind = 'p', o = {}) {
  const { a = 1, withFace = false, mood = 'happy' } = o;
  if (a <= 0 || r <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a);
  const base = kind === 'p' ? C.proton : C.neutron;
  if (kind === 'p') glow(ctx, x, y, r * 0.6, r * 1.9, 'rgba(255,107,139,0.35)');
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, base); g.addColorStop(1, kind === 'p' ? '#d23a63' : '#7d87a8');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = Math.max(3, r * 0.08); ctx.stroke();
  if (withFace) face(ctx, t, x, y + r * 0.12, r * 0.55, { mood, ink: '#4a0f22' });
  else if (kind === 'p') txt(ctx, '+', x, y + r * 0.04, { size: r * 1.3, color: '#fff', font: 'RoundB' });
  ctx.restore();
}

// Hydrogen nucleus = one proton with a face.
export const hydrogen = (ctx, t, x, y, r, o = {}) => nucleon(ctx, t, x, y, r, 'p', { withFace: true, ...o });

// Helium nucleus: 2 protons + 2 neutrons in a tight cluster, wobbling gently.
export function helium(ctx, t, x, y, r, o = {}) {
  const { a = 1, spin = 0 } = o;
  if (a <= 0 || r <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a);
  glow(ctx, x, y, 0, r * 2.6, 'rgba(255,230,140,0.4)');
  const d = r * 0.62, rot = spin + Math.sin(t * 2) * 0.15;
  [['n', -1, -1], ['p', 1, -1], ['p', -1, 1], ['n', 1, 1]].forEach(([k, i, j]) => {
    const a2 = Math.atan2(j, i) + rot;
    nucleon(ctx, t, x + Math.cos(a2) * d, y + Math.sin(a2) * d, r * 0.62, k);
  });
  ctx.restore();
}

// Travelling light wave from (x1,y1) to (x2,y2); p ∈ [0,1] is how far the head has reached.
export function lightWave(ctx, t, x1, y1, x2, y2, o = {}) {
  const { p = 1, amp = 22, wl = 70, color = C.energy, w = 8, a = 1 } = o;
  if (p <= 0 || a <= 0) return;
  const L = Math.hypot(x2 - x1, y2 - y1), ang = Math.atan2(y2 - y1, x2 - x1);
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.translate(x1, y1); ctx.rotate(ang);
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.shadowColor = color; ctx.shadowBlur = 18;
  ctx.beginPath();
  for (let s = 0; s <= L * p; s += 6) ctx.lineTo(s, Math.sin((s / wl) * TAU - t * 9) * amp);
  ctx.stroke();
  ctx.restore();
}
