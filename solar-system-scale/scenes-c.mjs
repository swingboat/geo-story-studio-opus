// Scenes C: "the second ruler" tape-measure title, then the top-down walk from the Sun ball across the school playground.
import { C, NUM, SANS, S, E, at, prog, lerp, clamp, easeOut, pop, fadeIn, txt, card, around, arrow, stamp, talkLevel, rand } from './lib.mjs';
import { planet, pin, glow, P } from './bodies.mjs';
import { setCamera, camera, track, drawMap, scaleBar, compass } from './map.mjs';
import { outerUnder, outerOver, gateGlow, mapFade, REVEAL } from './scenes-d.mjs';

// ---------- turn: a tape measure unrolls ----------
function turn(ctx, t) {
  const tp = pop(t, S('turn') + 0.1, 0.45);
  around(ctx, 540, 600, tp, tp, () => {
    txt(ctx, '第二把尺', 540, 600, { size: 110, color: C.gold, stroke: C.ink, sw: 14 });
  });
  const u = easeOut(prog(t, at('turn', '重头戏'), at('turn', '距离')));
  const x0 = 170, x1 = lerp(x0, 1010, u), y = 900;
  ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.roundRect(x0, y - 36, x1 - x0, 72, 8); ctx.fill(); ctx.stroke();
  for (let x = x0 + 30, i = 1; x < x1 - 4; x += 30, i++) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = i % 5 ? 3 : 5;
    ctx.beginPath(); ctx.moveTo(x, y - 36); ctx.lineTo(x, y - (i % 5 ? 16 : 2)); ctx.stroke();
  }
  ctx.fillStyle = '#ff8a3c';
  ctx.beginPath(); ctx.roundRect(60, y - 90, 170, 180, 40); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffe2c4';
  ctx.beginPath(); ctx.arc(145, y, 46, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  stamp(ctx, t, at('turn', '距离'), 540, 1150, '比距离！', { color: C.sky, size: 110, rot: -0.06 });
}

// ---------- walk: the camera and the walker ----------
const M = (n) => P[n].m;
setCamera([
  [S('walk') - 0.5, 50, 7, 900],
  [S('mars') - 0.4, 50, 7, 900],
  [at('mars', '179米') + 0.3, 150, 4.2, 860],
  [at('mars', '再'), 150, 4.2, 860],
  [at('mars', '小行星') - 0.3, 270, 2.4, 860],
  [E('mars'), 270, 2.4, 860],
  [at('jupd', '611米') + 0.2, 520, 1.2, 900],
  [S('out') - 0.2, 520, 1.2, 900],
  [at('out', '1.1公里') + 0.3, 900, 0.62, 860],
  [at('out', '2.3公里') + 0.3, 1450, 0.42, 840],
  [at('out', '3.5公里') + 0.4, 1765, 0.3, 820],
  [S('empty'), 1765, 0.3, 820],
  [E('empty') + 0.4, 1765, 0.27, 830],
]);
const WALK = [
  [at('walk', '出发'), 0], [at('walk', '45米'), M('水星')], [at('walk', '85米'), M('金星')], [at('earthd', '117米'), M('地球')],
  [S('mars') - 0.3, M('地球')], [at('mars', '179米') + 0.1, M('火星')],
  [E('mars') - 0.2, M('火星')], [at('jupd', '611米') + 0.1, M('木星')],
  [S('out') - 0.1, M('木星')], [at('out', '1.1公里'), M('土星')], [at('out', '2.3公里'), M('天王星')], [at('out', '3.5公里'), M('海王星')],
];
const INNER = [['水星', 1], ['金星', -1], ['地球', 1], ['火星', -1]];
const fmt = (m) => (m < 1000 ? `${Math.round(m)} 米` : `${(m / 1000).toFixed(1)} 公里`);

function walker(ctx, t, x, y) {
  const r = 30 + 4 * Math.sin(t * 6);
  ctx.fillStyle = 'rgba(76,201,240,0.25)';
  ctx.beginPath(); ctx.arc(x, y, r + 18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.sky; ctx.strokeStyle = C.white; ctx.lineWidth = 6; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x, y - 30); ctx.lineTo(x + 24, y + 24); ctx.lineTo(x, y + 12); ctx.lineTo(x - 24, y + 24); ctx.closePath();
  ctx.fill(); ctx.stroke();
}

