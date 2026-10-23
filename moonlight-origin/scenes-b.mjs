// Scenes 3–4: the light path (Sun → lunar surface → part of the reflected light reaches an eye on Earth), then the lamp-and-ball analogy.
import { W, C, S, at, atEnd, prog, lerp, easeOut, pop, fadeIn, bob, txt, around, header, pill, arrow, photons, burst } from './lib.mjs';
import { moon, sun, eye, kid, lamp, ball } from './chars.mjs';

const SX = 230, SY = 690, SR = 115;   // Sun
const MX = 760, MY = 930, MR = 150;   // Moon
const EX = 330, EY = 1235;            // observer's eye on Earth
const TOWARD_SUN = Math.atan2(SY - MY, SX - MX);
const edge = (x, y, r, a) => [x + Math.cos(a) * r, y + Math.sin(a) * r];

const T_LIGHT = at('step1', '发出'), T_HIT = at('step1', '照到');
const T_REFL = at('step2', '反射'), T_SPREAD = at('step2', '很多');
const T_EARTH = at('step3', '到达'), T_EYE = at('step3', '眼睛'), T_SEE = at('step3', '看见');
const FAN = [-1.15, -0.6, 0, 0.6, 1.15];
const TO_EYE = Math.atan2(EY - MY, EX - MX);

function ground(ctx, a) {
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = '#0d2a40';
  ctx.beginPath(); ctx.moveTo(0, 1300); ctx.quadraticCurveTo(W / 2, 1240, W, 1300); ctx.lineTo(W, 1920); ctx.lineTo(0, 1920); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.land; ctx.globalAlpha *= 0.35;
  ctx.fillRect(0, 1296, W, 6);
  ctx.restore();
}

