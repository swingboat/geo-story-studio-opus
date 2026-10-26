// Scenes A1–A2: the yearly date puzzle, then a dust grain leaving its comet.
import {
  C, S, E, at, endAt, prog, ease, lerp, fade, pop, alpha, around, text, header,
  pill, meteor, panel, arrow, rand, talk, glow,
} from './lib.mjs';
import { earth, grain, nucleus, sun, calendar } from './chars.mjs';

// ---------- A1: night sky, calendar keeps landing on August ----------
const RADIANT = { x: 770, y: 600 };
const PERSEUS = [[742, 540], [770, 600], [800, 585], [830, 640], [720, 660], [705, 720], [850, 700]];
const SHOWER = [...Array(16)].map((_, i) => ({
  t0: 0.25 + i * 0.58 + rand(i + 3) * 0.3,
  ang: Math.PI * (0.45 + rand(i + 50) * 0.65),
  d0: 70 + rand(i + 9) * 90,
}));

function sky(ctx, t) {
  ctx.save(); ctx.strokeStyle = 'rgba(160,200,240,0.28)'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (const [a, b] of [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5], [3, 6]]) {
    ctx.moveTo(...PERSEUS[a]); ctx.lineTo(...PERSEUS[b]);
  }
  ctx.stroke(); ctx.restore();
  for (const [x, y] of PERSEUS) { glow(ctx, x, y, 14, 'rgba(220,235,255,0.8)'); }
  text(ctx, '英仙座', 880, 560, 30, C.dim);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 480, 1080, 960); ctx.clip();
  for (const m of SHOWER) {
    const p = prog(t, m.t0, m.t0 + 0.9);
    if (p <= 0 || p >= 1) continue;
    const d = m.d0 + p * 300;
    meteor(ctx, RADIANT.x + Math.cos(m.ang) * d, RADIANT.y + Math.sin(m.ang) * d, 120 + p * 90, m.ang, Math.sin(p * Math.PI));
  }
  ctx.restore();
}

function mountains(ctx) {
  ctx.save(); ctx.fillStyle = '#081428';
  ctx.beginPath(); ctx.moveTo(0, 1440);
  for (const [x, y] of [[0, 1210], [150, 1120], [300, 1205], [470, 1090], [640, 1190], [860, 1110], [1080, 1220]]) ctx.lineTo(x, y);
  ctx.lineTo(1080, 1440); ctx.closePath(); ctx.fill(); ctx.restore();
}

const YEARS = ['今年', '明年', '后年', '年年'];
function nightHook(ctx, t) {
  header(ctx, t, 0, '01 / 一年一次的约会', '流星雨，也会看日历？', '英仙座流星雨 · 每年8月中旬前后');
  sky(ctx, t);
  mountains(ctx);
  const flips = [at('hook', '年年'), at('hook', '八月中旬'), at('hook', '都')];
  const idx = flips.filter((f) => t >= f + 0.3).length;
  const flipping = flips.find((f) => t >= f && t < f + 0.3);
  const cy = 1150 + Math.sin(t * 2) * 4;
  calendar(ctx, 800, cy, 0.95, '8月', YEARS[idx], flipping ? (t - flipping) / 0.3 : 0);
  const noLook = at('tease', '没');
  alpha(ctx, fade(t, noLook, 0.2), () => {
    ctx.save(); ctx.strokeStyle = '#ff6b6b'; ctx.lineWidth = 14; ctx.lineCap = 'round';
    const k = pop(t, noLook, 0.35) * 70;
    ctx.beginPath(); ctx.moveTo(800 - k, cy - k); ctx.lineTo(800 + k, cy + k);
    ctx.moveTo(800 + k, cy - k); ctx.lineTo(800 - k, cy + k); ctx.stroke(); ctx.restore();
  });
  const proud = t >= at('tease', '地球');
  const bounce = Math.abs(Math.sin(t * 3)) * (proud ? 14 : 4);
  earth(ctx, 300, 1140 - bounce, 165, t, { mouth: talk(t, ['hook']), mood: proud ? 'proud' : 'puzzled' });
  alpha(ctx, fade(t, at('hook', '怎么')) * (1 - fade(t, S('tease'))), () => {
    around(ctx, 420, 920, 0.8 + 0.2 * pop(t, at('hook', '怎么')), 1, () =>
      text(ctx, '？', 420, 920, 130, C.gold, 'center', 'YuanB'), Math.sin(t * 5) * 0.12);
  });
  const sure = at('tease', '准时');
  around(ctx, 330, 860, pop(t, sure), fade(t, sure, 0.2), () => {
    pill(ctx, '准时的是地球！', 330, 860, C.blue, 40);
  });
}

