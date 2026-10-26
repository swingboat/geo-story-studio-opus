// Pseudo-3D solar-system view shared by the orbit scenes: Earth's orbital plane seen at an angle,
// plus an inclined, elongated comet orbit whose debris stream pierces that plane exactly at Earth's orbit.
import { C, glow, text, alpha, rand, pill, clamp } from './lib.mjs';
import { sun, earth } from './chars.mjs';

export const VIEW = { cx: 540, cy: 990, au: 390, ky: 0.55, kz: 0.84 };
export const project = ([X, Y, Z]) => ({
  x: VIEW.cx + X * VIEW.au,
  y: VIEW.cy - Y * VIEW.au * VIEW.ky - Z * VIEW.au * VIEW.kz,
});

// Comet orbit: e = 0.9, semi-latus rectum 1.5 AU. Its ascending node sits at r = 1 AU (on Earth's orbit);
// the descending node lies at 3 AU, far off screen, so only one crossing is visible.
const ECC = 0.9, SLR = 1.5, INC = 0.95;
export const NU0 = Math.acos((SLR - 1) / ECC);
export const NODE = -0.5; // heliocentric longitude of the crossing
const N = [Math.cos(NODE), Math.sin(NODE)], M = [-Math.sin(NODE), Math.cos(NODE)];

export function cometPos(nu) {
  const r = SLR / (1 + ECC * Math.cos(nu));
  const a = r * Math.cos(nu - NU0), b = r * Math.sin(nu - NU0);
  return [a * N[0] + b * Math.cos(INC) * M[0], a * N[1] + b * Math.cos(INC) * M[1], b * Math.sin(INC)];
}
export const earthPos = (theta) => [Math.cos(theta), Math.sin(theta), 0];
export const NODE_XY = project(earthPos(NODE));

// Calendar date (fraction of a year) → longitude; mid-August (Perseids peak) sits on the crossing.
export const PEAK = (31 + 28 + 31 + 30 + 31 + 30 + 31 + 12) / 365;
export const dateTheta = (frac) => NODE + 2 * Math.PI * (frac - PEAK);

const NU_MIN = -2.55, NU_MAX = 2.55;
const CLIP = [470, 1430];

function clipBand(ctx) {
  ctx.beginPath(); ctx.rect(0, CLIP[0], 1080, CLIP[1] - CLIP[0]); ctx.clip();
}

// Orbit path of the stream, split by side of Earth's orbital plane.
export function streamPath(ctx, side, a = 1) {
  ctx.save(); clipBand(ctx); ctx.globalAlpha *= a;
  ctx.strokeStyle = side > 0 ? 'rgba(255,213,128,0.55)' : 'rgba(255,213,128,0.25)';
  ctx.lineWidth = side > 0 ? 3 : 2;
  ctx.setLineDash(side > 0 ? [] : [10, 10]);
  ctx.beginPath();
  let pen = false;
  for (let i = 0; i <= 240; i++) {
    const nu = NU_MIN + ((NU_MAX - NU_MIN) * i) / 240;
    const P = cometPos(nu);
    if (Math.sign(P[2] || 1) !== side) { pen = false; continue; }
    const p = project(P);
    if (pen) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
    pen = true;
  }
  ctx.stroke(); ctx.restore();
}

