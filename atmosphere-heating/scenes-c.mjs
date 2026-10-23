// Scenes 5–6: route ② contact heating + convection, route ③ the water relay (evaporation takes heat, condensation releases it).
import {
  C, S, at, prog, lerp, clamp, easeIO, easeOut, pop, fadeIn,
  txt, card, around, arrow, burst,
} from './lib.mjs';
import { glow, groundBody, buddy } from './chars.mjs';
import { cloud, lake, heatToken, disclaimer } from './props.mjs';

const GY = 1090;

function banner(ctx, t, t0, text, color, note) {
  const bp = pop(t, t0 - 0.1, 0.45);
  around(ctx, 470, 565, bp, bp, () => {
    card(ctx, 110, 515, 720, 100, { fill: color, ew: 0, r: 50, drop: 8 });
    txt(ctx, text, 470, 566, { size: 50, color: C.space });
    if (note) txt(ctx, note, 470, 646, { size: 28, color: 'rgba(220,240,255,0.85)' });
  });
}

// ---------- scene 5: route ② hugging the hot ground, then rising ----------
const ROW = [190, 380, 570, 760];
function convectionScene(ctx, t) {
  const tHug = at('touch', '紧贴'), tWarm = at('touch', '焐暖'), tIf = S('rise'), tUp = at('rise', '往上浮');
  const tConv = at('rise', '对流'), tSend = at('rise', '一路');
  banner(ctx, t, S('touch'), '② 贴贴传热 · 对流', C.warm);
  groundBody(ctx, t, 60, 940, GY, 170, { heat: 1, face: [500, GY + 92], faceR: 90, shimmer: 0.3 });
  ROW.forEach((x, i) => {
    const land = easeOut(prog(t, S('touch') + 0.1 + i * 0.12, S('touch') + 0.6 + i * 0.12));
    const warm = easeOut(prog(t, tWarm - 0.6 + i * 0.12, tWarm + 0.5 + i * 0.12));
    // contact heating: short arrows from the ground into the parcel
    if (warm > 0 && warm < 1)
      for (const dx of [-18, 18]) arrow(ctx, x + dx, GY + 10, x + dx, GY - 30, { color: C.hot, w: 7, head: 18, p: 1 });
    const riser = i === 1 || i === 2;
    const up = riser ? easeIO(prog(t, tUp - 0.3 + (i - 1) * 0.35, tSend + 0.8 + (i - 1) * 0.35)) : 0;
    const y0 = lerp(880, GY - 52, land);
    const y = lerp(y0, i === 1 ? 760 : 820, up), xx = x + Math.sin(up * Math.PI * 2) * 30 * up;
    const sc = 1 + 0.25 * up;
    if (up > 0.02) {
      ctx.save();
      ctx.setLineDash([12, 14]); ctx.strokeStyle = 'rgba(255,170,90,0.6)'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(x, GY - 52); ctx.quadraticCurveTo(x + 40, (GY + y) / 2, xx, y + 50); ctx.stroke();
      ctx.restore();
      heatToken(ctx, t, xx + 52 * sc, y - 30 * sc, 0.8, fadeIn(t, tUp, 0.3));
    }
    around(ctx, xx, y, sc * land, land, () => buddy(ctx, t, xx, y, 46, { warm: Math.max(warm, up), mood: warm > 0.5 ? 'happy' : 'wow' }));
  });
  // a love-bubble while they hug the ground
  const hp = pop(t, tHug + 0.2, 0.4) * (1 - prog(t, tIf - 0.2, tIf));
  around(ctx, 470, 860, hp, hp, () => txt(ctx, '贴贴~ 好暖!', 470, 860, { size: 52, color: C.pink, stroke: C.cream, sw: 10 }));
  const cp = pop(t, tIf - 0.1, 0.4) * (1 - prog(t, tConv - 0.1, tConv + 0.2));
  around(ctx, 470, 700, cp, cp, () => {
    card(ctx, 330, 660, 280, 76, { fill: 'rgba(10,22,60,0.85)', edge: C.gold, ew: 4, r: 38, drop: 0 });
    txt(ctx, '条件合适时', 470, 699, { size: 38, color: C.gold });
  });
  const vp = pop(t, tConv - 0.1, 0.5);
  around(ctx, 760, 700, vp, vp, () => {
    txt(ctx, '对流!', 770, 690, { size: 84, color: C.warm, stroke: C.space, sw: 14, shadow: 'rgba(0,0,0,0.5)' });
    arrow(ctx, 700, 780, 700, 650, { color: C.warm, w: 10, head: 30, p: 1 });
  }, -0.08);
  burst(ctx, t, tConv, 770, 690, { r: 170, n: 10, colors: [C.warm, C.gold, C.hot] });
  disclaimer(ctx, 1290, 1);
}

// ---------- scene 6: route ③ the water relay ----------
const VAP = [360, 500, 640];
const CLOUD = [500, 760];
const AIR = [[200, 720], [800, 690], [250, 920], [770, 900]];

