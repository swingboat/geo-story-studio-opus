// Scenes D: gravity holds an atmosphere → Venus brags about 90×+ pressure but it's CO2 → Earth's air today is mostly N2 + O2 (some microbes need no O2) → level 2.
import { C, NUM, SANS, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, card, around, arrow, burst, talkLevel, rand } from './lib.mjs';
import { planet, glow } from './bodies.mjs';
import { molecule, gauge, bubble, microbe, chip, levelTitle, levelPass, checkBadge } from './props.mjs';

const TAU = Math.PI * 2;

// ---------- gravity gathers gas into an atmosphere ----------
function gravity(ctx, t) {
  const tL = at('atm', '第二关'), tM = at('atm', '质量'), tG = at('atm', '引力'), tGas = at('atm', '气体');
  levelTitle(ctx, '二', '大气', C.air, pop(t, tL - 0.1, 0.4), 330);
  const EX = 540, EY = 860, ER = 180;
  const pull = easeIO(prog(t, tG - 0.1, tGas + 0.9));
  glow(ctx, EX, EY, ER, ER + 90, `rgba(110,200,255,${0.5 * pull})`);
  for (let i = 0; i < 26; i++) {
    const a0 = rand(i) * TAU, r0 = 380 + rand(i + 40) * 160, r1 = ER + 22 + rand(i + 80) * 60;
    const a = a0 + t * (0.15 + 0.25 * pull) * (i % 2 ? 1 : -1) * 0.6;
    const r = lerp(r0, r1, pull);
    molecule(ctx, EX + Math.cos(a) * r, EY + Math.sin(a) * r * 0.95, i % 5 === 0 ? 'O2' : 'N2', 11, a * 2 + t);
  }
  planet(ctx, t, '地球', EX, EY, ER, { face: true, mood: pull > 0.6 ? 'proud' : 'happy', light: -0.8 });
  // gravity arrows pointing inward
  const ga = easeOut(prog(t, tG - 0.2, tG + 0.4)) * (1 - prog(t, tGas + 0.6, tGas + 1.1));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * TAU + 0.2;
    arrow(ctx, EX + Math.cos(a) * 430, EY + Math.sin(a) * 430, EX + Math.cos(a) * (ER + 40), EY + Math.sin(a) * (ER + 40), { color: `rgba(255,201,60,${0.85 * ga})`, w: 8, head: 26, p: ga });
  }
  const mp = pop(t, tM - 0.1, 0.4);
  around(ctx, 540, 1240, mp, mp, () => {
    card(ctx, 170, 1190, 740, 100, { fill: 'rgba(10,12,44,0.92)', edge: C.gold, ew: 5, drop: 0, r: 50 });
    txt(ctx, '质量、体积适中 → 引力', 540, 1242, { size: 54, color: C.gold });
  });
}

