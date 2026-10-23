// Scenes 1–7: the question, "天体 = 宇宙里的东西", and the family of celestial bodies.
import {
  W, C, ZH, S, E, SEG, at, prog, lerp, easeIO, easeOut, pop, fadeIn,
  txt, card, around, arrow, burst, star, talkLevel, measure,
} from './lib.mjs';
import { sun, earth, moon, comet, nebula, rock, station, kid, orbit, onOrbit, tick, glow } from './bodies.mjs';

// ---------- shared info card on the right ----------
// tags: [[label, word-in-segment, color]], example: [text, word]
export function infoCard(ctx, t, id, title, sub, tags, example) {
  const X = 1130, Wd = 660, Hd = 215 + tags.length * 100 + (example ? 70 : 0), Y = 470 - Hd / 2;
  const p = pop(t, S(id) - 0.25, 0.5);
  around(ctx, X + Wd / 2, 470, p, p, () => {
    card(ctx, X, Y, Wd, Hd, { fill: 'rgba(255,255,255,0.08)', edge: 'rgba(255,255,255,0.3)', ew: 3, drop: 0, r: 40 });
    txt(ctx, title, X + 60, Y + 95, { size: 110, align: 'left', color: C.gold, stroke: C.space, sw: 10 });
    txt(ctx, sub, X + 70 + measure(ctx, title, 110), Y + 108, { size: 40, align: 'left', color: C.lilac });
    tags.forEach(([label, w, col], i) => {
      const tp = pop(t, at(id, w) - 0.05, 0.4);
      const tw = measure(ctx, label, 46) + 70;
      around(ctx, X + 60 + tw / 2, Y + 220 + i * 100, tp, tp, () => {
        card(ctx, X + 60, Y + 182 + i * 100, tw, 78, { fill: col, r: 39, ew: 0, drop: 6 });
        txt(ctx, label, X + 60 + tw / 2, Y + 222 + i * 100, { size: 46, color: C.space });
      });
    });
    if (example) {
      const ep = fadeIn(t, at(id, example[1]) - 0.05, 0.3);
      const ey = Y + 225 + tags.length * 100;
      around(ctx, X + 60, ey, 1, ep, () => txt(ctx, example[0], X + 60, ey, { size: 44, align: 'left', color: C.white }));
    }
  });
}

// ---------- scene 1: hook + definition ----------
const RING = [
  (ctx, t, x, y) => sun(ctx, t, x, y, 62),
  (ctx, t, x, y) => earth(ctx, t, x, y, 56, { light: Math.PI * 0.9 }),
  (ctx, t, x, y) => moon(ctx, t, x, y, 44, { light: Math.PI * 0.9 }),
  (ctx, t, x, y) => comet(ctx, t, x, y, 22, 0.3, 140),
  (ctx, t, x, y) => station(ctx, x, y, 0.6, Math.sin(t) * 0.1),
  (ctx, t, x, y) => rock(ctx, x, y, 34, t * 0.6),
];

function introScene(ctx, t) {
  const tQ = S('hook'), tDef = at('def', '天体'), tThing = at('def', '东西');
  const toRight = easeIO(prog(t, S('def') - 0.2, S('def') + 0.5));
  const kx = lerp(640, 300, toRight), ky = 860;
  kid(ctx, t, kx, ky, lerp(1.25, 0.95, toRight), { talk: talkLevel(t, ['hook']), wave: t < tQ + 1.2 ? 1 : 0 });
  // twinkly things the kid points at
  const fade = 1 - toRight;
  [[1100, 260, 1.0], [1420, 380, 0.7], [1650, 200, 0.9], [1260, 560, 0.6], [1580, 640, 0.8]].forEach(([x, y, s], i) => {
    const a = pop(t, 0.5 + i * 0.25, 0.5) * fade;
    if (a <= 0) return;
    const tw = 0.7 + 0.3 * Math.sin(t * 5 + i * 2);
    around(ctx, x, y, a * s * tw, a, () => {
      glow(ctx, x, y, 0, 70, 'rgba(255,240,180,0.7)');
      ctx.fillStyle = '#fffbe0';
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const r = k % 2 ? 10 : 46, ang = (k * Math.PI) / 4;
        ctx.lineTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r);
      }
      ctx.closePath(); ctx.fill();
    });
  });
  const qp = pop(t, at('hook', '天体') - 0.1, 0.45) * fade;
  around(ctx, 1000, 300, qp, qp, () => txt(ctx, '?', 870, 300 + Math.sin(t * 6) * 8, { size: 160, color: C.gold, stroke: C.space, sw: 10 }));

  // definition: big title + the "things" orbiting around it
  const dp = pop(t, tDef - 0.1, 0.5);
  around(ctx, 1150, 470, dp, dp, () => {
    txt(ctx, '天体', 1150, 430, { size: 210, color: C.gold, stroke: C.space, sw: 16, shadow: 'rgba(0,0,0,0.5)' });
    const tp = pop(t, tThing - 0.4, 0.45);
    around(ctx, 1150, 600, tp, tp, () => txt(ctx, '= 宇宙里的“东西”', 1150, 600, { size: 68, color: C.white }));
  });
  RING.forEach((draw, i) => {
    const rp = pop(t, tThing + i * 0.1, 0.45);
    if (rp <= 0) return;
    const a = (i / RING.length) * Math.PI * 2 + t * 0.25;
    const [x, y] = onOrbit(1150, 480, 520, 330, a);
    around(ctx, x, y, rp, rp, () => draw(ctx, t, x, y));
  });
}

