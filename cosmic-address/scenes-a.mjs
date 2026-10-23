// Scenes 1–2: the courier's doorbell hook, and the first address level — the Earth–Moon system.
import { W, C, S, E, at, prog, lerp, easeOut, pop, fadeIn, txt, around, burst, talkLevel } from './lib.mjs';
import { earth, moon, glow } from './bodies.mjs';
import { pin, tag } from './cast.mjs';
import { rnd } from './cosmos.mjs';

const TAU = Math.PI * 2;
export const HOOK_EARTH = [540, 1040, 220];
export const MOON_EARTH = [370, 980, 115];

// ---------- scene 1: the doorbell, a lost courier, and Earth gets a pin ----------
function radar(ctx, t, x, y, r, a) {
  around(ctx, x, y, a, a, () => {
    ctx.fillStyle = 'rgba(10,40,30,0.85)';
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(110,255,170,0.5)'; ctx.lineWidth = 3;
    for (const k of [0.33, 0.66, 1]) { ctx.beginPath(); ctx.arc(x, y, r * k, 0, TAU); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke();
    const sw = t * 3;
    ctx.fillStyle = 'rgba(110,255,170,0.25)';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, sw - 0.6, sw); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 60; i++) {
      const ang = rnd(i) * TAU, d = Math.sqrt(rnd(i + 50)) * r * 0.95;
      const lit = 0.3 + 0.7 * Math.max(0, Math.cos(((sw - ang) % TAU + TAU) % TAU * 1.2));
      ctx.fillStyle = `rgba(160,255,200,${lit})`;
      ctx.beginPath(); ctx.arc(x + Math.cos(ang) * d, y + Math.sin(ang) * d, 3, 0, TAU); ctx.fill();
    }
    txt(ctx, '？', x, y, { size: 120, color: C.gold, stroke: '#08281c', sw: 10 });
    txt(ctx, '星星太多了…', x, y + r + 44, { size: 38, color: '#a6ffcc' });
  });
}

function hookScene(ctx, t) {
  const [ex, ey, er] = HOOK_EARTH;
  const tDing = at('hook', '叮咚'), tTo = at('hook', '收件人'), tWhere = at('alienQ', '在哪'), tBig = at('alienQ', '宇宙');
  const tPin = at('plan', '宇宙地址'), tLook = at('plan', '一层层');
  // Earth wakes up to the doorbell
  const ep = pop(t, 0.15, 0.6);
  const hopY = t > tTo && t < tTo + 0.6 ? -Math.sin(prog(t, tTo, tTo + 0.6) * Math.PI) * 40 : 0;
  around(ctx, ex, ey, ep, ep, () => {
    earth(ctx, t, ex, ey + hopY, er, { light: -2.3, mood: t > tTo && t < tWhere ? 'wow' : 'happy', look: t < tPin ? 0.7 : 0 });
    if (t < tDing) txt(ctx, 'Zzz', ex + er * 0.8, ey - er * 0.9 - (t * 30) % 30, { size: 60, color: C.lilac });
  });
  // 叮咚 burst
  const dp = pop(t, tDing - 0.05, 0.4) * (1 - prog(t, tTo + 0.2, tTo + 0.5));
  around(ctx, 300, 520, dp, dp, () => {
    txt(ctx, '叮咚！', 300, 520, { size: 120, color: C.gold, stroke: C.space, sw: 14 });
    ctx.strokeStyle = C.gold; ctx.lineWidth = 8; ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const a = -2.6 + i * 0.35;
      ctx.beginPath(); ctx.moveTo(300 + Math.cos(a) * 200, 520 + Math.sin(a) * 110); ctx.lineTo(300 + Math.cos(a) * 240, 520 + Math.sin(a) * 135); ctx.stroke();
    }
  }, -0.08);
  burst(ctx, t, tTo, ex, ey - er - 30, { n: 10, r: 200 });
  // Earth's ignored "I'm right here!" bubble while the courier stares at its radar
  radar(ctx, t, 270, 560, 150, pop(t, tWhere - 0.2, 0.45) * (1 - prog(t, tPin - 0.4, tPin)));
  const bp = pop(t, tBig, 0.4) * (1 - prog(t, tPin - 0.4, tPin));
  around(ctx, 830, 900, bp, bp, () => {
    ctx.fillStyle = '#fffaf0';
    ctx.beginPath(); ctx.roundRect(680, 840, 320, 110, 40); ctx.fill();
    ctx.beginPath(); ctx.moveTo(720, 940); ctx.lineTo(700, 1000); ctx.lineTo(770, 945); ctx.fill();
    txt(ctx, '我就在这儿！', 840, 895, { size: 44, color: C.ink });
  }, Math.sin(t * 9) * 0.04);
  // the pin lands: this is the first line of the address
  const pp = prog(t, tPin - 0.4, tPin + 0.1);
  if (pp > 0) {
    const y = lerp(ey - er - 500, ey - er * 0.55, easeOut(pp));
    pin(ctx, t, ex, y, 1.25, pp >= 1 ? '我们在这里' : null);
  }
  const lp = fadeIn(t, tLook, 0.4) * (1 - prog(t, E('plan') - 0.4, E('plan') - 0.1));
  around(ctx, ex, ey + er + 80, lp, lp, () => txt(ctx, '由近到远 · 一层层往外看', ex, ey + er + 80, { size: 46, color: C.white, stroke: C.space, sw: 10 }));
}

// ---------- scene 2: the Earth–Moon system ----------
const ORB = { rx: 330, ry: 165, rot: -0.38 };
function moonPos(t) {
  const a = -0.55 + (t - S('moon1')) * 0.12;
  const [ex, ey] = MOON_EARTH;
  const x = Math.cos(a) * ORB.rx, y = Math.sin(a) * ORB.ry;
  const c = Math.cos(ORB.rot), s = Math.sin(ORB.rot);
  return [ex + x * c - y * s, ey + x * s + y * c, a];
}

