// Scenes 4–6: the air absorbs part of the ground's infrared → gases & clouds emit every way, the downward part is
// counter-radiation → myth buster: it is emitted by the air itself, not the ground's heat bounced back.
import {
  C, S, at, prog, lerp, clamp, easeOut, pop, fadeIn,
  txt, card, around, arrow, burst,
} from './lib.mjs';
import { groundBody, buddy, glow } from './chars.mjs';
import { irWave, disclaimer } from './props.mjs';
import { ATM, cloudBuddy, banner, emitFan, verdict } from './night.mjs';

const GY = 1130;
const GAS = [
  { kind: 'vapor', x: 210, y: 820, label: '水汽', word: '水汽' },
  { kind: 'co2', x: 450, y: 860, label: '二氧化碳', word: '二氧化碳' },
  { kind: 'cloud', x: 730, y: 770, label: '云', word: '云' },
];

function gasBody(ctx, t, g, o) {
  if (g.kind === 'cloud') cloudBuddy(ctx, t, g.x, g.y, 0.85, { glowK: o.glowK, mood: o.mood });
  else {
    if (o.glowK > 0.02) glow(ctx, g.x, g.y, 30, 150, `rgba(76,224,255,${0.35 * o.glowK})`);
    buddy(ctx, t, g.x, g.y, 54, { kind: g.kind, warm: o.warm ?? 0, mood: o.mood });
  }
  txt(ctx, g.label, g.x, g.y - (g.kind === 'cloud' ? 110 : 100), { size: 36, color: g.kind === 'co2' ? '#ffb3b3' : g.kind === 'vapor' ? C.vapor : C.white, stroke: C.space, sw: 8 });
}

// ---------- scene 4: only part of the ground's infrared is absorbed ----------
function absorbScene(ctx, t) {
  const tEsc = S('escape'), tSpace = at('escape', '太空'), tGot = at('absorb', '吸收');
  banner(ctx, t, '大气只接住一部分热红外', 470, 580, S('absorb') - 0.1, tEsc, { size: 46, fill: C.ir });
  banner(ctx, t, '还有一部分溜向太空', 470, 580, tEsc, 1e9, { size: 46, fill: C.cream });
  groundBody(ctx, t, 60, 940, GY, 125, { heat: 0.6, face: [500, GY + 70], faceR: 75, shimmer: 0.2 });
  GAS.forEach((g, i) => {
    const t0 = at('absorb', g.word);
    const gp = pop(t, t0 - 0.15, 0.45);
    const fromX = g.x + (i - 1) * 20;
    const p = easeOut(prog(t, t0 - 0.5, t0 + 0.25));
    // the orange wave ends inside the gas: it is absorbed there, not passed on
    irWave(ctx, t, fromX, GY - 25, g.x, g.y + 60, p, { alpha: 1 - 0.6 * prog(t, tGot + 0.4, tGot + 1.2) });
    const caught = prog(t, t0 + 0.2, t0 + 0.6);
    around(ctx, g.x, g.y, gp, gp, () => {
      if (caught > 0 && caught < 1) burst(ctx, t, t0 + 0.2, g.x, g.y, { r: 110, n: 8, colors: [C.ir, C.gold] });
      gasBody(ctx, t, g, { glowK: 0, warm: 0.5 * caught, mood: caught > 0.5 ? 'happy' : 'wow' });
    });
  });
  // the escaping part: dashed, slipping between CO2 and the cloud and off the top
  const ep = easeOut(prog(t, tEsc - 0.1, tSpace + 0.4));
  irWave(ctx, t, 600, GY - 25, 600, 650, ep, { dash: [20, 14], alpha: 0.85 });
  const sp = pop(t, tSpace - 0.1, 0.4);
  around(ctx, 600, 660, sp, sp, () => arrow(ctx, 600, 700, 600, 630, { color: C.white, w: 9, head: 30 }));
  around(ctx, 210, GY + 68, 1, fadeIn(t, S('absorb') + 0.4, 0.3), () => txt(ctx, '橙 = 地面发出', 210, GY + 68, { size: 32, color: C.ir, stroke: C.space, sw: 6 }));
  disclaimer(ctx, 1290, 1);
}

// ---------- scene 5: gases & clouds emit in every direction; the downward part = counter-radiation ----------
const ALL = [-Math.PI / 2, 0, Math.PI, -Math.PI / 4, (-3 * Math.PI) / 4, Math.PI / 4, (3 * Math.PI) / 4];
function counterScene(ctx, t) {
  const tAll = at('allDir', '四面八方'), tDown = at('counter', '向下'), tName = at('counter', '逆辐射');
  banner(ctx, t, '大气自己也发热红外', 470, 580, S('allDir') - 0.1, tDown - 0.1, { size: 46, fill: ATM });
  banner(ctx, t, '向下的 = 大气逆辐射', 470, 580, tName - 0.15, 1e9, { size: 54, fill: C.gold });
  const focus = prog(t, tDown, tDown + 0.5);
  const recv = prog(t, tDown + 0.5, tName + 0.3);
  groundBody(ctx, t, 60, 940, GY, 125, { heat: 0.6 + 0.2 * recv, face: [500, GY + 70], faceR: 75, shimmer: 0.2, mood: recv > 0.5 ? 'happy' : 'happy' });
  GAS.forEach((g, i) => {
    const fan = prog(t, tAll - 0.4 + i * 0.12, tAll + 0.8 + i * 0.12);
    ctx.save();
    ctx.globalAlpha *= lerp(1, 0.3, focus);
    emitFan(ctx, t, g.x, g.y, ALL, 150, fan);
    ctx.restore();
    // the downward cyan stream: its own wave, starting at the gas, ending at the ground
    const dp = easeOut(prog(t, tDown - 0.1 + i * 0.12, tDown + 0.6 + i * 0.12));
    irWave(ctx, t, g.x, g.y + 60, g.x + (i - 1) * 15, GY - 15, dp, { color: ATM, w: 10, amp: 13, lambda: 56 });
    gasBody(ctx, t, g, { glowK: fadeIn(t, S('allDir'), 0.5), warm: 0.3, mood: 'happy' });
  });
  if (recv > 0) glow(ctx, 470, GY, 30, 420, `rgba(76,224,255,${0.25 * recv})`);
  burst(ctx, t, tName, 470, GY - 40, { r: 380, n: 14, colors: [ATM, C.gold, C.white] });
  around(ctx, 210, GY + 68, 1, fadeIn(t, S('allDir') + 0.4, 0.3), () => txt(ctx, '青 = 大气发出', 210, GY + 68, { size: 32, color: ATM, stroke: C.space, sw: 6 }));
  disclaimer(ctx, 1290, 1);
}

