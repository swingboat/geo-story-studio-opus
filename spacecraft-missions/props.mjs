// Props: the job badge (工牌), banners, speech bubbles, ground station, phone, clocks and stamps.
import { C, TAU, ZH, clamp, lerp, easeOut, prog, pop, txt, measure, card, around } from './lib.mjs';
import { glow } from './chars.mjs';

// Rounded banner label that pops in at t0 and stays until t1.
export function banner(ctx, t, s, x, y, t0, t1 = 1e9, o = {}) {
  const { size = 50, fill = C.gold, color = C.space } = o;
  const p = pop(t, t0, 0.4), out = 1 - prog(t, t1, t1 + 0.25);
  if (p <= 0 || out <= 0) return;
  const w = measure(ctx, s, size) + size * 1.2, h = size * 1.7;
  around(ctx, x, y, p, out, () => {
    card(ctx, x - w / 2, y - h / 2, w, h, { fill, ew: 0, r: h / 2, drop: 8 });
    txt(ctx, s, x, y + 2, { size, color });
  });
}

// Speech bubble with a tail pointing to (tx,ty).
export function bubble(ctx, t, s, x, y, t0, o = {}) {
  const { size = 46, tx = x, ty = y + 120, fill = C.cream, color = C.ink, t1 = 1e9 } = o;
  const p = pop(t, t0, 0.4), out = 1 - prog(t, t1, t1 + 0.25);
  if (p <= 0 || out <= 0) return;
  const w = measure(ctx, s, size) + 64, h = size + 50;
  around(ctx, x, y, p, out, () => {
    ctx.fillStyle = fill;
    ctx.beginPath(); ctx.moveTo(x - 24, y + h / 2 - 4); ctx.lineTo(tx, ty); ctx.lineTo(x + 24, y + h / 2 - 4); ctx.fill();
    card(ctx, x - w / 2, y - h / 2, w, h, { fill, ew: 0, r: h / 2, drop: 6 });
    txt(ctx, s, x, y + 2, { size, color });
  });
}

// 工牌: a lanyard ID card. rows = [[label, value, tIn], ...]; each value is stamped in at tIn.
// icon(ctx, cx, cy) draws the portrait inside the photo box.
export function badge(ctx, t, x, y, s, o) {
  const { name, color, rows, icon, tIn = 0, swing = 1 } = o;
  const p = pop(t, tIn, 0.5);
  if (p <= 0) return;
  const w = 460, h = 300;
  const rot = swing * Math.sin(t * 2.2) * 0.025 + (1 - clamp(p)) * 0.4;
  around(ctx, x, y, s * p, 1, () => {
    ctx.strokeStyle = color; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(x - 60, y - h / 2 - 90); ctx.lineTo(x, y - h / 2 + 4); ctx.lineTo(x + 60, y - h / 2 - 90); ctx.stroke();
    card(ctx, x - w / 2, y - h / 2, w, h, { fill: C.cream, edge: C.ink, ew: 5, r: 26, drop: 10 });
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, 64, [26, 26, 0, 0]); ctx.fill();
    ctx.fillStyle = '#5b6380';
    ctx.beginPath(); ctx.roundRect(x - 28, y - h / 2 - 10, 56, 22, 8); ctx.fill();
    txt(ctx, name, x, y - h / 2 + 34, { size: 36, color: C.space });
    const px = x - w / 2 + 90, py = y + 30;
    ctx.fillStyle = '#16244f';
    ctx.beginPath(); ctx.roundRect(px - 66, py - 80, 132, 160, 18); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.roundRect(px - 66, py - 80, 132, 160, 18); ctx.clip();
    icon?.(ctx, px, py);
    ctx.restore();
    rows.forEach(([label, value, tv], i) => {
      const ry = y - 52 + i * 72, rx = x - w / 2 + 180;
      txt(ctx, label, rx, ry, { size: 26, color: 'rgba(43,26,85,0.55)', align: 'left' });
      ctx.strokeStyle = 'rgba(43,26,85,0.15)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(rx, ry + 30); ctx.lineTo(x + w / 2 - 24, ry + 30); ctx.stroke();
      const vp = pop(t, tv, 0.35);
      if (vp > 0) around(ctx, rx + 70, ry + 2, lerp(1.6, 1, clamp(vp)), clamp(vp * 2), () =>
        txt(ctx, value, rx + 70, ry + 2, { size: 34, color: C.ink, align: 'left' }));
    });
  }, rot);
}

// Rubber stamp text (e.g. 定位); p = progress from slam-in.
export function stamp(ctx, x, y, s, text, color, p, rot = -0.12) {
  if (p <= 0) return;
  const k = lerp(2.2, 1, easeOut(clamp(p)));
  around(ctx, x, y, s * k, clamp(p * 3), () => {
    const w = measure(ctx, text, 64) + 70;
    ctx.strokeStyle = color; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.roundRect(x - w / 2, y - 56, w, 112, 22); ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(x - w / 2 + 12, y - 44, w - 24, 88, 14); ctx.stroke();
    txt(ctx, text, x, y + 3, { size: 64, color });
  }, rot);
}

// Ground station: a dish on a little building; (x,y) = ground level.
export function groundStation(ctx, t, x, y, s, o = {}) {
  const { aim = -0.7 } = o;
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#dfe6f5'; ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.roundRect(-70, -70, 140, 70, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#2b3a7a';
  for (const dx of [-40, 0, 40]) { ctx.beginPath(); ctx.roundRect(dx - 12, -52, 24, 22, 4); ctx.fill(); }
  ctx.strokeStyle = C.ink; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(0, -110); ctx.stroke();
  ctx.translate(0, -120); ctx.rotate(aim + Math.PI / 2);
  ctx.fillStyle = C.hull; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.ellipse(0, 0, 80, 30, 0, Math.PI, TAU); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(0, -60); ctx.stroke();
  ctx.fillStyle = C.no; ctx.beginPath(); ctx.arc(0, -64, 8, 0, TAU); ctx.fill();
  ctx.restore();
}

