// Scene 3: 小宇's flashlight test — straight down gives a small bright spot, tilting stretches it and dims it.
import { W, C, TAU, S, at, prog, lerp, clamp, easeIO, easeOut, pop, txt, around, card, talkLevel, burst } from './lib.mjs';
import { astronaut, astroHand, glow } from './cast.mjs';
import { title, tag } from './props.mjs';
import { torch } from './beam.mjs';

const INK = '#0a0828';
const SX = 600, SY = 1235, R0 = 115, FLAT = 0.42, HEAD = 330, TLEN = 150, KS = 0.7;
const GY0 = 1060, GY1 = 1440, VP = [540, 640];

const elevAt = (t) => lerp(Math.PI / 2, Math.PI / 6, easeIO(prog(t, at('tilt', '斜着') - 0.1, at('tilt', '拉长') + 0.4)));

// Floor seen in perspective, with converging grid lines.
function floor(ctx) {
  ctx.save();
  const k = (y) => (y - VP[1]) / (GY1 - VP[1]);
  const xl = (y) => lerp(VP[0], -60, k(y)), xr = (y) => lerp(VP[0], W + 60, k(y));
  const g = ctx.createLinearGradient(0, GY0, 0, GY1);
  g.addColorStop(0, '#3b2a3f'); g.addColorStop(1, '#6b4a32');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(xl(GY0), GY0); ctx.lineTo(xr(GY0), GY0); ctx.lineTo(xr(GY1), GY1); ctx.lineTo(xl(GY1), GY1); ctx.closePath(); ctx.fill();
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,220,170,0.16)'; ctx.lineWidth = 3;
  for (let i = -8; i <= 8; i++) {
    ctx.beginPath(); ctx.moveTo(VP[0] + i * 6, VP[1]); ctx.lineTo(VP[0] + i * 160, GY1 + 200); ctx.stroke();
  }
  for (let j = 0; j < 9; j++) {
    const y = GY0 + (GY1 - GY0) * Math.pow(j / 8, 1.5);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,230,190,0.5)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(xl(GY0), GY0); ctx.lineTo(xr(GY0), GY0); ctx.stroke();
}

function spot(ctx, rx, ry, bright) {
  ctx.save();
  ctx.translate(SX, SY); ctx.scale(rx / ry, 1);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, ry);
  g.addColorStop(0, `rgba(255,252,225,${bright})`); g.addColorStop(0.75, `rgba(255,224,120,${0.85 * bright})`); g.addColorStop(1, `rgba(255,200,90,${0.15 * bright})`);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, ry, 0, TAU); ctx.fill();
  ctx.restore();
}

function meter(ctx, t, x, y, h, v, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  card(ctx, x - 60, y - 70, 120, h + 140, { fill: 'rgba(8,10,36,0.9)', edge: C.gold, ew: 5, drop: 8 });
  txt(ctx, '亮度', x, y - 30, { size: 36, color: C.gold });
  ctx.fillStyle = '#1d2050'; ctx.beginPath(); ctx.roundRect(x - 26, y, 52, h, 18); ctx.fill();
  const fh = h * v, gr = ctx.createLinearGradient(0, y + h, 0, y);
  gr.addColorStop(0, '#ff9f1c'); gr.addColorStop(1, '#fff3b0');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.roundRect(x - 26, y + h - fh, 52, fh, 18); ctx.fill();
  ctx.restore();
}

