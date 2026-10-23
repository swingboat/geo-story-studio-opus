// Scenes 1–2: "is the Sun burning wood or coal?" gag, 46亿年 counter, and the Sun as a plasma star.
import { W, C, TAU, rnd, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, around, burst, card, talkLevel, shakeOf } from './lib.mjs';
import { astronaut, glow } from './cast.mjs';
import { title, tag, stamp } from './props.mjs';
import { sunBuddy } from './sun.mjs';

const INK = '#0a0828';

function log(ctx, x, y, s, rot = 0) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = '#9a5a2c'; ctx.strokeStyle = INK; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.roundRect(-80, -26, 160, 52, 26); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e6b77a';
  ctx.beginPath(); ctx.ellipse(70, 0, 18, 24, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#9a5a2c'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(70, 0, 8, 12, 0, 0, TAU); ctx.stroke();
  ctx.restore();
}

function coal(ctx, x, y, s, rot = 0) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = '#2e2e3a'; ctx.strokeStyle = INK; ctx.lineWidth = 6;
  ctx.beginPath();
  [[-60, -10], [-30, -48], [25, -52], [62, -14], [48, 38], [-12, 50], [-56, 30]].forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath(); ctx.moveTo(-28, -38); ctx.lineTo(10, -42); ctx.lineTo(-10, -18); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// Big red cross used to strike out the "burning" guesses.
function cross(ctx, x, y, s, p) {
  if (p <= 0) return;
  ctx.save();
  ctx.lineCap = 'round';
  for (const [col, w] of [[INK, 36 * s], [C.no, 22 * s]]) {
    ctx.strokeStyle = col; ctx.lineWidth = w;
    const a = clamp(p * 2), b = clamp(p * 2 - 1);
    ctx.beginPath(); ctx.moveTo(x - 90 * s, y - 90 * s); ctx.lineTo(x + lerp(-90, 90, a) * s, y + lerp(-90, 90, a) * s); ctx.stroke();
    if (b > 0) { ctx.beginPath(); ctx.moveTo(x + 90 * s, y - 90 * s); ctx.lineTo(x + lerp(90, -90, b) * s, y + lerp(-90, 90, b) * s); ctx.stroke(); }
  }
  ctx.restore();
}

const SUN = [560, 820];