// ---------- scene 6: myth buster ----------
function mythPanel(ctx, t, x0, ok, k) {
  const x1 = x0 + 410, cx = (x0 + x1) / 2, gy = 1180;
  card(ctx, x0, 640, 410, 600, { fill: 'rgba(10,22,60,0.9)', edge: ok ? C.ok : C.no, ew: 6, r: 34, drop: 0 });
  ctx.save();
  ctx.beginPath(); ctx.roundRect(x0, 640, 410, 600, 34); ctx.clip();
  groundBody(ctx, t, x0, x1, gy, 80, { heat: 0.5, shimmer: 0 });
  ctx.restore();
  if (!ok) {
    // the wrong picture: one orange ray hits a "ceiling" and bounces straight back down
    ctx.fillStyle = 'rgba(200,210,230,0.75)';
    ctx.beginPath(); ctx.roundRect(x0 + 50, 760, 310, 26, 13); ctx.fill();
    const p = prog(t, k, k + 1.2);
    irWave(ctx, t, cx - 70, gy - 20, cx, 800, clamp(p * 2), { head: p < 0.5 });
    irWave(ctx, t, cx, 800, cx + 70, gy - 20, clamp(p * 2 - 1));
    txt(ctx, '“反弹回来”', cx, 700, { size: 42, color: C.no, stroke: C.space, sw: 8 });
  } else {
    const p = prog(t, k, k + 1.2);
    irWave(ctx, t, cx - 70, gy - 20, cx - 40, 940, clamp(p * 1.6));
    buddy(ctx, t, cx, 880, 50, { kind: 'co2', warm: 0.3 });
    irWave(ctx, t, cx + 40, 940, cx + 80, gy - 20, clamp(p * 1.6 - 0.5), { color: ATM });
    emitFan(ctx, t, cx, 880, [-Math.PI / 2, -Math.PI / 4, (-3 * Math.PI) / 4, 0, Math.PI], 110, clamp(p * 1.6 - 0.5));
    txt(ctx, '大气自己发出', cx, 700, { size: 42, color: C.ok, stroke: C.space, sw: 8 });
  }
}

function mythScene(ctx, t) {
  const tNo = at('notBounce', '反弹'), tYes = at('notBounce', '而是'), tSelf = at('notBounce', '自己');
  banner(ctx, t, '误区警报！', 490, 560, S('notBounce') - 0.1, 1e9, { size: 50, fill: C.no, color: C.white });
  const lp = pop(t, S('notBounce'), 0.45), rp = pop(t, tYes - 0.15, 0.45);
  around(ctx, 275, 940, lp, lp, () => mythPanel(ctx, t, 70, false, S('notBounce') + 0.2));
  around(ctx, 705, 940, rp, rp, () => mythPanel(ctx, t, 500, true, tYes));
  const xp = pop(t, tNo + 0.35, 0.35), vp = pop(t, tSelf, 0.35);
  around(ctx, 470, 645, xp, xp, () => verdict(ctx, 470, 645, 1, false));
  around(ctx, 900, 645, vp, vp, () => verdict(ctx, 900, 645, 1, true));
}

export const scenes = [
  { from: S('absorb') - 0.3, to: S('allDir') - 0.3, draw: absorbScene },
  { from: S('allDir') - 0.3, to: S('notBounce') - 0.3, draw: counterScene },
  { from: S('notBounce') - 0.3, to: S('ledger') - 0.3, draw: mythScene },
];

export const events = [
  { type: 'whoosh', t: S('absorb') - 0.3, d: 0.4 },
  ...GAS.map((g, i) => ({ type: 'pop', t: at('absorb', g.word) - 0.15, f: 700 + i * 200 })),
  { type: 'sparkle', t: at('absorb', '吸收') },
  { type: 'whoosh', t: S('escape') - 0.1, d: 1.0, from: 600, to: 3200 },
  { type: 'whoosh', t: S('allDir') - 0.3, d: 0.4 },
  { type: 'wobble', t: at('allDir', '四面八方') - 0.3, d: 1.4, f: 520, rate: 8, amp: 0.3 },
  { type: 'whoosh', t: at('counter', '向下') - 0.1, d: 0.7, from: 3000, to: 400 },
  { type: 'tada', t: at('counter', '逆辐射') - 0.1, amp: 0.6 },
  { type: 'alarm', t: S('notBounce') - 0.1 },
  { type: 'buzz', t: at('notBounce', '反弹') + 0.35, shake: 8 },
  { type: 'ding', t: at('notBounce', '自己'), n: 88 },
];
