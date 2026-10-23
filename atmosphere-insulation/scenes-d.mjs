// Scenes 9–12: "so the Earth stops losing heat?" → no: Earth still radiates to space, temperature follows income vs
// expense → recap checklist → Doudou bundles up for a clear winter night.
import {
  C, S, E, at, prog, lerp, clamp, easeOut, pop, fadeIn,
  txt, card, around, arrow, burst, confetti, talkLevel,
} from './lib.mjs';
import { hiker, groundBody, sun, buddy, tick } from './chars.mjs';
import { irWave, thermo, disclaimer } from './props.mjs';
import { ATM, OUTC, moon, quilt, earth, cloudBuddy, banner, verdict } from './night.mjs';

const GY = 1130;

// ---------- scene 9: the quilt does not stop heat loss ----------
function kidScene(ctx, t) {
  const tAsk = S('kidStop'), tNo = at('noStop', '当然不是'), tNe = at('noStop', '不等于');
  moon(ctx, t, 820, 660, 52, { mood: 'happy' });
  quilt(ctx, t, 70, 910, GY + 10, 400, 1);
  // heat keeps leaving through the quilt
  for (let i = 0; i < 3; i++) {
    const x = 330 + i * 170, ph = (t * 0.5 + i * 0.33) % 1;
    irWave(ctx, t, x, GY - 30, x, GY - 30 - 620, 0.25 + 0.75 * ph, { alpha: Math.sin(Math.PI * ph) * fadeIn(t, tNo, 0.4), amp: 11, w: 7, dash: [18, 12] });
  }
  groundBody(ctx, t, 60, 920, GY, 125, { heat: 0.35, face: [560, GY + 70], faceR: 70, shimmer: 0 });
  hiker(ctx, t, 200, GY, 0.5, { talk: talkLevel(t, ['kidStop']), point: 1, mood: 'happy' });
  const bp = pop(t, tAsk + 0.2, 0.4) * (1 - prog(t, tNo - 0.1, tNo + 0.1));
  around(ctx, 420, 830, bp, bp, () => {
    card(ctx, 250, 770, 360, 120, { fill: C.cream, ew: 0, r: 40, drop: 8 });
    txt(ctx, '不散热啦?', 430, 830, { size: 54, color: C.ink });
  });
  const xp = pop(t, tNo, 0.35);
  around(ctx, 470, 830, xp, xp, () => verdict(ctx, 470, 830, 1.6, false));
  banner(ctx, t, '保温 ≠ 停止散热', 470, 580, tNe - 0.1, 1e9, { size: 54, fill: C.no, color: C.white });
  around(ctx, 700, 1010, 1, fadeIn(t, tNo + 0.4, 0.4), () => txt(ctx, '热红外照样往外跑', 700, 1010, { size: 34, color: C.ir, stroke: C.space, sw: 7 }));
}

