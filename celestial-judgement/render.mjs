// Renders the vertical "天体认证处" explainer frame by frame with canvas and pipes it into ffmpeg.
// Usage: node render.mjs                  -> out/哪些算天体.mp4
//        node render.mjs --still 3.2 7.6  -> build/still_<t>.png previews
import { createCanvas } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { W, H, FPS, C, ZH, SANS, TL, DURATION, S, at, prog, lerp, clamp, easeOut, pop, txt, measure, around, rand, card, LOGO, LOGO_BOX, SPEAKER } from './lib.mjs';
import { tick } from './props.mjs';
import { buildMusic, buildSfx, writeWav } from './audio.mjs';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const TITLE = '哪些算天体';
const XF = 0.3; // cross-fade between scenes
const CAP_Y = 1460; // subtitles sit above Douyin's bottom caption/UI area

// every scenes-*.mjs module exports { scenes, events }
const SCENES = [], EVENTS = [];
for (const f of readdirSync(here('./')).filter((f) => /^scenes-.*\.mjs$/.test(f)).sort()) {
  const m = await import(`./${f}`);
  SCENES.push(...m.scenes);
  EVENTS.push(...m.events);
}

// ---------- background: deep night sky with twinkling stars ----------
const STARS = [...Array(220)].map((_, i) => ({
  x: rand(i * 3 + 1) * W, y: rand(i * 3 + 2) * H, s: 0.8 + rand(i * 7) * 2.6, ph: rand(i * 5) * 6.28, sp: 0.6 + rand(i * 11) * 2.5, depth: 0.3 + rand(i * 13),
}));

function background(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.bg0); g.addColorStop(0.6, C.bg1); g.addColorStop(1, '#2a2468');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  for (const [x, y, r, c] of [[W * 0.1, H * 0.3, 600, 'rgba(200,60,160,0.14)'], [W * 0.95, H * 0.6, 650, 'rgba(40,140,220,0.13)']]) {
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

// ---------- brand: 地理故事工坊 logo in the top-left corner (AGENTS.md §4) ----------
function brand(ctx, t) {
  const a = easeOut(prog(t, 0.3, 1.0)) * (1 - prog(t, S('outro') - 0.4, S('outro')));
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

// ---------- scoreboard: five applicants and their verdicts ----------
const BOARD = [
  { name: '月球', id: 'moonHi', verdict: () => at('moonOk', '通过'), ok: true },
  { name: '星云', id: 'nebHi', verdict: () => at('nebOk', '通过'), ok: true },
  { name: '流星', id: 'metHi', verdict: () => at('split', '现象'), label: '现象' },
  { name: '黑子', id: 'spotHi', verdict: () => at('spotPart', '局部'), label: '局部' },
  { name: '卫星', id: 'satHi', verdict: () => at('satOrbit', '人造天体'), label: '看状态' },
];
const NEXT = ['nebHi', 'metHi', 'spotHi', 'satHi', 'quiz'];

function scoreboard(ctx, t) {
  const a = prog(t, S('moonHi') - 0.4, S('moonHi')) * (1 - prog(t, S('quiz') - 0.4, S('quiz') - 0.1));
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  BOARD.forEach((b, i) => {
    const x = 128 + i * 206, y = 246;
    const active = t >= S(b.id) - 0.35 && t < S(NEXT[i]) - 0.35;
    const tv = b.verdict(), done = t >= tv;
    const sc = (active ? 1.08 + 0.03 * Math.sin(t * 6) : 1) * (done ? lerp(1.35, 1, easeOut(prog(t, tv, tv + 0.35))) : 1);
    around(ctx, x, y, sc, 1, () => {
      const fill = done ? (b.ok ? C.ok : C.amber) : active ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)';
      card(ctx, x - 92, y - 40, 184, 80, { fill, edge: active ? C.gold : 'rgba(255,255,255,0.35)', ew: active ? 6 : 3, drop: 0, r: 40 });
      if (done && b.ok) {
        txt(ctx, b.name, x - 22, y + 2, { size: 40, color: C.ink });
        tick(ctx, x + 50, y, 0.5, '#178a5a');
      } else if (done) {
        txt(ctx, `${b.name}·${b.label}`, x, y + 2, { size: b.label.length > 2 ? 30 : 36, color: C.ink });
      } else {
        txt(ctx, b.name, x, y + 2, { size: 40, color: active ? C.white : 'rgba(255,255,255,0.6)' });
      }
    });
  });
  ctx.restore();
}

// ---------- subtitles with a speaker chip for the character voices ----------
function subtitles(ctx, t) {
  for (const seg of TL.segments)
    seg.cues.forEach((c, i) => {
      const next = seg.cues[i + 1];
      const until = next ? next.start : c.end + 0.3;
      const from = i === 0 ? c.start - 0.08 : c.start;
      if (t < from || t >= until) return;
      const a = (i === 0 ? prog(t, from, c.start + 0.06) : 1) * (next ? 1 : 1 - prog(t, c.end + 0.12, c.end + 0.3));
      const who = SPEAKER[seg.voice];
      const size = 60;
      const w = measure(ctx, c.text, size, ZH);
      ctx.save();
      ctx.globalAlpha = a;
      if (who) {
        const tw = measure(ctx, who[0], 34, SANS) + 40;
        ctx.fillStyle = who[1];
        ctx.beginPath(); ctx.roundRect(W / 2 - tw / 2, CAP_Y - 100, tw, 52, 26); ctx.fill();
        txt(ctx, who[0], W / 2, CAP_Y - 73, { size: 34, font: SANS, color: C.ink });
      }
      const sc = Math.min(1, 960 / w);
      around(ctx, W / 2, CAP_Y, sc, 1, () =>
        txt(ctx, c.text, W / 2, CAP_Y, { size, color: who ? '#ffe9a8' : C.white, stroke: '#0a0a1e', sw: 14 }));
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
  scoreboard(ctx, t);
  brand(ctx, t);
  subtitles(ctx, t);
  txt(ctx, '资料：NASA · 人教版《地理 必修第一册》', W / 2, 1860, { size: 26, font: SANS, color: 'rgba(255,255,255,0.4)' });
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
