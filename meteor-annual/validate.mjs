// Checks timeline, layout and science-geometry invariants. `node validate.mjs --video` also probes the MP4.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, FPS, TL, DURATION, TITLE, here, measure } from './lib.mjs';
import { SCENES, EVENTS, renderFrame } from './render.mjs';
import { cometPos, NU0, earthPos, dateTheta, NODE } from './orbit.mjs';
import { LAP_START, LAP_END, lapAngle } from './scenes-c.mjs';

const script = JSON.parse(readFileSync(here('./script.json'), 'utf8'));
assert.equal(script.status, 'approved');
assert.deepEqual(TL.segments.map((s) => s.id), script.segments.map((s) => s.id));
assert.deepEqual(script.storyboard.flatMap((s) => s.segments), script.segments.map((s) => s.id));

const ctx = createCanvas(W, H).getContext('2d');
let cues = 0;
for (const seg of TL.segments) {
  assert(script.voices[seg.voice], `unknown voice ${seg.voice}`);
  assert.equal((seg.captions ?? [seg.text]).join(''), seg.text, `captions of ${seg.id}`);
  for (let i = 1; i < seg.words.length; i++) assert(seg.words[i].start >= seg.words[i - 1].start, `word order in ${seg.id}`);
  for (const c of seg.cues) {
    cues++;
    assert(c.start >= seg.start && c.end <= seg.end + 1e-6 && c.end > c.start, `cue timing ${c.text}`);
    const size = Math.min(56, 900 / measure(ctx, c.text, 1));
    assert(size >= 40, `subtitle too small: ${c.text}`);
  }
}

// scenes tile the whole video without gaps; every sound event lands inside it
assert.equal(SCENES[0].from, 0);
assert.equal(SCENES.at(-1).to, DURATION);
for (let i = 1; i < SCENES.length; i++) assert.equal(SCENES[i].from, SCENES[i - 1].to, `gap before scene ${i}`);
for (const e of EVENTS) assert(e.t >= 0 && e.t < DURATION, `event ${e.type} at ${e.t}`);

// the debris stream pierces Earth's orbital plane at 1 AU, at the mid-August longitude, and nowhere else nearby
const node = cometPos(NU0);
assert(Math.abs(Math.hypot(node[0], node[1]) - 1) < 1e-9 && Math.abs(node[2]) < 1e-9);
const other = cometPos(NU0 + Math.PI);
assert(Math.hypot(other[0], other[1]) > 2.5, 'second node must lie far outside Earth orbit');
const aug = earthPos(dateTheta((31 + 28 + 31 + 30 + 31 + 30 + 31 + 12) / 365));
assert(Math.hypot(aug[0] - node[0], aug[1] - node[1]) < 1e-9, 'mid-August must sit on the crossing');

// one continuous, complete, forward lap that ends where it started
assert(Math.abs(lapAngle(LAP_START) - NODE) < 1e-9);
assert(Math.abs(lapAngle(LAP_END) - NODE - 2 * Math.PI) < 1e-9);
let prev = lapAngle(LAP_START);
for (let i = 1; i <= 200; i++) {
  const a = lapAngle(LAP_START + ((LAP_END - LAP_START) * i) / 200);
  assert(a >= prev && a - prev < 0.12, 'lap must be continuous and forward');
  prev = a;
}

// no text drawn outside a 24px side margin, sampled across every scene
const bad = new Set();
const real = CanvasRenderingContext2DPatch();
for (let i = 0; i < 150; i++) renderFrame((DURATION * (i + 0.5)) / 150);
real.restore();
assert.equal(bad.size, 0, `text outside safe area:\n${[...bad].join('\n')}`);

function CanvasRenderingContext2DPatch() {
  const probe = renderFrame(0).getContext('2d');
  const fill = probe.fillText, stroke = probe.strokeText;
  const check = function (s, x, y) {
    const w = this.measureText(s).width;
    const left = x - (this.textAlign === 'center' ? w / 2 : this.textAlign === 'right' ? w : 0);
    const m = this.getTransform();
    if (Math.abs(m.b) < 1e-6 && Math.abs(m.c) < 1e-6 && this.globalAlpha > 0.05) {
      const a = m.a * left + m.e, b = m.a * (left + w) + m.e;
      if (a < 24 || b > W - 24) bad.add(`${s} [${a.toFixed(0)}, ${b.toFixed(0)}]`);
    }
  };
  probe.fillText = function (s, x, y, ...r) { check.call(this, s, x, y); return fill.call(this, s, x, y, ...r); };
  probe.strokeText = function (s, x, y, ...r) { check.call(this, s, x, y); return stroke.call(this, s, x, y, ...r); };
  return { restore: () => { probe.fillText = fill; probe.strokeText = stroke; } };
}

for (const f of ['scenes-a.mjs', 'scenes-b.mjs', 'scenes-c.mjs', 'scenes-d.mjs', 'render.mjs', 'orbit.mjs', 'chars.mjs']) {
  assert(!/科普示意|非观测照片|仅作示意|不按比例/.test(readFileSync(here(`./${f}`), 'utf8')), `disclaimer text in ${f}`);
}
const srt = readFileSync(here(`./out/${TITLE}.srt`), 'utf8');
assert.equal((srt.match(/ --> /g) || []).length, cues);
console.log(`PASS: ${TL.segments.length} lines / ${cues} cues, ${SCENES.length} scenes, ${EVENTS.length} sound events, single crossing at mid-August, full lap ${LAP_START.toFixed(2)}–${LAP_END.toFixed(2)}s, 150 frames inside safe area`);

if (process.argv.includes('--video')) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_streams', '-of', 'json', here(`./out/${TITLE}.mp4`)], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const streams = JSON.parse(r.stdout).streams;
  const v = streams.find((s) => s.codec_type === 'video'), a = streams.find((s) => s.codec_type === 'audio');
  assert.equal(v.codec_name, 'h264'); assert.equal(v.pix_fmt, 'yuv420p');
  assert.equal(v.width, W); assert.equal(v.height, H); assert.equal(v.avg_frame_rate, `${FPS}/1`);
  assert.equal(a.codec_name, 'aac'); assert.equal(a.channels, 2); assert.equal(a.sample_rate, '48000');
  assert(Math.abs(Number(v.duration) - DURATION) < 0.06 && Math.abs(Number(a.duration) - DURATION) < 0.06);
  console.log(`PASS: H.264 ${W}x${H} ${FPS}fps + AAC stereo 48kHz, ${Number(v.duration).toFixed(2)}s`);
}
