// Scenes C: Earth's temperature (distance + atmospheric blanket → ~15 ℃; no atmosphere → ~-18 ℃) → moderate rotation/revolution periods → level 1 cleared.
import { C, NUM, SANS, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, card, around, arrow, stamp, burst, rand } from './lib.mjs';
import { planet, sun, glow } from './bodies.mjs';
import { thermometer, heatWave, snowflake, chip, levelPass } from './props.mjs';

const TAU = Math.PI * 2;

// ---------- Earth's temperature: blanket on / off ----------
function earthTemp(ctx, t) {
  const t0 = S('e-temp'), tD = at('e-temp', '日地距离'), tB = at('e-temp', '大气保温'), t15 = at('e-temp', '15');
  const tOff = at('e-temp', '没有大气'), t18 = at('e-temp', '18');
  const EX = 380, EY = 820, ER = 190, AR = 255;
  const on = easeOut(prog(t, tB - 0.2, tB + 0.4)) * (1 - easeIO(prog(t, tOff - 0.1, tOff + 0.5)));
  const frozen = easeIO(prog(t, tOff, t18 + 0.3));
  // sun & distance chip
  sun(ctx, t, 900, 430, 80);
  const dp = pop(t, tD - 0.1, 0.4);
  around(ctx, 540, 330, dp, dp, () => chip(ctx, t, 'light', 540, 330, { label: '日地距离适中', size: 48 }));
  for (let k = 0; k < 3; k++) {
    const e = -1.25 + k * 0.45, s = 2.9 - k * 0.35;
    arrow(ctx, 900 + Math.cos(s) * 105, 430 + Math.sin(s) * 105, EX + Math.cos(e) * (AR + 6), EY + Math.sin(e) * (AR + 6), { color: C.sun, w: 8, head: 24, p: easeOut(prog(t, t0 + 0.2 + k * 0.12, t0 + 0.9 + k * 0.12)) });
  }
  // atmosphere blanket + returned heat (大气逆辐射 keeps the surface warm)
  if (on > 0) {
    ctx.save();
    ctx.globalAlpha = on;
    glow(ctx, EX, EY, ER, AR + 30, 'rgba(110,200,255,0.55)');
    ctx.strokeStyle = 'rgba(150,220,255,0.8)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(EX, EY, AR, 0, TAU); ctx.stroke();
    for (let k = 0; k < 4; k++) {
      const a = -1.9 + k * 0.6, ph = (t * 0.8 + k * 0.25) % 1, f = ph < 0.5 ? ph * 2 : 2 - ph * 2;
      const rr = lerp(ER + 6, AR - 10, f);
      ctx.fillStyle = '#ff7a4a';
      ctx.beginPath(); ctx.arc(EX + Math.cos(a) * rr, EY + Math.sin(a) * rr, 11, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  // ghost outline once the blanket is removed; heat escapes freely
  if (frozen > 0) {
    ctx.save();
    ctx.globalAlpha = frozen * 0.7;
    ctx.strokeStyle = 'rgba(200,220,255,0.6)'; ctx.lineWidth = 4; ctx.setLineDash([10, 14]);
    ctx.beginPath(); ctx.arc(EX, EY, AR, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    for (let k = 0; k < 3; k++) heatWave(ctx, t + k * 0.3, EX - ER * 0.4 + k * ER * 0.4, EY - ER * 0.9, EX - 120 + k * 120, EY - ER - 190, { p: frozen, w: 6, amp: 8 });
    for (let i = 0; i < 9; i++) snowflake(ctx, EX - ER + rand(i) * ER * 2, EY - ER + ((t * 50 + rand(i + 2) * ER * 2) % (ER * 2)), 12 + rand(i + 6) * 10, t + i, `rgba(220,240,255,${frozen})`);
  }
  planet(ctx, t, '地球', EX, EY, ER, { face: true, mood: frozen > 0.5 ? 'cold' : 'happy', light: -0.8, tint: `rgba(170,215,255,${0.45 * frozen})` });
  // thermometer: 15 ℃, then -18 ℃
  const tp = fadeIn(t, t15 - 0.4, 0.3);
  const v = t < tOff ? lerp(-30, 15, easeOut(prog(t, t15 - 0.3, t15 + 0.5))) : lerp(15, -18, easeIO(prog(t, t18 - 0.4, t18 + 0.4)));
  thermometer(ctx, 860, 860, 330, v, { min: -40, max: 50, color: v >= 0 ? C.temp : C.water, label: `${Math.round(v)}℃`, ticks: [0], a: tp });
  if (tp > 0) {
    ctx.save(); ctx.globalAlpha = tp;
    txt(ctx, '平均气温', 860, 1130, { size: 40, font: SANS, color: 'rgba(255,255,255,0.8)' });
    ctx.restore();
  }
  const lp = pop(t, tB, 0.4) * (1 - prog(t, tOff - 0.2, tOff));
  around(ctx, EX, EY + AR + 70, lp, lp, () => chip(ctx, t, 'air', EX, EY + AR + 70, { label: '大气保温', size: 46 }));
  const np = pop(t, tOff, 0.4);
  around(ctx, EX, EY + AR + 70, np, np, () => {
    card(ctx, EX - 190, EY + AR + 30, 380, 84, { fill: 'rgba(10,12,44,0.92)', edge: C.ice, ew: 5, drop: 0, r: 42 });
    txt(ctx, '假如没有大气', EX, EY + AR + 73, { size: 46, color: C.ice });
  });
}

// ---------- periods: spin & orbit are moderate → small daily/seasonal swings vs Mercury ----------
function curve(ctx, x0, y0, w, amp, color, lw, t) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i <= 120; i++) {
    const x = x0 + (i / 120) * w;
    ctx.lineTo(x, y0 - Math.sin((i / 120) * TAU * 2 - t * 2) * amp);
  }
  ctx.stroke();
  ctx.restore();
}

function periods(ctx, t) {
  const t0 = S('e-period'), tRev = at('e-period', '公转'), tSw = at('e-period', '温差'), tL = at('e-period', '第一关'), tOk = at('e-period', '适宜的温度');
  // left: Earth spinning (rotation); right: Earth circling the Sun (revolution)
  const sp = pop(t, t0 - 0.1, 0.45);
  around(ctx, 280, 560, sp, sp, () => {
    planet(ctx, t * 3, '地球', 280, 560, 120, { light: 0 });
    ctx.strokeStyle = C.sky; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.ellipse(280, 560, 175, 50, 0, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    arrow(ctx, 280 - 150, 560 + 35, 280 - 172, 560 + 8, { color: C.sky, w: 8, head: 26 });
    txt(ctx, '自转', 280, 755, { size: 50, color: C.sky });
  });
  const rp = pop(t, tRev - 0.2, 0.45);
  around(ctx, 790, 560, rp, rp, () => {
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 4; ctx.setLineDash([10, 10]);
    ctx.beginPath(); ctx.ellipse(790, 560, 190, 120, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    sun(ctx, t, 790, 560, 46, { rays: false });
    const a = t * 1.2;
    planet(ctx, t, '地球', 790 + Math.cos(a) * 190, 560 + Math.sin(a) * 120, 30, { light: a + Math.PI });
    txt(ctx, '公转', 790, 755, { size: 50, color: C.sky });
  });
  const ap = pop(t, at('e-period', '适中') - 0.1, 0.4);
  around(ctx, 540, 840, ap, ap, () => {
    card(ctx, 330, 800, 420, 80, { fill: C.sky, edge: C.white, ew: 4, drop: 0, r: 40 });
    txt(ctx, '周期都适中', 540, 842, { size: 48, color: C.ink });
  });
  // temperature-swing comparison
  const gp = fadeIn(t, tSw - 0.4, 0.4);
  if (gp > 0) {
    ctx.save(); ctx.globalAlpha *= gp;
    card(ctx, 90, 920, 900, 330, { fill: 'rgba(10,14,50,0.8)', edge: 'rgba(255,255,255,0.25)', ew: 3, drop: 0, r: 30 });
    txt(ctx, '温度变化幅度', 540, 965, { size: 40, font: SANS, color: 'rgba(255,255,255,0.8)' });
    curve(ctx, 300, 1100, 640, 100 * easeOut(prog(t, tSw - 0.3, tSw + 0.5)), 'rgba(179,172,163,0.8)', 6, t);
    curve(ctx, 300, 1100, 640, 16 * easeOut(prog(t, tSw, tSw + 0.6)), C.sky, 10, t);
    txt(ctx, '水星', 200, 1050, { size: 44, color: C.mercury });
    txt(ctx, '地球', 200, 1140, { size: 44, color: C.sky });
    ctx.restore();
  }
  // level 1 cleared
  levelPass(ctx, t, '一', '适宜的温度', C.temp, pop(t, tL - 0.1, 0.4), tOk + 0.3);
  burst(ctx, t, tOk + 0.3, 540, 1340, { n: 12, r: 380 });
}

export const scenes = [
  { from: S('e-temp') - 0.2, to: S('e-period') - 0.2, draw: earthTemp },
  { from: S('e-period') - 0.2, to: S('atm') - 0.2, draw: periods },
];

export const events = [
  { t: at('e-temp', '日地距离') - 0.1, type: 'pop' },
  { t: at('e-temp', '大气保温') - 0.2, type: 'whoosh', from: 1600, to: 500 },
  { t: at('e-temp', '15') - 0.3, type: 'ding', n: 81 },
  { t: at('e-temp', '没有大气'), type: 'whoosh', from: 500, to: 2400 },
  { t: at('e-temp', '18') - 0.4, type: 'wind', d: 1.6 },
  { t: S('e-period') - 0.1, type: 'pop' },
  { t: at('e-period', '公转') - 0.2, type: 'pop', f: 820 },
  { t: at('e-period', '温差') - 0.4, type: 'scribble', d: 0.8 },
  { t: at('e-period', '第一关') - 0.1, type: 'note', n: 72 },
  { t: at('e-period', '适宜的温度') + 0.3, type: 'tada' },
];
