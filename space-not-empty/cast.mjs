// Characters: the little astronaut 小宇, twinkling stars, gas/dust particles, the lonely atom, nebula and baby star.
import { C, TAU, rnd, clamp, lerp } from './lib.mjs';

// Cute face centred at (x,y), sized for a body of radius r.
export function face(ctx, t, x, y, r, o = {}) {
  const { talk = 0, mood = 'happy', look = 0, ink = C.ink, lookY = 0 } = o;
  const s = r / 100;
  const blink = (t + x * 0.001) % 3.7 < 0.12 ? 0.15 : 1;
  ctx.save();
  ctx.translate(x + look * 10 * s, y + lookY * 8 * s);
  ctx.fillStyle = ink;
  for (const k of [-1, 1]) {
    if (mood === 'sad') {
      ctx.beginPath(); ctx.ellipse(k * 32 * s, -8 * s, 8 * s, 10 * s * blink, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = ink; ctx.lineWidth = 5 * s; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(k * 18 * s, -30 * s); ctx.lineTo(k * 44 * s, -38 * s); ctx.stroke();
      continue;
    }
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
    ctx.beginPath(); ctx.ellipse(k * 32 * s, -12 * s, 9 * s, 13 * s * blink, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(k * 32 * s + 3 * s, -17 * s, 3.5 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = ink;
  }
  ctx.fillStyle = 'rgba(255,110,140,0.45)';
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(k * 54 * s, 14 * s, 13 * s, 8 * s, 0, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = ink; ctx.fillStyle = '#7a1f2b'; ctx.lineWidth = 5 * s; ctx.lineCap = 'round';
  const open = Math.max(talk, mood === 'wow' || mood === 'starry' ? 0.75 : 0);
  if (open > 0.05) {
    ctx.beginPath(); ctx.ellipse(0, 22 * s, 12 * s, (5 + 12 * open) * s, 0, 0, TAU); ctx.fill();
  } else if (mood === 'sad') {
    ctx.beginPath(); ctx.arc(0, 34 * s, 14 * s, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke();
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

// ---------- 小宇: a round little astronaut. (x,y) is the helmet centre; s=1 → helmet radius 100 ----------
// arm: angle (radians, 0 = right) for the right arm; returns the right glove position.
export function astronaut(ctx, t, x, y, s, o = {}) {
  const { talk = 0, mood = 'happy', look = 0, lookY = 0, wave = 0, arm = 0.9, scratch = 0 } = o;
  const ink = C.ink, lw = 6 * s;
  const bob = Math.sin(t * 1.8) * 10 * s, tilt = Math.sin(t * 1.3) * 0.05;
  ctx.save();
  ctx.translate(x, y + bob); ctx.rotate(tilt); ctx.scale(s, s);
  ctx.lineWidth = 6; ctx.strokeStyle = ink; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const limb = (x0, y0, ang, len, w) => {
    const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len;
    ctx.strokeStyle = ink; ctx.lineWidth = w + 12;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.strokeStyle = '#f4f6ff'; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    return [x1, y1];
  };
  // backpack
  ctx.fillStyle = '#b9c2e6'; ctx.strokeStyle = ink; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.roundRect(-82, 70, 164, 130, 30); ctx.fill(); ctx.stroke();
  // legs dangle in zero-g
  const sw = Math.sin(t * 1.6) * 0.15;
  for (const k of [-1, 1]) {
    const [fx, fy] = limb(k * 30, 190, Math.PI / 2 + k * 0.18 + sw * k, 70, 44);
    ctx.fillStyle = '#7d86b8'; ctx.strokeStyle = ink; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.ellipse(fx + k * 6, fy + 8, 30, 20, 0, 0, TAU); ctx.fill(); ctx.stroke();
  }
  // body
  ctx.fillStyle = '#f4f6ff'; ctx.strokeStyle = ink; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.roundRect(-66, 70, 132, 140, 46); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ff9f43';
  ctx.fillRect(-63, 160, 126, 18);
  ctx.fillStyle = '#2b3a7a';
  ctx.beginPath(); ctx.roundRect(-34, 100, 68, 46, 10); ctx.fill();
  [[-18, C.no], [0, C.gold], [18, C.mint]].forEach(([dx, c], i) => {
    ctx.fillStyle = Math.sin(t * 4 + i * 2) > -0.3 ? c : '#445';
    ctx.beginPath(); ctx.arc(dx, 123, 7, 0, TAU); ctx.fill();
  });
  // left arm: relaxed, or scratching the helmet
  const la = scratch > 0 ? lerp(Math.PI * 0.7, -Math.PI * 0.62 + Math.sin(t * 14) * 0.12, scratch) : Math.PI * 0.72 + Math.sin(t * 2) * 0.08;
  const [lx, ly] = limb(-58, 100, la, 82, 40);
  // right arm: waving or pointing at `arm`
  const ra = wave > 0 ? lerp(arm, -Math.PI * 0.35 + Math.sin(t * 10) * 0.45, wave) : arm;
  const [rx, ry] = limb(58, 100, ra, 82, 40);
  ctx.fillStyle = '#7d86b8'; ctx.strokeStyle = ink; ctx.lineWidth = 6;
  for (const [gx, gy] of [[lx, ly], [rx, ry]]) { ctx.beginPath(); ctx.arc(gx, gy, 24, 0, TAU); ctx.fill(); ctx.stroke(); }
  // helmet
  ctx.fillStyle = '#f4f6ff';
  ctx.beginPath(); ctx.arc(0, 0, 100, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = ink; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(0, -100); ctx.lineTo(0, -138); ctx.stroke();
  glow(ctx, 0, -146, 0, 34, `rgba(255,90,110,${0.5 + 0.4 * Math.sin(t * 5)})`);
  ctx.fillStyle = C.no; ctx.beginPath(); ctx.arc(0, -146, 13, 0, TAU); ctx.fill();
  // face behind the visor
  ctx.save();
  ctx.beginPath(); ctx.ellipse(0, 8, 76, 66, 0, 0, TAU); ctx.clip();
  ctx.fillStyle = '#1d2b6b'; ctx.fillRect(-80, -60, 160, 140);
  ctx.fillStyle = '#ffd9b8'; ctx.beginPath(); ctx.arc(look * 6, 14 + lookY * 5, 64, 0, TAU); ctx.fill();
  ctx.fillStyle = '#3b2416';
  ctx.beginPath(); ctx.ellipse(look * 6, -40, 72, 34, 0, 0, TAU); ctx.fill();
  face(ctx, t, look * 6, 20 + lookY * 5, 58, { talk, mood, look, lookY });
  ctx.fillStyle = 'rgba(140,210,255,0.16)'; ctx.fillRect(-80, -60, 160, 140);
  ctx.restore();
  ctx.strokeStyle = ink; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.ellipse(0, 8, 76, 66, 0, 0, TAU); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.arc(0, 8, 56, -2.6, -1.9); ctx.stroke();
  ctx.restore();
  return astroHand(t, x, y, s, ra);
}

// Where the right glove of astronaut(…) ends up for a given arm angle (so props can be drawn underneath it).
export function astroHand(t, x, y, s, arm) {
  const bob = Math.sin(t * 1.8) * 10 * s, tilt = Math.sin(t * 1.3) * 0.05;
  const rx = 58 + Math.cos(arm) * 82, ry = 100 + Math.sin(arm) * 82;
  const c = Math.cos(tilt), sn = Math.sin(tilt);
  return [x + (rx * c - ry * sn) * s, y + bob + (rx * sn + ry * c) * s];
}

// ---------- a four-point sparkle star with an optional face ----------
export function sparkleStar(ctx, t, x, y, r, o = {}) {
  const { faceA = 0, talk = 0, mood = 'happy', look = 0, color = '#fffbe8', glowC = 'rgba(255,240,190,0.55)' } = o;
  const tw = 1 + 0.08 * Math.sin(t * 3 + x);
  glow(ctx, x, y, 0, r * 2.6 * tw, glowC);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const rr = (i % 2 ? r * 0.36 : r * 1.25) * tw, a = (i * Math.PI) / 4 - Math.PI / 2;
    const ctrl = (i % 2 ? r * 0.36 : r * 1.25) * tw;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * ctrl);
  }
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r * 0.62, 0, TAU); ctx.fill();
  if (faceA > 0) {
    ctx.save(); ctx.globalAlpha *= faceA;
    face(ctx, t, x, y + r * 0.08, r * 0.5, { talk, mood, look });
    ctx.restore();
  }
}

// ---------- particles for "气体 + 尘埃" (same visual language as nebula-nursery) ----------
export function gasDot(ctx, x, y, r, a = 1) {
  if (a <= 0) return;
  glow(ctx, x, y, 0, r * 2.4, `rgba(92,225,230,${0.35 * a})`);
  ctx.fillStyle = `rgba(160,245,250,${a})`;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}

export function dustGrain(ctx, x, y, r, rot = 0, a = 1) {
  if (a <= 0 || r <= 0) return;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = `rgba(233,168,90,${a})`;
  ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    const ang = (i / 7) * TAU, rr = r * (0.7 + 0.5 * rnd(i * 3 + 1));
    ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

// The lonely atom: a big gas dot with a face.
export function atomBuddy(ctx, t, x, y, r, o = {}) {
  const { mood = 'happy', talk = 0, look = 0, a = 1 } = o;
  if (a <= 0 || r <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  glow(ctx, x, y, r * 0.5, r * 2.2, 'rgba(92,225,230,0.4)');
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, '#e8feff'); g.addColorStop(1, '#5ce1e6');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  face(ctx, t, x, y + r * 0.08, r * 0.62, { mood, talk, look, ink: '#123a52' });
  ctx.restore();
}

// ---------- star-forming cloud: soft gas puffs + dark dust lanes (from nebula-nursery) ----------
const PUFFS = [...Array(34)].map((_, i) => ({
  a: rnd(i) * TAU, d: Math.sqrt(rnd(i + 40)) * 0.72, r: 0.3 + rnd(i + 80) * 0.36,
  col: ['rgba(176,107,255,', 'rgba(255,111,181,', 'rgba(92,225,230,', 'rgba(120,140,255,'][i % 4], ph: rnd(i + 9) * TAU,
}));
const LANES = [
  [[-0.8, 0.1], [-0.35, -0.25], [0.1, 0.3], [0.7, 0.05], 0.13],
  [[-0.6, 0.45], [-0.2, 0.2], [0.25, 0.55], [0.55, 0.32], 0.09],
];
export function nebulaCloud(ctx, t, x, y, r, o = {}) {
  const { a = 1, dust = 1 } = o;
  if (a <= 0 || r <= 1) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.globalCompositeOperation = 'lighter';
  glow(ctx, x, y, 0, r * 0.7, 'rgba(255,190,230,0.22)');
  for (const p of PUFFS) {
    const px = x + Math.cos(p.a + Math.sin(t * 0.3 + p.ph) * 0.08) * p.d * r * 1.2;
    const py = y + Math.sin(p.a) * p.d * r * 0.85 + Math.sin(t * 0.7 + p.ph) * r * 0.02;
    glow(ctx, px, py, 0, p.r * r, p.col + '0.26)');
  }
  ctx.globalCompositeOperation = 'source-over';
  if (dust > 0) {
    ctx.lineCap = 'round';
    for (const [p0, p1, p2, p3, w] of LANES)
      for (const k of [1, 0.7, 0.45, 0.25]) {
        ctx.strokeStyle = `rgba(30,12,45,${0.2 * dust})`;
        ctx.lineWidth = w * r * k;
        ctx.beginPath();
        ctx.moveTo(x + p0[0] * r, y + p0[1] * r);
        ctx.bezierCurveTo(x + p1[0] * r, y + p1[1] * r, x + p2[0] * r, y + p2[1] * r, x + p3[0] * r, y + p3[1] * r);
        ctx.stroke();
      }
  }
  ctx.restore();
}

// A newborn star glowing inside the cloud.
export function babyStar(ctx, t, x, y, r, a = 1) {
  if (a <= 0 || r <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a);
  glow(ctx, x, y, 0, r * 4, 'rgba(255,200,120,0.55)');
  sparkleStar(ctx, t, x, y, r, { color: '#fff4d0', glowC: 'rgba(255,190,110,0.5)', faceA: 1, mood: 'happy' });
  ctx.restore();
}
