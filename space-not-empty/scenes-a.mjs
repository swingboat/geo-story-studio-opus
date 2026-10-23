// Scenes 1–2: "is the dark between stars empty?" and the magnifier that reveals gas + dust = 星际介质.
import { C, TAU, rnd, S, E, at, prog, lerp, easeOut, easeIO, pop, fadeIn, txt, around, burst, talkLevel } from './lib.mjs';
import { astronaut, astroHand, sparkleStar, gasDot, dustGrain } from './cast.mjs';
import { title, tag, stamp, magnifier } from './props.mjs';

export const STAR_L = [190, 600], STAR_R = [890, 1080], GAP = [540, 830];

// The two neighbour stars that frame the "empty" gap; they peek at whatever happens between them.
export function twoStars(ctx, t, a = 1, o = {}) {
  const { look = 0, mood = 'happy', r = 60 } = o;
  const k = [pop(t, o.t0 ?? 0.3, 0.5), pop(t, (o.t0 ?? 0.3) + 0.2, 0.5)];
  [[...STAR_L, 1], [...STAR_R, -1]].forEach(([x, y, side], i) => {
    const p = k[i] * a;
    around(ctx, x, y, p, p, () => sparkleStar(ctx, t, x, y + Math.sin(t * 1.4 + i * 2) * 8, r, { faceA: 1, mood, look: look * side }));
  });
}

