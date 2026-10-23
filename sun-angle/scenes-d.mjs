// Scenes 6–7: 小宇's butter-on-toast analogy, then "angle isn't the whole story" — day length and clouds join in.
import { W, C, TAU, S, at, prog, lerp, clamp, easeIO, easeOut, pop, txt, around, card, talkLevel, burst } from './lib.mjs';
import { astronaut, glow, face } from './cast.mjs';
import { title, tag, stamp } from './props.mjs';
import { cloudBuddy } from './waves.mjs';
import { clockIcon, bean } from './beam.mjs';

const INK = '#0a0828';
const BUTTER = 120 * 76; // the pat's side-view "amount": width × thickness stays constant while it spreads

function butterScene(ctx, t) {
  const t0 = S('kidButter'), tPat = at('kidButter', '黄油'), tBig = at('kidButter', '大面包'), tThin = at('kidButter', '薄薄');
  title(ctx, t, t0 - 0.1, '小宇的比喻', '黄油抹面包', { size: 92 });
  const grow = easeIO(prog(t, tBig - 0.3, tBig + 0.6)), spread = easeIO(prog(t, at('kidButter', '抹在') - 0.1, tThin));
  const bw = lerp(300, 800, grow), bx = W / 2 - bw / 2, by = 900, bh = 150;
  // bread slice (side view) with a face
  const bp = pop(t, t0 - 0.1, 0.5);
  around(ctx, W / 2, by + bh / 2, bp, bp, () => {
    ctx.fillStyle = '#c47a35'; ctx.strokeStyle = INK; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 40); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f7dca4';
    ctx.beginPath(); ctx.roundRect(bx + 18, by + 16, bw - 36, bh - 32, 28); ctx.fill();
    face(ctx, t, W / 2, by + bh / 2 + 6, 46, { mood: t > tThin ? 'sad' : 'happy', ink: '#5a2e0e' });
  });
  // butter: a thick pat that spreads into a thin layer of the same amount
  const pp = pop(t, tPat - 0.15, 0.45);
  if (pp > 0) {
    const w = lerp(120, bw - 40, spread), h = BUTTER / w, x = W / 2 - w / 2;
    around(ctx, W / 2, by, pp, pp, () => {
      ctx.fillStyle = '#ffe066'; ctx.strokeStyle = INK; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.roundRect(x, by - h + 4, w, h, Math.min(16, h / 2)); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.roundRect(x + 10, by - h + 10, Math.min(40, w * 0.3), Math.max(3, h * 0.18), 4); ctx.fill();
      if (spread < 0.5) face(ctx, t, W / 2, by - h / 2 + 6, 30 * (1 - spread * 2), { mood: 'happy', ink: '#7a5200' });
    });
    // the butter knife rides the spreading edge
    const kp = prog(t, at('kidButter', '抹在') - 0.2, at('kidButter', '抹在')) * (1 - prog(t, tThin + 0.2, tThin + 0.5));
    if (kp > 0) {
      const kx = W / 2 + w / 2 + 10, ky = by - h - 6;
      ctx.save(); ctx.globalAlpha *= kp; ctx.translate(kx, ky); ctx.rotate(-0.35 + Math.sin(t * 14) * 0.08);
      ctx.fillStyle = '#d9dfee'; ctx.strokeStyle = INK; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.roundRect(-10, -20, 150, 30, 14); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#8a5a3a'; ctx.beginPath(); ctx.roundRect(130, -24, 120, 38, 16); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  }
  const sp = pop(t, tThin, 0.5);
  stamp(ctx, W / 2, 680, '薄薄一层！', sp, { color: C.gold, size: 76 });
  // what maps to what
  const mp = pop(t, tBig, 0.5);
  around(ctx, W / 2, 1160, mp, mp, () => {
    tag(ctx, 330, 1160, '黄油 = 能量', null, { color: C.gold, size: 44 });
    tag(ctx, 750, 1160, '面包 = 地面', null, { color: '#f7dca4', size: 44 });
  });
  const kin = easeOut(prog(t, t0 - 0.5, t0 + 0.3));
  astronaut(ctx, t, lerp(-200, 170, kin), 1290, 0.55, { talk: talkLevel(t, ['kidButter']), mood: t > tThin ? 'starry' : 'happy', look: 1, wave: prog(t, tThin, tThin + 0.3) });
}

// ---------- other factors ----------
function angleIcon(ctx, t, x, y) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(255,214,90,0.95)'; ctx.lineWidth = 9;
  for (let k = -1; k <= 1; k++) {
    const gx = x + 10 + k * 34;
    ctx.beginPath(); ctx.moveTo(gx - 95, y - 15); ctx.lineTo(gx - 6, y + 36); ctx.stroke();
  }
  ctx.strokeStyle = '#c47a35'; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(x - 70, y + 44); ctx.lineTo(x + 70, y + 44); ctx.stroke();
  ctx.restore();
}

const FACTORS = [
  ['照射角度', '能量集中，还是摊开', C.pink, 'butNot', '照射'],
  ['日照时长', '太阳照了多长时间', C.sky, 'hours', '多长时间'],
  ['云量', '改变照到地面的阳光', '#e6ecff', 'cloudHi', '云量'],
];

