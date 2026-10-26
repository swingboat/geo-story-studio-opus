// Scenes D (overlays on the map walk): Jupiter beyond the school gate, Saturn/Uranus/Neptune kilometres away,
// Neptune's echoing call, walking time vs light time, and "the solar system is mostly empty".
import { C, NUM, SANS, S, E, at, prog, lerp, clamp, easeOut, pop, fadeIn, txt, card, around, talkLevel } from './lib.mjs';
import { planet, pin, glow, P, PLANETS } from './bodies.mjs';
import { orbits } from './map.mjs';

const OUTER = [
  { name: '木星', note: '611 米', side: 1, t0: () => at('jupd', '611米') },
  { name: '土星', note: '1.1 公里', side: -1, t0: () => at('out', '1.1公里') },
  { name: '天王星', note: '2.3 公里', side: 1, t0: () => at('out', '2.3公里') },
  { name: '海王星', note: '3.5 公里', side: -1, t0: () => at('out', '3.5公里') },
];

// when each planet's marker appears (the word that names its distance)
export const REVEAL = {
  水星: () => at('walk', '45米'), 金星: () => at('walk', '85米'), 地球: () => at('earthd', '117米'), 火星: () => at('mars', '179米'),
  ...Object.fromEntries(OUTER.map((o) => [o.name, o.t0])),
};

export const gateGlow = (t) => fadeIn(t, at('jupd', '校门') - 0.1, 0.25) * (1 - prog(t, S('out'), S('out') + 0.5));
export const mapFade = (t) => 1 - 0.8 * prog(t, at('empty', '空旷') - 0.2, at('empty', '空旷') + 0.8);
const pinsAlpha = (t) => 1 - prog(t, at('empty', '豆子'), at('empty', '豆子') + 0.4);