// ---------- scene 1: the hook ----------
function hookScene(ctx, t) {
  const tDark = at('hook', '黑漆漆'), tNone = at('hook', '没有');
  title(ctx, t, 0.3, '太空里，真的什么都没有？', '把目光移到恒星之间', { size: 70 });
  twoStars(ctx, t, 1, { look: 1 });
  // the dark gap gets circled and filled with question marks
  const g = fadeIn(t, tDark - 0.1, 0.5);
  if (g > 0) {
    const [x, y] = GAP;
    ctx.save();
    ctx.globalAlpha *= g;
    ctx.fillStyle = 'rgba(0,0,8,0.55)';
    ctx.beginPath(); ctx.ellipse(x, y, 250 * g, 200 * g, -0.4, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 5; ctx.setLineDash([18, 14]); ctx.lineDashOffset = -t * 50;
    ctx.beginPath(); ctx.ellipse(x, y, 250 * g, 200 * g, -0.4, 0, TAU); ctx.stroke();
    ctx.restore();
  }
  [[440, 760, 0], [610, 880, 0.15], [560, 700, 0.3]].forEach(([x, y, d], i) => {
    const q = pop(t, tNone + d, 0.4);
    around(ctx, x, y, q * (i === 0 ? 1.2 : 0.8), q, () =>
      txt(ctx, '？', x, y + Math.sin(t * 4 + i) * 12, { size: 130, color: C.gold, stroke: '#0a0828', sw: 12 }), (i - 1) * 0.25);
  });
  // 小宇 floats in from the bottom
  const fly = easeOut(prog(t, 0.2, 1.3));
  astronaut(ctx, t, lerp(-120, 230, fly), lerp(1500, 1210, fly), 0.85, {
    talk: talkLevel(t, ['hook']), look: 1, lookY: -1, arm: -0.8, mood: t > tNone ? 'wow' : 'happy',
  });
}

// ---------- scene 2: magnifier → gas + dust → 星际介质 ----------
const GAS = [...Array(15)].map((_, i) => [rnd(i + 3) * TAU, Math.sqrt(rnd(i + 31)) * 0.85]);
const DUST = [...Array(7)].map((_, i) => [rnd(i + 61) * TAU, Math.sqrt(rnd(i + 77)) * 0.8]);

function lensScene(ctx, t) {
  const t0 = S('lens'), tMag = at('lens', '放大镜'), tSee = S('see');
  const tGas = at('see', '气体'), tDust = at('see', '尘埃');
  const tH = at('gas', '氢'), tHe = at('gas', '氦'), tName = at('name', '星际介质');
  title(ctx, t, t0, '拿出超级放大镜！', '凑近瞧瞧恒星之间', { size: 76, t1: tSee - 0.2 });
  title(ctx, t, tSee, '这里有：气体和尘埃', '稀稀薄薄地飘着', { size: 76 });
  twoStars(ctx, t, 1, { t0: -1, look: 0, mood: 'happy' });
  // 小宇 holds the lens; the glass glides into the gap
  const K = [210, 1240], ks = 0.82, arm = -0.75;
  const hand = astroHand(t, K[0], K[1], ks, arm);
  const m = easeOut(prog(t, tMag - 0.3, tMag + 0.5));
  const lr = 235 * pop(t, tMag - 0.3, 0.6);
  const lx = lerp(hand[0] + 120, GAP[0], m), ly = lerp(hand[1] - 120, GAP[1], m);
  if (lr > 1) {
    const ang = Math.atan2(hand[1] - ly, hand[0] - lx);
    const len = Math.max(20, Math.hypot(hand[0] - lx, hand[1] - ly) - lr);
    magnifier(ctx, lx, ly, lr, ang, () => {
      GAS.forEach(([a, d], i) => {
        const w = a + t * 0.15 * (i % 2 ? 1 : -1);
        gasDot(ctx, lx + Math.cos(w) * d * lr, ly + Math.sin(w) * d * lr, 11, pop(t, tGas + i * 0.05, 0.4));
      });
      DUST.forEach(([a, d], i) => {
        const w = a - t * 0.1;
        dustGrain(ctx, lx + Math.cos(w) * d * lr, ly + Math.sin(w) * d * lr, 15 * pop(t, tDust + i * 0.07, 0.4), t * 0.6 + i);
      });
    }, len);
  }
  astronaut(ctx, t, K[0], K[1], ks, { talk: 0, arm, look: 1, lookY: -1, mood: t > tGas ? 'wow' : 'happy' });
  // legend under the lens, then swapped for the big name stamp
  const lgOut = 1 - prog(t, tName - 0.4, tName - 0.1);
  const gp = pop(t, tGas, 0.4) * lgOut, dp = pop(t, tDust, 0.4) * lgOut;
  around(ctx, 600, 1140, gp, gp, () => { gasDot(ctx, 530, 1140, 13); tag(ctx, 640, 1140, '气体', null, { color: C.gas, size: 46 }); });
  around(ctx, 860, 1140, dp, dp, () => { dustGrain(ctx, 790, 1140, 17, 0.4); tag(ctx, 900, 1140, '尘埃', null, { color: C.dust, size: 46 }); });
  // 氢 / 氦 chips bubble up from the lens
  const hOut = 1 - prog(t, tName - 0.4, tName);
  [[tH, '氢 H', 380, 560], [tHe, '氦 He', 720, 540]].forEach(([tt, s, x, y]) => {
    const p = pop(t, tt - 0.1, 0.45) * hOut;
    around(ctx, x, y, p, p, () => tag(ctx, x, y + Math.sin(t * 2 + x) * 6, s, null, { color: C.gas, size: 50 }));
  });
  // the name
  const np = pop(t, tName - 0.05, 0.5);
  stamp(ctx, 600, 1150, '星际介质', np, { color: C.gold, size: 104 });
  const sp = fadeIn(t, tName + 0.4, 0.4);
  if (sp > 0) {
    ctx.save(); ctx.globalAlpha *= sp;
    txt(ctx, '恒星之间的气体 + 尘埃', 600, 1290, { size: 44, color: C.white, stroke: '#0a0828', sw: 8 });
    ctx.restore();
  }
  burst(ctx, t, tName, 600, 1150, { n: 12, r: 330 });
}

export const scenes = [
  { id: 'hook', from: 0, to: S('lens') - 0.25, draw: hookScene },
  { id: 'lens', from: S('lens') - 0.25, to: S('kidHow') - 0.3, draw: lensScene },
];

export const events = [
  { type: 'sparkle', t: 0.35 },
  { type: 'pop', t: 0.35, f: 800 }, { type: 'pop', t: 0.55, f: 1000 },
  { type: 'whoosh', t: 0.3, d: 0.8, from: 300, to: 1500, amp: 0.6 },
  ...[0, 0.15, 0.3].map((d, i) => ({ type: 'boing', t: at('hook', '没有') + d, amp: 0.6 - i * 0.12 })),
  { type: 'whoosh', t: at('lens', '放大镜') - 0.3, d: 0.6, from: 500, to: 3000 },
  { type: 'ding', t: at('lens', '放大镜') + 0.2, n: 86 },
  ...[...Array(6)].map((_, i) => ({ type: 'pop', t: at('see', '气体') + i * 0.12, f: 900 + i * 90, amp: 0.55 })),
  ...[...Array(4)].map((_, i) => ({ type: 'tick', t: at('see', '尘埃') + i * 0.14, n: 79 + i * 2 })),
  { type: 'note', t: at('gas', '氢'), n: 76 }, { type: 'note', t: at('gas', '氦'), n: 81 },
  { type: 'stamp', t: at('name', '星际介质') },
  { type: 'sparkle', t: at('name', '星际介质') + 0.15 },
];
