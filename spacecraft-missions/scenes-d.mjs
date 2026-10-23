// Scenes 14–15: badges get filled in (recap) → "don't judge by looks": ask where it goes and what it does → call to action.
import { W, C, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, txt, around, burst, card, talkLevel, confetti } from './lib.mjs';
import { kid } from './chars.mjs';
import { tiangong, beidou, lander } from './craft.mjs';
import { banner, bubble, badge } from './props.mjs';
import { ICONS, BADGES } from './scenes-a.mjs';

// ---------- scene 14: every badge gets its workplace and its job ----------
const SPOTS = { tg: [310, 680], bd: [730, 900], ce: [310, 1120] };
function recapScene(ctx, t) {
  const t0 = S('recap');
  const jobs = { tg: ['绕地球飞', '在轨实验'], bd: ['天+地+你', '导航授时'], ce: ['月球往返', '探月采样'] };
  ['tg', 'bd', 'ce'].forEach((k, i) => {
    const [x, y] = SPOTS[k];
    const [place, job] = jobs[k];
    const tJob = at('recap', job);
    badge(ctx, t, x, y, 0.82, {
      ...BADGES[k], icon: ICONS[k], tIn: t0 - 0.3 + i * 0.12,
      rows: [['地点', place, t0 + 0.4 + i * 0.25], ['任务', job, tJob]],
    });
    burst(ctx, t, tJob + 0.05, x + 90, y + 20, { r: 200, n: 10 });
  });
  banner(ctx, t, '三个任务关键词', 790, 600, t0, 1e9, { size: 44, fill: C.mint });
}

// ---------- scene 15: look past the shape — where does it go, what does it do? ----------
function outroScene(ctx, t) {
  const tLooks = at('kidGet', '长相'), tWhere = at('outro', '哪里'), tWhat = at('outro', '什么任务'), tCta = S('cta');
  const tCom = at('cta', '评论区');
  // three crafts parade along the top
  const crafts = [
    [230, 700, (x, y, o) => tiangong(ctx, t, x, y, 0.36, o)],
    [540, 640, (x, y, o) => beidou(ctx, t, x, y, 0.6, o)],
    [850, 790, (x, y, o) => lander(ctx, t, x, y + 110, 0.55, o)],
  ];
  crafts.forEach(([x, y, draw], i) => {
    const p = pop(t, S('kidGet') - 0.3 + i * 0.12, 0.45);
    around(ctx, x, y, p, 1, () => draw(x, y + Math.sin(t * 2 + i) * 10, { mood: t > tCta ? 'starry' : t > tLooks ? 'wink' : 'happy', wave: t > tCta ? 1 : 0 }));
  });
  // "长相" label gets struck out
  const lp = pop(t, tLooks - 0.2, 0.4);
  around(ctx, 540, 900, lp, 1 - prog(t, S('outro'), S('outro') + 0.3), () => {
    card(ctx, 380, 860, 320, 84, { fill: C.cream, ew: 0, r: 42, drop: 6 });
    txt(ctx, '只看长相？', 540, 903, { size: 44, color: C.ink });
    const sp = easeOut(prog(t, tLooks + 0.2, tLooks + 0.5));
    ctx.strokeStyle = C.no; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(400, 905); ctx.lineTo(lerp(400, 680, sp), 905); ctx.stroke();
  });
  // two question cards
  [['去哪里？', '轨道 · 月球 …', tWhere, 290, C.tg], ['做什么？', '实验 · 导航 · 采样 …', tWhat, 790, C.ce]].forEach(([q, sub, tq, x, col], i) => {
    const p = pop(t, tq - 0.2, 0.45);
    around(ctx, x, 965, p, 1, () => {
      card(ctx, x - 220, 870, 440, 190, { fill: col, edge: C.ink, ew: 5, r: 36, drop: 12 });
      txt(ctx, q, x, 940, { size: 66, color: C.space });
      txt(ctx, sub, x, 1012, { size: 30, color: 'rgba(11,20,51,0.75)' });
    }, (i ? 1 : -1) * 0.05);
  });
  const kp = easeOut(prog(t, S('kidGet') - 0.4, S('kidGet') + 0.2));
  kid(ctx, t, lerp(-150, 150, kp), 1290, 0.55, { talk: talkLevel(t, ['kidGet']), point: t > tCta ? 1 : 0, jump: prog(t, tCom, tCom + 0.5), mood: t > tCta ? 'starry' : 'happy' });
  // call to action: a comment bubble
  const cp = pop(t, tCom - 0.2, 0.45);
  around(ctx, 690, 1220, cp, 1, () => {
    card(ctx, 470, 1180, 440, 84, { fill: C.gold, ew: 0, r: 42, drop: 8 });
    txt(ctx, '评论区告诉我！', 690, 1223, { size: 42, color: C.space });
  });
  if (t > tCom) confetti(ctx, t, tCom + 0.1, 120);
}

export const scenes = [
  { from: S('recap') - 0.4, to: S('kidGet') - 0.3, draw: recapScene },
  { from: S('kidGet') - 0.3, to: 1e9, draw: outroScene },
];

export const events = [
  { type: 'whoosh', t: S('recap') - 0.4, d: 0.4 },
  { type: 'pop', t: S('recap') + 0.4, f: 700 },
  { type: 'pop', t: S('recap') + 0.65, f: 800 },
  { type: 'pop', t: S('recap') + 0.9, f: 900 },
  { type: 'stamp', t: at('recap', '在轨实验'), shake: 6 },
  { type: 'stamp', t: at('recap', '导航授时'), shake: 6 },
  { type: 'stamp', t: at('recap', '探月采样'), shake: 6 },
  { type: 'whoosh', t: S('kidGet') - 0.3, d: 0.4 },
  { type: 'scribble', t: at('kidGet', '长相') + 0.2, d: 0.35 },
  { type: 'boing', t: at('outro', '哪里') - 0.2, amp: 0.7 },
  { type: 'boing', t: at('outro', '什么任务') - 0.2, amp: 0.7 },
  { type: 'tada', t: at('cta', '评论区') },
  { type: 'confetti', t: at('cta', '评论区') + 0.1 },
];
