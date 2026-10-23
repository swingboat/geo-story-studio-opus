// Scene 4: an old star gently sheds its outer layers -> the Ring Nebula; plus the "planetary nebula ≠ planets" gag.
import { W, C, TAU, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, around, burst, arrow, shakeOf, talkLevel } from './lib.mjs';
import { oldStar, ringNebula, tag, glow } from './cast.mjs';
import { title } from './scenes-a.mjs';

const X = 540, Y = 860;

// life timeline: 诞生 → 壮年 → 晚年, with a pointer that slides to 晚年
function lifeBar(ctx, t, a, tLate) {
  if (a <= 0) return;
  const y = 1330, x0 = 220, x1 = 860;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  [['诞生', x0, C.gold], ['壮年', (x0 + x1) / 2, '#ffe08a'], ['晚年', x1, C.ringOut]].forEach(([s, x, col]) => {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(x, y, 16, 0, TAU); ctx.fill();
    txt(ctx, s, x, y + 52, { size: 38, color: col });
  });
  const px = lerp(x0, x1, easeIO(prog(t, tLate - 0.6, tLate + 0.2)));
  ctx.fillStyle = C.white;
  ctx.beginPath(); ctx.moveTo(px, y - 22); ctx.lineTo(px - 18, y - 52); ctx.lineTo(px + 18, y - 52); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function ringScene(ctx, t) {
  const t0 = S('ring1') - 0.35, tLate = at('ring1', '晚年');
  const tEx = at('ring2', '环状星云'), tOrig = at('ring2', '原来的恒星'), tOut = at('ring2', '向外抛出'), tLayer = at('ring2', '外层物质');
  const tHi = S('ringHi'), tCoat = at('ringHi', '外衣');
  const tName = at('name', '行星状星云'), tNo = at('name', '没关系');
  title(ctx, t, t0, '有些，来自恒星晚年', '环状星云 · 也叫行星状星云');

  // morph: big old star -> shells drift outward -> ring with a small hot central star
  const m = easeIO(prog(t, tOut - 0.2, tLayer + 0.8));
  const ra = clamp(prog(t, tOut + 0.6, tLayer + 0.9));
  const starA = 1 - prog(t, tLayer + 0.3, tLayer + 0.9);
  const enter = pop(t, t0 + 0.1, 0.6);
  if (starA > 0) {
    const [sx, sy] = shakeOf(t, tOut - 0.15, 8, 0.6);
    around(ctx, X, Y, enter, starA, () => oldStar(ctx, t, X + sx, Y + sy, lerp(230, 70, m), {
      talk: 0, mood: t > tOut - 0.2 && t < tOut + 0.6 ? 'wow' : 'happy', puff: prog(t, tOut - 0.3, tOut) * (1 - m),
    }));
  }
  // expanding shells of outer layers (a gentle puff, not an explosion)
  for (let k = 0; k < 3; k++) {
    const p = prog(t, tOut + k * 0.45, tOut + k * 0.45 + 2.6);
    if (p <= 0) continue;
    const r = lerp(220, 300 + k * 40, easeOut(p));
    const a = Math.sin(Math.PI * Math.min(1, p * 1.2)) * (1 - ra * 0.7);
    if (a <= 0) continue;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = ['rgba(255,122,89,0.55)', 'rgba(255,200,120,0.5)', 'rgba(127,224,255,0.45)'][k];
    ctx.lineWidth = 38 - k * 8;
    ctx.beginPath(); ctx.ellipse(X, Y, r, r * 0.86, 0, 0, TAU); ctx.stroke();
    ctx.restore();
  }
  const outA = fadeIn(t, tOut, 0.3) * (1 - prog(t, tHi - 0.3, tHi));
  if (outA > 0) {
    ctx.save();
    ctx.globalAlpha *= outA;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + 0.2, p = (t * 0.8 + i * 0.13) % 1;
      const r1 = 330 + p * 60;
      arrow(ctx, X + Math.cos(a) * r1, Y + Math.sin(a) * r1 * 0.86, X + Math.cos(a) * (r1 + 70), Y + Math.sin(a) * (r1 + 70) * 0.86, { color: C.ringOut, w: 7, head: 22 });
    }
    ctx.restore();
  }
  ringNebula(ctx, t, X, Y, lerp(240, 330, ra), {
    a: ra, starR: lerp(70, 64, ra), faceA: 1, talk: talkLevel(t, ['ringHi']),
    mood: t > tNo - 0.1 && t < E('name') + 0.3 ? 'grumpy' : 'happy',
  });

  // labels
  const oA = pop(t, tOrig, 0.4) * (1 - prog(t, tOut + 0.4, tOut + 0.8));
  around(ctx, X, Y + 310, oA, oA, () => tag(ctx, X, Y + 310, '原来的恒星', '演化到了晚年', { color: C.ringOut, size: 48 }));
  const lA = pop(t, tLayer, 0.4) * (1 - prog(t, tHi - 0.3, tHi));
  around(ctx, X, 1340, lA, lA, () => tag(ctx, X, 1340, '外层物质，慢慢向外散开', '不是超新星爆炸', { color: C.ringOut, size: 46 }));
  const exA = pop(t, tEx, 0.4) * (1 - prog(t, tOrig - 0.3, tOrig));
  around(ctx, X, Y + 310, exA, exA, () => tag(ctx, X, Y + 310, '例子：环状星云', null, { color: C.ring, size: 48 }));
  lifeBar(ctx, t, fadeIn(t, t0 + 0.3, 0.4) * (1 - prog(t, tEx - 0.3, tEx)), tLate);

  // ringHi: the coat
  const cA = pop(t, tCoat - 0.2, 0.45) * (1 - prog(t, tName - 0.4, tName - 0.1));
  around(ctx, 860, 520, cA, cA, () => {
    tag(ctx, 860, 520, '外衣 = 外层物质', null, { color: C.gold, size: 42 });
    arrow(ctx, 820, 570, 760, 640, { color: C.gold, w: 7, head: 24 });
  });
  const hA = pop(t, tHi, 0.4) * (1 - prog(t, tName - 0.4, tName - 0.1));
  around(ctx, X, Y + 370, hA, hA, () => tag(ctx, X, Y + 370, '中心星', '留下的高温核心', { color: C.hot, size: 40 }));

  // the name gag: "planetary" nebula — but the planet gets kicked out
  const nA = pop(t, tName, 0.4) * (1 - prog(t, E('name') + 0.3, E('name') + 0.6));
  if (nA > 0) {
    around(ctx, X, 1330, nA, nA, () => {
      ctx.fillStyle = 'rgba(8,10,36,0.88)';
      ctx.beginPath(); ctx.roundRect(160, 1270, 760, 120, 30); ctx.fill();
      ctx.strokeStyle = C.ring; ctx.lineWidth = 4; ctx.stroke();
      txt(ctx, '“行星”状星云', 400, 1330, { size: 60, color: C.ring });
      txt(ctx, '≠', 680, 1330, { size: 70, color: C.white });
    });
    // little planet that pops in next to the label, then gets crossed out and boings away
    const pIn = pop(t, tName + 0.3, 0.4), kick = prog(t, tNo + 0.4, tNo + 1.2);
    const px = lerp(830, 1250, kick * kick), py = 1330 - Math.sin(kick * Math.PI) * 300;
    around(ctx, px, py, pIn * nA, 1, () => {
      ctx.fillStyle = '#ffb36b';
      ctx.beginPath(); ctx.arc(px, py, 44, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#ffe1b8'; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.ellipse(px, py, 76, 18, -0.3, 0, TAU); ctx.stroke();
      const xA = pop(t, tNo, 0.3);
      if (xA > 0) {
        ctx.strokeStyle = C.no; ctx.lineWidth = 14 * xA; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(px - 50, py - 50); ctx.lineTo(px + 50, py + 50); ctx.moveTo(px + 50, py - 50); ctx.lineTo(px - 50, py + 50); ctx.stroke();
      }
    }, kick * 6);
    const hint = fadeIn(t, tNo + 0.6, 0.4) * nA;
    if (hint > 0) txt(ctx, '只是早年望远镜里看着像行星的圆面', X, 1440, { size: 34, color: `rgba(255,255,255,${0.8 * hint})` });
  }
}

export const scenesC = [{ id: 'ring', from: S('ring1') - 0.35, to: S('sum1') - 0.3, draw: ringScene }];

export const eventsC = [
  { type: 'note', t: at('ring1', '晚年'), n: 60 },
  { type: 'ding', t: at('ring2', '环状星云'), n: 81 },
  { type: 'whoosh', t: at('ring2', '向外抛出'), d: 1.6, from: 900, to: 250, amp: 0.8 },
  { type: 'sparkle', t: at('ring2', '外层物质') + 0.6 },
  { type: 'pop', t: at('ringHi', '外衣') - 0.2, f: 800 },
  { type: 'ding', t: at('name', '行星状星云'), n: 88 },
  { type: 'buzz', t: at('name', '没关系') },
  { type: 'boing', t: at('name', '没关系') + 0.4 },
];
