// Props for the "宇宙身份登记处": ID cards, stamps, the office sign, icons, bubbles and the man-made satellite.
import { C, ZH, clamp, lerp, easeOut, txt, card, measure } from './lib.mjs';
import { glow, face } from './bodies.mjs';

const TAU = Math.PI * 2;
export const STAMP = { star: '#ff5a4e', planet: '#2fa8ff', moon: '#b06cff' };

// Rubber stamp that slams down from big to normal as p goes 0 -> 1.
export function stamp(ctx, x, y, s, text, color, p, rot = -0.16) {
  if (p <= 0) return;
  const k = easeOut(clamp(p));
  const sc = s * lerp(2.6, 1, k);
  ctx.save();
  ctx.globalAlpha *= clamp(p * 3);
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.font = `86px ${ZH}`;
  const w = ctx.measureText(text).width + 70;
  ctx.strokeStyle = color; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.roundRect(-w / 2, -64, w, 128, 22); ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(-w / 2 + 12, -52, w - 24, 104, 14); ctx.stroke();
  txt(ctx, text, 0, 4, { size: 86, color });
  // ink speckles so it reads as a real stamp
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  for (let i = 0; i < 18; i++) {
    const a = Math.sin(i * 91.3) * 0.5 + 0.5, b = Math.sin(i * 47.9) * 0.5 + 0.5;
    ctx.beginPath(); ctx.arc((a - 0.5) * w, (b - 0.5) * 110, 3 + (i % 3), 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// The cosmic ID card. o: { name, light, orbit, cat, color, stampP, portrait(ctx,x,y,r), rows }
export function idCard(ctx, t, x, y, s, o) {
  const w = 860, h = 470;
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-w / 2, -h / 2);
  card(ctx, 0, 0, w, h, { fill: '#fdf6e6', edge: '#b88a3a', ew: 6, drop: 14, r: 34 });
  ctx.fillStyle = '#17325a';
  ctx.beginPath(); ctx.roundRect(0, 0, w, 92, [34, 34, 0, 0]); ctx.fill();
  txt(ctx, '宇宙身份证', 40, 48, { size: 48, align: 'left', color: C.gold });
  txt(ctx, 'COSMIC ID', w - 40, 50, { size: 30, align: 'right', color: '#9fb6d8', font: 'RoundB' });
  // portrait
  ctx.fillStyle = '#0d1a3a';
  ctx.beginPath(); ctx.roundRect(36, 124, 250, 300, 22); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.roundRect(36, 124, 250, 300, 22); ctx.clip();
  o.portrait(ctx, 161, 274, 92);
  ctx.restore();
  const rows = [['姓名', o.name, 0], ['光源', o.light, 1], ['轨道', o.orbit, 2]];
  rows.forEach(([k, v, i]) => {
    const ry = 162 + i * 92;
    const a = o.rows ? clamp(o.rows[i]) : 1;
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    txt(ctx, k, 318, ry, { size: 36, align: 'left', color: '#8a6a3a' });
    txt(ctx, v, 408, ry, { size: v.length > 8 ? 36 : 44, align: 'left', color: '#17325a' });
    ctx.strokeStyle = 'rgba(23,50,90,0.15)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(318, ry + 38); ctx.lineTo(w - 36, ry + 38); ctx.stroke();
    ctx.restore();
  });
  txt(ctx, '类别', 318, 162 + 3 * 92, { size: 36, align: 'left', color: '#8a6a3a' });
  stamp(ctx, 620, 162 + 3 * 92 - 4, 0.62, o.cat, o.color, o.stampP ?? 0);
  ctx.restore();
}

// Hanging office sign at the top of the frame.
export function officeSign(ctx, t, x, y, p) {
  if (p <= 0) return;
  const drop = lerp(-260, 0, easeOut(p)) + Math.sin(t * 2) * 4;
  ctx.save();
  ctx.translate(x, y + drop); ctx.rotate(Math.sin(t * 1.6) * 0.012);
  ctx.strokeStyle = '#c9a35a'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-260, -60); ctx.lineTo(-220, -200); ctx.moveTo(260, -60); ctx.lineTo(220, -200); ctx.stroke();
  card(ctx, -360, -66, 720, 132, { fill: '#17325a', edge: C.gold, ew: 6, drop: 10, r: 26 });
  txt(ctx, '宇宙身份登记处', 0, -4, { size: 74, color: C.gold });
  for (const k of [-1, 1]) {
    const on = (Math.floor(t * 3) + (k > 0 ? 1 : 0)) % 2;
    glow(ctx, k * 330, -36, 0, 18, on ? 'rgba(255,230,140,0.9)' : 'rgba(255,230,140,0.3)');
  }
  ctx.restore();
}

export function bulb(ctx, x, y, s, on = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (on > 0) glow(ctx, 0, -10, 10, 90, `rgba(255,220,90,${0.55 * on})`);
  ctx.fillStyle = on > 0.5 ? '#ffe066' : '#d8d8e0';
  ctx.beginPath(); ctx.arc(0, -14, 38, Math.PI * 0.8, Math.PI * 2.2); ctx.lineTo(16, 34); ctx.lineTo(-16, 34); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8a95b0';
  ctx.beginPath(); ctx.roundRect(-18, 34, 36, 22, 6); ctx.fill();
  ctx.restore();
}

export function orbitIcon(ctx, t, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 5; ctx.setLineDash([9, 8]);
  ctx.beginPath(); ctx.ellipse(0, 0, 56, 30, 0, 0, TAU); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(0, 0, 16, 0, TAU); ctx.fill();
  const a = t * 2.2;
  ctx.fillStyle = C.sky; ctx.beginPath(); ctx.arc(Math.cos(a) * 56, Math.sin(a) * 30, 11, 0, TAU); ctx.fill();
  ctx.restore();
}

// Speech bubble pointing toward (tx,ty).
export function bubble(ctx, x, y, text, o = {}) {
  const { size = 50, fill = '#ffffff', color = C.ink, tx = x, ty = y + 120 } = o;
  const w = measure(ctx, text, size) + 64, h = size + 46;
  ctx.save();
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2); ctx.fill();
  const bx = clamp(tx, x - w / 2 + 40, x + w / 2 - 40);
  ctx.beginPath(); ctx.moveTo(bx - 22, y + h / 2 - 4); ctx.lineTo(tx, ty); ctx.lineTo(bx + 22, y + h / 2 - 4); ctx.closePath(); ctx.fill();
  ctx.restore();
  txt(ctx, text, x, y + 2, { size, color });
}

