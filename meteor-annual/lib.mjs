import { GlobalFonts, loadImage } from '@napi-rs/canvas';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const here = (p) => fileURLToPath(new URL(p, import.meta.url));
export const W = 1080, H = 1920, FPS = 30;
export const TITLE = '流星雨为什么能按年赴约';
for (const [file, family] of [
  ['YuantiSC-Bold.ttf', 'YuanB'], ['PingFangSC-Semibold.ttf', 'PingB'],
]) {
  if (!GlobalFonts.registerFromPath(here(`./build/fonts/${file}`), family))
    throw new Error(`Cannot register video font: ${file}`);
}
export const FONT = 'PingB', FUN = 'YuanB';
export const LOGO = await loadImage(here('./assets/logo-transparent.png'));
export const LOGO_BOX = { sx: 150, sy: 96, sw: 1998, sh: 528 };
export const TL = JSON.parse(readFileSync(here('./build/timeline.json'), 'utf8'));
export const SEG = Object.fromEntries(TL.segments.map((s) => [s.id, s]));
export const DURATION = TL.duration;
export const S = (id) => SEG[id].start;
export const E = (id) => SEG[id].end;
export function word(id, phrase) {
  const seg = SEG[id], index = seg.text.indexOf(phrase);
  if (index < 0) throw new Error(`Missing phrase "${phrase}" in ${id}`);
  const words = seg.words.filter((w) => w.idx < index + phrase.length && w.idx + w.text.length > index);
  if (!words.length) throw new Error(`No word timing for "${phrase}" in ${id}`);
  return { start: words[0].start, end: words.at(-1).end };
}
export const at = (id, phrase) => word(id, phrase).start;
export const endAt = (id, phrase) => word(id, phrase).end;
export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, p) => a + (b - a) * p;
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const ease = (p) => p * p * (3 - 2 * p);
export const out = (p) => 1 - (1 - p) ** 3;
export const fade = (t, start, duration = 0.35) => out(prog(t, start, start + duration));
export const back = (p) => 1 + 2.7 * (p - 1) ** 3 + 1.7 * (p - 1) ** 2;
export const pop = (t, start, duration = 0.45) => back(prog(t, start, start + duration));
export function around(ctx, x, y, scale, a, draw, rot = 0) {
  if (a <= 0.001 || scale <= 0.001) return;
  ctx.save(); ctx.globalAlpha *= clamp(a);
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(scale, scale); ctx.translate(-x, -y);
  draw(); ctx.restore();
}
export const rand = (i) => {
  const n = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
};
export const C = {
  bg: '#050c20', blue: '#63cfff', gold: '#ffd580', white: '#f4f4ed',
  mint: '#87e1bc', dim: '#9eb4c9', pink: '#ffb3b8', panel: '#102137',
};
export function text(ctx, s, x, y, size = 48, color = C.white, align = 'center', font = FONT) {
  ctx.save();
  ctx.font = `${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fillStyle = color; ctx.fillText(s, x, y);
  ctx.restore();
}
export function measure(ctx, s, size = 48, font = FONT) {
  ctx.save(); ctx.font = `${size}px ${font}`;
  const width = ctx.measureText(s).width;
  ctx.restore(); return width;
}
export function alpha(ctx, a, draw) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a); draw(); ctx.restore();
}
export function glow(ctx, x, y, radius, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}
export function pill(ctx, s, x, y, color = C.gold, size = 32) {
  const w = measure(ctx, s, size) + 44, h = size + 34;
  ctx.save(); ctx.fillStyle = '#102137';
  ctx.strokeStyle = color; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
  ctx.fill(); ctx.stroke();
  text(ctx, s, x, y, size, color); ctx.restore();
}
export function header(ctx, t, start, eyebrow, title, subtitle) {
  const a = fade(t, start, 0.4);
  alpha(ctx, a, () => {
    const dy = (1 - a) * 24;
    text(ctx, eyebrow, 80, 244 + dy, 27, C.gold, 'left');
    text(ctx, title, 540, 348 + dy, Math.min(78, 880 / title.length), C.white);
    if (subtitle) text(ctx, subtitle, 540, 440 + dy, 34, C.dim);
  });
}
export function arrow(ctx, x1, y1, x2, y2, color = C.gold, width = 4) {
  const angle = Math.atan2(y2 - y1, x2 - x1), head = width * 3 + 8;
  ctx.save(); ctx.lineWidth = width; ctx.strokeStyle = color;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.moveTo(x2 - Math.cos(angle - 0.45) * head, y2 - Math.sin(angle - 0.45) * head);
  ctx.lineTo(x2, y2); ctx.lineTo(x2 - Math.cos(angle + 0.45) * head, y2 - Math.sin(angle + 0.45) * head);
  ctx.stroke(); ctx.restore();
}
export function line(ctx, points, color, width = 2) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width;
  ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.stroke(); ctx.restore();
}
export function talk(t, ids) {
  return ids.some((id) => SEG[id].words.some((w) => t >= w.start && t <= w.end))
    ? 0.3 + Math.abs(Math.sin(t * 21)) * 0.7 : 0;
}
export function meteor(ctx, x, y, length = 180, angle = 0.6, opacity = 1) {
  alpha(ctx, opacity, () => {
    const tx = x - Math.cos(angle) * length, ty = y - Math.sin(angle) * length;
    const g = ctx.createLinearGradient(tx, ty, x, y);
    g.addColorStop(0, 'rgba(255,212,128,0)'); g.addColorStop(0.8, '#ffe4b0'); g.addColorStop(1, '#ffffff');
    ctx.save(); ctx.strokeStyle = g; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
    glow(ctx, x, y, 25, 'rgba(255,212,128,0.6)');
    ctx.fillStyle = '#fff9dd'; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
}
export function panel(ctx, x, y, w, h, stroke = '#28415a') {
  ctx.save(); ctx.fillStyle = 'rgba(13,31,52,0.92)'; ctx.strokeStyle = stroke; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 26); ctx.fill(); ctx.stroke(); ctx.restore();
}
