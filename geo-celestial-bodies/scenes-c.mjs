// Scenes 10–12: one rock with three names, nested celestial systems, and the recap.
import { W, H, C, S, E, SEG, at, prog, lerp, clamp, easeIO, easeOut, pop, fadeIn, txt, card, around, arrow, burst, confetti, talkLevel } from './lib.mjs';
import { sun, earth, moon, rock, kid, tick, cross, glow, orbit, onOrbit, galaxy } from './bodies.mjs';

// ---------- scene 10: same rock, three names ----------
const SKY_Y = 560, GROUND_Y = 880;
const P0 = [520, 300], P1 = [1060, 700], P2 = [1340, GROUND_Y - 24];

function rockPos(t) {
  const a = prog(t, at('rock2', '冲') - 0.1, at('rock2', '道光') + 0.2);
  const b = prog(t, at('rock3', '落') - 0.1, at('rock3', '地面') + 0.1);
  if (b > 0) return [lerp(P1[0], P2[0], easeIO(b)), lerp(P1[1], P2[1], b * b), 0.9 * (1 - b)];
  if (a > 0) return [lerp(P0[0], P1[0], a * a), lerp(P0[1], P1[1], a * a), clamp((a - 0.35) * 2.5)];
  return [P0[0] + Math.sin(t * 1.4) * 14, P0[1] + Math.cos(t * 1.1) * 10, 0];
}

function nameTag(ctx, t, x, y, t0, name, yes, note) {
  const p = pop(t, t0, 0.45);
  around(ctx, x, y, p, p, () => {
    card(ctx, x - 170, y - 70, 340, 140, { fill: 'rgba(6,8,30,0.82)', edge: yes ? C.ok : C.no, ew: 4, drop: 0, r: 30 });
    txt(ctx, name, x - 40, y - 22, { size: 58, color: C.white });
    (yes ? tick : cross)(ctx, x + 110, y - 22, 0.8);
    txt(ctx, note, x, y + 38, { size: 34, color: yes ? C.ok : C.no });
  });
}

function rockScene(ctx, t) {
  // layers: space / atmosphere / ground
  const atm = ctx.createLinearGradient(0, SKY_Y - 120, 0, GROUND_Y);
  atm.addColorStop(0, 'rgba(70,150,255,0)'); atm.addColorStop(0.35, 'rgba(70,150,255,0.35)'); atm.addColorStop(1, 'rgba(120,200,255,0.55)');
  ctx.fillStyle = atm; ctx.fillRect(0, SKY_Y - 120, W, GROUND_Y - SKY_Y + 120);
  ctx.fillStyle = '#5a4636'; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  ctx.fillStyle = C.land; ctx.fillRect(0, GROUND_Y, W, 22);
  for (const [label, y] of [['太空', 230], ['大气层', 700], ['地面', 960]]) {
    card(ctx, 40, y - 34, 170, 68, { fill: 'rgba(255,255,255,0.12)', ew: 0, drop: 0, r: 34 });
    txt(ctx, label, 125, y, { size: 38, color: C.white });
  }
  // fiery trail while it burns
  const [x, y, heat] = rockPos(t);
  if (heat > 0) {
    const dx = P1[0] - P0[0], dy = P1[1] - P0[1], L = Math.hypot(dx, dy);
    const g = ctx.createLinearGradient(x, y, x - (dx / L) * 420, y - (dy / L) * 420);
    g.addColorStop(0, `rgba(255,200,90,${0.9 * heat})`); g.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.save(); ctx.strokeStyle = g; ctx.lineCap = 'round'; ctx.lineWidth = 46 * heat;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - (dx / L) * 420, y - (dy / L) * 420); ctx.stroke(); ctx.restore();
  }
  const landed = prog(t, at('rock3', '地面'), at('rock3', '地面') + 0.1) >= 1;
  if (landed) {
    ctx.fillStyle = '#3e2f24';
    ctx.beginPath(); ctx.ellipse(P2[0], GROUND_Y + 6, 90, 18, 0, 0, Math.PI * 2); ctx.fill();
  }
  const sc = 1 + 0.6 * (1 - easeOut(prog(t, S('rock1') - 0.3, S('rock1') + 0.3)));
  rock(ctx, x, y, 46 * sc * (1 - 0.35 * prog(t, S('rock2'), at('rock2', '道光'))), t * 1.5, heat);
  burst(ctx, t, at('rock3', '地面'), P2[0], GROUND_Y - 10, { r: 160, n: 10, colors: ['#c9a27a', '#8d7f73', C.gold] });
  const qp = pop(t, at('rock', '石头'), 0.4) * (1 - prog(t, S('rock1'), S('rock1') + 0.3));
  around(ctx, P0[0] + 120, P0[1] - 90, qp, qp, () => txt(ctx, '?', P0[0] + 120, P0[1] - 90, { size: 120, color: C.gold, stroke: C.space, sw: 10 }));
  nameTag(ctx, t, 860, 230, at('rock1', '流星体') - 0.1, '流星体', true, '在太空 → 是天体');
  nameTag(ctx, t, 1500, 600, at('rock2', '流星') - 0.1, '流星', false, '一道光，是现象');
  nameTag(ctx, t, 1620, 800, at('rock3', '陨石') - 0.1, '陨石', false, '成了地球的一部分');
}

