// Props: mountain, thermometer, cloud, infrared wave, lake, heat token, route icons and the "示意" disclaimer tag.
import { C, ZH, clamp, lerp, txt, card } from './lib.mjs';
import { glow, mix } from './chars.mjs';

const TAU = Math.PI * 2;

// Snow-capped mountain with its base on y and peak at (px, py).
export function mountain(ctx, x0, x1, y, px, py) {
  ctx.save();
  const g = ctx.createLinearGradient(0, py, 0, y);
  g.addColorStop(0, '#9fb3dc'); g.addColorStop(0.55, C.rock); g.addColorStop(1, '#3f6b55');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(px - 60, py + 50); ctx.quadraticCurveTo(px, py - 20, px + 60, py + 50); ctx.lineTo(x1, y); ctx.closePath(); ctx.fill();
  // snow cap
  const k = (yy) => [lerp(px - 60, x0, (yy - py - 50) / (y - py - 50)), lerp(px + 60, x1, (yy - py - 50) / (y - py - 50))];
  const [l, r] = k(py + 150);
  ctx.fillStyle = C.snow;
  ctx.beginPath(); ctx.moveTo(px - 60, py + 50); ctx.quadraticCurveTo(px, py - 20, px + 60, py + 50); ctx.lineTo(r, py + 150);
  ctx.lineTo(lerp(l, r, 0.7), py + 120); ctx.lineTo(lerp(l, r, 0.45), py + 160); ctx.lineTo(lerp(l, r, 0.2), py + 125); ctx.lineTo(l, py + 150);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

// Cartoon thermometer; level 0..1, bulb at (x,y).
export function thermo(ctx, x, y, h, level, o = {}) {
  const { label, color = mix(C.cool, C.hot, level) } = o;
  ctx.save();
  card(ctx, x - 22, y - h, 44, h, { fill: '#f4f7ff', edge: C.ink, ew: 5, r: 22, drop: 0 });
  ctx.fillStyle = color;
  const lh = (h - 40) * clamp(level);
  ctx.beginPath(); ctx.roundRect(x - 10, y - 20 - lh, 20, lh + 20, 10); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y + 14, 36, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
  ctx.restore();
  if (label) txt(ctx, label, x, y + 14, { size: 30, color: '#fff', stroke: C.ink, sw: 6 });
}

// Puffy cloud centred on (x,y); s = scale.
export function cloud(ctx, x, y, s, o = {}) {
  const { color = '#ffffff', alpha = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (const [dx, dy, r] of [[-70, 10, 50], [-20, -25, 65], [45, -10, 55], [85, 18, 40], [0, 25, 55]]) {
    ctx.moveTo(x + dx * s + r * s, y + dy * s);
    ctx.arc(x + dx * s, y + dy * s, r * s, 0, TAU);
  }
  ctx.fill();
  ctx.restore();
}

// Infrared wave travelling from (x1,y1) toward (x2,y2): p = how far the head has got (0..1). o.dash for "passes on".
export function irWave(ctx, t, x1, y1, x2, y2, p, o = {}) {
  const { color = C.ir, w = 9, amp = 16, lambda = 70, alpha = 1, dash, head = true } = o;
  if (p <= 0) return;
  const L = Math.hypot(x2 - x1, y2 - y1), ang = Math.atan2(y2 - y1, x2 - x1), len = L * clamp(p);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x1, y1); ctx.rotate(ang);
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.shadowColor = color; ctx.shadowBlur = 16;
  ctx.beginPath();
  for (let s = 0; s <= len; s += 4) {
    const yy = amp * Math.sin((s / lambda) * TAU - t * 10) * Math.min(1, s / 30, (len - s) / 30 + 0.3);
    s ? ctx.lineTo(s, yy) : ctx.moveTo(s, yy);
  }
  ctx.stroke();
  if (head && p < 1) {
    ctx.setLineDash([]);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(len + 26, 0); ctx.lineTo(len - 6, -18); ctx.lineTo(len - 6, 18); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// Lake surface set into the ground: a lens from x0..x1 with its surface at y.
export function lake(ctx, t, x0, x1, y, depth) {
  ctx.save();
  const g = ctx.createLinearGradient(0, y, 0, y + depth);
  g.addColorStop(0, '#47b6ff'); g.addColorStop(1, '#1b5fa8');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.quadraticCurveTo((x0 + x1) / 2, y + depth * 2, x1, y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const xx = lerp(x0 + 60, x1 - 120, ((t * 0.15 + i / 3) % 1));
    ctx.beginPath(); ctx.moveTo(xx, y + 16 + i * 8); ctx.lineTo(xx + 50, y + 16 + i * 8); ctx.stroke();
  }
  ctx.restore();
}

// A small glowing flame = "a parcel of heat".
export function heatToken(ctx, t, x, y, s = 1, alpha = 1) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  glow(ctx, x, y, 4 * s, 34 * s, 'rgba(255,150,60,0.6)');
  const f = 1 + 0.08 * Math.sin(t * 18 + x);
  ctx.translate(x, y); ctx.scale(s, s * f);
  ctx.fillStyle = C.hot;
  ctx.beginPath(); ctx.moveTo(0, -26); ctx.bezierCurveTo(16, -8, 18, 6, 0, 18); ctx.bezierCurveTo(-18, 6, -16, -8, 0, -26); ctx.fill();
  ctx.fillStyle = C.gold;
  ctx.beginPath(); ctx.moveTo(0, -8); ctx.bezierCurveTo(8, 2, 9, 9, 0, 15); ctx.bezierCurveTo(-9, 9, -8, 2, 0, -8); ctx.fill();
  ctx.restore();
}

// Route icons used on the "three routes" cards: 0 = radiation, 1 = convection, 2 = water relay.
export function routeIcon(ctx, t, i, x, y, s = 1) {
  ctx.save();
  if (i === 0) {
    for (let k = -1; k <= 1; k++) irWave(ctx, t, x + k * 34 * s, y + 46 * s, x + k * 34 * s, y - 46 * s, 1, { amp: 8 * s, lambda: 34 * s, w: 7 * s, head: false });
  } else if (i === 1) {
    ctx.strokeStyle = C.warm; ctx.lineWidth = 9 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y, 40 * s, Math.PI * 0.75, Math.PI * 2.1); ctx.stroke();
    ctx.fillStyle = C.warm;
    const a = Math.PI * 2.1, hx = x + Math.cos(a) * 40 * s, hy = y + Math.sin(a) * 40 * s;
    ctx.beginPath(); ctx.moveTo(hx + 16 * s, hy - 6 * s); ctx.lineTo(hx - 12 * s, hy - 10 * s); ctx.lineTo(hx + 2 * s, hy + 16 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.cool;
    ctx.beginPath(); ctx.arc(x, y, 14 * s, 0, TAU); ctx.fill();
  } else {
    ctx.fillStyle = C.vapor;
    ctx.beginPath(); ctx.moveTo(x - 20 * s, y - 40 * s); ctx.bezierCurveTo(x - 2 * s, y - 12 * s, x + 2 * s, y + 20 * s, x - 20 * s, y + 24 * s);
    ctx.bezierCurveTo(x - 42 * s, y + 20 * s, x - 38 * s, y - 12 * s, x - 20 * s, y - 40 * s); ctx.fill();
    cloud(ctx, x + 22 * s, y - 14 * s, 0.32 * s);
    heatToken(ctx, t, x + 34 * s, y + 30 * s, 0.7 * s);
  }
  ctx.restore();
}

// Small pill reminding viewers the drawing is qualitative.
export function disclaimer(ctx, y = 1240, alpha = 1) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  const s = '示意图 · 箭头不代表能量多少';
  ctx.font = `26px ${ZH}`;
  const w = ctx.measureText(s).width + 40;
  ctx.fillStyle = 'rgba(6,10,35,0.55)';
  ctx.beginPath(); ctx.roundRect(470 - w / 2, y - 22, w, 44, 22); ctx.fill();
  ctx.restore();
  txt(ctx, s, 470, y + 1, { size: 26, color: `rgba(220,235,255,${0.85 * alpha})` });
}
