// Renders 宇宙地址 (vertical explainer) frame by frame with canvas and pipes it into ffmpeg.
// Usage: node render.mjs                  -> out/<TITLE>.mp4
//        node render.mjs --still 3.2 7.6  -> build/still_<t>.png previews
import { createCanvas } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { W, H, FPS, C, LOGO, LOGO_BOX, TL, DURATION, S, E, at, prog, lerp, clamp, easeIO, easeOut, pop, txt, measure, around, talkLevel, burst } from './lib.mjs';
import { ufo, parcel } from './cast.mjs';
import { scenesA, eventsA } from './scenes-a.mjs';
import { scenesB, eventsB } from './scenes-b.mjs';
import { scenesC, eventsC } from './scenes-c.mjs';
import { buildMusic, buildSfx, writeWav } from './audio.mjs';

const TITLE = '宇宙地址-外星快递送到地球';
const SCENES = [...scenesA, ...scenesB, ...scenesC];
const XF = 0.35; // plain cross-fade
const ZD = 1.5; // zoom-out duration
const CX = 540, CY = 900; // scene focus point
const SUB_Y = 1490;

// ---------- background: deep space with parallax stars, warp streaks while zooming ----------
const STARS = [...Array(260)].map((_, i) => {
  const r = (k) => { const x = Math.sin(i * 91.7 + k * 13.3) * 43758.5453; return x - Math.floor(x); };
  return { x: r(1) * W, y: r(2) * H, s: 0.8 + r(3) * 2.2, ph: r(4) * 6.28, sp: 0.6 + r(5) * 2.5, depth: 0.3 + r(6) };
});

function zoomAmount(t) {
  for (const s of SCENES) if (s.zoom && t >= s.from && t <= s.from + ZD) return Math.sin(Math.PI * prog(t, s.from, s.from + ZD));
  return 0;
}

