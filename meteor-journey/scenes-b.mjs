// Scenes 4–6: diving at Earth, myth vs. truth about the glow, and the streak itself (流星).
import { W, H, C, SANS, NUM, S, at, atEnd, prog, lerp, clamp, easeIO, easeIn, easeOut, pop, fadeIn, txt, card, around, arrow, burst, stamp, nameTag, talkLevel, rand } from './lib.mjs';
import { rockGuy, earth, streak, airCap, ground, person } from './bodies.mjs';

// ---------- scene 4: "冲呀!" — diving into the atmosphere at tens of km per second ----------
function dive(ctx, t) {
  const go = prog(t, at('go', '冲呀') - 0.1, at('speed', '一头扎进'));
  const e = easeIn(go);
  // Earth grows as we approach
  const er = lerp(520, 1500, easeIO(go)), ey = lerp(1700, 2700, easeIO(go));
  earth(ctx, t, W / 2, ey, er);
  // atmosphere edge flash when it plunges in
  const hit = at('speed', '一头扎进');
  const fl = prog(t, hit, hit + 0.15) * (1 - prog(t, hit + 0.15, hit + 0.9));
  if (fl > 0) { ctx.fillStyle = `rgba(255,220,160,${0.55 * fl})`; ctx.fillRect(0, 0, W, H); }
  // speed lines streaming past
  const sp = clamp(go * 1.5);
  for (let i = 0; i < 26 && sp > 0; i++) {
    const ph = (t * 2.2 + rand(i)) % 1;
    const x = rand(i + 3) * W, y = (ph * 1.6 - 0.3) * H;
    ctx.strokeStyle = `rgba(200,230,255,${0.35 * sp})`; ctx.lineWidth = 3 + rand(i) * 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 50 * sp, y - 260 * sp); ctx.stroke();
  }
  const x = lerp(330, 600, e), y = lerp(560, 1000, e) + Math.sin(t * 3) * 8 * (1 - go);
  const heat = prog(t, hit - 0.3, hit + 0.3);
  if (heat > 0) streak(ctx, x, y, 0.5, 1, 420 * heat, 120, heat);
  rockGuy(ctx, t, x, y, lerp(130, 110, e), {
    mood: t > at('go', '冲呀') ? 'excited' : 'happy', talk: talkLevel(t, ['go']), look: [0.6, 1], heat: heat * 0.7, rot: -0.2 * e,
  });
  // speedometer
  const gp = pop(t, at('speed', '每秒') - 0.1, 0.45);
  around(ctx, 800, 560, gp, gp, () => {
    card(ctx, 620, 420, 360, 300, { fill: 'rgba(8,10,40,0.85)', edge: C.sky, ew: 5, drop: 0, r: 40 });
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 18; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(800, 600, 110, Math.PI, 0); ctx.stroke();
    const v = easeOut(prog(t, at('speed', '每秒'), at('speed', '公里') + 0.3));
    ctx.strokeStyle = v > 0.8 ? C.hot : C.gold;
    ctx.beginPath(); ctx.arc(800, 600, 110, Math.PI, Math.PI + Math.PI * v * 0.97); ctx.stroke();
    const na = Math.PI + Math.PI * v * 0.97 + Math.sin(t * 40) * 0.03 * v;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(800, 600); ctx.lineTo(800 + Math.cos(na) * 92, 600 + Math.sin(na) * 92); ctx.stroke();
    ctx.restore();
    txt(ctx, '每秒', 800, 545, { size: 36, font: SANS, color: 'rgba(255,255,255,0.8)' });
    txt(ctx, '几十公里', 800, 660, { size: 58, color: C.gold, stroke: C.ink, sw: 8 });
  });
  const lp = pop(t, hit, 0.4);
  around(ctx, W / 2, 1250, lp, lp, () => txt(ctx, '进入大气层！', W / 2, 1250, { size: 88, color: '#fff', stroke: C.hot, sw: 14 }));
}

