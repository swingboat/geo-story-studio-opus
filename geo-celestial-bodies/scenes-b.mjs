// Scenes 8–9: the three questions, and the quiz (moon / Chang'e-4 / sunspot).
import { C, S, E, at, prog, lerp, easeIO, easeOut, pop, fadeIn, txt, card, around, arrow, burst, talkLevel, measure } from './lib.mjs';
import { sun, earth, moon, rock, kid, tick, cross, glow, orbit } from './bodies.mjs';

const QS = [
  ['在太空里？', '大气层外面', 'q1', '太空'],
  ['是实在的东西？', '有物质，不是光和影', 'q2', '实实在在'],
  ['自己在运行？', '不是别人身上的一部分', 'q3', '运行'],
];

// little pictograms for each question
function qIcon(ctx, t, i, x, y) {
  if (i === 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(120,200,255,0.6)'; ctx.lineWidth = 8; ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.arc(x - 20, y + 40, 62, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    ctx.restore();
    earth(ctx, t, x - 20, y + 40, 40, { face: false, light: -Math.PI / 2 });
    rock(ctx, x + 40, y - 30, 14, t);
  } else if (i === 1) {
    rock(ctx, x - 25, y, 30, 0.3);
    ctx.save(); ctx.globalAlpha *= 0.5; glow(ctx, x + 40, y, 0, 34, 'rgba(255,240,150,0.9)'); ctx.restore();
    cross(ctx, x + 48, y + 26, 0.32);
  } else {
    orbit(ctx, x, y, 52, 30, 1, 'rgba(255,255,255,0.6)');
    const a = t * 2;
    moon(ctx, t, x + Math.cos(a) * 52, y + Math.sin(a) * 30, 13, { face: false });
    earth(ctx, t, x, y, 18, { face: false });
  }
}

// ---------- scene 8: three questions ----------
function rulesScene(ctx, t) {
  const tEnd = S('ruleEnd');
  kid(ctx, t, 230, 900, 0.82, { talk: talkLevel(t, ['kidQ']), mood: t < S('rule') ? 'happy' : 'wow' });
  const qp = pop(t, at('kidQ', '判断') - 0.1, 0.4) * (1 - prog(t, S('rule') - 0.1, S('rule') + 0.2));
  around(ctx, 330, 460, qp, qp, () => txt(ctx, '?', 330, 470 + Math.sin(t * 6) * 8, { size: 150, color: C.gold, stroke: C.space, sw: 10 }));
  const tp = pop(t, at('rule', '问') - 0.1, 0.45);
  around(ctx, 1110, 160, tp, tp, () => {
    txt(ctx, '天体判断 · 问三句', 1110, 160, { size: 84, color: C.gold, stroke: C.space, sw: 10, shadow: 'rgba(0,0,0,0.5)' });
  });
  QS.forEach(([q, hint, id, w], i) => {
    const y = 330 + i * 180;
    const p = pop(t, S(id) - 0.1, 0.45);
    around(ctx, 1110, y, p, p, () => {
      card(ctx, 520, y - 72, 1180, 144, { fill: 'rgba(255,255,255,0.08)', edge: 'rgba(255,255,255,0.28)', ew: 3, drop: 0, r: 36 });
      ctx.fillStyle = [C.sky, C.pink, C.gold][i];
      ctx.beginPath(); ctx.arc(600, y, 44, 0, Math.PI * 2); ctx.fill();
      txt(ctx, String(i + 1), 600, y + 2, { size: 56, font: 'RoundB', color: C.space });
      const hw = fadeIn(t, at(id, w) - 0.1, 0.3);
      txt(ctx, q, 680, y - 16, { size: 62, align: 'left', color: C.white });
      around(ctx, 680, y + 40, 1, hw, () => txt(ctx, hint, 682, y + 44, { size: 34, align: 'left', color: C.lilac }));
      qIcon(ctx, t, i, 1500, y);
    });
    const ck = pop(t, at('ruleEnd', '都是') + i * 0.15 - 0.1, 0.35);
    around(ctx, 1640, y, ck, ck, () => tick(ctx, 1640, y, 1.1));
  });
  const bp = pop(t, at('ruleEnd', '天体') - 0.15, 0.5);
  around(ctx, 1110, 880, bp, bp, () => {
    card(ctx, 760, 830, 700, 100, { fill: C.ok, r: 50, ew: 0, drop: 8 });
    txt(ctx, '三个“是” → 天体！', 1110, 881, { size: 56, color: C.space });
  });
  burst(ctx, t, at('ruleEnd', '天体'), 1110, 880, { r: 380, n: 14 });
  void tEnd; void E;
}

