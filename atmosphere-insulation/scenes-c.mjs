// Scenes 7–8: the ground's long-wave ledger (same surface temperature & properties) → cloudy vs clear night, explained.
import {
  C, S, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn,
  txt, card, around, burst, talkLevel,
} from './lib.mjs';
import { hiker, groundBody, glow } from './chars.mjs';
import { thermo, irWave, disclaimer } from './props.mjs';
import { ATM, moon, frost, cloudBuddy, banner } from './night.mjs';

// ---------- scene 7: ledger ----------
const COLS = [{ x: 120, label: '假如没有逆辐射', on: false }, { x: 520, label: '有大气逆辐射', on: true }];
const BAR = 320, OUT = 320, IN = 170;

function bar(ctx, x, y, len, color, o = {}) {
  if (len <= 1) return;
  ctx.save();
  ctx.fillStyle = color;
  if (o.glow) { ctx.shadowColor = color; ctx.shadowBlur = 18; }
  ctx.beginPath(); ctx.roundRect(x, y - 22, len, 44, 22); ctx.fill();
  ctx.restore();
}

function ledgerScene(ctx, t) {
  const tBook = at('ledger', '记本账'), tSame = at('ledger', '温度一样'), tOut = at('ledger', '长波辐射'), tEq = at('ledger', '一样多');
  const tIn = at('ledger2', '逆辐射'), tNet = at('ledger2', '净散热'), tLess = at('ledger2', '变少'), tKeep = at('ledger2', '保温');
  const bp = pop(t, S('ledger') - 0.1, 0.5);
  around(ctx, 490, 900, bp, bp, () => {
    card(ctx, 80, 540, 820, 720, { fill: '#fff8e6', edge: C.ink, ew: 6, r: 34 });
    // binder rings
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(150 + i * 130, 524, 20, 46, 10); ctx.fill();
    }
    txt(ctx, '地面的长波账本', 490, 615, { size: 52, color: C.ink });
  });
  if (bp <= 0.01) return;
  const cp = pop(t, tSame - 0.1, 0.4);
  around(ctx, 490, 685, cp, cp, () => {
    card(ctx, 200, 657, 580, 56, { fill: C.ink, ew: 0, r: 28, drop: 0 });
    txt(ctx, '前提：地面温度、性质都一样', 490, 686, { size: 32, color: C.gold });
  });
  const hp = fadeIn(t, tBook, 0.3);
  ctx.save(); ctx.globalAlpha *= hp;
  COLS.forEach((c) => txt(ctx, c.label, c.x + 170, 760, { size: 34, color: c.on ? '#1d8fb0' : '#8a7aa8' }));
  ctx.restore();
  // row 1: what the ground sends out (identical in both columns)
  const r1 = easeOut(prog(t, tOut - 0.2, tEq + 0.1));
  around(ctx, 490, 840, 1, fadeIn(t, tOut - 0.2, 0.3), () => txt(ctx, '支出：地面发出的长波辐射', 490, 818, { size: 30, color: C.ink }));
  COLS.forEach((c) => bar(ctx, c.x + 10, 866, OUT * r1, C.ir));
  const ep = pop(t, tEq, 0.35);
  around(ctx, 490, 866, ep, ep, () => txt(ctx, '=', 490, 862, { size: 70, color: C.ink }));
  // row 2: counter-radiation absorbed
  around(ctx, 490, 950, 1, fadeIn(t, tIn - 0.3, 0.3), () => txt(ctx, '收入：吸收的大气逆辐射', 490, 950, { size: 30, color: C.ink }));
  const r2 = easeOut(prog(t, tIn - 0.2, tIn + 0.5));
  if (r2 > 0) {
    ctx.save(); ctx.globalAlpha *= r2;
    ctx.strokeStyle = '#b9add0'; ctx.lineWidth = 4; ctx.setLineDash([12, 10]);
    ctx.beginPath(); ctx.roundRect(COLS[0].x + 10, 976, 120, 44, 22); ctx.stroke();
    ctx.restore();
    txt(ctx, '0', COLS[0].x + 70, 999, { size: 34, color: `rgba(138,122,168,${r2})` });
  }
  // the cyan bar slides into the net row at "变少" and eats part of the expense
  const eat = easeIO(prog(t, tLess - 0.25, tLess + 0.35));
  ctx.save(); ctx.globalAlpha *= 0.3 * clamp(eat * 3); bar(ctx, COLS[1].x + 10, 998, IN * r2, ATM); ctx.restore();
  bar(ctx, COLS[1].x + 10 + (OUT - IN) * eat, lerp(998, 1130, eat), IN * r2, ATM, { glow: true });
  // row 3: net long-wave loss = expense − income
  around(ctx, 490, 1080, 1, fadeIn(t, tNet - 0.3, 0.3), () => txt(ctx, '净散热 = 支出 − 收入', 490, 1080, { size: 32, color: C.no }));
  const r3 = easeOut(prog(t, tNet - 0.2, tNet + 0.3));
  bar(ctx, COLS[0].x + 10, 1130, OUT * r3, C.no);
  bar(ctx, COLS[1].x + 10, 1130, (OUT - IN * eat) * r3, C.no);
  const lp = pop(t, tLess + 0.25, 0.4);
  around(ctx, 790, 1200, lp, lp, () => txt(ctx, '变少了↓', 790, 1200, { size: 40, color: C.no, stroke: '#fff8e6', sw: 8 }));
  // the big stamp
  const sp = pop(t, tKeep - 0.05, 0.35);
  around(ctx, 730, 1005, lerp(2.2, 1, sp), sp, () => {
    ctx.save();
    ctx.fillStyle = 'rgba(255,248,230,0.92)'; ctx.strokeStyle = C.no; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.roundRect(610, 955, 240, 100, 18); ctx.fill(); ctx.stroke();
    ctx.restore();
    txt(ctx, '保温！', 730, 1005, { size: 68, color: C.no });
  }, -0.15);
  disclaimer(ctx, 1290, fadeIn(t, tOut, 0.4));
}

