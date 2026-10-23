// Scenes 1–2: the mountain hook (closer to the sun yet colder) and the reveal — the ground is the stove, warmed by sunlight.
// Stage band: y ≈ 520–1260, x ≈ 60–920 (the right edge below y 760 is covered by Douyin's buttons).
import {
  C, S, E, at, prog, lerp, clamp, easeIO, easeOut, pop, fadeIn,
  txt, card, around, arrow, burst, star, talkLevel,
} from './lib.mjs';
import { sun, hiker, glow, groundBody, buddy } from './chars.mjs';
import { mountain, thermo, disclaimer } from './props.mjs';

const PEAK = [500, 790];

function snow(ctx, t, x0, x1, y0, y1, n = 26) {
  for (let i = 0; i < n; i++) {
    const r = (k) => { const v = Math.sin(i * 53.1 + k * 7.7) * 43758.5; return v - Math.floor(v); };
    const y = y0 + (((r(1) * (y1 - y0)) + t * (40 + r(2) * 50)) % (y1 - y0));
    const x = x0 + r(3) * (x1 - x0) + Math.sin(t * 2 + i) * 14;
    star(ctx, x, y, 7 + r(4) * 6, 'rgba(255,255,255,0.85)', t + i);
  }
}

// ---------- scene 1: closer to the sun, yet colder ----------
function hookScene(ctx, t) {
  const tCold = at('hook', '更冷'), tFar = S('far'), tYi = at('far', '一亿'), tPa = at('far', '多爬'), tNo = at('far', '几乎');
  glow(ctx, PEAK[0], PEAK[1] - 80, 40, 360, 'rgba(180,220,255,0.18)');
  sun(ctx, t, 850, 600, 58, { mood: t > tNo ? 'happy' : 'wow' });
  mountain(ctx, 40, 960, 1260, PEAK[0], PEAK[1]);
  snow(ctx, t, 260, 760, 520, 900);
  hiker(ctx, t, PEAK[0], PEAK[1] + 6, 0.5, { talk: talkLevel(t, ['hook']), shiver: 1, mood: 'wow' });
  // cold breath puffs
  for (let i = 0; i < 2; i++) {
    const ph = (t * 0.8 + i * 0.5) % 1;
    around(ctx, 0, 0, 1, (1 - ph) * 0.7, () => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(PEAK[0] + 40 + ph * 70, PEAK[1] - 110 - ph * 30, 10 + ph * 16, 0, Math.PI * 2); ctx.fill();
    });
  }
  // two thermometers: warm valley, cold summit
  const p1 = pop(t, at('hook', '山顶') - 0.1, 0.4), p2 = pop(t, tCold - 0.1, 0.45);
  around(ctx, 690, 820, p1, p1, () => {
    thermo(ctx, 690, 820, 150, lerp(0.6, 0.15, easeIO(prog(t, tCold - 0.2, tCold + 0.5))));
    txt(ctx, '山顶 冷', 690, 880, { size: 38, color: C.cool, stroke: C.space, sw: 8 });
  });
  around(ctx, 170, 1150, p2, p2, () => {
    thermo(ctx, 170, 1150, 150, 0.85);
    txt(ctx, '山脚 暖', 170, 1212, { size: 38, color: C.warm, stroke: C.space, sw: 8 });
  });
  // distance ruler: 1.5亿 km vs. a few km
  const rp = fadeIn(t, tFar - 0.1, 0.35) * (1 - prog(t, E('far') + 0.05, E('far') + 0.3));
  if (rp <= 0) return;
  around(ctx, 490, 1000, lerp(0.9, 1, rp), rp, () => {
    card(ctx, 70, 900, 840, 230, { fill: 'rgba(8,16,48,0.9)', edge: C.gold, ew: 5, r: 30, drop: 0 });
    const bp = easeOut(prog(t, tYi - 0.3, tYi + 0.6));
    ctx.save();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(150, 1040); ctx.lineTo(lerp(150, 790, bp), 1040); ctx.stroke();
    ctx.restore();
    txt(ctx, '⛰', 120, 1040, { size: 50 });
    sun(ctx, t, 830, 1040, 34, { face: false });
    around(ctx, 470, 970, 1, fadeIn(t, tYi, 0.3), () => txt(ctx, '约 1.5 亿千米', 470, 970, { size: 50, color: C.gold }));
    // the few extra kilometres: a sliver you need a magnifier for
    const mp = pop(t, tPa - 0.1, 0.45);
    around(ctx, 230, 1085, mp, mp, () => {
      ctx.fillStyle = C.red; ctx.fillRect(150, 1030, 3, 20);
      ctx.strokeStyle = C.white; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(153, 1050); ctx.lineTo(210, 1080); ctx.stroke();
      txt(ctx, '多爬的几千米 ≈ 这一丝', 330, 1092, { size: 32, color: C.pink });
    });
  });
  const sp = pop(t, tNo - 0.05, 0.35) * rp;
  around(ctx, 755, 1090, lerp(1.6, 1, clamp(sp)), sp, () => {
    ctx.save(); ctx.translate(755, 1090); ctx.rotate(-0.15);
    ctx.strokeStyle = C.red; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.roundRect(-115, -38, 230, 76, 14); ctx.stroke();
    ctx.restore();
    txt(ctx, '没靠近!', 755, 1092, { size: 48, color: C.red });
  }, -0.15);
}

