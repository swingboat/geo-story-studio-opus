// Scenes 7–8: the three-step route, then the Sun's farewell and 小宇's takeaway.
import { W, C, TAU, S, E, at, prog, lerp, clamp, easeOut, pop, txt, around, burst, card, arrow, confetti, talkLevel } from './lib.mjs';
import { astronaut, glow } from './cast.mjs';
import { title, tag, stamp } from './props.mjs';
import { sunBuddy, earthBuddy, lightWave } from './sun.mjs';

const INK = '#0a0828';

function sandIcon(ctx, t, x, y) {
  glow(ctx, x, y - 6, 0, 70, 'rgba(255,130,50,0.6)');
  ctx.fillStyle = '#f6c27f'; ctx.strokeStyle = INK; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.ellipse(x, y + 10, 66, 26, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,110,50,0.9)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    for (let k = 0; k < 5; k++) ctx.lineTo(x + i * 26 + Math.sin(k + t * 5 + i) * 6, y - 10 - k * 12);
    ctx.stroke();
  }
}

const STEPS = [
  ['1', '太阳辐射', '从太阳出发，带着能量', C.gold],
  ['2', '穿过太空', '电磁波不需要空气当媒介', C.sky],
  ['3', '地表吸收', '一部分被吸收 → 升温', '#ff9a4c'],
];

function sumScene(ctx, t) {
  const t0 = S('sum'), tBye = S('sunBye'), tK = S('kidBye');
  const show = [at('sum', '太阳辐射'), at('sum', '穿过太空'), at('sum', '部分被地表吸收')];
  const out = 1 - prog(t, tBye - 0.3, tBye + 0.2);
  title(ctx, t, t0, '记住这条路线', null, { size: 88, t1: tBye - 0.3 });
  title(ctx, t, tBye, '电磁波快递', '不用修路，照样送到', { size: 84, color: C.gold, t1: tK - 0.2 });
  title(ctx, t, tK, '阳光就是电磁波！', null, { size: 84, color: C.gold });
  STEPS.forEach(([n, a, b, col], i) => {
    const y = 520 + i * 260, p = pop(t, show[i] - 0.15, 0.5) * out;
    around(ctx, W / 2, y + 90, p, p, () => {
      card(ctx, 110, y, 860, 180, { fill: 'rgba(8,10,36,0.9)', edge: col, ew: 6, drop: 10 });
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(200, y + 90, 50, 0, TAU); ctx.fill();
      txt(ctx, n, 200, y + 92, { size: 60, color: INK, font: 'RoundB' });
      txt(ctx, a, 290, y + 62, { size: 58, color: '#fff', align: 'left' });
      txt(ctx, b, 290, y + 130, { size: 36, color: col, align: 'left' });
      if (i === 0) sunBuddy(ctx, t, 870, y + 90, 50, { faceA: 1, glowA: 0.6 });
      if (i === 1) lightWave(ctx, t, 800, y + 90, 940, y + 90, { amp: 16, wl: 44, w: 7 });
      if (i === 2) sandIcon(ctx, t, 870, y + 100);
    });
    if (i > 0) arrow(ctx, W / 2, y - 70, W / 2, y - 6, { color: C.gold, w: 10, head: 30, p: easeOut(prog(t, show[i] - 0.3, show[i])) * out });
  });
  // the takeaway in three keywords
  const kw = [['传播', C.sky], ['吸收', '#ff9a4c'], ['升温', C.no]];
  kw.forEach(([s, col], i) => {
    const p = pop(t, at('sum2', '温暖') + i * 0.18, 0.45) * out;
    around(ctx, 250 + i * 290, 1330, p, p, () => tag(ctx, 250 + i * 290, 1330, s, null, { color: col, size: 50 }));
  });
  // farewell: the Sun in shades, Earth basking, 小宇 cheering
  const sp = pop(t, tBye - 0.2, 0.6);
  if (sp > 0) {
    const y = lerp(820, 760, easeOut(prog(t, tK - 0.3, tK + 0.5)));
    around(ctx, 380, y, sp, sp, () => sunBuddy(ctx, t, 380, y, 200, {
      talk: talkLevel(t, ['sunBye']), mood: t > tK + 0.5 ? 'starry' : 'happy', look: 1, shades: easeOut(prog(t, tBye + 0.2, tBye + 0.6)),
    }));
    const wp = easeOut(prog(t, tBye + 0.3, tBye + 1.3));
    lightWave(ctx, t, 600, 860, 760, 1060, { p: wp, amp: 18, wl: 60, w: 9 });
    const ep = pop(t, tBye + 0.2, 0.5);
    around(ctx, 840, 1140, ep, ep, () => earthBuddy(ctx, t, 840, 1140, 110, {
      light: -2.3, lit: wp, look: -0.6, mood: 'starry', shades: easeOut(prog(t, at('sunBye', '照样') - 0.1, at('sunBye', '照样') + 0.3)),
    }));
    const np = pop(t, at('sunBye', '照样') - 0.1, 0.5) * (1 - prog(t, tK - 0.3, tK));
    stamp(ctx, W / 2, 1360, '照样送到！', np, { color: C.gold, size: 64 });
  }
  const kp = easeOut(prog(t, tK - 0.5, tK + 0.3));
  if (kp > 0) astronaut(ctx, t, lerp(-150, 230, kp), lerp(1500, 1230, kp), 0.6, { talk: talkLevel(t, ['kidBye']), mood: 'starry', look: 1, lookY: -1, wave: 1 });
  burst(ctx, t, at('kidBye', '电磁波'), 540, 330, { n: 14, r: 300 });
  confetti(ctx, t, E('kidBye') - 0.2);
}

export const scenes = [
  { id: 'sum', from: S('sum') - 0.3, to: Infinity, draw: sumScene },
];

export const events = [
  { type: 'slam', t: S('sum') },
  { type: 'stamp', t: at('sum', '太阳辐射') - 0.15 },
  { type: 'stamp', t: at('sum', '穿过太空') - 0.15 },
  { type: 'stamp', t: at('sum', '部分被地表吸收') - 0.15 },
  ...[0, 1, 2].map((i) => ({ type: 'note', t: at('sum2', '温暖') + i * 0.18, n: [72, 76, 79][i] })),
  { type: 'boing', t: S('sunBye') - 0.2 },
  { type: 'whoosh', t: S('sunBye') + 0.3, d: 1.0, from: 500, to: 2400, amp: 0.5 },
  { type: 'tada', t: at('sunBye', '照样') },
  { type: 'sparkle', t: at('kidBye', '电磁波') },
  { type: 'confetti', t: E('kidBye') - 0.2 }, { type: 'tada', t: E('kidBye') - 0.1, amp: 1.2 },
];
