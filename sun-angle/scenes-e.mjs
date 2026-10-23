// Scene 8: side-by-side recap (same beans, bigger footprint, fewer per square), then the Sun's and 小宇's farewell.
import { W, C, S, E, at, prog, lerp, easeOut, pop, txt, around, card, arrow, talkLevel, burst, confetti } from './lib.mjs';
import { astronaut } from './cast.mjs';
import { title, tag, stamp } from './props.mjs';
import { sunBuddy } from './sun.mjs';
import { beamGeom, drawBeam, beanBatch, beanSlots, ground } from './beam.mjs';

const GY = 1010, SQ = 80, BW = 160;
const GA = beamGeom(250, GY, Math.PI / 2, BW, 360);
const GB = beamGeom(770, GY, Math.PI / 6, BW, 300);
const T_DROP = at('sum', '阳光') - 0.1;
const vFor = (g) => Math.max(...beanSlots(g).map((b) => b.L)) / (at('sum', '倾斜') + 0.2 - T_DROP);

const CHAIN = [['同样的能量', C.gold, '同样'], ['摊得越开', C.gas, '摊'], ['每平方米越少', C.pink, '平方米']];

function recapScene(ctx, t) {
  const t0 = S('sum'), tBye = S('sunBye'), tK = S('kidBye');
  const out = 1 - prog(t, tBye - 0.3, tBye + 0.2);
  title(ctx, t, t0, '记住！', '其他条件相同时', { size: 96, t1: tBye - 0.3 });
  if (out > 0) {
    ctx.save(); ctx.globalAlpha *= out;
    const heat = easeOut(prog(t, at('sum', '倾斜'), at('sum', '倾斜') + 0.6));
    ground(ctx, t, 60, 450, GY, SQ, 90, { lit1: GA.f1, lit2: GA.f2, heat });
    ground(ctx, t, 520, 1040, GY, SQ, 530, { lit1: GB.f1, lit2: GB.f2, heat: heat * 0.5 });
    const rv = easeOut(prog(t, t0 - 0.1, t0 + 0.8));
    drawBeam(ctx, t, GA, { reveal: rv, bar: 0 });
    drawBeam(ctx, t, GB, { reveal: rv, bar: 0 });
    beanBatch(ctx, t, GA, T_DROP, { r: 11, v: vFor(GA), landedMood: 'wow' });
    beanBatch(ctx, t, GB, T_DROP, { r: 13, v: vFor(GB) });
    const lp = pop(t, at('sum', '倾斜'), 0.45);
    around(ctx, 250, GY + 110, lp, lp, () => tag(ctx, 250, GY + 110, '接近垂直', '每格 4 颗', { color: '#ffb347', size: 40 }));
    around(ctx, 770, GY + 110, lp, lp, () => tag(ctx, 770, GY + 110, '更倾斜', '每格 2 颗', { color: '#ffe08a', size: 40 }));
    // the takeaway chain
    CHAIN.forEach(([s, col, w], i) => {
      const x = 190 + i * 350, p = pop(t, at('sum', w) - 0.1, 0.45);
      around(ctx, x, 1300, p, p, () => tag(ctx, x, 1300, s, null, { color: col, size: i === 2 ? 40 : 44 }));
      if (i > 0) arrow(ctx, x - 230 + (i === 2 ? 10 : 0), 1300, x - 140 + (i === 2 ? 10 : 0), 1300, { color: '#fff', w: 8, head: 24, p: easeOut(prog(t, at('sum', w) - 0.3, at('sum', w))) });
    });
    ctx.restore();
  }
  // farewell: the Sun in shades, then 小宇's takeaway
  title(ctx, t, tBye, '我可没偏心！', '是角度在分能量', { size: 88, color: C.gold, t1: tK - 0.2 });
  title(ctx, t, tK, '斜着照', '能量被摊薄啦！', { size: 96, color: C.gold });
  const sp = pop(t, tBye - 0.2, 0.6);
  if (sp > 0) {
    const y = lerp(820, 760, easeOut(prog(t, tK - 0.3, tK + 0.5)));
    around(ctx, 540, y, sp, sp, () => sunBuddy(ctx, t, 540, y, 210, {
      talk: talkLevel(t, ['sunBye']), mood: t > tK + 0.5 ? 'starry' : 'happy', look: Math.sin(t * 1.5) * 0.4,
      shades: easeOut(prog(t, at('sunBye', '角度') - 0.1, at('sunBye', '角度') + 0.3)),
    }));
  }
  const np = pop(t, at('kidBye', '摊薄') - 0.1, 0.5);
  stamp(ctx, 720, 1220, '摊薄啦！', np, { color: C.gold, size: 70 });
  const kp = easeOut(prog(t, tK - 0.5, tK + 0.3));
  if (kp > 0) astronaut(ctx, t, lerp(-150, 250, kp), lerp(1500, 1210, kp), 0.6, { talk: talkLevel(t, ['kidBye']), mood: 'starry', look: 1, lookY: -1, wave: 1 });
  burst(ctx, t, at('sunBye', '角度'), 540, 780, { n: 14, r: 320 });
  confetti(ctx, t, E('kidBye') - 0.2);
}

export const scenes = [
  { id: 'recap', from: S('sum') - 0.3, to: Infinity, draw: recapScene },
];

export const events = [
  { type: 'slam', t: S('sum') },
  { type: 'whoosh', t: T_DROP, d: 0.8, from: 1800, to: 400, amp: 0.35 },
  { type: 'pop', t: at('sum', '倾斜') + 0.15, f: 650 },
  ...CHAIN.map(([, , w], i) => ({ type: 'stamp', t: at('sum', w) - 0.1 })),
  { type: 'boing', t: S('sunBye') - 0.2 },
  { type: 'sparkle', t: at('sunBye', '角度') },
  { type: 'stamp', t: at('kidBye', '摊薄') - 0.1 },
  { type: 'confetti', t: E('kidBye') - 0.2 }, { type: 'tada', t: E('kidBye') - 0.1, amp: 1.2 },
];
