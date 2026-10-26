// Scenes A: hook (only Earth lights up in a solar-system scan) → the "宜居星球面试会" stage with four contestants.
import { C, NUM, SANS, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, card, around, burst, talkLevel } from './lib.mjs';
import { planet, sun, glow } from './bodies.mjs';
import { podium, bubble, checkBadge } from './props.mjs';

// ---------- hook: eight planets in a row; a scan finds life only on Earth ----------
const ROW = [['水星', 250, 22], ['金星', 335, 34], ['地球', 440, 36], ['火星', 535, 26], ['木星', 660, 66], ['土星', 810, 54], ['天王星', 925, 40], ['海王星', 1010, 38]];
const ROW_Y = 860;

function hook(ctx, t) {
  const tIn = 0.3, tScan = at('hook', '人类'), tLife = at('hook', '生命');
  txt(ctx, '太阳系 · 生命搜寻', 540, 470, { size: 64, color: C.cream, glow: 'rgba(76,201,240,0.6)' });
  sun(ctx, t, -70, ROW_Y, 190);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 3;
  for (const [, x] of ROW) { ctx.beginPath(); ctx.arc(-70, ROW_Y, x + 70, -0.5, 0.5); ctx.stroke(); }
  // scanning beam sweeps left → right, reaching Earth just as “生命” is spoken
  const sx = lerp(150, 1120, prog(t, tScan, tLife + 0.9));
  if (t > tScan && t < tLife + 1.2) {
    const g = ctx.createLinearGradient(sx - 120, 0, sx, 0);
    g.addColorStop(0, 'rgba(61,220,151,0)'); g.addColorStop(1, 'rgba(61,220,151,0.35)');
    ctx.fillStyle = g; ctx.fillRect(sx - 120, 620, 120, 480);
    ctx.fillStyle = 'rgba(160,255,210,0.9)'; ctx.fillRect(sx - 3, 620, 6, 480);
  }
  ROW.forEach(([name, x, r], i) => {
    const p = pop(t, tIn + i * 0.1, 0.4);
    const isEarth = name === '地球';
    const y = ROW_Y + Math.sin(t * 2 + i) * 6;
    around(ctx, x, y, p, p, () => {
      if (isEarth && t > tLife) glow(ctx, x, y, r, r * 3.2, `rgba(61,220,151,${0.5 * easeOut(prog(t, tLife, tLife + 0.4))})`);
      planet(ctx, t, name, x, y, r, { ringRot: -0.3, light: Math.PI });
      txt(ctx, name, x, y + (i % 2 ? -1 : 1) * (r + 40), { size: 32, font: SANS, color: 'rgba(255,255,255,0.75)' });
    });
    // scanned & nothing found → small grey “?”; Earth gets the green tick
    if (sx > x && !isEarth) txt(ctx, '?', x + r * 0.9, y - r * 0.9, { size: 40, font: NUM, color: 'rgba(200,205,230,0.7)' });
  });
  const lp = pop(t, tLife, 0.45);
  around(ctx, 440, 1160, lp, lp, () => {
    card(ctx, 240, 1105, 400, 110, { fill: 'rgba(10,30,30,0.92)', edge: C.ok, ew: 6, drop: 0, r: 55 });
    checkBadge(ctx, 300, 1160, 36, C.ok);
    txt(ctx, '发现生命', 470, 1163, { size: 58, color: C.ok });
    ctx.strokeStyle = C.ok; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(440, 1105); ctx.lineTo(440, ROW_Y + 50); ctx.stroke();
  });
  burst(ctx, t, tLife, 440, ROW_Y, { n: 10, r: 160 });
}

// ---------- stage: banner, spotlights and four contestants on podiums ----------
export const SEATS = [['水星', 175, 74], ['金星', 410, 98], ['地球', 665, 102], ['火星', 905, 80]];
export const POD_Y = 1190;
const TAG = { 水星: C.mercury, 金星: C.amber, 地球: C.sky, 火星: '#ff8a5c' };