// ---------- scene 5: not "friction fire" — compressed air gets very hot and glows ----------
const DIR = [-0.45, 1];
const RX = 640, RY = 700;
const STEPS = [
  { word: '压缩', text: '前方空气被猛烈压缩', color: C.sky },
  { word: '极热', text: '空气变得极热', color: C.amber },
  { word: '发出光来', text: '热空气发出光来', color: C.gold },
];

function truth(ctx, t) {
  // atmosphere tint
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(40,80,170,0.25)'); g.addColorStop(1, 'rgba(70,140,230,0.45)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const glow = prog(t, at('truth', '压缩'), at('truth', '发出光来') + 0.2);
  // air molecules rushing at the rock and piling up in front of it
  const L = Math.hypot(...DIR), ux = DIR[0] / L, uy = DIR[1] / L;
  for (let i = 0; i < 60; i++) {
    const ph = (t * 0.9 + rand(i)) % 1;
    const side = (rand(i + 7) - 0.5) * 900;
    let d = lerp(900, -300, ph);
    const near = Math.abs(side) < 260 && d > 0;
    if (near) d = Math.max(d, 170 + Math.abs(side) * 0.35 - glow * 30);
    const px = RX + ux * d - uy * side, py = RY + uy * d + ux * side;
    const hot = near && d < 320 ? glow : 0;
    ctx.fillStyle = hot > 0 ? `rgba(255,${220 - 90 * hot},${200 - 150 * hot},0.95)` : 'rgba(190,225,255,0.65)';
    ctx.beginPath(); ctx.arc(px, py, near && d < 320 ? 9 : 6, 0, Math.PI * 2); ctx.fill();
  }
  streak(ctx, RX, RY, ux, uy, 600 * glow + 150, 150, 0.35 + 0.65 * glow);
  airCap(ctx, t, RX + ux * 20, RY + uy * 20, ux, uy, 120, glow);
  rockGuy(ctx, t, RX, RY, 120, { mood: glow > 0.5 ? 'worried' : 'happy', look: [-0.4, 1], heat: glow * 0.5, rot: Math.sin(t * 20) * 0.02 });
  // myth card: "摩擦着火?" then crossed out
  const mOut = prog(t, at('truth', '压缩') - 0.2, at('truth', '压缩') + 0.2);
  const mp = pop(t, at('myth', '摩擦') - 0.1, 0.45) * (1 - mOut);
  around(ctx, W / 2, 1200, mp, mp, () => {
    card(ctx, 160, 1090, 760, 220, { fill: 'rgba(255,246,224,0.95)', edge: C.ink, ew: 6, drop: 10, r: 40 });
    // a little cartoon flame
    const fx = 300, fy = 1215, f = 1 + Math.sin(t * 18) * 0.06;
    ctx.save(); ctx.translate(fx, fy); ctx.scale(f, 1 / f);
    ctx.fillStyle = C.fire; ctx.beginPath(); ctx.moveTo(0, -80); ctx.bezierCurveTo(60, -20, 50, 50, 0, 50); ctx.bezierCurveTo(-50, 50, -60, -20, 0, -80); ctx.fill();
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(0, -30); ctx.bezierCurveTo(30, 0, 25, 40, 0, 40); ctx.bezierCurveTo(-25, 40, -30, 0, 0, -30); ctx.fill();
    ctx.restore();
    txt(ctx, '摩擦着火？', 600, 1200, { size: 84, color: C.ink });
  });
  stamp(ctx, t, at('truth', '其实'), W / 2, 1200, '误会！', { size: 110, rot: -0.1, until: at('truth', '压缩') - 0.15 });
  // the three-step mechanism
  STEPS.forEach((s, i) => {
    const t0 = at('truth', s.word);
    const p = pop(t, t0 - 0.05, 0.4);
    const y = 1060 + i * 105;
    around(ctx, 120, y, p, p, () => {
      ctx.fillStyle = s.color;
      ctx.beginPath(); ctx.arc(120, y, 40, 0, Math.PI * 2); ctx.fill();
      txt(ctx, String(i + 1), 120, y + 3, { size: 52, font: NUM, color: C.ink });
      txt(ctx, s.text, 190, y, { size: 62, align: 'left', color: '#fff', stroke: C.ink, sw: 10 });
    });
    if (i < 2) arrow(ctx, 120, y + 44, 120, y + 62, { p: fadeIn(t, at('truth', STEPS[i + 1].word) - 0.1, 0.2), color: 'rgba(255,255,255,0.7)', w: 5, head: 16 });
  });
}

