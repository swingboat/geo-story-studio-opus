// Sunspot kit: the spot itself, spots on a disk, a close-up photosphere patch, convection cells and magnetic loops.
// The spot is always drawn in the same warm brown/orange — never black — because it still glows.
import { TAU, rnd, clamp, lerp } from './lib.mjs';
import { glow } from './cast.mjs';

export const SPOT = { umbra: '#7a3410', pen: '#b9601f', fil: 'rgba(120,52,16,0.55)' };
export const PHOTO = { lane: '#f08a26', cell: '#ffd36a', hot: '#fff1b0' };

function blobPath(ctx, r, seed, n = 14, wob = 0.16) {
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU, rr = r * (1 - wob / 2 + wob * rnd(seed * 31 + (i % n)));
    const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else {
      const pa = ((i - 0.5) / n) * TAU, pr = r * (1 - wob / 2 + wob * rnd(seed * 31 + i + 50));
      ctx.quadraticCurveTo(Math.cos(pa) * pr * 1.04, Math.sin(pa) * pr * 1.04, px, py);
    }
  }
  ctx.closePath();
}

// One sunspot: filamentary penumbra around a darker umbra. r = penumbra radius.
export function sunspot(ctx, x, y, r, o = {}) {
  const { seed = 1, a = 1, squash = 1, rot = 0, umbra = SPOT.umbra, pen = SPOT.pen } = o;
  if (a <= 0 || r <= 0.5) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, squash);
  blobPath(ctx, r, seed);
  ctx.fillStyle = pen; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.strokeStyle = SPOT.fil; ctx.lineWidth = Math.max(1, r * 0.035); ctx.lineCap = 'round';
  for (let i = 0; i < 40; i++) {
    const ang = (i / 40) * TAU + rnd(seed + i) * 0.1;
    ctx.beginPath();
    ctx.moveTo(Math.cos(ang) * r * 0.45, Math.sin(ang) * r * 0.45);
    ctx.lineTo(Math.cos(ang) * r * 1.05, Math.sin(ang) * r * 1.05);
    ctx.stroke();
  }
  ctx.restore();
  blobPath(ctx, r * 0.52, seed + 7, 10, 0.22);
  ctx.fillStyle = umbra; ctx.fill();
  ctx.restore();
}

// Spots scattered on a disk at (x,y) radius R; each spot {u,v,s} in disk units, drifting slowly with rotation.
// Draw inside a clip of the disk (e.g. sunBuddy's `inside` hook). grow ∈ [0,1] scales them in.
export function diskSpots(ctx, t, x, y, R, list, o = {}) {
  const { grow = 1, drift = 0.006 } = o;
  list.forEach((sp, i) => {
    const g = typeof grow === 'function' ? grow(i) : grow;
    if (g <= 0) return;
    const u = sp.u + t * drift;
    const lim = Math.sqrt(Math.max(0, 1 - sp.v * sp.v));
    if (Math.abs(u) >= lim) return;
    const squash = Math.sqrt(Math.max(0.05, 1 - (u / lim) ** 2));
    ctx.save();
    ctx.translate(x + u * R, y + sp.v * R);
    ctx.scale(squash, 1);
    sunspot(ctx, 0, 0, sp.s * R * g, { seed: sp.seed ?? i + 1 });
    ctx.restore();
  });
}

// Close-up of the photosphere: bright granules with darker lanes, gently boiling.
export function granules(ctx, t, x, y, w, h, o = {}) {
  const { cell = 46, a = 1, seed = 0, r = 30 } = o;
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.clip();
  ctx.fillStyle = PHOTO.lane; ctx.fillRect(x, y, w, h);
  const cols = Math.ceil(w / cell) + 2, rows = Math.ceil(h / cell) + 2;
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const k = seed + j * 97 + i;
      const cx = x + (i - 0.5 + (j % 2) * 0.5 + (rnd(k) - 0.5) * 0.6) * cell;
      const cy = y + (j - 0.5 + (rnd(k + 3) - 0.5) * 0.6) * cell;
      const rr = cell * (0.5 + 0.08 * Math.sin(t * (1 + rnd(k + 5)) + k));
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
      g.addColorStop(0, PHOTO.hot); g.addColorStop(0.55, PHOTO.cell); g.addColorStop(1, 'rgba(255,200,90,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU); ctx.fill();
    }
  ctx.restore();
}

