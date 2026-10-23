// Scenes 5–6: beyond the Milky Way / the observable universe, then the finished address and the send-off.
import { C, S, E, at, prog, lerp, easeOut, pop, fadeIn, txt, around, burst, confetti, card } from './lib.mjs';
import { earth, moon, sun, glow } from './bodies.mjs';
import { pin } from './cast.mjs';
import { milkyWay, galaxyField, dashedCircle, spiral, FIELD } from './cosmos.mjs';
import { MILKY } from './scenes-b.mjs';

const TAU = Math.PI * 2;
const O = [540, 930], R = 390, SPREAD = 470;
const inside = (g) => Math.hypot(g.u * SPREAD, g.v * SPREAD * 1.25) < R - 20;

function cross(ctx, x, y, s) {
  ctx.save();
  ctx.strokeStyle = C.no; ctx.lineWidth = 12 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 40 * s, y - 40 * s); ctx.lineTo(x + 40 * s, y + 40 * s);
  ctx.moveTo(x + 40 * s, y - 40 * s); ctx.lineTo(x - 40 * s, y + 40 * s); ctx.stroke();
  ctx.restore();
}

// ---------- scene 5: other galaxies and the observable universe ----------
function beyondScene(ctx, t) {
  const t0 = S('beyond'), tMany = at('beyond', '许多'), tEdge = at('alienB', '边界');
  const tObs = at('obs1', '可观测'), tInfo = at('obs1', '信息'), tRing = at('obs2', '虚线圈'), tNot = at('obs2', '不是');
  const tCen = at('obs2', '中心'), tPos = at('obs2', '观测位置'), tNo = at('alienO', '宇宙中心'), tYes = at('alienO', '观测位置');
  const obs = prog(t, tObs - 0.2, tObs + 0.4);
  // galaxies arrive layer by layer; after the circle appears, the ones outside stay faint but present
  galaxyField(ctx, O[0], O[1], SPREAD, (g) => fadeIn(t, tMany - 0.6 + g.layer * 1.4, 0.5) * (inside(g) ? 1 : lerp(1, 0.4, obs)));
  milkyWay(ctx, t, O[0], O[1], 44, { a: 1 });
  // light messengers: info from galaxies inside the circle travelling to the observation point
  const mp = fadeIn(t, tInfo - 0.2, 0.4) * (1 - prog(t, tRing - 0.2, tRing + 0.3));
  if (mp > 0) FIELD.filter(inside).forEach((g, i) => {
    const gx = O[0] + g.u * SPREAD, gy = O[1] + g.v * SPREAD * 1.25;
    const f = ((t * 0.7 + i * 0.37) % 1);
    ctx.strokeStyle = `rgba(255,220,120,${0.25 * mp})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(O[0], O[1]); ctx.stroke();
    glow(ctx, lerp(gx, O[0], f), lerp(gy, O[1], f), 0, 12, `rgba(255,230,140,${mp})`);
  });
  // the courier's guess: a hard wall around everything
  const wp = pop(t, tEdge - 0.1, 0.45) * (1 - prog(t, tObs - 0.3, tObs));
  if (wp > 0) around(ctx, O[0], O[1], wp, wp, () => {
    ctx.strokeStyle = 'rgba(255,77,109,0.9)'; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.arc(O[0], O[1], R + 20, 0, TAU); ctx.stroke();
    txt(ctx, '宇宙的边界？', O[0], O[1] + R + 60, { size: 56, color: C.no, stroke: C.space, sw: 10 });
  });
  // the dashed observation circle
  dashedCircle(ctx, O[0], O[1], R, easeOut(obs), { color: C.gold, w: 7, off: -t * 30 });
  const lp = fadeIn(t, tObs + 0.3, 0.4);
  if (lp > 0) {
    ctx.save(); ctx.globalAlpha *= lp;
    txt(ctx, '能接收到信息的范围（示意）', O[0], O[1] + R + 46, { size: 38, color: C.gold, stroke: C.space, sw: 8 });
    ctx.restore();
  }
  // "not the edge of the whole universe"
  const np = pop(t, tNot - 0.1, 0.45);
  if (np > 0) around(ctx, 820, 600, np, np, () => {
    card(ctx, 640, 545, 370, 110, { fill: 'rgba(8,10,40,0.88)', edge: C.no, ew: 5, drop: 0, r: 30 });
    txt(ctx, '虚线 ≠ 宇宙边界', 825, 600, { size: 44, color: C.white });
  }, 0.06);
  // observation position, not the centre of the universe
  const cp = pop(t, tCen - 0.1, 0.45);
  if (cp > 0) {
    pin(ctx, t, O[0], O[1] - 10, 0.8);
    around(ctx, O[0], O[1] + 110, cp, cp, () => txt(ctx, '观测位置（我们）', O[0], O[1] + 110, { size: 44, color: C.white, stroke: C.space, sw: 9 }));
  }
  const xp = pop(t, tNo - 0.1, 0.4), yp = pop(t, tYes - 0.1, 0.4);
  const fade = 1 - prog(t, E('alienO') + 0.3, E('alienO') + 0.6);
  if (xp > 0) around(ctx, 280, 1250, xp, xp * fade, () => {
    txt(ctx, '宇宙中心', 280, 1250, { size: 50, color: 'rgba(255,255,255,0.85)', stroke: C.space, sw: 8 });
    cross(ctx, 280, 1250, 1.2);
  });
  if (yp > 0) around(ctx, 640, 1250, yp, yp * fade, () => {
    card(ctx, 500, 1205, 280, 90, { fill: C.mint, ew: 0, drop: 0, r: 45 });
    txt(ctx, '观测位置 ✓', 640, 1250, { size: 46, color: C.ink });
  });
  // titles: first "beyond", then the fourth level
  const t1 = pop(t, t0 - 0.1, 0.5) * (1 - prog(t, tObs - 0.3, tObs));
  around(ctx, 540, 470, t1, t1, () => {
    txt(ctx, '银河系之外', 540, 400, { size: 44, color: C.gold });
    txt(ctx, '还有许多星系', 540, 475, { size: 92, color: C.white, stroke: C.space, sw: 12 });
  });
  const t2 = pop(t, tObs - 0.1, 0.5);
  around(ctx, 540, 470, t2, t2, () => {
    txt(ctx, '第四层', 540, 400, { size: 44, color: C.gold });
    txt(ctx, '可观测宇宙', 540, 475, { size: 92, color: C.white, stroke: C.space, sw: 12 });
  });
}

// ---------- scene 6: the finished address, collected and sent ----------
const ROWS = [
  ['地球', '我们的星球', '地球'],
  ['地月系', '月球绕地球运行', '地月系'],
  ['太阳系', '太阳与八颗行星等', '太阳系'],
  ['银河系', '至少千亿颗恒星（估计）', '银河系'],
  ['可观测宇宙', '中心只是观测位置', '可观测'],
];
function rowIcon(ctx, t, i, x, y) {
  if (i === 0) earth(ctx, t, x, y, 34, { face: false });
  else if (i === 1) { earth(ctx, t, x - 10, y, 24, { face: false }); moon(ctx, t, x + 28, y - 18, 10, { face: false }); }
  else if (i === 2) {
    ctx.strokeStyle = 'rgba(43,26,85,0.35)'; ctx.lineWidth = 2;
    for (const r of [22, 34]) { ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.55, 0, 0, TAU); ctx.stroke(); }
    sun(ctx, t, x, y, 13, { face: false });
  } else if (i === 3) spiral(ctx, x, y, 38, { tilt: 0.55, rot: -0.3, hue: '120,110,230' });
  else {
    dashedCircle(ctx, x, y, 32, 1, { color: C.goldDeep, w: 4, dash: [7, 6] });
    ctx.fillStyle = C.goldDeep; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
  }
}

function recapScene(ctx, t) {
  const tGo = at('send', '出发'), tGot = at('send', '收到'), tCta = S('cta');
  const shrink = easeOut(prog(t, tCta - 0.3, tCta + 0.4));
  const sc = lerp(1, 0.78, shrink), cy = lerp(0, -110, shrink);
  ctx.save();
  ctx.translate(540, 300 + cy); ctx.scale(sc, sc); ctx.translate(-540, -300);
  const sp = pop(t, S('recap') - 0.3, 0.5);
  around(ctx, 540, 720, sp, sp, () => {
    card(ctx, 90, 300, 900, 840, { fill: '#fffaf0', edge: C.sunHot, ew: 0, drop: 14, r: 34 });
    ctx.fillStyle = C.sunHot;
    ctx.beginPath(); ctx.roundRect(90, 300, 900, 96, [34, 34, 0, 0]); ctx.fill();
    txt(ctx, '宇宙快递 · 完整收件地址', 540, 350, { size: 50, color: C.white });
    ROWS.forEach(([name, note, key], i) => {
      const y = 460 + i * 150, ti = at('recap', key);
      const on = t >= ti - 0.1;
      const k = pop(t, ti - 0.1, 0.4);
      if (on) {
        ctx.fillStyle = i === 4 ? 'rgba(255,201,60,0.35)' : 'rgba(76,201,240,0.16)';
        ctx.beginPath(); ctx.roundRect(120, y - 56, 840, 112, 24); ctx.fill();
      }
      ctx.save(); ctx.globalAlpha *= on ? 1 : 0.35;
      around(ctx, 200, y, on ? lerp(0.6, 1, k) : 0.8, 1, () => rowIcon(ctx, t, i, 200, y));
      txt(ctx, name, 270, y - 14, { size: 54, align: 'left', color: C.ink });
      txt(ctx, note, 270, y + 34, { size: 30, align: 'left', color: 'rgba(43,26,85,0.6)' });
      ctx.restore();
      if (i < 4) txt(ctx, '↓', 900, y + 75, { size: 44, color: on ? C.sunHot : 'rgba(43,26,85,0.25)' });
    });
    // collected stamp
    const st = pop(t, tGot - 0.1, 0.35);
    around(ctx, 770, 520, lerp(2.2, 1, Math.min(1, st)), st, () => {
      ctx.strokeStyle = C.red; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.roundRect(640, 455, 260, 130, 20); ctx.stroke();
      txt(ctx, '已揽收', 770, 522, { size: 64, color: C.red });
    }, -0.2);
  });
  ctx.restore();
  burst(ctx, t, tGot, 770, 520, { n: 12, r: 260 });
  confetti(ctx, t, tGo + 0.1);
  // call to action
  const cp = pop(t, tCta - 0.1, 0.5);
  around(ctx, 540, 1180, cp, cp, () => {
    card(ctx, 110, 1095, 860, 170, { fill: 'rgba(8,10,40,0.9)', edge: C.gold, ew: 5, drop: 0, r: 40 });
    txt(ctx, '你的宇宙地址', 540, 1150, { size: 46, color: C.gold });
    txt(ctx, '第一行写什么？评论区见！', 540, 1215, { size: 54, color: C.white });
  }, Math.sin(t * 3) * 0.02);
}

export const scenesC = [
  {
    id: 'beyond', from: S('beyond') - 0.5, to: S('recap') - 0.4, draw: beyondScene,
    zoom: { focus: [MILKY.x, MILKY.y], anchor: () => O, F: MILKY.r / 44 },
  },
  { id: 'recap', from: S('recap') - 0.4, to: 999, draw: recapScene },
];

export const eventsC = [
  ...[0, 1, 2, 3].map((i) => ({ type: 'pop', t: at('beyond', '许多') - 0.6 + i * 0.35, f: 600 + i * 150, amp: 0.7 })),
  { type: 'slam', t: at('alienB', '边界') - 0.1 },
  { type: 'sparkle', t: at('obs1', '可观测') },
  { type: 'whoosh', t: at('obs1', '信息') - 0.2, d: 0.8, from: 1200, to: 3000, amp: 0.5 },
  { type: 'buzz', t: at('obs2', '不是') },
  { type: 'pop', t: at('obs2', '中心') - 0.1, f: 900 },
  { type: 'buzz', t: at('alienO', '宇宙中心') },
  { type: 'tick', t: at('alienO', '观测位置') - 0.05, n: 84 },
  ...ROWS.map(([, , key], i) => ({ type: 'note', t: at('recap', key) - 0.1, n: 72 + [0, 4, 7, 12, 16][i] })),
  { type: 'stamp', t: at('send', '收到') - 0.08 },
  { type: 'tada', t: at('send', '出发') },
  { type: 'confetti', t: at('send', '出发') + 0.1 },
  { type: 'ding', t: S('cta') - 0.05, n: 88 },
];
