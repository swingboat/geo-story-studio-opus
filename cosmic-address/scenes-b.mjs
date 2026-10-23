// Scenes 3–4: the Solar System (second level) and the Milky Way (third level).
import { C, S, E, at, prog, lerp, easeOut, pop, fadeIn, txt, around, burst, talkLevel } from './lib.mjs';
import { sun, earth, moon, glow, comet } from './bodies.mjs';
import { tag } from './cast.mjs';
import { PLANETS, planet, belt, milkyWay, onDisk } from './cosmos.mjs';
import { MOON_EARTH } from './scenes-a.mjs';

const TAU = Math.PI * 2;
const SUN = [540, 900], TILT = 0.55;
const T0 = () => S('sun1') - 0.4 + 1.5; // planets hold still until the zoom has landed
const BASE = [0.4, 2.2, 0.75, 4.1, 2.9, 5.3, 1.3, 3.6];

// Illustrative positions only: not the planets' real positions on any date.
function planetPos(i, t) {
  const p = PLANETS[i], a = BASE[i] + Math.max(0, t - T0()) * p.speed * 0.22;
  return [SUN[0] + Math.cos(a) * p.orbit, SUN[1] + Math.sin(a) * p.orbit * TILT];
}

export function title(ctx, t, t0, small, big, a = 1) {
  const sp = pop(t, t0 - 0.1, 0.5) * a;
  around(ctx, 540, 520, sp, sp, () => {
    txt(ctx, small, 540, 430, { size: 44, color: C.gold });
    txt(ctx, big, 540, 525, { size: 120, color: C.white, stroke: C.space, sw: 14 });
  }, Math.sin(t * 2) * 0.03);
}