// ---------- scene 10: the whole Earth: income vs expense ----------
const EX = 470, EYc = 960, ER = 165;
function earthScene(ctx, t) {
  const tEarth = at('noStop', '地球'), tSpace = at('noStop', '太空'), tBud = S('budget');
  const tIn = at('budget', '收入'), tOut = at('budget', '支出');
  const zp = easeOut(prog(t, tEarth - 0.3, tEarth + 0.5));
  banner(ctx, t, '地球一直在向太空散热', 470, 580, tEarth - 0.1, tBud - 0.1, { size: 46, fill: OUTC });
  banner(ctx, t, '温度怎么变？看收支', 470, 580, tBud - 0.05, 1e9, { size: 50, fill: C.gold });
  around(ctx, EX, EYc, lerp(2.4, 1, zp), zp, () => earth(ctx, t, EX, EYc, ER, { mood: 'happy' }));
  // expense: infrared to space, leaving all around the planet
  const op = fadeIn(t, tSpace - 0.3, 0.5);
  [-0.5, 0.15, 0.8, -1.3, 2.4, 3.2].forEach((a, i) => {
    const ph = (t * 0.45 + i * 0.17) % 1;
    const x1 = EX + Math.cos(a) * (ER + 25), y1 = EYc + Math.sin(a) * (ER + 25);
    const L = i < 3 ? 200 : 150;
    irWave(ctx, t, x1, y1, x1 + Math.cos(a) * L, y1 + Math.sin(a) * L, 0.3 + 0.7 * ph, { color: OUTC, alpha: op * Math.sin(Math.PI * ph), amp: 9, w: 7, lambda: 46 });
  });
  // income: absorbed sunlight, a separate arrow from the sun
  const ip = easeOut(prog(t, tIn - 0.2, tIn + 0.5));
  if (ip > 0) {
    sun(ctx, t, 150, 690, 60 * pop(t, tIn - 0.3, 0.4), { mood: 'happy' });
    arrow(ctx, 230, 760, EX - ER * 0.72, EYc - ER * 0.72, { color: C.gold, w: 18, head: 46, p: ip });
  }
  const lp = pop(t, tIn + 0.1, 0.4);
  around(ctx, 200, 1180, lp, lp, () => {
    card(ctx, 60, 1128, 300, 104, { fill: 'rgba(10,22,60,0.92)', edge: C.gold, ew: 5, r: 26, drop: 0 });
    txt(ctx, '收入', 210, 1160, { size: 38, color: C.gold });
    txt(ctx, '吸收的太阳辐射', 210, 1204, { size: 32, color: C.white });
  });
  const xp = pop(t, tOut + 0.1, 0.4);
  around(ctx, 760, 1180, xp, xp, () => {
    card(ctx, 560, 1128, 350, 104, { fill: 'rgba(10,22,60,0.92)', edge: OUTC, ew: 5, r: 26, drop: 0 });
    txt(ctx, '支出', 735, 1160, { size: 38, color: OUTC });
    txt(ctx, '射向太空的热红外', 735, 1204, { size: 32, color: C.white });
  });
  // a thermometer that could go either way
  const tp = fadeIn(t, tBud, 0.4);
  if (tp > 0) {
    ctx.save(); ctx.globalAlpha *= tp;
    thermo(ctx, 830, 900, 200, 0.5 + 0.25 * Math.sin(t * 2.2));
    txt(ctx, '↑↓', 830, 660, { size: 50, color: C.gold, stroke: C.space, sw: 8 });
    ctx.restore();
  }
  disclaimer(ctx, 1290, fadeIn(t, tIn, 0.4));
}

// ---------- scene 11: recap checklist ----------
const ROWS = [
  { text: '大气吸收一部分热红外', key: ['recap', '吸收'], icon: 'absorb' },
  { text: '大气向地面发出逆辐射', key: ['recap', '逆辐射'], icon: 'counter' },
  { text: '减少地面净散热 = 保温', key: ['recap', '保温'], icon: 'keep' },
  { text: '地球仍在散热，冷暖看收支', key: ['recap2', '散热'], icon: 'earth' },
];

function rowIcon(ctx, t, kind, x, y) {
  if (kind === 'absorb') { irWave(ctx, t, x - 20, y + 45, x - 5, y + 5, 1, { amp: 6, lambda: 26, w: 5, head: false }); buddy(ctx, t, x, y - 10, 26, { kind: 'vapor', jiggle: 0.5 }); }
  else if (kind === 'counter') { cloudBuddy(ctx, t, x, y - 22, 0.35, { glowK: 0.6 }); irWave(ctx, t, x, y + 2, x, y + 48, 1, { color: ATM, amp: 6, lambda: 22, w: 5 }); }
  else if (kind === 'keep') { quilt(ctx, t, x - 50, x + 50, y + 35, 70, 1); ctx.save(); ctx.fillStyle = C.soil; ctx.fillRect(x - 50, y + 35, 100, 16); ctx.restore(); }
  else earth(ctx, t, x, y, 40, { face: false });
}