function bracket(ctx, x, y0, y1, color, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.moveTo(x - 16, y0); ctx.lineTo(x + 16, y0); ctx.moveTo(x - 16, y1); ctx.lineTo(x + 16, y1); ctx.stroke();
  ctx.restore();
}

function walk(ctx, t) {
  const cam = camera(t);
  const { X, Y, k } = cam;
  const s = track(WALK, t);
  drawMap(ctx, cam, t, { fade: mapFade(t), gate: gateGlow(t) });

  // asteroid belt: an annulus around the Sun between about 2.2 and 3.2 AU
  const ba = fadeIn(t, at('mars', '火星', 1) - 0.2, 0.6) * (1 - prog(t, S('out'), S('out') + 0.6));
  if (ba > 0) {
    ctx.save(); ctx.globalAlpha *= ba;
    ctx.fillStyle = '#c9c1b6';
    for (let i = 0; i < 520; i++) {
      const r = (2.2 + rand(i) * 1.0) * 117.4, th = Math.PI / 2 + (rand(i + 700) - 0.5) * 2.6;
      ctx.beginPath(); ctx.arc(X(r * Math.cos(th)), Y(r * Math.sin(th)), 1.5 + 2 * rand(i + 99), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  outerUnder(ctx, t, cam);

  // walked trail
  ctx.strokeStyle = 'rgba(76,201,240,0.85)'; ctx.lineWidth = 8; ctx.setLineDash([2, 14]); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(0), Y(s)); ctx.stroke();
  ctx.setLineDash([]);

  // the Sun ball, true size (1.1 m)
  const sr = Math.max(5, 0.55 * k);
  glow(ctx, X(0), Y(0), 0, sr * 3 + 20, 'rgba(255,200,60,0.75)');
  ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(X(0), Y(0), sr, 0, Math.PI * 2); ctx.fill();

  // football pitch bracket (+12 m beyond it), then 1 AU bracket
  const fa = fadeIn(t, at('earthd', '足球场') - 0.2, 0.3) * (1 - prog(t, S('au') - 0.3, S('au')));
  bracket(ctx, X(-40), Y(0), Y(105), C.white, fa);
  if (fa > 0) {
    ctx.save(); ctx.globalAlpha *= fa;
    txt(ctx, '足球场', X(-40) - 26, Y(60), { size: 40, color: C.white, align: 'right', stroke: C.ink, sw: 6 });
    txt(ctx, '约105米', X(-40) - 26, Y(60) + 48, { size: 36, font: NUM, color: C.white, align: 'right', stroke: C.ink, sw: 6 });
    ctx.strokeStyle = C.gold; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(X(0) - 30, Y(105)); ctx.lineTo(X(0) - 30, Y(117.4)); ctx.stroke();
    ctx.restore();
  }
  const aa = fadeIn(t, at('au', '日地') - 0.2, 0.3) * (1 - prog(t, S('mars') - 0.3, S('mars')));
  bracket(ctx, X(52), Y(0), Y(117.4), C.gold, aa);
  const ap = pop(t, at('au', '天文单位') - 0.4, 0.45) * (1 - prog(t, S('mars') - 0.3, S('mars')));
  const cx = Math.min(X(52), 870), cy = Y(22);
  around(ctx, cx, cy, ap, ap, () => {
    card(ctx, cx - 190, cy - 85, 380, 170, { fill: 'rgba(8,10,40,0.94)', edge: C.gold, ew: 6, drop: 0, r: 30 });
    txt(ctx, '1 天文单位', cx, cy - 30, { size: 54, color: C.gold });
    txt(ctx, '≈ 1.5 亿千米', cx, cy + 38, { size: 44, font: NUM, color: C.white });
  });

  // inner pins fade into one "playground" label as we zoom out
  const ia = clamp((k - 1.5) / 1.0);
  for (const [name, side] of INNER) pin(ctx, t, X(0), Y(P[name].m), name, `${Math.round(P[name].m)} 米`, { a: ia * pop(t, REVEAL[name](), 0.4), side, sc: pop(t, REVEAL[name](), 0.4) });
  pin(ctx, t, X(0), Y(0), '太阳', '直径 1.1 米', { a: clamp((k - 1.5) / 1.0) * fadeIn(t, S('walk') - 0.3, 0.3), side: -1, color: C.gold, icon: false });
  pin(ctx, t, X(0) - 10, Y(80), '学校操场', '水·金·地·火', { a: clamp((1.8 - k) / 0.6) * (1 - prog(t, at('empty', '豆子'), at('empty', '豆子') + 0.4)), side: -1, icon: false, color: C.mint });

  const ab = pop(t, at('mars', '小行星') - 0.1, 0.45);
  around(ctx, X(0) + 170, Y(317), ab * ba, ab * ba, () => {
    card(ctx, X(0) + 50, Y(317) - 38, 240, 76, { fill: '#c9c1b6', edge: C.ink, ew: 4, drop: 0, r: 38 });
    txt(ctx, '小行星带', X(0) + 170, Y(317) + 2, { size: 44, color: C.ink });
  });

  walker(ctx, t, X(0), Y(s));

  // Earth looks back at the far-away Sun
  if (t > S('far') - 0.3 && t < S('au') + 0.4) {
    const ea = pop(t, S('far') - 0.3, 0.4) * (1 - prog(t, S('au'), S('au') + 0.4));
    const ex = X(0) - 200, ey = Y(M('地球')) - 10;
    around(ctx, ex, ey, ea, ea, () => {
      ctx.fillStyle = 'rgba(8,10,40,0.9)';
      ctx.beginPath(); ctx.arc(ex, ey, 82, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.sky; ctx.lineWidth = 6; ctx.stroke();
      planet(ctx, t, '地球', ex, ey + 4, 62, { face: true, mood: 'wow', talk: talkLevel(t, ['far']), look: -0.3 });
    });
    arrow(ctx, ex, ey + 100, X(0) - 30, Y(0) - 40, { color: C.sky, w: 6, head: 26, dash: [12, 12], p: ea });
  }

  outerOver(ctx, t, cam);

  // HUD: distance from the Sun, a scale bar and a north arrow
  const ha = fadeIn(t, S('walk') - 0.3, 0.4) * (1 - prog(t, at('time', '四十多分钟') - 0.6, at('time', '四十多分钟') - 0.2));
  if (ha > 0) {
    ctx.save(); ctx.globalAlpha *= ha;
    card(ctx, 640, 185, 400, 110, { fill: 'rgba(6,8,30,0.9)', edge: C.sky, ew: 4, drop: 0, r: 30 });
    txt(ctx, '距太阳', 668, 240, { size: 32, font: SANS, color: 'rgba(255,255,255,0.7)', align: 'left' });
    txt(ctx, fmt(s), 1010, 242, { size: 58, font: NUM, color: C.sky, align: 'right' });
    ctx.restore();
  }
  scaleBar(ctx, cam, ha);
  compass(ctx, fadeIn(t, S('walk') - 0.3, 0.4) * (1 - prog(t, at('empty', '空旷'), at('empty', '空旷') + 0.5)));
}

export const scenes = [
  { from: S('turn') - 0.25, to: S('walk') - 0.5, draw: turn },
  { from: S('walk') - 0.5, to: S('ruler') - 0.3, draw: walk },
];

const steps = [];
for (let i = 0; i < 4; i++) {
  const [t0] = WALK[i], [t1] = WALK[i + 1];
  for (let tt = t0 + 0.1; tt < t1 - 0.1; tt += 0.28) steps.push({ t: tt, type: 'pop', f: steps.length % 2 ? 300 : 360, amp: 0.35 });
}

export const events = [
  { t: S('turn'), type: 'whoosh' },
  { t: at('turn', '距离'), type: 'stamp', shake: 10 },
  ...steps,
  ...INNER.map(([n]) => ({ t: REVEAL[n](), type: 'pop' })),
  { t: at('earthd', '117米') + 0.1, type: 'ding' },
  { t: at('earthd', '足球场') - 0.2, type: 'pop' },
  { t: S('far') - 0.3, type: 'boing' },
  { t: at('au', '天文单位') - 0.4, type: 'sparkle' },
  { t: at('mars', '小行星') - 0.1, type: 'pop' },
  { t: E('mars') - 0.2, type: 'whoosh' },
];
