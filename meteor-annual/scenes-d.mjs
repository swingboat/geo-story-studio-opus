// Scenes D1–D3: why counts vary, the exam answer, and Earth's victory lap.
import {
  C, S, E, DURATION, at, endAt, prog, ease, lerp, fade, pop, alpha, around, text, header, pill, panel,
  meteor, rand, talk, glow, measure,
} from './lib.mjs';
import { earth, moon, cloud } from './chars.mjs';

// ---------- D1: three reasons the yearly count changes ----------
function miniSky(ctx, t, x, y, w, h, rate, seed, sky) {
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 20); ctx.clip();
  ctx.fillStyle = sky; ctx.fillRect(x, y, w, h);
  const n = Math.round(rate * 8);
  for (let i = 0; i < n; i++) {
    const period = 0.9 + rand(i + seed) * 0.6;
    const p = ((t + rand(i + seed * 3) * period) % period) / period;
    const mx = x + 30 + rand(i + seed * 5) * (w - 60) + p * 70, my = y + 30 + rand(i + seed * 7) * (h * 0.6) + p * 90;
    meteor(ctx, mx, my, 60, Math.atan2(90, 70), Math.sin(p * Math.PI) * 0.9);
  }
  ctx.restore();
}

function card(ctx, t, i, start, title, note, body) {
  const x = 60 + i * 330, y = 600, w = 300, h = 560;
  around(ctx, x + w / 2, y + h / 2, lerp(0.85, 1, pop(t, start)), fade(t, start, 0.25), () => {
    panel(ctx, x, y, w, h, C.gold);
    body(x + 20, y + 20, w - 40, 330);
    text(ctx, title, x + w / 2, y + 420, 40, C.white);
    text(ctx, note, x + w / 2, y + 480, 28, C.dim);
  });
}

function varyScene(ctx, t) {
  header(ctx, t, S('vary'), '09 / 每年一样多吗？', '时节相近，数量不一定', '碎屑疏密 · 月光 · 天气');
  const dense = t >= at('vary', '密');
  card(ctx, t, 0, at('vary', '碎屑'), '碎屑疏密', dense ? '碰上密处：多' : '碰上疏处：少', (x, y, w, h) =>
    miniSky(ctx, t, x, y, w, h, dense ? 1 : 0.3, 3, '#0b1a33'));
  card(ctx, t, 1, at('vary', '月光'), '月光', '天空亮，暗流星看不见', (x, y, w, h) => {
    miniSky(ctx, t, x, y, w, h, 0.35, 5, '#2b4a6e');
    moon(ctx, x + w - 70, y + 70, 38);
  });
  card(ctx, t, 2, at('vary', '天气'), '天气', '云一遮，全挡住', (x, y, w, h) => {
    miniSky(ctx, t, x, y, w, h, 0.7, 9, '#0b1a33');
    ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 20); ctx.clip();
    cloud(ctx, x + 70, y + 120, 1.1); cloud(ctx, x + 200, y + 200, 1.2, '#7d95a8'); cloud(ctx, x + 120, y + 290, 1.3, '#91a8b9');
    ctx.restore();
  });
  alpha(ctx, fade(t, at('vary', '多少')), () => {
    panel(ctx, 160, 1260, 760, 110, C.blue);
    text(ctx, '每年看到的流星数量，不固定', 540, 1315, 38, C.blue);
  });
}

