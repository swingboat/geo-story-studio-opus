// Renders "流星雨为什么能按年赴约" (1080x1920) frame by frame and pipes it into ffmpeg.
// Usage: node render.mjs                 -> out/流星雨为什么能按年赴约.mp4 + out/cover.png
//        node render.mjs --still 3.2 7.6 -> build/still_<t>.png previews
import { createCanvas } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, renameSync, existsSync } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import {
  W, H, FPS, C, FONT, TL, DURATION, TITLE, LOGO, LOGO_BOX, here, E,
  prog, fade, pop, lerp, alpha, text, measure, glow, rand,
} from './lib.mjs';
import { buildMusic, buildSfx, writeWav } from './audio.mjs';

const groups = [];
for (const name of ['a', 'b', 'c', 'd']) {
  if (existsSync(here(`./scenes-${name}.mjs`))) groups.push(await import(`./scenes-${name}.mjs`));
}
export const SCENES = groups.flatMap((g) => g.scenes);
export const OUTRO = E('outro') + 0.45;
export const EVENTS = [...groups.flatMap((g) => g.events), { type: 'tada', t: OUTRO + 0.1, amp: 0.6 }];
const XF = 0.3;

const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
const backdrop = createCanvas(W, H), bg = backdrop.getContext('2d');
const grad = bg.createLinearGradient(0, 0, W * 0.4, H);
grad.addColorStop(0, '#050b1e'); grad.addColorStop(0.55, '#0b2240'); grad.addColorStop(1, '#06111f');
bg.fillStyle = grad; bg.fillRect(0, 0, W, H);
glow(bg, 820, 700, 820, 'rgba(70,120,190,0.14)');
glow(bg, 200, 1300, 600, 'rgba(120,80,170,0.08)');
const STARS = [...Array(170)].map((_, i) => ({
  x: rand(i + 1) * W, y: rand(i + 800) * H, s: 0.6 + rand(i + 99) * 1.6, ph: rand(i + 5) * 6.3, sp: 0.5 + rand(i + 7) * 2,
}));

function background(t) {
  ctx.drawImage(backdrop, 0, 0);
  for (const s of STARS) {
    const a = 0.25 + 0.6 * Math.abs(Math.sin(t * s.sp + s.ph));
    ctx.fillStyle = `rgba(215,232,250,${a})`;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2); ctx.fill();
  }
}

function drawLogo(x, y, w, a) {
  alpha(ctx, a, () => {
    const { sx, sy, sw, sh } = LOGO_BOX;
    ctx.drawImage(LOGO, sx, sy, sw, sh, x, y, w, (w * sh) / sw);
  });
}

function brand(t) {
  const corner = fade(t, 0.3, 0.7) * (1 - prog(t, OUTRO - 0.2, OUTRO + 0.2));
  if (corner > 0) {
    alpha(ctx, corner, () => glow(ctx, 210, 115, 260, 'rgba(2,7,18,0.6)'));
    drawLogo(64, 76, 290, corner * 0.95);
  }
  const p = prog(t, OUTRO, OUTRO + 0.6);
  if (p <= 0) return;
  ctx.fillStyle = `rgba(5,11,25,${0.97 * p})`; ctx.fillRect(0, 0, W, H);
  const w = 820 * lerp(0.75, 1, pop(t, OUTRO, 0.7));
  drawLogo(W / 2 - w / 2, 800 - (w * LOGO_BOX.sh) / LOGO_BOX.sw / 2, w, p);
  alpha(ctx, fade(t, OUTRO + 0.45, 0.5), () => {
    text(ctx, '抬头看流星，低头懂地球', W / 2, 1040, 50, C.gold, 'center', 'YuanB');
    text(ctx, '资料：NASA Science · NASA/JPL', W / 2, 1130, 28, C.dim);
  });
}

