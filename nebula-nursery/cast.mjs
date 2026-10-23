// Characters and props: the Orion "nursery" cloud, the baby protostar, the old star / Ring Nebula grandpa, stickers.
import { C, TAU, rnd, clamp, lerp, txt } from './lib.mjs';

// Cute face centred at (x,y), sized for a body of radius r.
export function face(ctx, t, x, y, r, o = {}) {
  const { talk = 0, mood = 'happy', look = 0, glasses = false, ink = C.ink } = o;
  const s = r / 100;
  const blink = (t + x * 0.001) % 3.7 < 0.12 ? 0.15 : 1;
  ctx.save();
  ctx.translate(x + look * 10 * s, y);
  ctx.fillStyle = ink;
  for (const k of [-1, 1]) {
    if (mood === 'cry') {
      ctx.strokeStyle = ink; ctx.lineWidth = 6 * s; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(k * 22 * s, -18 * s); ctx.lineTo(k * 40 * s, -10 * s); ctx.lineTo(k * 22 * s, -2 * s); ctx.stroke();
      continue;
    }
    ctx.beginPath(); ctx.ellipse(k * 32 * s, -12 * s, 9 * s, 13 * s * blink, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(k * 32 * s + 3 * s, -17 * s, 3.5 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = ink;
  }
  if (glasses) {
    ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 4.5 * s;
    for (const k of [-1, 1]) { ctx.beginPath(); ctx.arc(k * 32 * s, -12 * s, 20 * s, 0, TAU); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-12 * s, -14 * s); ctx.quadraticCurveTo(0, -20 * s, 12 * s, -14 * s); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,110,140,0.45)';
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(k * 54 * s, 14 * s, 13 * s, 8 * s, 0, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = ink; ctx.fillStyle = '#7a1f2b'; ctx.lineWidth = 5 * s; ctx.lineCap = 'round';
  const open = Math.max(talk, mood === 'wow' || mood === 'cry' ? 0.8 : 0);
  if (open > 0.05) {
    ctx.beginPath(); ctx.ellipse(0, 22 * s, 12 * s, (5 + 12 * open) * s, 0, 0, TAU); ctx.fill();
  } else if (mood === 'grumpy') {
    ctx.beginPath(); ctx.moveTo(-14 * s, 24 * s); ctx.lineTo(14 * s, 20 * s); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(0, 8 * s, 18 * s, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  }
  ctx.restore();
}

export function glow(ctx, x, y, r0, r1, color) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r1, 0, TAU); ctx.fill();
}

// ---------- Orion-style star-forming cloud: soft gas puffs + dark dust lanes + a few young stars ----------
const PUFFS = [...Array(34)].map((_, i) => ({
  a: rnd(i) * TAU, d: Math.sqrt(rnd(i + 40)) * 0.72, r: 0.3 + rnd(i + 80) * 0.36,
  col: ['rgba(176,107,255,', 'rgba(255,111,181,', 'rgba(92,225,230,', 'rgba(120,140,255,'][i % 4], ph: rnd(i + 9) * TAU,
}));
const LANES = [
  [[-0.8, 0.1], [-0.35, -0.25], [0.1, 0.3], [0.7, 0.05], 0.13],
  [[-0.6, 0.45], [-0.2, 0.2], [0.25, 0.55], [0.55, 0.32], 0.09],
  [[-0.2, -0.45], [0.1, -0.2], [0.35, -0.5], [0.75, -0.3], 0.07],
];
export function nebulaCloud(ctx, t, x, y, r, o = {}) {
  const { a = 1, dust = 1, stars = 1, faceA = 0, talk = 0, mood = 'happy', look = 0 } = o;
  if (a <= 0 || r <= 1) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.globalCompositeOperation = 'lighter';
  glow(ctx, x, y, 0, r * 0.7, 'rgba(255,190,230,0.22)');
  for (const p of PUFFS) {
    const px = x + Math.cos(p.a + Math.sin(t * 0.3 + p.ph) * 0.08) * p.d * r * 1.2;
    const py = y + Math.sin(p.a) * p.d * r * 0.85 + Math.sin(t * 0.7 + p.ph) * r * 0.02;
    glow(ctx, px, py, 0, p.r * r, p.col + '0.26)');
  }
  ctx.globalCompositeOperation = 'source-over';
  // dark, soft-edged dust lanes
  if (dust > 0) {
    ctx.lineCap = 'round';
    for (const [p0, p1, p2, p3, w] of LANES)
      for (const k of [1, 0.7, 0.45, 0.25]) {
        ctx.strokeStyle = `rgba(30,12,45,${0.2 * dust * (1 - 0.75 * faceA)})`;
        ctx.lineWidth = w * r * k;
        ctx.beginPath();
        ctx.moveTo(x + p0[0] * r, y + p0[1] * r);
        ctx.bezierCurveTo(x + p1[0] * r, y + p1[1] * r, x + p2[0] * r, y + p2[1] * r, x + p3[0] * r, y + p3[1] * r);
        ctx.stroke();
      }
  }
  for (let i = 0; i < 6 * stars; i++) {
    const sx = x + (rnd(i + 200) - 0.5) * r * 1.3, sy = y + (rnd(i + 230) - 0.5) * r * 0.9;
    const tw = 0.6 + 0.4 * Math.sin(t * 3 + i * 1.7);
    glow(ctx, sx, sy, 0, r * 0.08 * tw, 'rgba(255,250,220,0.9)');
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(sx, sy, r * 0.012 + 1.5, 0, TAU); ctx.fill();
  }
  if (faceA > 0) {
    ctx.globalAlpha = a * faceA;
    face(ctx, t, x, y + r * 0.05, r * 0.5, { talk, mood, look, ink: '#2a1240' });
  }
  ctx.restore();
}

// ---------- baby protostar swaddled in a dusty blanket (its leftover envelope of gas and dust) ----------
export function protostar(ctx, t, x, y, r, o = {}) {
  const { talk = 0, mood = 'happy', heat = 1 } = o;
  glow(ctx, x, y, r * 0.3, r * 3.2 * heat, `rgba(255,190,110,${0.5 * heat})`);
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#fffbe0'); g.addColorStop(0.6, '#ffd27a'); g.addColorStop(1, '#ff9a3c');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#ff9a3c'; ctx.lineWidth = r * 0.08; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x + r * 0.1, y - r * 1.08, r * 0.16, Math.PI * 0.9, Math.PI * 2.3); ctx.stroke();
  face(ctx, t, x, y - r * 0.12, r * 0.8, { talk, mood });
  // blanket: wavy top edge, dusty speckles
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - r * 1.25, y + r * 0.5);
  for (let i = 0; i <= 10; i++) {
    const u = i / 10;
    ctx.lineTo(x - r * 1.25 + u * r * 2.5, y + r * (0.42 + 0.07 * Math.sin(u * 14 + t * 2)));
  }
  ctx.quadraticCurveTo(x + r * 1.35, y + r * 1.35, x, y + r * 1.4);
  ctx.quadraticCurveTo(x - r * 1.35, y + r * 1.35, x - r * 1.25, y + r * 0.5);
  const bg = ctx.createLinearGradient(x, y + r * 0.4, x, y + r * 1.4);
  bg.addColorStop(0, '#c98a5a'); bg.addColorStop(1, '#7a4a3a');
  ctx.fillStyle = bg; ctx.fill();
  ctx.clip();
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = i % 2 ? 'rgba(255,220,170,0.5)' : 'rgba(92,225,230,0.5)';
    ctx.beginPath(); ctx.arc(x + (rnd(i + 300) - 0.5) * r * 2.3, y + r * (0.55 + rnd(i + 330) * 0.8), r * 0.05, 0, TAU); ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = '#ffd9a8'; ctx.lineWidth = r * 0.06;
  ctx.beginPath(); ctx.moveTo(x - r * 0.5, y + r * 0.75); ctx.quadraticCurveTo(x, y + r * 0.95, x + r * 0.5, y + r * 0.75); ctx.stroke();
}

// ---------- the old star (late in life): big, puffy, glasses ----------
export function oldStar(ctx, t, x, y, r, o = {}) {
  const { talk = 0, mood = 'happy', puff = 0 } = o;
  glow(ctx, x, y, r * 0.7, r * 1.8, 'rgba(255,120,80,0.35)');
  const wob = 1 + 0.045 * Math.sin(t * 2.6) + puff * 0.08 * Math.sin(t * 9);
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r * wob);
  g.addColorStop(0, '#ffd2a0'); g.addColorStop(0.55, '#ff8a5c'); g.addColorStop(1, '#d9474a');
  ctx.fillStyle = g;
  ctx.beginPath();
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * TAU, rr = r * wob * (1 + 0.02 * Math.sin(a * 5 + t * 3));
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.fill();
  face(ctx, t, x, y + r * 0.05, r * 0.7, { talk, mood, glasses: true });
  // bushy eyebrows
  ctx.strokeStyle = '#fff1e0'; ctx.lineWidth = r * 0.06; ctx.lineCap = 'round';
  for (const k of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(x + k * r * 0.12, y - r * 0.3); ctx.lineTo(x + k * r * 0.34, y - r * 0.27); ctx.stroke();
  }
}

