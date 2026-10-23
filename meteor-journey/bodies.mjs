// Characters and props: the talking space rock, Earth, meteor streaks, compressed-air glow, ground and people.
import { W, H, C, clamp, lerp, rand } from './lib.mjs';

const TAU = Math.PI * 2;

// Lumpy outline shared by every rock (seeded so each rock keeps its own shape).
function rockPath(ctx, x, y, r, seed, rot) {
  const n = 13, pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + rot;
    const rr = r * (0.82 + 0.26 * rand(seed * 31 + i));
    pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.9]);
  }
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const p = pts[i % n], q = pts[(i + 1) % n];
    const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    if (i === 0) ctx.moveTo(mx, my); else ctx.quadraticCurveTo(p[0], p[1], mx, my);
  }
  ctx.closePath();
}

// Plain space rock (no face) — background debris, fragments and the meteorite on display.
export function rock(ctx, x, y, r, o = {}) {
  const { seed = 1, rot = 0, heat = 0, crust = 0 } = o;
  ctx.save();
  rockPath(ctx, x, y, r, seed, rot);
  const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.1, x, y, r * 1.1);
  g.addColorStop(0, crust > 0.5 ? '#5a4f49' : C.rockLight);
  g.addColorStop(0.55, crust > 0.5 ? C.crust : C.rock);
  g.addColorStop(1, crust > 0.5 ? '#141110' : C.rockDark);
  ctx.fillStyle = g; ctx.fill();
  ctx.clip();
  for (let k = 0; k < 4; k++) {
    const cx = x + (rand(seed + k * 7) - 0.5) * r * 1.2, cy = y + (rand(seed + k * 11) - 0.5) * r * 1.1;
    ctx.fillStyle = 'rgba(40,30,30,0.28)';
    ctx.beginPath(); ctx.arc(cx, cy, r * (0.1 + 0.1 * rand(seed + k)), 0, TAU); ctx.fill();
  }
  if (heat > 0) {
    const hg = ctx.createRadialGradient(x - r * 0.6, y + r * 0.6, 0, x, y, r * 1.3);
    hg.addColorStop(0, `rgba(255,220,120,${0.95 * heat})`);
    hg.addColorStop(0.5, `rgba(255,110,40,${0.75 * heat})`);
    hg.addColorStop(1, `rgba(200,40,20,${0.25 * heat})`);
    ctx.fillStyle = hg; ctx.fillRect(x - r * 2, y - r * 2, r * 4, r * 4);
  }
  if (crust > 0) {
    // glossy highlight of the fusion crust
    ctx.strokeStyle = `rgba(255,255,255,${0.55 * crust})`;
    ctx.lineWidth = r * 0.08; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x - r * 0.15, y - r * 0.1, r * 0.62, -2.6, -1.7); ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  rockPath(ctx, x, y, r, seed, rot);
  ctx.strokeStyle = 'rgba(20,12,40,0.9)'; ctx.lineWidth = Math.max(3, r * 0.06); ctx.stroke();
  ctx.restore();
}

