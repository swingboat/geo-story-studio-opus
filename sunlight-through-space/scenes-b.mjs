// Scenes 3–4: air vs vacuum (sound needs a medium, EM waves don't), then the wave crosses space to Earth.
import { W, C, TAU, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, around, burst, card, talkLevel, rnd, shakeOf } from './lib.mjs';
import { astronaut, glow } from './cast.mjs';
import { title, tag, stamp } from './props.mjs';
import { sunBuddy, earthBuddy, lightWave } from './sun.mjs';
import { energyDot, wavePoint, bubble, bigCross } from './waves.mjs';

const INK = '#0a0828';
const PX = 70, PW = W - 140, PH = 430;
const AIR_Y = 470, VAC_Y = 990;

// Sound as nested arcs leaving (x,y); `reach` limits how far they get before dying out.
function soundArcs(ctx, t, x, y, a, reach = 600) {
  if (a <= 0) return;
  for (let i = 0; i < 4; i++) {
    const f = (t * 0.9 + i / 4) % 1, r = 40 + f * reach;
    ctx.strokeStyle = `rgba(200,220,255,${a * (1 - f)})`; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y, r, -0.55, 0.55); ctx.stroke();
  }
}

function speakerIcon(ctx, x, y, s, muted) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#e8ecff'; ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-40, -20); ctx.lineTo(-15, -20); ctx.lineTo(15, -48); ctx.lineTo(15, 48); ctx.lineTo(-15, 20); ctx.lineTo(-40, 20); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.restore();
  if (muted) bigCross(ctx, x + 50 * s, y, 26 * s, muted);
}

function panel(ctx, t, y, label, color, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  card(ctx, PX, y, PW, PH, { fill: 'rgba(10,14,48,0.82)', edge: color, ew: 5, drop: 10, r: 36 });
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect(PX + 30, y - 30, 200, 60, 30); ctx.fill();
  txt(ctx, label, PX + 130, y + 1, { size: 38, color: INK });
  ctx.restore();
}

