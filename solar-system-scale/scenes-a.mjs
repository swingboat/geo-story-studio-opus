// Scenes A: the crowded textbook picture → Earth shrinks to a 1 cm bean → the 1.1 m Sun next to a student.
import { C, NUM, SANS, S, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, card, around, arrow, stamp, talkLevel } from './lib.mjs';
import { planet, sun, student, glow } from './bodies.mjs';

const TALK = ['hi', 'tiny'];

// ---------- hook: a textbook-style diagram, eight big planets squeezed in a row ----------
const BOOK = [['水星', 330, 13], ['金星', 392, 21], ['地球', 458, 23], ['火星', 520, 16], ['木星', 612, 46], ['土星', 722, 36], ['天王星', 820, 28], ['海王星', 905, 27]];
const SUN_X = 110, ROW_Y = 860;

function hook(ctx, t) {
  const t0 = at('hook', '八大行星'), tSq = at('hook', '挤得'), tq = at('q', '这么挤');
  const sq = easeOut(prog(t, tSq, tSq + 0.45));
  const wob = t > tSq ? Math.sin((t - tSq) * 20) * Math.exp(-(t - tSq) * 3) : 0;
  around(ctx, 540, 820, lerp(0.92, 1, easeOut(prog(t, 0, 0.7))), 1, () => {
    card(ctx, 90, 420, 900, 800, { fill: '#fbf3df', r: 26, ew: 0 });
    txt(ctx, '地理 · 必修第一册', 140, 478, { size: 30, font: SANS, color: '#9a8f78', align: 'left' });
    txt(ctx, '太阳系', 540, 560, { size: 70, color: C.ink });
    ctx.save();
    ctx.beginPath(); ctx.roundRect(90, 420, 900, 800, 26); ctx.clip();
    sun(ctx, t, SUN_X - 60, ROW_Y, 210, { rays: false });
    BOOK.forEach(([name, x0], i) => {
      const x = lerp(x0, SUN_X + (x0 - SUN_X) * 0.86, sq);
      ctx.strokeStyle = 'rgba(40,40,90,0.3)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(SUN_X - 60, ROW_Y, x - SUN_X + 60, -0.36, 0.36); ctx.stroke();
    });
    ctx.restore();
    BOOK.forEach(([name, x0, r], i) => {
      const p = pop(t, t0 + i * 0.12, 0.4);
      const x = lerp(x0, SUN_X + (x0 - SUN_X) * 0.86, sq) + wob * 6 * (i % 2 ? 1 : -1);
      const rr = r * (1 + 0.12 * sq);
      around(ctx, x, ROW_Y, p, p, () => {
        planet(ctx, t, name, x, ROW_Y, rr, { ringRot: -0.35, light: Math.PI });
        txt(ctx, name, x, ROW_Y + (i % 2 ? -1 : 1) * (rr + 34), { size: 28, font: SANS, color: '#4a4466' });
      });
    });
    // sweat drops: they are squeezed
    if (sq > 0) for (let k = 0; k < 3; k++) {
      const yy = 700 + ((t * 120 + k * 50) % 90);
      ctx.fillStyle = `rgba(95,190,255,${0.8 * sq})`;
      ctx.beginPath(); ctx.ellipse(560 + k * 140, yy, 7, 11, 0, 0, Math.PI * 2); ctx.fill();
    }
  }, -0.03);
  stamp(ctx, t, tq, 540, 1290, '真这么挤？', { color: C.no, size: 100, rot: -0.08 });
}

// ---------- bean: Earth (character) shrinks to 1 cm, then the camera pulls back to the 1.1 m Sun ----------
const SUN_R = 54.6, SUN_CX = 0.5 + 3 + SUN_R, SUN_CY = 0.5 - SUN_R; // cm; Earth centre at the origin, ground at y = 0.5
const KID_X = SUN_CX + SUN_R + 36, KID_H = 175;