// ---------- scene 9: quiz ----------
// marks: [ok|null] per question; times taken from the narration.
const QUIZ = [
  { id: 'moon', from: () => S('quizMoon') - 0.3, marks: () => [1, 1, 1].map((ok, i) => [ok, at('quizMoon', '三条') + i * 0.22]),
    verdict: () => [true, at('quizMoon', '天体')], label: '月球' },
  { id: 'change', from: () => S('kidChange') - 0.3, marks: () => [[1, at('change', '停')], [1, at('change', '月面')], [0, at('change', '不再')]],
    verdict: () => [false, at('change', '不', 1)], label: '着陆的嫦娥四号' },
  { id: 'spot', from: () => S('spot') - 0.3, marks: () => [[1, at('spot', '是')], [1, at('spot', '表面')], [0, at('spot', '区域')]],
    verdict: () => [false, at('spot', '不')], label: '太阳黑子' },
];

function lander(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#d8dce8'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 30, -40); ctx.lineTo(k * 62, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(k * 72, 0); ctx.lineTo(k * 52, 0); ctx.stroke(); }
  ctx.fillStyle = '#e3b23c'; ctx.beginPath(); ctx.roundRect(-46, -96, 92, 62, 10); ctx.fill();
  ctx.fillStyle = '#c9cfe0'; ctx.beginPath(); ctx.roundRect(-30, -128, 60, 34, 8); ctx.fill();
  ctx.fillStyle = C.red; ctx.fillRect(-20, -82, 40, 20);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -150, 22, Math.PI, 0); ctx.fill();
  ctx.restore();
}

