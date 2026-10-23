// Renders the 恒星/行星/卫星 vertical explainer frame by frame with canvas and pipes it into ffmpeg.
// Usage: node render.mjs                  -> out/<TITLE>.mp4
//        node render.mjs --still 3.2 7.6  -> build/still_<t>.png previews
import { createCanvas } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { W, H, FPS, C, ZH, TL, DURATION, S, E, at, prog, lerp, clamp, easeOut, txt, measure, card } from './lib.mjs';
import { officeSign, bulb, orbitIcon } from './props.mjs';
import { scenesA, eventsA } from './scenes-a.mjs';
import { scenesB, eventsB } from './scenes-b.mjs';
import { scenesC, eventsC } from './scenes-c.mjs';
import { scenesD, eventsD } from './scenes-d.mjs';
import { buildMusic, buildSfx, writeWav } from './audio.mjs';

const TITLE = '恒星行星卫星-宇宙身份登记处';
const SCENES = [...scenesA, ...scenesB, ...scenesC, ...scenesD];
const EVENTS = [...eventsA, ...eventsB, ...eventsC, ...eventsD];
const XF = 0.35;
const SUB_Y = 1480;

// ---------- background ----------
const STARS = [...Array(220)].map((_, i) => {
  const r = (k) => { const x = Math.sin(i * 91.7 + k * 13.3) * 43758.5453; return x - Math.floor(x); };
  return { x: r(1) * W, y: r(2) * H, s: 0.8 + r(3) * 2.4, ph: r(4) * 6.28, sp: 0.6 + r(5) * 2.5, depth: 0.3 + r(6) };
});

function background(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#060a24'); g.addColorStop(0.55, '#121a52'); g.addColorStop(1, '#080c2a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const [x, y, r, c] of [[W * 0.1, H * 0.3, 620, 'rgba(120,60,200,0.16)'], [W * 0.95, H * 0.62, 700, 'rgba(40,140,220,0.13)']]) {
    const n = ctx.createRadialGradient(x, y, 0, x, y, r);
    n.addColorStop(0, c); n.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = n; ctx.fillRect(0, 0, W, H);
  }
  for (const s of STARS) {
    const y = ((s.y + t * 8 * s.depth) % H + H) % H;
    const a = 0.35 + 0.65 * Math.abs(Math.sin(t * s.sp + s.ph));
    ctx.fillStyle = `rgba(255,255,255,${a * s.depth})`;
    ctx.beginPath(); ctx.arc(s.x, y, s.s * s.depth, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------- office header: sign + the two checks, highlighted while they are being asked ----------
const LIGHT_ON = [['sunQ', 'sunA'], ['earthL', 'earthIR2'], ['moonHi', 'moonLight']];
const ORBIT_ON = [['earthQ', 'earthA'], ['moonQ', 'moonA']];
const during = (t, list) => list.some(([a, b]) => t >= S(a) - 0.2 && t <= E(b) + 0.3);

function header(ctx, t) {
  const p = prog(t, at('open', '宇宙') - 0.3, at('open', '开张'));
  const out = 1 - prog(t, S('sum') - 0.6, S('sum') - 0.2);
  if (p <= 0 || out <= 0) return;
  ctx.save();
  ctx.globalAlpha = out;
  officeSign(ctx, t, W / 2, 250, p);
  const chips = [['光从哪来？', S('sunHi') - 0.5, during(t, LIGHT_ON), 'bulb'], ['谁绕谁转？', S('sunHi') - 0.3, during(t, ORBIT_ON), 'orbit']];
  chips.forEach(([label, t0, hot, icon], i) => {
    const a = easeOut(prog(t, t0 - 0.1, t0 + 0.3));
    if (a <= 0) return;
    const x = 290 + i * 500, y = 400, sc = hot ? 1.08 + 0.03 * Math.sin(t * 8) : 1;
    ctx.save();
    ctx.globalAlpha *= a * (hot ? 1 : 0.75);
    ctx.translate(x, y); ctx.scale(sc, sc); ctx.translate(-x, -y);
    card(ctx, x - 210, y - 44, 420, 88, { fill: hot ? 'rgba(255,201,60,0.95)' : 'rgba(255,255,255,0.1)', edge: 'rgba(255,255,255,0.35)', ew: hot ? 0 : 3, drop: 0, r: 44 });
    if (icon === 'bulb') bulb(ctx, x - 140, y + 2, 0.62, hot ? 1 : 0.3);
    else orbitIcon(ctx, t, x - 140, y, 0.7);
    txt(ctx, `${i + 1}. ${label}`, x + 30, y + 2, { size: 44, color: hot ? C.ink : C.white });
    ctx.restore();
  });
  ctx.restore();
}

// ---------- subtitles ----------
const SPEAKER = { sun: ['太阳', C.sun], earth: ['地球', C.sky], moon: ['月球', '#e6e8f5'], sat: ['人造卫星', '#f0c040'] };

function subtitles(ctx, t) {
  for (const seg of TL.segments)
    seg.cues.forEach((c, i) => {
      const next = seg.cues[i + 1];
      const until = next ? next.start : c.end + 0.3;
      const from = i === 0 ? c.start - 0.08 : c.start;
      if (t < from || t >= until) return;
      const a = (i === 0 ? prog(t, from, c.start + 0.06) : 1) * (next ? 1 : 1 - prog(t, c.end + 0.12, c.end + 0.3));
      const sp = SPEAKER[seg.voice];
      const tw = sp ? measure(ctx, sp[0], 34) + 40 : 0;
      let size = 56;
      while (measure(ctx, c.text, size) + 80 + tw > W - 60) size -= 2;
      const w = measure(ctx, c.text, size) + 80 + tw, x0 = W / 2 - w / 2;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(6,8,30,0.8)';
      ctx.beginPath(); ctx.roundRect(x0, SUB_Y - 48, w, 96, 48); ctx.fill();
      if (sp) {
        ctx.fillStyle = sp[1];
        ctx.beginPath(); ctx.roundRect(x0 + 18, SUB_Y - 26, tw - 8, 52, 26); ctx.fill();
        txt(ctx, sp[0], x0 + 14 + tw / 2, SUB_Y, { size: 34, color: C.space });
      }
      txt(ctx, c.text, x0 + 40 + tw + (w - 80 - tw) / 2, SUB_Y, { size, color: sp ? '#fff1c9' : C.white });
      ctx.restore();
    });
}

function footer(ctx) {
  txt(ctx, '科普示意 · 大小、距离不按比例 · 卫星指天然卫星', W / 2, 1572, { size: 28, color: 'rgba(255,255,255,0.45)' });
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
    dx += Math.sin(t * 95) * k; dy += Math.cos(t * 81) * k;
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
    ctx.translate(W / 2, 800); ctx.scale(sc, sc); ctx.translate(-W / 2, -800);
    s.draw(ctx, t);
    ctx.restore();
  }
  header(ctx, t);
  ctx.restore();
  footer(ctx);
  subtitles(ctx, t);
  const fade = 1 - prog(t, 0, 0.3) + prog(t, DURATION - 0.6, DURATION);
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
    '[1:a]asplit=2[v1][v2];[2:a]volume=0.7[m];[m][v1]sidechaincompress=threshold=0.05:ratio=5:attack=20:release=400[md];' +
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
