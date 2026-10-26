// Scenes 5–6: the Sun's two "hands" (radiation pressure → dust tail, solar wind → ion tail),
// then the orbit view where both tails keep pointing away from the Sun — even ahead of the comet on the way out.
import { W, C, SANS, S, at, prog, lerp, clamp, easeIO, easeOut, pop, fadeIn, txt, around, arrow, burst, stamp, card, rand, talkLevel } from './lib.mjs';
import { sun, nucleus, comet, dustTail, ionTail, coma, label } from './comet.mjs';

const TAU = Math.PI * 2;

// cartoon arm + glove reaching from (x0,y0) to (x1,y1)
function arm(ctx, x0, y0, x1, y1, color, p) {
  if (p <= 0) return;
  const x = lerp(x0, x1, p), y = lerp(y0, y1, p), a = Math.atan2(y1 - y0, x1 - x0);
  ctx.save();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 26; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x) / 2, (y0 + y) / 2 - 60, x, y); ctx.stroke();
  ctx.strokeStyle = color; ctx.lineWidth = 16;
  ctx.stroke();
  ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.ellipse(10, 0, 40, 34, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(4, -38, 14, 20, -0.5, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = color;
  ctx.fillRect(-36, -26, 14, 52);
  ctx.restore();
}

// ---------- scene 5: two hands, two tails ----------
const SX = 170, SY = 560, CX = 470, CY = 820;
const ANTI = Math.atan2(CY - SY, CX - SX);
const VEL = ANTI - Math.PI / 2; // moving up-right, so the dust tail lags down-left

function hands(ctx, t) {
  const tDust = at('dust', '推开'), tIon = at('ion', '拽着');
  // sunlight streaks (radiation pressure) and solar-wind particles
  const lp = fadeIn(t, at('dust', '光压'), 0.4);
  if (lp > 0) {
    ctx.save(); ctx.globalAlpha *= lp * 0.7;
    ctx.strokeStyle = 'rgba(255,220,120,0.8)'; ctx.lineWidth = 4;
    for (let i = 0; i < 8; i++) {
      const a = ANTI + (i - 3.5) * 0.09, ph = (t * 1.2 + i * 0.37) % 1;
      const d0 = 170 + ph * 380;
      ctx.beginPath(); ctx.moveTo(SX + Math.cos(a) * d0, SY + Math.sin(a) * d0); ctx.lineTo(SX + Math.cos(a) * (d0 + 70), SY + Math.sin(a) * (d0 + 70)); ctx.stroke();
    }
    ctx.restore();
  }
  const wp = fadeIn(t, at('ion', '太阳风'), 0.4);
  if (wp > 0) {
    ctx.save(); ctx.globalAlpha *= wp;
    for (let i = 0; i < 40; i++) {
      const a = ANTI + (rand(i + 70) - 0.5) * 1.0, ph = (rand(i + 80) + t * 0.7) % 1, d = 170 + ph * 900;
      ctx.fillStyle = `rgba(120,210,255,${0.9 * (1 - ph)})`;
      ctx.beginPath(); ctx.arc(SX + Math.cos(a) * d, SY + Math.sin(a) * d, 5, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  const dg = easeOut(prog(t, tDust, tDust + 1.6));
  const ig = easeOut(prog(t, tIon, tIon + 1.6));
  // the comet: tails computed from the Sun's position
  const diff = Math.atan2(Math.sin(VEL + Math.PI - ANTI), Math.cos(VEL + Math.PI - ANTI));
  dustTail(ctx, t, CX, CY, ANTI, 640, clamp(diff, -0.9, 0.9) * 0.7, dg);
  ionTail(ctx, t, CX, CY, ANTI, 760, ig);
  coma(ctx, t, CX, CY, 200, 1);
  const cool = t >= S('cool');
  nucleus(ctx, t, CX, CY, 70, { mood: cool ? 'cool' : 'happy', talk: talkLevel(t, ['cool']), look: Math.PI * 1.2 });
  sun(ctx, t, SX, SY, 140, { mood: t > S('dust') && t < S('cool') ? 'puff' : 'happy' });
  // the two arms: ① pushes dust, ② drags the ion tail out
  const p1 = easeOut(prog(t, S('hands') + 0.3, S('hands') + 0.9));
  const p2 = easeOut(prog(t, S('hands') + 0.7, S('hands') + 1.3));
  const push = Math.sin(Math.PI * prog(t, tDust, tDust + 0.8)) * 40;
  arm(ctx, SX + 110, SY + 30, 360 + push * Math.cos(ANTI), 700 + push * Math.sin(ANTI), C.dustDeep, p1);
  const drag = easeIO(prog(t, tIon, tIon + 1.4)) * (1 - easeIO(prog(t, tIon + 1.8, tIon + 2.6)));
  const hx = lerp(390, CX + Math.cos(ANTI) * 520, drag), hy = lerp(900, CY + Math.sin(ANTI) * 520, drag);
  arm(ctx, SX + 40, SY + 120, hx, hy, C.ionDeep, p2);
  // ① / ② name chips
  const c1 = pop(t, at('dust', '光压'), 0.4);
  around(ctx, 700, 520, c1, c1, () => {
    card(ctx, 560, 470, 290, 100, { fill: C.dust, edge: C.ink, ew: 5, r: 50, drop: 8 });
    txt(ctx, '① 光压', 705, 522, { size: 50, color: C.ink });
  });
  const c2 = pop(t, at('ion', '太阳风'), 0.4);
  around(ctx, 230, 1060, c2, c2, () => {
    card(ctx, 60, 1010, 350, 100, { fill: C.ion, edge: C.ink, ew: 5, r: 50, drop: 8 });
    txt(ctx, '② 太阳风', 235, 1062, { size: 50, color: C.ink });
  });
  // tail labels
  const ld = pop(t, at('dust', '尘埃尾'), 0.45);
  around(ctx, 560, 1300, ld, ld, () => {
    label(ctx, '尘埃尾', 560, 1280, C.dust, 64);
    txt(ctx, '宽 · 弯', 560, 1355, { size: 44, font: SANS, color: C.dust });
  });
  const li = pop(t, at('ion', '离子尾'), 0.45);
  around(ctx, 920, 900, li, li, () => {
    label(ctx, '离子尾', 920, 880, C.ion, 64);
    txt(ctx, '细 · 直', 920, 955, { size: 44, font: SANS, color: C.ion });
  });
  burst(ctx, t, S('cool'), CX, CY, { n: 14, r: 260, size: 26 });
}

// ---------- scene 6: the orbit — tails always point away from the Sun ----------
const OX = 540, OY = 1080, A = 560, B = 330, SUN_Y = OY - Math.sqrt(A * A - B * B);
const orbitPt = (th) => [OX + B * Math.sin(th), OY - A * Math.cos(th)];
const orbitVel = (th) => Math.atan2(-A * Math.sin(th), -B * Math.cos(th)); // θ decreases with time

function cometAt(ctx, t, th, o = {}) {
  const [x, y] = orbitPt(th);
  const dist = Math.hypot(x - OX, y - SUN_Y);
  const len = clamp(400 - dist * 0.3, 170, 300) * (o.k ?? 1);
  return [x, y, comet(ctx, t, { x, y, r: o.r ?? 34, sx: OX, sy: SUN_Y, vel: orbitVel(th), len, ...o })];
}

function orbit(ctx, t) {
  const t0 = S('rule');
  // orbit path
  ctx.save();
  ctx.setLineDash([16, 14]); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(OX, OY, B, A, 0, 0, TAU); ctx.stroke();
  ctx.restore();
  sun(ctx, t, OX, SUN_Y, 62, { face: true });
  // comet runs from lower right, round the Sun, down the left side
  const tTurn = at('turn', '绕过'), tAhead = S('ahead');
  let th;
  if (t < tTurn) th = lerp(1.9, 0.55, easeIO(prog(t, t0, tTurn)));
  else th = lerp(0.55, -1.55, easeIO(prog(t, tTurn, tAhead + 0.3)));
  // ghost snapshots once passed
  for (const g of [1.6, 0.9, -0.9]) {
    if (th > g) continue;
    ctx.save(); ctx.globalAlpha *= 0.4;
    cometAt(ctx, t, g, { r: 22, k: 0.65, mood: 'happy' });
    ctx.restore();
  }
  const huh = t >= S('huh');
  const [x, y] = cometAt(ctx, t, th, { mood: huh ? 'huh' : 'happy', talk: talkLevel(t, ['huh']), look: orbitVel(th) });
  // white motion arrow along the tangent
  const v = orbitVel(th), va = fadeIn(t, t0 + 0.3, 0.4);
  if (va > 0) {
    ctx.save(); ctx.globalAlpha *= va;
    arrow(ctx, x + Math.cos(v) * 50, y + Math.sin(v) * 50, x + Math.cos(v) * 190, y + Math.sin(v) * 190, { color: C.white, w: 10, head: 34 });
    txt(ctx, '飞行方向', x + Math.cos(v) * 250, y + Math.sin(v) * 235, { size: 34, font: SANS, color: C.white, stroke: C.ink, sw: 8 });
    ctx.restore();
  }
  // 背向太阳 rays from the Sun
  const rp = pop(t, at('rule', '背向太阳'), 0.45) * (1 - prog(t, S('turn'), S('turn') + 0.4));
  around(ctx, OX, SUN_Y + 150, rp, rp, () => {
    card(ctx, OX - 230, SUN_Y + 110, 460, 90, { fill: 'rgba(10,12,48,0.92)', edge: C.gold, ew: 5, r: 45, drop: 0 });
    txt(ctx, '两条彗尾 都背向太阳', OX, SUN_Y + 156, { size: 42, color: C.gold });
  });
  // "tail ahead!" callout
  const pa = pop(t, at('ahead', '前面'), 0.45);
  around(ctx, W / 2, 330, pa, pa, () => {
    card(ctx, W / 2 - 270, 275, 540, 110, { fill: C.no, edge: C.ink, ew: 6, r: 40, drop: 8 });
    txt(ctx, '尾巴跑到前面！', W / 2, 332, { size: 58, color: C.white });
  });
  if (huh) {
    for (let i = 0; i < 3; i++) {
      const b = pop(t, S('huh') + i * 0.15, 0.35);
      around(ctx, x + 70 + i * 40, y - 70 - i * 30, b, b, () => txt(ctx, '?', x + 70 + i * 40, y - 70 - i * 30, { size: 60 + i * 10, color: C.gold, stroke: C.ink, sw: 8 }));
    }
  }
  stamp(ctx, t, at('rule', '反方向'), 820, 1320, '背日', { color: C.gold, size: 70, rot: 0.1, until: S('ahead') - 0.2 });
}

export const scenes = [
  { from: S('hands') - 0.3, to: S('rule') - 0.3, draw: hands },
  { from: S('rule') - 0.3, to: S('wind') - 0.3, draw: orbit },
];

export const events = [
  { t: S('hands') + 0.3, type: 'boing' },
  { t: S('hands') + 0.7, type: 'boing' },
  { t: at('dust', '光压'), type: 'pop', f: 700 },
  { t: at('dust', '推开'), type: 'whoosh', d: 1.2, from: 600, to: 2200 },
  { t: at('dust', '尘埃尾'), type: 'ding', n: 81 },
  { t: at('ion', '太阳风'), type: 'pop', f: 900 },
  { t: at('ion', '拽着'), type: 'whoosh', d: 1.4, from: 1200, to: 4000 },
  { t: at('ion', '离子尾'), type: 'ding', n: 86 },
  { t: S('cool'), type: 'tada' },
  { t: S('rule'), type: 'whoosh', d: 0.5 },
  { t: at('rule', '背向太阳'), type: 'ding', n: 84 },
  { t: at('rule', '反方向'), type: 'stamp', shake: 10 },
  { t: at('turn', '绕过'), type: 'whoosh', d: 1.6, from: 500, to: 2500 },
  { t: at('ahead', '前面'), type: 'alarm', shake: 14 },
  { t: S('huh'), type: 'boing' },
];