function drawSubject(ctx, t, k, x, y) {
  if (k === 0) {
    earth(ctx, t, x - 210, y + 170, 70, { light: Math.PI * 0.8 });
    orbit(ctx, x - 210, y + 170, 330, 140, 1, 'rgba(255,255,255,0.25)');
    moon(ctx, t, x + 40, y - 40, 150, { light: Math.PI * 0.8 });
  } else if (k === 1) {
    ctx.save();
    ctx.fillStyle = C.moon;
    ctx.beginPath(); ctx.ellipse(x, y + 520, 640, 420, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.moonDark;
    for (const [cx, cy, r] of [[-260, 150, 50], [220, 170, 36], [-40, 230, 60]]) { ctx.beginPath(); ctx.ellipse(x + cx, y + cy, r, r * 0.35, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    lander(ctx, x, y + 110, 1.5);
    const tLink = at('change', '一部分');
    const lp = fadeIn(t, tLink - 0.1, 0.4);
    if (lp > 0) {
      ctx.save(); ctx.globalAlpha *= lp; ctx.strokeStyle = C.gold; ctx.lineWidth = 6; ctx.setLineDash([12, 10]);
      ctx.beginPath(); ctx.ellipse(x, y + 120, 300, 160, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      around(ctx, x, y - 160, lp, lp, () => txt(ctx, '成了月球的一部分', x, y - 160, { size: 48, color: C.gold }));
    }
  } else {
    sun(ctx, t, x, y + 20, 200, { spot: true });
    const sp = easeOut(prog(t, at('spot', '太阳黑子'), at('spot', '太阳黑子') + 0.5));
    if (sp > 0) {
      ctx.save(); ctx.strokeStyle = '#7cf7ff'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.arc(x + 100, y + 80, 70, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * sp); ctx.stroke(); ctx.restore();
      arrow(ctx, x + 300, y + 260, x + 160, y + 130, { color: '#7cf7ff', w: 8, head: 26, p: sp });
      txt(ctx, '在太阳表面', x + 350, y + 300, { size: 46, color: '#7cf7ff' });
    }
  }
}

function quizScene(ctx, t) {
  let k = 0;
  for (let i = 0; i < QUIZ.length; i++) if (t >= QUIZ[i].from()) k = i;
  const q = QUIZ[k];
  const slide = easeIO(prog(t, q.from(), q.from() + 0.5));
  const ox = lerp(k === 0 ? 0 : 900, 0, slide);
  ctx.save();
  ctx.translate(ox, 0);
  ctx.globalAlpha *= k === 0 ? 1 : slide;
  drawSubject(ctx, t, k, 560, 470);
  ctx.restore();
  // header
  const hp = pop(t, S('quizMoon') - 0.2, 0.4);
  around(ctx, 1380, 150, hp, hp, () => {
    card(ctx, 1150, 104, 460, 92, { fill: C.gold, r: 46, ew: 0, drop: 6 });
    txt(ctx, '它算不算天体？', 1380, 151, { size: 50, color: C.space });
  });
  // checklist
  const marks = q.marks();
  QS.forEach(([qq], i) => {
    const y = 300 + i * 130;
    card(ctx, 1110, y - 52, 540, 104, { fill: 'rgba(255,255,255,0.08)', edge: 'rgba(255,255,255,0.25)', ew: 3, drop: 0, r: 30 });
    txt(ctx, `${i + 1}  ${qq}`, 1150, y + 2, { size: 46, align: 'left', color: C.white });
    const [ok, tm] = marks[i];
    const mp = pop(t, tm, 0.35);
    around(ctx, 1590, y, mp, mp, () => (ok ? tick : cross)(ctx, 1590, y, 0.9));
  });
  // verdict stamp
  const [yes, tv] = q.verdict();
  const vp = prog(t, tv - 0.18, tv);
  if (vp > 0) {
    around(ctx, 1380, 760, lerp(2.4, 1, easeIO(vp)), Math.min(1, vp * 2), () => {
      ctx.save(); ctx.translate(1380, 760); ctx.rotate(-0.08);
      ctx.strokeStyle = yes ? C.ok : C.no; ctx.lineWidth = 12;
      ctx.beginPath(); ctx.roundRect(-230, -70, 460, 140, 28); ctx.stroke();
      ctx.restore();
      txt(ctx, yes ? '是天体！' : '不算天体', 1380, 762, { size: 84, color: yes ? C.ok : C.no });
    }, -0.08);
  }
  txt(ctx, q.label, 560, 880, { size: 52, color: C.white, stroke: C.space, sw: 8 });
  if (k === 1) kid(ctx, t, 140, 900, 0.55, { talk: talkLevel(t, ['kidChange']) });
}

export const scenesB = [
  { id: 'rules', from: S('kidQ') - 0.4, to: S('quizMoon') - 0.45, draw: rulesScene },
  { id: 'quiz', from: S('quizMoon') - 0.45, to: S('rock') - 0.4, draw: quizScene },
];

export const eventsB = [
  { type: 'whoosh', t: S('kidQ') - 0.45, d: 0.45 },
  { type: 'boing', t: at('kidQ', '判断') - 0.1, amp: 0.6 },
  { type: 'tada', t: at('rule', '问') - 0.1, amp: 0.5 },
  ...QS.map(([, , id], i) => ({ type: 'pop', t: S(id) - 0.1, f: 600 + i * 150 })),
  ...QS.map((_, i) => ({ type: 'tick', t: at('ruleEnd', '都是') + i * 0.15 - 0.1, n: 79 + i * 4 })),
  { type: 'sparkle', t: at('ruleEnd', '天体') },
  { type: 'whoosh', t: S('quizMoon') - 0.5, d: 0.45 },
  ...QUIZ.flatMap((q, k) => [
    ...(k ? [{ type: 'whoosh', t: q.from(), d: 0.4 }] : []),
    ...q.marks().map(([ok, tm], i) => (ok ? { type: 'tick', t: tm, n: 79 + i * 4 } : { type: 'buzz', t: tm })),
    q.verdict()[0] ? { type: 'tada', t: q.verdict()[1] } : { type: 'stamp', t: q.verdict()[1], shake: 12 },
  ]),
];
void measure; void burst; void E;
