// Scenes 5–7: uneven spread → gravity gathers a nebula → zoom out to the whole interstellar medium → the answer.
import { W, H, C, TAU, rnd, S, E, DURATION, at, prog, lerp, easeOut, easeIO, pop, fadeIn, txt, around, burst, arrow, talkLevel, confetti } from './lib.mjs';
import { astronaut, gasDot, dustGrain, nebulaCloud, babyStar, sparkleStar, glow } from './cast.mjs';
import { title, tag, stamp, field } from './props.mjs';
import { twoStars, GAP } from './scenes-a.mjs';

const INK = '#0a0828';
const CL = [640, 1010];

// ---------- scene 5: sparse here, clumped into a nebula there ----------
// a few lonely particles in the upper left, many that will fall together in the lower right
const SPARSE = [...Array(9)].map((_, i) => [110 + rnd(i + 11) * 400, 520 + rnd(i + 23) * 380]);
const CLUMP = [...Array(64)].map((_, i) => {
  const home = [80 + rnd(i + 101) * 920, 520 + rnd(i + 151) * 820];
  if (home[0] < 520 && home[1] < 920) home[0] += 480;
  const a = rnd(i + 201) * TAU, d = Math.sqrt(rnd(i + 251)) * 200;
  return { home, goal: [CL[0] + Math.cos(a) * d * 1.2, CL[1] + Math.sin(a) * d * 0.8], delay: rnd(i + 301) * 0.6 };
});

function cloudScene(ctx, t) {
  const t0 = S('uneven'), tSp = at('sparse', '稀稀拉拉'), tG = at('cloud', '引力'), tPull = at('cloud', '拉到一起');
  const tCl = at('cloud', '一大片云'), tNeb = at('cloud', '星云'), tBirth = at('birth', '新的恒星');
  title(ctx, t, t0, '它们，分布并不均匀', '有的稀疏，有的聚集成云', { t1: S('birth') - 0.3 });
  title(ctx, t, S('birth'), '星云里，还能诞生新恒星', '在合适的致密区域', { subColor: C.pink });
  // the sparse corner
  field(ctx, t, SPARSE.length, (i) => SPARSE[i], { r: 9, alpha: () => fadeIn(t, t0 - 0.3, 0.5), seed: 7 });
  const sp = fadeIn(t, tSp - 0.2, 0.4);
  if (sp > 0) {
    ctx.save(); ctx.globalAlpha *= sp;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 4; ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 30;
    ctx.beginPath(); ctx.ellipse(310, 710, 250, 230, 0, 0, TAU); ctx.stroke();
    ctx.restore();
    const p = pop(t, tSp - 0.1, 0.45);
    around(ctx, 310, 970, p, p, () => tag(ctx, 310, 970, '稀疏', '稀稀拉拉', { color: C.gas, size: 50 }));
  }
  // gravity pulls the rest together
  const pull = (i) => easeIO(prog(t, tG + CLUMP[i].delay, tPull + 0.9 + CLUMP[i].delay));
  field(ctx, t, CLUMP.length, (i) => {
    const { home, goal } = CLUMP[i], k = pull(i);
    return [lerp(home[0], goal[0], k), lerp(home[1], goal[1], k)];
  }, { r: 9, drift: 10, alpha: (i) => fadeIn(t, t0 - 0.3 + (i % 8) * 0.04, 0.5) * (1 - 0.55 * prog(t, tCl, tCl + 1)), seed: 3 });
  const gA = fadeIn(t, tG - 0.1, 0.3) * (1 - prog(t, tCl, tCl + 0.5));
  if (gA > 0) {
    ctx.save(); ctx.globalAlpha *= gA;
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * TAU + 0.3, wob = ((t * 1.4 + k * 0.17) % 1);
      const r1 = 330 - wob * 60, r2 = 200 - wob * 60;
      arrow(ctx, CL[0] + Math.cos(a) * r1, CL[1] + Math.sin(a) * r1 * 0.8, CL[0] + Math.cos(a) * r2, CL[1] + Math.sin(a) * r2 * 0.8, { color: C.gold, w: 8, head: 26 });
    }
    txt(ctx, '引力', CL[0], CL[1], { size: 72, color: C.gold, stroke: INK, sw: 12 });
    ctx.restore();
  }
  // the cloud blooms
  const cr = 300 * easeOut(prog(t, tCl - 0.3, tCl + 1.2));
  nebulaCloud(ctx, t, CL[0], CL[1], cr, { a: fadeIn(t, tCl - 0.3, 0.8) });
  stamp(ctx, CL[0] - 40, 1300, '星云', pop(t, tNeb - 0.05, 0.5), { color: C.pink, size: 96, rot: -0.1 });
  burst(ctx, t, tNeb, CL[0] - 40, 1300, { n: 12, r: 280, colors: [C.pink, C.neb, C.gold, C.gas] });
  // a newborn star lights up inside
  const bp = pop(t, tBirth - 0.1, 0.6);
  if (bp > 0) babyStar(ctx, t, CL[0] + 40, CL[1] - 30, 38 * bp, Math.min(1, bp));
  burst(ctx, t, tBirth, CL[0] + 40, CL[1] - 30, { n: 10, r: 200 });
  // 小宇 pops up, starry-eyed
  const kIn = easeOut(prog(t, S('kidWow') - 0.4, S('kidWow') + 0.2)), kOut = easeIO(prog(t, S('zoom') - 0.8, S('zoom') - 0.2));
  if (kIn > 0) astronaut(ctx, t, 200, lerp(1700, 1230, kIn) + kOut * 500, 0.72, {
    talk: talkLevel(t, ['kidWow']), mood: 'starry', look: 1, lookY: -1, wave: 1 - prog(t, E('kidWow') + 0.5, E('kidWow') + 1),
  });
}