export function banner(ctx, t, a = 1, y = 340) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.fillStyle = '#c0283f';
  ctx.beginPath();
  ctx.moveTo(110, y - 70); ctx.lineTo(970, y - 70); ctx.lineTo(1000, y); ctx.lineTo(970, y + 70); ctx.lineTo(110, y + 70); ctx.lineTo(80, y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.gold; ctx.lineWidth = 6; ctx.stroke();
  txt(ctx, '宜居星球面试会', 540, y + 4, { size: 92, color: C.gold, stroke: '#5a0d1c', sw: 10 });
  for (let i = 0; i < 14; i++) {
    const bx = 120 + i * 64, on = Math.sin(t * 6 + i * 1.3) > 0;
    ctx.fillStyle = on ? '#fff3b0' : 'rgba(255,243,176,0.3)';
    ctx.beginPath(); ctx.arc(bx, y - 92, 9, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function spotlights(ctx, t, a = 1) {
  if (a <= 0) return;
  for (const [x0, ph] of [[60, 0], [1020, 1.7]]) {
    const ang = Math.PI / 2 + Math.sin(t * 0.8 + ph) * 0.35;
    const x1 = x0 + Math.cos(ang) * 1300, y1 = 300 + Math.sin(ang) * 1300;
    ctx.save();
    ctx.globalAlpha = 0.16 * a;
    const g = ctx.createLinearGradient(x0, 300, x1, y1);
    g.addColorStop(0, '#fff6d0'); g.addColorStop(1, 'rgba(255,246,208,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x0, 300);
    ctx.lineTo(x1 + Math.cos(ang + Math.PI / 2) * 200, y1 + Math.sin(ang + Math.PI / 2) * 200);
    ctx.lineTo(x1 - Math.cos(ang + Math.PI / 2) * 200, y1 - Math.sin(ang + Math.PI / 2) * 200);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}

// One contestant on its podium; o.lift raises/scales it (e.g. when it steps forward to speak).
export function contestant(ctx, t, name, o = {}) {
  const [, x, r] = SEATS.find((s) => s[0] === name);
  const { p = 1, mood = 'happy', talk = 0, lift = 0, lit = 0, tint } = o;
  around(ctx, x, POD_Y + 80, p, p, () => {
    podium(ctx, x, POD_Y, 210, name, TAG[name], { lit });
    const y = POD_Y - r - 10 - lift * 40 + Math.sin(t * 2.4 + x) * 5;
    around(ctx, x, y, 1 + 0.18 * lift, 1, () => {
      planet(ctx, t, name, x, y, r, { face: true, mood, talk, light: Math.PI * 1.1, tint });
    });
  });
}

function stage(ctx, t) {
  const t0 = S('open') - 0.2, tTitle = at('open', '宜居'), tE = S('e-claim');
  const a = fadeIn(t, t0, 0.4);
  spotlights(ctx, t, a);
  const bp = pop(t, tTitle - 0.1, 0.5);
  around(ctx, 540, 340, bp, bp, () => banner(ctx, t));
  // stage floor
  ctx.fillStyle = 'rgba(40,46,110,0.7)';
  ctx.beginPath(); ctx.ellipse(540, POD_Y + 200, 560, 80, 0, 0, Math.PI * 2); ctx.fill();
  const talk = talkLevel(t, ['e-claim']);
  SEATS.forEach(([name], i) => {
    const p = pop(t, at('open', '凭什么') + i * 0.15, 0.45);
    const isE = name === '地球';
    const lift = isE ? easeOut(prog(t, tE - 0.2, tE + 0.2)) : 0;
    const mood = isE ? (talk ? 'happy' : 'proud') : t > tE + 0.6 ? 'wow' : 'happy';
    contestant(ctx, t, name, { p, mood, talk: isE ? talk : 0, lift, lit: lift });
  });
  // Earth's bubble with a little Sun–Earth "just right" ruler
  const q = pop(t, at('e-claim', '不远') - 0.1, 0.4);
  bubble(ctx, 600, 880, '距离刚刚好~', { side: -1, size: 54, sc: q, a: q });
  const rp = easeIO(prog(t, at('e-claim', '不远'), at('e-claim', '刚刚好')));
  if (rp > 0) {
    ctx.save(); ctx.globalAlpha = rp;
    sun(ctx, t, 930, 600, 54, { rays: false });
    ctx.strokeStyle = C.gold; ctx.lineWidth = 5; ctx.setLineDash([14, 12]);
    ctx.beginPath(); ctx.moveTo(890, 660); ctx.lineTo(lerp(890, 730, rp), lerp(660, 900, rp)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
}

export const scenes = [
  { from: 0, to: S('open') - 0.2, draw: hook },
  { from: S('open') - 0.2, to: S('quiz') - 0.2, draw: stage },
];

export const events = [
  ...ROW.map((_, i) => ({ t: 0.3 + i * 0.1, type: 'pop', f: 600 + i * 60 })),
  { t: at('hook', '人类'), type: 'whoosh', d: 1.2, from: 300, to: 1800 },
  { t: at('hook', '生命'), type: 'sparkle' },
  { t: at('open', '宜居') - 0.1, type: 'tada' },
  ...SEATS.map((_, i) => ({ t: at('open', '凭什么') + i * 0.15, type: 'pop', f: 520 + i * 90 })),
  { t: S('e-claim') - 0.2, type: 'boing' },
  { t: at('e-claim', '不远') - 0.1, type: 'pop' },
];
