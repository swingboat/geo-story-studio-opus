// Cast and props: the talking Halley nucleus, the Sun, the coma and the two tails.
// Tails are placed physically: both point away from the Sun; the dust tail bends toward the comet's past path.
import { C, clamp, lerp, rand, txt, NUM } from './lib.mjs';

const TAU = Math.PI * 2;

// ---------- the Sun ----------
export function sun(ctx, t, x, y, r, o = {}) {
  const { face = true, glow = 1, mood = 'happy' } = o;
  ctx.save();
  const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 3.2);
  g.addColorStop(0, `rgba(255,200,80,${0.55 * glow})`);
  g.addColorStop(0.4, `rgba(255,150,40,${0.18 * glow})`);
  g.addColorStop(1, 'rgba(255,120,20,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, TAU); ctx.fill();
  // wobbly rays
  ctx.fillStyle = 'rgba(255,190,60,0.85)';
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * TAU + t * 0.25;
    const l = r * (1.28 + 0.1 * Math.sin(t * 3 + i * 1.7));
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a - 0.11) * r * 0.95, y + Math.sin(a - 0.11) * r * 0.95);
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.lineTo(x + Math.cos(a + 0.11) * r * 0.95, y + Math.sin(a + 0.11) * r * 0.95);
    ctx.fill();
  }
  const b = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  b.addColorStop(0, '#fff3b0'); b.addColorStop(0.6, C.sun); b.addColorStop(1, C.sunHot);
  ctx.fillStyle = b;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  if (face && r > 50) {
    const e = r * 0.12;
    ctx.fillStyle = C.ink;
    const blink = Math.sin(t * 1.3) > 0.97 ? 0.15 : 1;
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.ellipse(x + s * r * 0.3, y - r * 0.08, e * 0.7, e * blink, 0, 0, TAU); ctx.fill();
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = r * 0.06; ctx.lineCap = 'round';
    ctx.beginPath();
    if (mood === 'puff') ctx.ellipse(x, y + r * 0.3, r * 0.12, r * 0.1, 0, 0, TAU);
    else ctx.arc(x, y + r * 0.12, r * 0.28, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,110,90,0.45)';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(x + s * r * 0.55, y + r * 0.18, r * 0.12, 0, TAU); ctx.fill(); }
  }
  ctx.restore();
}

// ---------- the nucleus: a dark, lumpy "dirty snowball" with a face ----------
const LUMPS = [...Array(18)].map((_, i) => 0.86 + rand(i + 40) * 0.2);
function potato(ctx, x, y, r, rot) {
  ctx.beginPath();
  for (let i = 0; i <= 36; i++) {
    const a = (i / 36) * TAU;
    const k = i / 2, k0 = Math.floor(k) % 18, k1 = (k0 + 1) % 18, f = k - Math.floor(k);
    const rr = r * lerp(LUMPS[k0], LUMPS[k1], f) * (1 + 0.28 * Math.cos(a) ** 2);
    const px = Math.cos(a + rot) * rr * 1.08, py = Math.sin(a + rot) * rr * 0.86;
    i ? ctx.lineTo(x + px, y + py) : ctx.moveTo(x + px, y + py);
  }
  ctx.closePath();
}

