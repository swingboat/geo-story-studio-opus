// Scenes 1–3: clear vs cloudy winter night hook → the "invisible quilt" → the ground radiates day and night.
import {
  C, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn,
  txt, card, around, burst, talkLevel,
} from './lib.mjs';
import { hiker, groundBody, glow } from './chars.mjs';
import { thermo, irWave, disclaimer } from './props.mjs';
import { moon, frost, quilt, cloudBuddy, banner } from './night.mjs';

// ---------- scene 1: two winter nights side by side ----------
const PANELS = [
  { x0: 70, x1: 480, label: '晴朗的夜', cloudy: false },
  { x0: 500, x1: 910, label: '有云的夜', cloudy: true },
];

function hookScene(ctx, t) {
  const tCloud = at('hook', '有云'), tWarm = at('hook', '没那么冷');
  const talk = talkLevel(t, ['hook']);
  PANELS.forEach((p, i) => {
    const cx = (p.x0 + p.x1) / 2, gy = 1150;
    const sp = pop(t, i * 0.12, 0.45);
    around(ctx, cx, 900, sp, 1, () => {
      ctx.save();
      ctx.beginPath(); ctx.roundRect(p.x0, 540, p.x1 - p.x0, 720, 36); ctx.clip();
      const g = ctx.createLinearGradient(0, 540, 0, 1260);
      g.addColorStop(0, p.cloudy ? '#27355e' : '#070d30'); g.addColorStop(1, p.cloudy ? '#3b4f80' : '#15306a');
      ctx.fillStyle = g; ctx.fillRect(p.x0, 540, p.x1 - p.x0, 720);
      if (!p.cloudy) {
        for (let k = 0; k < 14; k++) {
          const sx = p.x0 + 30 + ((k * 97) % 350), sy = 620 + ((k * 61) % 260);
          ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.5 * Math.sin(t * 3 + k)})`;
          ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2); ctx.fill();
        }
        moon(ctx, t, p.x1 - 90, 650, 46, { mood: 'happy' });
      }
      groundBody(ctx, t, p.x0, p.x1, gy, 120, { heat: 0, grass: true, shimmer: 0 });
      if (!p.cloudy) frost(ctx, t, p.x0 + 10, p.x1 - 10, gy, easeOut(prog(t, 0.4, tWarm)));
      ctx.restore();
      card(ctx, p.x0, 540, p.x1 - p.x0, 720, { fill: 'rgba(0,0,0,0)', edge: p.cloudy ? C.pink : C.cool, ew: 6, r: 36, drop: 0 });
    });
    txt(ctx, p.label, cx, 590, { size: 40, color: p.cloudy ? C.pink : C.cool, stroke: C.space, sw: 8 });
    const shiver = p.cloudy ? 0 : 0.9;
    hiker(ctx, t, cx - 40, gy, 0.42, { talk: p.cloudy ? 0 : talk, shiver, mood: 'happy' });
    const level = p.cloudy ? lerp(0.3, 0.55, easeOut(prog(t, tWarm - 0.2, tWarm + 0.6))) : lerp(0.3, 0.12, easeOut(prog(t, tWarm - 0.2, tWarm + 0.6)));
    thermo(ctx, p.x1 - 60, gy - 60, 220, level);
  });
  // a cosy cloud drifts over the right panel
  const cp = easeOut(prog(t, tCloud - 0.3, tCloud + 0.4));
  if (cp > 0) cloudBuddy(ctx, t, lerp(1100, 680, cp), 700, 0.95, { mood: 'happy' });
  const qp = pop(t, tWarm + 0.1, 0.4);
  around(ctx, 490, 940, qp, qp, () => {
    card(ctx, 430, 880, 120, 120, { fill: C.cream, ew: 0, r: 60, drop: 8 });
    txt(ctx, '?', 490, 940 + Math.sin(t * 7) * 6, { size: 96, color: C.ir });
  });
}

// ---------- scene 2: the atmosphere is an invisible quilt ----------
const GY = 1120;
function quiltScene(ctx, t) {
  const tQ = at('quilt', '被子'), tAir = at('quilt', '大气');
  moon(ctx, t, 800, 640, 60, { mood: 'happy' });
  quilt(ctx, t, 70, 910, GY + 10, 400, easeOut(prog(t, tQ - 0.35, tQ + 0.15)));
  groundBody(ctx, t, 60, 920, GY, 150, { heat: 0.25, face: [490, GY + 82], faceR: 82, mood: t > tQ ? 'happy' : 'sad', shimmer: 0 });
  burst(ctx, t, tQ + 0.15, 490, GY - 240, { r: 300, n: 12, colors: [C.pink, C.lilac, C.gold] });
  banner(ctx, t, '大气 ≈ 看不见的被子', 490, 590, tAir - 0.1, 1e9, { size: 52 });
  around(ctx, 490, 1240, 1, fadeIn(t, tQ + 0.4, 0.4), () => txt(ctx, '（打个比方，不是真有一层布）', 490, 668, { size: 30, color: 'rgba(220,235,255,0.85)' }));
}

// ---------- scene 3: the ground radiates all day, all night ----------
const EY = 1130;
function emitScene(ctx, t) {
  const tDay = at('emit', '白天'), tNight = at('emit', '黑夜'), tNon = at('emit', '不停'), tLeak = S('kidLeak');
  banner(ctx, t, '地面：24小时不停辐射', 470, 580, S('emit') - 0.1, 1e9, { size: 48, fill: C.ir });
  // day/night dial: sun swaps for moon
  const dn = easeIO(prog(t, tNight - 0.25, tNight + 0.25));
  ctx.save();
  ctx.translate(800, 760); ctx.rotate(Math.PI * dn);
  ctx.fillStyle = 'rgba(10,22,60,0.85)';
  ctx.beginPath(); ctx.arc(0, 0, 90, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  around(ctx, 800, 760, 1, fadeIn(t, tDay - 0.2, 0.3), () => {
    ctx.save(); ctx.translate(800, 760); ctx.rotate(Math.PI * dn);
    glow(ctx, 0, -42, 6, 50, 'rgba(255,190,60,0.7)');
    ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(0, -42, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f4f1d0'; ctx.beginPath(); ctx.arc(0, 42, 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(10,22,60,0.85)'; ctx.beginPath(); ctx.arc(10, 34, 20, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  txt(ctx, dn < 0.5 ? '白天' : '黑夜', 800, 880, { size: 38, color: dn < 0.5 ? C.gold : C.cool, stroke: C.space, sw: 8 });
  // continuous orange infrared rising from the ground
  for (let i = 0; i < 5; i++) {
    const x = 130 + i * 140, ph = (t * 0.55 + i * 0.37) % 1;
    const a = fadeIn(t, S('emit') + i * 0.12, 0.3) * Math.sin(Math.PI * ph);
    irWave(ctx, t, x, EY - 30, x, EY - 30 - 460, 0.35 + 0.65 * ph, { alpha: a, amp: 12, w: 8 });
  }
  const worry = prog(t, tLeak, tLeak + 0.3);
  groundBody(ctx, t, 60, 940, EY, 125, { heat: 0.6, face: [500, EY + 70], faceR: 75, shimmer: 0.3, mood: worry > 0.5 ? 'wow' : 'happy' });
  burst(ctx, t, tNon, 500, EY - 60, { r: 260, n: 10, colors: [C.ir, C.gold] });
  // Doudou worries that all the heat escapes
  const kp = easeOut(prog(t, tLeak - 0.4, tLeak));
  if (kp > 0) {
    hiker(ctx, t, lerp(-150, 170, kp), EY, 0.5, { talk: talkLevel(t, ['kidLeak']), point: 1, mood: 'wow' });
    const bp = pop(t, tLeak + 0.2, 0.4);
    around(ctx, 330, 860, bp, bp, () => {
      card(ctx, 200, 800, 300, 110, { fill: C.cream, ew: 0, r: 40, drop: 8 });
      txt(ctx, '全跑光了?!', 350, 856, { size: 50, color: C.red });
    });
  }
  disclaimer(ctx, 1290, fadeIn(t, S('emit') + 0.3, 0.4));
}

export const scenes = [
  { from: 0, to: S('quilt') - 0.25, draw: hookScene },
  { from: S('quilt') - 0.25, to: S('emit') - 0.3, draw: quiltScene },
  { from: S('emit') - 0.3, to: S('absorb') - 0.3, draw: emitScene },
];

export const events = [
  { type: 'wind', t: 0, d: 3.6 },
  { type: 'pop', t: 0.02, f: 700 },
  { type: 'pop', t: 0.14, f: 900 },
  { type: 'whoosh', t: at('hook', '有云') - 0.3, d: 0.6, from: 400, to: 1400 },
  { type: 'boing', t: at('hook', '没那么冷') + 0.1, amp: 0.6 },
  { type: 'whoosh', t: S('quilt') - 0.25, d: 0.4 },
  { type: 'whoosh', t: at('quilt', '被子') - 0.35, d: 0.45, from: 2600, to: 500 },
  { type: 'boing', t: at('quilt', '被子') + 0.12, amp: 0.8, shake: 10 },
  { type: 'sparkle', t: at('quilt', '被子') + 0.2 },
  { type: 'whoosh', t: S('emit') - 0.3, d: 0.4 },
  { type: 'pop', t: S('emit') - 0.1, f: 800 },
  { type: 'wobble', t: at('emit', '辐射') - 0.6, d: 1.6, f: 420, rate: 7, amp: 0.3 },
  { type: 'tick', t: at('emit', '黑夜') - 0.2, n: 79 },
  { type: 'alarm', t: S('kidLeak') + 0.15 },
];
