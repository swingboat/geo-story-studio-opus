// Scenes 9–10: sunlight races to Earth, then the three-step answer and the Sun's farewell.
import { W, C, TAU, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, around, burst, card, arrow, confetti, talkLevel } from './lib.mjs';
import { astronaut, glow } from './cast.mjs';
import { title, tag, stamp } from './props.mjs';
import { sunBuddy, earthBuddy, helium, lightWave } from './sun.mjs';

const INK = '#0a0828';
const SUN = [250, 640], SR = 190, EARTH = [810, 1200], ER = 120;
const FAN = [-1.2, -0.6, 0, 0.45, 1.25, 1.75, 2.3, 2.9];

function clock(ctx, t, x, y) {
  ctx.save();
  ctx.fillStyle = '#fff'; ctx.strokeStyle = INK; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(x, y, 52, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = C.no; ctx.lineCap = 'round'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(t * 6) * 38, y + Math.sin(t * 6) * 38); ctx.stroke();
  ctx.strokeStyle = INK;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(t * 0.5) * 24, y + Math.sin(t * 0.5) * 24); ctx.stroke();
  ctx.restore();
}

function spaceScene(ctx, t) {
  const t0 = S('space'), tRad = at('space', '太阳辐射'), tMin = at('space', '八分钟'), tEarth = at('space', '地球');
  const tSmall = at('earth', '很小'), tLight = at('earth', '光和热'), tK = S('kidWarm');
  sunBuddy(ctx, t, SUN[0], SUN[1], SR, { mood: 'happy', look: 1, lookY: 1, talk: 0 });
  // waves fan out in every direction; only one is aimed at Earth
  const fp = prog(t, tRad - 0.3, tRad + 1.4);
  FAN.forEach((a, i) => {
    const p = clamp(fp * 1.2 - i * 0.03);
    lightWave(ctx, t + i, SUN[0] + Math.cos(a) * SR * 1.3, SUN[1] + Math.sin(a) * SR * 1.3, SUN[0] + Math.cos(a) * 620, SUN[1] + Math.sin(a) * 620,
      { p, amp: 12, wl: 60, w: 5, a: 0.45 - 0.25 * prog(t, tSmall - 0.2, tSmall + 0.3) });
  });
  title(ctx, t, t0, '出发！奔向太空', null, { size: 80, t1: S('earth') - 0.2 });
  title(ctx, t, S('earth'), '只有很小一部分到达地球', null, { size: 66 });
  const ang = Math.atan2(EARTH[1] - SUN[1], EARTH[0] - SUN[0]);
  const d = Math.hypot(EARTH[0] - SUN[0], EARTH[1] - SUN[1]);
  const hp = easeIO(prog(t, tRad - 0.1, tEarth + 0.2));
  lightWave(ctx, t, SUN[0] + Math.cos(ang) * SR * 1.3, SUN[1] + Math.sin(ang) * SR * 1.3, EARTH[0] - Math.cos(ang) * ER, EARTH[1] - Math.sin(ang) * ER,
    { p: hp, amp: 22, wl: 70, w: 10, color: '#fff27a' });
  const rp = pop(t, tRad, 0.45) * (1 - prog(t, tMin - 0.3, tMin));
  around(ctx, 700, 760, rp, rp, () => tag(ctx, 700, 760, '太阳辐射', '光和热，一路传向太空', { color: C.energy, size: 52 }), -0.05);
  // ~8 minutes
  const mp = pop(t, tMin - 0.1, 0.45) * (1 - prog(t, tSmall - 0.3, tSmall));
  const mx = SUN[0] + Math.cos(ang) * d * 0.55 + 120, my = SUN[1] + Math.sin(ang) * d * 0.55 - 70;
  around(ctx, mx, my, mp, mp, () => { clock(ctx, t, mx - 120, my); tag(ctx, mx + 40, my, '约 8 分钟', null, { color: C.sky, size: 48 }); });
  // Earth glows when the light arrives, puts on shades when it warms up
  const lit = prog(t, tEarth, tEarth + 0.6);
  const ep = pop(t, t0 + 0.2, 0.5);
  around(ctx, EARTH[0], EARTH[1], ep, ep, () => {
    if (lit > 0) glow(ctx, EARTH[0], EARTH[1], ER, ER * 2.2, `rgba(255,230,120,${0.35 * lit})`);
    earthBuddy(ctx, t, EARTH[0], EARTH[1], ER, { light: ang + Math.PI, lit, mood: t > tLight ? 'happy' : lit > 0 ? 'wow' : 'happy', look: -0.6, shades: easeOut(prog(t, tLight, tLight + 0.4)) });
  });
  const sp = pop(t, tSmall - 0.1, 0.45);
  if (sp > 0) {
    ctx.save(); ctx.globalAlpha *= sp;
    ctx.strokeStyle = C.mint; ctx.lineWidth = 6; ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 50;
    ctx.beginPath(); ctx.arc(EARTH[0], EARTH[1], ER + 40, 0, TAU); ctx.stroke();
    ctx.restore();
  }
  [['光', C.gold, 650, 1000], ['热', C.no, 980, 1040]].forEach(([s, col, x, y], i) => {
    const p = pop(t, tLight + i * 0.25, 0.45);
    around(ctx, x, y, p, p, () => tag(ctx, x, y + Math.sin(t * 3 + i) * 8, s, null, { color: col, size: 58 }));
  });
  // 小宇 basks in the warmth
  const kp = easeOut(prog(t, tK - 0.7, tK - 0.1));
  if (kp > 0) {
    astronaut(ctx, t, lerp(-150, 230, kp), 1290, 0.6, { talk: talkLevel(t, ['kidWarm']), mood: 'starry', look: 1, wave: 1 });
    for (let i = 0; i < 3; i++) {
      const y = 1100 - ((t * 60 + i * 40) % 120);
      ctx.strokeStyle = `rgba(255,170,80,${0.8 * kp})`; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let k = 0; k < 6; k++) ctx.lineTo(380 + i * 40 + Math.sin(k + t * 4) * 8, y - k * 14);
      ctx.stroke();
    }
  }
}

