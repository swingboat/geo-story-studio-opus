// Night-time props for 大气怎样给地面保温: moon, frost, the "invisible quilt", cloud buddy, Earth globe, banners.
// Colour code used everywhere: orange = infrared emitted by the ground, cyan = infrared emitted by the atmosphere itself.
import { C, ZH, clamp, lerp, prog, pop, txt, card, around, measure } from './lib.mjs';
import { face, glow, mix } from './chars.mjs';
import { cloud, irWave } from './props.mjs';

const TAU = Math.PI * 2;
export const ATM = '#4ce0ff';
export const OUTC = '#ff8fd0'; // infrared leaving the whole Earth to space

export function moon(ctx, t, x, y, r, o = {}) {
  glow(ctx, x, y, r * 0.9, r * 2.2, 'rgba(200,220,255,0.28)');
  ctx.save();
  ctx.fillStyle = '#f4f1d0';
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(180,170,120,0.35)';
  for (const [dx, dy, rr] of [[-0.35, -0.3, 0.16], [0.4, 0.35, 0.12], [0.3, -0.45, 0.08]]) {
    ctx.beginPath(); ctx.arc(x + dx * r, y + dy * r, rr * r, 0, TAU); ctx.fill();
  }
  ctx.restore();
  if (o.face !== false) face(ctx, t, x, y + r * 0.1, r * 0.8, { mood: o.mood ?? 'happy' });
}

// Ice crystals growing on the ground top edge y between x0..x1; k = 0..1.
export function frost(ctx, t, x0, x1, y, k) {
  if (k <= 0.01) return;
  ctx.save();
  ctx.fillStyle = `rgba(230,245,255,${0.55 * k})`;
  ctx.beginPath(); ctx.roundRect(x0, y - 10, x1 - x0, 22, 11); ctx.fill();
  ctx.strokeStyle = `rgba(240,250,255,${k})`; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let x = x0 + 30, i = 0; x < x1 - 20; x += 62, i++) {
    const s = 16 * clamp(k * 1.4 - (i % 3) * 0.12) * (1 + 0.06 * Math.sin(t * 3 + i));
    if (s <= 1) continue;
    const cy = y - 18 - (i % 2) * 10;
    for (let a = 0; a < 3; a++) {
      const ang = (a * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(ang) * s, cy - Math.sin(ang) * s); ctx.lineTo(x + Math.cos(ang) * s, cy + Math.sin(ang) * s);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// The "invisible quilt": a translucent patchwork dome over the ground. k = 0..1 reveal (drops from above).
export function quilt(ctx, t, x0, x1, y, h, k) {
  if (k <= 0.01) return;
  const drop = (1 - k) * -260, cx = (x0 + x1) / 2, top = y - h + drop;
  ctx.save();
  ctx.globalAlpha *= clamp(k);
  ctx.beginPath();
  ctx.moveTo(x0, y + drop * 0.2);
  for (let i = 0; i <= 24; i++) {
    const u = i / 24, x = lerp(x0, x1, u);
    const yy = y - h * Math.sin(Math.PI * u) + drop + Math.sin(t * 2.4 + u * 9) * 8;
    ctx.lineTo(x, yy);
  }
  ctx.lineTo(x1, y);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, top, 0, y);
  g.addColorStop(0, 'rgba(255,143,171,0.45)'); g.addColorStop(1, 'rgba(201,182,255,0.25)');
  ctx.fillStyle = g; ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 4; ctx.setLineDash([14, 12]);
  for (let x = x0 + 90; x < x1; x += 110) { ctx.beginPath(); ctx.moveTo(x, top - 20); ctx.lineTo(x, y); ctx.stroke(); }
  for (let yy = top + 70; yy < y; yy += 90) { ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x1, yy); ctx.stroke(); }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,214,226,0.9)'; ctx.lineWidth = 7; ctx.setLineDash([22, 14]);
  ctx.stroke();
  ctx.restore();
  txt(ctx, 'Zzz', cx + 260, top + 60 + Math.sin(t * 2) * 10, { size: 44, color: `rgba(255,255,255,${0.7 * k})`, font: 'RoundB' });
}

