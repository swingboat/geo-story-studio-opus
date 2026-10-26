// Renders the vertical solar-system-scale explainer frame by frame with canvas and pipes it into ffmpeg.
// Usage: node render.mjs                  -> out/把太阳系装进操场会有多空.mp4
//        node render.mjs --still 3.2 7.6  -> build/still_<t>.png previews
import { createCanvas } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { W, H, FPS, C, ZH, LOGO, LOGO_BOX, TL, DURATION, S, at, prog, lerp, clamp, easeOut, pop, txt, measure, around, rand } from './lib.mjs';
import { buildMusic, buildSfx, writeWav } from './audio.mjs';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const TITLE = '把太阳系装进操场会有多空';
const SCENES = [], EVENTS = [];
for (const k of ['a', 'b', 'c', 'd', 'e']) {
  if (!existsSync(here(`./scenes-${k}.mjs`))) continue;
  const m = await import(`./scenes-${k}.mjs`);
  SCENES.push(...m.scenes);
  EVENTS.push(...m.events);
}
SCENES.sort((a, b) => a.from - b.from);
const XF = 0.3; // cross-fade between scenes
const SUB_Y = 1500; // subtitles sit above Douyin's bottom caption/UI area

// ---------- background: deep space with twinkling, slowly drifting stars ----------
const STARS = [...Array(240)].map((_, i) => ({
  x: rand(i * 3 + 1) * W, y: rand(i * 3 + 2) * H, s: 0.8 + rand(i * 7) * 2.6, ph: rand(i * 5) * 6.28, sp: 0.6 + rand(i * 11) * 2.5, depth: 0.3 + rand(i * 13),
}));

function background(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.bg0); g.addColorStop(0.65, C.bg1); g.addColorStop(1, '#1a2c63');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  for (const [x, y, r, c] of [[W * 0.05, H * 0.3, 650, 'rgba(130,70,210,0.16)'], [W * 0.95, H * 0.65, 700, 'rgba(40,150,230,0.13)']]) {
    const n = ctx.createRadialGradient(x, y, 0, x, y, r);
    n.addColorStop(0, c); n.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = n; ctx.fillRect(0, 0, W, H);
  }
  for (const s of STARS) {
    const x = ((s.x - t * 4 * s.depth) % W + W) % W;
    const a = 0.35 + 0.65 * Math.abs(Math.sin(t * s.sp + s.ph));
    ctx.fillStyle = `rgba(255,255,255,${a * s.depth})`;
    ctx.beginPath(); ctx.arc(x, s.y, s.s * s.depth, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------- brand: 地理故事工坊 logo in the top-left corner (AGENTS.md §4) ----------
function brand(ctx, t) {
  const a = easeOut(prog(t, 0.3, 1.0));
  if (a <= 0) return;
  const { sx, sy, sw, sh } = LOGO_BOX;
  const x = 64, y = 76, w = 290, h = (w * sh) / sw;
  const g = ctx.createRadialGradient(x + w / 2, y + h / 2, 20, x + w / 2, y + h / 2, 250);
  g.addColorStop(0, `rgba(4,6,26,${0.45 * a})`); g.addColorStop(1, 'rgba(4,6,26,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 480, 260);
  ctx.save();
  ctx.globalAlpha = 0.95 * a;
  ctx.drawImage(LOGO, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

// ---------- subtitles with a speaker chip for the talking planets ----------
const SPEAKER = { earth: C.sky, jupiter: C.amber, neptune: C.lilac };

function subtitles(ctx, t) {
  for (const seg of TL.segments)
    seg.cues.forEach((c, i) => {
      const next = seg.cues[i + 1];
      const until = next ? next.start : c.end + 0.3;
      const from = i === 0 ? c.start - 0.08 : c.start;
      if (t < from || t >= until) return;
      const a = (i === 0 ? prog(t, from, c.start + 0.06) : 1) * (next ? 1 : 1 - prog(t, c.end + 0.12, c.end + 0.3));
      const tag = TL.voices[seg.voice]?.tag, col = SPEAKER[seg.voice];
      const tw = tag ? measure(ctx, tag, 32) + 40 : 0;
      let size = 58;
      while (measure(ctx, c.text, size) + 80 + tw > W - 60) size -= 2;
      const w = measure(ctx, c.text, size) + 80 + tw, x0 = W / 2 - w / 2;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(6,6,28,0.84)';
      ctx.beginPath(); ctx.roundRect(x0, SUB_Y - 50, w, 100, 50); ctx.fill();
      if (tag) {
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.roundRect(x0 + 18, SUB_Y - 26, tw - 8, 52, 26); ctx.fill();
        txt(ctx, tag, x0 + 14 + tw / 2, SUB_Y + 1, { size: 32, color: C.ink });
      }
      txt(ctx, c.text, x0 + 40 + tw + (w - 80 - tw) / 2, SUB_Y + 2, { size, color: tag ? '#dff4ff' : C.white });
      ctx.restore();
    });
}

// sources appear once the summary starts (AGENTS.md §5: no "示意" disclaimers on screen)
function footer(ctx, t) {
  const a = prog(t, S('sum') - 0.3, S('sum') + 0.3);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  txt(ctx, '资料：NASA · NASA/JPL SSD · 人教版地理必修第一册', W / 2, 1640, { size: 28, color: 'rgba(255,255,255,0.5)' });
  ctx.restore();
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
  SCENES.forEach((s, i) => {
    const last = i === SCENES.length - 1;
    if (t < s.from || (!last && t > s.to + XF)) return;
    const enter = s.from <= 0 ? 1 : easeOut(prog(t, s.from, s.from + XF));
    const leave = last ? 1 : 1 - prog(t, s.to, s.to + XF);
    const a = clamp(enter * leave);
    if (a <= 0) return;
    const sc = lerp(0.95, 1, enter) * lerp(1.04, 1, leave);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(W / 2, H / 2); ctx.scale(sc, sc); ctx.translate(-W / 2, -H / 2);
    s.draw(ctx, t);
    ctx.restore();
  });
  ctx.restore();
  footer(ctx, t);
  subtitles(ctx, t);
  brand(ctx, t);
  const fade = 1 - prog(t, 0, 0.25) + prog(t, DURATION - 0.6, DURATION);
  if (fade > 0) {
    ctx.fillStyle = `rgba(4,6,22,${clamp(fade)})`;
    ctx.fillRect(0, 0, W, H);
  }
}

// ---------- main ----------
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