// Side view of the layer under the photosphere: rolling convection cells.
// Cells near spotX slow down and fade as `calm` rises (strong field suppresses convection there).
export function convection(ctx, t, x, y, w, h, o = {}) {
  const { spotX = x + w / 2, calm = 0, n = 5, hot = 0 } = o;
  ctx.save();
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 28); ctx.clip();
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#ffb43c'); g.addColorStop(1, '#c2410f');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  const cw = w / n;
  for (let i = 0; i < n; i++) {
    const cx = x + cw * (i + 0.5), cy = y + h * 0.55;
    const near = clamp(1 - Math.abs(cx - spotX) / (cw * 0.9));
    const k = 1 - 0.85 * calm * near;
    const rx = cw * 0.4, ry = h * 0.34, dir = i % 2 ? 1 : -1;
    ctx.strokeStyle = `rgba(255,236,170,${0.25 + 0.35 * k})`; ctx.lineWidth = 5;
    ctx.setLineDash([16, 14]); ctx.lineDashOffset = -t * 60 * k * dir;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);
    // hot blobs riding the loop: up through the middle, back down at the edges
    for (let m = 0; m < 3; m++) {
      const ph = (t * 0.9 * k * dir + m / 3) * TAU;
      const bx = cx + Math.cos(ph) * rx, by = cy + Math.sin(ph) * ry;
      const up = Math.cos(ph) * dir < 0;
      glow(ctx, bx, by, 0, 26, `rgba(255,250,210,${(up ? 0.75 : 0.35) * (0.3 + 0.7 * k)})`);
    }
    // upward heat arrow in the cell centre, shrinking where convection is held down
    const al = (h * 0.42) * k, ay = cy + h * 0.2 - ((t * 40 * k) % 20);
    if (al > 8) {
      ctx.fillStyle = `rgba(255,255,230,${0.5 + 0.5 * k})`;
      ctx.beginPath();
      ctx.moveTo(cx, ay - al); ctx.lineTo(cx - 20, ay - al + 30); ctx.lineTo(cx - 8, ay - al + 30); ctx.lineTo(cx - 8, ay);
      ctx.lineTo(cx + 8, ay); ctx.lineTo(cx + 8, ay - al + 30); ctx.lineTo(cx + 20, ay - al + 30); ctx.closePath(); ctx.fill();
    }
  }
  if (hot > 0) glow(ctx, x + w / 2, y + h, 0, w * 0.7, `rgba(255,240,180,${0.3 * hot})`);
  ctx.restore();
}

// Magnetic field: a bundle of loops arching out of the surface at spotX±half, plus the flux tube below.
// p ∈ [0,1] draws the lines in; flow animates little dashes along them.
export function fieldLoops(ctx, t, spotX, surfY, half, o = {}) {
  const { p = 1, depth = 260, color = '120,220,255', a = 1, n = 5 } = o;
  if (p <= 0 || a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const s = half * (0.55 + 0.45 * (i / (n - 1)));
    const hgt = s * (1.5 + 0.3 * i / n);
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(spotX - s * 0.35, surfY + depth);
      ctx.lineTo(spotX - s * 0.35, surfY);
      ctx.bezierCurveTo(spotX - s * 0.6, surfY - hgt, spotX + s * 0.6, surfY - hgt, spotX + s * 0.35, surfY);
      ctx.lineTo(spotX + s * 0.35, surfY + depth);
    };
    const len = depth * 2 + hgt * 2.4;
    ctx.setLineDash([len * p, len]);
    ctx.strokeStyle = `rgba(${color},0.25)`; ctx.lineWidth = 16; path(); ctx.stroke();
    ctx.strokeStyle = `rgba(${color},0.9)`; ctx.lineWidth = 5; path(); ctx.stroke();
    if (p >= 1) {
      ctx.setLineDash([6, 34]); ctx.lineDashOffset = -t * 70;
      ctx.strokeStyle = 'rgba(235,252,255,0.95)'; ctx.lineWidth = 8; path(); ctx.stroke();
      ctx.lineDashOffset = 0;
    }
    ctx.setLineDash([]);
  }
  ctx.restore();
}

// A tiny thermometer-style heat bar used next to the panels. level ∈ [0,1].
export function heatBar(ctx, x, y, h, level, color) {
  ctx.save();
  ctx.fillStyle = 'rgba(8,10,36,0.85)';
  ctx.beginPath(); ctx.roundRect(x - 22, y - h, 44, h, 22); ctx.fill();
  ctx.fillStyle = color;
  const lh = lerp(30, h - 12, clamp(level));
  ctx.beginPath(); ctx.roundRect(x - 13, y - 6 - lh, 26, lh, 13); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y + 18, 34, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.roundRect(x - 22, y - h, 44, h, 22); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y + 18, 38, -Math.PI / 2 + 0.6, -Math.PI / 2 - 0.6 + TAU); ctx.stroke();
  ctx.restore();
}