function lightPath(ctx, t) {
  if (t < S('step2') - 0.1) header(ctx, t, S('sun') + 0.1, '先找到光源', '太阳光，照到月面');
  else header(ctx, t, S('step2') - 0.1, '月面反射光', '一部分光，来到我们眼前');
  txt(ctx, '示意图 · 大小、距离不按真实比例', W / 2, 500, { size: 28, color: C.dim });

  // Sun slides in from the left and shows off its shades
  const sIn = easeOut(prog(t, S('sun') - 0.2, S('sun') + 0.6));
  const sx = lerp(-200, SX, sIn), sy = SY + bob(t, 6, 1.8);
  sun(ctx, t, sx, sy, SR * (1 + 0.08 * Math.sin(Math.PI * prog(t, at('sun', '太阳光'), at('sun', '太阳光') + 0.5))));
  around(ctx, sx, sy - SR - 50, 1, fadeIn(t, S('sun') + 0.5), () => txt(ctx, '太阳', sx, sy - SR - 50, { size: 44, color: C.gold }));

  // ① incoming sunlight
  const s0 = edge(SX, SY, SR + 24, TOWARD_SUN + Math.PI), s1 = edge(MX, MY, MR + 14, TOWARD_SUN);
  const pIn = easeOut(prog(t, T_LIGHT, T_HIT));
  for (const off of [-50, 0, 50]) {
    const nx = Math.cos(TOWARD_SUN + Math.PI / 2) * off, ny = Math.sin(TOWARD_SUN + Math.PI / 2) * off;
    arrow(ctx, s0[0] + nx, s0[1] + ny, s1[0] + nx * 0.8, s1[1] + ny * 0.8, { p: pIn, w: off ? 6 : 11, head: off ? 24 : 36, color: off ? 'rgba(244,201,120,0.6)' : C.gold, glow: 'rgba(255,200,90,0.8)' });
  }
  if (pIn >= 1) photons(ctx, t, s0[0], s0[1], s1[0], s1[1], { n: 5, speed: 0.9 });

  // the Moon lights up where the sunlight lands
  const lit = lerp(0.12, 1, easeOut(prog(t, T_HIT, T_HIT + 0.5)));
  const eyes = t < T_HIT ? 'closed' : t < T_HIT + 0.6 ? 'happy' : 'open';
  moon(ctx, t, MX, MY + bob(t, 5, 1.5, 1), MR, { light: TOWARD_SUN, lit, glow: 0.6, face: { eyes, look: t > T_EARTH ? [-0.8, 0.7] : [-0.8, -0.6], mouth: 0 } });
  burst(ctx, t, T_HIT + 0.05, MX - 70, MY - 40, { r: 160, n: 8, size: 16 });
  around(ctx, MX + 40, MY + MR + 55, 1, fadeIn(t, T_HIT), () => txt(ctx, '月面', MX + 40, MY + MR + 55, { size: 44, color: C.cream }));
  around(ctx, W / 2, 1235, pop(t, atEnd('step1', '月面'), 0.4), t < S('step2') ? 1 : 1 - fadeIn(t, S('step2'), 0.3), () =>
    pill(ctx, '① 太阳光照到月面', W / 2, 1235, { size: 40 }));

  // ② reflected light fans out in many directions from the sunlit side
  FAN.forEach((d, i) => {
    const a = TOWARD_SUN + d + 0.35;
    const [x0, y0] = edge(MX, MY, MR + 12, a), [x1, y1] = edge(MX, MY, MR + 210, a);
    const p = easeOut(prog(t, T_REFL + i * 0.08, T_SPREAD + i * 0.08 + 0.2));
    arrow(ctx, x0, y0, x1, y1, { p, w: 5, head: 20, color: 'rgba(230,236,245,0.75)', dash: [14, 10] });
  });
  around(ctx, MX + 40, 680, pop(t, T_REFL, 0.4), 1 - fadeIn(t, T_EARTH, 0.3), () => pill(ctx, '② 月面反射光', MX + 40, 680, { size: 38, edge: C.cream }));

  // ③ the part that reaches Earth enters our eye
  const g = fadeIn(t, T_EARTH - 0.3, 0.5);
  ground(ctx, g);
  around(ctx, 150, 1300, 1, g, () => kid(ctx, t, 150, 1300, 0.62, { look: -0.6, point: 0 }));
  const [r0x, r0y] = edge(MX, MY, MR + 12, TO_EYE);
  const pr = easeOut(prog(t, T_EARTH, T_EYE));
  arrow(ctx, r0x, r0y, EX + 70, EY - 50, { p: pr, w: 12, head: 38, color: '#fff6d8', glow: 'rgba(255,240,190,0.9)' });
  if (pr >= 1) photons(ctx, t, r0x, r0y, EX + 70, EY - 50, { n: 4, speed: 1.1, r: 8 });
  const blink = Math.abs(t - T_SEE - 0.15) < 0.09 ? 0.1 : 1;
  around(ctx, EX, EY, pop(t, T_EARTH + 0.2, 0.45), g, () => {
    eye(ctx, EX, EY, 62, { open: blink, glow: fadeIn(t, T_EYE, 0.3) });
    txt(ctx, '地球上的观察者', EX + 20, EY + 80, { size: 34, color: C.teal });
  });
  around(ctx, 760, 1235, pop(t, T_EYE, 0.4), 1, () => pill(ctx, '③ 进入我们的眼睛', 760, 1235, { size: 38, edge: C.sky }));
  burst(ctx, t, T_SEE, EX, EY, { r: 170, n: 10 });
}