// ---------- scene 3: the Solar System ----------
function solarScene(ctx, t) {
  const tName = at('sun1', '太阳系'), tSun = at('sun1', '太阳', 1), tEight = at('sun1', '八颗');
  const tSat = at('sun1', '卫星'), tAst = at('sun1', '小行星'), tCom = at('sun1', '彗星');
  const tWho = S('alienS'), tMe = S('earthS'), tThird = at('earthS', '第三颗'), tDist = at('sun2', '1.5'), tPart = at('sun2', '一小部分');
  // orbits
  PLANETS.forEach((p, i) => {
    const op = easeOut(prog(t, tEight - 0.4 + i * 0.07, tEight + 0.5 + i * 0.07));
    ctx.save();
    ctx.strokeStyle = i === 2 ? 'rgba(76,201,240,0.6)' : 'rgba(255,255,255,0.22)'; ctx.lineWidth = i === 2 ? 4 : 2.5;
    ctx.setLineDash([8, 10]);
    ctx.beginPath(); ctx.ellipse(SUN[0], SUN[1], p.orbit, p.orbit * TILT, 0, 0, TAU * Math.max(op, i === 2 ? 1 : 0)); ctx.stroke();
    ctx.restore();
  });
  belt(ctx, t, SUN[0], SUN[1], 296, 296 * TILT, fadeIn(t, tAst, 0.5));
  // bodies, painted back to front
  const items = PLANETS.map((p, i) => ({ i, pos: planetPos(i, t) }));
  items.push({ i: -1, pos: SUN });
  items.sort((a, b) => a.pos[1] - b.pos[1]);
  const [ex, ey] = planetPos(2, t);
  for (const { i, pos: [x, y] } of items) {
    if (i < 0) {
      const sp = lerp(0.85, 1, pop(t, tSun - 0.1, 0.5));
      sun(ctx, t, x, y, 62 * sp, { look: 0.3, talk: 0 });
      continue;
    }
    const k = i === 2 ? 1 : pop(t, tEight - 0.1 + i * 0.08, 0.45);
    around(ctx, x, y, k, k, () => planet(ctx, t, x, y, PLANETS[i]));
    // the counting game: 1, 2, 3 — that's me
    const cp = pop(t, tThird - 0.5 + i * 0.22, 0.35) * (1 - prog(t, S('sun2') + 0.4, S('sun2') + 0.8));
    if (i < 3) around(ctx, x, y - 48, cp, cp, () => txt(ctx, String(i + 1), x, y - 50, { size: 46, color: i === 2 ? C.sky : C.white, stroke: C.space, sw: 8 }));
    const qp = pop(t, tWho + i * 0.05, 0.35) * (1 - prog(t, tMe - 0.2, tMe));
    if (qp > 0) around(ctx, x + 18, y - 40, qp, qp, () => txt(ctx, '?', x + 18, y - 40, { size: 44, color: C.gold, stroke: C.space, sw: 7 }));
  }
  // satellites twinkle around the giants, a comet streaks by
  const st = fadeIn(t, tSat, 0.3);
  if (st > 0) for (const j of [4, 5]) {
    const [x, y] = planetPos(j, t);
    for (let m = 0; m < 3; m++) {
      const a = t * 2 + m * 2.1;
      ctx.fillStyle = `rgba(230,232,245,${st})`;
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * 52, y + Math.sin(a) * 20, 4, 0, TAU); ctx.fill();
    }
  }
  burst(ctx, t, tSat, ...planetPos(4, t), { n: 6, r: 80, size: 12 });
  const cp = prog(t, tCom - 0.3, tCom + 2.2);
  if (cp > 0 && cp < 1) {
    const cx = lerp(1150, -100, cp), cy = lerp(560, 760, cp);
    comet(ctx, t, cx, cy, 14, Math.atan2(cy - SUN[1], cx - SUN[0]), 170);
  }
  // Earth–Moon highlight ring travels with Earth
  const hr = 34 + 4 * Math.sin(t * 4);
  ctx.save();
  ctx.strokeStyle = C.sky; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(ex, ey, hr, 0, TAU); ctx.stroke();
  ctx.restore();
  const ma = t * 1.6;
  moon(ctx, t, ex + Math.cos(ma) * 26, ey + Math.sin(ma) * 12, 5, { face: false });
  const lp = prog(t, T0() - 0.2, T0() + 0.3) * (1 - prog(t, tWho - 0.3, tWho));
  if (lp > 0) txt(ctx, '地月系', ex, ey + 62, { size: 34, color: C.sky, stroke: C.space, sw: 7 });
  // zoom bubble: Earth answers in close-up
  const zb = pop(t, tMe - 0.15, 0.45) * (1 - prog(t, S('sun2') + 0.2, S('sun2') + 0.6));
  if (zb > 0) {
    const bx = 790, by = 520;
    ctx.save();
    ctx.globalAlpha *= Math.min(1, zb);
    ctx.strokeStyle = 'rgba(76,201,240,0.7)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(ex, ey - hr); ctx.lineTo(bx - 60, by + 90); ctx.moveTo(ex + hr, ey); ctx.lineTo(bx + 60, by + 95); ctx.stroke();
    ctx.restore();
    around(ctx, bx, by, zb, zb, () => {
      ctx.fillStyle = 'rgba(8,10,40,0.9)'; ctx.strokeStyle = C.sky; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(bx, by, 120, 0, TAU); ctx.fill(); ctx.stroke();
      earth(ctx, t, bx, by, 88, { light: Math.PI, talk: talkLevel(t, ['earthS']), mood: 'happy', look: -0.6 });
    });
  }
  // titles and the sourced number
  title(ctx, t, tName, '第二层', '太阳系', 1 - prog(t, tWho - 0.3, tWho) + prog(t, S('sun2') + 0.4, S('sun2') + 0.8));
  const ip = fadeIn(t, tEight, 0.3) * (1 - prog(t, tWho - 0.3, tWho));
  if (ip > 0) {
    ctx.save(); ctx.globalAlpha *= ip;
    const words = [['太阳', tSun], ['8颗行星', tEight], ['卫星', tSat], ['小行星', tAst], ['彗星…', tCom]];
    words.forEach(([w, t0], k) => {
      const a = pop(t, t0 - 0.05, 0.35);
      around(ctx, 140 + k * 200, 1230, a, a, () => txt(ctx, w, 140 + k * 200 - (k === 1 ? 10 : 0), 1230, { size: 40, color: k === 1 ? C.gold : C.white, stroke: C.space, sw: 8 }));
    });
    ctx.restore();
  }
  tag(ctx, 470, 1270, '日地平均距离 约1.5亿千米', '轨道、大小与位置均为示意', { size: 46, a: pop(t, tDist - 0.1, 0.45) * (1 - prog(t, tPart - 0.3, tPart)) });
  const pp = pop(t, tPart - 0.1, 0.45);
  around(ctx, 470, 1280, pp, pp, () => txt(ctx, '地月系 = 太阳系的一小部分', 470, 1280, { size: 48, color: C.sky, stroke: C.space, sw: 9 }));
}

