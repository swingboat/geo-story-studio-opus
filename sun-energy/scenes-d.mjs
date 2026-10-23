// Scenes 7–8: energy's long trip out — zig-zag through the radiative zone, boiling up the convective zone, reaching the 光球.
import { W, C, TAU, rnd, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, around, burst, talkLevel } from './lib.mjs';
import { astronaut, glow, sparkleStar } from './cast.mjs';
import { title, tag, stamp } from './props.mjs';
import { interior, ZONE } from './sun.mjs';

const INK = '#0a0828';
const CX = 540, CY = 930, R = 430, A0 = -0.75;

// Deterministic random walk from the core edge to the top of the radiative zone.
const WALK = (() => {
  const pts = [[Math.cos(A0) * ZONE.core * R * 1.05, Math.sin(A0) * ZONE.core * R * 1.05]];
  for (let i = 0; i < 260; i++) {
    const [x, y] = pts[pts.length - 1];
    const r0 = rnd(i * 7 + 3) * TAU, bias = 0.12;
    const a = Math.atan2(Math.sin(r0) + bias * Math.sin(A0), Math.cos(r0) + bias * Math.cos(A0));
    let nx = x + Math.cos(a) * R * 0.05, ny = y + Math.sin(a) * R * 0.05;
    const r = Math.hypot(nx, ny);
    if (r < ZONE.core * R * 1.05) { nx *= (ZONE.core * R * 1.1) / r; ny *= (ZONE.core * R * 1.1) / r; }
    pts.push([nx, ny]);
    if (r >= ZONE.rad * R * 0.97) break;
  }
  return pts.map(([x, y]) => [CX + x, CY + y]);
})();
const EXIT = Math.atan2(WALK.at(-1)[1] - CY, WALK.at(-1)[0] - CX);

function walkAt(p) {
  const f = clamp(p) * (WALK.length - 1), i = Math.min(WALK.length - 2, Math.floor(f)), k = f - i;
  return [lerp(WALK[i][0], WALK[i + 1][0], k), lerp(WALK[i][1], WALK[i + 1][1], k), i];
}

// Rolling ride up a convection loop.
function convAt(p) {
  const r = lerp(ZONE.rad * 1.0, 0.985, easeIO(p)) * R + Math.sin(p * TAU * 2) * R * 0.035;
  const a = EXIT + Math.sin(p * TAU * 2) * 0.07;
  return [CX + Math.cos(a) * r, CY + Math.sin(a) * r];
}

function pot(ctx, t, x, y, s) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#1b1f5e'; ctx.strokeStyle = C.gold; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(0, 0, 150, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 146, 0, TAU); ctx.clip();
  // flames
  for (let i = 0; i < 5; i++) {
    const fx = -80 + i * 40, h = 30 + 10 * Math.sin(t * 14 + i);
    ctx.fillStyle = '#ff7a1a';
    ctx.beginPath(); ctx.moveTo(fx - 14, 120); ctx.quadraticCurveTo(fx, 120 - h * 2, fx + 14, 120); ctx.fill();
  }
  // pot + soup
  ctx.fillStyle = '#9aa3c7'; ctx.strokeStyle = INK; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.roundRect(-100, -30, 200, 130, 22); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ff9a3c';
  ctx.beginPath(); ctx.ellipse(0, -30, 100, 20, 0, 0, TAU); ctx.fill(); ctx.stroke();
  // rolling arrows inside the soup
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 5;
  for (const k of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(k * 45, 35, 32, 42, 0, 0, TAU); ctx.stroke();
    const a = t * 3 * k;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(k * 45 + Math.cos(a) * 32, 35 + Math.sin(a) * 42, 7, 0, TAU); ctx.fill();
  }
  for (let i = 0; i < 6; i++) {
    const p = (t * 0.9 + i / 6) % 1;
    ctx.strokeStyle = `rgba(255,255,255,${1 - p})`; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(-70 + i * 28, -40 - p * 90, 8 + p * 10, 0, TAU); ctx.stroke();
  }
  ctx.restore();
}

