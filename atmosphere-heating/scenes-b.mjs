// Scenes 3–4: "how does the ground pass heat on?" → three delivery routes; route ① thermal infrared caught by vapour / CO2.
import {
  C, S, E, at, prog, lerp, clamp, easeOut, pop, fadeIn,
  txt, card, around, arrow, burst, talkLevel,
} from './lib.mjs';
import { hiker, glow, groundBody, buddy, tick } from './chars.mjs';
import { irWave, routeIcon, disclaimer } from './props.mjs';

export const ROUTES = [
  { name: '隐形快递', sub: '热红外辐射', color: C.ir },
  { name: '贴贴上浮', sub: '传导 + 对流', color: C.warm },
  { name: '水的接力', sub: '蒸发 + 凝结', color: C.vapor },
];

// One route card, centred on (x,y). done adds a tick.
export function routeCard(ctx, t, i, x, y, o = {}) {
  const { w = 260, h = 300, done = 0 } = o;
  const r = ROUTES[i];
  card(ctx, x - w / 2, y - h / 2, w, h, { fill: 'rgba(10,22,60,0.92)', edge: r.color, ew: 6, r: 34 });
  card(ctx, x - 34, y - h / 2 - 26, 68, 52, { fill: r.color, ew: 0, r: 26, drop: 0 });
  txt(ctx, `${'①②③'[i]}`, x, y - h / 2, { size: 40, color: C.space });
  routeIcon(ctx, t, i, x, y - 40, 1);
  txt(ctx, r.name, x, y + 64, { size: 46, color: C.white });
  txt(ctx, r.sub, x, y + 114, { size: 32, color: r.color });
  if (done > 0) around(ctx, x + w / 2 - 20, y - h / 2 + 20, pop(done, 0, 1), 1, () => tick(ctx, x + w / 2 - 20, y - h / 2 + 20, 0.8));
}

// ---------- scene 3: the question and the three routes ----------
function routesScene(ctx, t) {
  const tQ = S('kidHow'), tThree = at('three', '三条');
  groundBody(ctx, t, 60, 940, 1160, 100, { heat: 1, face: [690, 1212], faceR: 60, shimmer: 0.6 });
  hiker(ctx, t, 200, 1160, 0.55, { talk: talkLevel(t, ['kidHow']), mood: 'happy', point: t > tThree ? 1 : 0 });
  const qp = pop(t, tQ + 0.2, 0.4) * (1 - prog(t, tThree - 0.3, tThree));
  around(ctx, 360, 880, qp, qp, () => {
    card(ctx, 290, 810, 140, 130, { fill: C.cream, ew: 0, r: 60, drop: 8 });
    txt(ctx, '?', 360, 878 + Math.sin(t * 7) * 6, { size: 110, color: C.ir });
  });
  // the ground sends out a pulse when the kid asks
  const hp = pop(t, tQ + 0.4, 0.5) * (1 - prog(t, tThree - 0.3, tThree));
  around(ctx, 690, 1000, hp, hp, () => txt(ctx, '热量怎么送上去?', 640, 1000, { size: 44, color: C.gold, stroke: C.space, sw: 8 }));
  ROUTES.forEach((_, i) => {
    const x = 210 + i * 290, p = pop(t, tThree - 0.15 + i * 0.18, 0.45);
    around(ctx, x, 800, p, p, () => routeCard(ctx, t, i, x, 800), (1 - p) * 0.3);
  });
  const tp = pop(t, S('three') - 0.1, 0.4);
  around(ctx, 470, 555, tp, tp, () => txt(ctx, '三条送热路线', 470, 555, { size: 60, color: C.gold, stroke: C.space, sw: 12 }));
}

// ---------- scene 4: route ① invisible infrared ----------
const GY = 1090;
const CATCH = [
  { kind: 'vapor', x: 240, y: 760, label: '水汽', from: 230 },
  { kind: 'co2', x: 560, y: 820, label: '二氧化碳', from: 560 },
];

