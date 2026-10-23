// Renders the vertical meteor explainer frame by frame with canvas and pipes it into ffmpeg.
// Usage: node render.mjs                  -> out/看见流星地上就有陨石吗.mp4
//        node render.mjs --still 3.2 7.6  -> build/still_<t>.png previews
import { createCanvas } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { W, H, FPS, C, ZH, SANS, TL, DURATION, S, at, prog, lerp, clamp, easeOut, pop, txt, measure, around, rand } from './lib.mjs';
import { scenesA, eventsA } from './scenes-a.mjs';
import { scenesB, eventsB } from './scenes-b.mjs';
import { scenesC, eventsC } from './scenes-c.mjs';
import { scenesD, eventsD } from './scenes-d.mjs';
import { buildMusic, buildSfx, writeWav } from './audio.mjs';

const TITLE = '看见流星地上就有陨石吗';
const SCENES = [...scenesA, ...scenesB, ...scenesC, ...scenesD];
const EVENTS = [...eventsA, ...eventsB, ...eventsC, ...eventsD];
const XF = 0.3; // cross-fade between scenes
const CAP_Y = 1450; // subtitles sit above Douyin's bottom caption/UI area

// ---------- background: deep night sky with twinkling stars ----------
const STARS = [...Array(220)].map((_, i) => ({
  x: rand(i * 3 + 1) * W, y: rand(i * 3 + 2) * H, s: 0.8 + rand(i * 7) * 2.6, ph: rand(i * 5) * 6.28, sp: 0.6 + rand(i * 11) * 2.5, depth: 0.3 + rand(i * 13),
}));

