// Scenes 3–4: the Sun (恒星) and the Earth (行星) at the registration counter.
import { W, C, S, E, at, prog, lerp, easeIO, easeOut, pop, fadeIn, txt, card, around, arrow, burst, talkLevel } from './lib.mjs';
import { sun, earth, glow, orbit, onOrbit } from './bodies.mjs';
import { idCard, STAMP, goggles, eye } from './props.mjs';

const TAU = Math.PI * 2;

// Pull the stage up and shrink it while the ID card rises from below.
export function withCard(ctx, t, tIn, stage, cardOpts) {
  const k = easeIO(prog(t, tIn - 0.2, tIn + 0.5));
  ctx.save();
  ctx.translate(540, lerp(820, 680, k)); ctx.scale(lerp(1, 0.6, k), lerp(1, 0.6, k)); ctx.translate(-540, -820);
  stage();
  ctx.restore();
  if (k <= 0) return;
  const y = lerp(1700, 1140, easeOut(prog(t, tIn - 0.1, tIn + 0.5)));
  idCard(ctx, t, 540, y, 1.0, cardOpts);
}

// ---------- scene 3: the Sun ----------
function sunScene(ctx, t) {
  const tIn = S('sunHi') - 0.3, tCore = at('sunA', '核心'), tPlasma = at('sunA', '等离子体'), tFuse = at('sunA', '核聚变');
  const tCard = S('sunStamp'), tStamp = at('sunStamp', '恒星');
  const talk = talkLevel(t, ['sunHi', 'sunA']);
  withCard(ctx, t, tCard, () => {
    const enter = easeOut(prog(t, tIn, tIn + 0.6));
    const side = easeIO(prog(t, tPlasma - 0.4, tPlasma + 0.2));
    const proud = 1 + 0.08 * Math.sin(Math.PI * prog(t, at('sunA', '自己') - 0.1, at('sunA', '造') + 0.4));
    const x = lerp(lerp(-300, 540, enter), 300, side), y = 820, r = lerp(230, 165, side) * proud;
    sun(ctx, t, x, y + Math.sin(t * 2) * 8, r, { talk, look: side ? 0.8 : 0 });
    // plasma tag
    const pp = pop(t, tPlasma - 0.1, 0.45);
    around(ctx, x, y + r + 110, pp, pp, () => {
      card(ctx, x - 190, y + r + 70, 380, 80, { fill: '#ff9f43', ew: 0, drop: 6, r: 40 });
      txt(ctx, '高温等离子体', x, y + r + 112, { size: 46, color: C.space });
    });
    // cutaway inset
    const cp = pop(t, tCore - 0.15, 0.55);
    around(ctx, 790, 800, cp, cp, () => {
      const cx = 790, cy = 800, R = 200;
      glow(ctx, cx, cy, R * 0.9, R * 1.5, 'rgba(255,160,60,0.35)');
      [[1, '#ff8a2a'], [0.72, '#ffb43c'], [0.42, '#ffe08a']].forEach(([k, col]) => {
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, R * k, 0, TAU); ctx.fill();
      });
      const hot = 0.6 + 0.4 * Math.abs(Math.sin(t * 6));
      const fp = prog(t, tFuse - 0.2, tFuse + 0.6);
      glow(ctx, cx, cy, 0, R * (0.35 + 0.2 * fp) * hot, 'rgba(255,255,255,0.95)');
      // two nuclei smashing together, over and over
      if (fp > 0) {
        const ph = (t * 1.4) % 1, d = R * 0.28 * (1 - Math.min(1, ph * 1.6));
        ctx.fillStyle = '#ff4d6d';
        ctx.beginPath(); ctx.arc(cx - d - 6, cy, 12, 0, TAU); ctx.arc(cx + d + 6, cy, 12, 0, TAU); ctx.fill();
        if (ph > 0.6) glow(ctx, cx, cy, 0, 60 * (1 - (ph - 0.6) / 0.4) + 10, 'rgba(255,255,200,0.95)');
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 4; ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      txt(ctx, '剖面示意', cx, cy - R - 40, { size: 36, color: 'rgba(255,255,255,0.8)' });
      const lp = pop(t, tFuse - 0.1, 0.45);
      around(ctx, cx, cy + R + 70, lp, lp, () => {
        arrow(ctx, cx, cy + R + 30, cx, cy + 40, { color: '#fff', w: 6, head: 20 });
        card(ctx, cx - 170, cy + R + 32, 340, 80, { fill: C.gold, ew: 0, drop: 6, r: 40 });
        txt(ctx, '核心：核聚变', cx, cy + R + 74, { size: 46, color: C.space });
      });
    });
    burst(ctx, t, at('sunStamp', '发光'), x, y, { r: 360, n: 14, size: 26 });
  }, {
    name: '太阳', light: '自己发光发热', orbit: '太阳系的中心',
    cat: '恒星', color: STAMP.star, stampP: prog(t, tStamp - 0.05, tStamp + 0.25),
    rows: [0, 1, 2].map((i) => prog(t, tCard + 0.3 + i * 0.35, tCard + 0.6 + i * 0.35)),
    portrait: (c, x, y, r) => sun(c, t, x, y, r * 0.7),
  });
}