function mediumScene(ctx, t) {
  const t0 = S('sound'), tSnd = at('sound', '声音'), tVib = at('sound', '振动'), tSh = S('shout');
  const tVac = S('vacuum'), tOut = at('vacuum', '传不出去'), tEm = S('emNo'), tMed = at('emNo', '媒介');
  title(ctx, t, t0, '空气 vs 真空', null, { size: 80, t1: tEm - 0.2 });
  title(ctx, t, tEm, '没有空气，也能传播', null, { size: 76, color: C.gold });
  const pa = pop(t, t0 - 0.1, 0.5), pb = pop(t, t0 + 0.2, 0.5);
  around(ctx, W / 2, AIR_Y + PH / 2, pa, 1, () => panel(ctx, t, AIR_Y, '空气中', '#b8c2e0', 1));
  around(ctx, W / 2, VAC_Y + PH / 2, pb, 1, () => panel(ctx, t, VAC_Y, '真空中', C.lilac, 1));
  // air particles: grey dots that jiggle harder while sound passes through
  const vib = prog(t, tSnd, tSnd + 0.4) * (1 - prog(t, tEm, tEm + 0.6)) + 0.6 * prog(t, tVib - 0.2, tVib + 0.2) * (1 - prog(t, tSh, tSh + 0.5));
  for (let i = 0; i < 46; i++) {
    const x = PX + 50 + rnd(i) * (PW - 100), y = AIR_Y + 60 + rnd(i + 40) * (PH - 110);
    const dx = Math.sin(t * 26 + x * 0.04) * 10 * vib;
    ctx.fillStyle = `rgba(190,198,220,${0.75 * pa})`;
    ctx.beginPath(); ctx.arc(x + dx, y, 9, 0, TAU); ctx.fill();
  }
  // top: a speaker sends sound across the air
  const sa = pa * (1 - prog(t, tEm - 0.3, tEm));
  if (sa > 0) {
    speakerIcon(ctx, PX + 110, AIR_Y + PH / 2 + 20, 1.1, 0);
    ctx.save();
    ctx.beginPath(); ctx.roundRect(PX + 6, AIR_Y + 6, PW - 12, PH - 12, 30); ctx.clip();
    soundArcs(ctx, t, PX + 150, AIR_Y + PH / 2 + 20, prog(t, tSnd - 0.2, tSnd + 0.3) * sa, 760);
    ctx.restore();
    const lp = pop(t, tVib - 0.1, 0.45) * sa;
    around(ctx, 700, AIR_Y + 70, lp, lp, () => tag(ctx, 700, AIR_Y + 70, '声音 = 空气振动', null, { color: '#d6deff', size: 40 }));
  }
  // bottom: 小宇 shouts in the vacuum — the sound dies right at his helmet
  const kp = easeOut(prog(t, tSh - 0.6, tSh - 0.1));
  const kx = lerp(-120, PX + 130, kp), ky = VAC_Y + 150;
  if (kp > 0) {
    const [sx, sy] = shakeOf(t, tSh, 10, 0.5);
    astronaut(ctx, t, kx + sx, ky + sy, 0.44, {
      talk: talkLevel(t, ['shout']), mood: t > tVac + 0.3 && t < tEm ? 'sad' : t > tMed ? 'starry' : 'happy', arm: -0.6, wave: t < tSh + 0.2 ? 0 : 0,
    });
    soundArcs(ctx, t, kx + 62, ky, prog(t, tSh, tSh + 0.2) * (1 - prog(t, tEm - 0.3, tEm)), 70);
  }
  const bp = pop(t, tSh, 0.35) * (1 - prog(t, tVac, tVac + 0.3));
  around(ctx, 560, VAC_Y + 110, bp, bp, () => bubble(ctx, 560, VAC_Y + 110, '喂！听得见吗？', kx + 60, ky - 20, { size: 42 }));
  // a listener on the far side hears nothing
  const ex = PX + PW - 140, ey = VAC_Y + PH - 120;
  const lit = prog(t, tMed - 0.6, tMed);
  earthBuddy(ctx, t, ex, ey, 70 * pb, { light: Math.PI, lit, look: -1, mood: lit > 0.5 ? 'starry' : t > tSh + 0.6 ? 'sad' : 'happy', shades: 0 });
  const dots = pop(t, tSh + 0.8, 0.4) * (1 - prog(t, tEm - 0.3, tEm));
  around(ctx, ex, ey - 120, dots, dots, () => bubble(ctx, ex, ey - 120, '……', ex - 20, ey - 70, { size: 40 }));
  const mp = pop(t, tOut - 0.1, 0.45) * (1 - prog(t, tEm - 0.3, tEm));
  around(ctx, 560, VAC_Y + PH - 70, mp, mp, () => { speakerIcon(ctx, 400, VAC_Y + PH - 70, 0.7, 1); tag(ctx, 640, VAC_Y + PH - 70, '声音传不出去', null, { color: C.no, size: 40 }); });
  // EM waves cross both panels, air or no air
  const wp = easeIO(prog(t, tEm + 0.1, tEm + 1.6));
  for (const [y, x2] of [[AIR_Y + PH / 2 + 20, PX + PW - 40], [ey, ex - 80]])
    lightWave(ctx, t, PX + 60, y, x2, y, { p: wp, amp: 24, wl: 80, w: 10, color: C.energy });
  burst(ctx, t, tEm + 1.5, ex - 70, ey, { n: 10, r: 150 });
  const np = pop(t, tMed - 0.1, 0.5);
  stamp(ctx, 630, VAC_Y - 45, '不需要空气当媒介', np, { color: C.gold, size: 58, rot: -0.05 });
}

// ---------- across space: the wave runs from the Sun to Earth, 小宇 surfing on it ----------
const SUN = [200, 690], SR = 150, EARTH = [860, 1250], ER = 125;
const FAN = [-3.0, 0.1, 1.35, 2.2, 2.75];

