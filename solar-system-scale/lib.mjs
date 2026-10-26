// Shared helpers for the vertical (1080x1920) solar-system-scale explainer: fonts, timeline, easing, logo, text and UI bits.
import { GlobalFonts, loadImage } from '@napi-rs/canvas';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const W = 1080, H = 1920, FPS = 30;
const here = (p) => fileURLToPath(new URL(p, import.meta.url));

// ---------- fonts ----------
if (!existsSync(here('./build/fonts/YuantiSC-Bold.ttf'))) {
  spawnSync(here('./.venv/bin/python'), [here('./fonts.py')], { stdio: 'inherit' });
}
const reg = (p, name) => existsSync(p) && GlobalFonts.registerFromPath(p, name);
reg(here('./build/fonts/YuantiSC-Bold.ttf'), 'YuanB');
reg(here('./build/fonts/PingFangSC-Semibold.ttf'), 'PingB');
reg('/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf', 'RoundB');
reg('/System/Library/Fonts/Supplemental/Arial Unicode.ttf', 'UniB');
reg('/System/Library/Fonts/Hiragino Sans GB.ttc', 'HiraGB');
export const ZH = 'YuanB, RoundB, UniB, HiraGB';
export const SANS = 'PingB, UniB, HiraGB';
export const NUM = 'RoundB, YuanB, UniB';

// ---------- brand logo (copied from ../brand; draw only the opaque box of the transparent PNG) ----------
export const LOGO = await loadImage(here('./assets/logo-transparent.png'));
export const LOGO_BOX = { sx: 150, sy: 96, sw: 1998, sh: 528 };

// ---------- timeline ----------
export const TL = JSON.parse(readFileSync(here('./build/timeline.json')));
export const SEG = Object.fromEntries(TL.segments.map((s) => [s.id, s]));
export const DURATION = TL.duration;
export const S = (id) => SEG[id].start;
export const E = (id) => SEG[id].end;

// Word boundary for `w` inside segment `id` (from the TTS timestamps, never estimated).
export function word(id, w, nth = 0) {
  const s = SEG[id];
  let i = -1;
  for (let k = 0; k <= nth; k++) i = s.text.indexOf(w, i + 1);
  if (i < 0) throw new Error(`"${w}" not in ${id}`);
  const hit = s.words.find((x) => x.idx <= i && i < x.idx + x.text.length) ?? s.words.find((x) => x.idx >= i);
  const last = [...s.words].reverse().find((x) => x.idx < i + w.length) ?? hit;
  return { start: hit.start, end: last.end };
}
export const at = (id, w, nth) => word(id, w, nth).start;
export const atEnd = (id, w, nth) => word(id, w, nth).end;