function camera(t) {
  const t0 = at('sun', '1.1米') - 0.25;
  const p = easeIO(prog(t, t0, t0 + 1.7));
  const k = 28 * Math.pow(4.2 / 28, p);
  const fx = lerp(0, 70, p), fy = lerp(0, 0.5, p), ay = lerp(860, 1250, p);
  return { p, k, X: (wx) => 540 + (wx - fx) * k, Y: (wy) => ay + (wy - fy) * k };
}

function ruler(ctx, cam, a) {
  if (a <= 0) return;
  const { k, X, Y } = cam;
  ctx.save();
  ctx.globalAlpha *= a;
  const x0 = X(-6.5), x1 = X(10.5), y = Y(0.5);
  ctx.fillStyle = '#f2c66d'; ctx.strokeStyle = '#8a5a1c'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(x0, y, x1 - x0, 2.4 * k, 8); ctx.fill(); ctx.stroke();
  for (let c = -6; c <= 10; c++) {
    const x = X(c - 0.5);
    ctx.strokeStyle = '#5a3a10'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + (c % 5 === 0 ? 1.1 : 0.7) * k); ctx.stroke();
    if (c >= 0 && c % 5 === 0) txt(ctx, String(c), x, y + 1.7 * k, { size: 26, font: NUM, color: '#5a3a10' });
  }
  ctx.restore();
}

