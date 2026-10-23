// Characters: cute faces, glow, Earth, Moon and the curious kid 豆豆.
import { C, TAU, clamp, lerp } from './lib.mjs';

// Cute face centred at (x,y), sized for a body of radius r. mood: happy | wow | sad | starry | wink
export function face(ctx, t, x, y, r, o = {}) {
  const { talk = 0, mood = 'happy', look = 0, ink = C.ink } = o;
  const s = r / 100;
  const blink = (t + x * 0.001) % 3.7 < 0.12 ? 0.15 : 1;
  ctx.save();
  ctx.translate(x + look * 10 * s, y);
  ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineCap = 'round';
  for (const k of [-1, 1]) {
    if (mood === 'starry') {
      ctx.fillStyle = C.gold;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const rr = (i % 2 ? 6 : 16) * s, a = (i * Math.PI) / 5 - Math.PI / 2 + t * 2;
        ctx.lineTo(k * 32 * s + Math.cos(a) * rr, -12 * s + Math.sin(a) * rr);
      }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = ink;
      continue;
    }
    if (mood === 'wink' && k === 1) {
      ctx.lineWidth = 6 * s;
      ctx.beginPath(); ctx.arc(k * 32 * s, -8 * s, 11 * s, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke();
      continue;
    }
    ctx.beginPath(); ctx.ellipse(k * 32 * s, -12 * s, 9 * s, 13 * s * blink, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(k * 32 * s + 3 * s, -17 * s, 3.5 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = ink;
  }
  ctx.fillStyle = 'rgba(255,110,140,0.45)';
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(k * 52 * s, 12 * s, 13 * s, 8 * s, 0, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#7a1f2b'; ctx.lineWidth = 5 * s;
  const open = Math.max(talk, mood === 'wow' || mood === 'starry' ? 0.8 : 0);
  if (open > 0.05) {
    ctx.beginPath(); ctx.ellipse(0, 20 * s, 12 * s, (5 + 12 * open) * s, 0, 0, TAU); ctx.fill();
  } else if (mood === 'sad') {
    ctx.beginPath(); ctx.arc(0, 32 * s, 14 * s, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(0, 8 * s, 18 * s, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  }
  ctx.restore();
}

export function glow(ctx, x, y, r0, r1, color) {
  if (r1 <= 0) return;
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r1, 0, TAU); ctx.fill();
}

function shade(ctx, x, y, r, light) {
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  const lx = Math.cos(light), ly = Math.sin(light);
  const g = ctx.createLinearGradient(x + lx * r, y + ly * r, x - lx * r, y - ly * r);
  g.addColorStop(0, 'rgba(255,255,255,0.18)');
  g.addColorStop(0.45, 'rgba(0,0,30,0)');
  g.addColorStop(0.75, 'rgba(0,0,30,0.4)');
  g.addColorStop(1, 'rgba(0,0,30,0.65)');
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  ctx.restore();
}

// Earth; o.face=false for a plain globe. China-ish blob is the first land patch (no map precision intended).
export function earth(ctx, t, x, y, r, o = {}) {
  const { light = -2.4, spin = t * 0.08 } = o;
  glow(ctx, x, y, r * 0.95, r * 1.22, 'rgba(110,190,255,0.4)');
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  ctx.fillStyle = C.earth; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  ctx.fillStyle = C.land;
  const blobs = [[-0.4, -0.35, 0.38, 0.26], [0.35, 0.1, 0.3, 0.42], [-0.2, 0.5, 0.33, 0.18], [0.9, -0.5, 0.25, 0.2], [1.6, 0.2, 0.3, 0.35]];
  for (const [bx, by, rx, ry] of blobs) {
    const px = ((bx + spin) % 2.6 + 2.6) % 2.6 - 1.3;
    ctx.beginPath(); ctx.ellipse(x + px * r, y + by * r, rx * r, ry * r, 0.3, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 4; i++) {
    const px = (((i * 0.7 + spin * 1.4) % 2.6) + 2.6) % 2.6 - 1.3;
    ctx.beginPath(); ctx.ellipse(x + px * r, y + (i * 0.37 - 0.5) * r, r * 0.3, r * 0.06, 0.1, 0, TAU); ctx.fill();
  }
  ctx.restore();
  shade(ctx, x, y, r, light);
  if (o.face) face(ctx, t, x, y + r * 0.05, r * 0.6, o);
}

export function moon(ctx, t, x, y, r, o = {}) {
  const { light = -2.4 } = o;
  glow(ctx, x, y, r * 0.9, r * 1.3, 'rgba(230,230,255,0.18)');
  ctx.fillStyle = C.moon;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.fillStyle = C.moonDark;
  for (const [cx, cy, cr] of [[-0.45, -0.4, 0.18], [0.4, -0.15, 0.13], [-0.1, 0.5, 0.15], [0.5, 0.45, 0.09], [-0.55, 0.2, 0.08]]) {
    ctx.beginPath(); ctx.arc(x + cx * r, y + cy * r, cr * r, 0, TAU); ctx.fill();
  }
  shade(ctx, x, y, r, light);
  if (o.face) face(ctx, t, x, y + r * 0.05, r * 0.6, o);
}

// The kid 豆豆. (x,y) = feet. o.point raises the right arm; o.phone holds a phone in the left hand;
// o.look tilts the head up (0..1).
export function kid(ctx, t, x, y, s, o = {}) {
  const { talk = 0, mood = 'happy', point = 0, flip = 1, phone = 0, jump = 0 } = o;
  const jacket = '#ff8a3d';
  const hop = -Math.abs(Math.sin(Math.PI * clamp(jump))) * 60;
  const bob = Math.sin(t * 3) * 5 + hop;
  ctx.save();
  ctx.translate(x, y + bob * s); ctx.scale(s * flip, s);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // legs + shoes
  ctx.strokeStyle = '#34406b'; ctx.lineWidth = 30;
  ctx.beginPath(); ctx.moveTo(-22, -70); ctx.lineTo(-26, -16); ctx.moveTo(22, -70); ctx.lineTo(28, -16); ctx.stroke();
  ctx.fillStyle = '#ff4d6d';
  ctx.beginPath(); ctx.roundRect(-50, -22, 44, 24, 10); ctx.roundRect(8, -22, 46, 24, 10); ctx.fill();
  // hoodie with a rocket patch
  ctx.fillStyle = jacket;
  ctx.beginPath(); ctx.roundRect(-58, -178, 116, 118, 42); ctx.fill();
  ctx.fillStyle = C.cream;
  ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(12, -124); ctx.lineTo(12, -100); ctx.lineTo(-12, -100); ctx.lineTo(-12, -124); ctx.closePath(); ctx.fill();
  // left arm (holds phone up when phone > 0)
  ctx.strokeStyle = jacket; ctx.lineWidth = 28;
  const la = lerp(Math.PI * 0.72, Math.PI * 1.1, clamp(phone));
  const lx = -50 + Math.cos(la) * 64, ly = -150 + Math.sin(la) * 64 * lerp(1, -0.2, clamp(phone));
  ctx.beginPath(); ctx.moveTo(-50, -150); ctx.lineTo(lx, ly); ctx.stroke();
  if (phone > 0.05) {
    ctx.save();
    ctx.globalAlpha *= clamp(phone * 2);
    ctx.fillStyle = '#1b2246';
    ctx.beginPath(); ctx.roundRect(lx - 26, ly - 70, 52, 92, 10); ctx.fill();
    ctx.fillStyle = '#7fe3ff';
    ctx.beginPath(); ctx.roundRect(lx - 20, ly - 62, 40, 70, 6); ctx.fill();
    ctx.fillStyle = C.no;
    ctx.beginPath(); ctx.arc(lx, ly - 34, 8, 0, TAU); ctx.fill();
    ctx.restore();
  }
  // right arm
  const pa = lerp(0.9, -1.1 + Math.sin(t * 8) * 0.15, clamp(point));
  ctx.strokeStyle = jacket;
  ctx.beginPath(); ctx.moveTo(50, -150); ctx.lineTo(50 + Math.cos(pa) * 64, -150 + Math.sin(pa) * 64); ctx.stroke();
  // head + cap
  ctx.fillStyle = '#ffd7b5';
  ctx.beginPath(); ctx.arc(0, -246, 72, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2f6fe0';
  ctx.beginPath(); ctx.arc(0, -262, 74, Math.PI * 1.02, Math.PI * 1.98); ctx.fill();
  ctx.beginPath(); ctx.roundRect(10, -278, 96, 22, 11); ctx.fill();
  ctx.fillStyle = C.gold;
  ctx.beginPath(); ctx.arc(-18, -300, 12, 0, TAU); ctx.fill();
  ctx.restore();
  face(ctx, t, x + 4 * s * flip, y + bob * s - 232 * s, 60 * s, { talk, mood });
}