// ---------- scene 4: the Milky Way ----------
const MW = { x: 540, y: 900, r: 480 };
const SUN_UV = [0.5, 0.42];
export const sunInGalaxy = () => onDisk(MW.x, MW.y, MW.r, ...SUN_UV);
export const MILKY = MW;

function countUp(t, t0) {
  const p = easeOut(prog(t, t0 - 0.2, t0 + 1.0));
  return p >= 1 ? '至少 千亿颗 恒星' : `至少 ${Math.round(p * 1000)}亿 颗恒星`;
}

function galaxyScene(ctx, t) {
  const tName = at('gal1', '银河系'), tOne = at('gal1', '一颗恒星'), tNum = at('gal2', '千亿'), tEst = at('gal2', '估计值');
  const tWow = S('alienG');
  const flash = t > tWow && t < E('alienG') + 0.3 ? 0.25 + 0.25 * Math.sin(t * 20) : 0;
  milkyWay(ctx, t, MW.x, MW.y, MW.r, { a: 1 });
  if (flash > 0) glow(ctx, MW.x, MW.y, 0, MW.r, `rgba(255,255,255,${flash * 0.4})`);
  // the Sun: one golden dot well away from the centre (position is illustrative)
  const [sx, sy] = sunInGalaxy();
  const sp = pop(t, tOne - 0.15, 0.5);
  const br = 1 + 0.25 * Math.sin(t * 4);
  glow(ctx, sx, sy, 0, 30 * br, 'rgba(255,200,80,0.9)');
  ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(sx, sy, 7, 0, TAU); ctx.fill();
  around(ctx, sx, sy, sp, sp, () => {
    ctx.strokeStyle = C.gold; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(sx, sy, 40 * br, 0, TAU); ctx.stroke();
    txt(ctx, '太阳在这里', sx - 10, sy - 110, { size: 44, color: C.gold, stroke: C.space, sw: 9 });
    txt(ctx, '（位置示意）', sx - 10, sy - 66, { size: 30, color: 'rgba(255,255,255,0.75)', stroke: C.space, sw: 6 });
  });
  title(ctx, t, tName, '第三层', '银河系');
  // the star count rolls up, then gets an "estimate" stamp
  const cp = pop(t, tNum - 0.2, 0.4);
  around(ctx, 470, 1275, cp, cp, () => tag(ctx, 470, 1275, countUp(t, tNum), null, { size: 54 }));
  const ep = pop(t, tEst - 0.1, 0.4);
  around(ctx, 830, 1205, ep * lerp(2, 1, Math.min(1, ep)), ep, () => {
    ctx.strokeStyle = C.red; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.roundRect(735, 1165, 190, 80, 14); ctx.stroke();
    txt(ctx, '估计值', 830, 1205, { size: 48, color: C.red });
  }, -0.15);
}

export const scenesB = [
  {
    id: 'solar', from: S('sun1') - 0.4, to: S('gal1') - 0.5, draw: solarScene,
    zoom: { focus: [MOON_EARTH[0], MOON_EARTH[1]], anchor: (t) => planetPos(2, t), F: 12 },
  },
  {
    id: 'galaxy', from: S('gal1') - 0.5, to: S('beyond') - 0.5, draw: galaxyScene,
    zoom: { focus: SUN, anchor: sunInGalaxy, F: 22 },
  },
];

export const eventsB = [
  { type: 'pop', t: at('sun1', '太阳', 1) - 0.1, f: 500 },
  ...PLANETS.map((_, i) => ({ type: 'note', t: at('sun1', '八颗') - 0.1 + i * 0.08, n: 72 + [0, 2, 4, 7, 9, 12, 14, 16][i], amp: 0.6 })),
  { type: 'sparkle', t: at('sun1', '卫星') },
  { type: 'whoosh', t: at('sun1', '彗星') - 0.3, d: 1.2, from: 3000, to: 900, amp: 0.6 },
  { type: 'boing', t: S('alienS') },
  ...[0, 1, 2].map((i) => ({ type: 'tick', t: at('earthS', '第三颗') - 0.5 + i * 0.22, n: 79 + i * 2 })),
  { type: 'ding', t: at('sun2', '1.5') - 0.05, n: 91 },
  { type: 'pop', t: at('gal1', '一颗恒星') - 0.15, f: 1100 },
  { type: 'sparkle', t: at('gal2', '千亿') - 0.2 },
  { type: 'stamp', t: at('gal2', '估计值') - 0.05 },
  { type: 'buzz', t: S('alienG') + 0.1 },
];
void E;
