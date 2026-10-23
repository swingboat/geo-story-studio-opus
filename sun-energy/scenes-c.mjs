// Scenes 5–6: weigh 4 H vs 1 He (the missing mass becomes energy), then 4 million tonnes every second.
import { W, C, TAU, rnd, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, around, burst, card, talkLevel } from './lib.mjs';
import { astronaut, glow } from './cast.mjs';
import { title, tag, stamp } from './props.mjs';
import { sunBuddy, hydrogen, helium } from './sun.mjs';

const INK = '#0a0828';
const PV = [540, 700], ARM = 330, DROP = 260;

function scale(ctx, t, ang, left, right) {
  const [px, py] = PV;
  const end = (k) => [px + k * ARM * Math.cos(ang), py + k * ARM * Math.sin(ang)];
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // post + base
  ctx.fillStyle = '#c9b6ff'; ctx.strokeStyle = INK; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.roundRect(px - 22, py, 44, 480, 12); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(px - 170, py + 470, 340, 50, 25); ctx.fill(); ctx.stroke();
  // beam
  const [lx, ly] = end(-1), [rx, ry] = end(1);
  for (const [col, w] of [[INK, 30], [C.gold, 16]]) {
    ctx.strokeStyle = col; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ry); ctx.stroke();
  }
  ctx.fillStyle = C.gold; ctx.strokeStyle = INK; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(px, py, 26, 0, TAU); ctx.fill(); ctx.stroke();
  // pointer needle
  ctx.save(); ctx.translate(px, py); ctx.rotate(ang);
  ctx.fillStyle = C.no; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.lineTo(0, -90); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  // pans
  [[lx, ly, left], [rx, ry, right]].forEach(([ex, ey, content]) => {
    const cy = ey + DROP;
    ctx.strokeStyle = INK; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 120, cy); ctx.moveTo(ex, ey); ctx.lineTo(ex + 120, cy); ctx.stroke();
    content(ex, cy);
    ctx.fillStyle = '#ffb04a'; ctx.strokeStyle = INK; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.ellipse(ex, cy, 150, 34, 0, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
  });
  ctx.restore();
  return [[lx, ly + DROP], [rx, ry + DROP]];
}

function massScene(ctx, t) {
  const t0 = S('mass'), tHe = at('mass', '氦核'), tLight = at('mass', '轻了'), tE = S('energy'), tMc = at('energy', '能量');
  title(ctx, t, t0, '称一称！', '4 个氢核  vs  1 个氦核', { size: 84, t1: tE - 0.2 });
  title(ctx, t, tE, '少掉的质量 → 能量', null, { size: 76, color: C.energy });
  const sp = pop(t, t0 - 0.1, 0.6);
  const tilt = easeOut(prog(t, tLight - 0.2, tLight + 0.6));
  const wob = Math.sin((t - tLight) * 14) * 0.03 * Math.exp(-Math.max(0, t - tLight) * 3) * (t > tLight ? 1 : 0);
  const ang = -0.09 * tilt + wob;
  let pans;
  around(ctx, PV[0], 900, sp, sp, () => {
    pans = scale(ctx, t, ang, (x, y) => {
      [[-60, -40], [60, -40], [-30, -105], [30, -105]].forEach(([dx, dy], i) =>
        hydrogen(ctx, t, x + dx, y + dy + Math.sin(t * 3 + i) * 3, 38, { a: pop(t, t0 + 0.2 + i * 0.1, 0.4) }));
    }, (x, y) => {
      const p = pop(t, tHe - 0.1, 0.45);
      if (p > 0) helium(ctx, t, x, y - 70, 52 * p);
    });
  });
  // "a tiny bit lighter" callout
  const cp = pop(t, tLight + 0.2, 0.45) * (1 - prog(t, tMc - 0.2, tMc));
  if (pans && cp > 0) {
    const [rx, ry] = pans[1];
    around(ctx, rx - 40, ry + 140, cp, cp, () => tag(ctx, rx - 40, ry + 140, '轻了约 0.7%', null, { color: C.mint, size: 46 }));
  }
  // the missing bit floats up from the helium pan and bursts into energy
  if (pans) {
    const [rx, ry] = pans[1];
    const f = easeIO(prog(t, tE - 0.1, tMc));
    if (f > 0 && f < 1) {
      const x = lerp(rx, 540, f), y = lerp(ry - 90, 560, f) - Math.sin(f * Math.PI) * 120;
      glow(ctx, x, y, 0, 60, 'rgba(255,245,150,0.8)');
      ctx.fillStyle = C.energy; ctx.beginPath(); ctx.arc(x, y, 14, 0, TAU); ctx.fill();
    }
    const bp = pop(t, tMc, 0.5);
    if (bp > 0) {
      around(ctx, 540, 560, bp, bp, () => {
        glow(ctx, 540, 560, 0, 260, 'rgba(255,245,150,0.6)');
        txt(ctx, 'E = mc²', 540, 560, { size: 110, font: 'RoundB, YuanB', color: C.energy, stroke: INK, sw: 14 });
      });
      burst(ctx, t, tMc, 540, 560, { n: 16, r: 420, colors: [C.energy, C.gold, C.white] });
    }
  }
}