// ---------- Ring Nebula: expanding glowing shell with the hot central star (same grandpa, now small) ----------
export function ringNebula(ctx, t, x, y, R, o = {}) {
  const { a = 1, starR = R * 0.16, talk = 0, mood = 'happy', faceA = 1 } = o;
  if (a <= 0 || R <= 1) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const fill = ctx.createRadialGradient(x, y, 0, x, y, R * 0.85);
  fill.addColorStop(0, 'rgba(170,235,255,0.42)'); fill.addColorStop(0.55, 'rgba(110,215,255,0.34)');
  fill.addColorStop(0.8, 'rgba(90,190,255,0.2)'); fill.addColorStop(1, 'rgba(90,190,255,0)');
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.ellipse(x, y, R * 0.85, R * 0.85 * 0.86, 0, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 40; i++) {
    const ang = (i / 40) * TAU + Math.sin(t * 0.2) * 0.05;
    const rr = R * (0.98 + 0.07 * Math.sin(i * 2.7 + t));
    const px = x + Math.cos(ang) * rr, py = y + Math.sin(ang) * rr * 0.86;
    glow(ctx, px, py, 0, R * 0.34, 'rgba(255,110,70,0.17)');
    glow(ctx, x + Math.cos(ang) * R * 0.82, y + Math.sin(ang) * R * 0.82 * 0.86, 0, R * 0.2, 'rgba(255,215,120,0.16)');
  }
  ctx.globalCompositeOperation = 'source-over';
  for (const [w, al] of [[0.16, 0.12], [0.09, 0.16], [0.04, 0.22]]) {
    ctx.strokeStyle = `rgba(150,235,255,${al})`; ctx.lineWidth = R * w;
    ctx.beginPath(); ctx.ellipse(x, y, R * 0.7, R * 0.7 * 0.86, 0, 0, TAU); ctx.stroke();
  }
  // hot central star
  glow(ctx, x, y, 0, starR * 2.6, 'rgba(220,240,255,0.6)');
  ctx.fillStyle = C.hot;
  ctx.beginPath(); ctx.arc(x, y, starR, 0, TAU); ctx.fill();
  if (faceA > 0 && starR > 20) {
    ctx.globalAlpha = a * faceA;
    face(ctx, t, x, y + starR * 0.05, starR * 0.85, { talk, mood, glasses: true });
  }
  ctx.restore();
}