// ---------- scene 2: star ----------
function starScene(ctx, t) {
  const tLit = at('star', '发光');
  const r = 230 * (1 + 0.15 * easeOut(prog(t, tLit, tLit + 0.4)) - 0.15 * easeOut(prog(t, tLit + 0.4, tLit + 0.9)));
  sun(ctx, t, 560, 470, r, { talk: 0, mood: 'happy' });
  burst(ctx, t, tLit, 560, 470, { r: 380, n: 14, size: 26 });
  infoCard(ctx, t, 'star', '恒星', 'star', [['自己会发光', '发光', C.gold], ['还会发热', '发热', '#ff9f43']], ['例：太阳', '太阳']);
}

// ---------- scene 3: planet ----------
function planetScene(ctx, t) {
  const t0 = S('planet');
  const cx = 520, cy = 480;
  sun(ctx, t, cx, cy, 110, { face: true });
  orbit(ctx, cx, cy, 380, 230, easeOut(prog(t, t0 - 0.2, t0 + 0.8)));
  const ang = 0.4 + (t - t0) * 0.35;
  const [ex, ey] = onOrbit(cx, cy, 380, 230, ang);
  const lightAng = Math.atan2(cy - ey, cx - ex);
  // sunlight rays hitting the planet and bouncing toward the viewer
  const rp = prog(t, at('planet', '反射') - 0.3, at('planet', '反射') + 0.6);
  if (rp > 0) {
    for (let k = -1; k <= 1; k++) {
      const sx = cx + Math.cos(-lightAng + Math.PI) * 0, sy = cy;
      const hx = ex + Math.cos(lightAng) * 70 + k * 18, hy = ey + Math.sin(lightAng) * 70 + k * 18;
      arrow(ctx, sx + Math.cos(Math.atan2(hy - sy, hx - sx)) * 130, sy + Math.sin(Math.atan2(hy - sy, hx - sx)) * 130, hx, hy,
        { color: 'rgba(255,214,90,0.9)', w: 6, head: 18, p: easeOut(prog(rp, 0, 0.5)) });
      arrow(ctx, hx, hy, hx + 40 + k * 30, hy + 170, { color: 'rgba(170,220,255,0.9)', w: 6, head: 18, p: easeOut(prog(rp, 0.5, 1)) });
    }
  }
  const dark = fadeIn(t, at('planet', '不发光'), 0.3);
  earth(ctx, t, ex, ey, 86, { light: lightAng, mood: dark > 0 && t < at('planet', '反射') ? 'sad' : 'happy' });
  infoCard(ctx, t, 'planet', '行星', 'planet',
    [['绕着恒星转', '恒星', C.sky], ['自己不发光', '不发光', C.lilac], ['靠反射阳光', '反射', C.gold]], ['例：地球、火星', '地球']);
}