// ---------- scene 4: the Earth ----------
function wave(ctx, x0, y0, ang, len, ph, color) {
  ctx.save();
  ctx.translate(x0, y0); ctx.rotate(ang);
  ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let s = 0; s <= len; s += 4) ctx.lineTo(s, Math.sin(s * 0.09 - ph) * 10);
  ctx.stroke();
  ctx.restore();
}

function earthScene(ctx, t) {
  const tIn = S('earthHi') - 0.3, tOut = S('earthQ') - 0.1, tYear = at('earthA', '一年');
  const tLight = S('earthL'), tReflect = at('earthLA', '反射'), tGog = at('earthIR', '红外'), tHeat = at('earthIR', '热辐射');
  const tCard = S('earthStamp'), tStamp = at('earthStamp', '行星');
  const talk = talkLevel(t, ['earthHi', 'earthA', 'earthLA', 'earthIR2']);
  withCard(ctx, t, tCard, () => {
    const zoom = easeIO(prog(t, tOut, tOut + 0.8));
    const cx = 540, cy = 820, rx = 380, ry = 250;
    const sunR = lerp(0, 95, zoom);
    if (sunR > 1) sun(ctx, t, cx, cy, sunR, { face: true, look: 0.3 });
    orbit(ctx, cx, cy, rx, ry, easeOut(prog(t, tOut + 0.2, tOut + 1.0)));
    // one quick lap on "一年一圈", then settle on the lower right
    const lap = easeIO(prog(t, tYear - 0.1, tYear + 1.6));
    const ang = 0.55 + lap * TAU + (t - tOut) * 0.05;
    const [ox, oy] = onOrbit(cx, cy, rx, ry, ang);
    const enter = easeOut(prog(t, tIn, tIn + 0.5));
    const ex = lerp(lerp(1400, 540, enter), ox, zoom), ey = lerp(820, oy, zoom), er = lerp(170, 82, zoom);
    const lightAng = Math.atan2(cy - ey, cx - ex);
    const lp = pop(t, tYear - 0.1, 0.4) * (1 - prog(t, tLight - 0.3, tLight));
    around(ctx, cx, cy - 330, lp, lp, () => txt(ctx, '绕太阳 · 一年一圈', cx, cy - 330, { size: 60, color: C.sky, stroke: C.space, sw: 10 }));
    // sunlight in, visible light bounced toward an eye
    const rp = prog(t, tLight, tReflect + 0.8);
    const irP = easeOut(prog(t, tGog + 0.2, tGog + 0.7)) * (1 - prog(t, tCard - 0.3, tCard + 0.3));
    const ex2 = 230, ey2 = 1250;
    if (rp > 0) {
      for (let k = -1; k <= 1; k++) {
        const a = Math.atan2(ey - cy, ex - cx), s0 = sunR + 30;
        const hx = ex - Math.cos(a) * (er + 6) + k * 14, hy = ey - Math.sin(a) * (er + 6) + k * 14;
        arrow(ctx, cx + Math.cos(a) * s0 + k * 14, cy + Math.sin(a) * s0 + k * 14, hx, hy,
          { color: `rgba(255,214,90,${0.9 * (1 - irP * 0.7)})`, w: 7, head: 20, p: easeOut(prog(rp, 0, 0.45)) });
        const bp = easeOut(prog(t, tReflect - 0.1, tReflect + 0.6));
        arrow(ctx, hx - 10, hy + 10, ex2 + 60 + k * 18, ey2 - 60 + k * 10, { color: `rgba(190,230,255,${0.95 * (1 - irP * 0.7)})`, w: 7, head: 20, p: bp });
      }
      const eyeP = pop(t, tReflect - 0.2, 0.4);
      around(ctx, ex2, ey2, eyeP, eyeP, () => eye(ctx, ex2, ey2, 0.9));
      const tagP = pop(t, tReflect + 0.1, 0.4) * (1 - irP);
      around(ctx, 600, 1260, tagP, tagP, () => {
        card(ctx, 340, 1218, 560, 84, { fill: '#bfe6ff', ew: 0, drop: 6, r: 42 });
        txt(ctx, '可见光：反射太阳光', 620, 1261, { size: 44, color: C.space });
      });
    }
    // infrared view: everything dims, the Earth glows with its own heat
    if (irP > 0) {
      ctx.fillStyle = `rgba(30,0,40,${0.55 * irP})`;
      ctx.fillRect(-200, 400, W + 400, 1100);
    }
    earth(ctx, t, ex, ey, er, { light: zoom > 0.5 ? lightAng : Math.PI * 1.2, talk, look: zoom > 0.5 ? -0.4 : 0 });
    if (irP > 0) {
      ctx.save();
      ctx.globalAlpha *= irP;
      const g = ctx.createRadialGradient(ex, ey, er * 0.1, ex, ey, er * 1.05);
      g.addColorStop(0, '#ffe26a'); g.addColorStop(0.5, '#ff6b3d'); g.addColorStop(0.85, '#c2185b'); g.addColorStop(1, '#4a148c');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ex, ey, er, 0, TAU); ctx.fill();
      const hp = prog(t, tHeat - 0.3, tHeat + 0.4);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + 0.2;
        wave(ctx, ex + Math.cos(a) * (er + 14), ey + Math.sin(a) * (er + 14), a, 120 * hp, t * 8, 'rgba(255,110,80,0.9)');
      }
      ctx.restore();
      const gp = 1 - easeOut(prog(t, tGog - 0.2, tGog + 0.3));
      if (gp < 1) goggles(ctx, 540, lerp(560, -200, gp), 1.3);
      const tp = pop(t, tHeat - 0.1, 0.45);
      around(ctx, 600, 1260, tp, tp, () => {
        card(ctx, 330, 1218, 580, 84, { fill: '#ff8a65', ew: 0, drop: 6, r: 42 });
        txt(ctx, '红外：自身热辐射', 620, 1261, { size: 44, color: C.space });
      });
      if (t > S('earthIR2')) txt(ctx, '嘿嘿~', ex + er + 40, ey - er, { size: 56, color: C.gold, stroke: C.space, sw: 8 });
    }
  }, {
    name: '地球', light: '可见光靠反射太阳光', orbit: '绕太阳运行',
    cat: '行星', color: STAMP.planet, stampP: prog(t, tStamp - 0.05, tStamp + 0.25),
    rows: [0, 1, 2].map((i) => prog(t, tCard + 0.2 + i * 0.3, tCard + 0.5 + i * 0.3)),
    portrait: (c, x, y, r) => earth(c, t, x, y, r * 0.8, { light: Math.PI * 1.2 }),
  });
}

