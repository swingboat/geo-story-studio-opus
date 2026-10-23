// Props: titles, name tags, the magnifier, see-through sugar cubes, the ≠ stamp and particle fields.
import { W, C, TAU, rnd, clamp, lerp, txt, around, pop, fadeIn } from './lib.mjs';
import { gasDot, dustGrain } from './cast.mjs';

const INK = '#0a0828';

// Two-line scene title that pops in at t0 (and optionally pops out at t1).
export function title(ctx, t, t0, main, sub, o = {}) {
  const { y = 330, color = C.white, subColor = C.gold, t1 = Infinity, size = 80 } = o;
  const p = pop(t, t0, 0.5) * (1 - clamp((t - t1) / 0.3));
  around(ctx, W / 2, y, p, fadeIn(t, t0, 0.25), () => {
    txt(ctx, main, W / 2, y, { size, color, stroke: INK, sw: 14 });
    if (sub) txt(ctx, sub, W / 2, y + size * 1.05, { size: 42, color: subColor, stroke: INK, sw: 8 });
  });
}

// Rounded name tag with a small subtitle.
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

// Big stamped word with a thick outline, rotated slightly; p is the pop progress.
export function stamp(ctx, x, y, s, p, o = {}) {
  const { color = C.gold, size = 110, rot = -0.08, box = true } = o;
  if (p <= 0) return;
  around(ctx, x, y, lerp(1.8, 1, Math.min(1, p)) * p, Math.min(1, p * 1.5), () => {
    ctx.save();
    ctx.font = `${size}px YuanB, RoundB, UniB, HiraGB`;
    const w = ctx.measureText(s).width + size * 0.9, h = size * 1.5;
    if (box) {
      ctx.fillStyle = 'rgba(8,10,36,0.88)';
      ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 30); ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.stroke();
      ctx.setLineDash([14, 10]); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(x - w / 2 + 14, y - h / 2 + 14, w - 28, h - 28, 20); ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
    txt(ctx, s, x, y + size * 0.03, { size, color, stroke: INK, sw: 12 });
  }, rot);
}

// Magnifier: lens at (x,y) radius r, handle pointing along `ang`; content(ctx) is drawn clipped inside the glass.
export function magnifier(ctx, x, y, r, ang, content, len = r * 0.85) {
  const hx = x + Math.cos(ang) * r, hy = y + Math.sin(ang) * r;
  const ex = x + Math.cos(ang) * (r + len), ey = y + Math.sin(ang) * (r + len);
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = r * 0.26;
  ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.strokeStyle = '#c0703a'; ctx.lineWidth = r * 0.18;
  ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.fillStyle = 'rgba(14,16,58,0.94)';
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r - 4, 0, TAU); ctx.clip();
  content(ctx);
  ctx.fillStyle = 'rgba(160,220,255,0.06)'; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = r * 0.16;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  ctx.strokeStyle = '#ffc93c'; ctx.lineWidth = r * 0.1;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = r * 0.05;
  ctx.beginPath(); ctx.arc(x, y, r * 0.78, -2.5, -1.7); ctx.stroke();
  ctx.restore();
  return [ex, ey];
}

