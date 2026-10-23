// Scenes 3–4: diving into the core (cutaway), then the crowded hot core and the 造氦工厂 (fusion).
import { W, H, C, TAU, rnd, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, around, burst, card, arrow, talkLevel, shakeOf } from './lib.mjs';
import { astronaut, glow } from './cast.mjs';
import { title, tag, stamp } from './props.mjs';
import { sunBuddy, hydrogen, helium, ZONE } from './sun.mjs';

const INK = '#0a0828';
const SC = [540, 880], SR = 330;

// ---------- scene 3: cut the Sun open and dive to the core ----------
function diveScene(ctx, t) {
  const t0 = S('dive'), tCore = at('dive', '核心'), tGo = S('kidGo'), tEnd = S('core');
  title(ctx, t, t0, '能量的源头在哪？', '往太阳中心看', { size: 78, t1: tGo });
  const cut = easeIO(prog(t, t0 + 0.1, tCore));
  const z = 1 + 5 * Math.pow(easeIO(prog(t, tGo + 0.2, tEnd + 0.2)), 2);
  ctx.save();
  ctx.translate(SC[0], SC[1]); ctx.scale(z, z); ctx.translate(-SC[0], -SC[1]);
  sunBuddy(ctx, t, SC[0], SC[1], SR, { cut, look: 1, mood: 'happy', faceA: 1 - prog(t, tGo, tGo + 0.4), hi: { hiCore: pop(t, tCore, 0.5) } });
  ctx.restore();
  // pointer ring + 核心 label
  const lp = pop(t, tCore - 0.7, 0.45) * (1 - prog(t, tGo + 0.2, tGo + 0.5));
  if (lp > 0) {
    ctx.save(); ctx.globalAlpha *= lp;
    ctx.strokeStyle = C.white; ctx.lineWidth = 6; ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 60;
    ctx.beginPath(); ctx.arc(SC[0], SC[1], SR * ZONE.core * 1.35, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);
    arrow(ctx, 860, 1320, SC[0] + 60, SC[1] + 70, { color: C.white, w: 10, head: 34, p: easeOut(lp) });
    ctx.restore();
    around(ctx, 860, 1340, lp, lp, () => tag(ctx, 860, 1360, '核心', null, { color: C.core, size: 58 }));
  }
  // 小宇 rockets into the core
  const go = easeIO(prog(t, tGo - 0.1, tGo + 0.9));
  const ax = lerp(150, SC[0], go), ay = lerp(1300, SC[1], go), as = lerp(0.62, 0.05, go);
  if (go < 0.98) {
    if (go > 0) for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - go)})`; ctx.lineWidth = 6; ctx.lineCap = 'round';
      const off = (i - 2.5) * 26, L = 120 + 40 * Math.sin(t * 20 + i);
      ctx.beginPath(); ctx.moveTo(ax - 140 * as / 0.62 + off * 0.4, ay + 160 * as / 0.62 + off); ctx.lineTo(ax - L, ay + L + off); ctx.stroke();
    }
    astronaut(ctx, t, ax, ay, as, { talk: talkLevel(t, ['kidGo']), arm: -0.8, look: 1, lookY: -1, mood: t > tGo ? 'wow' : 'happy' });
  }
  // white-hot flash as we arrive
  const f = prog(t, tEnd - 0.5, tEnd - 0.1) * (1 - prog(t, tEnd - 0.1, tEnd + 0.3));
  if (f > 0) { ctx.fillStyle = `rgba(255,250,220,${f})`; ctx.fillRect(0, 0, W, H); }
}

// ---------- shared core backdrop: pale glowing plasma ----------
function coreGlow(ctx, t, a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  const g = ctx.createRadialGradient(W / 2, 880, 50, W / 2, 880, 1000);
  g.addColorStop(0, 'rgba(255,250,210,0.55)'); g.addColorStop(0.5, 'rgba(255,190,90,0.32)'); g.addColorStop(1, 'rgba(255,110,40,0.1)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) {
    const y = (rnd(i) * H - t * (60 + rnd(i + 3) * 80)) % H;
    glow(ctx, rnd(i + 9) * W, (y + H) % H, 0, 30 + rnd(i + 4) * 40, 'rgba(255,240,180,0.25)');
  }
  ctx.restore();
}

// Crowd of jostling hydrogen nuclei.
const CROWD = [...Array(22)].map((_, i) => ({ x: 120 + rnd(i) * 640, y: 560 + rnd(i + 20) * 620, ph: rnd(i + 40) * TAU, sp: 3 + rnd(i + 60) * 4 }));

function thermometer(ctx, t, x, y, p, label) {
  ctx.save();
  ctx.fillStyle = '#fff'; ctx.strokeStyle = INK; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.roundRect(x - 30, y - 300, 60, 330, 30); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y + 50, 56, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.no;
  ctx.beginPath(); ctx.arc(x, y + 50, 44, 0, TAU); ctx.fill();
  const h = 290 * p;
  ctx.beginPath(); ctx.roundRect(x - 16, y + 10 - h, 32, h + 30, 16); ctx.fill();
  ctx.restore();
  if (p > 0.95) {
    glow(ctx, x, y - 290, 0, 90, `rgba(255,80,80,${0.4 + 0.2 * Math.sin(t * 12)})`);
    txt(ctx, label, x - 70, y - 360, { size: 54, color: C.gold, stroke: INK, sw: 10 });
  }
}

// The fusion "factory": inputs drop in from the top, helium + energy come out the bottom.
const MX = 540, MY = 860;
function machine(ctx, t, on, sign) {
  ctx.save();
  // chimney + puffs
  ctx.fillStyle = '#5b5f8f'; ctx.strokeStyle = INK; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.roundRect(MX + 120, MY - 170, 60, 80, 8); ctx.fill(); ctx.stroke();
  for (let i = 0; i < 4 && on > 0; i++) {
    const p = (t * 0.8 + i / 4) % 1;
    glow(ctx, MX + 150 + Math.sin(p * 5 + i) * 15, MY - 190 - p * 160, 0, 26 + p * 30, `rgba(255,250,200,${0.6 * (1 - p) * on})`);
  }
  card(ctx, MX - 220, MY - 110, 440, 220, { r: 36, fill: '#7a5cff', edge: INK, ew: 8, drop: 14 });
  // input funnel + output chute
  ctx.fillStyle = '#c9b6ff'; ctx.strokeStyle = INK; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(MX - 110, MY - 200); ctx.lineTo(MX + 110, MY - 200); ctx.lineTo(MX + 40, MY - 110); ctx.lineTo(MX - 40, MY - 110); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(MX - 50, MY + 100, 100, 50, 10); ctx.fill(); ctx.stroke();
  // gears
  [[MX - 120, MY - 25, 50, 1], [MX - 5, MY - 45, 30, -1.5], [MX + 115, MY - 25, 44, -1.1]].forEach(([gx, gy, r, sp]) => {
    ctx.save();
    ctx.translate(gx, gy); ctx.rotate(t * sp * (0.4 + 3 * on));
    ctx.fillStyle = C.gold; ctx.strokeStyle = INK; ctx.lineWidth = 5;
    ctx.beginPath();
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * TAU, rr = i % 2 ? r : r * 1.25;
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#7a5cff'; ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.restore();
  });
  txt(ctx, '一系列反应', MX, MY + 70, { size: 38, color: '#fff', stroke: INK, sw: 8 });
  // flashing lights
  [130, 165, 200].forEach((dx, i) => {
    ctx.fillStyle = on > 0 && Math.sin(t * 12 + i * 2) > 0 ? [C.no, C.gold, C.mint][i] : '#3a2f7a';
    ctx.beginPath(); ctx.arc(MX + dx - 20, MY + 70, 11, 0, TAU); ctx.fill();
  });
  ctx.restore();
  if (sign > 0) around(ctx, MX, MY - 250, sign, sign, () => tag(ctx, MX, MY - 250, '造氦工厂', null, { color: C.gold, size: 50 }), -0.05);
}

const HX = [270, 450, 630, 810], HY = 590;

function coreScene(ctx, t) {
  const t0 = S('core'), tHot = at('core', '一千五百万'), tF = S('fusion'), tChain = at('fusion', '一系列反应');
  const tHe = at('fusion', '氦核'), tE = at('fusion', '能量'), tName = at('name', '核聚变'), tKid = S('kidFactory');
  const out = 1 - prog(t, tF - 0.2, tF + 0.4);
  coreGlow(ctx, t);
  title(ctx, t, t0, '核心：又热又挤', null, { size: 80, t1: tF - 0.2 });
  title(ctx, t, tF, '核心里的“工厂”', '氢核 → 氦核 + 能量', { size: 78, t1: tName - 0.3 });
  // crowded, jostling hydrogen nuclei
  if (out > 0) CROWD.forEach((c, i) => {
    const p = pop(t, t0 + i * 0.04, 0.4) * out;
    const x = c.x + Math.sin(t * c.sp + c.ph) * 18, y = c.y + Math.cos(t * c.sp * 1.3 + c.ph) * 18;
    around(ctx, x, y, p, p, () => hydrogen(ctx, t, x, y, 42, { mood: t > tHot ? 'wow' : 'happy' }));
  });
  const th = pop(t, at('core', '热') - 0.1, 0.5) * out;
  around(ctx, 930, 1150, th, th, () => thermometer(ctx, t, 930, 1150, easeOut(prog(t, at('core', '热'), tHot + 0.4)), '约1500万℃'));
  const sq = pop(t, at('core', '挤'), 0.4) * out;
  around(ctx, 230, 1250, sq, sq, () => tag(ctx, 230, 1250, '挤挤挤！', null, { color: C.pink, size: 50 }), 0.08);

  // fusion factory
  const mp = pop(t, tF - 0.1, 0.6);
  const on = prog(t, tChain - 0.2, tChain + 0.3) * (1 - 0.6 * prog(t, tKid + 1.5, tKid + 2));
  const [mx, my] = shakeOf(t, tHe - 0.1, 10, 0.5);
  around(ctx, MX, MY, mp, mp, () => {
    ctx.save(); ctx.translate(mx, my);
    machine(ctx, t, on, pop(t, at('kidFactory', '工厂') - 0.1, 0.5));
    ctx.restore();
  });
  // four hydrogen nuclei line up, then drop into the funnel one after another
  HX.forEach((x, i) => {
    const p = pop(t, at('fusion', '氢核') + i * 0.15, 0.4);
    const d = easeIO(prog(t, tChain + i * 0.3, tChain + i * 0.3 + 0.5));
    if (d >= 1) return;
    const y = lerp(HY + Math.sin(t * 3 + i) * 10, MY - 150, d), xx = lerp(x, MX, d);
    around(ctx, xx, y, p * (1 - d * 0.6), p, () => hydrogen(ctx, t, xx, y, 50, { mood: d > 0 ? 'wow' : 'happy' }));
  });
  const hl = pop(t, at('fusion', '氢核') + 0.5, 0.4) * (1 - prog(t, tChain, tChain + 0.3));
  around(ctx, W / 2, HY - 82, hl, hl, () => txt(ctx, '4 个氢核', W / 2, HY - 82, { size: 44, color: C.proton, stroke: INK, sw: 8 }));
  // helium out + energy burst
  const hp = pop(t, tHe - 0.05, 0.5);
  const hy = lerp(MY + 130, 1200, easeOut(prog(t, tHe - 0.05, tHe + 0.5)));
  around(ctx, 380, hy, hp, hp, () => {
    helium(ctx, t, 380, hy, 70, { spin: t * 0.4 });
    tag(ctx, 380, hy + 140, '1 个氦核', null, { color: C.neutron, size: 42 });
  });
  const ep = pop(t, tE - 0.05, 0.5);
  if (ep > 0) {
    around(ctx, 720, 1200, ep, ep, () => {
      glow(ctx, 720, 1200, 0, 170, 'rgba(255,245,150,0.7)');
      ctx.save(); ctx.translate(720, 1200); ctx.rotate(t * 0.8);
      ctx.fillStyle = C.energy;
      ctx.beginPath();
      for (let i = 0; i < 24; i++) { const a = (i / 24) * TAU, r = i % 2 ? 40 : 95 + 10 * Math.sin(t * 9 + i); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.closePath(); ctx.fill(); ctx.restore();
      tag(ctx, 720, 1340, '能量', null, { color: C.energy, size: 46 });
    });
    burst(ctx, t, tE, 720, 1200, { n: 14, r: 300 });
  }
  // the name stamp
  const tSign = at('kidFactory', '工厂');
  stamp(ctx, MX, 560, '核聚变！', pop(t, tName - 0.05, 0.5) * (1 - prog(t, tSign - 0.45, tSign - 0.15)), { color: C.gold, size: 116 });
  burst(ctx, t, tName, MX, 560, { n: 14, r: 380 });
  // 小宇 peeks in from the bottom-left corner
  const kp = easeOut(prog(t, tKid - 0.5, tKid + 0.2));
  if (kp > 0) astronaut(ctx, t, lerp(-160, 120, kp), lerp(1500, 1330, kp), 0.55, { talk: talkLevel(t, ['kidFactory']), mood: 'starry', look: 1, lookY: -1, wave: 1 });
}

export const scenes = [
  { id: 'dive', from: S('dive') - 0.25, to: S('core') - 0.1, draw: diveScene },
  { id: 'core', from: S('core') - 0.1, to: S('mass') - 0.25, draw: coreScene },
];

export const events = [
  { type: 'scribble', t: S('dive') + 0.1, d: 0.9 },
  { type: 'ding', t: at('dive', '核心'), n: 84 },
  { type: 'whoosh', t: S('kidGo') - 0.1, d: 1.3, from: 300, to: 3500, amp: 0.8 },
  { type: 'sparkle', t: S('core') - 0.3 },
  ...[...Array(10)].map((_, i) => ({ type: 'pop', t: S('core') + i * 0.08, f: 500 + i * 60, amp: 0.4 })),
  { type: 'alarm', t: at('core', '一千五百万') },
  { type: 'boing', t: at('core', '挤'), amp: 0.6 },
  { type: 'slam', t: S('fusion') },
  ...[0, 1, 2, 3].map((i) => ({ type: 'note', t: at('fusion', '氢核') + i * 0.15, n: 72 + i * 4 })),
  ...[0, 1, 2, 3].map((i) => ({ type: 'boing', t: at('fusion', '一系列反应') + i * 0.3 + 0.4, amp: 0.4 })),
  { type: 'scribble', t: at('fusion', '一系列反应') + 0.2, d: 1.2 },
  { type: 'ding', t: at('fusion', '氦核'), n: 88 },
  { type: 'sparkle', t: at('fusion', '能量') },
  { type: 'stamp', t: at('name', '核聚变') }, { type: 'tada', t: at('name', '核聚变') + 0.1 },
  { type: 'pop', t: at('kidFactory', '工厂') - 0.1, f: 900 },
];