export function sunglasses(ctx, x, y, r) {
  const s = r / 100;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#111'; ctx.strokeStyle = '#111'; ctx.lineWidth = 7;
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.roundRect(k * 34 - 28, -30, 56, 36, 14); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(8, -18); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(k * 34 - 10, -20, 9, 5, -0.4, 0, TAU); ctx.fill(); }
  ctx.restore();
}

export function sweat(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#8fd8ff';
  ctx.beginPath(); ctx.moveTo(0, -28); ctx.quadraticCurveTo(20, 4, 0, 14); ctx.quadraticCurveTo(-20, 4, 0, -28); ctx.fill();
  ctx.restore();
}

// Infrared goggles.
export function goggles(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#2a2f45';
  ctx.beginPath(); ctx.roundRect(-120, -40, 240, 80, 34); ctx.fill();
  for (const k of [-1, 1]) {
    const g = ctx.createRadialGradient(k * 55, 0, 4, k * 55, 0, 34);
    g.addColorStop(0, '#ffd166'); g.addColorStop(0.5, '#ff4d6d'); g.addColorStop(1, '#5b2a86');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(k * 55, 0, 30, 0, TAU); ctx.fill();
  }
  txt(ctx, 'IR', 0, 2, { size: 30, color: '#ffd166', font: 'RoundB' });
  ctx.restore();
}

export function lightSwitch(ctx, x, y, s, on) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  card(ctx, -60, -90, 120, 180, { fill: '#f1f3f8', edge: '#8a95b0', ew: 5, drop: 8, r: 20 });
  ctx.fillStyle = '#c7cede'; ctx.beginPath(); ctx.roundRect(-30, -60, 60, 120, 14); ctx.fill();
  ctx.fillStyle = on ? C.ok : C.no;
  ctx.beginPath(); ctx.roundRect(-26, on ? -56 : 4, 52, 52, 12); ctx.fill();
  txt(ctx, on ? '开' : '关', 0, on ? -30 : 30, { size: 34, color: '#fff' });
  ctx.restore();
}

// Man-made satellite with a little face on its body.
export function satellite(ctx, t, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? Math.sin(t * 2) * 0.12); ctx.scale(s, s);
  ctx.fillStyle = '#2f5fb3'; ctx.strokeStyle = '#9ec8ff'; ctx.lineWidth = 3;
  for (const k of [-1, 1]) {
    const px = k < 0 ? -190 : 70;
    ctx.fillRect(px, -36, 120, 72); ctx.strokeRect(px, -36, 120, 72);
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(px + i * 30, -36); ctx.lineTo(px + i * 30, 36); ctx.stroke(); }
  }
  ctx.fillStyle = '#c9ccd6'; ctx.fillRect(-70, -6, 140, 12);
  ctx.fillStyle = '#f0c040';
  ctx.beginPath(); ctx.roundRect(-66, -66, 132, 132, 22); ctx.fill();
  ctx.strokeStyle = '#ddd'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(0, -66); ctx.lineTo(0, -110); ctx.stroke();
  ctx.fillStyle = '#ddd'; ctx.beginPath(); ctx.arc(0, -116, 12, 0, TAU); ctx.fill();
  ctx.restore();
  face(ctx, t, x, y + 6 * s, 62 * s, o);
}

export function eye(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(-60, 0); ctx.quadraticCurveTo(0, -50, 60, 0); ctx.quadraticCurveTo(0, 50, -60, 0); ctx.fill();
  ctx.fillStyle = '#3a6fd8'; ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.fill();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.fill();
  ctx.restore();
}
