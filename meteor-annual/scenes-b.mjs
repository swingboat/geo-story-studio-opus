// Scenes B1–B4: the debris stream forms, Earth's orbit crosses it, grains enter the atmosphere, a meteor shower.
import {
  C, S, E, at, endAt, prog, ease, lerp, fade, pop, alpha, around, text, header,
  pill, meteor, rand, talk, glow,
} from './lib.mjs';
import { grain, nucleus } from './chars.mjs';
import {
  project, cometPos, streamPath, streamGrains, plane, node, solarCore, earthAt, orbitArrow, NODE, NU0,
} from './orbit.mjs';

// ---------- B1: grains spread along the comet's orbit ----------
function streamScene(ctx, t) {
  const named = at('stream', '碎屑');
  header(ctx, t, S('stream'), '03 / 一条看不见的“路”', t < named ? '颗粒越散越开……' : '铺成一条碎屑流', '沿着彗星轨道 · 颗粒一直在运动');
  const spread = 0.03 + 0.97 * ease(prog(t, S('stream'), named));
  const nuC = lerp(-0.9, 0.9, prog(t, S('stream'), E('stream')));
  const path = fade(t, at('stream', '沿着'), 0.8);
  streamPath(ctx, -1, path);
  streamGrains(ctx, t, -1, { spread, nuC });
  plane(ctx, 0.35);
  solarCore(ctx, t);
  streamPath(ctx, 1, path);
  streamGrains(ctx, t, 1, { spread, nuC, bright: fade(t, named) });
  const ca = 1 - fade(t, E('stream'), 0.8);
  if (ca > 0) {
    const p = project(cometPos(nuC));
    alpha(ctx, ca, () => {
      glow(ctx, p.x, p.y, 40, 'rgba(160,225,255,0.4)');
      nucleus(ctx, p.x, p.y, 16, t, 1);
      text(ctx, '彗星', p.x - 50, p.y + 34, 26, C.dim);
    });
  }
  alpha(ctx, fade(t, named), () => pill(ctx, '碎屑流', 820, 560, C.gold, 36));
  // the grain rides its stream right through the future crossing point
  const ride = prog(t, S('wait'), E('wait') + 0.3);
  if (ride > 0) {
    const g = project(cometPos(lerp(0.55, 1.75, ride)));
    alpha(ctx, fade(t, S('wait') - 0.2), () => grain(ctx, g.x, g.y - 34, 26, t, { mouth: talk(t, ['wait']) }));
    alpha(ctx, fade(t, at('wait', '好多年')), () => pill(ctx, '转呀转……好多年', 300, 1330, C.gold, 34));
  }
}

// ---------- B2: Earth's orbit crosses the stream ----------
function crossScene(ctx, t) {
  header(ctx, t, S('cross'), '04 / 两条路相交', '偏偏从这里穿过！', '地球公转轨道 × 碎屑流');
  streamPath(ctx, -1); streamGrains(ctx, t, -1);
  plane(ctx, fade(t, S('cross') - 0.3, 0.6) * 0.65 + 0.35);
  solarCore(ctx, t);
  streamPath(ctx, 1); streamGrains(ctx, t, 1);
  orbitArrow(ctx, NODE + 2.3);
  text(ctx, '地球公转轨道', 230, 1240, 28, C.blue);
  const hit = at('cross', '穿过');
  node(ctx, t, fade(t, at('cross', '偏偏')), t > hit ? '交会处' : '');
  const th = lerp(NODE - 1.7, NODE, ease(prog(t, S('cross'), hit + 0.2)));
  earthAt(ctx, t, th, 46, { mouth: talk(t, ['cross']), mood: t > hit ? 'proud' : 'normal' });
}