// A cloud with a face. warm adds a gentle glow (it is emitting infrared).
export function cloudBuddy(ctx, t, x, y, s, o = {}) {
  const { glowK = 0, talk = 0, mood = 'happy' } = o;
  y += Math.sin(t * 1.6 + x * 0.01) * 6;
  if (glowK > 0.02) glow(ctx, x, y, 40 * s, 200 * s, `rgba(76,224,255,${0.35 * glowK})`);
  cloud(ctx, x, y, s, { color: mix('#ffffff', '#d8f6ff', glowK) });
  face(ctx, t, x, y + 6 * s, 52 * s, { talk, mood });
}

// Earth seen from space with a thin atmosphere halo. (x,y) centre, r radius.
export function earth(ctx, t, x, y, r, o = {}) {
  glow(ctx, x, y, r * 0.98, r * 1.22, 'rgba(110,200,255,0.55)');
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, '#5fb8ff'); g.addColorStop(1, '#1b4fa0');
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.fillStyle = '#49b36c';
  const spin = (t * 0.06) % 1;
  for (const [u, v, a, b] of [[0.1, -0.3, 0.32, 0.22], [0.55, 0.15, 0.25, 0.35], [0.85, -0.45, 0.2, 0.12], [0.3, 0.5, 0.18, 0.1]]) {
    for (const k of [-2, 0, 2]) {
      const cx = x + ((u + spin) * 2 - 1 + k) * r;
      ctx.beginPath(); ctx.ellipse(cx, y + v * r, a * r, b * r, 0.3, 0, TAU); ctx.fill();
    }
  }
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  for (const [dx, dy, s] of [[-0.4, -0.55, 0.35], [0.35, 0.6, 0.3]]) cloud(ctx, x + dx * r, y + dy * r, s * r / 100, { alpha: 0.7 });
  // night side
  ctx.fillStyle = 'rgba(5,10,40,0.35)';
  ctx.beginPath(); ctx.arc(x + r * 0.55, y, r * 1.1, 0, TAU); ctx.fill();
  ctx.restore();
  if (o.face !== false) face(ctx, t, x - r * 0.1, y + r * 0.05, r * 0.55, { talk: o.talk ?? 0, mood: o.mood ?? 'happy' });
}

// Pill banner centred at (x,y) that pops in at t0 and (optionally) out at t1.
export function banner(ctx, t, s, x, y, t0, t1 = 1e9, o = {}) {
  const { size = 48, fill = C.gold, color = C.space, edge, pad = 46 } = o;
  const p = pop(t, t0, 0.42) * (1 - prog(t, t1 - 0.2, t1 + 0.05));
  if (p <= 0.01) return;
  const w = measure(ctx, s, size, ZH) + pad * 2, h = size * 2;
  around(ctx, x, y, p, p, () => {
    card(ctx, x - w / 2, y - h / 2, w, h, { fill, ew: edge ? 5 : 0, edge, r: h / 2, drop: edge ? 0 : 8 });
    txt(ctx, s, x, y + 1, { size, color });
  });
}

// Fan of atmosphere-emitted (cyan) infrared from (x,y) in the given angles (radians, 0 = right, π/2 = down).
export function emitFan(ctx, t, x, y, angles, len, p, o = {}) {
  angles.forEach((a, i) => {
    const q = clamp(p * angles.length - i * 0.6);
    irWave(ctx, t, x + Math.cos(a) * 50, y + Math.sin(a) * 50, x + Math.cos(a) * len, y + Math.sin(a) * len, q,
      { color: ATM, amp: 10, lambda: 52, w: 7, ...o });
  });
}

// Big ✗ / ✓ stamp.
export function verdict(ctx, x, y, s, ok) {
  ctx.save();
  ctx.fillStyle = ok ? C.ok : C.no;
  ctx.beginPath(); ctx.arc(x, y, 46 * s, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 12 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  if (ok) { ctx.moveTo(x - 20 * s, y + 2 * s); ctx.lineTo(x - 5 * s, y + 18 * s); ctx.lineTo(x + 22 * s, y - 16 * s); }
  else { ctx.moveTo(x - 18 * s, y - 18 * s); ctx.lineTo(x + 18 * s, y + 18 * s); ctx.moveTo(x + 18 * s, y - 18 * s); ctx.lineTo(x - 18 * s, y + 18 * s); }
  ctx.stroke();
  ctx.restore();
}
