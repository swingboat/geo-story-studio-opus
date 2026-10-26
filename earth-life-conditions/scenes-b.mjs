// Scenes B: buzzer quiz "hottest planet?" → why Venus beats Mercury (thick CO2 greenhouse) → Mercury's day/night swing and freezing Mars.
import { C, NUM, SANS, S, E, at, atEnd, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, card, around, arrow, burst, stamp, talkLevel, rand } from './lib.mjs';
import { planet, sun, glow } from './bodies.mjs';
import { thermometer, bubble, checkBadge, molecule, heatWave, snowflake, chip } from './props.mjs';
import { contestant, banner, spotlights } from './scenes-a.mjs';

// ---------- quiz: card drops in, Mercury buzzes in, Venus takes the crown ----------
function quiz(ctx, t) {
  const tQ = at('quiz', '抢答'), tM = S('mer-guess'), tX = at('ven-win', '错'), tV = at('ven-win', '金星'), tT = at('ven-win', '467'), tL = at('ven-win', '铅');
  spotlights(ctx, t, 1 - prog(t, tX, tX + 0.3) * 0.6);
  around(ctx, 540, 340, 0.8, 1, () => banner(ctx, t), 0);
  // question card (gives way to the thermometer once Venus answers)
  const qp = pop(t, tQ - 0.1, 0.45) * (1 - prog(t, tT - 0.3, tT));
  around(ctx, 540, 640, qp, qp, () => {
    card(ctx, 110, 500, 860, 270, { fill: C.cream, r: 36, ew: 8, edge: C.gold, drop: 12 });
    card(ctx, 400, 470, 280, 70, { fill: C.fire, r: 35, ew: 0, drop: 0 });
    txt(ctx, '抢答题', 540, 506, { size: 46, color: C.white });
    txt(ctx, '太阳系最热的行星是？', 540, 660, { size: 74, color: C.ink });
  });
  const mTalk = talkLevel(t, ['mer-guess']), vTalk = talkLevel(t, ['ven-win']);
  const wrong = t > tX;
  contestant(ctx, t, '水星', { mood: wrong ? 'sad' : 'proud', talk: mTalk, lift: 1.8 * easeOut(prog(t, tM - 0.25, tM)) * (1 - prog(t, tX, tX + 0.4)) });
  contestant(ctx, t, '金星', { mood: 'proud', talk: vTalk, lift: easeOut(prog(t, tX - 0.1, tX + 0.2)), lit: prog(t, tV, tV + 0.3), tint: `rgba(255,90,30,${0.25 * prog(t, tT, tT + 1)})` });
  contestant(ctx, t, '地球', { mood: wrong ? 'wow' : 'happy' });
  contestant(ctx, t, '火星', { mood: wrong ? 'wow' : 'happy' });
  // Mercury slams in first
  burst(ctx, t, tM - 0.1, 175, 1010, { n: 8, r: 150 });
  const mb = pop(t, at('mer-guess', '最近') - 0.2, 0.35) * (1 - prog(t, tX - 0.1, tX + 0.1));
  bubble(ctx, 210, 900, '我最近！', { side: 1, size: 54, sc: mb, a: mb });
  if (wrong) {
    const xp = pop(t, tX, 0.3);
    around(ctx, 175, 1040, xp, xp * (1 - prog(t, tT + 0.6, tT + 1)), () => checkBadge(ctx, 175, 1040, 70, C.no, false));
  }
  // Venus: thermometer soars to 467 ℃, a lead block melts beside it
  const ta = fadeIn(t, tT - 0.3, 0.3);
  const v = lerp(20, 467, easeOut(prog(t, tT, tT + 1.0)));
  thermometer(ctx, 330, 690, 330, v, { min: -50, max: 500, color: C.fire, label: `${Math.round(v)}℃`, a: ta });
  const lp = fadeIn(t, tL - 0.3, 0.3), melt = easeIO(prog(t, tL, tL + 1.2));
  if (lp > 0) {
    ctx.save(); ctx.globalAlpha = lp;
    const bx = 720, by = 780;
    ctx.fillStyle = '#9aa3b5';
    const hgt = lerp(120, 26, melt), wid = lerp(200, 330, melt);
    ctx.beginPath(); ctx.roundRect(bx - wid / 2, by - hgt, wid, hgt, lerp(10, 26, melt)); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(bx - wid / 2 + 14, by - hgt + 10, wid * 0.5, 10);
    if (melt < 0.6) txt(ctx, 'Pb', bx, by - hgt / 2, { size: 54, font: NUM, color: '#5a6275' });
    for (let i = 0; i < 4; i++) {
      const dy = ((t * 70 + i * 40) % 140);
      ctx.fillStyle = `rgba(255,150,80,${0.6 * melt * (1 - dy / 140)})`;
      ctx.beginPath(); ctx.ellipse(bx - 90 + i * 60, by - 40 - dy, 8, 18, 0, 0, Math.PI * 2); ctx.fill();
    }
    txt(ctx, melt > 0.5 ? '铅块都化了！' : '铅块', bx, by + 70, { size: 54, color: C.amber });
    ctx.restore();
  }
}