function torchScene(ctx, t) {
  const t0 = S('kidTorch'), tOn = S('straight') - 0.15, tTilt = at('tilt', '斜着'), tDim = at('tilt', '变暗'), tWhy = S('kidWhy');
  title(ctx, t, t0 - 0.2, '手电筒实验', null, { size: 92 });
  floor(ctx);
  const el = elevAt(t), on = prog(t, tOn, tOn + 0.08);
  const rx = R0 / Math.sin(el), ry = R0 * FLAT, bright = Math.sin(el);
  // ghost outline of the first, straight-down spot
  const gp = prog(t, tTilt + 0.3, tTilt + 0.8);
  if (gp > 0) {
    ctx.save(); ctx.globalAlpha *= gp; ctx.setLineDash([16, 12]); ctx.strokeStyle = C.gas; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.ellipse(SX, SY, R0, ry, 0, 0, TAU); ctx.stroke(); ctx.restore();
  }
  // torch, cone and spot
  const dx = Math.cos(el), dy = Math.sin(el);
  const hx = SX - dx * HEAD, hy = SY - dy * HEAD, tx = hx - dx * TLEN, ty = hy - dy * TLEN;
  const kin = easeOut(prog(t, t0 - 0.4, t0 + 0.5));
  if (on > 0) {
    ctx.save();
    ctx.globalAlpha *= on;
    const px = -dy, py = dx;
    const cg = ctx.createLinearGradient(hx, hy, SX, SY);
    cg.addColorStop(0, `rgba(255,240,170,${0.55 * bright + 0.1})`); cg.addColorStop(1, `rgba(255,220,110,${0.3 * bright + 0.05})`);
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.moveTo(hx - px * 30, hy - py * 30); ctx.lineTo(SX + rx, SY); ctx.lineTo(SX - rx, SY); ctx.lineTo(hx + px * 30, hy + py * 30); ctx.closePath(); ctx.fill();
    spot(ctx, rx, ry, bright);
    ctx.restore();
  }
  const off = astroHand(t, 0, 0, KS, el);
  const kx = lerp(-250, tx - off[0], kin), ky = ty - off[1];
  if (kin > 0) {
    astronaut(ctx, t, kx, ky, KS, {
      arm: el, talk: talkLevel(t, ['kidTorch', 'kidWhy']), mood: t > tWhy ? 'wow' : t > tOn ? 'starry' : 'happy', look: 0.6, lookY: 1,
      scratch: prog(t, tWhy, tWhy + 0.3),
    });
    torch(ctx, tx, ty, el, TLEN);
  }
  burst(ctx, t, tOn, hx, hy, { n: 8, r: 120, size: 16 });
  // labels for the two spots
  const lp = pop(t, at('straight', '又小'), 0.45) * (1 - prog(t, tTilt - 0.2, tTilt + 0.1));
  around(ctx, SX + 230, SY - 130, lp, lp, () => tag(ctx, SX + 230, SY - 130, '又小又亮', null, { color: '#fff3b0', size: 44 }));
  const dp = pop(t, tDim - 0.1, 0.45);
  around(ctx, SX + 230, SY + 150, dp, dp, () => tag(ctx, SX + 230, SY + 150, '又大又暗', null, { color: C.sky, size: 44 }));
  const sp = pop(t, at('tilt', '拉长'), 0.45);
  around(ctx, SX, SY - 10, sp, sp, () => {
    ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 7; ctx.lineCap = 'round';
    for (const k of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(SX + k * (rx - 10), SY - ry - 40); ctx.lineTo(SX + k * (rx + 40), SY - ry - 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(SX + k * (rx + 40), SY - ry - 40); ctx.lineTo(SX + k * (rx + 20), SY - ry - 58); ctx.moveTo(SX + k * (rx + 40), SY - ry - 40); ctx.lineTo(SX + k * (rx + 20), SY - ry - 22); ctx.stroke();
    }
    ctx.restore();
  });
  meter(ctx, t, 975, 560, 300, on > 0 ? bright : 0, prog(t, tOn - 0.2, tOn + 0.2));
  // 小宇 is puzzled: the light didn't shrink, so where did the brightness go?
  const qp = pop(t, at('kidWhy', '怎么'), 0.45);
  around(ctx, kx + 140, ky - 150, qp, qp, () => txt(ctx, '?', kx + 140, ky - 150 + Math.sin(t * 5) * 6, { size: 110, color: C.gold, stroke: INK, sw: 12, font: 'RoundB' }), 0.2);
}

export const scenes = [
  { id: 'torch', from: S('kidTorch') - 0.3, to: S('beans') - 0.3, draw: torchScene },
];

export const events = [
  { type: 'whoosh', t: S('kidTorch') - 0.4, d: 0.8, from: 300, to: 1600, amp: 0.5 },
  { type: 'tick', t: S('straight') - 0.15, n: 96 },
  { type: 'sparkle', t: at('straight', '又小') },
  { type: 'whoosh', t: at('tilt', '斜着') - 0.1, d: 1.4, from: 1800, to: 500, amp: 0.4 },
  { type: 'boing', t: at('tilt', '拉长') },
  { type: 'note', t: at('tilt', '变暗') - 0.1, n: 67 }, { type: 'note', t: at('tilt', '变暗') + 0.1, n: 60 },
  { type: 'pop', t: at('kidWhy', '怎么'), f: 900 },
];
