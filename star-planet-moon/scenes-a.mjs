// Scenes 1–2: the hook (three familiar faces) and the opening of the 宇宙身份登记处.
import { W, C, S, E, at, prog, lerp, easeIO, easeOut, pop, fadeIn, txt, card, around, burst, talkLevel } from './lib.mjs';
import { sun, earth, moon, glow } from './bodies.mjs';
import { bulb, orbitIcon, satellite, stamp } from './props.mjs';

// ---------- scene 1: hook ----------
function hookScene(ctx, t) {
  const tSelfie = at('hook', '天天'), tWho = at('hook', '身份'), tNo = at('hook', '完全');
  const bodies = [
    ['太阳', 540, 640, 170, at('hook', '太阳'), (x, y, r, o) => sun(ctx, t, x, y, r, o)],
    ['地球', 290, 1040, 110, at('hook', '地球'), (x, y, r, o) => earth(ctx, t, x, y, r, { light: -Math.PI / 2 - 0.5, ...o })],
    ['月球', 800, 1060, 72, at('hook', '月球'), (x, y, r, o) => moon(ctx, t, x, y, r, { light: -Math.PI / 2 - 0.9, ...o })],
  ];
  // they squeeze together for a selfie, then spread out puzzled
  const squeeze = easeIO(prog(t, tSelfie - 0.2, tSelfie + 0.3)) * (1 - easeIO(prog(t, tWho - 0.3, tWho + 0.2)));
  bodies.forEach(([name, x, y, r, t0, draw], i) => {
    const p = pop(t, t0 - 0.15, 0.5);
    const bx = lerp(x, lerp(x, 540, 0.35), squeeze), by = y + Math.sin(t * 2.4 + i * 2) * 10;
    const shake = t > tNo ? Math.sin(t * 30) * 4 * (1 - prog(t, tNo, tNo + 0.6)) : 0;
    around(ctx, bx, by, p, p, () => {
      draw(bx + shake, by, r, { mood: t > tWho ? 'wow' : 'happy', look: Math.sin(t * 1.5 + i) * 0.6 });
      const lp = pop(t, t0, 0.4);
      around(ctx, bx, by + r + 60, lp, lp, () => txt(ctx, name, bx, by + r + 60, { size: 54, color: C.white, stroke: C.space, sw: 10 }));
      const qp = pop(t, tWho + i * 0.12, 0.4);
      around(ctx, bx + r * 0.8, by - r - 20, qp, qp, () =>
        txt(ctx, '?', bx + r * 0.8, by - r - 20 + Math.sin(t * 7 + i) * 6, { size: 110, color: C.gold, stroke: C.space, sw: 10 }), 0.2);
    });
  });
  // selfie flash + frame
  const fp = prog(t, tSelfie, tSelfie + 0.5);
  if (fp > 0 && fp < 1) {
    ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - fp)})`;
    ctx.fillRect(0, 380, W, 960);
  }
  const frameA = fadeIn(t, tSelfie, 0.15) * (1 - prog(t, tWho - 0.3, tWho));
  around(ctx, 540, 860, 1, frameA, () => {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 10;
    for (const [x, y, dx, dy] of [[90, 420, 1, 1], [990, 420, -1, 1], [90, 1260, 1, -1], [990, 1260, -1, -1]]) {
      ctx.beginPath(); ctx.moveTo(x, y + dy * 90); ctx.lineTo(x, y); ctx.lineTo(x + dx * 90, y); ctx.stroke();
    }
    txt(ctx, '咔嚓！', 860, 470, { size: 60, color: C.white, stroke: C.space, sw: 8 });
  });
  const tp = pop(t, tNo - 0.1, 0.45);
  around(ctx, 540, 300, tp, tp, () => {
    txt(ctx, '身份', 400, 300, { size: 130, color: C.gold, stroke: C.space, sw: 14 });
    txt(ctx, '一样吗？', 700, 310, { size: 96, color: C.white, stroke: C.space, sw: 12 });
  }, Math.sin(t * 3) * 0.03);
}

// ---------- scene 2: the office opens ----------
function officeScene(ctx, t) {
  const t1 = at('rules', '第一'), t2 = at('rules', '第二');
  // two big check cards
  [[t1, '光从哪来？', 680], [t2, '谁绕谁转？', 910]].forEach(([t0, label, y], i) => {
    const p = pop(t, t0 - 0.1, 0.5);
    around(ctx, 540, y, p, p, () => {
      card(ctx, 130, y - 95, 820, 190, { fill: 'rgba(255,255,255,0.1)', edge: i ? C.sky : C.gold, ew: 5, drop: 0, r: 48 });
      if (i === 0) bulb(ctx, 250, y + 4, 1.3, 0.6 + 0.4 * Math.abs(Math.sin(t * 3)));
      else orbitIcon(ctx, t, 250, y, 1.45);
      txt(ctx, `第${i ? '二' : '一'}`, 400, y - 40, { size: 40, align: 'left', color: i ? C.sky : C.gold });
      txt(ctx, label, 400, y + 22, { size: 84, align: 'left', color: C.white });
    });
  });
  const tq = pop(t, at('open', '两件事') - 0.1, 0.45) * (1 - prog(t, t1 - 0.3, t1));
  around(ctx, 540, 790, tq, tq, () => txt(ctx, '只查两件事', 540, 790, { size: 110, color: C.white, stroke: C.space, sw: 12 }));
  // the queue at the counter
  const qx = (i) => 210 + i * 210 - easeOut(prog(t, at('open', '开张'), at('open', '开张') + 1.2)) * 40;
  const qy = 1230;
  ctx.fillStyle = '#5a3b22';
  ctx.beginPath(); ctx.roundRect(60, 1300, 960, 70, 18); ctx.fill();
  ctx.fillStyle = '#7b5332'; ctx.fillRect(60, 1300, 960, 18);
  stamp(ctx, 900, 1270, 0.4, '盖章', C.red, 1, -0.1);
  const hop = (i) => -Math.abs(Math.sin(t * 5 + i)) * 18;
  sun(ctx, t, qx(0), qy - 30 + hop(0), 80, { face: true, look: 0.8 });
  earth(ctx, t, qx(1), qy + hop(1), 62, { light: Math.PI, look: -0.6 });
  moon(ctx, t, qx(2), qy + 12 + hop(2), 44, { light: Math.PI, look: -0.6 });
  const sp = fadeIn(t, t2, 0.4);
  if (sp > 0) around(ctx, qx(3) + 30, qy + 10, 1, sp * 0.8, () => satellite(ctx, t, qx(3) + 30, qy + 10 + hop(3), 0.32, { look: -0.8 }));
}

export const scenesA = [
  { id: 'hook', from: 0, to: S('open') - 0.35, draw: hookScene },
  { id: 'office', from: S('open') - 0.35, to: S('sunHi') - 0.35, draw: officeScene },
];

export const eventsA = [
  { type: 'pop', t: at('hook', '太阳') - 0.1, f: 520 },
  { type: 'pop', t: at('hook', '地球') - 0.1, f: 700 },
  { type: 'pop', t: at('hook', '月球') - 0.1, f: 900 },
  { type: 'sparkle', t: at('hook', '天天') },
  { type: 'boing', t: at('hook', '身份') - 0.05, amp: 0.7 },
  { type: 'buzz', t: at('hook', '完全') },
  { type: 'whoosh', t: S('open') - 0.4, d: 0.45 },
  { type: 'slam', t: at('open', '开张') - 0.1, shake: 14 },
  { type: 'note', t: at('rules', '第一') - 0.1, n: 79 },
  { type: 'note', t: at('rules', '第二') - 0.1, n: 84 },
];
void E; void glow; void burst; void talkLevel;