// ---------- greenhouse: Venus is farther than Mercury yet hotter ----------
const SX = 60, AU = 1000, LY = 540;
function greenhouse(ctx, t) {
  const t0 = S('ven-why'), tFar = at('ven-why', '更远'), tHot = at('ven-why', '更热'), tAtm = at('ven-why', '二氧化碳'), tG = at('ven-why', '温室效应');
  sun(ctx, t, SX - 120, LY, 120);
  const rows = [['水星', 0.39, 30, '最高430℃'], ['金星', 0.72, 40, '约467℃']];
  rows.forEach(([n, d, r, lab], i) => {
    const x = SX + d * AU, p = pop(t, t0 + 0.1 + i * 0.25, 0.4);
    around(ctx, x, LY, p, p, () => {
      planet(ctx, t, n, x, LY, r, { light: Math.PI });
      txt(ctx, n, x, LY + r + 40, { size: 42, color: C.white });
      const hp = pop(t, i ? tHot : tFar, 0.4);
      around(ctx, x, LY - r - 60, hp, hp, () => {
        card(ctx, x - 125, LY - r - 105, 250, 86, { fill: i ? C.fire : '#5b6380', edge: C.white, ew: 4, drop: 0, r: 43 });
        txt(ctx, lab, x, LY - r - 60, { size: 46, font: NUM, color: C.white });
      });
    });
  });
  // "farther" bracket along the orbit line
  const fp = easeOut(prog(t, tFar - 0.2, tFar + 0.4));
  if (fp > 0) {
    ctx.save(); ctx.globalAlpha = fp;
    ctx.strokeStyle = C.sky; ctx.lineWidth = 5; ctx.setLineDash([10, 10]);
    ctx.beginPath(); ctx.moveTo(SX, LY + 110); ctx.lineTo(SX + 0.72 * AU * fp, LY + 110); ctx.stroke();
    ctx.setLineDash([]);
    txt(ctx, '离太阳更远', SX + 0.3 * AU, LY + 150, { size: 38, font: SANS, color: C.sky });
    ctx.restore();
  }
  // big Venus with a thick CO2 blanket trapping heat
  const vp = pop(t, tAtm - 0.5, 0.5);
  const VX = 540, VY = 1080, VR = 170, AR = 290;
  around(ctx, VX, VY, vp, vp, () => {
    glow(ctx, VX, VY, VR, AR + 40, 'rgba(255,170,60,0.35)');
    ctx.fillStyle = 'rgba(230,180,90,0.35)';
    ctx.beginPath(); ctx.arc(VX, VY, AR, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 14; i++) {
      const a = rand(i) * Math.PI * 2 + t * 0.2 * (i % 2 ? 1 : -1), d = VR + 30 + rand(i + 4) * (AR - VR - 60);
      molecule(ctx, VX + Math.cos(a) * d, VY + Math.sin(a) * d, 'CO2', 12, a + t);
    }
    planet(ctx, t, '金星', VX, VY, VR, { face: true, mood: 'hot', light: Math.PI * 1.2, tint: 'rgba(255,90,30,0.25)' });
    // sunlight gets in, heat can't get out: it bounces back under the blanket
    for (let k = 0; k < 3; k++) {
      const a = -2.4 + k * 0.35;
      const x0 = VX + Math.cos(a) * (AR + 80), y0 = VY + Math.sin(a) * (AR + 80);
      arrow(ctx, x0, y0, VX + Math.cos(a) * (VR + 8), VY + Math.sin(a) * (VR + 8), { color: C.sun, w: 9, head: 26, p: easeOut(prog(t, tAtm + k * 0.15, tAtm + 0.6 + k * 0.15)) });
    }
    const hp = prog(t, tG - 0.4, tG + 0.2);
    for (let k = 0; k < 5; k++) {
      const a = -0.6 + k * 0.5, ph = ((t * 0.9 + k * 0.37) % 1);
      if (hp <= 0) break;
      const r0 = VR + 6, r1 = AR - 12, out = ph < 0.5, f = out ? ph * 2 : 2 - ph * 2;
      const rr = lerp(r0, r1, f);
      ctx.fillStyle = `rgba(255,80,50,${0.9 * hp})`;
      ctx.beginPath(); ctx.arc(VX + Math.cos(a) * rr, VY + Math.sin(a) * rr, 13, 0, Math.PI * 2); ctx.fill();
      if (!out && ph < 0.6) burst(ctx, t, t - (ph - 0.5) * 1.1, VX + Math.cos(a) * r1, VY + Math.sin(a) * r1, { n: 5, r: 30, size: 10, colors: ['#ffb38a'], dur: 0.12 });
    }
  });
  const cp = pop(t, tAtm, 0.4);
  around(ctx, 830, 820, cp, cp, () => {
    card(ctx, 680, 780, 300, 80, { fill: 'rgba(10,12,44,0.92)', edge: C.co2, ew: 5, drop: 0, r: 40 });
    txt(ctx, '浓厚CO₂大气', 830, 822, { size: 42, color: C.co2 });
  });
  stamp(ctx, t, tG, 540, 1340, '温室效应极强', { color: C.fire, size: 70, rot: -0.05 });
}