// Isometric see-through cube centred at (x,y) with edge s. inside(p) gets a projector p(u,v,w) for u,v,w ∈ [0,1].
export function cube(ctx, x, y, s, o = {}, inside) {
  const { edge = 'rgba(255,255,255,0.85)', tint = 'rgba(200,230,255,0.08)', top = 'rgba(255,255,255,0.18)', lw = 5, sugar = false } = o;
  const k = s * 0.8;
  const p = (u, v, w) => [x + (u - w) * k * 0.87, y + (u + w - 1) * k * 0.5 - (v - 0.5) * k + k * 0.0];
  const poly = (pts, fill) => {
    ctx.beginPath(); pts.forEach(([u, v, w], i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, ...p(u, v, w))); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
  };
  ctx.save();
  ctx.lineJoin = 'round';
  // back faces
  poly([[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]], tint);
  poly([[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], tint);
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = lw * 0.6;
  ctx.beginPath();
  for (const [a, b] of [[[0, 0, 0], [1, 0, 0]], [[0, 0, 0], [0, 0, 1]], [[0, 0, 0], [0, 1, 0]]]) { ctx.moveTo(...p(...a)); ctx.lineTo(...p(...b)); }
  ctx.stroke();
  if (inside) inside(p);
  // front faces
  poly([[1, 0, 0], [1, 0, 1], [1, 1, 1], [1, 1, 0]], sugar ? 'rgba(245,248,255,0.92)' : tint);
  poly([[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], sugar ? 'rgba(215,224,245,0.92)' : tint);
  poly([[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]], sugar ? '#ffffff' : top);
  if (sugar) {
    for (let i = 0; i < 26; i++) {
      const [gx, gy] = p(1, rnd(i) * 0.9 + 0.05, rnd(i + 9) * 0.9 + 0.05);
      ctx.fillStyle = 'rgba(170,185,220,0.8)'; ctx.fillRect(gx - 2, gy - 2, 4, 4);
      const [hx, hy] = p(rnd(i + 3) * 0.9 + 0.05, rnd(i + 5) * 0.9 + 0.05, 1);
      ctx.fillRect(hx - 2, hy - 2, 4, 4);
    }
  }
  ctx.strokeStyle = edge; ctx.lineWidth = lw;
  ctx.beginPath();
  const E = [[[1, 0, 0], [1, 0, 1]], [[1, 0, 1], [0, 0, 1]], [[1, 0, 0], [1, 1, 0]], [[1, 0, 1], [1, 1, 1]], [[0, 0, 1], [0, 1, 1]],
    [[0, 1, 0], [1, 1, 0]], [[1, 1, 0], [1, 1, 1]], [[1, 1, 1], [0, 1, 1]], [[0, 1, 1], [0, 1, 0]]];
  for (const [a, b] of E) { ctx.moveTo(...p(...a)); ctx.lineTo(...p(...b)); }
  ctx.stroke();
  ctx.restore();
  return p;
}

// The red "≠" sign.
export function neqSign(ctx, x, y, s, p, color = C.no) {
  if (p <= 0) return;
  around(ctx, x, y, p, Math.min(1, p * 1.5), () => {
    ctx.save();
    ctx.lineCap = 'round';
    for (const [col, w] of [[INK, 34 * s], [color, 20 * s]]) {
      ctx.strokeStyle = col; ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(x - 60 * s, y - 26 * s); ctx.lineTo(x + 60 * s, y - 26 * s);
      ctx.moveTo(x - 60 * s, y + 26 * s); ctx.lineTo(x + 60 * s, y + 26 * s);
      ctx.moveTo(x + 30 * s, y - 80 * s); ctx.lineTo(x - 30 * s, y + 80 * s);
      ctx.stroke();
    }
    ctx.restore();
  });
}

// A drifting field of gas dots and dust grains. pts(i) gives each particle's home; a(i) its alpha.
export function field(ctx, t, n, home, o = {}) {
  const { r = 8, alpha = () => 1, drift = 14, dustEvery = 3, seed = 0 } = o;
  for (let i = 0; i < n; i++) {
    const [hx, hy] = home(i);
    const a = alpha(i);
    if (a <= 0) continue;
    const x = hx + Math.sin(t * (0.4 + rnd(i + seed) * 0.5) + i) * drift, y = hy + Math.cos(t * (0.3 + rnd(i + seed + 7) * 0.5) + i * 1.3) * drift;
    if (i % dustEvery === dustEvery - 1) dustGrain(ctx, x, y, r * 1.3, t * 0.5 + i, a);
    else gasDot(ctx, x, y, r, a);
  }
}
