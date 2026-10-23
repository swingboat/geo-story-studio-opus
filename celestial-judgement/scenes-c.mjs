// Scenes 7–8: applicant 4 the sunspot (a darker patch of the Sun, not a star) and applicant 5 the satellite (state matters).
import { W, C, SANS, S, at, atEnd, prog, lerp, easeOut, pop, fadeIn, txt, card, around, burst, stamp, nameTag, talkLevel, star } from './lib.mjs';
import { face, sun, earth, SPOTS } from './bodies.mjs';
import { ticket, satellite, launchPad, orbit, onOrbit, tick, cross } from './props.mjs';

// ---------- scene 7: "我也算一颗黑色的星星吧？" ----------
const SX = 470, SY = 830, SR = 250;
const [spx, spy] = [SX + SPOTS[0][0] * SR, SY + SPOTS[0][1] * SR];

function sunspot(ctx, t) {
  const t0 = S('spotHi') - 0.35;
  around(ctx, W / 2, 400, pop(t, t0 + 0.3, 0.45), 1, () => ticket(ctx, W / 2, 400, 4));
  const ent = easeOut(prog(t, t0, t0 + 0.7));
  around(ctx, SX, SY, ent, ent, () => {
    sun(ctx, t, SX, SY, SR, { spots: 1 });
    // the talking spot stays on the surface: its face is drawn right on the umbra
    face(ctx, t, spx, spy, 30, { talk: talkLevel(t, ['spotHi']), mood: t > at('spotNo', '不是') ? 'sad' : 'happy', ink: '#3a1404' });
  });
  // thought bubble: a black star of its own (wishful thinking), crossed out at 不是哦
  const bt = at('spotHi', '星星'), bp = pop(t, bt - 0.3, 0.45) * (1 - prog(t, at('spotNo', '光球层'), at('spotNo', '光球层') + 0.3));
  around(ctx, 820, 560, bp, bp, () => {
    for (const [x, y, r] of [[700, 700, 12], [735, 655, 18]]) {
      ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath(); ctx.ellipse(850, 540, 150, 105, 0, 0, Math.PI * 2); ctx.fill();
    star(ctx, 850, 540, 70, '#2a2440', Math.sin(t * 2) * 0.1);
    if (t > at('spotNo', '不是')) cross(ctx, 930, 470, pop(t, at('spotNo', '不是'), 0.35));
  });
  // ring + leader line to the definition card
  const dt = at('spotNo', '较暗'), dp = fadeIn(t, dt - 0.2, 0.4);
  if (dp > 0) {
    ctx.save(); ctx.globalAlpha *= dp;
    ctx.strokeStyle = C.white; ctx.lineWidth = 6; ctx.setLineDash([12, 10]);
    ctx.beginPath(); ctx.arc(spx, spy, 66 + 4 * Math.sin(t * 8), 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]); ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(spx - 20, spy + 64); ctx.lineTo(380, 1160); ctx.stroke();
    ctx.restore();
  }
  nameTag(ctx, t, dt, 380, 1240, '较暗的区域', '在太阳光球层中', { color: C.amber, size: 66 });
  // brightness meter: the spot is still bright, just dimmer than its surroundings
  const mt = at('spotPart', '比周围'), mp = pop(t, mt - 0.2, 0.45);
  around(ctx, 900, 900, mp, mp, () => {
    card(ctx, 790, 620, 230, 470, { fill: 'rgba(8,10,40,0.88)', edge: C.gold, ew: 5, drop: 0, r: 28 });
    txt(ctx, '亮度', 905, 665, { size: 38, color: C.gold });
    const h1 = 300 * easeOut(prog(t, mt, mt + 0.6)), h2 = 210 * easeOut(prog(t, mt + 0.2, mt + 0.8));
    ctx.fillStyle = '#ffe680'; ctx.fillRect(820, 1010 - h1, 70, h1);
    ctx.fillStyle = '#e07a2a'; ctx.fillRect(920, 1010 - h2, 70, h2);
    txt(ctx, '周围', 855, 1045, { size: 30, font: SANS, color: C.white });
    txt(ctx, '黑子', 955, 1045, { size: 30, font: SANS, color: C.white });
  });
  stamp(ctx, t, at('spotPart', '局部'), W / 2, 600, '太阳的局部', { color: C.hot, size: 96, rot: -0.08 });
  burst(ctx, t, at('spotPart', '局部'), W / 2, 600, { r: 340, n: 14, colors: [C.gold, C.hot, C.amber] });
}

// ---------- scene 8: same satellite, two states ----------
const L = { x: 40, y: 500, w: 470, h: 720 }, R = { x: 570, y: 500, w: 470, h: 720 };

function panel(ctx, p, title, color, a) {
  ctx.save(); ctx.globalAlpha *= a;
  card(ctx, p.x, p.y, p.w, p.h, { fill: 'rgba(10,14,50,0.75)', edge: color, ew: 5, drop: 0, r: 34 });
  card(ctx, p.x + p.w / 2 - 120, p.y - 34, 240, 68, { fill: color, edge: C.ink, ew: 4, drop: 0, r: 34 });
  txt(ctx, title, p.x + p.w / 2, p.y + 2, { size: 42, color: C.ink });
  ctx.restore();
}