// The hero: a rock with a face. mood: happy | excited | hot | proud | worried
export function rockGuy(ctx, t, x, y, r, o = {}) {
  const { mood = 'happy', talk = 0, heat = 0, crust = 0, rot = 0, look = [0, 0], wave = 0 } = o;
  rock(ctx, x, y, r, { seed: 5, rot, heat, crust });
  const ex = look[0] * r * 0.08, ey = look[1] * r * 0.08;
  const blink = (t % 3.3) < 0.12 ? 0.15 : 1;
  const eyeY = y - r * 0.12, gap = r * 0.32, er = r * 0.17;
  ctx.save();
  // blush
  ctx.fillStyle = mood === 'hot' ? 'rgba(255,70,50,0.75)' : 'rgba(255,140,170,0.6)';
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + s * r * 0.5, y + r * 0.18, r * 0.13, r * 0.08, 0, 0, TAU); ctx.fill(); }
  for (const s of [-1, 1]) {
    const cx = x + s * gap;
    if (mood === 'hot') {
      // squeezed >< eyes
      ctx.strokeStyle = C.ink; ctx.lineWidth = r * 0.07; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx - s * er, eyeY - er * 0.7); ctx.lineTo(cx + s * er * 0.6, eyeY); ctx.lineTo(cx - s * er, eyeY + er * 0.7); ctx.stroke();
      continue;
    }
    if (mood === 'proud') {
      ctx.strokeStyle = C.ink; ctx.lineWidth = r * 0.07; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx, eyeY + er * 0.4, er * 0.8, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      continue;
    }
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(cx, eyeY, er, er * 1.15 * blink, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.ellipse(cx + ex, eyeY + ey + er * 0.1, er * 0.6, er * 0.7 * blink, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx + ex - er * 0.2, eyeY + ey - er * 0.2, er * 0.2 * blink, 0, TAU); ctx.fill();
    if (mood === 'excited') {
      ctx.fillStyle = C.gold;
      ctx.save(); ctx.translate(cx + ex, eyeY + ey); ctx.beginPath();
      for (let i = 0; i < 8; i++) { const rr = i % 2 ? er * 0.18 : er * 0.42, a = i * Math.PI / 4; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      ctx.fill(); ctx.restore();
    }
  }
  // brows when worried
  if (mood === 'worried') {
    ctx.strokeStyle = C.ink; ctx.lineWidth = r * 0.05; ctx.lineCap = 'round';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * gap * 0.6, eyeY - er * 1.5); ctx.lineTo(x + s * gap * 1.3, eyeY - er * 1.9); ctx.stroke(); }
  }
  // mouth
  const my = y + r * 0.3;
  ctx.fillStyle = '#5a1730'; ctx.strokeStyle = C.ink; ctx.lineWidth = r * 0.05;
  const open = talk > 0 ? talk : mood === 'excited' || mood === 'hot' ? 0.6 : 0;
  if (open > 0) {
    ctx.beginPath(); ctx.ellipse(x, my + r * 0.04, r * 0.16, r * (0.05 + 0.13 * open), 0, 0, TAU); ctx.fill(); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(x, my - r * 0.06, r * 0.16, 0.2, Math.PI - 0.2); ctx.stroke();
  }
  // sweat drops when hot
  if (mood === 'hot' || mood === 'worried') {
    for (let k = 0; k < 2; k++) {
      const ph = (t * 1.6 + k * 0.5) % 1;
      const sx = x + (k ? 1 : -1) * r * 0.85, sy = y - r * 0.5 + ph * r * 0.6;
      ctx.fillStyle = `rgba(140,220,255,${1 - ph})`;
      ctx.beginPath(); ctx.moveTo(sx, sy - r * 0.14); ctx.quadraticCurveTo(sx + r * 0.09, sy, sx, sy + r * 0.05);
      ctx.quadraticCurveTo(sx - r * 0.09, sy, sx, sy - r * 0.14); ctx.fill();
    }
  }
  // a little waving arm
  if (wave > 0) {
    const a = -0.9 + Math.sin(t * 10) * 0.4;
    const bx = x + r * 0.78, by = y + r * 0.1;
    const hx = bx + Math.cos(a) * r * 0.32, hy = by + Math.sin(a) * r * 0.32;
    ctx.globalAlpha *= wave;
    ctx.strokeStyle = C.rockDark; ctx.lineWidth = r * 0.16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = C.rockLight; ctx.strokeStyle = C.ink; ctx.lineWidth = r * 0.035;
    ctx.beginPath(); ctx.arc(hx, hy, r * 0.12, 0, TAU); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

// Earth seen from space, lit from the upper left, with a thin glowing atmosphere.
export function earth(ctx, t, x, y, r) {
  ctx.save();
  const halo = ctx.createRadialGradient(x, y, r * 0.95, x, y, r * 1.18);
  halo.addColorStop(0, 'rgba(120,200,255,0.55)'); halo.addColorStop(1, 'rgba(120,200,255,0)');
  ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, y, r * 1.18, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  ctx.fillStyle = C.blue; ctx.fillRect(x - r, y - r, r * 2, r * 2);
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

// A glowing meteor streak whose head is at (x,y) and tail points back along (dx,dy).
export function streak(ctx, x, y, dx, dy, len, w, a = 1, hue = 'warm') {
  if (a <= 0 || len <= 0) return;
  const L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  const tx = x - ux * len, ty = y - uy * len;
  const col = hue === 'warm' ? ['255,240,200', '255,170,70', '255,110,40'] : ['230,250,255', '150,220,255', '90,160,255'];
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.lineCap = 'round';
  const g = ctx.createLinearGradient(x, y, tx, ty);
  g.addColorStop(0, `rgba(${col[1]},0.9)`); g.addColorStop(0.4, `rgba(${col[2]},0.45)`); g.addColorStop(1, `rgba(${col[2]},0)`);
  ctx.strokeStyle = g; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.stroke();
  const g2 = ctx.createLinearGradient(x, y, x - ux * len * 0.6, y - uy * len * 0.6);
  g2.addColorStop(0, `rgba(${col[0]},1)`); g2.addColorStop(1, `rgba(${col[0]},0)`);
  ctx.strokeStyle = g2; ctx.lineWidth = w * 0.35;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - ux * len * 0.6, y - uy * len * 0.6); ctx.stroke();
  const hg = ctx.createRadialGradient(x, y, 0, x, y, w * 1.8);
  hg.addColorStop(0, `rgba(${col[0]},1)`); hg.addColorStop(0.4, `rgba(${col[1]},0.6)`); hg.addColorStop(1, `rgba(${col[2]},0)`);
  ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, y, w * 1.8, 0, TAU); ctx.fill();
  ctx.restore();
}

