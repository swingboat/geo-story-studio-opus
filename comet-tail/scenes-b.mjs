// Scenes 3–4: heating and sublimation (ice → gas, skipping liquid), jets carrying dust, then the coma ("I grew hair!").
import { W, C, SANS, NUM, S, at, prog, lerp, clamp, easeOut, pop, fadeIn, txt, around, arrow, burst, stamp, card, rand, talkLevel } from './lib.mjs';
import { sun, nucleus, coma, label } from './comet.mjs';

const TAU = Math.PI * 2;

// gas (hollow rings) and dust (dots) puffing off the sunlit side
function outgas(ctx, t, x, y, r, t0, o = {}) {
  const { dir = Math.PI, spread = 1.3, n = 30, dust = 0, reach = 320 } = o;
  if (t < t0) return;
  const k = clamp((t - t0) / 0.6);
  for (let i = 0; i < n; i++) {
    const ph = (rand(i + 40) + (t - t0) * (0.35 + rand(i + 50) * 0.3)) % 1;
    const a = dir + (rand(i + 60) - 0.5) * spread;
    const d = r * 0.9 + reach * ph;
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
    const fade = Math.sin(Math.PI * ph) * k;
    const isDust = i < n * dust;
    if (isDust) {
      ctx.fillStyle = `rgba(255,200,120,${fade})`;
      ctx.beginPath(); ctx.arc(px, py, 6, 0, TAU); ctx.fill();
    } else {
      ctx.strokeStyle = `rgba(210,245,255,${0.9 * fade})`; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(px, py, 10 + 6 * ph, 0, TAU); ctx.stroke();
    }
  }
}