function background(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#04061a'); g.addColorStop(0.5, '#0d1442'); g.addColorStop(1, '#060820');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const [x, y, r, c] of [[W * 0.05, H * 0.28, 640, 'rgba(120,60,200,0.15)'], [W * 0.98, H * 0.6, 720, 'rgba(40,140,220,0.12)']]) {
    const n = ctx.createRadialGradient(x, y, 0, x, y, r);
    n.addColorStop(0, c); n.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = n; ctx.fillRect(0, 0, W, H);
  }
  const warp = zoomAmount(t);
  for (const s of STARS) {
    const a = 0.35 + 0.65 * Math.abs(Math.sin(t * s.sp + s.ph));
    if (warp > 0.02) {
      // stars stream inward while the camera pulls back
      const dx = s.x - CX, dy = s.y - CY, len = warp * 0.18 * s.depth;
      ctx.strokeStyle = `rgba(200,220,255,${0.7 * s.depth})`; ctx.lineWidth = s.s * s.depth;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - dx * len, s.y - dy * len); ctx.stroke();
    } else {
      ctx.fillStyle = `rgba(255,255,255,${a * s.depth})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.s * s.depth, 0, Math.PI * 2); ctx.fill();
    }
  }
}

// ---------- shipping label HUD: one chip per address level ----------
const LEVELS = [
  ['地球', () => at('plan', '宇宙地址'), C.sky],
  ['地月系', () => at('moon1', '地月系'), '#aab4ff'],
  ['太阳系', () => at('sun1', '太阳系'), C.sun],
  ['银河系', () => at('gal1', '银河系'), C.lilac],
  ['可观测宇宙', () => at('obs1', '可观测'), C.gold],
];
export const LEVEL_TIMES = LEVELS.map(([, f]) => f());

function label(ctx, t) {
  const p = easeOut(prog(t, at('plan', '宇宙地址') - 0.5, at('plan', '宇宙地址') + 0.1));
  const out = 1 - prog(t, S('recap') - 0.6, S('recap') - 0.1);
  if (p <= 0 || out <= 0) return;
  // sits below the corner logo (logo zone ends at y≈153)
  const y0 = lerp(-260, 182, p);
  ctx.save();
  ctx.globalAlpha = out;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.roundRect(52, y0 + 10, 976, 166, 24); ctx.fill();
  ctx.fillStyle = '#fffaf0';
  ctx.beginPath(); ctx.roundRect(50, y0, 980, 166, 24); ctx.fill();
  ctx.fillStyle = C.sunHot;
  ctx.beginPath(); ctx.roundRect(50, y0, 980, 56, [24, 24, 0, 0]); ctx.fill();
  txt(ctx, '宇宙快递 · 收件地址', 86, y0 + 29, { size: 34, align: 'left', color: C.white });
  txt(ctx, '由近到远 →', 740, y0 + 29, { size: 26, align: 'right', color: 'rgba(255,255,255,0.85)' });
  ctx.fillStyle = C.white;
  for (let i = 0; i < 26; i++) ctx.fillRect(770 + i * 9, y0 + 13, i % 3 ? 3 : 6, 30);
  // chips, near → far
  const size = 36, gap = 30, pad = 30;
  const widths = LEVELS.map(([s]) => measure(ctx, s, size) + pad);
  let x = W / 2 - (widths.reduce((a, b) => a + b, 0) + gap * 4) / 2;
  const cy = y0 + 110;
  const cur = LEVEL_TIMES.filter((lt) => t >= lt - 0.1).length - 1;
  LEVELS.forEach(([name, , col], i) => {
    const w = widths[i], lt = LEVEL_TIMES[i], cx = x + w / 2;
    const k = pop(t, lt - 0.1, 0.45);
    ctx.save();
    ctx.strokeStyle = 'rgba(43,26,85,0.25)'; ctx.lineWidth = 3; ctx.setLineDash([8, 7]);
    ctx.beginPath(); ctx.roundRect(x, cy - 34, w, 68, 20); ctx.stroke();
    ctx.restore();
    if (k <= 0.01) txt(ctx, '？', cx, cy, { size: 34, color: 'rgba(43,26,85,0.3)' });
    around(ctx, cx, cy, k, 1, () => {
      ctx.fillStyle = i === cur ? col : 'rgba(43,26,85,0.08)';
      ctx.beginPath(); ctx.roundRect(x, cy - 34, w, 68, 20); ctx.fill();
      txt(ctx, name, cx, cy + 1, { size, color: C.ink });
    }, (1 - clamp(k)) * 0.5);
    if (i < 4) txt(ctx, '›', x + w + gap / 2, cy, { size: 40, color: 'rgba(43,26,85,0.45)' });
    burst(ctx, t, lt, cx, cy, { n: 8, r: 90, size: 14 });
    x += w + gap;
  });
  ctx.restore();
}

// ---------- brand: 地理故事工坊 logo in the top-left corner (AGENTS.md §4) ----------
function brand(ctx, t) {
  const a = easeOut(prog(t, 0.3, 1.0));
  if (a <= 0) return;
  const { sx, sy, sw, sh } = LOGO_BOX;
  const x = 64, y = 76, w = 290, h = (w * sh) / sw;
  // a faint radial shade, not a solid plate, keeps the lettering readable over bright frames
  const g = ctx.createRadialGradient(x + w / 2, y + h / 2, 20, x + w / 2, y + h / 2, 250);
  g.addColorStop(0, `rgba(4,6,26,${0.45 * a})`); g.addColorStop(1, 'rgba(4,6,26,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 480, 260);
  ctx.save();
  ctx.globalAlpha = 0.95 * a;
  ctx.drawImage(LOGO, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

// ---------- the courier: big in the hook, parked in a corner while touring, then swoops off ----------
const ALIEN_LINES = ['alienQ', 'alienS', 'alienG', 'alienB', 'alienO', 'send'];
function courier(ctx, t) {
  const tIn = S('hook') - 0.7, tPark = S('moon1') - 1.2, tBack = S('recap') - 0.3, tGo = at('send', '出发') - 0.1;
  if (t < tIn) return;
  const big = [770, 560, 0.9], corner = [925, 1345, 0.4], mid = [800, 1300, 0.6];
  const fly = easeOut(prog(t, tIn, tIn + 1.0));
  let [x, y, s] = [lerp(1300, big[0], fly), lerp(-200, big[1], fly), big[2]];
  const pk = easeIO(prog(t, tPark, tPark + 1.0));
  if (pk > 0) [x, y, s] = [lerp(big[0], corner[0], pk), lerp(big[1], corner[1], pk), lerp(big[2], corner[2], pk)];
  const bk = easeIO(prog(t, tBack, tBack + 0.8));
  if (bk > 0) [x, y, s] = [lerp(corner[0], mid[0], bk), lerp(corner[1], mid[1], bk), lerp(corner[2], mid[2], bk)];
  const go = prog(t, tGo, tGo + 1.1);
  if (go >= 1) return;
  if (go > 0) {
    const e = go * go;
    x = lerp(mid[0], 1400, e); y = lerp(mid[1], -300, e) - Math.sin(go * Math.PI) * 120; s = lerp(mid[2], 0.3, e);
    ctx.strokeStyle = 'rgba(160,255,200,0.5)'; ctx.lineWidth = 18 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(lerp(mid[0], x, 0.2), lerp(mid[1], y, 0.2)); ctx.lineTo(x, y + 30 * s); ctx.stroke();
  }
  y += Math.sin(t * 2.3) * 12 * s;
  const talk = talkLevel(t, ALIEN_LINES);
  const mood = t > S('alienG') && t < E('alienG') + 0.3 ? 'wow' : 'happy';
  const wave = t > S('send') && t < tGo ? 1 : t > S('alienO') && t < E('alienO') ? 1 : 0;
  ufo(ctx, t, x, y, s, { talk, mood, wave, look: -0.5 });
  // the parcel dangles below until the label is filled in; it is re-attached for the send-off
  const hang = (t < tPark + 0.4) || t > S('send');
  if (hang) {
    const sw = Math.sin(t * 2.6) * 0.12;
    ctx.strokeStyle = 'rgba(220,240,255,0.7)'; ctx.lineWidth = 4 * s;
    ctx.beginPath(); ctx.moveTo(x, y + 50 * s); ctx.lineTo(x + Math.sin(sw) * 120 * s, y + 160 * s); ctx.stroke();
    parcel(ctx, x + Math.sin(sw) * 130 * s, y + 225 * s, 0.85 * s, sw);
  }
}

// ---------- subtitles ----------
const SPEAKER = { alien: ['快递员', '#6fdc78'], earth: ['地球', C.sky], moon: ['月球', '#e6e8f5'] };

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
      ctx.fillStyle = 'rgba(6,8,30,0.82)';
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

function footer(ctx, t) {
  const src = t > S('recap') - 0.3;
  txt(ctx, src ? '资料：NASA Science · 科普示意，不按比例' : '科普示意 · 大小、距离、轨道与速度均不按比例', W / 2, 1584, { size: 28, color: 'rgba(255,255,255,0.45)' });
}

// ---------- scenes with powers-of-ten zoom ----------
// A scene with `zoom: { focus: [x,y], anchor(t) -> [x,y], F }` swallows the previous scene: the previous scene's
// `focus` point lands on `anchor` in the new scene, `F` times smaller, and slides there as the camera pulls back.
function zoomState(s) {
  return (t) => {
    const e = easeIO(prog(t, s.from, s.from + ZD));
    const [ax, ay] = s.zoom.anchor(s.from + ZD);
    const [px, py] = s.zoom.focus ?? [CX, CY];
    return { z: Math.pow(s.zoom.F, 1 - e), qx: lerp(px, ax, e), qy: lerp(py, ay, e), ax, ay, px, py, F: s.zoom.F };
  };
}

function drawScene(ctx, t, s, next) {
  const inZoom = s.zoom && t < s.from + ZD;
  const outZoom = next?.zoom && t > next.from;
  const end = next?.zoom ? next.from + ZD * 0.8 : s.to + XF;
  if (t < s.from || t > end) return;
  ctx.save();
  let a = 1;
  if (inZoom) {
    const { z, qx, qy, ax, ay } = zoomState(s)(t);
    a = prog(t, s.from, s.from + ZD * 0.35);
    ctx.translate(qx, qy); ctx.scale(z, z); ctx.translate(-ax, -ay);
  } else if (!s.zoom && s.from > 0) a = easeOut(prog(t, s.from, s.from + XF));
  if (outZoom) {
    const { z, qx, qy, px, py, F } = zoomState(next)(t);
    a *= 1 - prog(t, next.from + ZD * 0.3, next.from + ZD * 0.8);
    ctx.translate(qx, qy); ctx.scale(z / F, z / F); ctx.translate(-px, -py);
  } else if (next && !next.zoom) a *= 1 - prog(t, s.to, s.to + XF);
  if (a > 0) {
    ctx.globalAlpha = clamp(a);
    s.draw(ctx, t);
  }
  ctx.restore();
}

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

function renderFrame(t) {
  background(ctx, t);
  SCENES.forEach((s, i) => drawScene(ctx, t, s, SCENES[i + 1]));
  label(ctx, t);
  courier(ctx, t);
  footer(ctx, t);
  subtitles(ctx, t);
  brand(ctx, t);
  const fade = 1 - prog(t, 0, 0.3) + prog(t, DURATION - 0.6, DURATION);
  if (fade > 0) {
    ctx.fillStyle = `rgba(4,6,22,${clamp(fade)})`;
    ctx.fillRect(0, 0, W, H);
  }
}

const EVENTS = [
  ...eventsA, ...eventsB, ...eventsC,
  ...SCENES.filter((s) => s.zoom).map((s) => ({ type: 'whoosh', t: s.from, d: ZD, from: 2400, to: 300, amp: 0.8 })),
  ...LEVEL_TIMES.map((lt, i) => ({ type: 'note', t: lt, n: 72 + [0, 4, 7, 12, 16][i] })),
  ...LEVEL_TIMES.map((lt) => ({ type: 'stamp', t: lt - 0.05 })),
  { type: 'whoosh', t: S('hook') - 0.7, d: 1.0, from: 300, to: 1800 },
  { type: 'whoosh', t: at('send', '出发') - 0.1, d: 1.1, from: 400, to: 4000, amp: 1.2 },
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
    '[1:a]asplit=2[v1][v2];[2:a]volume=0.6[m];[m][v1]sidechaincompress=threshold=0.05:ratio=5:attack=20:release=400[md];' +
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
