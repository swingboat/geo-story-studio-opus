// Scenes 5–6: the spot glows — only out-shone by its surroundings; alone it beats the full Moon; a black hole lets no light out.
import { W, C, TAU, S, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, around, burst } from './lib.mjs';
import { glow } from './cast.mjs';
import { title, tag, neqSign } from './props.mjs';
import { sunglasses } from './sun.mjs';
import { sunspot, granules } from './spot.mjs';
import { moonBuddy, blackHole, label } from './gear.mjs';

const INK = '#0a0828';

// Light streaming outward from (x,y): short dashes flying away radially.
function emit(ctx, t, x, y, r, a = 1, n = 12) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.strokeStyle = 'rgba(255,236,150,0.95)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * TAU + 0.2, p = (t * 0.7 + (i % 3) / 3) % 1;
    const d0 = r * (1.1 + p * 1.3), d1 = d0 + r * 0.35;
    ctx.globalAlpha = clamp(a) * (1 - p);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(ang) * d0, y + Math.sin(ang) * d0);
    ctx.lineTo(x + Math.cos(ang) * d1, y + Math.sin(ang) * d1);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- scene 5: same spot, swap the background ----------
function contrastScene(ctx, t) {
  const t0 = S('glow'), tShine = at('glow', '发光'), tDim = at('glow', '衬暗'), tSwap = S('swap'), tBlack = at('swap', '黑背景'), tUp = at('swap', '亮了起来');
  title(ctx, t, t0, '黑子其实也在发光', '只是被更亮的周围衬暗了', { size: 76, t1: tSwap - 0.1 });
  title(ctx, t, tSwap, '换个背景试试', '同一块黑子，颜色一点没变', { size: 80 });

  const [x, y, w, h] = [190, 540, 700, 700], cx = x + w / 2, cy = y + h / 2;
  const pin = pop(t, t0 - 0.1, 0.5);
  around(ctx, cx, cy, pin, pin, () => {
    // the bright surroundings get peeled away from left to right
    const peel = easeIO(prog(t, tBlack - 0.2, tBlack + 0.9));
    ctx.fillStyle = '#05061a';
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 30); ctx.fill();
    if (peel < 1) {
      ctx.save();
      ctx.beginPath(); ctx.rect(x + w * peel, y - 10, w * (1 - peel) + 10, h + 20); ctx.clip();
      granules(ctx, t, x, y, w, h, { cell: 64 });
      ctx.restore();
      if (peel > 0) {
        // curled edge of the peel
        ctx.fillStyle = 'rgba(255,220,140,0.9)';
        ctx.fillRect(x + w * peel - 6, y, 12, h);
      }
    }
    const lit = prog(t, tUp - 0.3, tUp + 0.5);
    if (lit > 0) glow(ctx, cx, cy, 60, 240, `rgba(255,170,80,${0.45 * lit})`);
    sunspot(ctx, cx, cy, 150, { seed: 3 });
    emit(ctx, t, cx, cy, 150, fadeIn(t, tShine - 0.2, 0.4) * (1 - prog(t, tDim - 0.2, tDim + 0.2)) + lit);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 30); ctx.stroke();
  });
  const ta = pop(t, tShine - 0.1, 0.45) * (1 - prog(t, tSwap - 0.3, tSwap));
  around(ctx, cx, y + h + 90, ta, ta, () => tag(ctx, cx, y + h + 90, '也在发光', null, { color: C.gold, size: 50 }));
  const ub = pop(t, tUp - 0.1, 0.45);
  around(ctx, cx, y + h + 90, ub, ub, () => tag(ctx, cx, y + h + 90, '暗背景上，它亮了！', null, { color: C.mint, size: 50 }));
  burst(ctx, t, tUp + 0.1, cx, cy, { n: 12, r: 330 });
}