function waterScene(ctx, t) {
  const tEv = at('evap', '蒸发'), tTake = at('evap', '带走'), tHigh = at('cond', '高空'), tCond = at('cond', '凝结');
  const tGive = at('cond', '放给');
  banner(ctx, t, S('evap'), '③ 水的接力 · 蒸发与凝结', C.vapor, '水汽本身看不见 · 图标只是示意');
  groundBody(ctx, t, 60, 940, GY, 170, { heat: 1, face: [160, GY + 95], faceR: 55, shimmer: 0 });
  lake(ctx, t, 250, 760, GY + 6, 70);
  const merge = easeIO(prog(t, tCond - 0.2, tCond + 0.6));
  VAP.forEach((x, i) => {
    const t0 = tEv - 0.2 + i * 0.3;
    const jump = easeOut(prog(t, t0, tHigh + 0.2 + i * 0.1));
    if (jump <= 0) return;
    const hop = Math.sin(Math.PI * clamp(jump * 4)) * 40;
    let px = x + Math.sin(jump * 7 + i) * 26 * jump, py = lerp(GY + 20, 900 - i * 30, jump) - hop;
    px = lerp(px, CLOUD[0] + (i - 1) * 60, merge); py = lerp(py, CLOUD[1], merge);
    // heat token grabbed from the lake on the way up
    const carry = prog(t, tTake - 0.2 + i * 0.15, tTake + 0.4 + i * 0.15);
    if (carry > 0 && merge < 0.95) heatToken(ctx, t, px + 44, py - 40, 0.7 * carry, 1 - merge);
    around(ctx, px, py, lerp(1, 0.4, merge), 1 - merge, () => buddy(ctx, t, px, py, 40, { kind: 'vapor', mood: 'happy' }));
  });
  const lp = pop(t, tTake - 0.1, 0.4) * (1 - prog(t, tCond - 0.3, tCond));
  around(ctx, 500, 1010, lp, lp, () => txt(ctx, '蒸发吸热', 500, 1010, { size: 50, color: C.vapor, stroke: C.space, sw: 10 }));
  // the cloud forms, then hands heat to the surrounding air
  const cp = pop(t, tCond, 0.5);
  around(ctx, CLOUD[0], CLOUD[1], cp, cp, () => {
    cloud(ctx, CLOUD[0], CLOUD[1], 1.15);
    ctx.fillStyle = C.water;
    for (let k = 0; k < 4; k++) {
      const dy = ((t * 120 + k * 40) % 120);
      ctx.beginPath(); ctx.ellipse(CLOUD[0] - 60 + k * 40, CLOUD[1] + 70 + dy, 6, 10, 0, 0, Math.PI * 2); ctx.fill();
    }
  });
  AIR.forEach(([x, y], i) => {
    const ap = pop(t, tHigh - 0.1 + i * 0.1, 0.4);
    const go = easeOut(prog(t, tGive - 0.1 + i * 0.08, tGive + 0.6 + i * 0.08));
    const warm = prog(t, tGive + 0.4 + i * 0.08, tGive + 0.9 + i * 0.08);
    if (go > 0 && go < 1) heatToken(ctx, t, lerp(CLOUD[0], x, go), lerp(CLOUD[1], y, go), 0.8);
    around(ctx, x, y, ap, ap, () => buddy(ctx, t, x, y, 40, { warm, mood: warm > 0.5 ? 'happy' : 'wow' }));
  });
  if (cp > 0) glow(ctx, CLOUD[0], CLOUD[1], 20, 220, `rgba(255,150,60,${0.4 * prog(t, tGive, tGive + 0.5)})`);
  const rp = pop(t, tGive - 0.1, 0.45);
  around(ctx, 500, 880, rp, rp, () => txt(ctx, '凝结放热!', 500, 880, { size: 54, color: C.hot, stroke: C.cream, sw: 10 }));
  disclaimer(ctx, 1290, 1);
}

export const scenes = [
  { from: S('touch') - 0.3, to: S('evap') - 0.3, draw: convectionScene },
  { from: S('evap') - 0.3, to: S('recap') - 0.3, draw: waterScene },
];

export const events = [
  { type: 'whoosh', t: S('touch') - 0.3, d: 0.4 },
  ...ROW.map((_, i) => ({ type: 'pop', t: S('touch') + 0.4 + i * 0.12, f: 500 + i * 120 })),
  { type: 'sparkle', t: at('touch', '焐暖') },
  { type: 'tick', t: S('rise') - 0.1, n: 84 },
  { type: 'whoosh', t: at('rise', '往上浮') - 0.2, d: 1.2, from: 300, to: 2000 },
  { type: 'tada', t: at('rise', '对流') - 0.1, amp: 0.6 },
  { type: 'whoosh', t: S('evap') - 0.3, d: 0.4 },
  ...VAP.map((_, i) => ({ type: 'boing', t: at('evap', '蒸发') - 0.2 + i * 0.3, amp: 0.45 })),
  { type: 'ding', t: at('evap', '带走'), n: 81 },
  { type: 'pop', t: at('cond', '凝结'), f: 600 },
  { type: 'sparkle', t: at('cond', '放给') },
];
