// Props: telescope with a solar filter, thought bubble, black hole, the Moon buddy, beach umbrella, the pressing hand, flares.
import { C, TAU, clamp, lerp, txt } from './lib.mjs';
import { face, glow } from './cast.mjs';

const INK = '#0a0828';

// Telescope on a tripod; the tube points along `ang` from its pivot (x,y). filter ∈ [0,1] slides a solar filter cap on.
export function telescope(ctx, t, x, y, s, o = {}) {
  const { ang = -0.6, filter = 0 } = o;
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.lineCap = 'round';
  for (const dx of [-90, 0, 90]) { ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(dx, 230); ctx.stroke(); }
  ctx.strokeStyle = '#8fa0d8'; ctx.lineWidth = 6;
  for (const dx of [-90, 0, 90]) { ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(dx, 230); ctx.stroke(); }
  ctx.rotate(ang);
  ctx.fillStyle = '#e9ecff'; ctx.strokeStyle = INK; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.roundRect(-110, -34, 300, 68, 18); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ff9f43';
  ctx.fillRect(-40, -34, 22, 68); ctx.strokeRect(-40, -34, 22, 68);
  ctx.fillStyle = '#c9cff2';
  ctx.beginPath(); ctx.roundRect(-150, -20, 48, 40, 10); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(186, -46, 30, 92, 10); ctx.fill(); ctx.stroke();
  if (filter > 0) {
    // the black solar-filter film slides onto the front of the tube
    const fx = lerp(330, 214, clamp(filter));
    ctx.globalAlpha *= clamp(filter * 2);
    ctx.fillStyle = '#1b1b2a';
    ctx.beginPath(); ctx.roundRect(fx, -54, 26, 108, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(200,210,255,0.5)';
    ctx.beginPath(); ctx.roundRect(fx + 6, -44, 6, 40, 3); ctx.fill();
  }
  ctx.restore();
}

// Cloud-shaped thought bubble with trailing dots toward (tx,ty); content(ctx) is clipped inside.
export function thought(ctx, x, y, w, h, tx, ty, p, content) {
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(p * 1.5);
  ctx.translate(x, y); ctx.scale(p, p); ctx.translate(-x, -y);
  const cloud = () => {
    ctx.beginPath();
    const n = 12;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      ctx.moveTo(x + Math.cos(a) * w * 0.46 + 70, y + Math.sin(a) * h * 0.42);
      ctx.arc(x + Math.cos(a) * w * 0.46, y + Math.sin(a) * h * 0.42, 70, 0, TAU);
    }
    ctx.ellipse(x, y, w * 0.48, h * 0.44, 0, 0, TAU);
  };
  ctx.fillStyle = INK; ctx.save(); ctx.translate(0, 8); cloud(); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#f4f6ff'; cloud(); ctx.fill();
  for (let i = 1; i <= 3; i++) {
    const k = i / 4;
    ctx.beginPath(); ctx.arc(lerp(x, tx, 0.45 + k * 0.5), lerp(y + h * 0.4, ty, 0.45 + k * 0.5), 26 - i * 6, 0, TAU); ctx.fill();
  }
  ctx.save();
  ctx.beginPath(); ctx.ellipse(x, y, w * 0.47, h * 0.43, 0, 0, TAU); ctx.clip();
  content(ctx);
  ctx.restore();
  ctx.restore();
}

