// Scenes 5–6: on the ground (through the air, absorbed, warming up), then "not all of it": reflection & air absorption.
import { W, H, C, TAU, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, around, burst, talkLevel, rnd } from './lib.mjs';
import { astronaut, glow, face } from './cast.mjs';
import { title, tag, stamp } from './props.mjs';
import { lightWave } from './sun.mjs';
import { energyDot, wavePoint, cloudBuddy, bubble } from './waves.mjs';

const INK = '#0a0828';
const AIR_TOP = 640, GROUND = 1150;

// Space → atmosphere → sunny sky, then a sandy ground; `warm` tints the sand.
function world(ctx, t, warm = 0, snow = false) {
  const g = ctx.createLinearGradient(0, 0, 0, GROUND);
  g.addColorStop(0, '#070a30'); g.addColorStop(AIR_TOP / GROUND - 0.08, '#121a5a');
  g.addColorStop(AIR_TOP / GROUND + 0.05, '#2f63b8'); g.addColorStop(1, '#a8dcff');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, GROUND);
  for (let i = 0; i < 60; i++) {
    const x = rnd(i) * W, y = rnd(i + 9) * (AIR_TOP - 80);
    ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.5 * Math.abs(Math.sin(t * 1.5 + i))})`;
    ctx.beginPath(); ctx.arc(x, y, 1.5 + rnd(i + 3) * 1.5, 0, TAU); ctx.fill();
  }
  // the top of the atmosphere: a soft glowing edge
  ctx.strokeStyle = 'rgba(160,220,255,0.55)'; ctx.lineWidth = 6; ctx.setLineDash([22, 14]); ctx.lineDashOffset = -t * 20;
  ctx.beginPath(); ctx.moveTo(0, AIR_TOP); ctx.lineTo(W, AIR_TOP); ctx.stroke(); ctx.setLineDash([]);
  const sand = ctx.createLinearGradient(0, GROUND, 0, H);
  sand.addColorStop(0, `rgb(${lerp(240, 255, warm)},${lerp(200, 182, warm)},${lerp(130, 112, warm)})`);
  sand.addColorStop(1, `rgb(${lerp(205, 225, warm)},${lerp(160, 145, warm)},${lerp(95, 88, warm)})`);
  ctx.fillStyle = sand;
  ctx.beginPath(); ctx.moveTo(0, GROUND);
  for (let x = 0; x <= W; x += 30) ctx.lineTo(x, GROUND + Math.sin(x * 0.012) * 12);
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
  ctx.strokeStyle = 'rgba(160,110,60,0.35)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const y = GROUND + 70 + i * 50, x = (i * 173) % 700 + 60;
    ctx.beginPath(); ctx.arc(x, y + 60, 70, -2.2, -0.9); ctx.stroke();
  }
  if (snow) {
    ctx.fillStyle = '#f4fbff'; ctx.strokeStyle = INK; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(740, GROUND + 20);
    ctx.quadraticCurveTo(860, GROUND - 60, W + 10, GROUND - 10); ctx.lineTo(W + 10, GROUND + 70); ctx.lineTo(740, GROUND + 70); ctx.closePath();
    ctx.fill(); ctx.stroke();
  }
}

function heatLines(ctx, t, x, y, a, n = 3, sp = 40) {
  if (a <= 0) return;
  ctx.strokeStyle = `rgba(255,120,60,${0.85 * a})`; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const yy = y - ((t * 70 + i * 50) % 140);
    ctx.globalAlpha = a * (1 - ((t * 70 + i * 50) % 140) / 140);
    ctx.beginPath();
    for (let k = 0; k < 6; k++) ctx.lineTo(x + (i - (n - 1) / 2) * sp + Math.sin(k + t * 5 + i) * 8, yy - k * 14);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// ---------- scene 5: through the air, onto the sand ----------
const HITS = [[200, 0], [450, 1], [700, 2]];

function groundScene(ctx, t) {
  const t0 = S('atmo'), tThru = at('atmo', '穿过大气'), tGround = at('atmo', '照到地面');
  const tAbs = at('absorb', '吸收'), tE = at('absorb', '能量'), tWarm = at('absorb', '升温'), tK = S('kidSand');
  const warm = easeOut(prog(t, tAbs, tWarm + 0.6));
  world(ctx, t, warm);
  title(ctx, t, t0, '把镜头，落在一处地面', null, { size: 66, t1: tAbs - 0.2 });
  title(ctx, t, tAbs, '地表吸收，就会升温', null, { size: 74, color: C.gold });
  const ap = pop(t, tThru - 0.1, 0.45);
  around(ctx, 900, AIR_TOP + 70, ap, ap, () => tag(ctx, 900, AIR_TOP + 70, '大气', null, { color: C.sky, size: 44 }));
  // waves come down from space: reach the air edge, cross it, then touch the ground
  const p1 = easeOut(prog(t, t0 - 0.2, tThru)), p2 = easeIO(prog(t, tThru, tGround + 0.2));
  HITS.forEach(([hx], i) => {
    const x1 = hx - 260, y1 = 400, f = lerp(0, 0.36, p1) + 0.64 * p2;
    lightWave(ctx, t + i, x1, y1, hx, GROUND, { p: f, amp: 20, wl: 70, w: 9, color: C.energy });
    if (t > tAbs - 0.4) {
      const ff = 0.55 + (((t - tAbs) * 0.45 + i * 0.3) % 1) * 0.45;
      const [px, py] = wavePoint(t + i, x1, y1, hx, GROUND, ff, 20, 70);
      energyDot(ctx, t, px, py, 15, prog(t, tAbs - 0.4, tAbs) * (1 - (ff - 0.55) / 0.45));
    }
    const g = prog(t, tAbs - 0.1, tAbs + 0.6);
    if (g > 0) {
      glow(ctx, hx, GROUND + 30, 0, 170 * g * (1 + 0.06 * Math.sin(t * 5 + i)), `rgba(255,120,40,${0.55 * g})`);
      heatLines(ctx, t, hx, GROUND - 20, prog(t, tWarm - 0.2, tWarm + 0.3), 2, 36);
    }
  });
  const gp = pop(t, tGround - 0.1, 0.45) * (1 - prog(t, tAbs - 0.2, tAbs));
  around(ctx, 450, 1040, gp, gp, () => tag(ctx, 450, 1040, '照到地面', null, { color: '#ffffff', size: 44 }));
  // the sand blushes as it absorbs the energy
  face(ctx, t, 450, GROUND + 190, 150, { mood: t > tWarm ? 'starry' : t > tAbs ? 'wow' : 'happy', ink: '#6b3b12' });
  const ep = pop(t, tE - 0.1, 0.45);
  around(ctx, 450, 1000, ep, ep, () => tag(ctx, 450, 1000, '获得能量 +', null, { color: C.gold, size: 50 }), -0.05);
  const wp = pop(t, tWarm - 0.1, 0.45);
  around(ctx, 210, 870, wp, wp, () => tag(ctx, 210, 870, '升温', null, { color: '#ff8a4c', size: 52 }), 0.06);
  // 小宇 lands on the beach and enjoys it
  const kp = easeOut(prog(t, tK - 0.8, tK - 0.1));
  if (kp > 0) {
    astronaut(ctx, t, 880, lerp(500, 1060, kp), 0.55, { talk: talkLevel(t, ['kidSand']), mood: 'starry', look: -1, wave: 1, arm: -0.4 });
    heatLines(ctx, t, 880, 1010, prog(t, at('kidSand', '暖乎乎') - 0.2, at('kidSand', '暖乎乎') + 0.3), 3, 46);
  }
}

// ---------- scene 6: not all of it reaches the ground ----------
// four equal lanes — the number of lanes does not represent shares of energy
const CLOUD = [210, 860], LANE = { cloud: 210, air: 430, ground: 640, snow: 880 };

function splitScene(ctx, t) {
  const t0 = S('butNot'), tR = S('reflect'), tCloud = at('reflect', '云'), tSurf = at('reflect', '地表'), tBack = at('reflect', '太空');
  const tAir = at('airSip', '大气'), tPart = S('part'), tOne = at('part', '一部分');
  world(ctx, t, 0.3 * prog(t, tPart, tPart + 0.6), true);
  title(ctx, t, t0, '并非全部被地表吸收', null, { size: 70, t1: tR - 0.2 });
  title(ctx, t, tR, '还有反射和大气吸收', null, { size: 70, t1: tPart - 0.2 });
  title(ctx, t, tPart, '地表只吸收其中一部分', null, { size: 70, color: C.gold });
  const inP = easeIO(prog(t, t0 + 0.2, t0 + 1.8));
  const dim = (k) => 1 - 0.65 * prog(t, tPart, tPart + 0.4) * (k === 'ground' ? 0 : 1);
  // incoming
  const stops = { cloud: CLOUD[1] - 80, air: 930, ground: GROUND, snow: GROUND - 30 };
  for (const [k, x] of Object.entries(LANE)) {
    lightWave(ctx, t + x, x, 420, x, stops[k], { p: inP, amp: 18, wl: 64, w: 9, a: dim(k) });
  }
  cloudBuddy(ctx, t, CLOUD[0], CLOUD[1], 85, { a: pop(t, t0, 0.5), mood: t > tCloud ? 'starry' : 'happy', puff: prog(t, tCloud - 0.1, tCloud + 0.2) * (1 - prog(t, tCloud + 0.3, tCloud + 0.6)) });
  // bounces back to space, same golden wave
  const up = (k, t1) => {
    const x = LANE[k], y = stops[k];
    const p = easeOut(prog(t, t1, t1 + 1.1));
    lightWave(ctx, t + x + 3, x + 10, y - 30, x + 150, 420, { p, amp: 18, wl: 64, w: 9, a: dim(k), color: '#ffe98a' });
    burst(ctx, t, t1, x, y - 20, { n: 8, r: 120 });
  };
  up('cloud', tCloud);
  up('snow', tSurf);
  const lc = pop(t, tCloud + 0.1, 0.45);
  around(ctx, 230, 1010, lc, lc * dim('cloud'), () => tag(ctx, 230, 1010, '云反射', null, { color: '#ffffff', size: 42 }));
  const ls = pop(t, tSurf + 0.1, 0.45);
  around(ctx, 880, 1000, ls, ls * dim('snow'), () => tag(ctx, 880, 1000, '地表反射', '冰雪地面', { color: '#d8f2ff', size: 40 }));
  const lb = pop(t, tBack - 0.1, 0.45) * (1 - prog(t, tPart, tPart + 0.4));
  around(ctx, 560, 520, lb, lb, () => tag(ctx, 560, 520, '↑ 反射回太空', null, { color: C.energy, size: 44 }));
  // the atmosphere takes a sip
  const sip = prog(t, tAir - 0.1, tAir + 0.5);
  if (sip > 0) {
    glow(ctx, LANE.air, 930, 0, 150 * sip, `rgba(140,220,255,${0.6 * sip * dim('air')})`);
    const bp = pop(t, tAir, 0.4);
    around(ctx, LANE.air + 10, 790, bp, bp * dim('air'), () => bubble(ctx, LANE.air + 10, 790, '咕嘟', LANE.air, 880, { size: 40, fill: '#e3f6ff' }));
    const la = pop(t, tAir + 0.2, 0.45);
    around(ctx, LANE.air, 1060, la, la * dim('air'), () => tag(ctx, LANE.air, 1060, '大气吸收', null, { color: C.sky, size: 40 }));
  }
  // the ground share glows
  const gg = prog(t, tPart, tPart + 0.5);
  if (gg > 0) {
    glow(ctx, LANE.ground, GROUND + 30, 0, 190 * gg, `rgba(255,120,40,${0.6 * gg})`);
    heatLines(ctx, t, LANE.ground, GROUND - 20, gg, 3, 40);
  }
  const lg = pop(t, tOne - 0.1, 0.45);
  stamp(ctx, LANE.ground - 60, GROUND + 190, '地表吸收', lg, { color: '#ff9a4c', size: 60, rot: -0.05 });
}

export const scenes = [
  { id: 'ground', from: S('atmo') - 0.3, to: S('butNot') - 0.3, draw: groundScene },
  { id: 'split', from: S('butNot') - 0.3, to: S('sum') - 0.3, draw: splitScene },
];

export const events = [
  { type: 'whoosh', t: S('atmo') - 0.1, d: 1.4, from: 3000, to: 600, amp: 0.6 },
  { type: 'pop', t: at('atmo', '穿过大气'), f: 800 },
  { type: 'pop', t: at('atmo', '照到地面'), f: 600 },
  { type: 'note', t: at('absorb', '吸收'), n: 67 }, { type: 'note', t: at('absorb', '能量'), n: 72 }, { type: 'note', t: at('absorb', '升温'), n: 76 },
  { type: 'sparkle', t: at('kidSand', '暖乎乎') },
  { type: 'whoosh', t: S('butNot') + 0.1, d: 1.4, from: 2600, to: 500, amp: 0.5 },
  { type: 'boing', t: at('reflect', '云') },
  { type: 'boing', t: at('reflect', '地表'), amp: 0.8 },
  { type: 'pop', t: at('airSip', '大气'), f: 500 }, { type: 'pop', t: at('airSip', '大气') + 0.15, f: 420 },
  { type: 'stamp', t: at('part', '一部分') - 0.1 },
];