// ---------- swing: Mercury 430 ↔ -180 ℃ without air; Mars shivers at -153 ℃ ----------
function swing(ctx, t) {
  const tD = at('mer-swing', '白天'), tN = at('mer-swing', '夜里'), tMars = S('mars-cold'), tLow = at('mars-cold', '153'), tA = at('mars-cold', '阿嚏');
  // Mercury panel
  const mp = fadeIn(t, S('mer-swing') - 0.2, 0.4);
  ctx.save(); ctx.globalAlpha *= mp;
  card(ctx, 60, 250, 960, 560, { fill: 'rgba(10,14,50,0.75)', edge: 'rgba(255,255,255,0.25)', ew: 3, drop: 0, r: 40 });
  txt(ctx, '水星：几乎没有大气', 540, 310, { size: 50, color: C.mercury });
  const night = easeIO(prog(t, tN - 0.3, tN + 0.2));
  const MX = 330, MY = 560, MR = 150;
  sun(ctx, t, 80, 560, 70, { rays: true });
  planet(ctx, t, '水星', MX, MY, MR, { face: true, mood: night > 0.5 ? 'cold' : 'hot', talk: talkLevel(t, ['mer-swing']), light: Math.PI,
    tint: night > 0.5 ? 'rgba(80,140,255,0.3)' : `rgba(255,120,40,${0.3 * prog(t, tD, tD + 0.4)})` });
  // heat leaking straight off to space (no blanket)
  for (let k = 0; k < 3; k++) heatWave(ctx, t + k * 0.3, MX + MR * 0.7, MY - 60 + k * 60, MX + MR + 130, MY - 120 + k * 120, { p: prog(t, S('mer-swing'), S('mer-swing') + 0.8), w: 6, amp: 8 });
  const v = t < tN - 0.2 ? lerp(20, 430, easeOut(prog(t, tD - 0.1, tD + 0.7))) : lerp(430, -180, easeIO(prog(t, tN - 0.2, tN + 0.8)));
  thermometer(ctx, 820, 600, 260, v, { min: -200, max: 460, color: v > 0 ? C.fire : C.water, label: `${Math.round(v)}℃` });
  txt(ctx, night > 0.5 ? '夜里' : '白天', 650, 720, { size: 48, color: night > 0.5 ? C.sky : C.amber });
  ctx.restore();
  // Mars panel
  const sp = pop(t, tMars - 0.2, 0.45);
  around(ctx, 540, 1110, sp, sp, () => {
    card(ctx, 60, 860, 960, 500, { fill: 'rgba(10,14,50,0.75)', edge: 'rgba(255,255,255,0.25)', ew: 3, drop: 0, r: 40 });
    txt(ctx, '火星：大气稀薄', 540, 920, { size: 50, color: '#ff8a5c' });
    const AX = 330, AY = 1140, AR = 130;
    ctx.strokeStyle = 'rgba(255,200,170,0.35)'; ctx.lineWidth = 3; ctx.setLineDash([6, 12]);
    ctx.beginPath(); ctx.arc(AX, AY, AR + 18, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    const sneeze = prog(t, tA - 0.05, tA + 0.35);
    planet(ctx, t, '火星', AX + Math.sin(sneeze * Math.PI) * 30, AY, AR, { face: true, mood: 'cold', talk: talkLevel(t, ['mars-cold']), light: Math.PI, tint: 'rgba(120,180,255,0.28)' });
    for (let i = 0; i < 7; i++) snowflake(ctx, 120 + rand(i) * 420, 980 + ((t * 40 + rand(i + 3) * 380) % 380), 14 + rand(i + 5) * 10, t + i);
    const mv = lerp(20, -153, easeOut(prog(t, tLow - 0.2, tLow + 0.8)));
    thermometer(ctx, 820, 1170, 230, mv, { min: -200, max: 460, color: C.water, label: `${Math.round(mv)}℃` });
    if (sneeze > 0) {
      const q = pop(t, tA, 0.3);
      around(ctx, 540, 1060, q, q * (1 - prog(t, tA + 1.4, tA + 1.8)), () => txt(ctx, '阿嚏！', 560, 1060, { size: 110, color: C.cream, stroke: C.ink, sw: 12 }), -0.12);
    }
  });
}

export const scenes = [
  { from: S('quiz') - 0.2, to: S('ven-why') - 0.2, draw: quiz },
  { from: S('ven-why') - 0.2, to: S('mer-swing') - 0.2, draw: greenhouse },
  { from: S('mer-swing') - 0.2, to: S('e-temp') - 0.2, draw: swing },
];

export const events = [
  { t: at('quiz', '抢答') - 0.1, type: 'whoosh' },
  { t: S('mer-guess') - 0.1, type: 'ding', n: 84 },
  { t: at('ven-win', '错'), type: 'buzz' },
  { t: at('ven-win', '金星'), type: 'tada', amp: 0.7 },
  { t: at('ven-win', '467'), type: 'whoosh', from: 300, to: 3000, d: 0.9 },
  { t: at('ven-win', '铅'), type: 'sizzle', d: 1.3 },
  { t: S('ven-why'), type: 'pop' },
  { t: S('ven-why') + 0.25, type: 'pop', f: 820 },
  { t: at('ven-why', '二氧化碳') - 0.5, type: 'boing' },
  { t: at('ven-why', '温室效应'), type: 'stamp', shake: 10 },
  { t: at('mer-swing', '白天'), type: 'sizzle', d: 0.8 },
  { t: at('mer-swing', '夜里') - 0.2, type: 'wind', d: 1.2 },
  { t: S('mars-cold') - 0.2, type: 'pop' },
  { t: at('mars-cold', '153'), type: 'wind', d: 1.4 },
  { t: at('mars-cold', '阿嚏'), type: 'slam', shake: 16 },
];