function crossScene(ctx, t) {
  const t0 = S('cross'), tVac = at('cross', '真空'), tEarth = at('cross', '地球'), tRide = S('kidRide'), tArr = S('arrive');
  title(ctx, t, t0, '穿过真空', '一路把能量送向地球', { size: 84 });
  const ang = Math.atan2(EARTH[1] - SUN[1], EARTH[0] - SUN[0]);
  const [x1, y1] = [SUN[0] + Math.cos(ang) * SR * 1.25, SUN[1] + Math.sin(ang) * SR * 1.25];
  const [x2, y2] = [EARTH[0] - Math.cos(ang) * ER * 1.05, EARTH[1] - Math.sin(ang) * ER * 1.05];
  // radiation leaves in all directions; we follow the part headed for Earth
  FAN.forEach((a, i) => lightWave(ctx, t + i, SUN[0] + Math.cos(a) * SR * 1.25, SUN[1] + Math.sin(a) * SR * 1.25, SUN[0] + Math.cos(a) * 560, SUN[1] + Math.sin(a) * 560,
    { p: easeOut(prog(t, t0 - 0.3, t0 + 1)), amp: 10, wl: 50, w: 5, a: 0.4 }));
  const hp = easeIO(prog(t, t0, tEarth + 0.4));
  lightWave(ctx, t, x1, y1, x2, y2, { p: hp, amp: 26, wl: 90, w: 11, color: '#fff27a' });
  // vacuum label sits on the path
  const vp = pop(t, tVac - 0.1, 0.45) * (1 - prog(t, tRide - 0.5, tRide - 0.2));
  around(ctx, 740, 880, vp, vp, () => tag(ctx, 740, 880, '真空也能过', null, { color: C.lilac, size: 42 }), -0.06);
  // energy parcels stream along the wave
  for (let i = 0; i < 4; i++) {
    const f = ((t - t0) * 0.32 + i / 4) % 1;
    if (f > hp) continue;
    const [px, py] = wavePoint(t, x1, y1, x2, y2, f, 26, 90);
    energyDot(ctx, t, px, py, 16, prog(t, t0 + 0.3, t0 + 0.8));
  }
  sunBuddy(ctx, t, SUN[0], SUN[1], SR, { look: 1, lookY: 1, mood: 'happy' });
  // 小宇 surfs the wave toward Earth
  const rp = easeIO(prog(t, tRide - 0.3, tArr - 0.1));
  if (rp > 0 && rp < 1) {
    const f = lerp(0.05, 0.86, rp);
    const [px, py] = wavePoint(t, x1, y1, x2, y2, f, 26, 90);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let k = 0; k < 4; k++) {
      const off = 50 + k * 30;
      ctx.beginPath(); ctx.moveTo(px - Math.cos(ang) * off - 20 + k * 14, py - Math.sin(ang) * off - 70 + k * 30);
      ctx.lineTo(px - Math.cos(ang) * (off + 80) - 20 + k * 14, py - Math.sin(ang) * (off + 80) - 70 + k * 30); ctx.stroke();
    }
    ctx.save(); ctx.translate(px, py); ctx.rotate(ang * 0.6);
    ctx.fillStyle = C.sky; ctx.strokeStyle = INK; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.ellipse(0, 0, 90, 18, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.restore();
    astronaut(ctx, t, px, py - 120, 0.48, { talk: talkLevel(t, ['kidRide']), mood: 'starry', wave: 1, look: 1 });
  }
  // Earth signs for the delivery
  const lit = prog(t, tEarth, tEarth + 0.6);
  if (lit > 0) glow(ctx, EARTH[0], EARTH[1], ER, ER * 2.3, `rgba(255,230,120,${0.35 * lit})`);
  earthBuddy(ctx, t, EARTH[0], EARTH[1], ER, { light: ang + Math.PI, lit, look: -0.8, talk: talkLevel(t, ['arrive']), mood: t > tArr ? 'starry' : 'happy' });
  const dp = pop(t, tArr - 0.05, 0.45);
  around(ctx, 720, 1020, dp, dp, () => bubble(ctx, 720, 1020, '叮咚！', EARTH[0] - 40, EARTH[1] - ER, { size: 56, fill: '#fff6d8' }));
  burst(ctx, t, tArr, EARTH[0], EARTH[1], { n: 14, r: 260 });
}

export const scenes = [
  { id: 'medium', from: S('sound') - 0.3, to: S('cross') - 0.3, draw: mediumScene },
  { id: 'cross', from: S('cross') - 0.3, to: S('atmo') - 0.3, draw: crossScene },
];

export const events = [
  { type: 'note', t: at('sound', '声音'), n: 72 }, { type: 'note', t: at('sound', '声音') + 0.2, n: 76 },
  { type: 'wind', t: at('sound', '振动') - 0.2, d: 1.0 },
  { type: 'pop', t: S('shout') - 0.05, f: 700 },
  { type: 'buzz', t: at('vacuum', '传不出去') },
  { type: 'whoosh', t: S('emNo') + 0.1, d: 1.5, from: 500, to: 3200, amp: 0.7 },
  { type: 'stamp', t: at('emNo', '媒介') - 0.1 },
  { type: 'sparkle', t: S('emNo') + 1.5 },
  { type: 'whoosh', t: S('cross'), d: 1.6, from: 400, to: 2600, amp: 0.6 },
  { type: 'pop', t: at('cross', '真空'), f: 900 },
  { type: 'whoosh', t: S('kidRide') - 0.2, d: 1.8, from: 300, to: 3500, amp: 0.8 },
  { type: 'ding', t: S('arrive'), n: 84 }, { type: 'ding', t: S('arrive') + 0.22, n: 79 },
];