// ---------- scene 8: cloudy vs clear night, with the mechanism ----------
const PANELS = [
  { x0: 70, label: '晴朗的夜', cloudy: false },
  { x0: 500, label: '有云的夜', cloudy: true },
];

function nightPanel(ctx, t, p, hl) {
  const x1 = p.x0 + 410, cx = p.x0 + 205, gy = 1150;
  const tStrong = p.cloudy ? at('cloudy', '更强') : at('clear', '逆辐射弱');
  const tCool = p.cloudy ? at('cloudy', '降温慢') : at('clear', '降温快');
  ctx.save();
  ctx.beginPath(); ctx.roundRect(p.x0, 560, 410, 700, 36); ctx.clip();
  const g = ctx.createLinearGradient(0, 560, 0, 1260);
  g.addColorStop(0, p.cloudy ? '#27355e' : '#070d30'); g.addColorStop(1, p.cloudy ? '#3b4f80' : '#15306a');
  ctx.fillStyle = g; ctx.fillRect(p.x0, 560, 410, 700);
  if (!p.cloudy) moon(ctx, t, x1 - 80, 690, 40, { mood: 'happy' });
  groundBody(ctx, t, p.x0, x1, gy, 110, { heat: 0.35, shimmer: 0 });
  if (!p.cloudy) frost(ctx, t, p.x0 + 10, x1 - 10, gy, easeOut(prog(t, at('clear', '结霜') - 0.3, at('clear', '结霜') + 0.6)));
  // the ground emits the same way in both panels
  for (const dx of [-110, 30]) {
    const ph = (t * 0.6 + dx * 0.01) % 1;
    irWave(ctx, t, cx + dx, gy - 25, cx + dx, gy - 25 - 380, 0.3 + 0.7 * ph, { alpha: Math.sin(Math.PI * ph) * 0.9, amp: 10, w: 7, lambda: 50 });
  }
  // downward counter-radiation: strong under the cloud, weak under a clear sky
  const dp = easeOut(prog(t, tStrong - 0.3, tStrong + 0.5));
  const n = p.cloudy ? 3 : 1;
  for (let i = 0; i < n; i++) {
    const x = p.cloudy ? cx - 60 + i * 70 : cx - 30;
    irWave(ctx, t, x, p.cloudy ? 800 : 640, x + 10, gy - 20, dp, { color: ATM, w: p.cloudy ? 10 : 5, amp: p.cloudy ? 13 : 8, alpha: p.cloudy ? 1 : 0.55, dash: p.cloudy ? undefined : [14, 12] });
  }
  if (p.cloudy) {
    glow(ctx, cx, gy, 20, 220, `rgba(76,224,255,${0.25 * dp})`);
  }
  ctx.restore();
  if (p.cloudy) cloudBuddy(ctx, t, cx - 10, 730, 0.9, { glowK: dp, mood: 'happy' });
  card(ctx, p.x0, 560, 410, 700, { fill: 'rgba(0,0,0,0)', edge: hl > 0.5 ? C.gold : p.cloudy ? C.pink : C.cool, ew: hl > 0.5 ? 9 : 5, r: 36, drop: 0 });
  txt(ctx, p.label, cx, 610, { size: 40, color: p.cloudy ? C.pink : C.cool, stroke: C.space, sw: 8 });
  const sp = pop(t, tStrong, 0.35);
  around(ctx, cx, 900, sp, sp, () => txt(ctx, p.cloudy ? '逆辐射 强' : '逆辐射 弱', cx - 40, 900, { size: 36, color: ATM, stroke: C.space, sw: 8 }));
  // thermometers start equal and fall at different speeds
  const fall = easeOut(prog(t, tCool - 0.3, tCool + (p.cloudy ? 3.5 : 1.6)));
  thermo(ctx, x1 - 55, gy - 50, 220, lerp(0.6, p.cloudy ? 0.48 : 0.14, fall));
  const cp = pop(t, tCool, 0.35);
  around(ctx, cx, 1205, cp, cp, () => {
    card(ctx, cx - 115, 1180, 230, 56, { fill: p.cloudy ? C.ok : C.no, ew: 0, r: 28, drop: 0 });
    txt(ctx, p.cloudy ? '降温慢' : '降温快', cx, 1209, { size: 34, color: C.space });
  });
  if (!p.cloudy) {
    const k = prog(t, at('clear', '结霜') - 0.2, at('clear', '结霜') + 0.4);
    hiker(ctx, t, p.x0 + 120, gy, 0.38, { shiver: k, mood: 'happy' });
  } else hiker(ctx, t, p.x0 + 110, gy, 0.38, { mood: 'happy' });
}

