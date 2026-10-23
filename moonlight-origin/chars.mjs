// Characters and props: a talking Moon whose lit side follows the Sun, a cool Sun, a curious kid, an eye, Earth, lamp & ball.
import { C, clamp, lerp } from './lib.mjs';

const TAU = Math.PI * 2;
const CRATERS = [[-0.35, -0.3, 0.2], [0.3, -0.42, 0.12], [0.42, 0.2, 0.17], [-0.15, 0.45, 0.13], [0.05, 0.05, 0.1], [-0.55, 0.15, 0.09], [0.18, 0.6, 0.07]];

function disc(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); }

function halo(ctx, x, y, r0, r1, color, a) {
  if (a <= 0) return;
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = g; disc(ctx, x, y, r1); ctx.fill(); ctx.restore();
}

// Night side: everything facing away from `light` (radians, direction towards the Sun) is shaded; `lit` 0 = fully dark.
function shade(ctx, x, y, r, light, lit, dark = 'rgba(8,16,30,') {
  ctx.save();
  disc(ctx, x, y, r); ctx.clip();
  if (light !== 'full') {
    const dx = Math.cos(light) * r, dy = Math.sin(light) * r;
    const g = ctx.createLinearGradient(x + dx, y + dy, x - dx, y - dy);
    g.addColorStop(0, dark + '0)'); g.addColorStop(0.46, dark + '0)');
    g.addColorStop(0.58, dark + '0.82)'); g.addColorStop(1, dark + '0.9)');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  if (lit < 1) { ctx.fillStyle = dark + `${(1 - lit) * 0.82})`; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  ctx.restore();
}

// Cartoon face shared by Moon and Sun. eyes: 'open' | 'closed' | 'wink' | 'happy' | 'shades'.
function face(ctx, x, y, r, o = {}) {
  const { eyes = 'open', mouth = 0, blush = 1, look = [0, 0], blink = 0, ink = '#2a2f3d' } = o;
  const ex = r * 0.3, ey = -r * 0.06, er = r * 0.1;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = r * 0.045;
  if (blush) {
    ctx.fillStyle = `rgba(255,140,160,${0.45 * blush})`;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + s * r * 0.48, y + r * 0.2, r * 0.13, r * 0.08, 0, 0, TAU); ctx.fill(); }
    ctx.fillStyle = ink;
  }
  if (eyes === 'shades') {
    ctx.fillStyle = '#1b1d29';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.roundRect(x + s * ex - r * 0.2, y + ey - r * 0.12, r * 0.4, r * 0.24, r * 0.1); ctx.fill(); }
    ctx.fillRect(x - r * 0.12, y + ey - r * 0.08, r * 0.24, r * 0.05);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (const s of [-1, 1]) ctx.fillRect(x + s * ex - r * 0.13, y + ey - r * 0.07, r * 0.08, r * 0.04);
  } else {
    for (const s of [-1, 1]) {
      const kind = eyes === 'wink' && s > 0 ? 'closed' : eyes;
      const cx = x + s * ex, cy = y + ey;
      if (kind === 'closed' || kind === 'happy' || blink > 0.5) {
        ctx.beginPath();
        if (kind === 'happy') ctx.arc(cx, cy + er * 0.4, er, Math.PI * 1.1, Math.PI * 1.9);
        else ctx.arc(cx, cy - er * 0.3, er, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
      } else {
        ctx.fillStyle = ink;
        ctx.beginPath(); ctx.ellipse(cx + look[0] * er * 0.3, cy + look[1] * er * 0.3, er * 0.8, er, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fff';
        disc(ctx, cx + look[0] * er * 0.3 - er * 0.25, cy + look[1] * er * 0.3 - er * 0.35, er * 0.3); ctx.fill();
      }
    }
  }
  ctx.fillStyle = ink;
  const my = y + r * 0.28;
  if (mouth > 0.05) {
    ctx.beginPath(); ctx.ellipse(x, my, r * 0.11, r * (0.04 + 0.11 * mouth), 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#e66a7d';
    ctx.beginPath(); ctx.ellipse(x, my + r * 0.05 * mouth, r * 0.06, r * 0.04 * mouth, 0, 0, TAU); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(x, my - r * 0.08, r * 0.14, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
  }
  ctx.restore();
}

// o.light: radians towards the Sun, or 'full' (seen fully lit from Earth). o.lit: 0..1. o.face: face options or null.
export function moon(ctx, t, x, y, r, o = {}) {
  const { light = 'full', lit = 1, glow = 0, face: f = null } = o;
  halo(ctx, x, y, r * 0.9, r * 2.1, 'rgba(255,248,220,0.38)', glow * lit);
  ctx.save();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, '#fbfaf3'); g.addColorStop(0.7, C.moon); g.addColorStop(1, '#bdb9ad');
  ctx.fillStyle = g; disc(ctx, x, y, r); ctx.fill();
  disc(ctx, x, y, r); ctx.clip();
  for (const [cx, cy, cr] of CRATERS) {
    ctx.fillStyle = 'rgba(150,146,135,0.55)';
    disc(ctx, x + cx * r, y + cy * r, cr * r); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    disc(ctx, x + cx * r - cr * r * 0.18, y + cy * r - cr * r * 0.18, cr * r * 0.7); ctx.fill();
    ctx.fillStyle = 'rgba(150,146,135,0.5)';
    disc(ctx, x + cx * r + cr * r * 0.08, y + cy * r + cr * r * 0.08, cr * r * 0.62); ctx.fill();
  }
  ctx.restore();
  shade(ctx, x, y, r, light, lit);
  if (f) face(ctx, x, y, r, { ...f, ink: lerpInk(lit) });
}
const lerpInk = (lit) => (lit > 0.5 ? '#2a2f3d' : '#7f8aa0');

export function sun(ctx, t, x, y, r, o = {}) {
  const { rays = 1, face: f = { eyes: 'shades' } } = o;
  halo(ctx, x, y, r * 0.8, r * 2.6, 'rgba(255,190,80,0.55)', 1);
  if (rays > 0) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(t * 0.35);
    ctx.fillStyle = C.sun;
    for (let i = 0; i < 12; i++) {
      const len = r * (1.32 + 0.1 * Math.sin(t * 4 + i * 1.7)) * lerp(0.9, 1, rays);
      ctx.rotate(TAU / 12);
      ctx.globalAlpha = rays;
      ctx.beginPath(); ctx.moveTo(r * 0.92, -r * 0.13); ctx.lineTo(len, 0); ctx.lineTo(r * 0.92, r * 0.13); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#ffe58a'); g.addColorStop(0.65, C.sun); g.addColorStop(1, C.sunHot);
  ctx.fillStyle = g; disc(ctx, x, y, r); ctx.fill();
  if (f) face(ctx, x, y, r, { blush: 0.8, ink: '#5a2a10', ...f });
}

export function earth(ctx, t, x, y, r, o = {}) {
  const { light = Math.PI, spin = 0.25 } = o;
  halo(ctx, x, y, r * 0.95, r * 1.35, 'rgba(120,200,255,0.35)', 1);
  ctx.save();
  ctx.fillStyle = C.earth; disc(ctx, x, y, r); ctx.fill();
  disc(ctx, x, y, r); ctx.clip();
  const off = ((t * spin) % 2) * r * 2;
  ctx.fillStyle = C.land;
  for (const k of [-2, 0, 2]) {
    const bx = x - r + off + k * r;
    for (const [px, py, w, h] of [[0.2, -0.4, 0.55, 0.35], [0.45, 0.15, 0.3, 0.5], [1.2, -0.25, 0.4, 0.3], [1.35, 0.35, 0.35, 0.25]]) {
      ctx.beginPath(); ctx.ellipse(bx + px * r, y + py * r, w * r, h * r, 0.4, 0, TAU); ctx.fill();
    }
  }
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath(); ctx.ellipse(x, y - r * 0.97, r * 0.5, r * 0.12, 0, 0, TAU); ctx.fill();
  ctx.restore();
  shade(ctx, x, y, r, light, 1);
}

// Kid seen side-on, standing at (x,y) = feet. point 0..1 raises the arm towards angle `aim`.
export function kid(ctx, t, x, y, s, o = {}) {
  const { point = 0, aim = -1.0, talk = 0, look = -0.5, hop = 0 } = o;
  ctx.save();
  ctx.translate(x, y - hop); ctx.scale(s, s);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#26324a'; ctx.lineWidth = 16;
  ctx.beginPath(); ctx.moveTo(-10, -70); ctx.lineTo(-16, 0); ctx.moveTo(10, -70); ctx.lineTo(18, 0); ctx.stroke();
  ctx.fillStyle = '#ff7d5c';
  ctx.beginPath(); ctx.roundRect(-34, -170, 68, 110, 26); ctx.fill();
  const sh = [18, -150];
  const a = lerp(1.3, aim, point), len = lerp(80, 125, point);
  ctx.strokeStyle = '#ffd2b0'; ctx.lineWidth = 14;
  ctx.beginPath(); ctx.moveTo(-22, -150); ctx.lineTo(-34, -90); ctx.stroke();
  ctx.save();
  ctx.translate(0, -215); ctx.rotate(look * 0.5);
  ctx.fillStyle = '#ffd9bd'; disc(ctx, 0, 0, 50); ctx.fill();
  ctx.fillStyle = '#3a2a24';
  ctx.beginPath(); ctx.arc(0, -6, 52, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
  ctx.beginPath(); ctx.arc(-30, -30, 18, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2a2f3d'; disc(ctx, 28, 2, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,140,160,0.5)'; disc(ctx, 20, 22, 9); ctx.fill();
  ctx.fillStyle = '#2a2f3d';
  ctx.beginPath(); ctx.ellipse(36, 26, 6, 3 + 9 * talk, 0, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#ff7d5c'; ctx.lineWidth = 18; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(...sh); ctx.lineTo(sh[0] + Math.cos(a) * len * 0.35, sh[1] + Math.sin(a) * len * 0.35); ctx.stroke();
  ctx.strokeStyle = '#ffd2b0'; ctx.lineWidth = 13;
  const hx = sh[0] + Math.cos(a) * len, hy = sh[1] + Math.sin(a) * len;
  ctx.beginPath(); ctx.moveTo(sh[0] + Math.cos(a) * len * 0.3, sh[1] + Math.sin(a) * len * 0.3); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.fillStyle = '#ffd2b0'; disc(ctx, hx, hy, 10); ctx.fill();
  ctx.restore();
}

// Almond eye symbol; open 0..1 for blinking.
export function eye(ctx, x, y, s, o = {}) {
  const { open = 1, glow = 0 } = o;
  halo(ctx, x, y, s * 0.3, s * 1.6, 'rgba(255,230,150,0.6)', glow);
  const h = s * 0.55 * clamp(open, 0.06, 1);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - s, y); ctx.quadraticCurveTo(x, y - h * 1.6, x + s, y); ctx.quadraticCurveTo(x, y + h * 1.6, x - s, y);
  ctx.closePath();
  ctx.fillStyle = '#fbf7ec'; ctx.fill();
  ctx.lineWidth = s * 0.09; ctx.strokeStyle = C.navy; ctx.stroke();
  ctx.clip();
  ctx.fillStyle = '#3f8fb0'; disc(ctx, x, y, s * 0.42); ctx.fill();
  ctx.fillStyle = C.ink; disc(ctx, x, y, s * 0.2); ctx.fill();
  ctx.fillStyle = '#fff'; disc(ctx, x - s * 0.12, y - s * 0.12, s * 0.08); ctx.fill();
  ctx.restore();
}

// Desk lamp whose shade points right-down; `on` 0..1 lights the bulb and casts a cone.
export function lamp(ctx, x, y, s, on) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  if (on > 0) {
    const g = ctx.createLinearGradient(60, -250, 420, -40);
    g.addColorStop(0, `rgba(255,226,140,${0.55 * on})`); g.addColorStop(1, 'rgba(255,226,140,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(40, -270); ctx.lineTo(520, -230); ctx.lineTo(380, 40); ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = '#8aa0b8'; ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-30, -160); ctx.lineTo(30, -260); ctx.stroke();
  ctx.fillStyle = '#5d7590';
  ctx.beginPath(); ctx.ellipse(0, 4, 70, 16, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(30, -260); ctx.rotate(0.5);
  ctx.fillStyle = '#e3746a';
  ctx.beginPath(); ctx.moveTo(-30, -40); ctx.lineTo(30, -40); ctx.lineTo(80, 40); ctx.lineTo(-80, 40); ctx.closePath(); ctx.fill();
  ctx.fillStyle = on > 0.5 ? '#fff6c8' : '#7c8794';
  ctx.beginPath(); ctx.ellipse(0, 42, 70, 14, 0, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.restore();
}

export function ball(ctx, x, y, r, lit, light = Math.PI * 1.15) {
  ctx.save();
  disc(ctx, x, y, r); ctx.clip();
  const cols = ['#ff6b6b', '#ffd166', '#4cc9f0', '#7fe0b0', '#ff6b6b', '#ffd166'];
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = cols[i];
    ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, i * TAU / 6 + 0.3, (i + 1) * TAU / 6 + 0.3); ctx.fill();
  }
  ctx.fillStyle = '#fff'; disc(ctx, x, y, r * 0.16); ctx.fill();
  ctx.restore();
  shade(ctx, x, y, r, light, lit, 'rgba(4,8,16,');
  if (lit < 0.2) { ctx.save(); ctx.globalAlpha = 0.95 - lit * 4; ctx.fillStyle = '#05080f'; disc(ctx, x, y, r + 1); ctx.fill(); ctx.restore(); }
}