// ---------- scene 4: moon (satellite) ----------
function moonScene(ctx, t) {
  const t0 = S('moon');
  const cx = 540, cy = 480;
  earth(ctx, t, cx, cy, 150, { light: Math.PI * 0.85 });
  orbit(ctx, cx, cy, 340, 170, easeOut(prog(t, t0 - 0.2, t0 + 0.8)));
  const ang = -0.3 + (t - t0) * 0.6;
  const [mx, my] = onOrbit(cx, cy, 340, 170, ang);
  const behind = Math.sin(ang) < 0;
  if (behind) { moon(ctx, t, mx, my, 62, { light: Math.PI * 0.85 }); earth(ctx, t, cx, cy, 150, { light: Math.PI * 0.85 }); } else moon(ctx, t, mx, my, 62, { light: Math.PI * 0.85 });
  infoCard(ctx, t, 'moon', '卫星', 'satellite', [['绕着行星转', '行星', C.sky], ['自己也不发光', '卫星', C.lilac]], ['例：月球 → 地球的卫星', '月球']);
}

// ---------- scene 5: comet ----------
function cometScene(ctx, t) {
  const t0 = S('comet'), tNear = at('comet', '靠近');
  const sx = 230, sy = 470;
  sun(ctx, t, sx, sy, 120);
  orbit(ctx, sx + 380, sy, 470, 160, 1, 'rgba(255,255,255,0.18)');
  const u = easeIO(prog(t, t0 - 0.3, E('comet') + 0.4));
  const ang = lerp(-0.1, -Math.PI * 0.82, u);
  const [x, y] = onOrbit(sx + 380, sy, 470, 160, ang);
  const dist = Math.hypot(x - sx, y - sy);
  const tail = 30 + 480 * easeOut(prog(t, tNear - 0.3, tNear + 0.9)) * (1.1 - dist / 900);
  comet(ctx, t, x, y, 34, Math.atan2(y - sy, x - sx), tail);
  infoCard(ctx, t, 'comet', '彗星', 'comet', [['冰+尘埃的“脏雪球”', '脏雪球', C.sky], ['靠近太阳拖长尾巴', '尾巴', C.gold]], ['例：哈雷彗星，约 76 年回来一次', '靠近']);
}

// ---------- scene 6: nebula ----------
function nebulaScene(ctx, t) {
  const tBorn = at('nebula', '出生');
  nebula(ctx, t, 540, 470, 1.5);
  for (let i = 0; i < 4; i++) {
    const p = pop(t, tBorn + i * 0.18, 0.5);
    const [x, y] = [[440, 400], [640, 520], [560, 330], [380, 560]][i];
    around(ctx, x, y, p, p, () => {
      glow(ctx, x, y, 0, 60, 'rgba(255,250,210,0.9)');
      star(ctx, x, y, 30, '#fffbe0', t);
    });
  }
  const bp = pop(t, tBorn + 0.6, 0.4);
  around(ctx, 560, 200, bp, bp, () => {
    card(ctx, 410, 160, 300, 80, { fill: C.pink, r: 40, ew: 0, drop: 6 });
    txt(ctx, '恒星宝宝！', 560, 200, { size: 44, color: C.space });
  });
  infoCard(ctx, t, 'nebula', '星云', 'nebula', [['气体 + 尘埃', '气体', C.pink], ['恒星出生的地方', '出生', C.gold]], ['例：猎户座大星云', '恒星']);
}

// ---------- scene 7: the rest of the family ----------
const MORE = [
  ['流星体', '太空里的小石块', '流星体', (ctx, t, x, y) => { for (let i = 0; i < 3; i++) rock(ctx, x - 60 + i * 60, y + (i % 2) * 30 - 10, 26 + i * 6, t * (0.4 + i * 0.2)); }],
  ['星际物质', '极稀薄的气体尘埃', '星际物质', (ctx, t, x, y) => {
    for (let i = 0; i < 40; i++) {
      const a = i * 2.4 + t * 0.2, d = 20 + (i * 37) % 110;
      ctx.fillStyle = `rgba(200,220,255,${0.25 + 0.3 * Math.abs(Math.sin(t * 2 + i))})`;
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * d * 1.3, y + Math.sin(a) * d * 0.7, 3, 0, Math.PI * 2); ctx.fill();
    }
  }],
  ['人造天体', '如中国空间站', '空间站', (ctx, t, x, y) => station(ctx, x, y + Math.sin(t * 2) * 8, 1.05, Math.sin(t * 0.8) * 0.12)],
];