export const scenesB = [
  { id: 'sun', from: S('sunHi') - 0.35, to: S('earthHi') - 0.35, draw: sunScene },
  { id: 'earth', from: S('earthHi') - 0.35, to: S('moonHi') - 0.35, draw: earthScene },
];

export const eventsB = [
  { type: 'whoosh', t: S('sunHi') - 0.4, d: 0.5 },
  { type: 'boing', t: at('sunA', '自己') - 0.05, amp: 0.6 },
  { type: 'pop', t: at('sunA', '等离子体') - 0.1, f: 600 },
  { type: 'whoosh', t: at('sunA', '核心') - 0.2, d: 0.4, from: 2000, to: 500 },
  { type: 'sparkle', t: at('sunA', '核聚变') - 0.1 },
  { type: 'sparkle', t: at('sunStamp', '发光') },
  { type: 'whoosh', t: S('sunStamp') - 0.25, d: 0.5, from: 300, to: 1500 },
  { type: 'stamp', t: at('sunStamp', '恒星'), shake: 16 },
  { type: 'whoosh', t: S('earthHi') - 0.4, d: 0.5 },
  { type: 'whoosh', t: at('earthA', '一年') - 0.1, d: 1.5, from: 400, to: 1800, amp: 0.6 },
  { type: 'ding', t: at('earthA', '一圈'), n: 88 },
  { type: 'tick', t: at('earthLA', '反射') - 0.1, n: 84 },
  { type: 'whoosh', t: at('earthIR', '红外') - 0.2, d: 0.5, from: 2500, to: 400 },
  { type: 'boing', t: at('earthIR', '红外') + 0.2, amp: 0.5 },
  { type: 'sparkle', t: at('earthIR', '热辐射') - 0.1 },
  { type: 'whoosh', t: S('earthStamp') - 0.25, d: 0.5, from: 300, to: 1500 },
  { type: 'stamp', t: at('earthStamp', '行星'), shake: 16 },
];
void E; void fadeIn;