function recapScene(ctx, t) {
  banner(ctx, t, '一句话总结', 470, 580, S('recap') - 0.1, 1e9, { size: 50, fill: C.gold });
  ROWS.forEach((r, i) => {
    const tk = at(...r.key), y = 720 + i * 150;
    const p = pop(t, tk - 0.25, 0.45);
    around(ctx, 490, y, p, p, () => {
      card(ctx, 80, y - 62, 820, 124, { fill: 'rgba(10,22,60,0.92)', edge: i === 3 ? OUTC : C.gold, ew: 5, r: 30, drop: 0 });
      rowIcon(ctx, t, r.icon, 160, y);
      txt(ctx, r.text, 240, y + 2, { size: 44, color: C.white, align: 'left' });
      const k = prog(t, tk + 0.15, tk + 0.5);
      if (k > 0) around(ctx, 860, y - 50, pop(k, 0, 1), 1, () => tick(ctx, 860, y - 50, 0.7));
    });
  });
  burst(ctx, t, at('recap2', '收支'), 490, 1170, { r: 320, n: 14 });
}

// ---------- scene 12: Doudou bundles up ----------
function finaleScene(ctx, t) {
  const tGot = S('cta'), tWear = at('cta', '多穿');
  moon(ctx, t, 790, 680, 58, { mood: 'happy' });
  cloudBuddy(ctx, t, 260, 720, 0.75, { glowK: 0.4 });
  groundBody(ctx, t, 60, 940, GY, 125, { heat: 0.35, face: [660, GY + 70], faceR: 70, shimmer: 0, mood: 'happy' });
  const wear = prog(t, tWear - 0.1, tWear + 0.4);
  const jump = Math.abs(Math.sin(Math.PI * prog(t, tGot, tGot + 0.5))) * 50;
  around(ctx, 400, GY - 150, lerp(1, 1.12, wear), 1, () => hiker(ctx, t, 400, GY - jump, 0.72, { talk: talkLevel(t, ['cta']), point: t > tGot + 0.6 ? 1 : 0, coat: wear, mood: 'happy' }));
  burst(ctx, t, tWear + 0.2, 400, GY - 200, { r: 260, n: 12, colors: [C.sky, C.gold, C.pink] });
  const gp = pop(t, tGot - 0.1, 0.4);
  around(ctx, 690, 900, gp, gp, () => {
    card(ctx, 560, 840, 260, 110, { fill: C.cream, ew: 0, r: 40, drop: 8 });
    txt(ctx, '懂了!', 690, 896, { size: 60, color: C.ok });
  });
  banner(ctx, t, '晴朗冬夜，记得多穿一件！', 470, 580, tWear - 0.2, 1e9, { size: 46, fill: C.gold });
  confetti(ctx, t, E('cta') - 0.2, 120);
}

export const scenes = [
  { from: S('kidStop') - 0.3, to: at('noStop', '地球') - 0.3, draw: kidScene },
  { from: at('noStop', '地球') - 0.3, to: S('recap') - 0.3, draw: earthScene },
  { from: S('recap') - 0.3, to: S('cta') - 0.3, draw: recapScene },
  { from: S('cta') - 0.3, to: 999, draw: finaleScene },
];

export const events = [
  { type: 'whoosh', t: S('kidStop') - 0.3, d: 0.4 },
  { type: 'boing', t: S('kidStop') + 0.2, amp: 0.6 },
  { type: 'buzz', t: at('noStop', '当然不是'), shake: 10 },
  { type: 'stamp', t: at('noStop', '不等于') - 0.1 },
  { type: 'whoosh', t: at('noStop', '地球') - 0.3, d: 0.8, from: 2800, to: 300 },
  { type: 'wobble', t: at('noStop', '太空') - 0.3, d: 1.6, f: 600, rate: 6, amp: 0.3 },
  { type: 'pop', t: S('budget') - 0.05, f: 800 },
  { type: 'ding', t: at('budget', '收入') + 0.1, n: 84 },
  { type: 'note', t: at('budget', '支出') + 0.1, n: 72 },
  { type: 'whoosh', t: S('recap') - 0.3, d: 0.4 },
  ...ROWS.map((r, i) => ({ type: 'tick', t: at(...r.key) + 0.15, n: 79 + i * 3 })),
  { type: 'tada', t: at('recap2', '收支'), amp: 0.7 },
  { type: 'whoosh', t: S('cta') - 0.3, d: 0.4 },
  { type: 'boing', t: S('cta'), amp: 0.7 },
  { type: 'sparkle', t: at('cta', '多穿') + 0.2 },
  { type: 'confetti', t: E('cta') - 0.2 },
];