// ---------- A2: comet heats up, ice sublimates, dust comes out ----------
const NUC = { x: 560, y: 960, r: 140 };
const AWAY = { x: 0.79, y: 0.61 };
const SUN = { x: 120, y: 620 };

function puffs(ctx, t, start, n, color, size, speed, spread) {
  const a = fade(t, start, 0.6);
  if (a <= 0) return;
  for (let i = 0; i < n; i++) {
    const u = (rand(i + 7) + (t - start) * speed) % 1;
    const side = (rand(i + 31) - 0.5) * spread * (0.3 + u);
    const d = NUC.r * 0.6 + u * 560;
    const x = NUC.x + AWAY.x * d - AWAY.y * side, y = NUC.y + AWAY.y * d + AWAY.x * side;
    alpha(ctx, a * (1 - u), () => size(ctx, x, y, u, i, color));
  }
}
const gasPuff = (ctx, x, y, u, i, color) => glow(ctx, x, y, 40 + u * 90, color);
const dustDot = (ctx, x, y, u, i, color) => {
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 3 + rand(i) * 4, 0, Math.PI * 2); ctx.fill();
};

function cometScene(ctx, t) {
  const tc = S('comet');
  header(ctx, t, S('hello'), '02 / 流星从哪儿来', t < tc ? '我是彗星“掉的渣”' : '彗星受热，开始“掉渣”', '彗核 = 冰 + 尘埃');
  sun(ctx, SUN.x, SUN.y, 92, t);
  const heat = fade(t, at('comet', '受热'), 0.8);
  alpha(ctx, heat, () => {
    for (let k = 0; k < 3; k++) {
      const u = (t * 0.7 + k / 3) % 1;
      ctx.strokeStyle = `rgba(255,200,120,${0.5 * (1 - u)})`; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(SUN.x, SUN.y, 120 + u * 260, -0.05, 0.75); ctx.stroke();
    }
  });
  const gasT = at('comet', '冰'), dustT = at('comet', '尘埃');
  puffs(ctx, t, gasT, 30, 'rgba(140,220,250,0.22)', gasPuff, 0.32, 260);
  puffs(ctx, t, dustT, 60, C.gold, dustDot, 0.22, 300);
  nucleus(ctx, NUC.x, NUC.y, NUC.r, t, heat);
  text(ctx, '彗核', NUC.x - 40, NUC.y + NUC.r + 40, 32, C.dim);
  alpha(ctx, fade(t, at('comet', '升华')), () => pill(ctx, '冰 → 气体（升华）', 300, 1270, C.blue, 34));
  alpha(ctx, fade(t, dustT), () => pill(ctx, '尘埃颗粒被带出', 780, 1380, C.gold, 34));

  // the grain hops out at "嗨", then rides the outflow away once dust is released
  const hop = pop(t, S('hello'), 0.6);
  const leave = ease(prog(t, dustT, E('comet') + 0.3));
  const gx = lerp(lerp(NUC.x + 60, 820, hop), 990, leave);
  const gy = lerp(lerp(NUC.y - 90, 700, hop), 1260, leave) - Math.abs(Math.sin(t * 4)) * 10 * (1 - leave);
  const gr = lerp(56, 30, leave);
  if (t < E('comet') + 0.3) grain(ctx, gx, gy, gr, t, { mouth: talk(t, ['hello']), wave: t < E('hello') ? 1 : 0, rot: leave * 3 });
  alpha(ctx, fade(t, at('hello', '我')) * (1 - fade(t, S('comet'))), () => {
    pill(ctx, '小尘埃', 820, 595, C.gold, 32);
  });
}

export const scenes = [
  { from: 0, to: S('hello'), draw: nightHook },
  { from: S('hello'), to: S('stream'), draw: cometScene },
];
export const events = [
  ...SHOWER.filter((m) => m.t0 < S('hello')).filter((_, i) => i % 3 === 0).map((m) => ({ type: 'whoosh', t: m.t0, amp: 0.2, d: 0.6 })),
  ...[at('hook', '年年'), at('hook', '八月中旬'), at('hook', '都')].map((t) => ({ type: 'tick', t, n: 84 })),
  { type: 'buzz', t: at('tease', '没') },
  { type: 'ding', t: at('tease', '准时'), amp: 0.6 },
  { type: 'boing', t: S('hello') },
  { type: 'whoosh', t: at('comet', '冰'), amp: 0.3, d: 0.8, from: 300, to: 1400 },
  { type: 'sparkle', t: at('comet', '尘埃'), amp: 0.4 },
];