// mood: happy | cold | hot | wow | cool | huh ; talk: 0..1 mouth openness ; look: eye offset angle
export function nucleus(ctx, t, x, y, r, o = {}) {
  const { mood = 'happy', talk = 0, rot = 0.15, look = 0, frost = 0, sweat = 0, cut = 0 } = o;
  ctx.save();
  // body
  const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r * 1.3);
  g.addColorStop(0, '#6d6680'); g.addColorStop(0.7, C.core); g.addColorStop(1, C.coreDark);
  potato(ctx, x, y, r, rot);
  ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = r * 0.05; ctx.strokeStyle = '#1a1626'; ctx.stroke();
  ctx.save();
  potato(ctx, x, y, r, rot); ctx.clip();
  // icy patches and dust specks
  for (let i = 0; i < 9; i++) {
    const a = rand(i + 7) * TAU, d = r * (0.25 + rand(i + 17) * 0.75);
    ctx.fillStyle = `rgba(216,241,255,${0.35 + frost * 0.4})`;
    ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d, r * (0.1 + rand(i) * 0.12), r * 0.07, a, 0, TAU); ctx.fill();
  }
  for (let i = 0; i < 26; i++) {
    const a = rand(i + 70) * TAU, d = r * rand(i + 90) * 1.1;
    ctx.fillStyle = 'rgba(20,16,30,0.55)';
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * (0.02 + rand(i + 3) * 0.03), 0, TAU); ctx.fill();
  }
  if (cut > 0) cutaway(ctx, x, y, r, cut);
  ctx.restore();
  if (frost > 0) {
    ctx.fillStyle = `rgba(230,248,255,${0.8 * frost})`;
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * (0.15 + i * 0.1);
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.82, r * 0.11, 0, TAU); ctx.fill();
    }
  }
  if (cut < 0.5) face(ctx, t, x, y + r * 0.05, r, mood, talk, look);
  if (sweat > 0) {
    ctx.fillStyle = `rgba(140,220,255,${sweat})`;
    for (const [dx, dy, k] of [[0.95, -0.5, 1], [-1.0, -0.3, 0.8]]) {
      const yy = y + r * dy + ((t * 60 * k) % (r * 0.4));
      ctx.beginPath();
      ctx.moveTo(x + r * dx, yy - r * 0.16);
      ctx.quadraticCurveTo(x + r * dx + r * 0.1, yy, x + r * dx, yy + r * 0.06);
      ctx.quadraticCurveTo(x + r * dx - r * 0.1, yy, x + r * dx, yy - r * 0.16);
      ctx.fill();
    }
  }
  ctx.restore();
}

// inside view: half the nucleus peeled open to show ice grains and dust
function cutaway(ctx, x, y, r, p) {
  ctx.save();
  ctx.globalAlpha *= clamp(p);
  ctx.fillStyle = '#9fb6c8';
  ctx.fillRect(x, y - r * 1.4, r * 1.6, r * 2.8);
  for (let i = 0; i < 60; i++) {
    const px = x + rand(i + 200) * r * 1.3, py = y + (rand(i + 300) - 0.5) * r * 2.2;
    const ice = i % 3 !== 0;
    ctx.fillStyle = ice ? C.ice : '#3a3346';
    ctx.beginPath();
    if (ice) ctx.roundRect(px - r * 0.06, py - r * 0.06, r * 0.12, r * 0.12, r * 0.03);
    else ctx.arc(px, py, r * 0.035, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = '#1a1626'; ctx.lineWidth = r * 0.04;
  ctx.beginPath(); ctx.moveTo(x, y - r * 1.4); ctx.lineTo(x, y + r * 1.4); ctx.stroke();
  ctx.restore();
}

function face(ctx, t, x, y, r, mood, talk, look) {
  const ex = r * 0.34, ey = y - r * 0.18, er = r * 0.2;
  const lx = Math.cos(look) * er * 0.35, ly = Math.sin(look) * er * 0.35;
  const blink = (t % 3.7) < 0.12 ? 0.15 : 1;
  if (mood === 'cool') {
    ctx.fillStyle = '#111';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.roundRect(x + s * ex - er * 1.2, ey - er * 0.8, er * 2.4, er * 1.5, er * 0.5); ctx.fill(); }
    ctx.fillRect(x - ex, ey - er * 0.5, ex * 2, er * 0.3);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + s * ex - er * 0.5, ey - er * 0.3, er * 0.35, er * 0.15, -0.4, 0, TAU); ctx.fill(); }
  } else {
    const wide = mood === 'wow' || mood === 'huh' ? 1.25 : 1;
    for (const s of [-1, 1]) {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(x + s * ex, ey, er * wide, er * wide * blink, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.ellipse(x + s * ex + lx, ey + ly, er * 0.55, er * 0.55 * blink, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x + s * ex + lx + er * 0.2, ey + ly - er * 0.2, er * 0.16, 0, TAU); ctx.fill();
    }
    if (mood === 'hot' || mood === 'huh') {
      ctx.strokeStyle = C.ink; ctx.lineWidth = r * 0.05; ctx.lineCap = 'round';
      for (const s of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(x + s * (ex - er), ey - er * 1.5 + (mood === 'huh' && s > 0 ? -er * 0.4 : 0)); ctx.lineTo(x + s * (ex + er), ey - er * 1.3 - (mood === 'hot' ? er * 0.4 : 0)); ctx.stroke();
      }
    }
  }
  // cheeks
  ctx.fillStyle = mood === 'hot' ? 'rgba(255,90,60,0.7)' : mood === 'cold' ? 'rgba(120,200,255,0.5)' : 'rgba(255,120,150,0.5)';
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + s * r * 0.62, y + r * 0.12, r * 0.13, r * 0.08, 0, 0, TAU); ctx.fill(); }
  // mouth
  const my = y + r * 0.28;
  ctx.strokeStyle = C.ink; ctx.lineWidth = r * 0.05; ctx.lineCap = 'round';
  if (talk > 0.05 || mood === 'wow') {
    const open = mood === 'wow' ? Math.max(0.7, talk) : talk;
    ctx.fillStyle = '#5a1f2e';
    ctx.beginPath(); ctx.ellipse(x, my, r * 0.17, r * 0.05 + r * 0.14 * open, 0, 0, TAU); ctx.fill(); ctx.stroke();
  } else if (mood === 'cold') {
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) ctx.lineTo(x - r * 0.18 + i * r * 0.06, my + (i % 2 ? r * 0.04 : -r * 0.04));
    ctx.stroke();
  } else if (mood === 'huh') {
    ctx.beginPath(); ctx.arc(x, my, r * 0.06, 0, TAU); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(x, my - r * 0.06, r * 0.18, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  }
}