// under the walker: orbits, outer planet dots, light pulse
export function outerUnder(ctx, t, cam) {
  orbits(ctx, cam, PLANETS, 0.9 * fadeIn(t, S('out') - 0.3, 0.8));
  const { X, Y } = cam;
  // the planets are beans in kilometres of space: tiny glowing dots, ringed when the narration points at them
  const ring = fadeIn(t, at('empty', '豆子'), 0.3);
  for (const p of PLANETS) {
    const show = fadeIn(t, REVEAL[p.name]() - 0.1, 0.2);
    if (show <= 0) continue;
    const x = X(0), y = Y(p.m);
    glow(ctx, x, y, 0, 14, 'rgba(255,255,255,0.6)');
    planet(ctx, t, p.name, x, y, Math.max(3, p.d * 0.005 * cam.k)); // true radius: Earth = 0.5 cm
    if (ring > 0) {
      ctx.save(); ctx.globalAlpha *= ring;
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, y, 16 + 6 * Math.sin(t * 5 + p.m), 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }
}

export function outerOver(ctx, t, cam) {
  const { X, Y, k } = cam;
  const pa = pinsAlpha(t);
  // school gate tag
  const ga = pop(t, at('jupd', '校门') - 0.1, 0.4) * (1 - prog(t, S('out'), S('out') + 0.4));
  around(ctx, X(0) - 60, Y(450), ga, ga, () => {
    card(ctx, X(0) - 190, Y(450) - 36, 130, 72, { fill: C.gold, r: 36, ew: 4, drop: 0 });
    txt(ctx, '校门', X(0) - 125, Y(450) + 2, { size: 40, color: C.ink });
  });
  for (const o of OUTER) {
    const a = pop(t, o.t0(), 0.4) * pa;
    pin(ctx, t, X(0), Y(P[o.name].m), o.name, o.note, { a, side: o.side, sc: clamp(pop(t, o.t0(), 0.4), 0.01, 1.2) });
  }
  // Neptune shouts from 3.5 km away; echo rings spread out
  if (t > S('nep') - 0.3 && t < E('nep') + 0.8) {
    const na = pop(t, S('nep') - 0.3, 0.4) * (1 - prog(t, E('nep') + 0.4, E('nep') + 0.8));
    const nx = X(0), ny = Y(P['海王星'].m);
    for (let i = 0; i < 3; i++) {
      const ph = ((((t - S('nep')) * 0.9 + i / 3) % 1) + 1) % 1;
      ctx.strokeStyle = `rgba(201,182,255,${na * (1 - ph) * 0.8})`; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(nx, ny, 20 + ph * 260, 0, Math.PI * 2); ctx.stroke();
    }
    around(ctx, 760, 470, na, na, () => {
      ctx.fillStyle = 'rgba(8,10,40,0.9)';
      ctx.beginPath(); ctx.arc(760, 470, 92, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.lilac; ctx.lineWidth = 6; ctx.stroke();
      planet(ctx, t, '海王星', 760, 474, 70, { face: true, mood: 'sad', talk: talkLevel(t, ['nep']), look: -0.6 });
    });
  }
  // walking time and light time
  const ca = 1 - prog(t, S('empty') - 0.2, S('empty') + 0.2);
  if (t > at('time', '四十多分钟') - 0.6 && ca > 0) {
    ctx.save(); ctx.globalAlpha *= ca * fadeIn(t, at('time', '四十多分钟') - 0.6, 0.3);
    ctx.fillStyle = 'rgba(4,6,24,0.55)'; ctx.fillRect(0, 0, 1080, 1920);
    ctx.restore();
    statCard(ctx, t, 640, '步行', C.mint, '约 42 分钟', '按每小时 5 公里', at('time', '四十多分钟') - 0.3, ca);
    statCard(ctx, t, 900, '光速', C.gold, '约 4 小时 10 分', '太阳光到地球约 8 分 20 秒', at('time', '4个') - 0.3, ca);
  }
  // light pulse racing from the Sun to Neptune
  const lp = prog(t, at('time', '光'), at('time', '多小时') + 0.4);
  if (lp > 0 && lp < 1) {
    const y = lerp(Y(0), Y(P['海王星'].m), easeOut(lp));
    glow(ctx, X(0), y, 0, 46, 'rgba(255,230,120,0.95)');
    ctx.fillStyle = 'rgba(255,240,170,0.6)'; ctx.fillRect(X(0) - 3, y, 6, Y(0) - y);
  }
  // the punchline
  const ea = pop(t, at('empty', '大部分') - 0.15, 0.45);
  around(ctx, 540, 1010, ea, ea, () => {
    card(ctx, 110, 940, 860, 140, { fill: 'rgba(8,10,40,0.92)', edge: C.sky, ew: 6, drop: 0, r: 40 });
    txt(ctx, '太阳系，大部分是空的', 540, 1012, { size: 66, color: C.white });
  });
}

function statCard(ctx, t, y, chip, color, big, small, t0, a) {
  const p = pop(t, t0, 0.45);
  around(ctx, 540, y, p, p * a, () => {
    card(ctx, 120, y - 105, 840, 210, { fill: '#0a0c2c', edge: color, ew: 6, drop: 0, r: 36 });
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.roundRect(160, y - 75, 150, 70, 35); ctx.fill();
    txt(ctx, chip, 235, y - 38, { size: 40, color: C.ink });
    txt(ctx, big, 340, y - 38, { size: 64, color: C.white, align: 'left' });
    txt(ctx, small, 540, y + 55, { size: 36, font: SANS, color: 'rgba(255,255,255,0.75)' });
  });
}

export const scenes = [];

export const events = [
  { t: at('jupd', '611米'), type: 'pop' },
  { t: at('jupd', '校门') - 0.1, type: 'ding' },
  ...OUTER.slice(1).map((o) => ({ t: o.t0(), type: 'pop' })),
  { t: S('out') - 0.2, type: 'whoosh' },
  { t: S('nep') - 0.3, type: 'boing' },
  { t: at('time', '四十多分钟') - 0.3, type: 'pop' },
  { t: at('time', '光'), type: 'whoosh' },
  { t: at('time', '4个') - 0.3, type: 'pop' },
  { t: at('empty', '豆子'), type: 'sparkle' },
  { t: at('empty', '空旷') - 0.2, type: 'wind' },
  { t: at('empty', '大部分') - 0.15, type: 'stamp', shake: 8 },
];