function bean(ctx, t) {
  const tHi = S('hi'), tRule = at('rule', '规则'), tShrink = at('rule', '缩成'), tSun = S('sun');
  const tWaist = at('sun', '齐腰高'), tTiny = S('tiny');
  const cam = camera(t);
  const { k, X, Y, p: zp } = cam;
  const shrink = easeIO(prog(t, tShrink, tShrink + 0.9));

  // floor
  const gy = Y(0.5);
  const fl = ctx.createLinearGradient(0, gy, 0, gy + 260);
  fl.addColorStop(0, `rgba(120,150,230,${0.35 * shrink})`); fl.addColorStop(1, 'rgba(120,150,230,0)');
  ctx.fillStyle = fl; ctx.fillRect(0, gy, 1080, 260);

  ruler(ctx, cam, shrink * (1 - zp));

  // the Sun ball rolls in from the right
  if (t >= tSun - 0.1) {
    const slide = 1 - easeOut(prog(t, tSun, tSun + 0.8));
    const cx = X(SUN_CX + slide * 160), cy = Y(SUN_CY), r = SUN_R * k;
    sun(ctx, t, cx, cy, r, { rays: false, face: zp > 0.6, mood: 'happy' });
    // diameter label
    const la = fadeIn(t, at('sun', '1.1米') + 1.2, 0.4);
    if (la > 0) {
      ctx.save(); ctx.globalAlpha *= la;
      const y = cy - r - 100;
      arrow(ctx, cx, y, cx - r, y, { color: C.gold, w: 6, head: 20 });
      arrow(ctx, cx, y, cx + r, y, { color: C.gold, w: 6, head: 20 });
      txt(ctx, '直径 1.1 米', cx, y - 50, { size: 54, color: C.gold, stroke: C.ink, sw: 8 });
      ctx.restore();
    }
  }

  // the student shows the scale: waist-high Sun
  if (t >= tWaist - 0.1) {
    const sp = pop(t, tWaist - 0.1, 0.45);
    const fx = X(KID_X), fy = Y(0.5), h = KID_H * k;
    around(ctx, fx, fy, sp, sp, () => student(ctx, t, fx, fy, h, { flip: -1, wave: prog(t, tTiny + 1.6, tTiny + 1.9) }));
    const da = fadeIn(t, tWaist + 0.3, 0.3);
    if (da > 0) {
      ctx.save(); ctx.globalAlpha *= da;
      const y = Y(SUN_CY - SUN_R);
      ctx.strokeStyle = C.white; ctx.lineWidth = 4; ctx.setLineDash([14, 12]);
      ctx.beginPath(); ctx.moveTo(X(SUN_CX), y); ctx.lineTo(fx + 40, y); ctx.stroke();
      ctx.setLineDash([]);
      txt(ctx, '齐腰高', fx - 100, y - 34, { size: 46, color: C.white, align: 'right', stroke: C.ink, sw: 8 });
      ctx.restore();
    }
  }

  // Earth: a talking character that shrinks into the bean
  const rIn = 190 * pop(t, tHi - 0.15, 0.5);
  const ex = lerp(540, X(0), shrink), ey = lerp(780, Y(0), shrink);
  const er = shrink >= 1 ? 0.5 * k : lerp(rIn, 0.5 * 28, shrink);
  if (er > 0.5) {
    if (er > 30) glow(ctx, ex, ey, er * 0.9, er * 1.35, 'rgba(110,190,255,0.35)');
    planet(ctx, t, '地球', ex, ey, er, { face: true, talk: talkLevel(t, TALK), mood: shrink > 0.5 ? 'wow' : 'happy', light: Math.PI * 0.9 });
  }
  if (shrink >= 1) {
    const ring = 0.5 * k + 16 + 5 * Math.sin(t * 6);
    ctx.strokeStyle = C.sky; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(ex, ey, ring, 0, Math.PI * 2); ctx.stroke();
    const la = fadeIn(t, tShrink + 0.9, 0.3) * (1 - zp);
    if (la > 0) {
      ctx.save(); ctx.globalAlpha *= la;
      txt(ctx, '1 厘米', ex, ey - 90, { size: 56, color: C.gold, stroke: C.ink, sw: 8 });
      ctx.restore();
    }
    if (zp > 0.9) txt(ctx, '地球', ex, ey + 70, { size: 40, color: C.sky, stroke: C.ink, sw: 6 });
  }

  // magnifier: the bean is still Earth, and it is shocked
  if (t >= tTiny - 0.2) {
    const mp = pop(t, tTiny - 0.2, 0.45);
    const mx = 200, my = 560, mr = 130;
    ctx.save(); ctx.globalAlpha *= clamp(mp);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(mx, my + mr); ctx.lineTo(ex, ey - 18); ctx.stroke();
    ctx.restore();
    around(ctx, mx, my, mp, mp, () => {
      ctx.fillStyle = 'rgba(8,12,44,0.92)';
      ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.sky; ctx.lineWidth = 10; ctx.stroke();
      planet(ctx, t, '地球', mx, my + 6, 96, { face: true, mood: 'wow', talk: talkLevel(t, TALK) });
    });
  }

  // rule card
  const ra = pop(t, tRule, 0.45);
  around(ctx, 540, 300, ra, ra, () => {
    card(ctx, 170, 245, 740, 110, { fill: C.cream, r: 55, ew: 6, drop: 10 });
    txt(ctx, '规则：同一比例缩小', 540, 302, { size: 58, color: C.ink });
  });
}

export const scenes = [
  { from: 0, to: S('hi') - 0.3, draw: hook },
  { from: S('hi') - 0.3, to: S('small') - 0.3, draw: bean },
];

export const events = [
  ...[...Array(8)].map((_, i) => ({ t: at('hook', '八大行星') + i * 0.12, type: 'pop' })),
  { t: at('hook', '挤得'), type: 'boing' },
  { t: at('q', '这么挤'), type: 'stamp', shake: 14 },
  { t: S('hi') - 0.15, type: 'boing' },
  { t: at('rule', '规则'), type: 'ding' },
  { t: at('rule', '缩成'), type: 'whoosh' },
  { t: at('rule', '缩成') + 0.9, type: 'tick' },
  { t: S('sun'), type: 'whoosh' },
  { t: S('sun') + 0.75, type: 'thud', shake: 12 },
  { t: at('sun', '1.1米') - 0.25, type: 'whoosh' },
  { t: at('sun', '齐腰高') - 0.1, type: 'pop' },
  { t: S('tiny') - 0.2, type: 'boing' },
];
