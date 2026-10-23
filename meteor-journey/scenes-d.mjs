// Scenes 9–11: don't hunt meteorites after a meteor shower, the three-name recap, and the museum quiz.
import { W, H, C, SANS, S, at, prog, lerp, easeOut, pop, fadeIn, txt, card, around, burst, stamp, confetti, rand } from './lib.mjs';
import { rockGuy, streak, ground, person } from './bodies.mjs';

// ---------- scene 9: meteor shower — comet crumbs are too fragile to reach the ground ----------
const GY = 1240;
const RAD = [900, 330]; // radiant the shower seems to come from

function comet(ctx, t, x, y, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const g = ctx.createLinearGradient(x, y, x + 420, y - 260);
  g.addColorStop(0, 'rgba(180,230,255,0.85)'); g.addColorStop(1, 'rgba(180,230,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x, y - 40); ctx.lineTo(x + 440, y - 300); ctx.lineTo(x + 470, y - 200); ctx.lineTo(x, y + 40); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 26; i++) {
    const d = ((t * 0.15 + rand(i)) % 1) * 520;
    ctx.fillStyle = `rgba(230,220,200,${0.8 - d / 700})`;
    ctx.beginPath(); ctx.arc(x - d * 0.75, y + d * 0.35 + (rand(i + 3) - 0.5) * 50, 2 + rand(i + 1) * 4, 0, Math.PI * 2); ctx.fill();
  }
  const hg = ctx.createRadialGradient(x, y, 0, x, y, 70);
  hg.addColorStop(0, '#ffffff'); hg.addColorStop(0.4, 'rgba(170,230,255,0.9)'); hg.addColorStop(1, 'rgba(120,200,255,0)');
  ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, y, 70, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function shower(ctx, t) {
  ground(ctx, GY, { color: '#121b38', top: '#34507f', curve: 36 });
  // many short-lived streaks radiating from one point, all fading out high above the ground
  for (let i = 0; i < 40; i++) {
    const t0 = S('tip') - 0.3 + i * 0.19 + rand(i) * 0.3, life = 0.7;
    const p = prog(t, t0, t0 + life);
    if (p <= 0 || p >= 1) continue;
    const ang = 1.95 + (rand(i + 9) - 0.5) * 1.1;
    const d0 = 120 + rand(i + 4) * 160, d1 = d0 + 260 + rand(i + 2) * 260;
    const d = lerp(d0, d1, p);
    streak(ctx, RAD[0] + Math.cos(ang) * d, RAD[1] + Math.sin(ang) * d, Math.cos(ang), Math.sin(ang), 180 * Math.min(1, p * 4), 12, 1 - prog(p, 0.6, 1));
  }
  comet(ctx, t, 820, 560, fadeIn(t, at('comet', '彗星') - 0.1, 0.4));
  const cp = pop(t, at('comet', '碎屑') - 0.05, 0.4);
  around(ctx, 560, 720, cp, cp, () => txt(ctx, '彗星碎屑', 560, 720, { size: 66, color: C.sky, stroke: C.ink, sw: 10 }));
  const fp = pop(t, at('comet', '太脆') - 0.05, 0.4);
  around(ctx, 560, 840, fp, fp, () => txt(ctx, '又小又脆', 560, 840, { size: 66, color: C.amber, stroke: C.ink, sw: 10 }));
  // an eager meteorite hunter with a basket
  const run = Math.min(1, Math.max(0, (t - S('tip')) / 2.4));
  const px = lerp(-80, 420, easeOut(run)) - lerp(0, 120, prog(t, at('tip', '别急着'), at('tip', '别急着') + 0.4));
  person(ctx, t, px, GY + 30, 1.0, { pose: run < 1 ? 'run' : 'point' });
  ctx.fillStyle = '#c98a3c';
  ctx.beginPath(); ctx.roundRect(px + 30, GY - 70, 70, 50, 10); ctx.fill();
  ctx.strokeStyle = '#c98a3c'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(px + 65, GY - 70, 30, Math.PI, 0); ctx.stroke();
  stamp(ctx, t, at('tip', '别急着'), W / 2, 1020, '别急着捡！', { size: 100, rot: -0.08, until: at('comet', '彗星') - 0.2 });
  const zp = pop(t, at('comet', '撑不到'), 0.4);
  around(ctx, 760, GY - 60, zp, zp, () => {
    card(ctx, 560, GY - 125, 400, 120, { fill: 'rgba(8,10,40,0.88)', edge: C.no, ew: 5, drop: 0, r: 60 });
    txt(ctx, '地面：几乎 0', 760, GY - 64, { size: 56, color: C.no });
  });
}

// ---------- scene 10: recap — three names, three keywords ----------
const ROWS = [
  { id: 'recap', w: '流星体', name: '流星体', key: '太空里的物体', color: C.sky },
  { id: 'recap2', w: '流星', name: '流星', key: '发光现象', color: C.amber },
  { id: 'recap3', w: '陨石', name: '陨石', key: '幸存的残余物', color: C.mint },
];

function recap(ctx, t) {
  const tp = pop(t, at('recap', '记住'), 0.4);
  around(ctx, W / 2, 300, tp, tp, () => txt(ctx, '记住这 3 个名字', W / 2, 300, { size: 92, color: C.gold, stroke: C.ink, sw: 14 }));
  ROWS.forEach((r, i) => {
    const y = 540 + i * 270, t0 = at(r.id, r.w) - 0.1;
    const p = pop(t, t0, 0.45);
    around(ctx, W / 2, y, p, p, () => {
      card(ctx, 70, y - 110, 940, 220, { fill: 'rgba(8,10,40,0.88)', edge: r.color, ew: 6, drop: 10, r: 44 });
      ctx.save();
      ctx.beginPath(); ctx.roundRect(100, y - 85, 220, 170, 30); ctx.clip();
      ctx.fillStyle = i === 1 ? '#18244f' : i === 2 ? '#22351f' : '#0b0f2e'; ctx.fillRect(100, y - 85, 220, 170);
      if (i === 0) rockGuy(ctx, t, 210, y, 58, { mood: 'happy' });
      if (i === 1) streak(ctx, 250, y - 20, -1, 1.1, 200, 34, 1);
      if (i === 2) { ctx.fillStyle = '#4f7a5c'; ctx.fillRect(100, y + 40, 220, 50); rockGuy(ctx, t, 210, y + 10, 40, { mood: 'proud', crust: 1 }); }
      ctx.restore();
      txt(ctx, r.name, 370, y - 30, { size: 92, align: 'left', color: r.color, stroke: C.ink, sw: 8 });
      txt(ctx, `= ${r.key}`, 370, y + 58, { size: 54, align: 'left', font: SANS, color: '#fff' });
    });
    burst(ctx, t, t0 + 0.1, 880, y - 60, { n: 8, r: 120, size: 16 });
  });
}

// ---------- scene 11: museum quiz — what is this rock called? ----------
const OPTS = [['A', '流星体', C.sky], ['B', '流星', C.amber], ['C', '陨石', C.mint]];

function quiz(ctx, t) {
  // spotlight on a pedestal
  const sp = ctx.createRadialGradient(W / 2, 760, 20, W / 2, 760, 520);
  sp.addColorStop(0, 'rgba(255,240,200,0.35)'); sp.addColorStop(1, 'rgba(255,240,200,0)');
  ctx.fillStyle = sp; ctx.fillRect(0, 200, W, 1100);
  const qp = pop(t, at('quiz', '考考你'), 0.4);
  around(ctx, W / 2, 300, qp, qp, () => txt(ctx, '考考你！', W / 2, 300, { size: 120, color: C.gold, stroke: C.ink, sw: 16 }));
  card(ctx, 330, 880, 420, 70, { fill: '#d9cbb0', edge: C.ink, ew: 5, drop: 0, r: 12 });
  card(ctx, 380, 950, 320, 220, { fill: '#efe3c8', edge: C.ink, ew: 5, drop: 0, r: 8 });
  // the hero, now a museum piece — with a wink
  const wink = Math.sin(prog(t, at('quiz', '叫什么') + 0.2, at('quiz', '叫什么') + 0.6) * Math.PI) > 0.5;
  rockGuy(ctx, t, W / 2, 800, 95, { mood: wink ? 'proud' : 'happy', crust: 1 });
  ctx.save();
  ctx.strokeStyle = 'rgba(200,235,255,0.55)'; ctx.lineWidth = 5; ctx.fillStyle = 'rgba(200,235,255,0.08)';
  ctx.beginPath(); ctx.roundRect(370, 620, 340, 260, 10); ctx.fill(); ctx.stroke();
  ctx.restore();
  card(ctx, 420, 1040, 240, 70, { fill: C.ink, edge: C.gold, ew: 3, drop: 0, r: 8 });
  txt(ctx, '名称：？？？', W / 2, 1076, { size: 38, font: SANS, color: C.gold });
  OPTS.forEach(([k, name, col], i) => {
    const x = 210 + i * 330, y = 1290;
    const p = pop(t, at('quiz', '叫什么') + i * 0.15, 0.4);
    around(ctx, x, y, p, p, () => {
      card(ctx, x - 145, y - 55, 290, 110, { fill: 'rgba(8,10,40,0.9)', edge: col, ew: 5, drop: 8, r: 55 });
      txt(ctx, `${k}  ${name}`, x, y + 3, { size: 52, color: '#fff' });
    });
  });
  const cp = pop(t, at('quiz', '评论区'), 0.45);
  around(ctx, W / 2, 470, cp, cp, () => {
    card(ctx, W / 2 - 330, 410, 660, 120, { fill: C.pink, edge: C.ink, ew: 6, drop: 10, r: 60 });
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.roundRect(W / 2 - 290, 440, 70, 50, 14); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W / 2 - 270, 488); ctx.lineTo(W / 2 - 280, 506); ctx.lineTo(W / 2 - 252, 488); ctx.fill();
    txt(ctx, '评论区告诉我！', W / 2 + 40, 470, { size: 70, color: C.ink });
  }, Math.sin(t * 6) * 0.03 * cp);
  confetti(ctx, t, at('quiz', '评论区') + 0.1, 100);
}

export const scenesD = [
  { from: S('tip') - 0.3, to: S('recap') - 0.3, draw: shower },
  { from: S('recap') - 0.3, to: S('quiz') - 0.3, draw: recap },
  { from: S('quiz') - 0.3, to: H, draw: quiz },
];

export const eventsD = [
  { t: at('tip', '别急着'), type: 'stamp', shake: 14 },
  { t: at('comet', '彗星'), type: 'sparkle' },
  { t: at('comet', '撑不到'), type: 'buzz' },
  ...ROWS.map((r, i) => ({ t: at(r.id, r.w), type: 'note', n: 72 + i * 4 })),
  { t: at('recap3', '陨石') + 0.3, type: 'ding', n: 91 },
  { t: at('quiz', '考考你'), type: 'boing' },
  ...OPTS.map((_, i) => ({ t: at('quiz', '叫什么') + i * 0.15, type: 'pop', f: 600 + i * 200 })),
  { t: at('quiz', '评论区'), type: 'tada' },
];
