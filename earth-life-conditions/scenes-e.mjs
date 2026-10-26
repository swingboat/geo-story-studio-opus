// Scenes E: level 3 liquid water (Mars: mostly ice; Earth: liquid for long periods, ocean ≈71%) → external conditions (stable sunlight, safe orbits).
import { C, NUM, SANS, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, card, around, arrow, burst, talkLevel, rand } from './lib.mjs';
import { planet, sun, glow } from './bodies.mjs';
import { bubble, snowflake, chip, levelTitle, levelPass, condIcon } from './props.mjs';

const TAU = Math.PI * 2;

function waves(ctx, t, x, y, w, h, a = 1) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 24); ctx.clip();
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#4ea8ff'); g.addColorStop(1, '#174a9c');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  for (let k = 0; k < 3; k++) {
    ctx.fillStyle = `rgba(255,255,255,${0.18 - k * 0.04})`;
    ctx.beginPath(); ctx.moveTo(x, y + 30 + k * 40);
    for (let i = 0; i <= 40; i++) ctx.lineTo(x + (i / 40) * w, y + 30 + k * 40 + Math.sin(i * 0.6 + t * (2 + k) + k) * 10);
    ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// ---------- level 3: liquid water ----------
function water(ctx, t) {
  const t0 = S('water'), tM = S('mars-ice'), tIce = at('mars-ice', '冻成'), tW = S('water-e'), tLiq = at('water-e', '液态'), tPct = at('water-e', '71');
  levelTitle(ctx, '三', '液态水', C.water, pop(t, t0 - 0.1, 0.4) * (1 - prog(t, tW - 0.3, tW)), 330);
  // part A: Mars with frozen water
  const pa = 1 - prog(t, tW - 0.3, tW + 0.1);
  if (pa > 0) {
    ctx.save(); ctx.globalAlpha *= pa;
    const mp = pop(t, tM - 0.3, 0.45);
    around(ctx, 340, 800, mp, mp, () => {
      const cap = easeOut(prog(t, tIce - 0.6, tIce + 0.4));
      planet(ctx, t, '火星', 340, 800, 190, { face: true, mood: 'cold', talk: talkLevel(t, ['mars-ice']), light: Math.PI, tint: 'rgba(120,180,255,0.18)' });
      ctx.save();
      ctx.beginPath(); ctx.arc(340, 800, 190, 0, TAU); ctx.clip();
      ctx.fillStyle = '#f4fbff';
      ctx.beginPath(); ctx.ellipse(340, 610, 150 * cap + 40, 70 * cap + 20, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(340, 990, 120 * cap + 30, 55 * cap + 15, 0, 0, TAU); ctx.fill();
      ctx.restore();
      for (let i = 0; i < 6; i++) snowflake(ctx, 160 + rand(i) * 360, 560 + ((t * 45 + rand(i + 3) * 500) % 500), 14 + rand(i + 1) * 10, t + i);
    });
    const ip = pop(t, tIce - 0.1, 0.4);
    around(ctx, 800, 760, ip, ip, () => {
      ctx.save();
      ctx.translate(800, 760); ctx.rotate(0.12 + Math.sin(t * 2) * 0.05);
      ctx.fillStyle = 'rgba(200,235,255,0.9)'; ctx.strokeStyle = C.white; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.roundRect(-110, -110, 220, 220, 34); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.roundRect(-80, -85, 70, 22, 11); ctx.fill();
      ctx.restore();
      txt(ctx, '冰', 800, 768, { size: 110, color: '#2a6fb8' });
    });
    const bp = pop(t, tIce + 0.2, 0.4);
    around(ctx, 800, 1010, bp, bp, () => {
      card(ctx, 590, 965, 420, 90, { fill: 'rgba(10,12,44,0.92)', edge: C.ice, ew: 5, drop: 0, r: 45 });
      txt(ctx, '地表难存液态水', 800, 1012, { size: 46, color: C.ice });
    });
    ctx.restore();
  }
  // part B: Earth keeps water liquid; ocean ≈ 71 %
  const pb = fadeIn(t, tW - 0.1, 0.4);
  if (pb <= 0) return;
  ctx.save(); ctx.globalAlpha *= pb;
  // water-state bar: ice | liquid | vapour, Earth's ~15 ℃ sits in the liquid band
  const BX = 120, BW = 840, BY = 330, x0 = BX + BW * 0.28, x1 = BX + BW * 0.72;
  const segs = [[BX, x0, '#cfeeff', '冰'], [x0, x1, '#4ea8ff', '液态水'], [x1, BX + BW, '#e8e8f0', '水汽']];
  segs.forEach(([a, b, col, lab], i) => {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.roundRect(a, BY - 50, b - a, 100, i === 0 ? [50, 0, 0, 50] : i === 2 ? [0, 50, 50, 0] : 0); ctx.fill();
    txt(ctx, lab, (a + b) / 2, BY + 3, { size: 48, color: i === 1 ? C.white : C.ink });
  });
  txt(ctx, '0℃', x0, BY + 85, { size: 38, font: NUM, color: 'rgba(255,255,255,0.85)' });
  txt(ctx, '100℃', x1, BY + 85, { size: 38, font: NUM, color: 'rgba(255,255,255,0.85)' });
  const mk = pop(t, tLiq - 0.2, 0.4), mx = x0 + (x1 - x0) * 0.15;
  around(ctx, mx, BY - 70, mk, mk, () => {
    ctx.fillStyle = C.gold;
    ctx.beginPath(); ctx.moveTo(mx, BY - 50); ctx.lineTo(mx - 18, BY - 82); ctx.lineTo(mx + 18, BY - 82); ctx.closePath(); ctx.fill();
    card(ctx, mx - 100, BY - 150, 200, 66, { fill: C.gold, edge: C.white, ew: 4, drop: 0, r: 33 });
    txt(ctx, '地球', mx, BY - 116, { size: 40, color: C.ink });
  });
  // 10 × 10 tile grid: 71 ocean tiles fill in
  const n = Math.round(71 * easeOut(prog(t, tPct - 0.9, tPct + 0.3)));
  const GX = 110, GY = 560, CELL = 52;
  for (let i = 0; i < 100; i++) {
    const cx = GX + (i % 10) * CELL, cy = GY + Math.floor(i / 10) * CELL;
    ctx.fillStyle = i < n ? '#3d8ff0' : i >= 71 ? 'rgba(76,195,90,0.85)' : 'rgba(255,255,255,0.12)';
    ctx.beginPath(); ctx.roundRect(cx + 3, cy + 3, CELL - 6, CELL - 6, 8); ctx.fill();
  }
  const pp = pop(t, tPct, 0.45);
  around(ctx, 830, 760, pp, pp, () => {
    txt(ctx, '71%', 830, 740, { size: 150, font: NUM, color: C.water, stroke: C.white, sw: 8 });
    txt(ctx, '海洋覆盖地表', 830, 850, { size: 48, color: C.white });
  });
  waves(ctx, t, 110, 1110, 860, 140, fadeIn(t, tW, 0.6));
  planet(ctx, t, '地球', 830, 1010, 90, { face: true, mood: 'happy', light: -0.8 });
  levelPass(ctx, t, '三', '液态水', C.water, pop(t, tPct + 0.6, 0.4), tPct + 1.0, 1340);
  burst(ctx, t, tPct + 1.0, 540, 1340, { n: 12, r: 300 });
  ctx.restore();
}

// ---------- external conditions: a steady Sun and planets in their own lanes ----------
const LANES = [['水星', 90, 3.2], ['金星', 140, 2.3], ['地球', 190, 1.9], ['火星', 245, 1.5], ['木星', 320, 0.8], ['土星', 395, 0.6]];
function outer(ctx, t) {
  const t0 = S('outer'), tSun = at('outer', '太阳稳定'), tL = at('outer', '光照稳定'), tLane = at('outer', '各行其道'), tSafe = at('outer', '安全');
  const hp = pop(t, t0 - 0.1, 0.4);
  around(ctx, 540, 330, hp, hp, () => {
    card(ctx, 330, 280, 420, 100, { fill: C.cream, edge: C.gold, ew: 6, drop: 8, r: 50 });
    txt(ctx, '外部条件', 540, 332, { size: 64, color: C.ink });
  });
  // steady sunlight: the Sun with a flat brightness trace
  const sp = pop(t, tSun - 0.2, 0.45);
  around(ctx, 260, 600, sp, sp, () => sun(ctx, t, 260, 600, 110, { face: true, mood: 'proud' }));
  const lp = fadeIn(t, tSun, 0.4);
  if (lp > 0) {
    ctx.save(); ctx.globalAlpha *= lp;
    card(ctx, 450, 470, 560, 260, { fill: 'rgba(10,14,50,0.8)', edge: 'rgba(255,255,255,0.25)', ew: 3, drop: 0, r: 26 });
    txt(ctx, '太阳辐射', 730, 515, { size: 38, font: SANS, color: 'rgba(255,255,255,0.75)' });
    const w = 480 * easeOut(prog(t, tSun, tL + 0.4));
    ctx.strokeStyle = C.light; ctx.lineWidth = 8;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 6) ctx.lineTo(490 + x, 595 + Math.sin(x * 0.12 + t * 3) * 3);
    ctx.stroke();
    ctx.restore();
  }
  const cp = pop(t, tL - 0.1, 0.4);
  around(ctx, 730, 680, cp, cp, () => chip(ctx, t, 'light', 730, 680, { size: 44 }));
  // orbits: each planet keeps to its own lane
  const op = fadeIn(t, tLane - 0.4, 0.4);
  if (op > 0) {
    ctx.save(); ctx.globalAlpha *= op;
    const OX = 540, OY = 1085, K = 0.42;
    for (const [, r] of LANES) {
      ctx.strokeStyle = 'rgba(160,200,255,0.35)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(OX, OY, r * 1.25, r * K * 1.25 * 1.1, 0, 0, TAU); ctx.stroke();
    }
    sun(ctx, t, OX, OY, 34, { rays: false });
    LANES.forEach(([name, r, w], i) => {
      const a = t * w * 0.5 + i * 1.3;
      const x = OX + Math.cos(a) * r * 1.25, y = OY + Math.sin(a) * r * K * 1.25 * 1.1;
      planet(ctx, t, name, x, y, name === '木星' || name === '土星' ? 20 : 12, { light: a + Math.PI, ringRot: -0.2 });
    });
    ctx.restore();
  }
  const sf = pop(t, tSafe - 0.1, 0.4);
  around(ctx, 540, 1330, sf, sf, () => chip(ctx, t, 'safe', 540, 1330, { size: 50 }));
  const lt = pop(t, tLane, 0.4);
  around(ctx, 540, 790, lt, lt, () => txt(ctx, '各行其道 · 互不干扰', 540, 790, { size: 56, color: C.safe }));
}

export const scenes = [
  { from: S('water') - 0.2, to: S('outer') - 0.2, draw: water },
  { from: S('outer') - 0.2, to: S('e-proud') - 0.2, draw: outer },
];

export const events = [
  { t: S('water') - 0.1, type: 'note', n: 76 },
  { t: S('mars-ice') - 0.3, type: 'boing' },
  { t: at('mars-ice', '冻成') - 0.1, type: 'ding', n: 93 },
  { t: S('water-e') - 0.1, type: 'whoosh' },
  { t: at('water-e', '液态') - 0.2, type: 'pop' },
  ...[...Array(8)].map((_, i) => ({ t: at('water-e', '71') - 0.9 + i * 0.15, type: 'tick', n: 76 + i })),
  { t: at('water-e', '71'), type: 'pop', f: 900 },
  { t: at('water-e', '71') + 1.0, type: 'tada' },
  { t: S('outer') - 0.1, type: 'pop' },
  { t: at('outer', '太阳稳定') - 0.2, type: 'sparkle' },
  { t: at('outer', '各行其道') - 0.4, type: 'whoosh', d: 0.8 },
  { t: at('outer', '安全') - 0.1, type: 'ding', n: 86 },
];