// Big phone with a map; o.pin 0..1 drops the "you are here" pin; o.route 0..1 draws a navigation route.
export function phone(ctx, t, x, y, s, o = {}) {
  const { pin = 0, route = 0, calc = 0 } = o;
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  card(ctx, -120, -210, 240, 420, { fill: '#1b2246', edge: C.ink, ew: 6, r: 34, drop: 10 });
  ctx.save();
  ctx.beginPath(); ctx.roundRect(-100, -180, 200, 360, 18); ctx.clip();
  ctx.fillStyle = '#e8f4e4'; ctx.fillRect(-100, -180, 200, 360);
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 14;
  ctx.beginPath(); ctx.moveTo(-100, -40); ctx.lineTo(100, -60); ctx.moveTo(-30, -180); ctx.lineTo(-10, 180); ctx.moveTo(-100, 110); ctx.lineTo(100, 70); ctx.stroke();
  ctx.fillStyle = '#bfe3b4';
  ctx.beginPath(); ctx.roundRect(20, -160, 70, 80, 10); ctx.roundRect(-90, 0, 60, 90, 10); ctx.fill();
  ctx.fillStyle = '#9fd2ff';
  ctx.beginPath(); ctx.ellipse(50, 140, 60, 30, 0, 0, TAU); ctx.fill();
  if (route > 0) {
    ctx.strokeStyle = '#2f6fe0'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.setLineDash([400 * route, 1000]);
    ctx.beginPath(); ctx.moveTo(-18, 150); ctx.lineTo(-14, 92); ctx.lineTo(60, 76); ctx.lineTo(55, -50); ctx.lineTo(-20, -44); ctx.lineTo(-26, -150); ctx.stroke();
    ctx.setLineDash([]);
  }
  if (calc > 0 && calc < 1) {
    ctx.strokeStyle = 'rgba(47,111,224,0.6)'; ctx.lineWidth = 5;
    for (let i = 0; i < 3; i++) {
      const r = 30 + ((t * 120 + i * 40) % 120);
      ctx.beginPath(); ctx.arc(-14, 92, r, 0, TAU); ctx.stroke();
    }
  }
  ctx.restore();
  if (pin > 0) {
    const py = lerp(-140, 92, easeOut(clamp(pin))) - 4;
    glow(ctx, -14, 92, 4, 50 * clamp(pin), 'rgba(255,77,109,0.5)');
    ctx.fillStyle = C.no; ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(-14, py - 34, 24, Math.PI * 0.85, Math.PI * 2.15); ctx.lineTo(-14, py); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-14, py - 36, 9, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// Analogue clock; `time` in hours (fractional). o.ok draws a green rim (synced).
export function clock(ctx, x, y, r, time, o = {}) {
  const { ok = 0 } = o;
  ctx.save();
  ctx.fillStyle = C.cream; ctx.strokeStyle = ok > 0.5 ? C.ok : C.ink; ctx.lineWidth = r * 0.1;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.ink;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    ctx.beginPath(); ctx.arc(x + Math.sin(a) * r * 0.78, y - Math.cos(a) * r * 0.78, r * 0.05, 0, TAU); ctx.fill();
  }
  const hand = (a, len, w, col) => {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(a) * len, y - Math.cos(a) * len); ctx.stroke();
  };
  hand(((time % 12) / 12) * TAU, r * 0.5, r * 0.1, C.ink);
  hand(((time % 1) * TAU), r * 0.75, r * 0.06, C.no);
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, r * 0.08, 0, TAU); ctx.fill();
  ctx.restore();
}

// Floating astronaut buddy (small, round). (x,y) = helmet centre.
export function astro(ctx, t, x, y, s, o = {}) {
  const { rot = 0 } = o;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.fillStyle = '#f4f6ff';
  ctx.beginPath(); ctx.roundRect(-40, 36, 80, 90, 30); ctx.fill(); ctx.stroke();
  for (const k of [-1, 1]) {
    ctx.lineWidth = 26; ctx.strokeStyle = C.ink;
    ctx.beginPath(); ctx.moveTo(k * 36, 60); ctx.lineTo(k * 74, 40 + Math.sin(t * 3 + k) * 14); ctx.stroke();
    ctx.lineWidth = 16; ctx.strokeStyle = '#f4f6ff'; ctx.stroke();
    ctx.lineWidth = 26; ctx.strokeStyle = C.ink;
    ctx.beginPath(); ctx.moveTo(k * 20, 120); ctx.lineTo(k * 30, 160); ctx.stroke();
    ctx.lineWidth = 16; ctx.strokeStyle = '#f4f6ff'; ctx.stroke();
  }
  ctx.fillStyle = C.tg; ctx.fillRect(-38, 80, 76, 10);
  ctx.fillStyle = '#f4f6ff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(0, 0, 54, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#1d2b6b';
  ctx.beginPath(); ctx.ellipse(0, 4, 40, 32, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffd9b8';
  ctx.beginPath(); ctx.arc(0, 10, 26, 0, TAU); ctx.fill();
  ctx.fillStyle = C.ink;
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.arc(k * 9, 6, 3.5, 0, TAU); ctx.fill(); }
  ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 14, 8, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(0, 4, 30, -2.6, -1.9); ctx.stroke();
  ctx.restore();
}