// ---------- coma: soft glowing cloud of gas (hollow circles) and dust (dots) ----------
export function coma(ctx, t, x, y, r, a = 1) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
  g.addColorStop(0, 'rgba(200,240,255,0.55)'); g.addColorStop(0.5, 'rgba(120,210,255,0.22)'); g.addColorStop(1, 'rgba(80,160,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  for (let i = 0; i < 40; i++) {
    const ang = rand(i + 500) * TAU, ph = (rand(i + 600) + t * (0.12 + rand(i) * 0.1)) % 1;
    const d = r * (0.35 + ph * 0.65), px = x + Math.cos(ang) * d, py = y + Math.sin(ang) * d;
    const fade = Math.sin(Math.PI * ph);
    if (i % 2) {
      ctx.strokeStyle = `rgba(210,245,255,${0.8 * fade})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(px, py, 7, 0, TAU); ctx.stroke();
    } else {
      ctx.fillStyle = `rgba(255,220,150,${0.9 * fade})`;
      ctx.beginPath(); ctx.arc(px, py, 4, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
}

// Point on a tail: s in 0..1 along it. Dust tail bends from anti-sun toward the trailing side.
function tailPoint(x, y, ang, len, bend, s) {
  const a = ang + bend * s * s;
  const d = len * s;
  return [x + Math.cos(ang + bend * s * 0.5) * d, y + Math.sin(ang + bend * s * 0.5) * d, a];
}

function ribbon(ctx, x, y, ang, len, bend, w0, w1, c0, c1) {
  const L = [], R = [];
  for (let i = 0; i <= 30; i++) {
    const s = i / 30, [px, py, a] = tailPoint(x, y, ang, len, bend, s), w = lerp(w0, w1, s);
    L.push([px + Math.cos(a + Math.PI / 2) * w, py + Math.sin(a + Math.PI / 2) * w]);
    R.push([px - Math.cos(a + Math.PI / 2) * w, py - Math.sin(a + Math.PI / 2) * w]);
  }
  const [ex, ey] = tailPoint(x, y, ang, len, bend, 1);
  const g = ctx.createLinearGradient(x, y, ex, ey);
  g.addColorStop(0, c0); g.addColorStop(1, c1);
  ctx.fillStyle = g;
  ctx.beginPath();
  L.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  R.reverse().forEach(([px, py]) => ctx.lineTo(px, py));
  ctx.closePath(); ctx.fill();
}

// grow: 0..1 how far the tail has extended
export function dustTail(ctx, t, x, y, ang, len, bend, grow = 1, a = 1) {
  if (grow <= 0 || a <= 0) return;
  const L = len * grow;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ribbon(ctx, x, y, ang, L, bend, 30, 190 * grow, 'rgba(255,225,150,0.75)', 'rgba(255,190,90,0)');
  ribbon(ctx, x, y, ang, L * 0.9, bend, 14, 80 * grow, 'rgba(255,245,210,0.6)', 'rgba(255,210,120,0)');
  for (let i = 0; i < 90; i++) {
    const s = (rand(i + 900) + t * 0.18) % 1, side = (rand(i + 950) - 0.5) * 2;
    const [px, py, pa] = tailPoint(x, y, ang, L, bend, s), w = lerp(20, 170 * grow, s) * side;
    ctx.fillStyle = `rgba(255,${200 + 40 * rand(i)},120,${0.9 * (1 - s)})`;
    ctx.beginPath(); ctx.arc(px + Math.cos(pa + Math.PI / 2) * w, py + Math.sin(pa + Math.PI / 2) * w, 3 + 3 * rand(i + 3), 0, TAU); ctx.fill();
  }
  ctx.restore();
}

export function ionTail(ctx, t, x, y, ang, len, grow = 1, a = 1) {
  if (grow <= 0 || a <= 0) return;
  const L = len * grow;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.globalCompositeOperation = 'lighter';
  ribbon(ctx, x, y, ang, L, 0, 16, 46, 'rgba(95,208,255,0.75)', 'rgba(47,123,255,0)');
  // streamers rippling in the solar wind
  ctx.lineCap = 'round';
  for (let k = 0; k < 5; k++) {
    ctx.strokeStyle = `rgba(150,225,255,${0.55 - k * 0.07})`;
    ctx.lineWidth = 4 - k * 0.5;
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) {
      const s = i / 24, off = (k - 2) * 9 * (0.3 + s) + Math.sin(s * 9 - t * 6 + k) * 8 * s;
      const px = x + Math.cos(ang) * L * s + Math.cos(ang + Math.PI / 2) * off;
      const py = y + Math.sin(ang) * L * s + Math.sin(ang + Math.PI / 2) * off;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  }
  for (let i = 0; i < 40; i++) {
    const s = (rand(i + 1200) + t * 0.6) % 1, off = (rand(i + 1300) - 0.5) * 40 * (0.3 + s);
    ctx.fillStyle = `rgba(190,240,255,${1 - s})`;
    ctx.beginPath();
    ctx.arc(x + Math.cos(ang) * L * s + Math.cos(ang + Math.PI / 2) * off, y + Math.sin(ang) * L * s + Math.sin(ang + Math.PI / 2) * off, 4, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// Whole comet. vel = direction of motion (radians). Tails computed from the Sun position.
export function comet(ctx, t, o) {
  const { x, y, r = 60, sx, sy, vel = 0, coma: cm = 1, dust = 1, ion = 1, len = 700, mood = 'happy', talk = 0, ...rest } = o;
  const anti = Math.atan2(y - sy, x - sx);
  // bend toward the trailing side (opposite to motion)
  let diff = vel + Math.PI - anti;
  diff = Math.atan2(Math.sin(diff), Math.cos(diff));
  const bend = clamp(diff, -0.9, 0.9) * 0.7;
  dustTail(ctx, t, x, y, anti, len * 0.85, bend, dust);
  ionTail(ctx, t, x, y, anti, len, ion);
  coma(ctx, t, x, y, r * 3 * (0.6 + 0.4 * cm), cm);
  nucleus(ctx, t, x, y, r, { mood, talk, ...rest });
  return anti;
}

export function label(ctx, s, x, y, color, size = 46) {
  txt(ctx, s, x, y, { size, color, stroke: C.ink, sw: 10 });
}

export { NUM };