function irScene(ctx, t) {
  const tIR = at('ir1', '发出'), tSee = at('ir1', '看不见'), tGas = S('ir2'), tGot = at('ir2', '接住');
  const tWarm = at('ir2', '暖了'), tOut = at('ir2', '也有'), tSpace = at('ir2', '太空');
  const bp = pop(t, S('ir1') - 0.1, 0.45);
  around(ctx, 470, 565, bp, bp, () => {
    card(ctx, 110, 515, 720, 100, { fill: C.ir, ew: 0, r: 50, drop: 8 });
    txt(ctx, '① 隐形快递 · 热红外辐射', 470, 566, { size: 50, color: C.space });
  });
  groundBody(ctx, t, 60, 940, GY, 170, { heat: 1, face: [500, GY + 92], faceR: 90, shimmer: 0.4 });
  CATCH.forEach((c, i) => {
    const p = easeOut(prog(t, tIR + i * 0.25, tGot + 0.15 + i * 0.25));
    irWave(ctx, t, c.from, GY - 20, c.x, c.y + 60, p, { amp: 14 + (1 - p) * 4 });
    const warm = easeOut(prog(t, tGot + 0.15 + i * 0.25, tWarm + 0.3));
    const gp = pop(t, tGas - 0.1 + i * 0.25, 0.45);
    around(ctx, c.x, c.y, gp, gp, () => {
      if (warm > 0 && warm < 1) burst(ctx, t, tGot + 0.15 + i * 0.25, c.x, c.y, { r: 120, n: 8, colors: [C.ir, C.gold] });
      buddy(ctx, t, c.x, c.y, 54, { kind: c.kind, warm, mood: warm > 0.5 ? 'happy' : 'wow' });
      txt(ctx, c.label, c.x, c.y - 100, { size: 38, color: c.kind === 'vapor' ? C.vapor : '#ffb3b3', stroke: C.space, sw: 8 });
    });
    const wp = pop(t, tWarm - 0.1 + i * 0.15, 0.4);
    around(ctx, c.x + 90, c.y - 40, wp, wp, () => txt(ctx, '暖!', c.x + 90, c.y - 40, { size: 44, color: C.hot, stroke: C.cream, sw: 10 }));
  });
  // a third packet slips through and heads for space
  const op = prog(t, tOut - 0.1, tSpace + 0.5);
  irWave(ctx, t, 820, GY - 20, 820, 660, easeOut(op), { dash: [18, 14], alpha: 0.8, amp: 12 });
  const sp = pop(t, tSpace - 0.1, 0.4);
  around(ctx, 760, 690, sp, sp, () => {
    arrow(ctx, 870, 720, 870, 640, { color: C.white, w: 8, head: 26, p: 1 });
    txt(ctx, '溜向太空', 760, 690, { size: 36, color: C.white, stroke: C.space, sw: 8 });
  });
  // "you can't see it": an eye with a slash, and a reminder that orange is only a teaching colour
  const ep = pop(t, tSee - 0.1, 0.4) * (1 - prog(t, tGas - 0.2, tGas + 0.1));
  around(ctx, 600, 700, ep, ep, () => {
    card(ctx, 380, 640, 440, 120, { fill: C.cream, ew: 0, r: 30, drop: 8 });
    ctx.save();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.ellipse(450, 700, 42, 24, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(450, 700, 12, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.red; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(410, 735); ctx.lineTo(490, 665); ctx.stroke();
    ctx.restore();
    txt(ctx, '肉眼看不见', 640, 684, { size: 44, color: C.ink });
    txt(ctx, '橙色只是示意', 640, 732, { size: 28, color: '#7a6a9a' });
  });
  disclaimer(ctx, 1290, fadeIn(t, S('ir1'), 0.4));
}

export const scenes = [
  { from: S('kidHow') - 0.3, to: S('ir1') - 0.3, draw: routesScene },
  { from: S('ir1') - 0.3, to: S('touch') - 0.3, draw: irScene },
];

export const events = [
  { type: 'boing', t: S('kidHow') + 0.2, amp: 0.6 },
  { type: 'pop', t: at('three', '三条') - 0.15, f: 700 },
  { type: 'pop', t: at('three', '三条') + 0.03, f: 900 },
  { type: 'pop', t: at('three', '三条') + 0.21, f: 1100 },
  { type: 'ding', t: at('three', '路线'), n: 91 },
  { type: 'whoosh', t: S('ir1') - 0.3, d: 0.4 },
  { type: 'wobble', t: at('ir1', '发出'), d: 1.4, f: 420, rate: 7, amp: 0.35 },
  { type: 'buzz', t: at('ir1', '看不见') - 0.05 },
  { type: 'pop', t: S('ir2') - 0.1, f: 800 },
  { type: 'pop', t: S('ir2') + 0.15, f: 1000 },
  { type: 'sparkle', t: at('ir2', '接住') + 0.15 },
  { type: 'ding', t: at('ir2', '暖了'), n: 86 },
  { type: 'whoosh', t: at('ir2', '也有'), d: 0.8, from: 600, to: 3200 },
];
