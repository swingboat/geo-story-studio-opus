// Scenes 5–6: the Moon thinks it is a star (light test), then its orbit earns the 天然卫星 stamp.
import { W, C, S, E, at, prog, lerp, easeIO, easeOut, pop, fadeIn, txt, card, around, arrow, burst, star, talkLevel } from './lib.mjs';
import { sun, earth, moon, glow, orbit, onOrbit } from './bodies.mjs';
import { STAMP, sunglasses, sweat, lightSwitch, bubble, eye, satellite } from './props.mjs';
import { withCard } from './scenes-b.mjs';

const TAU = Math.PI * 2;
const MOON_TALK = ['moonHi', 'moonOops', 'moonA'];

// ---------- scene 5: "I'm so bright, I must be a star!" ----------
function moonLightScene(ctx, t) {
  const tIn = S('moonHi') - 0.3, tBrag = at('moonHi', '恒星'), tTest = S('moonTest'), tOff = at('moonTest', '关掉');
  const tOn = at('moonLight', '月光') - 0.3, tReflect = at('moonLight', '反射');
  const sx = 200, sy = 600, mx = 650, my = 880, mr = 150;
  const off = easeOut(prog(t, tOff - 0.05, tOff + 0.25)) * (1 - easeOut(prog(t, tOn, tOn + 0.3)));
  const beam = 1 - off;
  const talk = talkLevel(t, MOON_TALK);
  // the sun shining on the moon
  sun(ctx, t, sx, sy, 85, { look: 0.6 });
  const ang = Math.atan2(my - sy, mx - sx), perp = ang + Math.PI / 2;
  if (beam > 0.01) {
    ctx.save();
    const g = ctx.createLinearGradient(sx, sy, mx, my);
    g.addColorStop(0, `rgba(255,214,90,${0.5 * beam})`); g.addColorStop(1, `rgba(255,214,90,${0.18 * beam})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(sx + Math.cos(perp) * 40, sy + Math.sin(perp) * 40);
    ctx.lineTo(mx + Math.cos(perp) * mr, my + Math.sin(perp) * mr);
    ctx.lineTo(mx - Math.cos(perp) * mr, my - Math.sin(perp) * mr);
    ctx.lineTo(sx - Math.cos(perp) * 40, sy - Math.sin(perp) * 40);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // the moon, showing off
  const enter = easeOut(prog(t, tIn, tIn + 0.5));
  const brag = easeOut(prog(t, tBrag - 0.3, tBrag + 0.2)) * (1 - off);
  const r = mr * (1 + 0.1 * brag);
  const x = lerp(1300, mx, enter), y = my + Math.sin(t * 2.3) * 8;
  if (beam > 0.3) glow(ctx, x, y, r * 0.9, r * 1.6, `rgba(255,250,220,${0.35 * beam * (0.6 + brag)})`);
  moon(ctx, t, x, y, r, { light: ang + Math.PI, talk, mood: off > 0.5 ? 'sad' : t > tBrag ? 'happy' : 'happy', look: -0.5 });
  if (off > 0) {
    ctx.fillStyle = `rgba(6,6,24,${0.82 * off})`;
    ctx.beginPath(); ctx.arc(x, y, r + 1, 0, TAU); ctx.fill();
    // eyes still visible in the dark
    ctx.fillStyle = `rgba(255,255,255,${off})`;
    for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + k * 38, y - 10, 10, 13, 0, 0, TAU); ctx.fill(); }
  }
  // sunglasses drop off when the light goes out
  const fall = easeIO(prog(t, tOff, tOff + 0.6));
  const gp = pop(t, tBrag - 0.4, 0.4);
  if (gp > 0 && t < tOff + 0.7) around(ctx, x, y, gp, gp * (1 - fall), () => sunglasses(ctx, x, y + fall * 300, r * 0.8), fall * 0.8);
  if (brag > 0) {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU + t * 0.8, d = r * 1.35;
      star(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, 18 * brag * (0.7 + 0.3 * Math.sin(t * 6 + i)), C.gold, t * 2);
    }
  }
  const bp = pop(t, tBrag - 0.2, 0.4) * (1 - prog(t, tTest - 0.2, tTest));
  around(ctx, 600, 560, bp, bp, () => bubble(ctx, 640, 560, '我是恒星吧？', { size: 56, tx: 660, ty: 680 }));
  // the hypothetical experiment
  const ep = pop(t, tTest - 0.1, 0.45) * (1 - prog(t, tOn, tOn + 0.3));
  around(ctx, 300, 1140, ep, ep, () => {
    card(ctx, 90, 1100, 420, 80, { fill: 'rgba(255,255,255,0.12)', edge: C.lilac, ew: 3, drop: 0, r: 40 });
    txt(ctx, '假设实验 · 示意', 300, 1142, { size: 42, color: C.lilac });
  });
  const swp = pop(t, tTest + 0.4, 0.4);
  around(ctx, 200, 880, swp, swp, () => lightSwitch(ctx, 200, 880, 0.9, off < 0.5));
  if (off > 0.5) {
    sweat(ctx, x + r * 0.75, y - r * 0.55, 1.2 + 0.1 * Math.sin(t * 8));
    const qp = pop(t, S('moonOops'), 0.4);
    around(ctx, x, y - r - 70, qp, qp, () => txt(ctx, '?!', x, y - r - 70, { size: 110, color: C.gold, stroke: C.space, sw: 10 }));
  }
  // light comes back and bounces to our eye
  const rp = easeOut(prog(t, tReflect - 0.2, tReflect + 0.6));
  if (rp > 0) {
    for (let k = -1; k <= 1; k++)
      arrow(ctx, x - 60 + k * 30, y + r * 0.8, 350 + k * 30, 1240, { color: 'rgba(230,240,255,0.95)', w: 7, head: 20, p: rp });
    around(ctx, 300, 1290, rp, rp, () => eye(ctx, 300, 1290, 0.85));
  }
  const lp = pop(t, tReflect, 0.45);
  around(ctx, 720, 1140, lp, lp, () => {
    card(ctx, 470, 1100, 560, 84, { fill: '#e6e8f5', ew: 0, drop: 6, r: 42 });
    txt(ctx, '月光：主要是反射的阳光', 750, 1143, { size: 40, color: C.space });
  });
}

// ---------- scene 6: who does the moon go round? + the satellite cameo ----------
function moonOrbitScene(ctx, t) {
  const t0 = S('moonQ') - 0.3, tCard = S('moonStamp'), tStamp = at('moonStamp', '天然卫星');
  const tSat = S('satHi') - 0.4, tMan = at('satNo', '人造卫星'), tQueue = at('satNo', '排队'), tNat = at('satNo', '天然卫星');
  const talk = talkLevel(t, MOON_TALK);
  withCard(ctx, t, tCard, () => {
    const cx = 540, cy = 860;
    const op = easeOut(prog(t, t0 + 0.2, t0 + 1.2));
    orbit(ctx, cx, cy, 330, 210, op, 'rgba(220,225,255,0.5)');
    earth(ctx, t, cx, cy, 125, { light: Math.PI * 1.15, look: 0.3 });
    const a = -0.6 + (t - t0) * 0.9;
    const [x, y] = onOrbit(cx, cy, 330, 210, a);
    moon(ctx, t, x, y, 62, { light: Math.PI * 1.15, talk, mood: t > S('moonA') && t < tCard ? 'sad' : 'happy', look: x > cx ? -0.6 : 0.6 });
    const qp = pop(t, at('moonA', '地球') - 0.1, 0.4) * (1 - prog(t, tCard - 0.2, tCard));
    around(ctx, cx, cy - 300, qp, qp, () => txt(ctx, '月球 → 绕地球转', cx, cy - 300, { size: 64, color: C.sky, stroke: C.space, sw: 10 }));
  }, {
    name: '月球', light: '主要反射太阳光', orbit: '绕地球运行',
    cat: '天然卫星', color: STAMP.moon,
    stampP: prog(t, tStamp - 0.05, tStamp + 0.25) * (1 + 0.08 * Math.sin(Math.PI * prog(t, tNat - 0.1, tNat + 0.5))),
    rows: [0, 1, 2].map((i) => prog(t, tCard + 0.2 + i * 0.3, tCard + 0.5 + i * 0.3)),
    portrait: (c, x, y, r) => moon(c, t, x, y, r * 0.7, { light: Math.PI * 1.2 }),
  });
  burst(ctx, t, tStamp + 0.15, 700, 1300, { r: 260, n: 12 });
  // the man-made satellite barges in, then gets sent to the queue
  const sp = easeOut(prog(t, tSat, tSat + 0.5));
  if (sp <= 0) return;
  const q = easeIO(prog(t, tQueue - 0.1, tQueue + 0.6));
  const sx = lerp(lerp(1350, 720, sp), 920, q), sy = lerp(640, 600, q) + Math.sin(t * 3) * 10, ss = lerp(0.62, 0.36, q);
  satellite(ctx, t, sx, sy, ss, { talk: talkLevel(t, ['satHi']), look: -0.6 });
  const bp = pop(t, S('satHi') - 0.1, 0.4) * (1 - q);
  around(ctx, 420, 560, bp, bp, () => bubble(ctx, 400, 560, '我也是卫星！', { size: 52, tx: 600, ty: 620 }));
  const mp = pop(t, tMan - 0.1, 0.4);
  around(ctx, sx, sy + 120 * ss / 0.62 + 30, mp, mp, () => {
    const lw = lerp(380, 260, q), ly = sy + lerp(130, 85, q);
    card(ctx, sx - lw / 2, ly - 32, lw, 64, { fill: '#f0c040', ew: 0, drop: 4, r: 32 });
    txt(ctx, q > 0.5 ? '排队中…' : '人造卫星', sx, ly + 1, { size: lerp(40, 32, q), color: C.space });
  });
}

export const scenesC = [
  { id: 'moonLight', from: S('moonHi') - 0.35, to: S('moonQ') - 0.35, draw: moonLightScene },
  { id: 'moonOrbit', from: S('moonQ') - 0.35, to: S('sum') - 0.35, draw: moonOrbitScene },
];

export const eventsC = [
  { type: 'whoosh', t: S('moonHi') - 0.4, d: 0.5 },
  { type: 'sparkle', t: at('moonHi', '恒星') - 0.2 },
  { type: 'pop', t: S('moonTest') - 0.1, f: 650 },
  { type: 'tick', t: at('moonTest', '关掉'), n: 72 },
  { type: 'boing', t: at('moonTest', '关掉') + 0.3, amp: 0.5 },
  { type: 'buzz', t: S('moonOops') + 0.1 },
  { type: 'tick', t: at('moonLight', '月光') - 0.3, n: 84 },
  { type: 'sparkle', t: at('moonLight', '反射') - 0.1 },
  { type: 'whoosh', t: S('moonQ') - 0.4, d: 0.5 },
  { type: 'whoosh', t: S('moonStamp') - 0.25, d: 0.5, from: 300, to: 1500 },
  { type: 'stamp', t: at('moonStamp', '天然卫星'), shake: 16 },
  { type: 'whoosh', t: S('satHi') - 0.45, d: 0.5, from: 3000, to: 800 },
  { type: 'alarm', t: S('satHi') },
  { type: 'boing', t: at('satNo', '排队') - 0.05, amp: 0.6 },
  { type: 'ding', t: at('satNo', '天然卫星'), n: 91 },
];
void W; void E; void fadeIn; void sun;