// ---------- the answer in three steps, then the farewell ----------
const STEPS = [
  ['1', '核心：核聚变', '氢核 → 氦核 + 能量', C.core],
  ['2', '向外传递', '辐射区 → 对流区 → 光球', C.rad],
  ['3', '太阳辐射', '一部分到达地球', C.sky],
];

function sumScene(ctx, t) {
  const t0 = S('sum'), tBye = S('sunBye'), tK = S('kidBye');
  const show = [at('sum', '核聚变'), at('sum2', '向外传递'), at('sum2', '到达地球')];
  const out = 1 - prog(t, tBye - 0.3, tBye + 0.2);
  title(ctx, t, t0, '答案来啦！', null, { size: 88, t1: tBye - 0.3 });
  title(ctx, t, tBye, '太阳还能亮多久？', null, { size: 78, t1: tK - 0.2 });
  title(ctx, t, tK, '原来是核聚变！', null, { size: 88, color: C.gold });
  STEPS.forEach(([n, a, b, col], i) => {
    const y = 560 + i * 260, p = pop(t, show[i] - 0.15, 0.5) * out;
    around(ctx, W / 2, y + 90, p, p, () => {
      card(ctx, 110, y, 860, 180, { fill: 'rgba(8,10,36,0.9)', edge: col, ew: 6, drop: 10 });
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(200, y + 90, 50, 0, TAU); ctx.fill();
      txt(ctx, n, 200, y + 92, { size: 60, color: INK, font: 'RoundB' });
      txt(ctx, a, 290, y + 62, { size: 58, color: '#fff', align: 'left' });
      txt(ctx, b, 290, y + 130, { size: 38, color: col, align: 'left' });
      if (i === 0) helium(ctx, t, 880, y + 90, 34);
      if (i === 2) earthBuddy(ctx, t, 880, y + 90, 46, { light: Math.PI, lit: 1 });
    });
    if (i > 0) arrow(ctx, W / 2, y - 70, W / 2, y - 6, { color: C.gold, w: 10, head: 30, p: easeOut(prog(t, show[i] - 0.3, show[i])) * out });
  });
  // farewell: the Sun returns with shades
  const sp = pop(t, tBye - 0.2, 0.6);
  if (sp > 0) {
    const y = lerp(880, 820, easeOut(prog(t, tK - 0.3, tK + 0.5)));
    around(ctx, W / 2, y, sp, sp, () => sunBuddy(ctx, t, W / 2, y, 240, {
      talk: talkLevel(t, ['sunBye']), mood: t > tK + 0.5 ? 'starry' : 'happy', shades: easeOut(prog(t, tBye + 0.2, tBye + 0.6)) * (1 - prog(t, tK + 0.3, tK + 0.6)),
    }));
    const np = pop(t, at('sunBye', '五十亿年') - 0.1, 0.5) * (1 - prog(t, tK - 0.3, tK));
    stamp(ctx, W / 2, 1250, '还能亮约 50 亿年', np, { color: C.gold, size: 70 });
  }
  const kp = easeOut(prog(t, tK - 0.5, tK + 0.3));
  if (kp > 0) astronaut(ctx, t, lerp(-150, 200, kp), lerp(1500, 1260, kp), 0.62, { talk: talkLevel(t, ['kidBye']), mood: 'starry', look: 1, lookY: -1, wave: 1 });
  confetti(ctx, t, E('kidBye') - 0.2);
}

export const scenes = [
  { id: 'space', from: S('space') - 0.3, to: S('sum') - 0.3, draw: spaceScene },
  { id: 'sum', from: S('sum') - 0.3, to: Infinity, draw: sumScene },
];

export const events = [
  { type: 'whoosh', t: at('space', '太阳辐射') - 0.3, d: 1.2, from: 400, to: 3000, amp: 0.7 },
  { type: 'tick', t: at('space', '八分钟'), n: 84 }, { type: 'tick', t: at('space', '八分钟') + 0.25, n: 86 },
  { type: 'ding', t: at('space', '地球') + 0.2, n: 88 },
  { type: 'pop', t: at('earth', '很小') - 0.1, f: 900 },
  { type: 'note', t: at('earth', '光和热'), n: 79 }, { type: 'note', t: at('earth', '光和热') + 0.25, n: 84 },
  { type: 'sparkle', t: S('kidWarm') },
  { type: 'slam', t: S('sum') },
  { type: 'stamp', t: at('sum', '核聚变') - 0.15 },
  { type: 'stamp', t: at('sum2', '向外传递') - 0.15 },
  { type: 'stamp', t: at('sum2', '到达地球') - 0.15 },
  { type: 'boing', t: S('sunBye') - 0.2 },
  { type: 'tada', t: at('sunBye', '五十亿年') },
  { type: 'confetti', t: E('kidBye') - 0.2 }, { type: 'tada', t: E('kidBye') - 0.1, amp: 1.2 },
];