function heatWaves(ctx, t, x0, y0, x1, y1, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = 'rgba(255,170,60,0.85)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  for (let k = -1; k <= 1; k++) {
    ctx.beginPath();
    for (let i = 0; i <= 30; i++) {
      const s = i / 30, ph = (t * 1.6) % 1;
      const x = lerp(x0, x1, s), y = lerp(y0, y1, s) + k * 90 + Math.sin(s * 18 - t * 10) * 12;
      if (Math.abs(((s - ph) % 1 + 1) % 1) < 0.45) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- scene 3: getting hot → sublimation ----------
function heat(ctx, t) {
  const t0 = S('hot');
  const sx = 120, sy = 760;
  sun(ctx, t, sx, sy, 170, { glow: 1.3 });
  const cx = 740, cy = 780, r = 160;
  heatWaves(ctx, t, sx + 210, sy, cx - r - 40, cy, fadeIn(t, t0 + 0.2, 0.5));
  // sunlit side glows warm
  const warm = fadeIn(t, t0 + 0.3, 1.2);
  const g = ctx.createRadialGradient(cx - r * 0.8, cy, 10, cx - r * 0.8, cy, r * 1.4);
  g.addColorStop(0, `rgba(255,140,60,${0.55 * warm})`); g.addColorStop(1, 'rgba(255,140,60,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx - r * 0.8, cy, r * 1.4, 0, TAU); ctx.fill();
  const tGas = at('subl', '直接变成气体');
  outgas(ctx, t, cx, cy, r, tGas, { dir: Math.PI * 0.85, spread: 1.6, n: 34, dust: 0, reach: 260 });
  // jets carry dust off as well
  const tJet = S('jet');
  if (t >= tJet) {
    for (const a of [Math.PI * 0.72, Math.PI * 1.02, Math.PI * 1.25]) {
      const j = ctx.createLinearGradient(cx, cy, cx + Math.cos(a) * 380, cy + Math.sin(a) * 380);
      j.addColorStop(0, `rgba(220,245,255,${0.6 * fadeIn(t, tJet, 0.4)})`); j.addColorStop(1, 'rgba(220,245,255,0)');
      ctx.fillStyle = j;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a - 0.08) * r * 0.9, cy + Math.sin(a - 0.08) * r * 0.9);
      ctx.lineTo(cx + Math.cos(a - 0.22) * 380, cy + Math.sin(a - 0.22) * 380);
      ctx.lineTo(cx + Math.cos(a + 0.22) * 380, cy + Math.sin(a + 0.22) * 380);
      ctx.lineTo(cx + Math.cos(a + 0.08) * r * 0.9, cy + Math.sin(a + 0.08) * r * 0.9);
      ctx.fill();
    }
    outgas(ctx, t, cx, cy, r, tJet, { dir: Math.PI, spread: 1.4, n: 40, dust: 0.55, reach: 380 });
  }
  const jig = t < S('subl') ? Math.sin(t * 40) * 5 : 0;
  nucleus(ctx, t, cx + jig, cy, r, { mood: 'hot', talk: talkLevel(t, ['hot']), sweat: fadeIn(t, t0 + 0.4, 0.4), look: Math.PI });
  if (t >= tJet) label(ctx, '气体 + 尘埃', 470, 470, C.ice, 50);
  // phase card: 固态冰 → (液态 ✗) → 气体 = 升华
  const pc = pop(t, at('subl', '冰'), 0.45);
  around(ctx, W / 2, 1270, pc, pc, () => {
    card(ctx, 70, 1180, 940, 180, { fill: 'rgba(10,12,48,0.92)', edge: C.ice, ew: 5, r: 34, drop: 0 });
    txt(ctx, '固态冰', 200, 1270, { size: 54, color: C.ice });
    const liq = fadeIn(t, at('subl', '液态'), 0.3);
    ctx.save(); ctx.globalAlpha *= 0.35 + 0.65 * liq;
    txt(ctx, '液态', 540, 1270, { size: 46, color: 'rgba(160,200,255,0.8)' });
    ctx.restore();
    if (t > at('subl', '液态') + 0.25) {
      const xs = easeOut(prog(t, at('subl', '液态') + 0.25, at('subl', '液态') + 0.55));
      ctx.strokeStyle = C.no; ctx.lineWidth = 10; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(480, 1220); ctx.lineTo(lerp(480, 600, xs), lerp(1220, 1320, xs)); ctx.stroke();
      if (xs >= 1) { ctx.beginPath(); ctx.moveTo(600, 1220); ctx.lineTo(480, 1320); ctx.stroke(); }
    }
    const pg = prog(t, tGas - 0.1, tGas + 0.5);
    ctx.save(); ctx.setLineDash([2, 0]);
    // curved hop over the crossed-out liquid
    ctx.strokeStyle = C.gold; ctx.lineWidth = 8;
    if (pg > 0) {
      ctx.beginPath();
      for (let i = 0; i <= 20 * pg; i++) {
        const s = i / 20, x = lerp(320, 770, s), y = 1225 - Math.sin(Math.PI * s) * 70;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
    if (pg >= 1) arrow(ctx, 740, 1205, 790, 1235, { color: C.gold, w: 8, head: 30 });
    const pg2 = pop(t, tGas + 0.2, 0.35);
    around(ctx, 880, 1270, pg2, pg2, () => txt(ctx, '气体', 880, 1270, { size: 54, color: '#ffffff' }));
  });
  stamp(ctx, t, at('subl', '升华'), 540, 1050, '升华', { color: C.gold, size: 90, rot: -0.08 });
}

// ---------- scene 4: the coma forms — "I grew hair!" ----------
function hair(ctx, x, y, r, t, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) {
    const ang = -Math.PI * 0.95 + (i / 15) * Math.PI * 0.9;
    const L = r * (1.4 + 0.5 * rand(i + 5));
    ctx.strokeStyle = i % 2 ? 'rgba(160,230,255,0.85)' : 'rgba(255,225,160,0.85)';
    ctx.lineWidth = 9;
    ctx.beginPath();
    for (let k = 0; k <= 12; k++) {
      const s = k / 12, d = r * 0.85 + L * s;
      const wob = Math.sin(s * 6 + t * 5 + i) * 18 * s;
      const px = x + Math.cos(ang) * d + Math.cos(ang + Math.PI / 2) * wob;
      const py = y + Math.sin(ang) * d + Math.sin(ang + Math.PI / 2) * wob;
      k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function comaScene(ctx, t) {
  const t0 = S('coma');
  const cx = 540, cy = 830, r = 120;
  const grow = easeOut(prog(t, at('coma', '包围') - 0.2, at('coma', '包围') + 1.2));
  coma(ctx, t, cx, cy, lerp(r * 1.1, 430, grow), 0.3 + 0.7 * grow);
  const ph = pop(t, at('hair', '头发'), 0.5);
  hair(ctx, cx, cy, r, t, ph * (1 - prog(t, S('hands') - 0.5, S('hands'))));
  nucleus(ctx, t, cx, cy, r, { mood: t >= S('hair') ? 'wow' : 'happy', talk: talkLevel(t, ['hair']) });
  burst(ctx, t, at('hair', '头发'), cx, cy - 120, { n: 12, r: 300, size: 26 });
  const pl = pop(t, at('coma', '彗发'), 0.45);
  around(ctx, 830, 470, pl, pl, () => {
    label(ctx, '彗发', 830, 470, C.ion, 80);
    arrow(ctx, 780, 520, 700, 640, { color: C.ion, w: 8, head: 30 });
  });
  label(ctx, '彗核', cx, cy + r + 70, C.white, 44);
  // legend: hollow ring = gas, dot = dust
  const pg = fadeIn(t, at('coma', '气体和尘埃'), 0.4);
  if (pg > 0) {
    ctx.save(); ctx.globalAlpha *= pg;
    card(ctx, 190, 1200, 700, 120, { fill: 'rgba(10,12,48,0.9)', edge: 'rgba(255,255,255,0.4)', ew: 4, r: 30, drop: 0 });
    ctx.strokeStyle = C.ice; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(280, 1260, 18, 0, TAU); ctx.stroke();
    txt(ctx, '气体', 380, 1262, { size: 46, color: C.ice });
    ctx.fillStyle = C.amber;
    ctx.beginPath(); ctx.arc(560, 1260, 12, 0, TAU); ctx.fill();
    txt(ctx, '尘埃', 660, 1262, { size: 46, color: C.amber });
    ctx.restore();
  }
}

export const scenes = [
  { from: S('hot') - 0.3, to: S('coma') - 0.3, draw: heat },
  { from: S('coma') - 0.3, to: S('hands') - 0.3, draw: comaScene },
];

export const events = [
  { t: S('hot') - 0.1, type: 'whoosh', d: 0.6, from: 400, to: 1600 },
  { t: S('hot') + 0.4, type: 'sizzle', d: 1.6 },
  { t: at('subl', '冰'), type: 'pop', f: 700 },
  { t: at('subl', '液态') + 0.25, type: 'buzz' },
  { t: at('subl', '直接变成气体'), type: 'whoosh', d: 0.6, from: 800, to: 3000 },
  { t: at('subl', '升华'), type: 'stamp', shake: 14 },
  { t: S('jet'), type: 'roar', d: 2.4 },
  { t: at('coma', '包围'), type: 'sparkle' },
  { t: at('coma', '彗发'), type: 'pop', f: 900 },
  { t: at('hair', '头发'), type: 'boing' },
  { t: at('hair', '头发') + 0.1, type: 'sparkle' },
];