const ROLE = { earth: ['地球', C.blue, '#c9efff'], grain: ['小尘埃', C.gold, '#ffe9bf'] };
function captions(t) {
  if (t > OUTRO) return;
  for (const seg of TL.segments) {
    seg.cues.forEach((cue, i) => {
      const next = seg.cues[i + 1];
      const until = next ? next.start : cue.end + 0.35;
      const from = i === 0 ? cue.start - 0.08 : cue.start;
      if (t < from || t >= until) return;
      const a = (i === 0 ? fade(t, from, 0.12) : 1) * (next ? 1 : 1 - prog(t, cue.end + 0.15, until));
      const [tag, tagColor, color] = ROLE[seg.voice] ?? ['', C.white, C.white];
      const size = Math.min(56, 900 / Math.max(1, measure(ctx, cue.text, 1)));
      alpha(ctx, a, () => {
        const g = ctx.createLinearGradient(0, 1450, 0, 1720);
        g.addColorStop(0, 'rgba(3,9,22,0)'); g.addColorStop(0.45, 'rgba(3,9,22,0.82)'); g.addColorStop(1, 'rgba(3,9,22,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 1450, W, 270);
        if (tag) {
          const tw = measure(ctx, tag, 28) + 34;
          ctx.fillStyle = tagColor; ctx.beginPath(); ctx.roundRect(W / 2 - tw / 2, 1478, tw, 44, 22); ctx.fill();
          text(ctx, tag, W / 2, 1501, 28, '#08142a');
        }
        ctx.save(); ctx.font = `${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(2,7,18,0.92)'; ctx.lineWidth = 9;
        ctx.strokeText(cue.text, W / 2, 1585); ctx.fillStyle = color; ctx.fillText(cue.text, W / 2, 1585);
        ctx.restore();
      });
    });
  }
}

function footer(t) {
  const a = 1 - prog(t, OUTRO - 0.2, OUTRO + 0.2);
  alpha(ctx, a, () => {
    text(ctx, '资料：NASA Science · NASA/JPL', W / 2, 1772, 24, C.dim);
    ctx.fillStyle = '#22384f'; ctx.beginPath(); ctx.roundRect(140, 1830, 800, 6, 3); ctx.fill();
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.roundRect(140, 1830, 800 * prog(t, 0, OUTRO), 6, 3); ctx.fill();
  });
}

export function renderFrame(t) {
  background(t);
  for (const s of SCENES) {
    if (t < s.from || t > s.to + XF) continue;
    const a = (s.from <= 0 ? 1 : fade(t, s.from, XF)) * (1 - prog(t, s.to, s.to + XF));
    alpha(ctx, a, () => s.draw(ctx, t));
  }
  captions(t); footer(t); brand(t);
  const black = (1 - prog(t, 0, 0.3)) + prog(t, DURATION - 0.6, DURATION);
  alpha(ctx, black, () => { ctx.fillStyle = '#040915'; ctx.fillRect(0, 0, W, H); });
  return canvas;
}

const isMain = process.argv[1] && here('./render.mjs') === process.argv[1];
if (isMain) await main();

async function main() {
  mkdirSync(here('./build'), { recursive: true });
  mkdirSync(here('./out'), { recursive: true });
  const args = process.argv.slice(2);
  if (args[0] === '--still') {
    for (const v of args.slice(1)) {
      const t = Number(v);
      if (!Number.isFinite(t) || t < 0 || t >= DURATION) throw new Error(`Invalid preview time: ${v}`);
      renderFrame(t);
      writeFileSync(here(`./build/still_${v}.png`), canvas.toBuffer('image/png'));
    }
    console.log(`Wrote ${args.length - 1} preview frames`);
    return;
  }
  if (args.length) throw new Error(`Unknown arguments: ${args.join(' ')}`);
  writeWav(here('./build/music.wav'), buildMusic(DURATION));
  writeWav(here('./build/sfx.wav'), buildSfx(EVENTS, DURATION));
  renderFrame(4.0); writeFileSync(here('./out/cover.png'), canvas.toBuffer('image/png'));
  const partial = here('./build/video.partial.mp4'), output = here(`./out/${TITLE}.mp4`);
  const ff = spawn('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'rawvideo', '-pixel_format', 'rgba', '-video_size', `${W}x${H}`, '-framerate', String(FPS), '-i', 'pipe:0',
    '-i', here('./build/narration.wav'), '-i', here('./build/music.wav'), '-i', here('./build/sfx.wav'),
    '-filter_complex',
    // music ducks under the voice; effects sit on top; loudness normalised for short-video platforms
    `[1:a]apad,atrim=0:${DURATION},asplit=2[v1][v2];` +
      '[2:a]volume=0.45[m];[m][v1]sidechaincompress=threshold=0.035:ratio=6:attack=15:release=350[md];' +
      '[3:a]volume=0.35[s];[v2][md][s]amix=inputs=3:duration=first:normalize=0,' +
      `loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,apad,atrim=0:${DURATION}[a]`,
    '-map', '0:v', '-map', '[a]', '-t', String(DURATION),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', '-f', 'mp4', partial,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const exited = new Promise((resolve, reject) => {
    ff.once('error', reject);
    ff.once('close', (code, sig) => (code === 0 ? resolve() : reject(new Error(`ffmpeg failed: ${code ?? sig}`))));
  });
  const frames = Math.ceil(DURATION * FPS);
  async function* images() {
    for (let i = 0; i < frames; i++) {
      renderFrame(i / FPS);
      const d = ctx.getImageData(0, 0, W, H).data;
      yield Buffer.from(d.buffer, d.byteOffset, d.byteLength);
      if (i % 300 === 0) console.log(`Frame ${i}/${frames}`);
    }
  }
  await Promise.all([pipeline(Readable.from(images()), ff.stdin), exited]);
  renameSync(partial, output);
  console.log(`Done: ${output}`);
}