// ---------- scene 6: zoom out — the nebula and its thin surroundings are all interstellar medium ----------
const WIDE = [...Array(115)].map((_, i) => [-900 + rnd(i + 501) * 2900, -700 + rnd(i + 601) * 3200]);
const FAR = [[-500, 300, 160, 0.6], [1650, 2000, 200, 0.5], [1500, 120, 120, 0.45], [-450, 2100, 140, 0.5]];

function zoomScene(ctx, t) {
  const t0 = S('zoom'), tNeb = at('zoom', '星云'), tAround = at('zoom', '周围'), tOne = at('zoom', '连成一片'), tPart = at('zoom', '一部分');
  title(ctx, t, t0, '再拉远看', '星云和周围的稀薄物质', { t1: tPart - 0.3 });
  const z = lerp(1, 0.4, easeIO(prog(t, t0 - 0.2, tAround + 0.6)));
  const cx = lerp(CL[0], 540, easeIO(prog(t, t0 - 0.2, tAround))), cy = lerp(CL[1], 900, easeIO(prog(t, t0 - 0.2, tAround)));
  ctx.save();
  ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-cx, -cy);
  // a soft haze ties everything together once "连成一片" is said
  const haze = fadeIn(t, tOne - 0.2, 0.8);
  if (haze > 0) glow(ctx, CL[0], CL[1], 0, 1900, `rgba(92,160,230,${0.16 * haze})`);
  for (const [x, y, r, a] of FAR) nebulaCloud(ctx, t, x, y, r * 2.2, { a: a * fadeIn(t, tAround - 0.4, 0.8) });
  // keep the logo corner clear and the title band calm (AGENTS.md §4)
  const roof = (wy) => { const sy = (wy - cy) * z + 900; return sy < 230 ? 0 : sy < 480 ? 0.3 : 1; };
  field(ctx, t, WIDE.length, (i) => WIDE[i], {
    r: 9 / z, drift: 20, seed: 11, alpha: (i) => roof(WIDE[i][1]) * fadeIn(t, tAround - 0.6 + (i % 10) * 0.05, 0.5),
  });
  nebulaCloud(ctx, t, CL[0], CL[1], 300, { a: 1 });
  babyStar(ctx, t, CL[0] + 40, CL[1] - 30, 38, 1);
  ctx.restore();
  // labels in screen space
  const np = pop(t, tNeb, 0.45);
  around(ctx, 540, 1060, np, np, () => tag(ctx, 540, 1060, '星云', null, { color: C.pink, size: 50 }));
  const ap = pop(t, tAround + 0.2, 0.45);
  around(ctx, 540, 600, ap, ap, () => tag(ctx, 540, 600, '周围稀薄的气体和尘埃', null, { color: C.gas, size: 46 }));
  stamp(ctx, 540, 350, '都属于 星际介质', pop(t, tPart - 0.15, 0.5), { color: C.gold, size: 84, rot: -0.05 });
  burst(ctx, t, tPart, 540, 350, { n: 14, r: 380 });
}

// ---------- scene 7: back between the two stars — it only looks empty ----------
const GAPDOTS = [...Array(22)].map((_, i) => {
  const a = rnd(i + 701) * TAU, d = Math.sqrt(rnd(i + 751));
  return [GAP[0] + Math.cos(a) * d * 230, GAP[1] + Math.sin(a) * d * 180];
});