function background(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.bg0); g.addColorStop(0.6, C.bg1); g.addColorStop(1, '#1d3a6e');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  for (const [x, y, r, c] of [[W * 0.1, H * 0.25, 600, 'rgba(120,60,200,0.16)'], [W * 0.95, H * 0.6, 650, 'rgba(40,140,220,0.13)']]) {
    const n = ctx.createRadialGradient(x, y, 0, x, y, r);
    n.addColorStop(0, c); n.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = n; ctx.fillRect(0, 0, W, H);
  }
  for (const s of STARS) {
    const y = ((s.y + t * 5 * s.depth) % H + H) % H;
    const a = 0.35 + 0.65 * Math.abs(Math.sin(t * s.sp + s.ph));
    ctx.fillStyle = `rgba(255,255,255,${a * s.depth})`;
    ctx.beginPath(); ctx.arc(s.x, y, s.s * s.depth, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------- header: "一块石头的 3 个名字" with chips that light up as each name is said ----------
const CHIPS = [
  { name: '流星体', t: () => at('name1', '流星体'), color: C.sky },
  { name: '流星', t: () => at('name2', '流星'), color: C.amber },
  { name: '陨石', t: () => at('name3', '陨石'), color: C.mint },
];

function header(ctx, t) {
  const a = prog(t, at('three', '三个名字') - 0.1, at('three', '三个名字') + 0.4) * (1 - prog(t, S('recap') - 0.4, S('recap')));
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  const y0 = lerp(120, 150, easeOut(a));
  txt(ctx, '一块石头的', 300, y0 + 40, { size: 50, color: C.white, stroke: C.ink, sw: 8 });
  txt(ctx, '3', 480, y0 + 34, { size: 92, font: 'RoundB, YuanB', color: C.gold, stroke: C.ink, sw: 10 });
  txt(ctx, '个名字', 615, y0 + 40, { size: 50, color: C.white, stroke: C.ink, sw: 8 });
  CHIPS.forEach((c, i) => {
    const x = 210 + i * 300, y = y0 + 140, t0 = c.t();
    const on = prog(t, t0, t0 + 0.25);
    const sc = t >= t0 ? pop(t, t0, 0.45) : 1;
    around(ctx, x, y, sc, 1, () => {
      ctx.fillStyle = on > 0 ? c.color : 'rgba(255,255,255,0.12)';
      ctx.strokeStyle = on > 0 ? C.ink : 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.roundRect(x - 125, y - 44, 250, 88, 44); ctx.fill(); ctx.stroke();
      txt(ctx, on > 0 ? `${i + 1} ${c.name}` : `${i + 1} ？`, x, y + 3, { size: 46, color: on > 0 ? C.ink : 'rgba(255,255,255,0.6)' });
    });
    if (i < 2) txt(ctx, '›', x + 150, y, { size: 60, color: 'rgba(255,255,255,0.6)' });
  });
  ctx.restore();
}

// ---------- subtitles ----------
function subtitles(ctx, t) {
  for (const seg of TL.segments)
    seg.cues.forEach((c, i) => {
      const next = seg.cues[i + 1];
      const until = next ? next.start : c.end + 0.3;
      const from = i === 0 ? c.start - 0.08 : c.start;
      if (t < from || t >= until) return;
      const a = (i === 0 ? prog(t, from, c.start + 0.06) : 1) * (next ? 1 : 1 - prog(t, c.end + 0.12, c.end + 0.3));
      const isRock = seg.voice === 'rock';
      const size = 60;
      const w = measure(ctx, c.text, size, ZH);
      ctx.save();
      ctx.globalAlpha = a;
      if (isRock) {
        const tw = measure(ctx, '小石头', 34, SANS) + 36;
        ctx.fillStyle = C.gold;
        ctx.beginPath(); ctx.roundRect(W / 2 - tw / 2, CAP_Y - 98, tw, 50, 25); ctx.fill();
        txt(ctx, '小石头', W / 2, CAP_Y - 72, { size: 34, font: SANS, color: C.ink });
      }
      const sc = Math.min(1, 960 / w);
      around(ctx, W / 2, CAP_Y, sc, 1, () =>
        txt(ctx, c.text, W / 2, CAP_Y, { size, color: isRock ? '#ffe9a8' : C.white, stroke: '#0a0a1e', sw: 14 }));
      ctx.restore();
    });
}

// ---------- frame ----------
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

function shakeAt(t) {
  let dx = 0, dy = 0;
  for (const e of EVENTS) {
    if (!e.shake) continue;
    const p = prog(t, e.t, e.t + 0.4);
    if (p <= 0 || p >= 1) continue;
    const k = e.shake * (1 - p) * (1 - p);
    dx += Math.sin(t * 95) * k;
    dy += Math.cos(t * 81) * k;
  }
  return [dx, dy];
}

function renderFrame(t) {
  background(ctx, t);
  const [sx, sy] = shakeAt(t);
  ctx.save();
  ctx.translate(sx, sy);
  for (const s of SCENES) {
    if (t < s.from || t > s.to + XF) continue;
    const enter = s.from <= 0 ? 1 : easeOut(prog(t, s.from, s.from + XF));
    const leave = 1 - prog(t, s.to, s.to + XF);
    const a = clamp(enter * leave);
    if (a <= 0) continue;
    const sc = lerp(0.94, 1, enter) * lerp(1.05, 1, leave);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(W / 2, H / 2); ctx.scale(sc, sc); ctx.translate(-W / 2, -H / 2);
    s.draw(ctx, t);
    ctx.restore();
  }
  ctx.restore();
  header(ctx, t);
  subtitles(ctx, t);
  txt(ctx, '科普示意 · 非实拍 · 大小与距离不按比例', W / 2, 1860, { size: 26, font: SANS, color: 'rgba(255,255,255,0.4)' });
  const fade = 1 - prog(t, 0, 0.25) + prog(t, DURATION - 0.6, DURATION);
  if (fade > 0) {
    ctx.fillStyle = `rgba(4,6,22,${clamp(fade)})`;
    ctx.fillRect(0, 0, W, H);
  }
}

// ---------- main ----------
const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const args = process.argv.slice(2);
mkdirSync(here('./build/'), { recursive: true });
mkdirSync(here('./out/'), { recursive: true });

if (args[0] === '--still') {
  for (const s of args.slice(1)) {
    renderFrame(parseFloat(s));
    writeFileSync(here(`./build/still_${s}.png`), canvas.toBuffer('image/png'));
  }
  console.log('wrote', args.length - 1, 'stills');
} else {
  writeWav(here('./build/music.wav'), buildMusic(DURATION));
  writeWav(here('./build/sfx.wav'), buildSfx(EVENTS.filter((e) => e.type), DURATION));
  const outFile = here(`./out/${TITLE}.mp4`);
  const ff = spawn('ffmpeg', [
    '-y', '-v', 'error',
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-i', here('./build/narration.wav'), '-i', here('./build/music.wav'), '-i', here('./build/sfx.wav'),
    '-filter_complex',
    // music ducks under the voice; effects sit on top; a limiter keeps peaks safe
    '[1:a]asplit=2[v1][v2];[2:a]volume=0.75[m];[m][v1]sidechaincompress=threshold=0.05:ratio=5:attack=20:release=400[md];' +
      '[3:a]volume=0.5[s];[v2][md][s]amix=inputs=3:normalize=0:duration=first,alimiter=limit=0.93[a]',
    '-map', '0:v', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', outFile,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.round(DURATION * FPS);
  for (let i = 0; i < frames; i++) {
    renderFrame(i / FPS);
    const buf = ctx.getImageData(0, 0, W, H).data;
    if (!ff.stdin.write(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength))) await once(ff.stdin, 'drain');
    if (i % 600 === 0) console.log(`frame ${i}/${frames}`);
  }
  ff.stdin.end();
  await once(ff, 'close');
  console.log('done ->', outFile);
}
