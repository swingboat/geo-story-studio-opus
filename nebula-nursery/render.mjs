// Renders 星云都是“恒星的摇篮”吗？ (vertical explainer) frame by frame with canvas and pipes it into ffmpeg.
// Usage: node render.mjs                  -> out/<TITLE>.mp4
//        node render.mjs --still 3.2 7.6  -> build/still_<t>.png previews
import { createCanvas } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { W, H, FPS, C, LOGO, LOGO_BOX, TL, DURATION, S, prog, clamp, easeOut, txt, measure } from './lib.mjs';
import { scenesA, eventsA } from './scenes-a.mjs';
import { scenesB, eventsB } from './scenes-b.mjs';
import { scenesC, eventsC } from './scenes-c.mjs';
import { scenesD, eventsD } from './scenes-d.mjs';
import { buildMusic, buildSfx, writeWav } from './audio.mjs';

const TITLE = '星云都是恒星的摇篮吗';
const SCENES = [...scenesA, ...scenesB, ...scenesC, ...scenesD];
const XF = 0.4;
const SUB_Y = 1530;

// ---------- background: deep space with drifting, twinkling stars ----------
const STARS = [...Array(240)].map((_, i) => {
  const r = (k) => { const x = Math.sin(i * 91.7 + k * 13.3) * 43758.5453; return x - Math.floor(x); };
  return { x: r(1) * W, y: r(2) * H, s: 0.8 + r(3) * 2.2, ph: r(4) * 6.28, sp: 0.6 + r(5) * 2.5, depth: 0.3 + r(6) };
});

function background(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#05051a'); g.addColorStop(0.5, '#120f3d'); g.addColorStop(1, '#07061c');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // the backdrop warms up in the nursery and cools down around the old star
  const warm = prog(t, S('orion1') - 0.5, S('orion1') + 0.5) * (1 - prog(t, S('ring1') - 0.5, S('ring1') + 0.5));
  const tint = [[W * 0.1, H * 0.25, 680, `rgba(150,60,200,${0.14 + 0.08 * warm})`], [W * 0.95, H * 0.62, 760, `rgba(40,140,220,${0.12 - 0.05 * warm})`],
    [W * 0.5, H * 0.45, 600, `rgba(255,100,160,${0.08 * warm})`]];
  for (const [x, y, r, c] of tint) {
    const n = ctx.createRadialGradient(x, y, 0, x, y, r);
    n.addColorStop(0, c); n.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = n; ctx.fillRect(0, 0, W, H);
  }
  for (const s of STARS) {
    const a = 0.35 + 0.65 * Math.abs(Math.sin(t * s.sp + s.ph));
    const y = (s.y + t * 6 * s.depth) % H;
    ctx.fillStyle = `rgba(255,255,255,${a * s.depth})`;
    ctx.beginPath(); ctx.arc(s.x, y, s.s * s.depth, 0, Math.PI * 2); ctx.fill();
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

// ---------- subtitles with a speaker chip for the character voices ----------
const SPEAKER = { orion: ['猎户座大星云', C.nebPink], baby: ['原恒星', C.gold], ring: ['环状星云', C.ring] };
const SPEAKER_BY_ID = { ringHi: ['中心星', C.hot] };

function subtitles(ctx, t) {
  for (const seg of TL.segments)
    seg.cues.forEach((c, i) => {
      const next = seg.cues[i + 1];
      const until = next ? next.start : c.end + 0.3;
      const from = i === 0 ? c.start - 0.08 : c.start;
      if (t < from || t >= until) return;
      const a = (i === 0 ? prog(t, from, c.start + 0.06) : 1) * (next ? 1 : 1 - prog(t, c.end + 0.12, c.end + 0.3));
      const sp = SPEAKER_BY_ID[seg.id] ?? SPEAKER[seg.voice];
      const tw = sp ? measure(ctx, sp[0], 32) + 40 : 0;
      let size = 56;
      while (measure(ctx, c.text, size) + 80 + tw > W - 60) size -= 2;
      const w = measure(ctx, c.text, size) + 80 + tw, x0 = W / 2 - w / 2;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(6,6,28,0.84)';
      ctx.beginPath(); ctx.roundRect(x0, SUB_Y - 48, w, 96, 48); ctx.fill();
      if (sp) {
        ctx.fillStyle = sp[1];
        ctx.beginPath(); ctx.roundRect(x0 + 18, SUB_Y - 26, tw - 8, 52, 26); ctx.fill();
        txt(ctx, sp[0], x0 + 14 + tw / 2, SUB_Y, { size: 32, color: C.space });
      }
      txt(ctx, c.text, x0 + 40 + tw + (w - 80 - tw) / 2, SUB_Y, { size, color: sp ? '#fff1c9' : C.white });
      ctx.restore();
    });
}

function footer(ctx, t) {
  const src = t > S('sum1') - 0.3;
  txt(ctx, src ? '资料：NASA Hubble · NASA Space Place · NASA/ESA Webb' : '原创科普示意 · 非观测照片 · 形状、配色和时间均为示意',
    W / 2, 1640, { size: 28, color: 'rgba(255,255,255,0.45)' });
}

// ---------- scene cross-fades ----------
function drawScene(ctx, t, s, next) {
  if (t < s.from || t > s.to + XF) return;
  let a = s.from > 0 ? easeOut(prog(t, s.from, s.from + XF)) : 1;
  if (next) a *= 1 - prog(t, s.to, s.to + XF);
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = clamp(a);
  s.draw(ctx, t);
  ctx.restore();
}

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

function renderFrame(t) {
  background(ctx, t);
  SCENES.forEach((s, i) => drawScene(ctx, t, s, SCENES[i + 1]));
  footer(ctx, t);
  subtitles(ctx, t);
  brand(ctx, t);
  const fade = 1 - prog(t, 0, 0.3) + prog(t, DURATION - 0.6, DURATION);
  if (fade > 0) {
    ctx.fillStyle = `rgba(4,4,20,${clamp(fade)})`;
    ctx.fillRect(0, 0, W, H);
  }
}

const EVENTS = [
  ...eventsA, ...eventsB, ...eventsC, ...eventsD,
  ...SCENES.slice(1).map((s) => ({ type: 'whoosh', t: s.from - 0.1, d: 0.5, from: 400, to: 1800, amp: 0.45 })),
];

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
    '[1:a]asplit=2[v1][v2];[2:a]volume=0.55[m];[m][v1]sidechaincompress=threshold=0.05:ratio=5:attack=20:release=400[md];' +
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
