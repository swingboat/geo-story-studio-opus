// Draws Douyin covers (竖封面 3:4, 横封面 4:3, plus a 16:9 spare) reusing the video's characters and palette.
// Usage: node cover.mjs  -> out/封面-竖3比4.png, out/封面-横4比3.png, out/封面-横16比9.png
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { C, txt, measure, stamp, rand } from './lib.mjs';
import { rockGuy, streak } from './bodies.mjs';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));

function sky(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, C.bg0); g.addColorStop(0.65, C.bg1); g.addColorStop(1, '#1d3a6e');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  for (const [x, y, r, c] of [[w * 0.12, h * 0.2, h * 0.6, 'rgba(120,60,200,0.18)'], [w * 0.85, h * 0.35, h * 0.7, 'rgba(255,140,60,0.14)']]) {
    const n = ctx.createRadialGradient(x, y, 0, x, y, r);
    n.addColorStop(0, c); n.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = n; ctx.fillRect(0, 0, w, h);
  }
  for (let i = 0; i < 260; i++) {
    const a = 0.3 + 0.7 * rand(i * 5), s = 0.8 + rand(i * 7) * 2.4;
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.beginPath(); ctx.arc(rand(i * 3 + 1) * w, rand(i * 3 + 2) * h * 0.85, s, 0, Math.PI * 2); ctx.fill();
  }
  // curved horizon
  const gy = h * 0.9;
  ctx.fillStyle = '#14213f';
  ctx.beginPath(); ctx.moveTo(0, gy + 30); ctx.quadraticCurveTo(w / 2, gy - 40, w, gy + 30); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#3c5a8a'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(0, gy + 30); ctx.quadraticCurveTo(w / 2, gy - 40, w, gy + 30); ctx.stroke();
}

// Three name chips: 流星体 › 流星 › 陨石
function chips(ctx, x, y, s) {
  const items = [['流星体', C.sky], ['流星', C.amber], ['陨石', C.mint]];
  let cx = x;
  items.forEach(([name, col], i) => {
    const w = measure(ctx, name, 46 * s) + 70 * s;
    ctx.fillStyle = col; ctx.strokeStyle = C.ink; ctx.lineWidth = 5 * s;
    ctx.beginPath(); ctx.roundRect(cx, y - 40 * s, w, 80 * s, 40 * s); ctx.fill(); ctx.stroke();
    txt(ctx, name, cx + w / 2, y + 3 * s, { size: 46 * s, color: C.ink });
    cx += w;
    if (i < 2) { txt(ctx, '›', cx + 28 * s, y, { size: 64 * s, color: 'rgba(255,255,255,0.75)' }); cx += 56 * s; }
  });
}

function cover(w, h, file) {
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  const s = h / 1080;
  sky(ctx, w, h);
  // hero: the hot little rock streaking in from the upper right
  const rx = w * 0.74, ry = h * 0.5;
  streak(ctx, rx, ry, -0.62, 1, 760 * s, 260 * s, 1);
  rockGuy(ctx, 1.5, rx, ry, 150 * s, { mood: 'excited', heat: 0.75, look: [-0.6, 0.6] });
  for (const [x, y, l] of [[0.58, 0.16, 220], [0.92, 0.12, 160], [0.95, 0.72, 140]]) streak(ctx, w * x, h * y, -0.62, 1, l * s, 14 * s, 0.85);
  txt(ctx, '?', rx + 150 * s, ry - 200 * s, { size: 150 * s, color: C.gold, stroke: C.ink, sw: 12 * s });
  // title block on the left
  const lx = w * 0.06;
  txt(ctx, '看见流星', lx, h * 0.2, { size: 150 * s, align: 'left', color: C.gold, stroke: C.ink, sw: 18 * s });
  txt(ctx, '地上就一定', lx, h * 0.37, { size: 120 * s, align: 'left', color: C.white, stroke: C.ink, sw: 16 * s });
  txt(ctx, '有陨石吗？', lx, h * 0.52, { size: 120 * s, align: 'left', color: C.white, stroke: C.ink, sw: 16 * s });
  stamp(ctx, 1, 0, lx + 260 * s, h * 0.69, '不一定！', { size: 104 * s, pad: 34 * s, rot: -0.08 });
  chips(ctx, lx, h * 0.84, s);
  writeFileSync(file, canvas.toBuffer('image/png'));
  console.log('wrote', file);
}

// Portrait 3:4 cover (Douyin 竖封面): title on top, the hot rock in the middle, name chips at the bottom.
function coverPortrait(w, h, file) {
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  const s = w / 1200;
  sky(ctx, w, h);
  const cx = w / 2;
  const rx = w * 0.6, ry = h * 0.53;
  streak(ctx, rx, ry, -0.62, 1, 700 * s, 260 * s, 1);
  rockGuy(ctx, 1.5, rx, ry, 165 * s, { mood: 'excited', heat: 0.75, look: [-0.6, 0.6] });
  for (const [x, y, l] of [[0.2, 0.36, 200], [0.9, 0.34, 160], [0.14, 0.62, 140]]) streak(ctx, w * x, h * y, -0.62, 1, l * s, 14 * s, 0.85);
  txt(ctx, '?', rx + 170 * s, ry - 210 * s, { size: 160 * s, color: C.gold, stroke: C.ink, sw: 12 * s });
  // title last so the meteor trail passes behind it
  txt(ctx, '看见流星', cx, h * 0.12, { size: 170 * s, color: C.gold, stroke: C.ink, sw: 20 * s });
  txt(ctx, '地上就一定有陨石吗？', cx, h * 0.235, { size: 104 * s, color: C.white, stroke: C.ink, sw: 16 * s });
  stamp(ctx, 1, 0, cx, h * 0.745, '不一定！', { size: 120 * s, pad: 38 * s, rot: -0.08 });
  // centre the chip row
  ctx.save();
  const rowW = ['流星体', '流星', '陨石'].reduce((a, n) => a + measure(ctx, n, 46 * s) + 70 * s, 0) + 112 * s;
  ctx.restore();
  chips(ctx, cx - rowW / 2, h * 0.865, s);
  writeFileSync(file, canvas.toBuffer('image/png'));
  console.log('wrote', file);
}

mkdirSync(here('./out/'), { recursive: true });
coverPortrait(1200, 1600, here('./out/封面-竖3比4.png'));
cover(1440, 1080, here('./out/封面-横4比3.png'));
cover(1920, 1080, here('./out/封面-横16比9.png'));