// ---------- Venus: lots of air, wrong air → Earth's mix today ----------
function breathe(ctx, t) {
  const tB = S('ven-brag'), tP = at('ven-brag', '90'), tR = S('e-reply'), tCO = at('e-reply', '二氧化碳'), tNo = at('e-reply', '呼吸');
  const tMix = S('atm-mix'), tEvo = at('atm-mix', '漫长演化'), tNO = at('atm-mix', '氮'), tOk = at('atm-mix', '适合生物呼吸'), tMic = at('atm-mix', '微生物');
  // part 1: Venus + pressure gauge, Earth answers
  const p1 = 1 - prog(t, tMix - 0.3, tMix + 0.1);
  if (p1 > 0) {
    ctx.save(); ctx.globalAlpha *= p1;
    const vp = pop(t, tB - 0.2, 0.45);
    around(ctx, 300, 640, vp, vp, () => {
      glow(ctx, 300, 640, 150, 260, 'rgba(230,180,90,0.45)');
      for (let i = 0; i < 12; i++) {
        const a = rand(i) * TAU + t * 0.25, d = 170 + rand(i + 3) * 60;
        molecule(ctx, 300 + Math.cos(a) * d, 640 + Math.sin(a) * d, 'CO2', 11, a + t);
      }
      planet(ctx, t, '金星', 300, 640, 150, { face: true, mood: t > tNo ? 'wow' : 'proud', talk: talkLevel(t, ['ven-brag']), light: Math.PI * 1.2, tint: 'rgba(255,90,30,0.2)' });
    });
    const gp = pop(t, tP - 0.4, 0.4);
    around(ctx, 790, 610, gp, gp, () => {
      gauge(ctx, 790, 610, 180, 0.93 * easeOut(prog(t, tP - 0.1, tP + 0.9)) + 0.02 * Math.sin(t * 30) * prog(t, tP + 0.6, tP + 0.8), { marks: [[0, '0'], [0.5, '50'], [1, '100']] });
      txt(ctx, '地面气压（地球=1）', 790, 395, { size: 40, font: SANS, color: 'rgba(255,255,255,0.85)' });
      card(ctx, 640, 820, 300, 76, { fill: C.fire, edge: C.white, ew: 4, drop: 0, r: 38 });
      txt(ctx, '地球的90多倍', 790, 860, { size: 42, color: C.white });
    });
    const cp = pop(t, tCO - 0.1, 0.4);
    around(ctx, 300, 900, cp, cp, () => {
      card(ctx, 150, 860, 300, 80, { fill: 'rgba(10,12,44,0.92)', edge: C.co2, ew: 5, drop: 0, r: 40 });
      txt(ctx, 'CO₂为主', 300, 902, { size: 46, color: C.co2 });
    });
    const ep = pop(t, tR - 0.2, 0.45);
    around(ctx, 720, 1150, ep, ep, () => {
      planet(ctx, t, '地球', 720, 1150, 120, { face: true, mood: 'happy', talk: talkLevel(t, ['e-reply']), light: -0.8 });
    });
    const np = pop(t, tNo - 0.1, 0.4);
    around(ctx, 330, 1130, np, np, () => {
      card(ctx, 130, 1070, 400, 120, { fill: C.cream, edge: C.no, ew: 6, drop: 8, r: 30 });
      checkBadge(ctx, 200, 1130, 38, C.no, false);
      txt(ctx, '人没法呼吸', 360, 1132, { size: 50, color: C.ink });
    });
    ctx.restore();
  }
  // part 2: Earth's air today — donut chart
  const p2 = fadeIn(t, tMix - 0.1, 0.4);
  if (p2 <= 0) return;
  ctx.save(); ctx.globalAlpha *= p2;
  const ev = pop(t, tEvo - 0.1, 0.4);
  around(ctx, 540, 330, ev, ev, () => {
    card(ctx, 150, 285, 780, 90, { fill: 'rgba(10,12,44,0.92)', edge: C.air, ew: 5, drop: 0, r: 45 });
    txt(ctx, '漫长演化', 340, 332, { size: 46, color: 'rgba(255,255,255,0.75)' });
    arrow(ctx, 470, 332, 590, 332, { color: C.air, w: 7, head: 22 });
    txt(ctx, '现今地球大气', 760, 332, { size: 46, color: C.air });
  });
  const DX = 360, DY = 790, R0 = 140, R1 = 240;
  const parts = [[0.78, '#5b8cff', '氮', '78%', 'N2'], [0.21, '#ff5a5a', '氧', '21%', 'O2'], [0.01, '#b8bccc', '其他', '1%']];
  const grow = easeOut(prog(t, tNO - 0.3, tNO + 0.9));
  let a = -Math.PI / 2;
  for (const [f, col] of parts) {
    const a2 = a + f * TAU * grow;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(DX, DY, R1, a, a2); ctx.arc(DX, DY, R0, a2, a, true); ctx.closePath(); ctx.fill();
    a = a2;
  }
  planet(ctx, t, '地球', DX, DY, R0 - 18, { face: true, mood: 'happy', light: -0.8 });
  parts.forEach(([, col, name, pct, mol], i) => {
    const q = pop(t, tNO + 0.2 + i * 0.25, 0.4);
    around(ctx, 800, 650 + i * 130, q, q, () => {
      card(ctx, 650, 600 + i * 130, 330, 100, { fill: 'rgba(10,12,44,0.9)', edge: col, ew: 5, drop: 0, r: 30 });
      if (mol) molecule(ctx, 705, 650 + i * 130, mol, 14);
      else { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(705, 650 + i * 130, 16, 0, TAU); ctx.fill(); }
      txt(ctx, name, 790, 652 + i * 130, { size: 48, color: col });
      txt(ctx, pct, 905, 652 + i * 130, { size: 46, font: NUM, color: C.white });
    });
  });
  // footnote: some microbes don't need oxygen
  const mp = pop(t, tMic - 0.2, 0.45);
  around(ctx, 540, 1150, mp, mp, () => {
    card(ctx, 110, 1090, 860, 120, { fill: C.cream, edge: '#8be08b', ew: 6, drop: 8, r: 34 });
    microbe(ctx, t, 200, 1150, 42);
    txt(ctx, '有些微生物不需要氧气', 590, 1152, { size: 54, color: C.ink });
  });
  levelPass(ctx, t, '二', '适合生物呼吸的大气', C.air, pop(t, tOk - 0.2, 0.4), tOk + 0.4, 1340);
  burst(ctx, t, tOk + 0.4, 540, 1340, { n: 12, r: 400 });
  ctx.restore();
}

export const scenes = [
  { from: S('atm') - 0.2, to: S('ven-brag') - 0.2, draw: gravity },
  { from: S('ven-brag') - 0.2, to: S('water') - 0.2, draw: breathe },
];

export const events = [
  { t: at('atm', '第二关') - 0.1, type: 'note', n: 74 },
  { t: at('atm', '引力') - 0.2, type: 'whoosh', from: 2400, to: 400, d: 1.0 },
  { t: at('atm', '质量') - 0.1, type: 'pop' },
  { t: S('ven-brag') - 0.2, type: 'boing' },
  { t: at('ven-brag', '90') - 0.1, type: 'alarm' },
  { t: S('e-reply') - 0.2, type: 'pop', f: 820 },
  { t: at('e-reply', '呼吸') - 0.1, type: 'buzz' },
  { t: S('atm-mix') - 0.1, type: 'whoosh' },
  { t: at('atm-mix', '氮') - 0.3, type: 'scribble', d: 1.0 },
  { t: at('atm-mix', '适合生物呼吸') + 0.4, type: 'tada' },
  { t: at('atm-mix', '微生物') - 0.2, type: 'boing' },
];