// ---------- scene 1: the hook, the coal-powered Sun and the 4.6-billion-year counter ----------
function hookScene(ctx, t) {
  const tWood = at('hook', '木头'), tCoal = at('hook', '煤');
  const tBurn = at('coal', '烧煤'), tOut = at('coal', '烧光'), tAge = S('age'), tNum = at('age', '四十六亿年'), tNo = S('sunNo');
  title(ctx, t, 0.3, '太阳为什么能发光发热？', '它在“烧”什么吗？', { size: 72, t1: tBurn - 0.3 });
  title(ctx, t, tBurn - 0.1, '假如太阳靠烧煤……', null, { size: 76, t1: tAge - 0.2 });
  title(ctx, t, tAge, '可太阳已经亮了', null, { size: 76, t1: tNo - 0.2 });
  title(ctx, t, tNo, '太阳：我不是在烧火！', null, { size: 74, color: C.gold });

  // the coal-powered Sun dims to a grey cinder, then springs back
  const ash = easeIO(prog(t, tBurn + 0.3, tOut + 0.4)) * (1 - easeOut(prog(t, tAge - 0.1, tAge + 0.4)));
  const sIn = pop(t, 0.4, 0.7);
  const [jx, jy] = shakeOf(t, tAge, 18, 0.4);
  const shades = easeOut(prog(t, at('sunNo', '可不是') - 0.3, at('sunNo', '可不是') + 0.2));
  around(ctx, SUN[0], SUN[1], sIn * (1 - 0.12 * ash), sIn, () => {
    sunBuddy(ctx, t, SUN[0] + jx, SUN[1] + jy, 230, {
      talk: talkLevel(t, ['sunNo']), mood: ash > 0.5 ? 'sad' : t > tAge && t < tNo ? 'wow' : 'happy', look: -0.6,
      glowA: 1 - ash * 0.9, shades, ash,
    });
    if (ash > 0) {
      // smoke puffs
      for (let i = 0; i < 6; i++) {
        const p = ((t * 0.5 + i / 6) % 1);
        ctx.fillStyle = `rgba(170,170,185,${0.4 * (1 - p) * ash})`;
        ctx.beginPath(); ctx.arc(SUN[0] - 60 + i * 24 + Math.sin(p * 6 + i) * 20, SUN[1] - 240 - p * 260, 30 + p * 40, 0, TAU); ctx.fill();
      }
    }
  });

  // wood + coal guesses float next to the Sun, then get crossed out
  const gone = 1 - prog(t, tBurn - 0.3, tBurn);
  const back = fadeIn(t, tNo - 0.1, 0.3);
  const lp = pop(t, tWood - 0.1, 0.45), cp = pop(t, tCoal - 0.1, 0.45);
  const vis = Math.max(gone, back);
  around(ctx, 230, 600, lp * vis, lp * vis, () => log(ctx, 230, 600 + Math.sin(t * 3) * 10, 1, -0.3));
  around(ctx, 880, 610, cp * vis, cp * vis, () => coal(ctx, 880, 610 + Math.sin(t * 3 + 1) * 10, 1, 0.2));
  if (gone > 0 && t < tBurn) {
    [[230, 600], [880, 610]].forEach(([x, y], i) => {
      const q = pop(t, (i ? tCoal : tWood) + 0.1, 0.4) * gone;
      around(ctx, x, y - 100, q, q, () => txt(ctx, '？', x, y - 100 + Math.sin(t * 4 + i) * 8, { size: 80, color: C.gold, stroke: INK, sw: 10 }));
    });
  }
  const xp = prog(t, at('sunNo', '烧火') - 0.2, at('sunNo', '烧火') + 0.3);
  cross(ctx, 230, 600, 0.9, xp * back); cross(ctx, 880, 610, 0.9, prog(t, at('sunNo', '烧火'), at('sunNo', '烧火') + 0.5) * back);

  // coal-sun fuel gauge
  const gp = pop(t, tBurn, 0.4) * (1 - prog(t, tAge - 0.3, tAge));
  around(ctx, W / 2, 1200, gp, gp, () => {
    card(ctx, 190, 1130, 700, 150, { fill: 'rgba(8,10,36,0.9)', edge: C.gold, ew: 5, drop: 0 });
    txt(ctx, '燃料', 270, 1205, { size: 40, color: C.gold });
    const f = 1 - easeIO(prog(t, tBurn + 0.3, tOut + 0.3));
    ctx.fillStyle = '#2a2a44'; ctx.beginPath(); ctx.roundRect(340, 1180, 500, 50, 25); ctx.fill();
    ctx.fillStyle = f > 0.3 ? C.mint : C.no; ctx.beginPath(); ctx.roundRect(340, 1180, Math.max(50, 500 * f), 50, 25); ctx.fill();
    const lp2 = fadeIn(t, tOut - 0.2, 0.3);
    if (lp2 > 0) txt(ctx, '几千年就烧光！', 590, 1205, { size: 40, color: '#fff', stroke: INK, sw: 8 });
  });

  // 46 亿年 rolling counter
  const np = pop(t, tNum - 0.15, 0.5) * (1 - prog(t, tNo + 0.3, tNo + 0.6));
  if (np > 0) {
    const n = Math.round(46 * easeOut(prog(t, tNum - 0.15, tNum + 0.8)));
    around(ctx, W / 2, 1220, np, np, () => {
      txt(ctx, `${n}`, W / 2 - 90, 1220, { size: 180, font: 'RoundB, YuanB', color: C.gold, stroke: INK, sw: 16 });
      txt(ctx, '亿年', W / 2 + 140, 1240, { size: 96, color: C.white, stroke: INK, sw: 12 });
    });
    burst(ctx, t, tNum + 0.6, W / 2, 1220, { n: 12, r: 340 });
  }

  // 小宇 floats in from the bottom-left
  const fly = easeOut(prog(t, 0.2, 1.3));
  astronaut(ctx, t, lerp(-140, 170, fly), lerp(1520, 1260, fly), 0.72, {
    talk: talkLevel(t, ['hook']), look: 1, lookY: -1, arm: -0.9,
    mood: ash > 0.5 ? 'sad' : t > tNum ? 'wow' : 'happy', wave: t < 1.6 ? prog(t, 0.5, 0.9) * (1 - prog(t, 1.4, 1.6)) : 0,
  });
}