// ---------- scene 11: nested systems (zoom out level by level) ----------
const LEVELS = [
  { id: 'sys1', name: '地月系', note: '地月距离 ≈ 38.4 万千米', word: '地月系' },
  { id: 'sys2', name: '太阳系', note: '日地距离 ≈ 1.5 亿千米', word: '太阳系' },
  { id: 'sys3', name: '银河系', note: '直径 ≈ 10 万光年', word: '银河系' },
  { id: 'sys4', name: '可观测宇宙', note: '人类目前能看到的最大范围', word: '宇宙' },
];
const CX = 700, CY = 500;

function drawLevel(ctx, t, i) {
  if (i === 0) {
    earth(ctx, t, CX, CY, 110, { light: Math.PI });
    orbit(ctx, CX, CY, 300, 150, 1);
    const [mx, my] = onOrbit(CX, CY, 300, 150, t * 0.8);
    moon(ctx, t, mx, my, 42, { light: Math.PI });
  } else if (i === 1) {
    sun(ctx, t, CX, CY, 70, { face: true });
    const cols = ['#b5a99c', '#e8c27a', C.earth, '#d4643a', '#d9a066', '#e6cf8f', '#8fd3e8', '#4a6fe0'];
    cols.forEach((c, k) => {
      const rx = 120 + k * 52, ry = rx * 0.42;
      orbit(ctx, CX, CY, rx, ry, 1, 'rgba(255,255,255,0.18)');
      const [px, py] = onOrbit(CX, CY, rx, ry, t * (1.2 / (1 + k * 0.5)) + k * 1.7);
      if (k === 2) {
        ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(px, py, 26, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(px, py, k === 5 ? 15 : 9 + (k > 3 ? 6 : 0), 0, Math.PI * 2); ctx.fill();
      if (k === 5) { ctx.save(); ctx.strokeStyle = '#f2e2b0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(px, py, 26, 7, -0.3, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    });
  } else if (i === 2) {
    galaxy(ctx, t, CX, CY, 420, 0.5);
    const sx = CX + 200, sy = CY + 40;
    glow(ctx, sx, sy, 0, 22, 'rgba(255,220,120,1)');
    ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(sx, sy, 26, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    const lp = fadeIn(t, at('sys3', '只是') - 0.1, 0.4);
    around(ctx, sx + 80, sy + 90, 1, lp, () => { arrow(ctx, sx + 90, sy + 100, sx + 30, sy + 32, { color: C.gold, w: 6, head: 18 }); txt(ctx, '太阳在这里', sx + 110, sy + 130, { size: 38, color: C.gold }); });
  } else {
    const gs = [[CX - 330, CY - 200, 90, 1], [CX + 300, CY - 230, 70, 1], [CX + 360, CY + 170, 110, 1], [CX - 360, CY + 210, 80, 1], [CX + 30, CY + 300, 55, 1], [CX - 60, CY - 330, 50, 1]];
    gs.forEach(([x, y, r], k) => {
      const p = pop(t, at('sys4', '河外星系') - 0.2 + k * 0.08, 0.4);
      around(ctx, x, y, p, p, () => galaxy(ctx, t * 0.6 + k, x, y, r, 0.45 + (k % 3) * 0.12, k % 2));
    });
    galaxy(ctx, t, CX, CY, 140, 0.5);
    txt(ctx, '银河系', CX, CY + 110, { size: 40, color: C.gold });
    const hp = fadeIn(t, at('sys4', '河外星系'), 0.4);
    around(ctx, CX + 360, CY + 300, 1, hp, () => txt(ctx, '河外星系', CX + 360, CY + 300, { size: 38, color: C.pink }));
    const fp = easeOut(prog(t, at('sys4', '可'), at('sys4', '宇宙') + 0.3));
    if (fp > 0) {
      ctx.save(); ctx.strokeStyle = C.sky; ctx.lineWidth = 6; ctx.setLineDash([18, 12]); ctx.globalAlpha *= fp;
      ctx.beginPath(); ctx.ellipse(CX, CY, 560, 420, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
  }
}

function systemScene(ctx, t) {
  const t0 = S('system'), tL0 = S('sys1') - 0.3;
  // intro: two bodies pull together and start circling
  if (t < tL0 + 0.6) {
    const a = 1 - prog(t, tL0, tL0 + 0.5);
    const pull = easeOut(prog(t, at('system', '吸引') - 0.2, at('system', '吸引') + 0.6));
    const spin = Math.max(0, t - at('system', '绕')) * 2;
    around(ctx, W / 2, 470, 1, a, () => {
      const r = lerp(620, 330, pull);
      const mx = W / 2 + Math.cos(spin) * r, my = 470 + Math.sin(spin) * r * 0.4;
      if (spin > 0) orbit(ctx, W / 2, 470, r, r * 0.4, 1, 'rgba(255,255,255,0.3)');
      const front = Math.sin(spin) > 0;
      if (!front) moon(ctx, t, mx, my, 50, { light: Math.PI });
      earth(ctx, t, W / 2, 470, 110, { light: Math.PI, mood: 'happy' });
      if (front) moon(ctx, t, mx, my, 50, { light: Math.PI });
      if (pull > 0 && pull < 1) {
        arrow(ctx, mx - 70, 470, mx - 170, 470, { color: C.pink, w: 8, head: 22 });
        arrow(ctx, W / 2 + 130, 470, W / 2 + 230, 470, { color: C.pink, w: 8, head: 22 });
      }
      const ep = pop(t, at('system', '组成') - 0.1, 0.45);
      around(ctx, W / 2, 800, ep, ep, () => {
        card(ctx, W / 2 - 520, 750, 1040, 104, { fill: C.gold, r: 52, ew: 0, drop: 8 });
        txt(ctx, '天体 + 互相吸引、绕着转 = 天体系统', W / 2, 802, { size: 50, color: C.space });
      });
      const tp = pop(t, at('system', '抱团') - 0.1, 0.4);
      around(ctx, W / 2, 170, tp, tp, () => txt(ctx, '天体会“抱团”', W / 2, 170, { size: 84, color: C.white, stroke: C.space, sw: 10 }));
    });
    if (t < tL0) return;
  }
  // zoom levels: each shrinks into the next one
  LEVELS.forEach((lv, i) => {
    const tin = i === 0 ? tL0 : S(lv.id) - 0.45;
    const tout = i < 3 ? S(LEVELS[i + 1].id) - 0.45 : 1e9;
    if (t < tin) return;
    const enter = easeOut(prog(t, tin, tin + 0.7));
    const leave = easeIO(prog(t, tout, tout + 0.8));
    const sc = (i === 0 ? lerp(0.6, 1, enter) : lerp(3.2, 1, enter)) * lerp(1, 0.12, leave);
    const a = enter * (1 - leave);
    around(ctx, CX, CY, sc, a, () => drawLevel(ctx, t, i));
  });
  // ladder on the right
  LEVELS.forEach((lv, i) => {
    const y = 790 - i * 170;
    const p = pop(t, at(lv.id, lv.word) - 0.1, 0.45);
    const active = t >= at(lv.id, lv.word) - 0.1 && (i === 3 || t < S(LEVELS[i + 1].id) - 0.45);
    around(ctx, 1560, y, p, p, () => {
      card(ctx, 1330, y - 66, 460, 132, { fill: active ? C.gold : 'rgba(255,255,255,0.1)', edge: 'rgba(255,255,255,0.3)', ew: active ? 0 : 3, drop: 0, r: 34 });
      txt(ctx, lv.name, 1560, y - 18, { size: 54, color: active ? C.space : C.white });
      txt(ctx, lv.note, 1560, y + 36, { size: 28, color: active ? '#3b2d14' : C.lilac });
      if (i > 0) txt(ctx, '▲', 1560, y + 92, { size: 30, font: 'UniB', color: 'rgba(255,255,255,0.5)' });
    });
  });
}

// ---------- scene 12: recap ----------
const KEYS = [['在太空', '太空', C.sky], ['有实体', '实体', C.pink], ['独立运行', '独立', C.gold]];

function outroScene(ctx, t) {
  KEYS.forEach(([label, w, col], i) => {
    const x = W / 2 - 480 + i * 480, y = 400;
    const p = pop(t, at('outro', w) - 0.1, 0.45);
    around(ctx, x, y, p, p, () => {
      card(ctx, x - 200, y - 110, 400, 220, { fill: col, r: 50, ew: 0, drop: 10 });
      txt(ctx, label, x, y - 10, { size: 76, color: C.space });
      tick(ctx, x, y + 108, 0.9);
    });
    if (i < 2) {
      const pp = pop(t, at('outro', KEYS[i + 1][1]) - 0.2, 0.3);
      around(ctx, x + 240, y, pp, pp, () => txt(ctx, '+', x + 240, y, { size: 90, color: C.white }));
    }
  });
  const tp = pop(t, at('outro', '天体', 0) - 0.1, 0.5);
  around(ctx, W / 2, 680, tp, tp, () => {
    txt(ctx, '= 天体！', W / 2, 680, { size: 170, color: C.gold, stroke: C.space, sw: 14, shadow: 'rgba(0,0,0,0.5)' });
  }, Math.sin(t * 4) * 0.03);
  burst(ctx, t, at('outro', '天体'), W / 2, 680, { r: 420, n: 16 });
  kid(ctx, t, 1700, 980, 0.7, { talk: talkLevel(t, ['kidEnd']), wave: t > S('kidEnd') - 0.2 ? 1 : 0 });
  sun(ctx, t, 200, 860, 80);
  confetti(ctx, t, SEG.kidEnd.words[0].start);
}

export const scenesC = [
  { id: 'rock', from: S('rock') - 0.4, to: S('system') - 0.45, draw: rockScene },
  { id: 'system', from: S('system') - 0.45, to: S('outro') - 0.45, draw: systemScene },
  { id: 'outro', from: S('outro') - 0.45, to: 1e9, draw: outroScene },
];

export const eventsC = [
  { type: 'whoosh', t: S('rock') - 0.45, d: 0.45 },
  { type: 'boing', t: at('rock', '石头'), amp: 0.7 },
  { type: 'tick', t: at('rock1', '流星体') - 0.1, n: 84 },
  { type: 'whoosh', t: at('rock2', '冲') - 0.1, d: 1.6, from: 400, to: 4000, amp: 1.2 },
  { type: 'buzz', t: at('rock2', '流星') - 0.1 },
  { type: 'slam', t: at('rock3', '地面'), shake: 18 },
  { type: 'buzz', t: at('rock3', '陨石') - 0.1 },
  { type: 'whoosh', t: S('system') - 0.5, d: 0.45 },
  { type: 'boing', t: at('system', '吸引') - 0.1, amp: 0.6 },
  { type: 'pop', t: at('system', '组成') - 0.1, f: 700 },
  ...LEVELS.slice(1).map((lv) => ({ type: 'whoosh', t: S(lv.id) - 0.45, d: 0.8, from: 2500, to: 400 })),
  ...LEVELS.map((lv, i) => ({ type: 'note', t: at(lv.id, lv.word) - 0.1, n: [79, 84, 88, 91][i], amp: 0.8 })),
  { type: 'sparkle', t: at('sys4', '河外星系') - 0.2 },
  { type: 'whoosh', t: S('outro') - 0.5, d: 0.45 },
  ...KEYS.map(([, w], i) => ({ type: 'pop', t: at('outro', w) - 0.1, f: 600 + i * 200 })),
  { type: 'tada', t: at('outro', '天体') - 0.1 },
  { type: 'confetti', t: SEG.kidEnd.words[0].start },
];
void E; void cross;
