// Scenes 5–7: the Moon as Earth's natural satellite, the three-step recap, and a thank-you to the Sun.
import { W, C, S, E, at, atEnd, prog, lerp, easeIO, easeOut, pop, fadeIn, bob, txt, around, header, pill, arrow, photons, burst, confetti, talkLevel } from './lib.mjs';
import { moon, sun, earth, eye, kid } from './chars.mjs';

const TAU = Math.PI * 2;

function heart(ctx, x, y, s, color = C.pink) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 12);
  ctx.bezierCurveTo(-26, -6, -14, -30, 0, -14);
  ctx.bezierCurveTo(14, -30, 26, -6, 0, 12);
  ctx.fill();
  ctx.restore();
}

// ---------- scene 5: natural satellite ----------
const T_ZOOM = S('sat') - 0.2, T_SAT = at('sat', '天然卫星'), T_VIS = at('visible', '月面'), T_VIS2 = at('visible', '可见月光');
const EX = 540, EY = 960, ER = 140, RX = 380, RY = 150;

function orbit(ctx, t) {
  if (t < T_ZOOM) header(ctx, t, S('kidQ'), '月亮到底是什么？', '');
  else if (t < S('visible') - 0.1) header(ctx, t, T_ZOOM + 0.1, '月球，是天然卫星', '绕着地球运行');
  else header(ctx, t, S('visible') - 0.1, '我们看见的月光', '来自月面反射的太阳光');

  // the kid asks, then steps aside as the camera pulls back
  const k = 1 - fadeIn(t, T_ZOOM, 0.4);
  around(ctx, 300, 1330, 1, k, () => {
    kid(ctx, t, 300, 1330, 1.5, { talk: talkLevel(t, ['kidQ']), look: -0.3, hop: Math.abs(Math.sin(t * 6)) * 6 });
    around(ctx, 330, 900, pop(t, S('kidQ') + 0.2, 0.4), 1, () => txt(ctx, '?', 330, 900, { size: 140, color: C.sky, stroke: C.ink, sw: 12 }), Math.sin(t * 4) * 0.2);
  });
  around(ctx, 780, 760, lerp(1.3, 0.2, easeIO(prog(t, T_ZOOM, T_ZOOM + 0.8))), k, () =>
    moon(ctx, t, 780, 760 + bob(t, 6, 2), 150, { glow: 1, face: { eyes: 'open', look: [-0.8, 0.6] } }));

  const z = easeOut(prog(t, T_ZOOM, T_ZOOM + 0.8));
  if (z <= 0) return;
  ctx.save(); ctx.globalAlpha *= z;
  txt(ctx, '示意图 · 轨道与大小不按真实比例', W / 2, 500, { size: 28, color: C.dim });
  // sunlight arrives from the left
  txt(ctx, '太阳光', 110, 640, { size: 38, color: C.gold });
  for (const y of [720, 960, 1200]) {
    arrow(ctx, 20, y, 150, y, { w: 7, head: 24, color: 'rgba(244,201,120,0.75)' });
    photons(ctx, t, 0, y, 170, y, { n: 3, speed: 0.6, r: 6 });
  }
  ctx.strokeStyle = 'rgba(167,199,207,0.6)'; ctx.lineWidth = 4; ctx.setLineDash([16, 14]);
  ctx.beginPath(); ctx.ellipse(EX, EY, RX * lerp(0.6, 1, z), RY * lerp(0.6, 1, z), 0, 0, TAU); ctx.stroke();
  ctx.setLineDash([]);
  // a short stretch of orbit ending on the far side from the Sun, where the sunlit face points at Earth
  const ang = -1.9 + (t - T_ZOOM) * 0.24;
  const mx = EX + Math.cos(ang) * RX, my = EY + Math.sin(ang) * RY, front = Math.sin(ang) > 0;
  const drawMoon = () => {
    moon(ctx, t, mx, my, 62, { light: Math.PI, glow: 0.4 });
    txt(ctx, '月球', mx, my - 95, { size: 38, color: C.cream });
  };
  if (!front) drawMoon();
  earth(ctx, t, EX, EY, ER, { light: Math.PI });
  txt(ctx, '地球', EX, EY + ER + 50, { size: 42, color: C.sky });
  if (front) drawMoon();
  ctx.restore();
  around(ctx, W / 2, 1270, pop(t, T_SAT, 0.45), 1, () => pill(ctx, '天然卫星 · 可见月光来自反射', W / 2, 1270, { size: 40 }));
  burst(ctx, t, T_SAT + 0.1, W / 2, 1270, { r: 260, n: 12 });
  // highlight the reflected light heading to Earth
  const pv = easeOut(prog(t, T_VIS, T_VIS + 0.5));
  if (pv > 0) {
    const a = Math.atan2(EY - my, EX - mx);
    arrow(ctx, mx + Math.cos(a) * 70, my + Math.sin(a) * 70, EX - Math.cos(a) * (ER + 20), EY - Math.sin(a) * (ER + 20),
      { p: pv, w: 9, head: 30, color: '#fff6d8', glow: 'rgba(255,240,190,0.9)' });
  }
  around(ctx, 860, 640, pop(t, T_VIS2, 0.4), 1, () => pill(ctx, '可见月光', 860, 640, { size: 38, edge: C.cream }));
}