function tripScene(ctx, t) {
  const t0 = S('out'), tRad = S('rad'), tYr = at('rad', '上万年'), tConv = S('conv'), tUp = at('conv', '往上翻'), tDown = at('conv', '沉下去');
  const tSoup = at('conv', '汤'), tK = S('kidSoup'), tSurf = S('surface'), tPh = at('surface', '光球');
  title(ctx, t, t0, '能量，往外送！', '从核心出发', { size: 82, t1: tRad - 0.2 });
  title(ctx, t, tRad, '辐射区：走走停停', '反复被吸收、再放出', { size: 76, t1: tConv - 0.2 });
  title(ctx, t, tConv, '对流区：翻滚上升', '热的上升，凉的下沉', { size: 76, t1: tSurf - 0.2 });
  title(ctx, t, tSurf, '终于到达表面！', '光球', { size: 80 });

  const sp = pop(t, t0 - 0.2, 0.6);
  around(ctx, CX, CY, sp, sp, () => {
    glow(ctx, CX, CY, R * 0.9, R * 1.35, 'rgba(255,160,60,0.35)');
    interior(ctx, t, CX, CY, R, {
      hiCore: 1 - prog(t, tRad, tRad + 0.5),
      hiRad: prog(t, tRad - 0.2, tRad + 0.3) * (1 - prog(t, tConv, tConv + 0.4)),
      hiConv: prog(t, tConv - 0.2, tConv + 0.3) * (1 - prog(t, tSurf, tSurf + 0.4)),
    });
    // photosphere rim lights up at the end
    const ph = prog(t, tPh - 0.4, tPh + 0.2);
    ctx.strokeStyle = `rgba(255,236,150,${0.3 + 0.7 * ph})`; ctx.lineWidth = 12 + 10 * ph;
    if (ph > 0) { ctx.shadowColor = '#ffe680'; ctx.shadowBlur = 40 * ph; }
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, TAU); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = INK; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(CX, CY, R + 10, 0, TAU); ctx.stroke();
  });

  // zone labels
  const lab = (tt, x, y, s, col) => { const p = pop(t, tt, 0.45); around(ctx, x, y, p, p, () => tag(ctx, x, y, s, null, { color: col, size: 44 })); };
  lab(t0 + 0.2, CX, CY + 10, '核心', C.core);
  lab(tRad - 0.1, CX - 160, CY + 190, '辐射区', C.rad);
  lab(tConv - 0.1, CX - 200, CY + 380, '对流区', C.conv);

  // the zig-zag trail through the radiative zone
  const wp = prog(t, at('rad', '能量') - 0.1, tYr + 0.3);
  if (wp > 0) {
    const [hx, hy, idx] = walkAt(wp);
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 4; ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(...WALK[0]);
    for (let i = 1; i <= idx; i++) ctx.lineTo(...WALK[i]);
    ctx.lineTo(hx, hy); ctx.stroke();
    ctx.restore();
    // tiny absorb/re-emit flashes at each bounce
    for (let i = Math.max(1, idx - 3); i <= idx; i++) glow(ctx, WALK[i][0], WALK[i][1], 0, 26, `rgba(255,255,255,${0.25 * (i - idx + 4)})`);
  }
  // the energy blob: walk → convection ride → surface
  const cp = prog(t, tUp - 0.4, tDown + 0.5) * 0.7 + prog(t, tSurf, tPh) * 0.3;
  let bx, by;
  if (cp > 0) [bx, by] = convAt(cp);
  else if (wp > 0) [bx, by] = walkAt(wp);
  else [bx, by] = WALK[0];
  const bp = pop(t, t0 + 0.4, 0.5) * (1 - prog(t, tPh + 0.6, tPh + 0.9));
  around(ctx, bx, by, bp, bp, () => sparkleStar(ctx, t, bx, by, 38, { faceA: 1, mood: t > tPh ? 'starry' : t > tRad && t < tConv ? 'sad' : 'happy', color: '#fffbd0', glowC: 'rgba(255,250,170,0.7)' }));
  burst(ctx, t, tPh, bx, by, { n: 14, r: 260, colors: [C.energy, C.gold, C.white] });

  // "10000+ years" stamp
  const yp = pop(t, tYr - 0.1, 0.5) * (1 - prog(t, tConv - 0.3, tConv));
  stamp(ctx, 830, 540, '上万年+', yp, { color: C.sky, size: 64, rot: -0.12 });

  // soup inset
  const sp2 = pop(t, tSoup - 0.15, 0.5) * (1 - prog(t, tSurf - 0.3, tSurf));
  around(ctx, 850, 1250, sp2, sp2, () => pot(ctx, t, 850, 1250, 1));
  // 小宇 says 咕嘟咕嘟
  const kp = easeOut(prog(t, tK - 0.6, tK)) * (1 - prog(t, tSurf + 0.2, tSurf + 0.7));
  if (kp > 0) {
    astronaut(ctx, t, lerp(-150, 140, kp), 1360, 0.55, { talk: talkLevel(t, ['kidSoup']), mood: 'wow', look: 1, lookY: -1, arm: -1 });
    ['咕嘟', '咕嘟'].forEach((s, i) => {
      const p = pop(t, tK + i * 0.3, 0.35);
      around(ctx, 330 + i * 140, 1430 - i * 40, p, p, () => txt(ctx, s, 330 + i * 140, 1430 - i * 40 + Math.sin(t * 6 + i) * 8, { size: 54, color: C.sky, stroke: INK, sw: 10 }), (i ? 0.15 : -0.1));
    });
  }
}

export const scenes = [
  { id: 'trip', from: S('out') - 0.3, to: S('space') - 0.3, draw: tripScene },
];

export const events = [
  { type: 'sparkle', t: S('out') + 0.4 },
  ...[...Array(18)].map((_, i) => ({ type: 'pop', t: at('rad', '能量') + i * ((at('rad', '上万年') - at('rad', '能量') + 0.4) / 18), f: 600 + (i % 5) * 160, amp: 0.3 })),
  { type: 'stamp', t: at('rad', '上万年') },
  { type: 'whoosh', t: at('conv', '往上翻') - 0.2, d: 0.7, from: 300, to: 1600 },
  { type: 'whoosh', t: at('conv', '沉下去') - 0.2, d: 0.7, from: 1600, to: 300 },
  { type: 'boing', t: at('conv', '汤') - 0.1, amp: 0.6 },
  ...[0, 0.3].map((d) => ({ type: 'pop', t: S('kidSoup') + d, f: 350, amp: 0.8 })),
  { type: 'tada', t: at('surface', '光球') }, { type: 'sparkle', t: at('surface', '光球') + 0.1 },
];