// ---------- B3: into the atmosphere ----------
const topY = (x) => 815 + 195 * ((x - 540) / 690) ** 2;
function atmosphereBand(ctx) {
  const g = ctx.createLinearGradient(0, 760, 0, 1300);
  g.addColorStop(0, 'rgba(70,160,225,0.2)'); g.addColorStop(1, 'rgba(25,70,125,0.55)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-150, 1010); ctx.quadraticCurveTo(540, 620, 1230, 1010);
  ctx.lineTo(1230, 1450); ctx.quadraticCurveTo(540, 980, -150, 1450); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#6cc4ee'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-150, 1010); ctx.quadraticCurveTo(540, 620, 1230, 1010); ctx.stroke();
  ctx.fillStyle = '#0d2a3a';
  ctx.beginPath(); ctx.moveTo(-150, 1450); ctx.quadraticCurveTo(540, 980, 1230, 1450); ctx.lineTo(1230, 1460); ctx.lineTo(-150, 1460); ctx.closePath(); ctx.fill();
}
const ENTRIES = [
  { s: at('entry', '颗粒'), b: endAt('entry', '大气'), e: at('entry', '划'), x: 420 },
  { s: at('entry', '冲'), b: at('entry', '燃烧'), e: at('entry', '迹'), x: 640 },
  { s: at('entry', '燃烧'), b: at('entry', '划'), e: E('entry') + 0.3, x: 830 },
  { s: at('entry', '划'), b: at('entry', '迹') + 0.1, e: S('shine') + 0.6, x: 300 },
];
function streak(ctx, x0, t, s, b, e) {
  const by = topY(x0);
  if (t < b) {
    const p = prog(t, s, b);
    return { x: lerp(x0 - 150, x0, p), y: lerp(by - 230, by, p), lit: 0 };
  }
  const p = prog(t, b, e);
  return { x: lerp(x0, x0 + 190, p), y: lerp(by, by + 290, p), lit: 1 - prog(p, 0.75, 1), p };
}
function atmosphereScene(ctx, t) {
  header(ctx, t, S('entry'), '05 / 冲进大气', '燃烧发光，就是流星', '太空里的流星体，本身是暗的');
  atmosphereBand(ctx);
  pill(ctx, '太空', 960, 610, C.dim, 30);
  pill(ctx, '大气', 140, 1060, C.blue, 30);
  text(ctx, '地面', 540, 1390, 28, C.dim);
  for (const m of ENTRIES) {
    if (t < m.s || t > m.e) continue;
    const q = streak(ctx, m.x, t, m.s, m.b, m.e);
    if (!q.lit && t < m.b) { glow(ctx, q.x, q.y, 10, 'rgba(160,170,185,0.8)'); continue; }
    meteor(ctx, q.x, q.y, lerp(30, 200, Math.min(1, q.p * 5)), Math.atan2(290, 190), q.lit);
  }
  alpha(ctx, fade(t, at('entry', '光迹')), () => pill(ctx, '光迹 = 流星', 760, 1210, C.gold, 34));
  // the grain waits in space, shouts, then dives in and lights up
  const go = S('shine'), lit = at('shine', '亮');
  const dive = prog(t, go, lit), after = prog(t, lit, lit + 0.9);
  const bx = 330, by = topY(bx);
  let gx = lerp(170, bx, ease(dive)), gy = lerp(660, by, ease(dive)) + Math.sin(t * 3) * 8 * (1 - dive);
  if (after > 0) { gx = lerp(bx, bx + 150, after); gy = lerp(by, by + 230, after); }
  if (after > 0) meteor(ctx, gx, gy, 60 + after * 160, Math.atan2(230, 150), 1 - prog(after, 0.6, 1));
  alpha(ctx, 1 - prog(after, 0.45, 0.85), () =>
    grain(ctx, gx, gy, lerp(30, 24, after), t, { mouth: talk(t, ['shine']), heat: fade(t, lit - 0.1, 0.25), rot: dive * 0.6 }));
  alpha(ctx, (1 - fade(t, go - 0.2)) * fade(t, S('entry') + 0.3), () => pill(ctx, '流星体（暗）', 190, 570, C.dim, 30));
}

// ---------- B4: ground view, many meteors from one radiant ----------
const RAD = { x: 560, y: 720 };
const RAIN = [...Array(64)].map((_, i) => ({ t0: S('shower') - 0.2 + i * 0.09 + rand(i + 60) * 0.1, ang: rand(i + 80) * Math.PI * 2, d0: 60 + rand(i + 90) * 140 }));
function showerScene(ctx, t) {
  header(ctx, t, S('shower'), '06 / 抬头看', t < at('shower', '流星雨') ? '像从同一处射出' : '这就是流星雨！', '流星的路径反向延长，交于辐射点');
  const back = fade(t, at('shower', '同一'));
  ctx.save(); ctx.beginPath(); ctx.rect(0, 470, 1080, 820); ctx.clip();
  for (const m of RAIN) {
    const p = prog(t, m.t0, m.t0 + 0.8);
    if (p <= 0 || p >= 1) continue;
    const d = m.d0 + p * 330, x = RAD.x + Math.cos(m.ang) * d, y = RAD.y + Math.sin(m.ang) * d;
    if (back > 0) alpha(ctx, back * 0.5 * Math.sin(p * Math.PI), () => {
      ctx.setLineDash([6, 10]); ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(RAD.x, RAD.y); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]);
    });
    meteor(ctx, x, y, 110 + p * 100, m.ang, Math.sin(p * Math.PI));
  }
  ctx.restore();
  around(ctx, RAD.x, RAD.y, pop(t, at('shower', '同一')), back, () => {
    glow(ctx, RAD.x, RAD.y, 60, 'rgba(255,220,150,0.5)');
    pill(ctx, '辐射点 · 英仙座方向', RAD.x, RAD.y - 90, C.gold, 30);
  });
  ctx.save(); ctx.fillStyle = '#071226';
  ctx.beginPath(); ctx.moveTo(0, 1440);
  for (const [x, y] of [[0, 1300], [200, 1230], [380, 1310], [560, 1210], [760, 1300], [940, 1240], [1080, 1290]]) ctx.lineTo(x, y);
  ctx.lineTo(1080, 1440); ctx.closePath(); ctx.fill(); ctx.restore();
}

export const scenes = [
  { from: S('stream'), to: S('cross'), draw: streamScene },
  { from: S('cross'), to: S('entry'), draw: crossScene },
  { from: S('entry'), to: S('shower'), draw: atmosphereScene },
  { from: S('shower'), to: S('key'), draw: showerScene },
];
export const events = [
  { type: 'sparkle', t: at('stream', '碎屑'), amp: 0.4 },
  { type: 'note', t: S('wait'), n: 79, amp: 0.5 },
  { type: 'ding', t: at('cross', '穿过'), amp: 0.6 },
  ...ENTRIES.map((m) => ({ type: 'whoosh', t: m.b, d: 0.6, amp: 0.3 })),
  { type: 'boing', t: S('shine') },
  { type: 'whoosh', t: at('shine', '亮'), d: 0.8, amp: 0.5, from: 700, to: 3500 },
  { type: 'sparkle', t: at('shine', '亮'), amp: 0.5 },
  ...RAIN.filter((_, i) => i % 7 === 0).map((m) => ({ type: 'whoosh', t: m.t0, d: 0.5, amp: 0.12 })),
  { type: 'ding', t: at('shower', '流星雨'), n: 91, amp: 0.6 },
];
