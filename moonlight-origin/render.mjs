// Renders "月亮的光从哪里来" frame by frame with canvas and pipes it into ffmpeg (vertical 1080x1920 for Douyin).
// Usage: node render.mjs                  -> out/月亮的光从哪里来.mp4
//        node render.mjs --still 3.2 7.6  -> build/still_<t>.png previews
import { createCanvas } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { W, H, FPS, C, ZH, TL, DURATION, LOGO, LOGO_BOX, E, prog, lerp, clamp, easeOut, easeBack, txt, measure } from './lib.mjs';
import { scenesA, eventsA } from './scenes-a.mjs';
import { scenesB, eventsB } from './scenes-b.mjs';
import { scenesC, eventsC } from './scenes-c.mjs';
import { buildMusic, buildSfx, writeWav } from './audio.mjs';

const TITLE = '月亮的光从哪里来';
const SCENES = [...scenesA, ...scenesB, ...scenesC];
const OUTRO = E('moonEnd') + 0.45;
const EVENTS = [...eventsA, ...eventsB, ...eventsC, { type: 'tada', t: OUTRO, amp: 0.7 }];
const XF = 0.35; // cross-fade between scenes

// ---------- background: night sky with twinkling stars ----------
const STARS = [...Array(150)].map((_, i) => {
  const r = (k) => { const x = Math.sin(i * 91.7 + k * 13.3) * 43758.5453; return x - Math.floor(x); };
  return { x: r(1) * W, y: r(2) * H, s: 0.8 + r(3) * 2.2, ph: r(4) * 6.28, sp: 0.6 + r(5) * 2.5, depth: 0.3 + r(6) };
});

function background(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.bg0); g.addColorStop(0.55, C.bg1); g.addColorStop(1, '#081626');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const n = ctx.createRadialGradient(W * 0.7, H * 0.35, 0, W * 0.7, H * 0.35, 800);
  n.addColorStop(0, 'rgba(80,150,200,0.16)'); n.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = n; ctx.fillRect(0, 0, W, H);
  for (const s of STARS) {
    const y = ((s.y - t * 4 * s.depth) % H + H) % H;
    const a = 0.3 + 0.7 * Math.abs(Math.sin(t * s.sp + s.ph));
    ctx.fillStyle = `rgba(255,250,235,${a * s.depth})`;
    ctx.beginPath(); ctx.arc(s.x, y, s.s * s.depth, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------- brand: small corner logo, then a centred end card ----------
function drawLogo(ctx, x, y, w, alpha) {
  if (alpha <= 0) return;
  const { sx, sy, sw, sh } = LOGO_BOX;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(LOGO, sx, sy, sw, sh, x, y, w, (w * sh) / sw);
  ctx.restore();
}

function brand(ctx, t) {
  const corner = easeOut(prog(t, 0.3, 1.0)) * (1 - prog(t, OUTRO - 0.2, OUTRO + 0.2));
  // a soft dark plate keeps the cream lettering readable over bright scenes without looking like a box
  if (corner > 0) {
    const g = ctx.createRadialGradient(170, 110, 20, 170, 110, 260);
    g.addColorStop(0, `rgba(6,16,31,${0.45 * corner})`); g.addColorStop(1, 'rgba(6,16,31,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 460, 240);
  }
  drawLogo(ctx, 36, 76, 290, corner * 0.95);
  const p = prog(t, OUTRO, OUTRO + 0.6);
  if (p <= 0) return;
  ctx.fillStyle = `rgba(6,16,31,${0.9 * easeOut(p)})`;
  ctx.fillRect(0, 0, W, H);
  const w = 860 * lerp(0.7, 1, easeBack(p));
  drawLogo(ctx, W / 2 - w / 2, 820 - (w * LOGO_BOX.sh) / LOGO_BOX.sw / 2, w, easeOut(p));
  const q = easeOut(prog(t, OUTRO + 0.5, OUTRO + 1.0));
  if (q > 0) {
    ctx.save(); ctx.globalAlpha = q;
    txt(ctx, '认识宇宙，从抬头看月亮开始', W / 2, 1080, { size: 48, color: C.gold, font: ZH });
    txt(ctx, '资料来源：NASA Moon / Moonlight', W / 2, 1170, { size: 30, color: C.dim });
    ctx.restore();
  }
}

// ---------- subtitles ----------
const TAGS = { kid: ['小朋友', C.sky, '#d6f1ff'], moon: ['月亮', C.gold, '#fff1cf'] };

function subtitles(ctx, t) {
  for (const seg of TL.segments)
    seg.cues.forEach((c, i) => {
      const next = seg.cues[i + 1];
      const until = next ? next.start : c.end + 0.3;
      const from = i === 0 ? c.start - 0.08 : c.start;
      if (t < from || t >= until) return;
      const a = (i === 0 ? prog(t, from, c.start + 0.06) : 1) * (next ? 1 : 1 - prog(t, c.end + 0.12, c.end + 0.3));
      const [tag, tagColor, color] = TAGS[seg.voice] ?? ['', C.cream, C.white];
      const size = 54;
      const tw = tag ? measure(ctx, tag, 32, ZH) + 36 : 0;
      const w = measure(ctx, c.text, size, ZH) + 72 + tw;
      const x0 = W / 2 - w / 2, y = 1390;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(5,12,24,0.8)';
      ctx.beginPath(); ctx.roundRect(x0, y, w, 96, 48); ctx.fill();
      if (tag) {
        ctx.fillStyle = tagColor;
        ctx.beginPath(); ctx.roundRect(x0 + 20, y + 22, tw - 8, 52, 26); ctx.fill();
        txt(ctx, tag, x0 + 16 + tw / 2, y + 49, { size: 32, color: C.ink });
      }
      txt(ctx, c.text, x0 + 36 + tw + (w - 72 - tw) / 2, y + 49, { size, color });
      ctx.restore();
    });
}

// ---------- frame ----------
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

function renderFrame(t) {
  background(ctx, t);
  for (const s of SCENES) {
    if (t < s.from || t > s.to + XF) continue;
    const enter = s.from <= 0 ? 1 : easeOut(prog(t, s.from, s.from + XF));
    const leave = 1 - prog(t, s.to, s.to + XF);
    const a = clamp(enter * leave);
    if (a <= 0) continue;
    const sc = lerp(0.95, 1, enter) * lerp(1.04, 1, leave);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(W / 2, H / 2); ctx.scale(sc, sc); ctx.translate(-W / 2, -H / 2);
    s.draw(ctx, t);
    ctx.restore();
  }
  subtitles(ctx, t);
  brand(ctx, t);
  const fade = 1 - prog(t, 0, 0.5) + prog(t, DURATION - 0.5, DURATION);
  if (fade > 0) {
    ctx.fillStyle = `rgba(4,8,18,${clamp(fade)})`;
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
    '[1:a]asplit=2[v1][v2];[2:a]volume=0.6[m];[m][v1]sidechaincompress=threshold=0.05:ratio=5:attack=20:release=400[md];' +
      '[3:a]volume=0.5[s];[v2][md][s]amix=inputs=3:normalize=0:duration=first,alimiter=limit=0.93[a]',
    '-map', '0:v', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', outFile,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.round(DURATION * FPS);
  for (let i = 0; i < frames; i++) {
    renderFrame(i / FPS);
    const buf = ctx.getImageData(0, 0, W, H).data;
    if (!ff.stdin.write(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength))) await once(ff.stdin, 'drain');
    if (i % 300 === 0) console.log(`frame ${i}/${frames}`);
  }
  ff.stdin.end();
  await once(ff, 'close');
  console.log('done ->', outFile);
}
