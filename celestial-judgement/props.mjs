// Props: meteor streak, satellite, launch pad, textbook, orbit and tick/cross marks.
import { C, W, clamp, lerp, txt, SANS } from './lib.mjs';

const TAU = Math.PI * 2;

// A glowing meteor streak whose head is at (x,y) and tail points back along (dx,dy).
export function streak(ctx, x, y, dx, dy, len, w, a = 1) {
  if (a <= 0 || len <= 0) return;
  const L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  const tx = x - ux * len, ty = y - uy * len;
  const col = ['255,240,200', '255,170,70', '255,110,40'];
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

// Satellite: body + two solar wings; open 0 = folded against the body, 1 = fully deployed.
export function satellite(ctx, t, x, y, s, o = {}) {
  const { open = 1, rot = 0 } = o;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.lineJoin = 'round';
  for (const k of [-1, 1]) {
    const len = lerp(14, 150, open), hgt = lerp(110, 70, open);
    const x0 = k * 46;
    ctx.fillStyle = '#2f5fb3'; ctx.strokeStyle = '#9ec8ff'; ctx.lineWidth = 3;
    ctx.fillRect(Math.min(x0, x0 + k * len), -hgt / 2, len, hgt);
    ctx.strokeRect(Math.min(x0, x0 + k * len), -hgt / 2, len, hgt);
    const n = Math.max(1, Math.round(len / 30));
    for (let i = 1; i < n; i++) {
      const xx = x0 + k * (len * i) / n;
      ctx.beginPath(); ctx.moveTo(xx, -hgt / 2); ctx.lineTo(xx, hgt / 2); ctx.stroke();
    }
  }
  ctx.fillStyle = '#e9c46a'; ctx.strokeStyle = '#8a6a1f'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(-46, -60, 92, 120, 14); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#d0d6e6'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(0, -92); ctx.stroke();
  ctx.fillStyle = '#d0d6e6';
  ctx.beginPath(); ctx.ellipse(0, -96, 26, 9, 0, 0, TAU); ctx.fill();
  ctx.restore();
}

// Launch tower and pad standing on the ground at (x, y).
export function launchPad(ctx, x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#3a4466';
  ctx.fillRect(-200, -26, 400, 26);
  ctx.strokeStyle = '#e05a4a'; ctx.lineWidth = 8;
  ctx.strokeRect(-150, -520, 40, 494);
  for (let yy = -500; yy < -40; yy += 52) {
    ctx.beginPath(); ctx.moveTo(-150, yy); ctx.lineTo(-110, yy + 52); ctx.stroke();
  }
  ctx.lineWidth = 6;
  for (const yy of [-430, -260]) { ctx.beginPath(); ctx.moveTo(-110, yy); ctx.lineTo(-60, yy); ctx.stroke(); }
  ctx.restore();
}

// Rocket body that carries a folded satellite in its fairing; (x, y) = base.
export function rocket(ctx, x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#eef1f8'; ctx.strokeStyle = '#8a93ad'; ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-50, 0); ctx.lineTo(-50, -330); ctx.quadraticCurveTo(-50, -470, 0, -510); ctx.quadraticCurveTo(50, -470, 50, -330); ctx.lineTo(50, 0); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.red;
  ctx.fillRect(-50, -90, 100, 22);
  for (const k of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(k * 50, -110); ctx.lineTo(k * 92, -10); ctx.lineTo(k * 50, -10); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// Open textbook icon with a title on the left page.
export function book(ctx, x, y, s, title, sub) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#e0533d';
  ctx.beginPath(); ctx.roundRect(-250, -150, 500, 300, 22); ctx.fill();
  ctx.fillStyle = '#fffaf0';
  ctx.beginPath(); ctx.moveTo(0, -128); ctx.quadraticCurveTo(-120, -150, -236, -128); ctx.lineTo(-236, 132); ctx.quadraticCurveTo(-120, 112, 0, 134); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, -128); ctx.quadraticCurveTo(120, -150, 236, -128); ctx.lineTo(236, 132); ctx.quadraticCurveTo(120, 112, 0, 134); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, -128); ctx.lineTo(0, 134); ctx.stroke();
  txt(ctx, title, -118, -60, { size: 46, color: C.ink });
  txt(ctx, sub, -118, 6, { size: 30, font: SANS, color: '#6b5a8a' });
  ctx.strokeStyle = 'rgba(80,60,120,0.25)'; ctx.lineWidth = 6;
  for (let i = 0; i < 5; i++) {
    const yy = -70 + i * 38;
    ctx.beginPath(); ctx.moveTo(40, yy); ctx.lineTo(210 - (i % 2) * 40, yy); ctx.stroke();
  }
  ctx.restore();
}

export function orbit(ctx, cx, cy, rx, ry, p = 1, color = 'rgba(255,255,255,0.4)') {
  if (p <= 0) return;
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.setLineDash([12, 14]);
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

// Applicant number ticket, e.g. 「1 号选手」, centred at (x, y).
export function ticket(ctx, x, y, n, color = C.gold) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect(x - 130, y - 38, 260, 76, 38); ctx.fill();
  ctx.restore();
  txt(ctx, `${n} 号选手`, x, y + 2, { size: 44, color: C.ink });
}

// Gradient atmosphere band between yTop and yBottom (no hard upper edge).
export function atmosphere(ctx, yTop, yBottom) {
  const g = ctx.createLinearGradient(0, yTop, 0, yBottom);
  g.addColorStop(0, 'rgba(80,160,255,0)'); g.addColorStop(0.5, 'rgba(80,160,255,0.22)'); g.addColorStop(1, 'rgba(120,200,255,0.45)');
  ctx.fillStyle = g;
  ctx.fillRect(0, yTop, W, yBottom - yTop);
}
