// Top-down "dark map" for the distance walk: camera keyframes, school playground, campus, town, orbits, scale bar, compass.
// World units are metres: x = east, d = north distance from the Sun ball (on the football pitch's south goal line).
import { C, NUM, SANS, W, prog, lerp, easeIO, txt, rand } from './lib.mjs';

// [time, focus d, px per metre, screen y of the focus]
let KEYS = [];
export function setCamera(keys) { KEYS = keys; }

export function camera(t) {
  let i = 0;
  while (i < KEYS.length - 2 && t >= KEYS[i + 1][0]) i++;
  const [t0, d0, k0, y0] = KEYS[i], [t1, d1, k1, y1] = KEYS[i + 1];
  const p = easeIO(prog(t, t0, t1));
  const k = k0 * Math.pow(k1 / k0, p), fd = lerp(d0, d1, p), ay = lerp(y0, y1, p);
  return { k, X: (x) => W / 2 + x * k, Y: (d) => ay - (d - fd) * k };
}

// piecewise eased track through [time, value] keys (used for the walker)
export function track(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i], [t1, v1] = keys[i + 1];
    if (t < t1) return lerp(v0, v1, easeIO(prog(t, t0, t1)));
  }
  return keys[keys.length - 1][1];
}

const CAMPUS = { x0: -200, x1: 200, d0: -120, d1: 450 };
const XS = [-2600, -1800, -1200, -700, -320, 0, 320, 700, 1200, 1800, 2600];
const DS = [-900, -450, -120, 450, 800, 1150, 1500, 1900, 2250, 2600, 2950, 3300, 3700, 4100];
const RIVER = 1700;

function rectW(ctx, cam, x0, d0, x1, d1) {
  const { X, Y } = cam;
  ctx.fillRect(X(x0), Y(d1), (x1 - x0) * cam.k, (d1 - d0) * cam.k);
}

// stadium (running-track) outline of half-width r around straights between d = a and d = b
function stadium(ctx, cam, r, a, b) {
  const { X, Y, k } = cam;
  ctx.beginPath();
  ctx.arc(X(0), Y(b), r * k, Math.PI, 0);
  ctx.lineTo(X(r), Y(a));
  ctx.arc(X(0), Y(a), r * k, 0, Math.PI);
  ctx.closePath();
}

function town(ctx, cam, t) {
  const { k } = cam;
  // blocks between roads, skipping the campus
  for (let i = 0; i < XS.length - 1; i++)
    for (let j = 0; j < DS.length - 1; j++) {
      const x0 = XS[i] + 14, x1 = XS[i + 1] - 14, d0 = DS[j] + 14, d1 = DS[j + 1] - 14;
      if (x1 > CAMPUS.x0 && x0 < CAMPUS.x1 && d1 > CAMPUS.d0 && d0 < CAMPUS.d1) continue;
      if (d0 < RIVER + 40 && d1 > RIVER - 40) continue;
      const park = (i * 7 + j * 3) % 11 === 4;
      ctx.fillStyle = park ? '#173d2c' : '#18213d';
      rectW(ctx, cam, x0, d0, x1, d1);
      if (park) continue;
      // buildings
      ctx.fillStyle = C.roof;
      const n = 3;
      for (let a = 0; a < n; a++)
        for (let b = 0; b < n; b++) {
          const s = i * 131 + j * 17 + a * 5 + b;
          if (rand(s) < 0.25) continue;
          const cw = (x1 - x0) / n, ch = (d1 - d0) / n;
          const bx = x0 + a * cw + cw * 0.12, bd = d0 + b * ch + ch * 0.12;
          rectW(ctx, cam, bx, bd, bx + cw * (0.6 + 0.2 * rand(s + 1)), bd + ch * (0.6 + 0.2 * rand(s + 2)));
        }
    }
  // river with a bridge on the avenue
  ctx.fillStyle = C.river;
  rectW(ctx, cam, -4000, RIVER - 30, 4000, RIVER + 30);
  ctx.fillStyle = '#5a6488';
  rectW(ctx, cam, -14, RIVER - 36, 14, RIVER + 36);
  if (k > 0.2 && k < 1.2) txt(ctx, '小河', cam.X(-520), cam.Y(RIVER), { size: 30, font: SANS, color: 'rgba(170,210,255,0.7)' });
}