// Debris grains. spread 0..1 grows the stream from a clump around nuC; grains always drift forward.
export function streamGrains(ctx, t, side, o = {}) {
  const { spread = 1, nuC = 0.3, a = 1, n = 230, bright = 0 } = o;
  ctx.save(); clipBand(ctx); ctx.globalAlpha *= a;
  const span = NU_MAX - NU_MIN;
  for (let i = 0; i < n; i++) {
    let nu = nuC + (rand(i + 1) * 2 - 1) * spread * (span / 2) + t * 0.05;
    nu = NU_MIN + ((((nu - NU_MIN) % span) + span) % span);
    const P = cometPos(nu);
    if (Math.sign(P[2] || 1) !== side) continue;
    const j = 0.045;
    const p = project([P[0] + (rand(i + 7) - 0.5) * j, P[1] + (rand(i + 9) - 0.5) * j, P[2] + (rand(i + 11) - 0.5) * j]);
    ctx.fillStyle = side > 0 ? (i % 4 ? '#e9c98f' : '#fff0c8') : 'rgba(233,201,143,0.45)';
    ctx.beginPath(); ctx.arc(p.x, p.y, (1.4 + rand(i + 3) * 2.2) * (1 + bright * 0.6), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function plane(ctx, a = 1, trail = null) {
  alpha(ctx, a, () => {
    const { cx, cy, au, ky } = VIEW;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, au * 1.15);
    g.addColorStop(0, 'rgba(70,150,220,0.16)'); g.addColorStop(1, 'rgba(70,150,220,0.03)');
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1, ky);
    ctx.beginPath(); ctx.arc(0, 0, au * 1.15, 0, Math.PI * 2); ctx.restore();
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = '#4f7fa8'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(cx, cy, au, au * ky, 0, 0, Math.PI * 2); ctx.stroke();
    if (trail) {
      ctx.save(); ctx.strokeStyle = C.blue; ctx.lineWidth = 7; ctx.shadowColor = C.blue; ctx.shadowBlur = 14;
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const p = project(earthPos(trail[0] + ((trail[1] - trail[0]) * i) / 120));
        if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
      }
      ctx.stroke(); ctx.restore();
    }
  });
}

// Direction arrow on Earth's orbit (counter-clockwise seen from the north).
export function orbitArrow(ctx, theta, color = C.blue) {
  const p = project(earthPos(theta)), q = project(earthPos(theta + 0.12));
  const ang = Math.atan2(q.y - p.y, q.x - p.x);
  ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(ang); ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-12, -11); ctx.lineTo(-12, 11); ctx.closePath(); ctx.fill(); ctx.restore();
}

export function node(ctx, t, a = 1, label = '交会处') {
  if (a <= 0) return;
  const { x, y } = NODE_XY;
  alpha(ctx, a, () => {
    glow(ctx, x, y, 110, 'rgba(255,220,140,0.35)');
    for (let k = 0; k < 2; k++) {
      const u = (t * 0.8 + k / 2) % 1;
      ctx.strokeStyle = `rgba(255,213,128,${0.8 * (1 - u)})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(x, y, 30 + u * 70, (30 + u * 70) * 0.6, 0, 0, Math.PI * 2); ctx.stroke();
    }
    if (label) pill(ctx, label, x + 30, y + 115, C.gold, 32);
  });
}

export function solarCore(ctx, t) {
  sun(ctx, VIEW.cx, VIEW.cy, 52, t);
  text(ctx, '太阳', VIEW.cx, VIEW.cy + 80, 26, C.gold);
}

export function earthAt(ctx, t, theta, r = 42, o = {}) {
  const p = project(earthPos(theta));
  earth(ctx, p.x, p.y, r, t, o);
  return p;
}

// Month ring around Earth's orbit; the label nearest to `hot` (a longitude) lights up.
export function months(ctx, t, show = 1, hot = null) {
  for (let k = 1; k <= 12; k++) {
    const a = clamp(show * 12 - (k - 1));
    if (a <= 0) continue;
    const th = dateTheta((k - 0.5) / 12);
    const p = project([Math.cos(th) * 1.24, Math.sin(th) * 1.24, 0]);
    let d = hot === null ? 9 : Math.abs(Math.atan2(Math.sin(th - hot), Math.cos(th - hot)));
    const lit = d < 0.27;
    alpha(ctx, a, () => text(ctx, `${k}月`, p.x, p.y, lit ? 36 : 28, lit ? C.white : k === 8 ? C.gold : C.dim));
  }
}