// ---------- scene 2: the Sun is a star made of hot plasma ----------
const BITS = [...Array(26)].map((_, i) => ({ a: rnd(i) * TAU, d: 280 + rnd(i + 7) * 120, sp: (0.6 + rnd(i + 3)) * (i % 2 ? 1 : -1), k: i % 3 ? '−' : '+' }));

function plasmaScene(ctx, t) {
  const t0 = S('plasma'), tStar = at('plasma', '恒星'), tPl = at('plasma', '等离子体');
  title(ctx, t, t0, '太阳是一颗恒星', '一大团高温等离子体', { size: 80 });
  const z = 1 + 0.08 * easeOut(prog(t, t0, E('plasma')));
  sunBuddy(ctx, t, SUN[0], SUN[1], 250 * z, { mood: 'happy', look: 0.3, shades: 1 - prog(t, t0, t0 + 0.5) });
  const sp = pop(t, tStar, 0.45);
  around(ctx, 830, 520, sp, sp, () => tag(ctx, 830, 520, '恒星', null, { color: C.gold, size: 54 }));
  // charged particles zipping around: atoms pulled apart into ions (+) and electrons (−)
  const pa = fadeIn(t, tPl - 0.2, 0.5);
  if (pa > 0) {
    BITS.forEach((b, i) => {
      const a = b.a + t * b.sp, x = SUN[0] + Math.cos(a) * b.d * z, y = SUN[1] + Math.sin(a) * b.d * 0.8 * z;
      const col = b.k === '+' ? C.proton : C.sky;
      ctx.save(); ctx.globalAlpha *= pa;
      glow(ctx, x, y, 0, 26, b.k === '+' ? 'rgba(255,107,139,0.5)' : 'rgba(76,201,240,0.5)');
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, b.k === '+' ? 15 : 9, 0, TAU); ctx.fill();
      txt(ctx, b.k, x, y + 1, { size: b.k === '+' ? 24 : 18, color: '#fff', font: 'RoundB' });
      ctx.restore();
    });
  }
  const lp = pop(t, tPl + 0.2, 0.5);
  around(ctx, W / 2, 1230, lp, lp, () => tag(ctx, W / 2, 1230, '高温等离子体', '热到原子都被拆成了带电粒子', { color: C.sunHot, size: 56 }));
}

export const scenes = [
  { id: 'hook', from: 0, to: S('plasma') - 0.25, draw: hookScene },
  { id: 'plasma', from: S('plasma') - 0.25, to: S('dive') - 0.25, draw: plasmaScene },
];

export const events = [
  { type: 'sparkle', t: 0.4 }, { type: 'boing', t: 0.45, amp: 0.7 },
  { type: 'pop', t: at('hook', '木头') - 0.1, f: 600 }, { type: 'pop', t: at('hook', '煤') - 0.1, f: 800 },
  { type: 'whoosh', t: at('coal', '烧煤'), d: 0.6, from: 300, to: 1400 },
  { type: 'wind', t: at('coal', '烧煤') + 0.3, d: 2.6 },
  { type: 'buzz', t: at('coal', '烧光') },
  { type: 'boing', t: S('age') },
  ...[...Array(8)].map((_, i) => ({ type: 'tick', t: at('age', '四十六亿年') - 0.15 + i * 0.1, n: 72 + i * 2 })),
  { type: 'tada', t: at('age', '四十六亿年') + 0.6 },
  { type: 'whoosh', t: at('sunNo', '可不是') - 0.3, d: 0.4, from: 2000, to: 600 },
  { type: 'ding', t: at('sunNo', '可不是') + 0.15, n: 93 },
  { type: 'slam', t: at('sunNo', '烧火') }, { type: 'slam', t: at('sunNo', '烧火') + 0.25 },
  { type: 'stamp', t: at('plasma', '恒星') },
  { type: 'sparkle', t: at('plasma', '等离子体') - 0.2 },
  ...[...Array(5)].map((_, i) => ({ type: 'pop', t: at('plasma', '等离子体') + i * 0.1, f: 1000 + i * 150, amp: 0.5 })),
];