// Black hole: a disk of nothing ringed by a thin photon glow, with light rays bending in and vanishing.
export function blackHole(ctx, t, x, y, r, o = {}) {
  const { a = 1, rays = 1, scared = 0 } = o;
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  glow(ctx, x, y, r * 0.9, r * 2.2, 'rgba(170,120,255,0.35)');
  ctx.save();
  ctx.translate(x, y); ctx.rotate(t * 0.8);
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgba(${i ? '200,170,255' : '255,220,170'},${0.55 - i * 0.15})`; ctx.lineWidth = 6 - i * 1.5;
    ctx.beginPath(); ctx.ellipse(0, 0, r * (1.12 + i * 0.16), r * (1.12 + i * 0.16), 0, i, i + 4.6); ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  if (rays > 0) {
    for (let i = 0; i < 7; i++) {
      const ph = (t * 0.55 + i / 7) % 1, a0 = (i / 7) * TAU + 0.4;
      const d = lerp(r * 3.1, r * 1.0, ph), sw = 0.9 * ph;
      const px = x + Math.cos(a0 + sw) * d, py = y + Math.sin(a0 + sw) * d;
      const qx = x + Math.cos(a0 + sw * 0.6) * (d + r * 0.5), qy = y + Math.sin(a0 + sw * 0.6) * (d + r * 0.5);
      ctx.strokeStyle = `rgba(255,242,140,${rays * (1 - ph) * 0.9})`; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(px, py); ctx.stroke();
    }
  }
  if (scared > 0) {
    ctx.globalAlpha *= scared;
    face(ctx, t, x, y + r * 0.1, r * 0.5, { mood: 'happy', ink: '#3a2a66' });
  }
  ctx.restore();
}

// The Moon buddy: cratered grey disk with a face.
export function moonBuddy(ctx, t, x, y, r, o = {}) {
  const { mood = 'happy', talk = 0, look = 0, a = 1 } = o;
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  glow(ctx, x, y, r * 0.8, r * 1.5, 'rgba(220,225,255,0.25)');
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#f1f2fa'); g.addColorStop(1, C.moonDark);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(140,145,170,0.5)';
  for (const [dx, dy, rr] of [[-0.5, -0.45, 0.16], [0.45, -0.5, 0.11], [0.55, 0.35, 0.14], [-0.55, 0.4, 0.1]]) {
    ctx.beginPath(); ctx.arc(x + dx * r, y + dy * r, rr * r, 0, TAU); ctx.fill();
  }
  ctx.strokeStyle = INK; ctx.lineWidth = Math.max(4, r * 0.04);
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  face(ctx, t, x, y + r * 0.08, r * 0.6, { mood, talk, look, ink: '#2b2b4a' });
  ctx.restore();
}

// Beach umbrella planted at (x,y) (the bottom of the pole), opened by p.
export function umbrella(ctx, x, y, s, p) {
  if (p <= 0) return;
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.18);
  ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -300); ctx.stroke();
  ctx.strokeStyle = '#e8e2d0'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -300); ctx.stroke();
  const w = 220 * p, top = -300 - 120 * p, base = -290;
  const dome = () => {
    ctx.beginPath();
    ctx.moveTo(-w, base);
    ctx.bezierCurveTo(-w, top, w, top, w, base);
    const n = 6;
    for (let i = n; i > 0; i--) {
      const x0 = -w + (2 * w * i) / n, x1 = -w + (2 * w * (i - 1)) / n;
      ctx.quadraticCurveTo((x0 + x1) / 2, base - 26 * p, x1, base);
    }
    ctx.closePath();
  };
  ctx.save();
  dome(); ctx.clip();
  const cols = [C.pink, '#fff', C.sky, '#fff', C.gold, '#fff'];
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = cols[i];
    ctx.fillRect(-w + (2 * w * i) / 6, top - 10, (2 * w) / 6 + 1, base - top + 20);
  }
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineJoin = 'round';
  dome(); ctx.stroke();
  ctx.restore();
}

// A big translucent cartoon glove pressing down with its palm centred at (x,y).
export function hand(ctx, x, y, s, a = 1) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a) * 0.85;
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(140,225,255,0.55)'; ctx.strokeStyle = 'rgba(220,250,255,0.95)'; ctx.lineWidth = 7; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.roundRect(-110, -170, 220, 170, 60); ctx.fill(); ctx.stroke();
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.roundRect(-104 + i * 54, -40, 46, 92 - Math.abs(i - 1.5) * 12, 23); ctx.fill(); ctx.stroke();
  }
  ctx.beginPath(); ctx.roundRect(-150, -120, 50, 110, 25); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-90, -280, 180, 120, 30); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// Flare: a quick white-gold flash with a little arching filament, peaking at t0.
export function flare(ctx, t, t0, x, y, r, ang = -0.6) {
  const p = clamp((t - t0 + 0.15) / 1.1);
  if (p <= 0 || p >= 1) return;
  const k = Math.sin(Math.PI * p);
  ctx.save();
  glow(ctx, x, y, 0, r * (1 + k), `rgba(255,255,230,${0.9 * k})`);
  ctx.strokeStyle = `rgba(255,240,170,${k})`; ctx.lineWidth = r * 0.12; ctx.lineCap = 'round';
  ctx.translate(x, y); ctx.rotate(ang);
  ctx.beginPath(); ctx.moveTo(-r * 0.4, 0); ctx.bezierCurveTo(-r * 0.5, -r * 1.3 * k, r * 0.5, -r * 1.3 * k, r * 0.4, 0); ctx.stroke();
  ctx.restore();
}

// A little "speed / shock" wobble of lines around a point, for gags.
export function shockLines(ctx, t, x, y, r, a = 1, color = C.gold) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * TAU + 0.2, j = 1 + 0.12 * Math.sin(t * 20 + i);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(ang) * r * j, y + Math.sin(ang) * r * j);
    ctx.lineTo(x + Math.cos(ang) * r * 1.3 * j, y + Math.sin(ang) * r * 1.3 * j);
    ctx.stroke();
  }
  ctx.restore();
}

// Steam / heat squiggles rising from (x,y): for 小宇 getting toasted.
export function steam(ctx, t, x, y, a = 1) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const p = (t * 0.9 + i / 3) % 1;
    ctx.globalAlpha = clamp(a) * (1 - p);
    ctx.beginPath();
    for (let k = 0; k <= 10; k++) {
      const yy = y - p * 120 - k * 9, xx = x + (i - 1) * 46 + Math.sin(k * 0.9 + t * 6 + i) * 10;
      k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
    }
    ctx.stroke();
  }
  ctx.restore();
}

export const label = (ctx, s, x, y, o = {}) => txt(ctx, s, x, y, { size: 44, stroke: INK, sw: 9, ...o });
