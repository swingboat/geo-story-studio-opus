// Scenes 7–8: shrinking in the air (most never land, ~44 t/day) and the survivor on the ground (陨石).
import { W, H, C, SANS, NUM, S, E, at, atEnd, prog, lerp, easeIO, easeIn, easeOut, pop, fadeIn, txt, card, around, arrow, burst, nameTag, talkLevel, confetti, rand } from './lib.mjs';
import { rock, rockGuy, streak, ground, ablate } from './bodies.mjs';

// ---------- scene 7: "好烫!" — losing material; most meteoroids never make it down ----------
function shrink(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(40,80,170,0.2)'); g.addColorStop(1, 'rgba(70,140,230,0.4)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const side = easeIO(prog(t, S('most') - 0.3, S('most') + 0.3));
  const r = lerp(lerp(160, 105, prog(t, S('hot'), E('hot'))), 72, side);
  const x = lerp(W / 2, 190, side) + Math.sin(t * 40) * 4, y = lerp(800, 560, side);
  streak(ctx, x, y, -0.3, 1, lerp(520, 300, side), r * 1.4, 0.9);
  ablate(ctx, t, S('hot') - 0.3, S('land'), x, y, -0.3, 1, 22);
  rockGuy(ctx, t, x, y, r, { mood: t < S('most') ? 'hot' : 'worried', talk: talkLevel(t, ['hot']), heat: 0.85, look: [0.6, 0.2] });
  const hp = pop(t, at('hot', '好烫'), 0.35) * (1 - side);
  around(ctx, x + 250, y - 200, hp, hp, () => txt(ctx, '好烫！', x + 250, y - 200, { size: 96, color: C.hot, stroke: '#fff', sw: 12 }), 0.15);
  // "我在变小": dashed outline of its starting size
  const vp = fadeIn(t, at('hot', '变小'), 0.3) * (1 - side);
  ctx.save(); ctx.globalAlpha *= vp;
  ctx.setLineDash([14, 12]); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(W / 2, 800, 175, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  // a swarm of meteors that all fizzle out at different heights
  for (let i = 0; i < 9; i++) {
    const t0 = S('most') + i * 0.28, life = 0.9 + rand(i) * 0.6;
    const p = prog(t, t0, t0 + life);
    const sx = 380 + rand(i + 2) * 640, sy = 380 + rand(i + 5) * 120;
    const ex = sx - 160, ey = sy + 280 + rand(i + 8) * 340;
    if (p > 0 && p < 1) streak(ctx, lerp(sx, ex, p), lerp(sy, ey, p), -160, ey - sy, 200 * Math.min(1, p * 3), 16, 1 - prog(p, 0.7, 1));
    burst(ctx, t, t0 + life * 0.85, ex, ey, { n: 8, r: 60, size: 10, colors: [C.amber, '#fff', C.gold], dur: 0.5 });
  }
  const mp = pop(t, at('most', '耗尽') - 0.05, 0.4) * (1 - prog(t, S('tons') - 0.2, S('tons')));
  around(ctx, 640, 1180, mp, mp, () => txt(ctx, '半路就耗尽！', 640, 1180, { size: 92, color: C.gold, stroke: C.ink, sw: 14 }));
  // daily tonnage card
  const cp = pop(t, S('tons') - 0.1, 0.45);
  around(ctx, W / 2, 1130, cp, cp, () => {
    card(ctx, 110, 980, 860, 320, { fill: 'rgba(8,10,40,0.9)', edge: C.gold, ew: 6, drop: 0, r: 44 });
    txt(ctx, '每天落向地球', 330, 1050, { size: 48, font: SANS, color: 'rgba(255,255,255,0.85)' });
    const n = Math.round(44 * easeOut(prog(t, S('tons') + 0.2, atEnd('tons', '吨'))));
    txt(ctx, `约 ${n}`, 680, 1050, { size: 96, font: NUM, color: C.gold, stroke: C.ink, sw: 8 });
    txt(ctx, '吨', 840, 1060, { size: 60, color: C.gold });
    const bp = easeOut(prog(t, at('tons', '几乎'), at('tons', '汽化') + 0.3));
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.roundRect(160, 1150, 760, 50, 25); ctx.fill();
    ctx.fillStyle = C.amber;
    ctx.beginPath(); ctx.roundRect(160, 1150, Math.max(50, 745 * bp), 50, 25); ctx.fill();
    if (bp > 0) txt(ctx, '几乎全部在空中汽化', 540, 1250, { size: 50, color: '#fff' });
  });
}

// ---------- scene 8: the survivor lands — now it is a 陨石 ----------
const GY = 1180;
function landed(ctx, t) {
  ground(ctx, GY, { color: '#2a3a2f', top: '#5f8f62', curve: 30 });
  const hit = at('land', '地面');
  const fall = prog(t, S('land') - 0.2, hit);
  const zoom = easeIO(prog(t, S('crust') - 0.3, S('crust') + 0.4));
  const hop = Math.max(0, Math.sin(prog(t, at('alive', '活下来'), E('alive') + 0.3) * Math.PI)) * 120;
  const bx = lerp(lerp(860, 540, fall), 540, zoom), by = lerp(lerp(380, GY - 10, easeIn(fall)), 820, zoom) - hop;
  const r = lerp(46, 160, zoom);
  // the glow goes out on the way down, before landing
  const glow = 1 - prog(fall, 0.2, 0.75);
  if (fall > 0 && fall < 1) streak(ctx, bx, by, -320, GY - 390, 260, 60, glow);
  if (t >= hit && zoom < 1) {
    ctx.fillStyle = `rgba(0,0,0,${0.35 * (1 - zoom)})`;
    ctx.beginPath(); ctx.ellipse(540, GY + 8, 70, 14, 0, 0, Math.PI * 2); ctx.fill();
  }
  burst(ctx, t, hit, 540, GY - 10, { n: 10, r: 150, colors: ['#c9a27a', '#8d7f73', C.gold] });
  const crust = prog(t, hit - 0.2, hit + 0.4) * lerp(0.6, 1, zoom);
  const shine = prog(t, at('crust', '熔壳'), at('crust', '熔壳') + 0.8);
  rockGuy(ctx, t, bx, by, r, {
    mood: t >= at('alive', '活下来') - 0.1 ? 'proud' : t >= hit ? 'happy' : 'worried',
    talk: talkLevel(t, ['alive']), crust: Math.min(1, crust + 0.6 * shine), heat: glow * 0.5 * (1 - prog(t, hit, hit + 0.5)),
  });
  // shine sweep across the fusion crust
  if (shine > 0 && shine < 1) {
    ctx.save(); ctx.globalAlpha *= Math.sin(shine * Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 26;
    const sx = lerp(bx - r, bx + r, shine);
    ctx.beginPath(); ctx.moveTo(sx - 40, by - r); ctx.lineTo(sx + 40, by + r); ctx.stroke(); ctx.restore();
  }
  nameTag(ctx, t, at('name3', '陨石') - 0.05, W / 2, 525, '陨石', '幸存到地面的残余物', { color: C.mint, num: '3' });
  burst(ctx, t, at('name3', '陨石'), W / 2, 525, { r: 320, n: 14 });
  // < 5 % comparison panel
  const fp = pop(t, S('five') - 0.1, 0.45) * (1 - prog(t, S('crust') - 0.3, S('crust')));
  around(ctx, W / 2, 800, fp, fp, () => {
    card(ctx, 70, 640, 940, 360, { fill: 'rgba(8,10,40,0.88)', edge: 'rgba(255,255,255,0.4)', ew: 4, drop: 0, r: 40 });
    ctx.save(); ctx.setLineDash([14, 10]); ctx.strokeStyle = 'rgba(255,255,255,0.65)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(250, 790, 115, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    rock(ctx, 250, 790, 22, { seed: 5, crust: 1 });
    txt(ctx, '原来的流星体', 250, 945, { size: 40, font: SANS, color: 'rgba(255,255,255,0.8)' });
    const pc = pop(t, at('five', '百分之五') - 0.05, 0.4);
    around(ctx, 690, 760, pc, pc, () => {
      txt(ctx, '不到', 560, 770, { size: 54, color: '#fff' });
      txt(ctx, '5%', 760, 760, { size: 150, font: NUM, color: C.mint, stroke: C.ink, sw: 10 });
    });
    const sp = fadeIn(t, at('five', '石子'), 0.3);
    ctx.save(); ctx.globalAlpha *= sp;
    txt(ctx, '常见：石子～拳头大小', 680, 920, { size: 48, color: C.gold });
    ctx.restore();
  });
  // fusion crust = "clearance certificate"
  const cp = pop(t, at('crust', '通关证明') - 0.1, 0.45);
  around(ctx, W / 2, 1090, cp, cp, () => {
    ctx.fillStyle = C.red;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(W / 2 + s * 40, 1110); ctx.lineTo(W / 2 + s * 90, 1250); ctx.lineTo(W / 2 + s * 30, 1220); ctx.closePath(); ctx.fill(); }
    card(ctx, W / 2 - 260, 1040, 520, 110, { fill: C.gold, edge: C.ink, ew: 6, drop: 8, r: 55 });
    txt(ctx, '大气层 · 通关证明', W / 2, 1097, { size: 56, color: C.ink });
  });
  if (zoom > 0.5) {
    ctx.save(); ctx.globalAlpha *= fadeIn(t, at('crust', '熔壳'), 0.3);
    arrow(ctx, 860, 640, bx + r * 0.75, by - r * 0.55, { color: '#fff', w: 7, head: 26 });
    txt(ctx, '熔壳', 900, 600, { size: 64, color: '#fff', stroke: C.ink, sw: 10 });
    ctx.restore();
  }
  confetti(ctx, t, at('alive', '活下来'), 120);
}

export const scenesC = [
  { from: S('hot') - 0.3, to: S('land') - 0.3, draw: shrink },
  { from: S('land') - 0.3, to: S('tip') - 0.3, draw: landed },
];

export const eventsC = [
  { t: at('hot', '好烫'), type: 'sizzle', d: E('hot') - at('hot', '好烫') + 0.4, shake: 8 },
  ...[...Array(9)].map((_, i) => ({ t: S('most') + i * 0.28 + (0.9 + rand(i) * 0.6) * 0.85, type: 'fizz', amp: 0.5 })),
  { t: at('most', '耗尽'), type: 'pop', f: 500 },
  { t: S('tons') - 0.1, type: 'pop', f: 800 },
  { t: at('tons', '四十四'), type: 'ding', n: 81 },
  { t: at('land', '幸存者') - 0.2, type: 'whoosh', d: 0.9, from: 2400, to: 400 },
  { t: at('land', '地面'), type: 'thud', shake: 18 },
  { t: at('name3', '陨石'), type: 'tada' },
  { t: at('five', '百分之五'), type: 'stamp', shake: 6 },
  { t: at('crust', '熔壳'), type: 'sparkle' },
  { t: at('crust', '通关证明'), type: 'ding', n: 88 },
  { t: at('alive', '活下来'), type: 'confetti' },
];
