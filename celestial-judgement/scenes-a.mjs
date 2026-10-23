// Scenes 1–4: the hook, the certification office opens (and its rule), applicant 1 Moon, applicant 2 Nebula.
import { W, C, SANS, S, at, atEnd, prog, lerp, easeOut, pop, fadeIn, txt, card, around, burst, stamp, nameTag, talkLevel } from './lib.mjs';
import { moon, sun, nebula, glow, rock } from './bodies.mjs';
import { streak, book, ticket } from './props.mjs';

// ---------- scene 1: three suspects + a giant question mark ----------
function hook(ctx, t) {
  const items = [
    { w: '月球', x: 250, y: 700, label: '月球', draw: (x, y) => moon(ctx, t, x, y, 120, { face: false }) },
    { w: '流星', x: 790, y: 640, label: '流星', draw: (x, y) => streak(ctx, x + 70, y + 60, 1, 0.8, 300, 34) },
    { w: '太阳黑子', x: 540, y: 1080, label: '太阳黑子', draw: (x, y) => sun(ctx, t, x, y, 150, { spots: 1, rays: false }) },
  ];
  for (const it of items) {
    const t0 = at('hook', it.w), p = pop(t, t0, 0.5);
    around(ctx, it.x, it.y, p, p, () => {
      it.draw(it.x, it.y + Math.sin(t * 2 + it.x) * 8);
      txt(ctx, it.label, it.x, it.y + (it.w === '太阳黑子' ? 230 : 190), { size: 58, color: C.white, stroke: C.ink, sw: 10 });
    });
  }
  // the spot group we are asking about gets a pulsing ring
  const rp = fadeIn(t, at('hook', '黑子') + 0.2, 0.3);
  if (rp > 0) {
    ctx.save(); ctx.globalAlpha *= rp;
    ctx.strokeStyle = C.white; ctx.lineWidth = 6; ctx.setLineDash([12, 10]);
    ctx.beginPath(); ctx.arc(540 + 0.38 * 150, 1080 + 0.3 * 150, 42 + 6 * Math.sin(t * 8), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  const q = pop(t, at('hook', '天体吗'), 0.55);
  around(ctx, W / 2, 420, q, q, () => {
    txt(ctx, '都能单独叫', W / 2, 380, { size: 66, color: C.white, stroke: C.ink, sw: 12 });
    txt(ctx, '天体吗？', W / 2, 480, { size: 104, color: C.gold, stroke: C.ink, sw: 14 });
  }, Math.sin(t * 3) * 0.03);
}

// ---------- scene 2: 天体认证处 opens; queue of five; the textbook rule ----------
const QUEUE = [
  (ctx, t, x, y) => moon(ctx, t, x, y, 52),
  (ctx, t, x, y) => nebula(ctx, t, x, y, 0.32),
  (ctx, t, x, y) => streak(ctx, x + 40, y + 30, 1, 0.75, 130, 18),
  (ctx, t, x, y) => sun(ctx, t, x, y, 50, { spots: 1, rays: false }),
  (ctx, t, x, y) => { glow(ctx, x, y, 0, 70, 'rgba(76,201,240,0.3)'); drawSatIcon(ctx, x, y); },
];
function drawSatIcon(ctx, x, y) {
  ctx.fillStyle = '#2f5fb3'; ctx.fillRect(x - 70, y - 18, 44, 36); ctx.fillRect(x + 26, y - 18, 44, 36);
  ctx.fillStyle = '#e9c46a'; ctx.beginPath(); ctx.roundRect(x - 24, y - 30, 48, 60, 8); ctx.fill();
}

function office(ctx, t) {
  // neon sign
  const sp = pop(t, at('open', '天体认证处'), 0.5);
  const flick = t < at('open', '天体认证处') + 0.6 ? (Math.sin(t * 60) > 0 ? 1 : 0.55) : 1;
  around(ctx, W / 2, 470, sp, sp * flick, () => {
    card(ctx, 160, 390, 760, 160, { fill: 'rgba(20,10,60,0.92)', edge: C.pink, ew: 8, drop: 0, r: 40 });
    txt(ctx, '天体认证处', W / 2, 474, { size: 104, color: '#ffe3f1', glow: C.pink });
  });
  const tagP = pop(t, at('open', '开张'), 0.4);
  around(ctx, W / 2 + 300, 380, tagP, tagP, () => {
    card(ctx, W / 2 + 210, 352, 180, 58, { fill: C.gold, edge: C.ink, ew: 4, drop: 0, r: 29 });
    txt(ctx, '今日开张', W / 2 + 300, 382, { size: 38, color: C.ink });
  }, 0.12);
  // the queue slides in from the right; it steps aside when the rule book appears
  const q0 = at('open', '五位'), ruleP = easeOut(prog(t, S('rule'), S('rule') + 0.6));
  for (let i = 0; i < 5; i++) {
    const p = easeOut(prog(t, q0 + i * 0.12, q0 + i * 0.12 + 0.5));
    if (p <= 0) continue;
    const x = lerp(W + 200, 150 + i * 195, p), y = lerp(760, 1300, ruleP) + Math.sin(t * 5 + i) * 6 * (1 - ruleP);
    around(ctx, x, y, lerp(1, 0.75, ruleP), 1, () => {
      QUEUE[i](ctx, t, x, y);
      txt(ctx, `${i + 1}`, x, y + 92, { size: 44, font: 'RoundB, YuanB', color: C.gold, stroke: C.ink, sw: 8 });
    });
  }
  // the rule
  const bp = pop(t, at('rule', '规则'), 0.5);
  around(ctx, W / 2, 820, bp, bp, () => book(ctx, W / 2, 820, 1.25, '地理', '必修第一册'));
  const hp = pop(t, at('rule', '天然天体'), 0.45);
  around(ctx, W / 2, 1080, hp, hp, () => {
    card(ctx, 110, 1020, 860, 120, { fill: C.cream, edge: C.ink, ew: 6, r: 30 });
    txt(ctx, '这节课一般讨论：', 330, 1080, { size: 46, color: C.ink });
    txt(ctx, '天然天体', 720, 1078, { size: 64, color: '#d6336c' });
  });
  burst(ctx, t, at('rule', '天然天体'), 720, 1080, { r: 260 });
}

// ---------- scene 3: applicant 1 — the Moon ----------
function moonScene(ctx, t) {
  const t0 = S('moonHi') - 0.3;
  const ent = easeOut(prog(t, t0, t0 + 0.6));
  around(ctx, W / 2, 400, pop(t, t0 + 0.3, 0.45), 1, () => ticket(ctx, W / 2, 400, 1));
  const y = lerp(1500, 830, ent) + Math.sin(t * 2.2) * 10;
  moon(ctx, t, W / 2, y, 230, { talk: talkLevel(t, ['moonHi']), mood: t > at('moonOk', '通过') ? 'proud' : 'happy' });
  nameTag(ctx, t, at('moonHi', '天然卫星'), W / 2, 1200, '天然卫星', '绕着地球转', { color: C.mint, size: 76 });
  stamp(ctx, t, at('moonOk', '通过'), 790, 600, '通过 ✓', { color: C.ok, size: 100, rot: 0.14 });
  burst(ctx, t, at('moonOk', '通过'), 790, 600, { r: 300, n: 14 });
}

// ---------- scene 4: applicant 2 — the Nebula (soft gas & dust, still counts) ----------
function nebulaScene(ctx, t) {
  const t0 = S('nebHi') - 0.3;
  const ent = easeOut(prog(t, t0, t0 + 0.7));
  around(ctx, W / 2, 400, pop(t, t0 + 0.3, 0.45), 1, () => ticket(ctx, W / 2, 400, 2));
  const sq = 1 + 0.04 * Math.sin(t * 3);
  around(ctx, W / 2, 820, ent * sq, ent, () => nebula(ctx, t, W / 2, 820, 1.35, { talk: talkLevel(t, ['nebHi']) }));
  const lab = [['气体', at('nebHi', '气体'), 180, 700], ['尘埃', at('nebHi', '尘埃'), 900, 700]];
  for (const [s, tt, x, y] of lab) {
    const p = pop(t, tt, 0.4);
    around(ctx, x, y, p, p, () => {
      card(ctx, x - 100, y - 44, 200, 88, { fill: 'rgba(8,10,40,0.85)', edge: C.lilac, ew: 5, drop: 0, r: 44 });
      txt(ctx, s, x, y + 2, { size: 52, color: C.lilac });
    });
  }
  // "hard shell?" — a rock ball pops up and gets waved off
  const hp = pop(t, at('nebHi', '硬壳'), 0.4) * (1 - prog(t, atEnd('nebOk', '球') + 0.3, atEnd('nebOk', '球') + 0.6));
  around(ctx, 860, 1130, hp, hp, () => {
    rock(ctx, 860, 1130, 80, t * 0.4);
    txt(ctx, '硬球？', 860, 1250, { size: 46, color: C.white, stroke: C.ink, sw: 8 });
  });
  const np = pop(t, at('nebOk', '不一定'), 0.4);
  around(ctx, 860, 1130, np, np, () => {
    ctx.strokeStyle = C.no; ctx.lineWidth = 14; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(780, 1050); ctx.lineTo(940, 1210); ctx.stroke();
  });
  nameTag(ctx, t, at('nebOk', '天体'), 330, 1160, '不一定是', '坚硬的球', { color: C.pink, size: 58 });
  stamp(ctx, t, at('nebOk', '通过'), W / 2, 560, '通过 ✓', { color: C.ok, size: 100, rot: 0.14 });
  burst(ctx, t, at('nebOk', '通过'), W / 2, 560, { r: 300, n: 14 });
}

export const scenes = [
  { from: 0, to: S('open') - 0.3, draw: hook },
  { from: S('open') - 0.3, to: S('moonHi') - 0.35, draw: office },
  { from: S('moonHi') - 0.35, to: S('nebHi') - 0.35, draw: moonScene },
  { from: S('nebHi') - 0.35, to: S('metHi') - 0.35, draw: nebulaScene },
];

export const events = [
  { t: 0.2, type: 'whoosh', d: 0.8, from: 2600, to: 500 },
  { t: at('hook', '月球'), type: 'pop', f: 600 },
  { t: at('hook', '流星'), type: 'whoosh', d: 0.4 },
  { t: at('hook', '太阳黑子'), type: 'pop', f: 900 },
  { t: at('hook', '天体吗'), type: 'boing' },
  { t: at('open', '天体认证处'), type: 'buzz' },
  { t: at('open', '开张'), type: 'tada', amp: 0.7 },
  ...[0, 1, 2, 3, 4].map((i) => ({ t: at('open', '五位') + i * 0.12, type: 'note', n: 67 + i * 2 })),
  { t: at('rule', '规则'), type: 'whoosh', d: 0.35, from: 900, to: 2400 },
  { t: at('rule', '天然天体'), type: 'sparkle' },
  { t: S('moonHi') - 0.3, type: 'ding', n: 84 },
  { t: at('moonHi', '天然卫星'), type: 'pop', f: 800 },
  { t: at('moonOk', '通过'), type: 'stamp', shake: 16 },
  { t: S('nebHi') - 0.3, type: 'ding', n: 86 },
  { t: at('nebHi', '气体'), type: 'pop', f: 700 },
  { t: at('nebHi', '尘埃'), type: 'pop', f: 900 },
  { t: at('nebHi', '硬壳'), type: 'boing' },
  { t: at('nebOk', '通过'), type: 'stamp', shake: 16 },
];