// ---------- scene 6: alone it outshines the full Moon; a black hole traps light ----------
function moonBhScene(ctx, t) {
  const t0 = S('moon'), tFull = at('moon', '满月'), tBH = S('bh'), tTrap = at('bh', '逃不出来'), tNot = at('bh', '可不是');
  title(ctx, t, t0, '单独放进夜空', '比满月还亮得多！', { size: 80, t1: tBH - 0.1 });
  title(ctx, t, tBH, '黑子 ≠ 黑洞', null, { size: 92, color: C.gold });

  const mv = easeIO(prog(t, tBH - 0.2, tBH + 0.6));
  // the isolated spot: a hot ember in the night sky
  const sx = lerp(330, 790, mv), sy = lerp(760, 820, mv), sr = lerp(120, 105, mv);
  const sIn = pop(t, t0 + 0.1, 0.5);
  around(ctx, sx, sy, sIn, sIn, () => {
    glow(ctx, sx, sy, sr * 0.5, sr * 3.2, 'rgba(255,170,80,0.55)');
    glow(ctx, sx, sy, 0, sr * 1.6, 'rgba(255,220,150,0.5)');
    sunspot(ctx, sx, sy, sr, { seed: 3 });
    emit(ctx, t, sx, sy, sr, 1, 14);
  });
  // the full Moon squints and reaches for shades
  const mA = fadeIn(t, t0 + 0.3, 0.4) * (1 - prog(t, tBH - 0.3, tBH + 0.1));
  if (mA > 0) {
    const mx = 780, my = 820, mr = 120;
    ctx.save(); ctx.globalAlpha *= mA;
    moonBuddy(ctx, t, mx, my, mr, { mood: t > tFull ? 'wow' : 'happy', look: -0.8 });
    sunglasses(ctx, mx - 0.8 * mr * 0.06, my + mr * 0.08 - mr * 0.6 * 0.14, mr * 0.6, easeOut(prog(t, tFull, tFull + 0.5)));
    label(ctx, '满月', mx, my + 190, { color: '#dfe3ff' });
    ctx.restore();
    const sl = fadeIn(t, t0 + 0.4, 0.3) * mA;
    if (sl > 0) { ctx.save(); ctx.globalAlpha *= sl; label(ctx, '一块黑子', 330, 960); ctx.restore(); }
  }

  // black hole on the left: light goes in and never comes back
  const bA = pop(t, tBH + 0.1, 0.5);
  around(ctx, 290, 820, bA, bA, () => blackHole(ctx, t, 290, 820, 105, { rays: fadeIn(t, tTrap - 0.6, 0.4) }));
  const la = fadeIn(t, tBH + 0.4, 0.4);
  if (la > 0) {
    ctx.save(); ctx.globalAlpha *= la;
    label(ctx, '黑洞', 290, 1030, { size: 56 });
    label(ctx, '黑子', 790, 1030, { size: 56, color: C.gold });
    ctx.restore();
  }
  const ca = pop(t, tTrap - 0.2, 0.45);
  around(ctx, 290, 1130, ca, ca, () => tag(ctx, 290, 1130, '光进去就出不来', null, { color: '#b9a4ff', size: 42 }));
  const cb = pop(t, tTrap + 0.2, 0.45);
  around(ctx, 790, 1130, cb, cb, () => tag(ctx, 790, 1130, '光照样射出来', null, { color: C.gold, size: 42 }));
  neqSign(ctx, 540, 820, 1, pop(t, tNot - 0.1, 0.45));
}

export const scenes = [
  { id: 'contrast', from: S('glow') - 0.25, to: S('moon') - 0.25, draw: contrastScene },
  { id: 'moonbh', from: S('moon') - 0.25, to: S('whyCool') - 0.25, draw: moonBhScene },
];

export const events = [
  { type: 'sparkle', t: at('glow', '发光') - 0.1 },
  { type: 'whoosh', t: at('swap', '黑背景') - 0.2, d: 1.0, from: 2600, to: 500 },
  { type: 'tada', t: at('swap', '亮了起来'), amp: 0.8 },
  { type: 'pop', t: S('moon') + 0.1, f: 700 },
  { type: 'boing', t: at('moon', '满月') },
  { type: 'ding', t: at('moon', '满月') + 0.35, n: 91 },
  { type: 'whoosh', t: S('bh') + 0.05, d: 1.2, from: 1800, to: 120, amp: 0.8 },
  { type: 'stamp', t: at('bh', '可不是') - 0.05 },
];
