// Shared props for this episode: wavy rings, energy dots riding a wave, the cloud buddy and speech bubbles.
import { C, TAU, clamp, txt } from './lib.mjs';
import { face, glow } from './cast.mjs';

const INK = '#0a0828';

// A golden wavy ring of radius R around (x,y) — the "ripple" look for radiation leaving the Sun.
export function waveRing(ctx, t, x, y, R, o = {}) {
  const { a = 1, color = C.energy, w = 7, bumps = 18, amp = 9, arc = [0, TAU] } = o;
  if (a <= 0 || R <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.shadowColor = color; ctx.shadowBlur = 16;
  ctx.beginPath();
  for (let k = 0; k <= 160; k++) {
    const ang = arc[0] + ((arc[1] - arc[0]) * k) / 160;
    const rr = R + Math.sin(ang * bumps + t * 4) * amp;
    ctx.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
  }
  ctx.stroke();
  ctx.restore();
}

// Rings that keep emerging from radius r0 and drifting out to r1.
export function ringTrain(ctx, t, x, y, r0, r1, o = {}) {
  const { n = 4, speed = 0.35, a = 1, ...rest } = o;
  for (let i = 0; i < n; i++) {
    const f = (t * speed + i / n) % 1;
    waveRing(ctx, t, x, y, r0 + (r1 - r0) * f, { ...rest, a: a * Math.sin(Math.PI * f) });
  }
}

// A glowing energy dot (a little "parcel" of energy) at (x,y).
export function energyDot(ctx, t, x, y, r = 14, a = 1) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  glow(ctx, x, y, 0, r * 3, 'rgba(255,240,120,0.6)');
  ctx.fillStyle = '#fffbe0';
  ctx.beginPath(); ctx.arc(x, y, r * (1 + 0.15 * Math.sin(t * 12 + x)), 0, TAU); ctx.fill();
  ctx.restore();
}

// Point along a sine wave from (x1,y1) to (x2,y2) at fraction f (matches lightWave's phase).
export function wavePoint(t, x1, y1, x2, y2, f, amp = 22, wl = 70) {
  const L = Math.hypot(x2 - x1, y2 - y1), ang = Math.atan2(y2 - y1, x2 - x1);
  const s = L * f, off = Math.sin((s / wl) * TAU - t * 9) * amp;
  return [x1 + Math.cos(ang) * s - Math.sin(ang) * off, y1 + Math.sin(ang) * s + Math.cos(ang) * off];
}

// Puffy cloud with a face. (x,y) is the centre; r ≈ half-height.
export function cloudBuddy(ctx, t, x, y, r, o = {}) {
  const { mood = 'happy', talk = 0, look = 0, a = 1, puff = 0 } = o;
  if (a <= 0) return;
  const k = 1 + 0.03 * Math.sin(t * 2.4) + 0.12 * puff;
  const blobs = [[-1.1, 0.25, 0.62], [-0.45, -0.2, 0.85], [0.35, -0.35, 0.95], [1.05, 0.15, 0.7], [0, 0.35, 0.8]];
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = INK;
  for (const [dx, dy, rr] of blobs) { ctx.beginPath(); ctx.arc(dx * r, dy * r, rr * r + 6, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#ffffff';
  for (const [dx, dy, rr] of blobs) { ctx.beginPath(); ctx.arc(dx * r, dy * r, rr * r, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(170,190,230,0.45)';
  ctx.beginPath(); ctx.ellipse(0, r * 0.75, r * 1.4, r * 0.3, 0, 0, Math.PI); ctx.fill();
  face(ctx, t, look * r * 0.1, r * 0.05, r * 0.55, { mood, talk, look, ink: '#1c2a5a' });
  ctx.restore();
}

// Speech bubble with its tail pointing at (tx,ty).
export function bubble(ctx, x, y, s, tx, ty, o = {}) {
  const { size = 52, color = INK, fill = '#ffffff', a = 1, edge = INK } = o;
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.font = `${size}px YuanB, RoundB, UniB, HiraGB`;
  const w = ctx.measureText(s).width + size * 1.1, h = size * 1.7;
  ctx.fillStyle = fill; ctx.strokeStyle = edge; ctx.lineWidth = 6; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.12, y + h / 2 - 4); ctx.lineTo(tx, ty); ctx.lineTo(x + w * 0.12, y + h / 2 - 4);
  ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - w * 0.12 + 5, y + h / 2 - 3); ctx.lineTo(x + w * 0.12 - 5, y + h / 2 - 3);
  ctx.strokeStyle = fill; ctx.lineWidth = 8; ctx.stroke();
  ctx.restore();
  txt(ctx, s, x, y + 2, { size, color });
}

// Thought bubble: a cloud-ish oval plus two small circles leading to (tx,ty); content(ctx) drawn inside a clip.
export function thought(ctx, x, y, w, h, tx, ty, a, content) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.fillStyle = 'rgba(255,255,255,0.96)'; ctx.strokeStyle = INK; ctx.lineWidth = 6;
  for (const f of [0.25, 0.55]) {
    const cx = tx + (x - tx) * f, cy = ty + (y + h / 2 - ty) * f;
    ctx.beginPath(); ctx.arc(cx, cy, 12 + f * 22, 0, TAU); ctx.fill(); ctx.stroke();
  }
  ctx.beginPath(); ctx.ellipse(x, y, w / 2, h / 2, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x, y, w / 2 - 8, h / 2 - 8, 0, 0, TAU); ctx.clip();
  content(ctx);
  ctx.restore();
}

// A bold red ✕ drawn over (x,y) with half-size s; p ∈ [0,1] animates the two strokes.
export function bigCross(ctx, x, y, s, p, color = C.no) {
  if (p <= 0) return;
  ctx.save();
  ctx.lineCap = 'round';
  for (const [w, col] of [[44, INK], [28, color]]) {
    ctx.strokeStyle = col; ctx.lineWidth = w;
    const p1 = clamp(p * 2), p2 = clamp(p * 2 - 1);
    ctx.beginPath(); ctx.moveTo(x - s, y - s); ctx.lineTo(x - s + 2 * s * p1, y - s + 2 * s * p1); ctx.stroke();
    if (p2 > 0) { ctx.beginPath(); ctx.moveTo(x + s, y - s); ctx.lineTo(x + s - 2 * s * p2, y - s + 2 * s * p2); ctx.stroke(); }
  }
  ctx.restore();
}