// ---------- 4 million tonnes per second ----------
function weight(ctx, x, y, s, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#5b5f8f'; ctx.strokeStyle = INK; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(-42, 34); ctx.lineTo(42, 34); ctx.lineTo(28, -26); ctx.lineTo(-28, -26); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -34, 14, 0, TAU); ctx.stroke();
  txt(ctx, '吨', 0, 6, { size: 34, color: '#fff' });
  ctx.restore();
}

function stopwatch(ctx, t, x, y, p) {
  ctx.save();
  ctx.fillStyle = '#fff'; ctx.strokeStyle = INK; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.roundRect(x - 18, y - 120, 36, 30, 6); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, 96, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,77,109,0.3)';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, 84, -Math.PI / 2, -Math.PI / 2 + TAU * p); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.no; ctx.lineWidth = 8; ctx.lineCap = 'round';
  const a = -Math.PI / 2 + TAU * p;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 74, y + Math.sin(a) * 74); ctx.stroke();
  txt(ctx, '1 秒', x, y + 46, { size: 34, color: INK });
  ctx.restore();
}

const SUNP = [560, 860];
function tonsScene(ctx, t) {
  const t0 = S('tons'), tSec = at('tons', '每秒钟'), tNum = at('tons', '四百万吨'), tEn = at('tons', '能量');
  title(ctx, t, t0, '太阳的“胃口”有多大？', null, { size: 74 });
  sunBuddy(ctx, t, SUNP[0], SUNP[1], 230, { mood: t > tNum ? 'starry' : 'happy', look: -0.4, talk: 0 });
  const wp = pop(t, tSec - 0.1, 0.45);
  around(ctx, 190, 600, wp, wp, () => stopwatch(ctx, t, 190, 600, prog(t, tSec, E('tons'))));
  // weights pour into the Sun and flash into light
  for (let i = 0; i < 16; i++) {
    const t1 = tNum - 0.3 + i * 0.16, p = prog(t, t1, t1 + 0.7);
    if (p <= 0 || p >= 1) continue;
    const sx = 900 + rnd(i) * 140, sy = 480 + rnd(i + 5) * 140;
    const x = lerp(sx, SUNP[0] + 80, easeIO(p)), y = lerp(sy, SUNP[1] - 60, easeIO(p)) - Math.sin(p * Math.PI) * 120;
    weight(ctx, x, y, 0.8 * (1 - p * 0.6), 1 - prog(p, 0.85, 1));
    if (p > 0.85) glow(ctx, SUNP[0] + 80, SUNP[1] - 60, 0, 120, `rgba(255,250,200,${(1 - p) * 4})`);
  }
  // rolling counter
  const np = pop(t, tNum - 0.1, 0.5);
  if (np > 0) {
    const n = Math.round(400 * easeOut(prog(t, tNum - 0.1, tNum + 1.0)));
    around(ctx, W / 2, 1230, np, np, () => {
      card(ctx, 140, 1140, 800, 180, { fill: 'rgba(8,10,36,0.9)', edge: C.gold, ew: 6, drop: 0 });
      txt(ctx, '约', 230, 1230, { size: 60, color: C.white });
      txt(ctx, `${n}`, 440, 1230, { size: 130, font: 'RoundB, YuanB', color: C.gold, stroke: INK, sw: 12 });
      txt(ctx, '万吨 / 秒', 720, 1235, { size: 68, color: C.white });
    });
  }
  const ep = pop(t, tEn - 0.1, 0.4);
  around(ctx, 880, 1050, ep, ep, () => tag(ctx, 880, 1050, '→ 能量', null, { color: C.energy, size: 50 }), -0.06);
}

export const scenes = [
  { id: 'mass', from: S('mass') - 0.25, to: S('tons') - 0.25, draw: massScene },
  { id: 'tons', from: S('tons') - 0.25, to: S('out') - 0.3, draw: tonsScene },
];

export const events = [
  ...[0, 1, 2, 3].map((i) => ({ type: 'pop', t: S('mass') + 0.2 + i * 0.1, f: 700 + i * 120, amp: 0.5 })),
  { type: 'pop', t: at('mass', '氦核') - 0.1, f: 500 },
  { type: 'boing', t: at('mass', '轻了') - 0.1 },
  { type: 'ding', t: at('mass', '轻了') + 0.3, n: 91 },
  { type: 'whoosh', t: S('energy') - 0.1, d: 0.8, from: 600, to: 3000 },
  { type: 'tada', t: at('energy', '能量') }, { type: 'sparkle', t: at('energy', '能量') + 0.1 },
  { type: 'tick', t: at('tons', '每秒钟'), n: 84 },
  ...[...Array(16)].map((_, i) => ({ type: 'pop', t: at('tons', '四百万吨') + 0.4 + i * 0.16, f: 400 + i * 40, amp: 0.35 })),
  ...[...Array(10)].map((_, i) => ({ type: 'tick', t: at('tons', '四百万吨') - 0.1 + i * 0.1, n: 70 + i * 2 })),
  { type: 'ding', t: at('tons', '能量'), n: 88 },
];
