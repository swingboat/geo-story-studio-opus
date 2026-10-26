// Scenes B: the size ruler — all eight planets drawn to one scale (Earth = 1), Jupiter = 11 Earths, textbook groups.
import { C, NUM, SANS, S, at, prog, lerp, easeOut, easeIn, pop, fadeIn, txt, around, burst, talkLevel } from './lib.mjs';
import { planet, P, glow } from './bodies.mjs';

const K = 15; // px of radius per Earth diameter, so every disc below shares one scale

// row 1: terrestrial, row 2: giants, row 3: far planets; t0 = word that names the planet
const LAYOUT = [
  { name: '水星', x: 200, y: 500, t0: () => at('small', '水星') },
  { name: '金星', x: 420, y: 500, t0: () => at('small', '金星') },
  { name: '地球', x: 640, y: 500, t0: () => at('small', '地球') },
  { name: '火星', x: 860, y: 500, t0: () => at('small', '火星') },
  { name: '木星', x: 225, y: 870, t0: () => S('jup') - 0.25 },
  { name: '土星', x: 765, y: 870, t0: () => at('big', '土星') },
  { name: '天王星', x: 330, y: 1265, t0: () => at('big', '天王星') },
  { name: '海王星', x: 750, y: 1265, t0: () => at('big', '海王星') },
];

const GROUPS = [
  { label: '类地行星', color: C.terr, box: [110, 420, 860, 160], t0: () => at('kind', '类地行星') },
  { label: '巨行星', color: C.giant, box: [36, 660, 1008, 440], t0: () => at('kind', '巨行星') },
  { label: '远日行星', color: C.far, box: [200, 1180, 680, 226], t0: () => at('kind', '远日行星') },
];

function sizes(ctx, t) {
  // title
  const ta = fadeIn(t, S('small') - 0.3, 0.4);
  ctx.save(); ctx.globalAlpha *= ta;
  txt(ctx, '第一把尺：比大小', 540, 255, { size: 70, color: C.gold, stroke: C.ink, sw: 10 });
  txt(ctx, '八颗行星同一比例 · 地球直径 = 1', 540, 335, { size: 36, font: SANS, color: 'rgba(255,255,255,0.75)' });
  ctx.restore();

  // group frames (drawn under the planets)
  for (const g of GROUPS) {
    const t0 = g.t0(), a = fadeIn(t, t0 - 0.1, 0.3);
    if (a <= 0) continue;
    const [x, y, w, h] = g.box;
    ctx.save(); ctx.globalAlpha *= a;
    ctx.strokeStyle = g.color; ctx.lineWidth = 5; ctx.setLineDash([18, 12]);
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 30); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    const cp = pop(t, t0 - 0.1, 0.45);
    around(ctx, x + 40, y, cp, cp, () => {
      const tw = g.label.length * 46 + 50;
      ctx.fillStyle = g.color;
      ctx.beginPath(); ctx.roundRect(x + 20, y - 34, tw, 68, 34); ctx.fill();
      txt(ctx, g.label, x + 20 + tw / 2, y + 2, { size: 44, color: C.ink });
    });
  }

  const jupLand = S('jup') + 0.25;
  for (const L of LAYOUT) {
    const p = P[L.name], r = p.d * K, t0 = L.t0();
    if (t < t0) continue;
    let x = L.x, y = L.y, sc = 1;
    if (L.name === '木星') {
      y = lerp(-260, L.y, easeIn(prog(t, t0, jupLand)));
      const squash = t > jupLand ? Math.sin((t - jupLand) * 25) * Math.exp(-(t - jupLand) * 6) * 0.08 : 0;
      ctx.save(); ctx.translate(x, y + r); ctx.scale(1 + squash, 1 - squash); ctx.translate(-x, -y - r);
      glow(ctx, x, y, r * 0.95, r * 1.18, 'rgba(255,200,140,0.25)');
      planet(ctx, t, L.name, x, y, r, { face: true, talk: talkLevel(t, ['jup']), mood: 'proud', light: Math.PI * 0.85 });
      ctx.restore();
    } else {
      sc = pop(t, t0, 0.45);
      around(ctx, x, y, sc, sc, () => {
        if (L.name === '地球') glow(ctx, x, y, r, r * 2.4, `rgba(90,180,255,${0.35 + 0.2 * Math.sin(t * 5)})`);
        planet(ctx, t, L.name, x, y, Math.max(r, 3), { face: r > 30, mood: 'happy', ringRot: -0.3, light: Math.PI * 0.85 });
      });
    }
    // name + ratio
    const la = fadeIn(t, (L.name === '木星' ? jupLand : t0) + 0.15, 0.3);
    if (la <= 0) continue;
    const ly = L.y + Math.max(r, 8) + (L.name === '土星' ? 62 : 44);
    ctx.save(); ctx.globalAlpha *= la;
    txt(ctx, L.name, x - 8, ly, { size: 40, color: L.name === '地球' ? C.sky : C.white, align: 'right', stroke: C.ink, sw: 6 });
    txt(ctx, p.d.toFixed(2).replace(/\.00$/, ''), x + 4, ly + 2, { size: 40, font: NUM, color: C.gold, align: 'left', stroke: C.ink, sw: 6 });
    ctx.restore();
  }

  // 11 Earths laid across Jupiter's equator
  const t11 = at('jup', '11倍');
  if (t >= t11 - 0.6) {
    const J = LAYOUT[4], R = P['木星'].d * K;
    for (let i = 0; i < 11; i++) {
      const sp = pop(t, t11 - 0.6 + i * 0.06, 0.3);
      const ex = J.x - R + K + i * 2 * K * 0.997;
      around(ctx, ex, J.y + R * 0.45, sp, sp, () => {
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(ex, J.y + R * 0.45, K, 0, Math.PI * 2); ctx.stroke();
        planet(ctx, t, '地球', ex, J.y + R * 0.45, K - 1.5, { light: Math.PI * 0.85 });
      });
    }
    const bp = pop(t, t11 + 0.1, 0.45);
    around(ctx, J.x + R - 10, J.y - R + 40, bp, bp, () => {
      ctx.fillStyle = C.gold;
      ctx.beginPath(); ctx.arc(J.x + R - 10, J.y - R + 40, 66, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.stroke();
      txt(ctx, '×11', J.x + R - 10, J.y - R + 44, { size: 54, font: NUM, color: C.ink });
    }, -0.2);
    burst(ctx, t, t11 + 0.1, J.x + R - 10, J.y - R + 40, { r: 160 });
  }
}

export const scenes = [{ from: S('small') - 0.3, to: S('turn') - 0.25, draw: sizes }];

export const events = [
  ...LAYOUT.filter((L) => L.name !== '木星').map((L) => ({ t: L.t0(), type: 'pop' })),
  { t: S('jup') - 0.25, type: 'whoosh' },
  { t: S('jup') + 0.25, type: 'thud', shake: 16 },
  ...[...Array(11)].map((_, i) => ({ t: at('jup', '11倍') - 0.6 + i * 0.06, type: 'tick' })),
  { t: at('jup', '11倍') + 0.1, type: 'sparkle' },
  ...GROUPS.map((g) => ({ t: g.t0() - 0.1, type: 'ding' })),
];