// ---------- scene 6: from the ground — that streak of light is the 流星 ----------
function meteorView(ctx, t) {
  ground(ctx, 1240, { color: '#101a35', top: '#35507f', curve: 40 });
  person(ctx, t, 230, 1270, 1.1, { pose: 'point' });
  const p = easeOut(prog(t, S('name2') - 0.4, at('name2', '流星') + 0.2));
  const hx = lerp(980, 700, p), hy = lerp(430, 720, p);
  streak(ctx, hx, hy, -0.95, 1, 520 * p + 60, 46, Math.min(1, p * 3));
  // magnifier showing the tiny rock inside the glow
  const mg = pop(t, at('name2', '不是') - 0.1, 0.45);
  around(ctx, 770, 980, mg, mg, () => {
    ctx.save();
    ctx.strokeStyle = C.white; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(hx + 20, hy + 30); ctx.lineTo(720, 880); ctx.stroke();
    ctx.fillStyle = 'rgba(30,30,70,0.92)';
    ctx.beginPath(); ctx.arc(770, 980, 140, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(770, 980, 140, 0, Math.PI * 2); ctx.clip();
    streak(ctx, 750, 1000, -0.95, 1, 260, 150, 0.9);
    rockGuy(ctx, t, 750, 1000, 46, { mood: 'worried', heat: 0.6, look: [-0.5, 1] });
    ctx.restore();
    txt(ctx, '石头本身', 770, 1170, { size: 46, color: C.sky, stroke: C.ink, sw: 8 });
  });
  nameTag(ctx, t, at('name2', '流星') - 0.05, 380, 540, '流星', '我们看到的“亮光”', { color: C.amber, num: '2' });
  const q = pop(t, at('name2', '现象') - 0.05, 0.4);
  around(ctx, 380, 760, q, q, () => {
    card(ctx, 160, 705, 440, 110, { fill: C.amber, edge: C.ink, ew: 5, drop: 8, r: 55 });
    txt(ctx, '是一种现象', 380, 762, { size: 58, color: C.ink });
  });
  burst(ctx, t, at('name2', '流星'), 380, 540, { r: 300, n: 12 });
}

export const scenesB = [
  { from: S('go') - 0.2, to: S('myth') - 0.3, draw: dive },
  { from: S('myth') - 0.3, to: S('name2') - 0.3, draw: truth },
  { from: S('name2') - 0.3, to: S('hot') - 0.3, draw: meteorView },
];

export const eventsB = [
  { t: at('go', '冲呀') - 0.1, type: 'whoosh', d: 1.4, from: 300, to: 2400, amp: 1.2 },
  { t: at('speed', '每秒'), type: 'pop', f: 900 },
  { t: at('speed', '一头扎进'), type: 'boom', shake: 26 },
  { t: at('myth', '摩擦'), type: 'pop', f: 700 },
  { t: at('truth', '其实'), type: 'stamp', shake: 16 },
  ...STEPS.map((s, i) => ({ t: at('truth', s.word), type: 'note', n: 72 + i * 3 })),
  { t: at('truth', '压缩'), type: 'roar', d: atEnd('truth', '发出光来') - at('truth', '压缩') },
  { t: at('name2', '流星'), type: 'tada', amp: 0.8 },
  { t: at('name2', '不是'), type: 'pop', f: 500 },
];