function factorScene(ctx, t) {
  const t0 = S('butNot'), tTo = S('together'), tHot = at('together', '放在');
  title(ctx, t, t0 - 0.1, '不过……', '角度不能单独决定气温', { size: 92 });
  FACTORS.forEach(([s, sub, col, id, w], i) => {
    const y = 500 + i * 210, p = pop(t, at(id, w) - 0.25, 0.5);
    const hi = 1 + 0.04 * Math.sin(t * 6) * prog(t, tHot, tHot + 0.3);
    around(ctx, W / 2, y + 90, p * hi, p, () => {
      card(ctx, 110, y, 860, 180, { fill: 'rgba(8,10,36,0.9)', edge: col, ew: 6, drop: 10 });
      if (i === 0) angleIcon(ctx, t, 220, y + 70);
      if (i === 1) clockIcon(ctx, 220, y + 90, 58, prog(t, at('hours', '太阳'), S('cloudHi')) * 2, C.sky);
      txt(ctx, s, 330, y + 62, { size: 58, color: '#fff', align: 'left' });
      txt(ctx, sub, 330, y + 130, { size: 36, color: col, align: 'left' });
    });
  });
  // the cloud bounces in and speaks for itself
  const cp = pop(t, S('cloudHi') - 0.3, 0.6);
  if (cp > 0) {
    const cx = i2(t), cy = 1010 + Math.sin(t * 2) * 8;
    around(ctx, cx, cy, cp, cp, () => cloudBuddy(ctx, t, cx, cy, 70, { talk: talkLevel(t, ['cloudHi']), mood: 'happy', look: -0.5, puff: prog(t, at('cloudHi', '我'), at('cloudHi', '我') + 0.2) * (1 - prog(t, at('cloudHi', '我') + 0.2, at('cloudHi', '我') + 0.5)) }));
  }
  // a sun peeking over the time card
  const sp = pop(t, at('hours', '太阳') - 0.2, 0.5);
  if (sp > 0) {
    const a = Math.PI + prog(t, at('hours', '太阳'), S('cloudHi')) * Math.PI;
    const sx = 800 + Math.cos(a) * 110, sy = 820 + Math.sin(a) * 70;
    around(ctx, sx, sy, sp, sp, () => {
      glow(ctx, sx, sy, 10, 70, 'rgba(255,190,60,0.6)');
      ctx.fillStyle = C.sun; ctx.strokeStyle = INK; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(sx, sy, 32, 0, TAU); ctx.fill(); ctx.stroke();
      face(ctx, t, sx, sy + 3, 20, { ink: '#7a2e0e' });
    });
  }
  // put them together
  const jp = pop(t, at('together', '实际') - 0.1, 0.55);
  around(ctx, W / 2, 1290, jp, jp, () => {
    card(ctx, 160, 1180, 760, 220, { fill: 'rgba(40,16,40,0.94)', edge: C.gold, ew: 7, drop: 12 });
    txt(ctx, '实际有多热？', W / 2, 1250, { size: 62, color: C.gold });
    txt(ctx, '这些条件一起看', W / 2, 1335, { size: 44, color: '#fff' });
  });
  if (jp > 0) {
    ctx.save(); ctx.globalAlpha *= clamp(jp); ctx.strokeStyle = C.gold; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.setLineDash([4, 18]); ctx.lineDashOffset = -t * 60;
    for (const y of [590, 800, 1010]) { ctx.beginPath(); ctx.moveTo(990, y); ctx.quadraticCurveTo(1060, (y + 1290) / 2, 930, 1290); ctx.stroke(); }
    ctx.restore();
  }
  burst(ctx, t, tHot, W / 2, 1290, { n: 12, r: 280 });
}
const i2 = (t) => 820 + Math.sin(t * 1.3) * 10;

export const scenes = [
  { id: 'butter', from: S('kidButter') - 0.3, to: S('butNot') - 0.3, draw: butterScene },
  { id: 'factors', from: S('butNot') - 0.3, to: S('sum') - 0.3, draw: factorScene },
];

export const events = [
  { type: 'boing', t: at('kidButter', '黄油') - 0.15 },
  { type: 'scribble', t: at('kidButter', '抹在') - 0.1, d: 1.6 },
  { type: 'whoosh', t: at('kidButter', '大面包') - 0.3, d: 0.8, from: 500, to: 2200, amp: 0.35 },
  { type: 'stamp', t: at('kidButter', '薄薄') },
  { type: 'slam', t: S('butNot') },
  ...FACTORS.map(([, , , id, w], i) => ({ type: 'pop', t: at(id, w) - 0.2, f: 560 + i * 140 })),
  { type: 'tick', t: at('hours', '时间'), n: 88 },
  { type: 'boing', t: S('cloudHi') - 0.2 },
  { type: 'ding', t: at('together', '实际'), n: 81 },
  { type: 'tada', t: at('together', '放在'), amp: 0.7 },
];