// ---------- scene 2: the ground is the stove, and sunlight warms it first ----------
const GY = 1070;
function stoveScene(ctx, t) {
  const tG = at('stove', '烧暖气'), tIn = S('sunIn'), tAbs = at('sunIn', '吸收'), tHot = at('sunIn', '热起来');
  const tAir = S('airSun'), tAirAbs = at('airSun', '吸收');
  const heat = lerp(0.35, 1, easeIO(prog(t, tAbs, tHot + 0.4))) * (0.85 + 0.15 * Math.sin(Math.PI * prog(t, tG, tG + 0.6)));
  // sun and its two (illustrative) paths
  const sp = fadeIn(t, tIn - 0.4, 0.4);
  around(ctx, 190, 600, sp, sp, () => sun(ctx, t, 190, 600, 64, { talk: 0, mood: 'happy' }));
  const r1 = easeOut(prog(t, at('sunIn', '阳光'), at('sunIn', '阳光') + 0.7));
  arrow(ctx, 250, 660, 560, GY - 20, { p: r1, color: C.gold, w: 16, head: 46 });
  if (r1 >= 1) burst(ctx, t, tAbs, 560, GY, { r: 160, n: 10, colors: [C.gold, C.warm] });
  const r2 = easeOut(prog(t, tAir - 0.1, tAirAbs + 0.1));
  arrow(ctx, 270, 620, 700, 760, { p: r2, color: C.gold, w: 12, head: 0.1 });
  const ap = pop(t, tAirAbs - 0.05, 0.45);
  around(ctx, 720, 768, ap, ap, () => {
    glow(ctx, 720, 768, 10, 110, 'rgba(255,200,80,0.55)');
    buddy(ctx, t, 720, 768, 46, { warm: 0.7, mood: 'wow' });
    txt(ctx, '大气也吸收一部分', 640, 860, { size: 40, color: C.gold, stroke: C.space, sw: 8 });
  });
  // a few air buddies waiting above the ground
  [[180, 960], [370, 930], [840, 980]].forEach(([x, y], i) => {
    const bp = pop(t, S('stove') + 0.1 + i * 0.15, 0.4);
    around(ctx, x, y, bp, bp, () => buddy(ctx, t, x, y, 40, { warm: heat * 0.45, mood: 'happy' }));
  });
  groundBody(ctx, t, 60, 940, GY, 190, { heat, face: [500, GY + 105], mood: 'happy' });
  // "the stove is down here!"
  const lp = pop(t, tG - 0.1, 0.45) * (1 - prog(t, tIn - 0.2, tIn + 0.1));
  around(ctx, 500, 620, lp, lp, () => {
    card(ctx, 230, 560, 540, 120, { fill: C.gold, ew: 0, r: 60, drop: 10 });
    txt(ctx, '地面 = 大气的暖炉', 500, 622, { size: 54, color: C.space });
    arrow(ctx, 500, 700, 500, GY - 120, { color: C.gold, w: 12, head: 40, p: 1 });
  });
  const hp = pop(t, tHot - 0.1, 0.4) * (1 - prog(t, tAir - 0.2, tAir + 0.1));
  around(ctx, 300, GY - 70, hp, hp, () => txt(ctx, '先热起来!', 300, GY - 70, { size: 48, color: C.hot, stroke: C.cream, sw: 10 }));
  disclaimer(ctx, 1290, fadeIn(t, tIn, 0.4));
}

export const scenes = [
  { from: 0, to: S('stove') - 0.15, draw: hookScene },
  { from: S('stove') - 0.15, to: S('kidHow') - 0.3, draw: stoveScene },
];

export const events = [
  { type: 'wind', t: 0, d: 3.0, amp: 0.5 },
  { type: 'pop', t: at('hook', '山顶') - 0.1, f: 600 },
  { type: 'boing', t: at('hook', '更冷') - 0.1, amp: 0.6 },
  { type: 'whoosh', t: S('far') - 0.1, d: 0.35 },
  { type: 'scribble', t: at('far', '一亿') - 0.3, d: 0.8 },
  { type: 'pop', t: at('far', '多爬') - 0.1, f: 1200 },
  { type: 'stamp', t: at('far', '几乎') - 0.05, shake: 7 },
  { type: 'whoosh', t: S('stove') - 0.3, d: 0.4 },
  { type: 'tada', t: at('stove', '地面') - 0.1, amp: 0.7 },
  { type: 'zap', t: at('sunIn', '阳光'), amp: 0.5 },
  { type: 'sparkle', t: at('sunIn', '吸收') },
  { type: 'ding', t: at('sunIn', '热起来'), n: 84 },
  { type: 'pop', t: at('airSun', '吸收') - 0.05, f: 900 },
];
