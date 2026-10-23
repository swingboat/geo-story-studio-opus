// Shared helpers: fonts, logo, easing, timeline lookups and reusable drawing for the vertical moonlight video.
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
reg('/System/Library/Fonts/Hiragino Sans GB.ttc', 'HiraGB');
export const ZH = 'YuanB, RoundB, HiraGB';
export const PF = 'PingB, HiraGB';

// ---------- brand logo (opaque box of the transparent PNG, measured once) ----------
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
export const easeBack = (t) => {
  const c1 = 2.2, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export const pop = (t, t0, d = 0.45) => easeBack(prog(t, t0, t0 + d));
export const fadeIn = (t, t0, d = 0.3) => easeOut(prog(t, t0, t0 + d));
export const bob = (t, amp = 8, sp = 2.2, ph = 0) => Math.sin(t * sp + ph) * amp;

export const C = {
  bg0: '#06101f', bg1: '#123150', navy: '#12263a', ink: '#0b1726',
  gold: '#f4c978', goldDeep: '#e9a23b', sun: '#ffb02e', sunHot: '#ff7a1a', cream: '#f5efdf',
  moon: '#e6e4dc', moonDark: '#4b5566', crater: '#c3c0b6', sky: '#8fd3f4', teal: '#a7c7cf',
  earth: '#2f7aa8', land: '#7cc48a', pink: '#ff9fb2', mint: '#7fe0b0', white: '#ffffff', dim: '#9fb3c4',
};

// ---------- text ----------
export function txt(ctx, s, x, y, o = {}) {
  const { size = 64, font = ZH, color = C.white, align = 'center', base = 'middle', stroke, sw = 10, glow } = o;
  ctx.save();
  ctx.font = `${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  ctx.lineJoin = 'round';
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = sw;
    ctx.strokeText(s, x, y);
  }
  if (glow) {
    ctx.shadowColor = glow;
    ctx.shadowBlur = size * 0.5;
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

// Apply a scale/alpha/rotation around (x,y) for the duration of fn.
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

// Scene header: big title + gold subtitle, popping in at t0.
export function header(ctx, t, t0, title, sub) {
  const a = fadeIn(t, t0, 0.4), b = fadeIn(t, t0 + 0.25, 0.4);
  around(ctx, W / 2, 330, lerp(0.85, 1, easeBack(prog(t, t0, t0 + 0.5))), a, () =>
    txt(ctx, title, W / 2, 330, { size: 84, color: C.cream, stroke: 'rgba(6,16,31,0.7)', sw: 14 }));
  if (sub) around(ctx, W / 2, 432, 1, b, () => txt(ctx, sub, W / 2, 432, { size: 50, color: C.gold }));
}

// Rounded label pill.
export function pill(ctx, s, x, y, o = {}) {
  const { size = 42, fill = 'rgba(8,20,36,0.82)', color = C.cream, edge = C.gold, pad = 30, font = ZH } = o;
  const w = measure(ctx, s, size, font) + pad * 2, h = size * 1.7;
  ctx.save();
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2); ctx.fill();
  if (edge) { ctx.strokeStyle = edge; ctx.lineWidth = 4; ctx.stroke(); }
  ctx.restore();
  txt(ctx, s, x, y + 2, { size, color, font });
  return w;
}

// Arrow that grows from (x1,y1) towards (x2,y2) as p goes 0→1.
export function arrow(ctx, x1, y1, x2, y2, o = {}) {
  const { color = C.gold, w = 10, head = 34, p = 1, dash, glow } = o;
  if (p <= 0) return;
  const x = lerp(x1, x2, p), y = lerp(y1, y2, p);
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = 24; }
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x - Math.cos(a) * head * 0.6, y - Math.sin(a) * head * 0.6); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - Math.cos(a - 0.42) * head, y - Math.sin(a - 0.42) * head);
  ctx.lineTo(x - Math.cos(a + 0.42) * head, y - Math.sin(a + 0.42) * head);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

// A beam of travelling light "photons" (bright dots) along a segment, giving the light path a sense of motion.
export function photons(ctx, t, x1, y1, x2, y2, o = {}) {
  const { n = 6, speed = 0.8, r = 9, color = '#fff3c4', p = 1 } = o;
  for (let i = 0; i < n; i++) {
    const u = ((t * speed + i / n) % 1) * p;
    const x = lerp(x1, x2, u), y = lerp(y1, y2, u);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.4);
    g.addColorStop(0, color); g.addColorStop(1, 'rgba(255,243,196,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, Math.PI * 2); ctx.fill();
  }
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

// Sparkles flying out from (x,y) starting at t0.
export function burst(ctx, t, t0, x, y, o = {}) {
  const { n = 10, r = 200, size = 20, colors = [C.gold, C.pink, C.sky, C.mint], dur = 0.7 } = o;
  const p = prog(t, t0, t0 + dur);
  if (p <= 0 || p >= 1) return;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.3;
    const d = r * easeOut(p);
    star(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, size * (1 - p), colors[i % colors.length], p * 3);
  }
}

// Mouth openness for a voiced line, driven by its word timings.
export function talkLevel(t, ids) {
  for (const id of ids) {
    const s = SEG[id];
    if (t < s.start || t > s.end) continue;
    if (s.words.some((w) => t >= w.start && t <= w.end)) return 0.45 + 0.55 * Math.abs(Math.sin(t * 22));
  }
  return 0;
}

function rand(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
export function confetti(ctx, t, t0, n = 140) {
  const dt = t - t0;
  if (dt < 0) return;
  const cols = [C.gold, C.pink, C.sky, C.mint, C.cream];
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1;
    const x0 = side > 0 ? W + 20 : -20, y0 = H * 0.7;
    const vx = -side * (300 + rand(i) * 600), vy = -(1100 + rand(i + 9) * 800);
    const d = Math.max(0, dt - rand(i + 3) * 0.25);
    const x = x0 + vx * d * Math.exp(-d * 0.6), y = y0 + vy * d + 1000 * d * d;
    if (y > H + 40) continue;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(d * (4 + rand(i + 5) * 8));
    ctx.scale(1, Math.abs(Math.sin(d * 9 + i)));
    ctx.fillStyle = cols[i % cols.length];
    ctx.fillRect(-10, -6, 20, 12);
    ctx.restore();
  }
}
