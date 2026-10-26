// Scenes F: all conditions combine around Earth (宜居 ≠ 一定有生命) → two-column exam answer → checking a "habitable planet" headline → Earth's combo punch.
import { C, NUM, SANS, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, measure, card, around, burst, stamp, confetti, talkLevel, rand } from './lib.mjs';
import { planet, glow } from './bodies.mjs';
import { bubble, chip, condIcon, checkBadge, CONDS } from './props.mjs';

const TAU = Math.PI * 2;
const ORDER = ['temp', 'air', 'water', 'light', 'safe'];

// ---------- combo: five conditions lock in around Earth ----------
function combo(ctx, t) {
  const tP = S('e-proud'), tAll = at('combo', '几个条件'), tNe = at('combo', '不等于'), tLife = at('combo', '一定有生命');
  const EX = 540, EY = 800, ER = 150;
  const lock = easeOut(prog(t, tAll + 0.9, tAll + 1.3));
  glow(ctx, EX, EY, ER, ER + 200, `rgba(61,220,151,${0.35 * lock})`);
  ORDER.forEach((k, i) => {
    const p = pop(t, tAll - 0.2 + i * 0.18, 0.4);
    if (p <= 0) return;
    const a = -Math.PI / 2 + (i / 5) * TAU + (1 - lock) * 0.4 + Math.sin(t) * 0.02;
    const r = lerp(420, 330, easeOut(prog(t, tAll + i * 0.18, tAll + 0.9)));
    const x = EX + Math.cos(a) * r, y = EY + Math.sin(a) * r * 0.9;
    ctx.save();
    ctx.globalAlpha *= p;
    ctx.strokeStyle = CONDS[k].color; ctx.lineWidth = 4; ctx.setLineDash([8, 10]);
    ctx.beginPath(); ctx.moveTo(EX + Math.cos(a) * (ER + 20), EY + Math.sin(a) * (ER + 20) * 0.9); ctx.lineTo(x, y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    around(ctx, x, y, p, p, () => {
      ctx.fillStyle = CONDS[k].color;
      ctx.beginPath(); ctx.arc(x, y, 62, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.white; ctx.lineWidth = 6; ctx.stroke();
      condIcon(ctx, t, k, x, y, 46);
      const lab = { temp: '温度', air: '大气', water: '液态水', light: '光照', safe: '安全' }[k];
      txt(ctx, lab, x, y + 98, { size: 42, color: CONDS[k].color });
    });
  });
  planet(ctx, t, '地球', EX, EY, ER, { face: true, mood: t > tNe ? 'wow' : 'proud', talk: talkLevel(t, ['e-proud']), light: -0.8 });
  const bp = pop(t, tP + 0.2, 0.4) * (1 - prog(t, tAll - 0.4, tAll - 0.1));
  bubble(ctx, 620, 620, '不只靠距离！', { side: -1, size: 56, sc: bp, a: bp });
  const np = pop(t, tNe - 0.15, 0.45);
  around(ctx, 540, 1300, np, np, () => {
    card(ctx, 120, 1235, 840, 130, { fill: C.cream, edge: C.no, ew: 8, drop: 10, r: 40 });
    txt(ctx, '宜居', 300, 1302, { size: 72, color: C.ink });
    txt(ctx, '≠', 450, 1298, { size: 96, font: NUM, color: C.no });
    const lp = fadeIn(t, tLife - 0.1, 0.3);
    ctx.save(); ctx.globalAlpha *= lp;
    txt(ctx, '一定有生命', 700, 1302, { size: 72, color: C.ink });
    ctx.restore();
  });
}

// ---------- exam: answer card, two columns ----------
const COLS = [
  { head: '外部', x: 290, color: C.gold, items: [['light', '稳定的光照', '太阳处于稳定期', '稳定的光照'], ['safe', '安全的宇宙环境', '大小行星各行其道', '安全的']] },
  { head: '自身', x: 780, color: C.sky, items: [['temp', '适宜的温度', '日地距离适中\n自转、公转周期适中', '适宜的温度'], ['air', '适合生物呼吸的大气', '质量、体积适中', '大气'], ['water', '液态水', '温度适宜', '液态水']] },
];
function exam(ctx, t) {
  const t0 = S('exam');
  const pp = pop(t, t0 - 0.2, 0.45);
  around(ctx, 540, 820, pp, pp, () => {
    card(ctx, 60, 250, 960, 1150, { fill: '#fbf3df', edge: C.gold, ew: 0, drop: 14, r: 30 });
    ctx.strokeStyle = 'rgba(160,140,100,0.25)'; ctx.lineWidth = 2;
    for (let y = 440; y < 1380; y += 60) { ctx.beginPath(); ctx.moveTo(90, y); ctx.lineTo(990, y); ctx.stroke(); }
    txt(ctx, '答题：地球存在生命的条件', 540, 325, { size: 58, color: C.ink });
    ctx.fillStyle = 'rgba(160,140,100,0.4)'; ctx.fillRect(525, 400, 4, 960);
  });
  for (const col of COLS) {
    const hp = pop(t, at('exam', col.head) - 0.1, 0.4);
    around(ctx, col.x, 435, hp, hp, () => {
      card(ctx, col.x - 110, 395, 220, 80, { fill: col.color, edge: C.ink, ew: 4, drop: 0, r: 40 });
      txt(ctx, col.head, col.x, 437, { size: 52, color: C.ink });
    });
    col.items.forEach(([k, name, why, cue], i) => {
      const ti = at('exam', cue);
      const y = 590 + i * 280, ip = pop(t, ti - 0.15, 0.4);
      around(ctx, col.x, y, ip, ip, () => {
        ctx.fillStyle = CONDS[k].color;
        ctx.beginPath(); ctx.arc(col.x - 190, y, 34, 0, TAU); ctx.fill();
        condIcon(ctx, t, k, col.x - 190, y, 26);
        let size = 50;
        while (col.x - 140 + measure(ctx, name, size) > (col.x < 540 ? 510 : 1000)) size -= 2;
        txt(ctx, name, col.x - 140, y + 2, { size, color: C.ink, align: 'left' });
        why.split('\n').forEach((ln, j) => txt(ctx, ln, col.x - 140, y + 68 + j * 48, { size: 36, font: SANS, color: '#7a6a50', align: 'left' }));
      });
    });
  }
}

// ---------- transfer: check a "habitable planet" headline item by item ----------
function exoplanet(ctx, t, x, y, r) {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#c7a9ff'); g.addColorStop(0.7, '#6b4fd1'); g.addColorStop(1, '#2d1f6e');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath(); ctx.ellipse(x + Math.sin(t * 0.5 + i) * r * 0.2, y - r * 0.6 + i * r * 0.4, r * 1.1, r * 0.08, 0.1, 0, TAU); ctx.fill();
  }
  ctx.restore();
  txt(ctx, '?', x, y + 6, { size: r * 1.1, font: NUM, color: 'rgba(255,255,255,0.85)' });
}

function transfer(ctx, t) {
  const t0 = S('transfer'), tCk = at('transfer', '这几条'), tOne = at('transfer', '一项项');
  const hp = pop(t, t0 - 0.1, 0.45);
  around(ctx, 540, 420, hp, hp, () => {
    card(ctx, 110, 300, 860, 240, { fill: C.white, edge: C.ink, ew: 6, drop: 12, r: 30 });
    card(ctx, 140, 325, 150, 54, { fill: C.no, ew: 0, drop: 0, r: 12 });
    txt(ctx, '新闻', 215, 353, { size: 36, color: C.white });
    txt(ctx, '发现宜居行星！', 540, 450, { size: 80, color: C.ink });
  });
  const ep = pop(t, t0 + 0.4, 0.5);
  around(ctx, 280, 930, ep, ep, () => exoplanet(ctx, t, 280, 930, 170));
  const items = [['temp', '温度'], ['air', '大气'], ['water', '液态水']];
  items.forEach(([k, name], i) => {
    const y = 770 + i * 160, ip = pop(t, tCk - 0.2 + i * 0.15, 0.4);
    around(ctx, 740, y, ip, ip, () => {
      card(ctx, 540, y - 60, 400, 120, { fill: 'rgba(10,12,44,0.92)', edge: CONDS[k].color, ew: 5, drop: 0, r: 30 });
      ctx.fillStyle = CONDS[k].color;
      ctx.beginPath(); ctx.arc(600, y, 36, 0, TAU); ctx.fill();
      condIcon(ctx, t, k, 600, y, 28);
      txt(ctx, `${name}？`, 760, y + 2, { size: 54, color: CONDS[k].color });
    });
  });
  // magnifier walks down the list
  const mp = prog(t, tOne - 0.2, tOne + 1.6);
  if (mp > 0) {
    const my = 770 + Math.min(2, Math.floor(mp * 3)) * 160 + Math.sin(t * 8) * 6, mx = 920;
    ctx.save();
    ctx.strokeStyle = C.white; ctx.lineWidth = 14; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(mx + 40, my + 40); ctx.lineTo(mx + 90, my + 90); ctx.stroke();
    ctx.lineWidth = 10; ctx.fillStyle = 'rgba(180,230,255,0.25)';
    ctx.beginPath(); ctx.arc(mx, my, 56, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  stamp(ctx, t, tOne + 0.2, 540, 1300, '逐项核对', { color: C.sky, size: 76, rot: -0.06 });
}

// ---------- finale: Earth's combination punch ----------
function finale(ctx, t) {
  const t0 = S('end'), tPunch = at('end', '组合拳');
  const EX = 540, EY = 820, ER = 180;
  ORDER.forEach((k, i) => {
    const a = t * 1.4 + (i / 5) * TAU, r = 330;
    const x = EX + Math.cos(a) * r, y = EY + Math.sin(a) * r * 0.85;
    const p = pop(t, t0 + i * 0.1, 0.35);
    around(ctx, x, y, p, p, () => {
      ctx.fillStyle = CONDS[k].color;
      ctx.beginPath(); ctx.arc(x, y, 52, 0, TAU); ctx.fill();
      condIcon(ctx, t, k, x, y, 38);
    });
  });
  planet(ctx, t, '地球', EX, EY, ER, { face: true, mood: 'proud', talk: talkLevel(t, ['end']), light: -0.8 });
  // two boxing gloves jab alternately once the punchline lands
  const jab = t > tPunch - 0.2 ? Math.max(0, Math.sin((t - tPunch + 0.2) * 14)) : 0;
  for (const s of [-1, 1]) {
    const on = s < 0 ? jab : Math.max(0, Math.sin((t - tPunch) * 14 + Math.PI));
    const gx = EX + s * (ER + 30 + 40 * on), gy = EY + 60 - 30 * on;
    ctx.fillStyle = C.red; ctx.strokeStyle = C.ink; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.ellipse(gx, gy, 62, 54, s * 0.3, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.ellipse(gx - 18 * s, gy - 18, 20, 12, s * 0.3, 0, TAU); ctx.fill();
  }
  burst(ctx, t, tPunch, EX, EY, { n: 14, r: 420, size: 30 });
  stamp(ctx, t, tPunch, 540, 1290, '条件组合拳！', { color: C.fire, size: 92, rot: -0.07 });
  confetti(ctx, t, tPunch + 0.2);
}

export const scenes = [
  { from: S('e-proud') - 0.2, to: S('exam') - 0.2, draw: combo },
  { from: S('exam') - 0.2, to: S('transfer') - 0.2, draw: exam },
  { from: S('transfer') - 0.2, to: S('end') - 0.2, draw: transfer },
  { from: S('end') - 0.2, to: 1e9, draw: finale },
];

export const events = [
  { t: S('e-proud') - 0.1, type: 'boing' },
  ...ORDER.map((_, i) => ({ t: at('combo', '几个条件') - 0.2 + i * 0.18, type: 'note', n: 72 + [0, 4, 7, 12, 16][i] })),
  { t: at('combo', '几个条件') + 1.0, type: 'sparkle' },
  { t: at('combo', '不等于') - 0.15, type: 'slam', shake: 10 },
  { t: S('exam') - 0.2, type: 'whoosh' },
  ...COLS.flatMap((c) => [at('exam', c.head), ...c.items.map((it) => at('exam', it[3]))]).map((tt) => ({ t: tt - 0.15, type: 'scribble', d: 0.35 })),
  { t: S('transfer') - 0.1, type: 'alarm' },
  { t: at('transfer', '这几条') - 0.2, type: 'pop' },
  { t: at('transfer', '一项项') + 0.2, type: 'stamp', shake: 8 },
  { t: S('end') - 0.1, type: 'boing' },
  { t: at('end', '组合拳'), type: 'slam', shake: 14 },
  { t: at('end', '组合拳') + 0.2, type: 'confetti' },
  { t: E('end') + 0.5, type: 'tada', amp: 0.8 },
];