function moreScene(ctx, t) {
  MORE.forEach(([title, sub, w, draw], i) => {
    const x = 400 + i * 560, y = 470;
    const p = pop(t, at('more', w) - 0.1, 0.5);
    around(ctx, x, y, p, p, () => {
      card(ctx, x - 230, 230, 460, 520, { fill: 'rgba(255,255,255,0.08)', edge: i === 2 ? C.sky : 'rgba(255,255,255,0.3)', ew: 3, drop: 0, r: 40 });
      if (i === 2) {
        ctx.save(); ctx.setLineDash([16, 12]); ctx.strokeStyle = C.sky; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.roundRect(x - 214, 246, 428, 488, 30); ctx.stroke(); ctx.restore();
      }
      draw(ctx, t, x, 430);
      txt(ctx, title, x, 610, { size: 64, color: C.gold });
      txt(ctx, sub, x, 680, { size: 38, color: C.lilac });
    });
    const tp = pop(t, at('more', '都是天体') + i * 0.12, 0.4);
    around(ctx, x + 180, 270, tp, tp, () => tick(ctx, x + 180, 270, 1.1));
  });
}

export const scenesA = [
  { id: 'intro', from: 0, to: S('star') - 0.4, draw: introScene },
  { id: 'star', from: S('star') - 0.4, to: S('planet') - 0.35, draw: starScene },
  { id: 'planet', from: S('planet') - 0.35, to: S('moon') - 0.35, draw: planetScene },
  { id: 'moon', from: S('moon') - 0.35, to: S('comet') - 0.35, draw: moonScene },
  { id: 'comet', from: S('comet') - 0.35, to: S('nebula') - 0.35, draw: cometScene },
  { id: 'nebula', from: S('nebula') - 0.35, to: S('more') - 0.4, draw: nebulaScene },
  { id: 'more', from: S('more') - 0.4, to: S('kidQ') - 0.4, draw: moreScene },
];

export const eventsA = [
  { type: 'whoosh', t: 0.1, d: 0.6 },
  ...[0, 1, 2, 3, 4].map((i) => ({ type: 'note', t: 0.6 + i * 0.25, n: [84, 88, 91, 93, 96][i], amp: 0.5 })),
  { type: 'boing', t: at('hook', '天体') - 0.1, amp: 0.7 },
  { type: 'whoosh', t: S('def') - 0.2, d: 0.5 },
  { type: 'tada', t: at('def', '天体') - 0.1, amp: 0.6 },
  ...RING.map((_, i) => ({ type: 'pop', t: at('def', '东西') + i * 0.1, f: 600 + i * 120, amp: 0.7 })),
  ...['star', 'planet', 'moon', 'comet', 'nebula', 'more'].map((id) => ({ type: 'whoosh', t: S(id) - 0.4, d: 0.45 })),
  { type: 'sparkle', t: at('star', '发光') },
  { type: 'pop', t: at('star', '发热') - 0.05, f: 800 },
  { type: 'ding', t: at('star', '太阳'), n: 86 },
  { type: 'pop', t: at('planet', '恒星') - 0.05, f: 700 },
  { type: 'pop', t: at('planet', '不发光') - 0.05, f: 600 },
  { type: 'sparkle', t: at('planet', '反射') - 0.2, amp: 0.6 },
  { type: 'pop', t: at('moon', '行星') - 0.05, f: 700 },
  { type: 'ding', t: at('moon', '月球'), n: 84 },
  { type: 'pop', t: at('comet', '脏雪球') - 0.05, f: 500 },
  { type: 'whoosh', t: at('comet', '靠近') - 0.1, d: 1.0, from: 300, to: 3000, amp: 0.7 },
  { type: 'pop', t: at('nebula', '气体') - 0.05, f: 700 },
  ...[0, 1, 2, 3].map((i) => ({ type: 'note', t: at('nebula', '出生') + i * 0.18, n: [88, 91, 95, 100][i], amp: 0.6 })),
  ...MORE.map(([, , w], i) => ({ type: 'pop', t: at('more', w) - 0.1, f: 600 + i * 200 })),
  ...MORE.map((_, i) => ({ type: 'tick', t: at('more', '都是天体') + i * 0.12, n: 79 + i * 4 })),
];
void W; void ZH; void SEG;