function satScene(ctx, t) {
  const t0 = S('satHi') - 0.35;
  around(ctx, W / 2, 400, pop(t, t0 + 0.3, 0.45), 1, () => ticket(ctx, W / 2, 400, 5));
  // left: on the ground, wings folded
  const la = fadeIn(t, t0, 0.5);
  panel(ctx, L, '待发射', C.amber, la);
  ctx.save(); ctx.globalAlpha *= la;
  ctx.save(); ctx.beginPath(); ctx.roundRect(L.x, L.y, L.w, L.h, 34); ctx.clip();
  ctx.fillStyle = '#26324a'; ctx.fillRect(L.x, 1110, L.w, 120);
  launchPad(ctx, 290, 1110, 1);
  ctx.fillStyle = '#5a6684'; ctx.fillRect(250, 1012, 80, 98);
  satellite(ctx, t, 290, 945, 1.1, { open: 0 });
  face(ctx, t, 290, 950, 44, { talk: talkLevel(t, ['satHi']), mood: t > at('satWait', '不算') ? 'sad' : 'happy' });
  ctx.restore();
  ctx.restore();
  const np = pop(t, at('satWait', '待发射'), 0.4);
  around(ctx, 275, 1170, np, np, () => txt(ctx, '尚未入轨', 275, 1170, { size: 46, color: C.amber, stroke: C.ink, sw: 8 }));
  // ≠ badge between the panels
  const ne = pop(t, at('satWait', '不等于'), 0.4);
  around(ctx, W / 2, 860, ne, ne, () => {
    ctx.fillStyle = C.no; ctx.beginPath(); ctx.arc(W / 2, 860, 52, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.white; ctx.lineWidth = 5; ctx.stroke();
    txt(ctx, '≠', W / 2, 864, { size: 76, font: 'RoundB, UniB', color: C.white });
  });
  // right: in Earth orbit, wings open
  const rt = at('satWait', '已入轨'), ra = fadeIn(t, rt - 0.2, 0.5);
  panel(ctx, R, '入轨运行', C.sky, ra);
  if (ra > 0) {
    ctx.save(); ctx.globalAlpha *= ra;
    ctx.save(); ctx.beginPath(); ctx.roundRect(R.x, R.y, R.w, R.h, 34); ctx.clip();
    const ex = R.x + R.w / 2, ey = 900;
    orbit(ctx, ex, ey, 190, 210, 1, 'rgba(160,220,255,0.6)');
    earth(ctx, t, ex, ey, 105);
    const ang = -Math.PI * 0.75 + (t - rt) * 0.55;
    const [ox, oy] = onOrbit(ex, ey, 190, 210, ang);
    satellite(ctx, t, ox, oy, 0.38, { open: 1, rot: ang + Math.PI / 2 });
    ctx.restore();
    ctx.restore();
  }
  const ot = at('satOrbit', '人造天体'), op = pop(t, ot, 0.45);
  around(ctx, 805, 1170, op, op, () => {
    card(ctx, 620, 1128, 370, 84, { fill: C.ok, edge: C.ink, ew: 4, drop: 0, r: 42 });
    txt(ctx, '人造天体', 775, 1172, { size: 48, color: C.ink });
    tick(ctx, 935, 1170, 0.65, '#178a5a');
  });
  burst(ctx, t, ot, 805, 1170, { r: 280 });
  // note: supplementary knowledge, kept apart from the textbook scope
  const nt = at('satNote', '补充知识'), npp = pop(t, nt, 0.45);
  around(ctx, W / 2, 1320, npp, npp, () => {
    ctx.save();
    ctx.fillStyle = 'rgba(255,246,224,0.95)'; ctx.strokeStyle = C.lilac; ctx.lineWidth = 5; ctx.setLineDash([14, 10]);
    ctx.beginPath(); ctx.roundRect(150, 1268, 780, 104, 30); ctx.fill(); ctx.stroke();
    ctx.restore();
    txt(ctx, '补充知识 · 和课本范围分开', W / 2, 1322, { size: 48, color: '#5a3d9a' });
  });
}

export const scenes = [
  { from: S('spotHi') - 0.35, to: S('satHi') - 0.35, draw: sunspot },
  { from: S('satHi') - 0.35, to: S('quiz') - 0.35, draw: satScene },
];

export const events = [
  { t: S('spotHi') - 0.3, type: 'ding', n: 81 },
  { t: at('spotHi', '星星') - 0.3, type: 'sparkle' },
  { t: at('spotNo', '不是'), type: 'buzz' },
  { t: at('spotNo', '较暗'), type: 'pop', f: 600 },
  { t: at('spotPart', '比周围'), type: 'scribble', d: 0.7 },
  { t: at('spotPart', '局部'), type: 'stamp', shake: 16 },
  { t: S('satHi') - 0.3, type: 'ding', n: 83 },
  { t: at('satWait', '待发射'), type: 'pop', f: 500 },
  { t: at('satWait', '不等于'), type: 'buzz' },
  { t: at('satWait', '已入轨') - 0.2, type: 'whoosh', d: 0.6, from: 600, to: 2600 },
  { t: at('satOrbit', '人造天体'), type: 'tada', amp: 0.8 },
  { t: at('satNote', '补充知识'), type: 'pop', f: 900 },
];