function endScene(ctx, t) {
  const t0 = S('sum'), tNeq = at('sum', '不等于'), tEnd = S('end'), tBet = at('end', '恒星之间'), tBye = S('kidBye');
  twoStars(ctx, t, 1, { t0: t0 - 0.4, mood: t > tBye ? 'wow' : 'happy', look: 0.5 });
  field(ctx, t, GAPDOTS.length, (i) => GAPDOTS[i], {
    r: 8, seed: 5, alpha: (i) => fadeIn(t, Math.min(tNeq, tBet) + (i % 11) * 0.06, 0.5) * (0.65 + 0.35 * Math.sin(t * 3 + i)),
  });
  // "看起来空旷 ≠ 空无一物"
  const tp = pop(t, t0, 0.5) * (1 - prog(t, tBye - 0.3, tBye));
  around(ctx, 540, 330, tp, tp, () => txt(ctx, '看起来空旷', 540, 330, { size: 84, color: C.white, stroke: INK, sw: 14 }));
  stamp(ctx, 540, 460, '≠ 空无一物', pop(t, tNeq - 0.1, 0.5) * (1 - prog(t, tBye - 0.3, tBye)), { color: C.no, size: 80, rot: -0.06 });
  // summary card
  const cp = pop(t, tEnd, 0.5) * (1 - prog(t, tBye - 0.3, tBye));
  around(ctx, 540, 1250, cp, cp, () => {
    ctx.fillStyle = 'rgba(8,10,36,0.9)';
    ctx.beginPath(); ctx.roundRect(110, 1150, 860, 200, 36); ctx.fill();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 5; ctx.stroke();
    txt(ctx, '恒星之间', 540, 1205, { size: 56, color: C.gold });
    gasDot(ctx, 235, 1290, 12); dustGrain(ctx, 845, 1290, 16, t);
    txt(ctx, '也飘着稀薄的气体和尘埃', 540, 1290, { size: 48, color: C.white });
  });
  // 小宇 flies into the gap and waves goodbye
  const fly = easeOut(prog(t, tBye - 0.6, tBye + 0.4));
  if (fly > 0) astronaut(ctx, t, lerp(-200, 540, fly), lerp(1500, 1050, fly), 0.95, {
    talk: talkLevel(t, ['kidBye']), mood: t > E('kidBye') ? 'starry' : 'wow', wave: 1,
  });
  const bp = pop(t, tBye + 0.1, 0.5);
  stamp(ctx, 540, 380, '太空，一点也不空！', bp, { color: C.gold, size: 74, rot: -0.05 });
  confetti(ctx, t, E('kidBye') - 0.2);
}

export const scenes = [
  { id: 'cloud', from: S('uneven') - 0.3, to: S('zoom') - 0.3, draw: cloudScene },
  { id: 'zoom', from: S('zoom') - 0.3, to: S('sum') - 0.3, draw: zoomScene },
  { id: 'end', from: S('sum') - 0.3, to: DURATION, draw: endScene },
];

export const events = [
  ...[...Array(5)].map((_, i) => ({ type: 'pop', t: S('uneven') + i * 0.1, f: 600 + i * 120, amp: 0.4 })),
  { type: 'boing', t: at('sparse', '稀稀拉拉'), amp: 0.5 },
  { type: 'whoosh', t: at('cloud', '引力'), d: 1.6, from: 1800, to: 300, amp: 0.8 },
  { type: 'sparkle', t: at('cloud', '一大片云') },
  { type: 'stamp', t: at('cloud', '星云') },
  { type: 'tada', t: at('cloud', '星云') + 0.1, amp: 0.7 },
  { type: 'sparkle', t: S('kidWow') },
  { type: 'ding', t: at('birth', '新的恒星') - 0.05, n: 88 }, { type: 'sparkle', t: at('birth', '新的恒星') + 0.1 },
  { type: 'whoosh', t: S('zoom') - 0.2, d: 1.4, from: 3000, to: 400, amp: 0.7 },
  { type: 'pop', t: at('zoom', '星云'), f: 800 }, { type: 'pop', t: at('zoom', '周围') + 0.2, f: 1000 },
  { type: 'stamp', t: at('zoom', '一部分') - 0.1 },
  { type: 'sparkle', t: at('zoom', '一部分') },
  { type: 'slam', t: at('sum', '不等于') - 0.05 },
  { type: 'pop', t: S('end'), f: 900 },
  { type: 'whoosh', t: S('kidBye') - 0.6, d: 0.8, from: 400, to: 2600 },
  { type: 'stamp', t: S('kidBye') + 0.1 },
  { type: 'confetti', t: E('kidBye') - 0.2 },
  { type: 'tada', t: E('kidBye') - 0.1 },
];