// ---------- the lamp-and-ball analogy ----------
const T_LAMP = at('lamp', '台灯'), T_SELF = at('lamp', '球自己'), T_STILL = at('lamp', '照样');
const BX = 720, BY = 1040, BR = 120;
const LX = 200, LY = 1160, LS = 1.1;
const SHADE = [LX + 30 * LS, LY - 260 * LS];
function lampRoom(ctx, t) {
  ctx.fillStyle = 'rgba(3,6,12,0.72)'; ctx.fillRect(0, 0, W, 1920);
  header(ctx, t, S('lamp') + 0.1, '像台灯照皮球', '自己不发光，也能被看见');
  ctx.fillStyle = '#2b2018'; ctx.fillRect(60, LY, W - 120, 26);
  const on = t < T_LAMP + 0.15 ? 0 : 1;
  lamp(ctx, LX, LY, LS, on);
  if (on) {
    const g = ctx.createRadialGradient(BX - 60, BY - 40, 10, BX, BY, 380);
    g.addColorStop(0, 'rgba(255,226,140,0.22)'); g.addColorStop(1, 'rgba(255,226,140,0)');
    ctx.fillStyle = g; ctx.fillRect(BX - 400, BY - 400, 800, 800);
  }
  ball(ctx, BX, BY + bob(t, 4, 2), BR, on ? lerp(0.2, 1, fadeIn(t, T_LAMP + 0.15, 0.25)) : 0.05, Math.atan2(SHADE[1] - BY, SHADE[0] - BX));
  around(ctx, 330, 770, pop(t, T_LAMP + 0.15, 0.4), 1, () => txt(ctx, '啪！', 330, 770, { size: 70, color: C.gold, stroke: C.ink, sw: 10 }), -0.2);
  around(ctx, BX, BY - BR - 70, pop(t, T_SELF, 0.4), 1, () => pill(ctx, '皮球：自己不发光', BX, BY - BR - 70, { size: 36, edge: '#ff6b6b' }));
  // the bounced light reaches an eye in the corner
  const ex = 860, ey = 1300;
  const pr = easeOut(prog(t, T_STILL, T_STILL + 0.5));
  arrow(ctx, BX + 70, BY + 80, ex - 50, ey - 40, { p: pr, w: 8, head: 28, color: '#fff3c4', dash: [16, 10] });
  around(ctx, ex, ey, pop(t, T_STILL + 0.2, 0.4), 1, () => eye(ctx, ex, ey, 46, { glow: 0.6 }));
  const m = fadeIn(t, T_STILL + 0.4, 0.4);
  around(ctx, W / 2, 620, lerp(0.8, 1, m), m, () => {
    pill(ctx, '台灯 ≈ 太阳', 320, 620, { size: 38 });
    pill(ctx, '皮球 ≈ 月亮', 760, 620, { size: 38, edge: C.cream });
  });
}

export const scenesB = [
  { from: S('sun') - 0.3, to: S('lamp') - 0.3, draw: lightPath },
  { from: S('lamp') - 0.3, to: S('kidQ') - 0.3, draw: lampRoom },
];

export const eventsB = [
  { type: 'whoosh', t: S('sun') - 0.3, d: 0.6, from: 300, to: 1800 },
  { type: 'sparkle', t: at('sun', '太阳光') },
  ...[0, 1, 2, 3, 4].map((i) => ({ type: 'note', t: T_LIGHT + i * ((T_HIT - T_LIGHT) / 5), n: [72, 76, 79, 83, 84][i], amp: 0.6 })),
  { type: 'ding', t: T_HIT, n: 91 },
  { type: 'tick', t: atEnd('step1', '月面'), n: 84 },
  ...FAN.map((_, i) => ({ type: 'pop', t: T_REFL + i * 0.08 + 0.2, f: 700 + i * 120, amp: 0.6 })),
  { type: 'whoosh', t: T_EARTH, d: 0.5, from: 1800, to: 600 },
  { type: 'sparkle', t: T_EYE },
  { type: 'tada', t: T_SEE, amp: 0.6 },
  { type: 'whoosh', t: S('lamp') - 0.35, d: 0.5 },
  { type: 'tick', t: T_LAMP + 0.15, n: 96 },
  { type: 'boing', t: T_SELF, amp: 0.4 },
  { type: 'ding', t: T_STILL + 0.2, n: 88 },
  { type: 'pop', t: T_STILL + 0.4, f: 800 },
];