// ---------- D2: exam answer with highlighter ----------
const LINES = [
  { s: at('exam', '地球'), txt: '地球公转周期约为一年；', key: '公转周期约为一年' },
  { s: at('exam', '每年'), txt: '每年相近时间，地球运行到', key: '相近时间' },
  { s: at('exam', '穿过'), txt: '与同一碎屑流交会的位置。', key: '同一碎屑流' },
];
function examScene(ctx, t) {
  header(ctx, t, S('exam'), '10 / 答题模板', '考试这样答', '');
  const x = 110, y = 470, w = 860, h = 760;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 30;
  ctx.fillStyle = '#f6f1e3'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 24); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(70,110,160,0.18)'; ctx.lineWidth = 2;
  for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.moveTo(x + 50, y + 200 + k * 85); ctx.lineTo(x + w - 50, y + 200 + k * 85); ctx.stroke(); }
  text(ctx, '问：英仙座流星雨为什么每年', x + 60, y + 80, 40, '#1d2f45', 'left');
  text(ctx, '8月中旬前后出现？', x + 60, y + 140, 40, '#1d2f45', 'left');
  LINES.forEach((l, i) => {
    const a = fade(t, l.s - 0.1, 0.3), ly = y + 260 + i * 120;
    alpha(ctx, a, () => {
      const pre = l.txt.slice(0, l.txt.indexOf(l.key));
      const kx = x + 60 + measure(ctx, (i ? '' : '答：') + pre, 42), kw = measure(ctx, l.key, 42);
      const sweep = ease(prog(t, l.s + 0.2, l.s + 0.8));
      ctx.fillStyle = 'rgba(255,214,90,0.7)'; ctx.fillRect(kx - 4, ly - 10, (kw + 8) * sweep, 34);
      text(ctx, (i ? '' : '答：') + l.txt, x + 60, ly, 42, '#13263c', 'left');
    });
  });
  const ok = endAt('exam', '碎屑流');
  around(ctx, x + w - 140, y + h - 140, pop(t, ok, 0.4), fade(t, ok, 0.15), () => {
    ctx.save(); ctx.strokeStyle = '#e04848'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x + w - 200, y + h - 150); ctx.lineTo(x + w - 150, y + h - 95); ctx.lineTo(x + w - 60, y + h - 210); ctx.stroke();
    ctx.restore();
  });
}

// ---------- D3: Earth's victory lap ----------
const PARTY = [...Array(40)].map((_, i) => ({ t0: S('outro') + i * 0.1, ang: Math.PI * (0.15 + rand(i + 300) * 0.7), x: rand(i + 310) * 1080 }));
function outroScene(ctx, t) {
  header(ctx, t, S('outro'), '一句话总结', '不是流星守时，是地球准点', '地球公转约一年 → 每年相近时间再遇碎屑流');
  ctx.save(); ctx.beginPath(); ctx.rect(0, 470, 1080, 900); ctx.clip();
  for (const m of PARTY) {
    const p = prog(t, m.t0, m.t0 + 0.9);
    if (p > 0 && p < 1) meteor(ctx, m.x + p * 220, 480 + p * 320, 140, m.ang, Math.sin(p * Math.PI) * 0.7);
  }
  ctx.restore();
  const R = 200, ex = 540, ey = 930 + Math.sin(t * 3) * 8;
  earth(ctx, ex, ey, R, t, { mouth: talk(t, ['outro']), mood: t > at('outro', '是我') ? 'proud' : 'normal' });
  const shades = ease(prog(t, at('outro', '准点'), at('outro', '准点') + 0.35));
  if (shades > 0) {
    const sy = lerp(ey - 380, ey - R * 0.08, shades), sx = ex + R * 0.06;
    ctx.save(); ctx.fillStyle = '#0b0f18'; ctx.strokeStyle = '#0b0f18'; ctx.lineWidth = 8;
    for (const dx of [-0.25, 0.25]) { ctx.beginPath(); ctx.roundRect(sx + R * dx - R * 0.17, sy - R * 0.1, R * 0.34, R * 0.2, R * 0.07); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(sx - R * 0.08, sy - R * 0.04); ctx.lineTo(sx + R * 0.08, sy - R * 0.04); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(sx - R * 0.36, sy - R * 0.06, R * 0.07, R * 0.03);
    ctx.restore();
  }
  const myth = at('outro', '流星守时');
  alpha(ctx, fade(t, myth), () => {
    pill(ctx, '流星守时？', 250, 640, C.dim, 36);
    const k = ease(prog(t, myth + 0.3, myth + 0.6));
    ctx.strokeStyle = '#ff6b6b'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(150, 640); ctx.lineTo(150 + 200 * k, 640); ctx.stroke();
  });
  around(ctx, 700, 1260, pop(t, at('outro', '准点')), fade(t, at('outro', '准点'), 0.2), () =>
    pill(ctx, '地球：年年准点路过', 700, 1260, C.gold, 44));
}

export const scenes = [
  { from: S('vary'), to: S('exam'), draw: varyScene },
  { from: S('exam'), to: S('outro'), draw: examScene },
  { from: S('outro'), to: DURATION, draw: outroScene },
];
export const events = [
  ...['碎屑', '月光', '天气'].map((w, i) => ({ type: 'pop', t: at('vary', w), f: 600 + i * 150 })),
  ...LINES.map((l) => ({ type: 'scribble', t: l.s + 0.2, d: 0.6 })),
  { type: 'ding', t: endAt('exam', '碎屑流'), n: 88, amp: 0.7 },
  { type: 'boing', t: at('outro', '准点') },
  { type: 'confetti', t: at('outro', '路过') },
];