// ---------- yellow "恒星摇篮" label sticker ----------
export function cradleIcon(ctx, x, y, s, color = C.ink) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -6, 26, 0.05 * Math.PI, 0.95 * Math.PI); ctx.lineTo(-26, -10); ctx.moveTo(26, -10); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 26, 34, 1.2 * Math.PI, 1.8 * Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.arc(8, -14, 8, 0, TAU); ctx.fill();
  ctx.restore();
}

export function sticker(ctx, x, y, s, rot = 0, text = '恒星摇篮', o = {}) {
  const { fill = C.gold, ink = C.ink } = o;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(10,5,30,0.4)';
  ctx.beginPath(); ctx.roundRect(-150, -48 + 8, 300, 96, 20); ctx.fill();
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.roundRect(-150, -48, 300, 96, 20); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 5; ctx.setLineDash([12, 8]);
  ctx.beginPath(); ctx.roundRect(-140, -38, 280, 76, 14); ctx.stroke();
  ctx.setLineDash([]);
  cradleIcon(ctx, -92, 4, 0.9, ink);
  txt(ctx, text, 28, 2, { size: 50, color: ink });
  ctx.restore();
}

// ---------- particles for "气体 + 尘埃" ----------
export function gasDot(ctx, x, y, r, a = 1) {
  glow(ctx, x, y, 0, r * 2.4, `rgba(92,225,230,${0.35 * a})`);
  ctx.fillStyle = `rgba(160,245,250,${a})`;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}

export function dustGrain(ctx, x, y, r, rot = 0, a = 1) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = `rgba(233,168,90,${a})`;
  ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    const ang = (i / 7) * TAU, rr = r * (0.7 + 0.5 * rnd(i * 3 + Math.round(r)));
    ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

// rounded name tag with a small subtitle
export function tag(ctx, x, y, main, sub, o = {}) {
  const { color = C.gold, size = 44, a = 1 } = o;
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.font = `${size}px YuanB, RoundB, UniB, HiraGB`;
  const w = Math.max(ctx.measureText(main).width, sub ? ctx.measureText(sub).width * 0.62 : 0) + 64;
  const h = sub ? size * 2.25 : size * 1.6;
  ctx.fillStyle = 'rgba(8,10,36,0.85)';
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 24); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.stroke();
  txt(ctx, main, x, sub ? y - size * 0.42 : y, { size, color });
  if (sub) txt(ctx, sub, x, y + size * 0.62, { size: size * 0.6, color: 'rgba(255,255,255,0.85)' });
  ctx.restore();
}

export const mix = (p, a, b) => lerp(a, b, clamp(p));