function campus(ctx, cam, t) {
  const { X, Y, k } = cam;
  ctx.fillStyle = '#132a3a';
  rectW(ctx, cam, CAMPUS.x0, CAMPUS.d0, CAMPUS.x1, CAMPUS.d1);
  ctx.strokeStyle = 'rgba(160,200,255,0.55)'; ctx.lineWidth = Math.max(2, 2.5 * k);
  ctx.strokeRect(X(CAMPUS.x0), Y(CAMPUS.d1), (CAMPUS.x1 - CAMPUS.x0) * k, (CAMPUS.d1 - CAMPUS.d0) * k);
  // teaching buildings either side of the avenue, beyond the track
  ctx.fillStyle = '#2a3866';
  for (const [x0, d0, x1, d1] of [[45, 165, 170, 215], [45, 245, 170, 290], [-170, 170, -45, 230], [-170, 300, -60, 380], [60, 330, 170, 400]])
    rectW(ctx, cam, x0, d0, x1, d1);
  if (k > 1.6) {
    txt(ctx, '教学楼', X(107), Y(190), { size: 30, font: SANS, color: 'rgba(200,215,255,0.75)' });
    txt(ctx, '图书馆', X(-107), Y(200), { size: 30, font: SANS, color: 'rgba(200,215,255,0.75)' });
  }
  // track: outer ring, lanes, then the pitch
  const A = 52.5 - 42.195, B = 52.5 + 42.195;
  ctx.fillStyle = '#9c4a36'; stadium(ctx, cam, 46.3, A, B); ctx.fill();
  if (k > 1.5) {
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
    for (let l = 1; l < 8; l++) { stadium(ctx, cam, 36.5 + l * 1.22, A, B); ctx.stroke(); }
  }
  ctx.fillStyle = '#2b6b45'; stadium(ctx, cam, 36.5, A, B); ctx.fill();
  for (let s = 0; s < 10; s++) {
    ctx.fillStyle = s % 2 ? '#2f7a4d' : '#2a7047';
    rectW(ctx, cam, -34, s * 10.5, 34, (s + 1) * 10.5);
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = Math.max(1, 0.15 * k);
  ctx.strokeRect(X(-34), Y(105), 68 * k, 105 * k);
  ctx.beginPath(); ctx.moveTo(X(-34), Y(52.5)); ctx.lineTo(X(34), Y(52.5)); ctx.stroke();
  ctx.beginPath(); ctx.arc(X(0), Y(52.5), 9.15 * k, 0, Math.PI * 2); ctx.stroke();
  for (const [d, s] of [[0, 1], [105, -1]]) {
    ctx.strokeRect(X(-20.16), Y(s > 0 ? 16.5 : 105), 40.32 * k, 16.5 * k);
  }
  // trees along the avenue
  for (let d = 150; d < 440; d += 22)
    for (const x of [-26, 26]) {
      ctx.fillStyle = '#1f5a3a';
      ctx.beginPath(); ctx.arc(X(x), Y(d), Math.max(1.5, 6 * k), 0, Math.PI * 2); ctx.fill();
    }
}

export function gate(ctx, cam, glowA = 0) {
  const { X, Y, k } = cam;
  const y = Y(CAMPUS.d1), w = Math.max(10, 16 * k);
  ctx.fillStyle = '#132a3a';
  ctx.fillRect(X(-16), y - 4, 32 * k, 8);
  ctx.fillStyle = glowA > 0 ? `rgba(255,201,60,${0.6 + 0.4 * glowA})` : '#8fa4d6';
  for (const s of [-1, 1]) ctx.fillRect(X(s * 16) - w / 2 * 0.5, y - w * 0.5, w * 0.5, w);
}

export function avenue(ctx, cam) {
  const { X, Y, k } = cam;
  ctx.fillStyle = '#2a3150';
  rectW(ctx, cam, -10, 105, 10, 4500);
  ctx.fillStyle = '#323a5c';
  for (const x of XS) rectW(ctx, cam, x - 8, -1200, x + 8, 4500);
  for (const d of DS) rectW(ctx, cam, -4000, d - 8, 4000, d + 8);
}

export function drawMap(ctx, cam, t, o = {}) {
  const { fade = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= fade;
  ctx.fillStyle = '#0c1430';
  ctx.fillRect(0, 0, W, 1920);
  avenue(ctx, cam);
  town(ctx, cam, t);
  campus(ctx, cam, t);
  gate(ctx, cam, o.gate ?? 0);
  ctx.restore();
}

// dashed orbit circles centred on the Sun
export function orbits(ctx, cam, list, a) {
  if (a <= 0) return;
  const { X, Y, k } = cam;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.lineWidth = 2.5; ctx.setLineDash([10, 10]);
  for (const p of list) {
    ctx.strokeStyle = 'rgba(160,210,255,0.55)';
    ctx.beginPath(); ctx.arc(X(0), Y(0), p.m * k, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

const NICE = [5, 10, 20, 50, 100, 200, 500, 1000, 2000];
export function scaleBar(ctx, cam, a = 1) {
  if (a <= 0) return;
  const L = NICE.find((n) => n * cam.k >= 110) ?? 2000, w = L * cam.k;
  ctx.save(); ctx.globalAlpha *= a;
  const x = 70, y = 1395;
  ctx.fillStyle = 'rgba(6,8,30,0.75)';
  ctx.beginPath(); ctx.roundRect(x - 20, y - 52, w + 40, 76, 16); ctx.fill();
  ctx.strokeStyle = C.white; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y - 10); ctx.stroke();
  txt(ctx, L >= 1000 ? `${L / 1000} 千米` : `${L} 米`, x + w / 2, y - 28, { size: 28, font: NUM, color: C.white });
  ctx.restore();
}

export function compass(ctx, a = 1) {
  if (a <= 0) return;
  const x = 110, y = 330;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(6,8,30,0.75)';
  ctx.beginPath(); ctx.arc(x, y, 44, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.red;
  ctx.beginPath(); ctx.moveTo(x, y - 34); ctx.lineTo(x + 12, y + 2); ctx.lineTo(x - 12, y + 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.white;
  ctx.beginPath(); ctx.moveTo(x, y + 30); ctx.lineTo(x + 12, y + 2); ctx.lineTo(x - 12, y + 2); ctx.closePath(); ctx.fill();
  txt(ctx, '北', x, y - 64, { size: 32, color: C.white, stroke: C.ink, sw: 6 });
  ctx.restore();
}