// ---------- scene 6: three-step recap ----------
const STEPS = [
  { w: '太阳发出光', y: 680, title: '太阳', sub: '发出光', color: C.gold },
  { w: '月面反射光', y: 940, title: '月面', sub: '反射太阳光', color: C.cream },
  { w: '我们看见', y: 1200, title: '我们', sub: '看见月光', color: C.sky },
];
const CX = 360;
function recap(ctx, t) {
  header(ctx, t, S('recap'), '记住这条光路', '太阳 → 月面 → 我们');
  STEPS.forEach((s, i) => {
    const t0 = at('recap', s.w);
    if (i > 0) {
      const p = easeOut(prog(t, t0 - 0.35, t0));
      arrow(ctx, CX, STEPS[i - 1].y + 90, CX, s.y - 90, { p, w: 9, head: 30, color: C.gold });
      if (p >= 1) photons(ctx, t, CX, STEPS[i - 1].y + 90, CX, s.y - 90, { n: 2, speed: 0.8, r: 7 });
    }
    const sc = pop(t, t0, 0.45);
    around(ctx, CX, s.y, sc, 1, () => {
      if (i === 0) sun(ctx, t, CX, s.y, 70, { rays: 0.8 });
      else if (i === 1) moon(ctx, t, CX, s.y, 72, { light: -Math.PI / 2, glow: 0.4, face: { eyes: 'happy' } });
      else eye(ctx, CX, s.y, 70, { glow: 0.5 });
    });
    around(ctx, 600, s.y, 1, fadeIn(t, t0 + 0.1, 0.35), () => {
      txt(ctx, s.title, 520, s.y - 30, { size: 60, color: s.color, align: 'left' });
      txt(ctx, s.sub, 520, s.y + 38, { size: 40, color: C.dim, align: 'left' });
    });
    burst(ctx, t, t0 + 0.1, CX, s.y, { r: 140, n: 8, size: 14 });
  });
}

// ---------- scene 7: thank you, Sun ----------
const T_THANK = at('moonEnd', '谢谢');
function thanks(ctx, t) {
  header(ctx, t, S('kidEnd'), '月光 = 转送的太阳光', '');
  const happy = t > T_THANK + 0.3;
  sun(ctx, t, 250, 720 + bob(t, 8, 1.6), 120, { face: happy ? { eyes: 'happy', blush: 1.4, mouth: 0 } : { eyes: 'shades' } });
  const bow = Math.sin(Math.PI * prog(t, T_THANK, T_THANK + 0.9)) * -0.35;
  around(ctx, 740, 1000, 1, 1, () =>
    moon(ctx, t, 740, 900 + bob(t, 6, 1.4, 2), 170, { light: Math.PI * 1.2, glow: 0.7, face: { eyes: t > T_THANK ? 'happy' : 'open', look: [-0.8, -0.3], mouth: talkLevel(t, ['moonEnd']) } }), bow);
  // hearts float from the Moon to the Sun
  for (let i = 0; i < 6; i++) {
    const p = prog(t, T_THANK + i * 0.18, T_THANK + i * 0.18 + 1.2);
    if (p <= 0 || p >= 1) continue;
    const x = lerp(640, 300, easeOut(p)) + Math.sin(p * 9 + i) * 30, y = lerp(830, 740, p) - Math.sin(Math.PI * p) * 120;
    ctx.save(); ctx.globalAlpha *= Math.sin(Math.PI * p); heart(ctx, x, y, 1.4 + 0.4 * Math.sin(i), i % 2 ? C.pink : '#ff6b8a'); ctx.restore();
  }
  kid(ctx, t, 230, 1330, 1.15, { talk: talkLevel(t, ['kidEnd']), point: easeOut(prog(t, S('kidEnd'), S('kidEnd') + 0.5)), aim: -0.6, look: -0.4,
    hop: Math.max(0, Math.sin(Math.PI * prog(t, at('kidEnd', '原来'), at('kidEnd', '原来') + 0.45))) * 50 });
  confetti(ctx, t, T_THANK + 0.4);
}

export const scenesC = [
  { from: S('kidQ') - 0.3, to: S('recap') - 0.3, draw: orbit },
  { from: S('recap') - 0.3, to: S('kidEnd') - 0.3, draw: recap },
  { from: S('kidEnd') - 0.3, to: E('moonEnd') + 2.0, draw: thanks },
];

export const eventsC = [
  { type: 'boing', t: S('kidQ') + 0.2, amp: 0.5 },
  { type: 'whoosh', t: T_ZOOM, d: 0.8, from: 2400, to: 400 },
  { type: 'tada', t: T_SAT + 0.1, amp: 0.6 },
  { type: 'sparkle', t: T_VIS },
  { type: 'pop', t: T_VIS2, f: 850 },
  { type: 'whoosh', t: S('recap') - 0.35, d: 0.5 },
  ...STEPS.map((s, i) => ({ type: 'ding', t: at('recap', s.w), n: [84, 88, 91][i] })),
  { type: 'boing', t: at('kidEnd', '原来'), amp: 0.5 },
  { type: 'sparkle', t: T_THANK },
  { type: 'confetti', t: T_THANK + 0.4 },
];
