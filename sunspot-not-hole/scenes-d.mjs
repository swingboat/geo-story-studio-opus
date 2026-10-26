// Scene 7: why the spot is cooler — convection carries heat up; a strong magnetic field holds it down (抑制对流).
import { C, S, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, around, talkLevel, arrow } from './lib.mjs';
import { astronaut } from './cast.mjs';
import { title, tag } from './props.mjs';
import { sunspot, granules, convection, fieldLoops } from './spot.mjs';
import { hand, label } from './gear.mjs';

const BOX = [90, 700, 900, 450];
const SURF = 700, MID = 540;

function chain(ctx, t, y, items) {
  const w = 214, gap = 14, x0 = 540 - (items.length * w + (items.length - 1) * gap) / 2;
  items.forEach(([s, col, t0], i) => {
    const p = pop(t, t0, 0.45);
    const x = x0 + i * (w + gap) + w / 2;
    around(ctx, x, y, p, p, () => {
      ctx.fillStyle = 'rgba(8,10,36,0.9)';
      ctx.beginPath(); ctx.roundRect(x - w / 2, y - 56, w, 112, 24); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.stroke();
      const lines = s.split('\n');
      lines.forEach((l, k) => txt(ctx, l, x, y + (k - (lines.length - 1) / 2) * 42, { size: 36, color: col }));
    });
    if (i > 0 && p > 0) arrow(ctx, x - w / 2 - gap - 4, y, x - w / 2 + 2, y, { color: '#fff', w: 5, head: 14, p: clamp(p) });
  });
}

function soupScene(ctx, t) {
  const t0 = S('whyCool'), tSoup = S('soup'), tUp = at('soup', '往上翻'), tSend = at('soup', '送到表面');
  const tMag = at('mag', '磁场'), tHand = at('mag', '看不见的手'), tPress = at('mag', '按住'), tTerm = S('term');
  title(ctx, t, t0 - 0.1, '为什么偏偏这块更冷？', null, { size: 76, t1: tSoup - 0.15 });
  title(ctx, t, tSoup, '光球下面：一锅沸腾的“汤”', null, { size: 66, t1: tTerm - 0.15 });
  title(ctx, t, tTerm, '强磁场  抑制对流', '教材说法', { size: 84, color: C.gold, subColor: C.sky });

  const [x, y, w, h] = BOX;
  const boxA = pop(t, t0 + 0.2, 0.5);
  const calm = easeIO(prog(t, tPress - 0.2, tPress + 0.8));
  around(ctx, MID, y + h / 2, boxA, boxA, () => {
    convection(ctx, t, x, y, w, h, { spotX: MID, calm, n: 5, hot: fadeIn(t, tUp, 0.5) });
    // the surface (photosphere) seen edge-on, darkening over the calmed cell
    granules(ctx, t, x, SURF - 26, w, 34, { cell: 30, r: 12 });
    sunspot(ctx, MID, SURF - 9, 150 * calm, { squash: 0.13, seed: 3 });
    ctx.strokeStyle = C.gold; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.roundRect(x, SURF - 26, w, h + 26, 28); ctx.stroke();
    const sa = fadeIn(t, tSend - 0.3, 0.4);
    if (sa > 0) {
      ctx.save(); ctx.globalAlpha *= sa;
      label(ctx, '光球', x + 80, SURF - 60, { size: 40, color: C.gold });
      label(ctx, '热量往上送', x + 180, y + h - 40, { size: 38, color: '#fff3c8' });
      ctx.restore();
    }
  });

  // magnetic field bundle threading the spot, and the invisible hand pressing the soup down
  fieldLoops(ctx, t, MID, SURF - 10, 160, { p: easeOut(prog(t, tMag - 0.3, tMag + 0.9)), depth: h - 20 });
  const ma = fadeIn(t, tMag + 0.2, 0.4) * (1 - prog(t, tTerm + 0.2, tTerm + 0.5));
  if (ma > 0) { ctx.save(); ctx.globalAlpha *= ma; label(ctx, '强磁场', MID + 250, SURF - 170, { size: 46, color: C.sky }); ctx.restore(); }
  const ha = fadeIn(t, tHand - 0.2, 0.4) * (1 - prog(t, tTerm - 0.2, tTerm + 0.3));
  const hy = lerp(470, 590, easeIO(prog(t, tPress - 0.3, tPress + 0.4)));
  hand(ctx, MID, hy, 0.62, ha);
  const ca = pop(t, tPress + 0.3, 0.45) * (1 - prog(t, tTerm - 0.2, tTerm + 0.1));
  around(ctx, MID, y + h + 70, ca, ca, () => tag(ctx, MID, y + h + 70, '这里的对流被压住了', null, { color: C.sky, size: 42 }));

  // textbook causal chain
  chain(ctx, t, 1290, [
    ['强磁场', C.sky, at('term', '强磁场') - 0.1],
    ['抑制\n对流', C.mint, at('term', '对流') - 0.1],
    ['热量\n输送减少', C.gold, at('term', '热量') - 0.1],
    ['温度较低\n显得较暗', C.pink, at('term', '更冷') - 0.1],
  ]);

  // 小宇 asks, then watches the soup
  const kid = easeOut(prog(t, t0 - 0.4, t0 + 0.4)) * (1 - prog(t, tTerm - 0.4, tTerm));
  if (kid > 0) {
    ctx.save(); ctx.globalAlpha *= kid;
    astronaut(ctx, t, lerp(-120, 180, kid), 1300, 0.5, {
      talk: talkLevel(t, ['whyCool']), look: 1, lookY: -1, mood: t > tPress ? 'wow' : 'happy',
      scratch: t < tSoup ? 1 : 0,
    });
    ctx.restore();
  }
}

export const scenes = [
  { id: 'soup', from: S('whyCool') - 0.25, to: S('cycle') - 0.25, draw: soupScene },
];

export const events = [
  { type: 'boing', t: S('whyCool') + 0.1, amp: 0.6 },
  { type: 'whoosh', t: S('soup') - 0.3, d: 0.6, from: 300, to: 1500 },
  ...[...Array(10)].map((_, i) => ({ type: 'pop', t: at('soup', '往上翻') + i * 0.28, f: 260 + (i % 3) * 60, amp: 0.45 })),
  { type: 'sparkle', t: at('mag', '磁场') - 0.1 },
  { type: 'whoosh', t: at('mag', '看不见的手') - 0.2, d: 0.6, from: 1600, to: 400 },
  { type: 'slam', t: at('mag', '按住') + 0.05 },
  ...['强磁场', '对流', '热量', '更冷'].map((w, i) => ({ type: 'note', t: at('term', w) - 0.1, n: 72 + i * 3 })),
];