function moonScene(ctx, t) {
  const [ex, ey, er] = MOON_EARTH;
  const tName = at('moon1', '地月系'), tOrbit = at('moon1', '月球'), tPair = at('moon1', '一组'), tNum = at('moonHi', '38.4');
  const op = easeOut(prog(t, tOrbit - 0.2, tOrbit + 1.2));
  ctx.save();
  ctx.translate(ex, ey); ctx.rotate(ORB.rot);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 4; ctx.setLineDash([14, 14]);
  ctx.beginPath(); ctx.ellipse(0, 0, ORB.rx, ORB.ry, 0, Math.PI, Math.PI + TAU * op); ctx.stroke();
  ctx.restore();
  const [mx, my, ma] = moonPos(t);
  const behind = Math.sin(ma) < 0 && false;
  const drawMoon = () => {
    const mp = pop(t, tOrbit - 0.1, 0.5);
    around(ctx, mx, my, mp, mp, () => {
      glow(ctx, mx, my, 40, 110, 'rgba(230,232,245,0.25)');
      moon(ctx, t, mx, my, 54, { light: Math.atan2(-1, -1), talk: talkLevel(t, ['moonHi']), look: -0.8 });
      txt(ctx, '月球', mx, my + 92, { size: 42, color: '#e6e8f5', stroke: C.space, sw: 8 });
    });
  };
  if (behind) drawMoon();
  earth(ctx, t, ex, ey, er, { light: -2.3, look: 0.6 });
  txt(ctx, '地球', ex, ey + er + 50, { size: 46, color: C.sky, stroke: C.space, sw: 8 });
  if (!behind) drawMoon();
  // motion arrow on the orbit while "月球绕着地球运行"
  const ap = fadeIn(t, tOrbit + 0.3, 0.4) * (1 - prog(t, tPair, tPair + 0.4));
  if (ap > 0) {
    ctx.save(); ctx.globalAlpha *= ap;
    ctx.translate(ex, ey); ctx.rotate(ORB.rot);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.ellipse(0, 0, ORB.rx + 30, ORB.ry + 30, 0, ma - 1.1, ma - 0.25); ctx.stroke();
    const ha = ma - 0.25, hx = Math.cos(ha) * (ORB.rx + 30), hy = Math.sin(ha) * (ORB.ry + 30);
    ctx.fillStyle = C.gold; ctx.translate(hx, hy); ctx.rotate(Math.atan2(Math.cos(ha) * (ORB.ry + 30), -Math.sin(ha) * (ORB.rx + 30)));
    ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-14, -16); ctx.lineTo(-14, 16); ctx.closePath(); ctx.fill();
    ctx.restore();
    txt(ctx, '月球绕地球运行', 470, 1290, { size: 52, color: C.gold, stroke: C.space, sw: 10 });
  }
  // the system gets its name
  const sp = pop(t, tName - 0.1, 0.5);
  around(ctx, 540, 520, sp, sp, () => {
    txt(ctx, '第一层', 540, 430, { size: 44, color: C.gold });
    txt(ctx, '地月系', 540, 525, { size: 120, color: C.white, stroke: C.space, sw: 14 });
  }, Math.sin(t * 2) * 0.03);
  // "我们身边的一组天体": a dashed frame hugs the pair
  const fp = easeOut(prog(t, tPair - 0.2, tPair + 0.6));
  if (fp > 0) {
    ctx.save();
    ctx.globalAlpha *= fp;
    ctx.translate(ex, ey); ctx.rotate(ORB.rot);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 6; ctx.setLineDash([20, 14]); ctx.lineDashOffset = -t * 40;
    ctx.beginPath(); ctx.ellipse(0, 0, (ORB.rx + 80) * lerp(1.15, 1, fp), (ORB.ry + 55) * lerp(1.15, 1, fp), 0, 0, TAU); ctx.stroke();
    ctx.restore();
    txt(ctx, '我们身边的一组天体', 540, 625, { size: 46, color: C.gold, stroke: C.space, sw: 9, });
  }
  // the sourced number lives in its own tag, not as a ruler on the drawing
  tag(ctx, 470, 1270, '平均地月距离 约38.4万千米', '图中距离不按比例', { size: 46, a: pop(t, tNum - 0.1, 0.45) });
}

export const scenesA = [
  { id: 'hook', from: 0, to: E('plan') - 0.3, draw: hookScene },
  {
    id: 'moon', from: E('plan') - 0.3, to: S('sun1') - 0.4, draw: moonScene,
    zoom: { focus: [HOOK_EARTH[0], HOOK_EARTH[1]], anchor: () => [MOON_EARTH[0], MOON_EARTH[1]], F: HOOK_EARTH[2] / MOON_EARTH[2] },
  },
];

export const eventsA = [
  { type: 'ding', t: at('hook', '叮咚') - 0.05, n: 88 },
  { type: 'ding', t: at('hook', '叮咚') + 0.22, n: 84 },
  { type: 'sparkle', t: at('hook', '收件人') },
  { type: 'alarm', t: at('alienQ', '在哪') - 0.1 },
  { type: 'boing', t: at('alienQ', '宇宙') },
  { type: 'slam', t: at('plan', '宇宙地址') + 0.05, shake: 10 },
  { type: 'pop', t: at('moon1', '月球') - 0.1, f: 900 },
  { type: 'tada', t: at('moon1', '一组') - 0.05, amp: 0.7 },
  { type: 'ding', t: at('moonHi', '38.4') - 0.05, n: 91 },
];
void W; void E;