// ---------- math ----------
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const easeIn = (t) => t * t * t;
export const easeBack = (t) => {
  const c1 = 2.2, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export const pop = (t, t0, d = 0.4) => easeBack(prog(t, t0, t0 + d));
export const fadeIn = (t, t0, d = 0.3) => easeOut(prog(t, t0, t0 + d));
export function rand(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export const C = {
  bg0: '#040820', bg1: '#0f1a4a', ink: '#14103a', white: '#ffffff', cream: '#fff6e0',
  gold: '#ffc93c', amber: '#ffb347', hot: '#ff7a1a', fire: '#ff4d2e', red: '#ff4d5e', no: '#ff4d6d', ok: '#3ddc97',
  sky: '#4cc9f0', blue: '#3a8dde', pink: '#ff8fab', lilac: '#c9b6ff', mint: '#3ddc97',
  // planets, schoolyard map and town
  mercury: '#b3aca3', venus: '#ecc98a', earth: '#2f7fe0', land: '#4cc35a', mars: '#d9653b', jupiter: '#d9a774', jupBand: '#a8683f',
  saturn: '#ecd29a', satBand: '#c9a464', uranus: '#9fe6ea', neptune: '#3f6fe8', moon: '#d9dbe6', moonDark: '#aeb2c4',
  grass: '#2f8f4e', grassLite: '#3aa45c', track: '#c0583f', road: '#3b4259', block: '#28304a', roof: '#3c4a72', river: '#2a5fa8',
  terr: '#3ddc97', giant: '#ffb347', far: '#5fd0ff',
  sun: '#ffd23f', sunHot: '#ff9a1f',
};

// ---------- text & shapes ----------
export function txt(ctx, s, x, y, o = {}) {
  const { size = 80, font = ZH, color = C.white, align = 'center', base = 'middle', stroke, sw = 12, shadow, glow } = o;
  ctx.save();
  ctx.font = `${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  ctx.lineJoin = 'round';
  if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = size * 0.5; }
  if (shadow) { ctx.shadowColor = shadow; ctx.shadowOffsetY = size * 0.08; ctx.shadowBlur = 0; }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = sw;
    ctx.strokeText(s, x, y);
    if (!glow) ctx.shadowColor = 'transparent';
  }
  ctx.fillStyle = color;
  ctx.fillText(s, x, y);
  ctx.restore();
}

export function measure(ctx, s, size, font = ZH) {
  ctx.save();
  ctx.font = `${size}px ${font}`;
  const w = ctx.measureText(s).width;
  ctx.restore();
  return w;
}

export function card(ctx, x, y, w, h, o = {}) {
  const { r = 32, fill = C.cream, edge = C.ink, ew = 6, drop = 12 } = o;
  ctx.save();
  if (drop) {
    ctx.fillStyle = 'rgba(5,3,30,0.45)';
    ctx.beginPath(); ctx.roundRect(x, y + drop, w, h, r); ctx.fill();
  }
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
  if (ew) { ctx.strokeStyle = edge; ctx.lineWidth = ew; ctx.stroke(); }
  ctx.restore();
}

// Scale/alpha/rotate around (x,y) while fn draws.
export function around(ctx, x, y, sc, alpha, fn, rot = 0) {
  if (alpha <= 0.001 || sc <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(sc, sc);
  ctx.translate(-x, -y);
  fn();
  ctx.restore();
}

export function arrow(ctx, x1, y1, x2, y2, o = {}) {
  const { color = C.gold, w = 10, head = 30, p = 1, dash } = o;
  if (p <= 0) return;
  const x = lerp(x1, x2, p), y = lerp(y1, y2, p);
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x - Math.cos(a) * head * 0.6, y - Math.sin(a) * head * 0.6); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - Math.cos(a - 0.45) * head, y - Math.sin(a - 0.45) * head);
  ctx.lineTo(x - Math.cos(a + 0.45) * head, y - Math.sin(a + 0.45) * head);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

export function star(ctx, x, y, r, color = C.gold, rot = 0) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r, a = (i * Math.PI) / 5 - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

// Radiating sparkles from (x,y) starting at t0.
export function burst(ctx, t, t0, x, y, o = {}) {
  const { n = 10, r = 220, size = 22, colors = [C.gold, C.pink, C.sky, C.mint], dur = 0.7 } = o;
  const p = prog(t, t0, t0 + dur);
  if (p <= 0 || p >= 1) return;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.3;
    const d = r * easeOut(p);
    star(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, size * (1 - p), colors[i % colors.length], p * 3);
  }
}

// Big rubber stamp that slams in at t0 (scale from 2.4 -> 1) — the Douyin "盖章" beat.
export function stamp(ctx, t, t0, x, y, label, o = {}) {
  const { color = C.no, size = 120, rot = -0.12, pad = 40, until } = o;
  const p = prog(t, t0, t0 + 0.22);
  const out = until === undefined ? 0 : prog(t, until, until + 0.25);
  if (p <= 0 || out >= 1) return;
  const sc = lerp(2.4, 1, easeIn(p)) * (1 + 0.06 * Math.sin(prog(t, t0 + 0.22, t0 + 0.5) * Math.PI));
  around(ctx, x, y, sc * (1 - 0.3 * out), Math.min(1, p * 2) * (1 - out), () => {
    const w = measure(ctx, label, size) + pad * 2, h = size + pad * 1.3;
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 12;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 26); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(x - w / 2 + 14, y - h / 2 + 14, w - 28, h - 28, 18); ctx.stroke();
    ctx.restore();
    txt(ctx, label, x, y + 4, { size, color });
  }, rot);
}

// Rounded name tag with a coloured pill, e.g. 「流星体」, popping in at t0.
export function nameTag(ctx, t, t0, x, y, name, note, o = {}) {
  const { color = C.gold, size = 92, num } = o;
  const p = pop(t, t0, 0.45);
  around(ctx, x, y, p, p, () => {
    const w = Math.max(measure(ctx, name, size), note ? measure(ctx, note, 40, SANS) : 0) + 110;
    const h = note ? size + 120 : size + 60;
    card(ctx, x - w / 2, y - h / 2, w, h, { fill: 'rgba(8,10,40,0.88)', edge: color, ew: 6, drop: 0, r: 36 });
    if (num) {
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x - w / 2, y - h / 2, 40, 0, Math.PI * 2); ctx.fill();
      txt(ctx, num, x - w / 2, y - h / 2 + 3, { size: 50, font: NUM, color: C.ink });
    }
    txt(ctx, name, x, y - (note ? 26 : 0), { size, color, stroke: C.ink, sw: 4 });
    if (note) txt(ctx, note, x, y + size / 2 + 12, { size: 40, font: SANS, color: C.white });
  });
}

// Mouth openness from the word timings of the given character lines.
export function talkLevel(t, ids) {
  for (const id of ids) {
    const s = SEG[id];
    if (t < s.start || t > s.end) continue;
    if (s.words.some((w) => t >= w.start && t <= w.end)) return 0.45 + 0.55 * Math.abs(Math.sin(t * 22));
  }
  return 0;
}

export function confetti(ctx, t, t0, n = 150) {
  const dt = t - t0;
  if (dt < 0) return;
  const cols = [C.gold, C.pink, C.sky, C.mint, C.red, C.lilac];
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1;
    const x0 = side > 0 ? W + 20 : -20, y0 = H * 0.62;
    const vx = -side * (300 + rand(i) * 600), vy = -(1100 + rand(i + 9) * 800);
    const d = Math.max(0, dt - rand(i + 3) * 0.25);
    const x = x0 + vx * d * Math.exp(-d * 0.6), y = y0 + vy * d + 1100 * d * d;
    if (y > H + 40) continue;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(d * (4 + rand(i + 5) * 8));
    ctx.scale(1, Math.abs(Math.sin(d * 9 + i)));
    ctx.fillStyle = cols[i % cols.length];
    ctx.fillRect(-12, -7, 24, 14);
    ctx.restore();
  }
}