function nightScene(ctx, t) {
  const hlCloud = prog(t, S('cloudy') - 0.2, S('cloudy')) * (1 - prog(t, S('clear') - 0.2, S('clear')));
  const hlClear = prog(t, S('clear') - 0.2, S('clear'));
  PANELS.forEach((p, i) => {
    const sp = pop(t, S('cloudy') - 0.3 + i * 0.1, 0.45);
    const hl = p.cloudy ? hlCloud : hlClear;
    around(ctx, p.x0 + 205, 910, sp * lerp(1, 1.03, hl), sp, () => nightPanel(ctx, t, p, hl));
  });
  burst(ctx, t, at('clear', '结霜'), 275, 1130, { r: 200, n: 10, colors: ['#ffffff', C.cool, C.sky] });
}

export const scenes = [
  { from: S('ledger') - 0.3, to: S('cloudy') - 0.3, draw: ledgerScene },
  { from: S('cloudy') - 0.3, to: S('kidStop') - 0.3, draw: nightScene },
];

export const events = [
  { type: 'whoosh', t: S('ledger') - 0.3, d: 0.4 },
  { type: 'scribble', t: at('ledger', '记本账'), d: 0.6 },
  { type: 'stamp', t: at('ledger', '温度一样') - 0.05 },
  { type: 'tick', t: at('ledger', '一样多'), n: 84 },
  { type: 'note', t: at('ledger2', '逆辐射') - 0.15, n: 79 },
  { type: 'whoosh', t: at('ledger2', '变少') - 0.25, d: 0.5, from: 2400, to: 600 },
  { type: 'slam', t: at('ledger2', '保温') - 0.02, shake: 14 },
  { type: 'whoosh', t: S('cloudy') - 0.3, d: 0.4 },
  { type: 'sparkle', t: at('cloudy', '更强') },
  { type: 'ding', t: at('cloudy', '降温慢'), n: 84 },
  { type: 'wind', t: S('clear'), d: 4.2 },
  { type: 'buzz', t: at('clear', '降温快') },
  { type: 'sparkle', t: at('clear', '结霜'), amp: 0.8 },
];