// Compressed, glowing air cap in front of a body moving along (dx,dy): nested arcs that flicker.
export function airCap(ctx, t, x, y, dx, dy, r, a = 1) {
  if (a <= 0) return;
  const ang = Math.atan2(dy, dx);
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.translate(x, y); ctx.rotate(ang);
  const g = ctx.createRadialGradient(r * 0.4, 0, 0, r * 0.4, 0, r * 1.9);
  g.addColorStop(0, 'rgba(255,250,220,0.95)'); g.addColorStop(0.35, 'rgba(255,190,90,0.7)'); g.addColorStop(1, 'rgba(255,90,40,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(r * 0.3, 0, r * 1.6, r * 1.8, 0, -Math.PI / 2, Math.PI / 2); ctx.fill();
  for (let k = 0; k < 3; k++) {
    const rr = r * (1.25 + k * 0.35) + Math.sin(t * 30 + k) * 4;
    ctx.strokeStyle = `rgba(255,${230 - k * 40},${160 - k * 50},${0.85 - k * 0.22})`;
    ctx.lineWidth = 7 - k * 2;
    ctx.beginPath(); ctx.arc(-r * 0.2, 0, rr, -1.15, 1.15); ctx.stroke();
  }
  ctx.restore();
}

// Rolling ground band at the bottom with a horizon arc.
export function ground(ctx, y, o = {}) {
  const { color = '#2d3f3a', top = '#4f7a5c', curve = 60 } = o;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(0, y + curve); ctx.quadraticCurveTo(W / 2, y - curve, W, y + curve); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = top; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(0, y + curve); ctx.quadraticCurveTo(W / 2, y - curve, W, y + curve); ctx.stroke();
  ctx.restore();
}

// Simple silhouette of a person; pose: wish | point | run
export function person(ctx, t, x, y, s, o = {}) {
  const { pose = 'wish', color = '#0b0f2a' } = o;
  ctx.save();
  ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineWidth = 14 * s;
  ctx.beginPath(); ctx.arc(x, y - 150 * s, 30 * s, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.roundRect(x - 30 * s, y - 115 * s, 60 * s, 85 * s, 22 * s); ctx.fill();
  const sw = pose === 'run' ? Math.sin(t * 14) * 0.6 : 0;
  for (const k of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(x + k * 12 * s, y - 35 * s);
    ctx.lineTo(x + k * 12 * s + Math.sin(sw * k) * 40 * s, y); ctx.stroke();
  }
  if (pose === 'wish') {
    ctx.beginPath(); ctx.moveTo(x - 20 * s, y - 100 * s); ctx.lineTo(x, y - 128 * s); ctx.lineTo(x + 20 * s, y - 100 * s); ctx.stroke();
  } else if (pose === 'point') {
    ctx.beginPath(); ctx.moveTo(x + 20 * s, y - 100 * s); ctx.lineTo(x + 75 * s, y - 175 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 20 * s, y - 100 * s); ctx.lineTo(x - 40 * s, y - 55 * s); ctx.stroke();
  } else {
    for (const k of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(x + k * 22 * s, y - 100 * s);
      ctx.lineTo(x + k * 22 * s - Math.sin(sw * k) * 40 * s, y - 60 * s); ctx.stroke();
    }
  }
  ctx.restore();
}

// Draws dust motes that shrink and vanish between t0 and t1 (material lost in the air).
export function ablate(ctx, t, t0, t1, x, y, dx, dy, n = 14) {
  const L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  for (let i = 0; i < n; i++) {
    const ph = ((t - t0) * 1.4 + rand(i)) % 1;
    if (t < t0 || t > t1 + 0.6) continue;
    const d = 30 + ph * 260, side = (rand(i + 4) - 0.5) * 120 * ph;
    const px = x - ux * d - uy * side, py = y - uy * d + ux * side;
    ctx.fillStyle = `rgba(255,${180 + 60 * rand(i)},${90 + 80 * rand(i + 1)},${(1 - ph) * 0.9})`;
    ctx.beginPath(); ctx.arc(px, py, (1 - ph) * 9 + 2, 0, TAU); ctx.fill();
  }
}
