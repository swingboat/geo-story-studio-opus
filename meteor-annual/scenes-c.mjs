// Scenes C1–C2: calendar date = orbital position, a full year's lap, and 133 Earth laps per comet return.
import {
  C, S, E, at, endAt, prog, ease, lerp, fade, pop, alpha, text, header, pill, panel, talk, glow,
} from './lib.mjs';
import { nucleus, stamp } from './chars.mjs';
import {
  project, cometPos, earthPos, streamPath, streamGrains, plane, node, solarCore, earthAt, months, NODE, NODE_XY, VIEW,
} from './orbit.mjs';

const TAU = Math.PI * 2;
export const LAP_START = at('lap', '公转');
export const LAP_END = endAt('lap', '交会');
export const lapAngle = (t) => NODE + TAU * ease(prog(t, LAP_START, LAP_END));

function system(ctx, t, o = {}) {
  const { trail = null, bright = 0, nodeA = 1, nodeLabel = '8月中旬 · 交会处' } = o;
  streamPath(ctx, -1, 0.8); streamGrains(ctx, t, -1, { a: 0.8 });
  plane(ctx, 1, trail);
  solarCore(ctx, t);
  streamPath(ctx, 1, 0.8 + bright * 0.2); streamGrains(ctx, t, 1, { bright });
  node(ctx, t, nodeA, nodeLabel);
}

// ---------- C1: the calendar is the orbit ----------
function calendarOrbit(ctx, t) {
  const lapping = t >= LAP_START;
  header(ctx, t, S('key'), '07 / 关键来了', lapping ? '公转一周，约一年' : '日期 = 地球在轨道上的位置', '日历上的日子，对应公转轨道上的点');
  const th = lapAngle(t);
  system(ctx, t, { trail: lapping ? [NODE, th] : null, nodeA: fade(t, at('key', '位置')), nodeLabel: '' });
  months(ctx, t, prog(t, at('key', '日历'), at('key', '位置')), lapping && t < LAP_END ? th : null);
  const proud = t >= S('again');
  earthAt(ctx, t, th, 48, { mouth: talk(t, ['again']), mood: proud ? 'proud' : 'normal' });
  const here = fade(t, at('key', '地球')) * (1 - fade(t, LAP_START, 0.3));
  alpha(ctx, here, () => {
    const p = project(earthPos(NODE));
    ctx.strokeStyle = C.blue; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(p.x, p.y, 62 + Math.sin(t * 6) * 5, 0, Math.PI * 2); ctx.stroke();
    panel(ctx, 230, 1300, 620, 96, C.blue);
    text(ctx, '地球在这儿 → 日历上是8月中旬', 540, 1348, 36, C.blue);
  });
  if (lapping) {
    const months12 = Math.min(12, Math.floor(12 * ease(prog(t, LAP_START, LAP_END)) + 0.001));
    panel(ctx, 250, 1300, 580, 96, C.blue);
    text(ctx, t >= LAP_END ? '12个月过去 = 约一年' : `过去了 ${months12} 个月`, 540, 1348, 38, C.blue);
  }
  stamp(ctx, 760, 690, '年度打卡', prog(t, at('again', '又到'), at('again', '又到') + 0.35));
}

// ---------- C2: 133 Earth laps per comet return ----------
const SPIN_A = at('comet133', '一百三十多年'), SPIN_B = at('comet133', '一次') + 0.5;
const laps = (t) => 133 * ease(prog(t, SPIN_A, SPIN_B));
function cometYears(ctx, t) {
  header(ctx, t, S('comet133'), '08 / 不必等彗星', '彗星难得回来，流星雨年年有', '英仙座流星雨的母彗星：斯威夫特-塔特尔彗星');
  const yearly = fade(t, at('comet133', '年年'));
  system(ctx, t, { bright: fade(t, at('comet133', '碎屑')), nodeA: 1, nodeLabel: t >= at('comet133', '年年') ? '年年都经过' : '交会处' });
  const L = laps(t), th = NODE + TAU * L;
  const fast = t > SPIN_A + 0.3 && t < SPIN_B - 0.5;
  if (fast) {
    alpha(ctx, 0.85, () => {
      ctx.save(); ctx.strokeStyle = C.blue; ctx.lineWidth = 12; ctx.shadowColor = C.blue; ctx.shadowBlur = 24;
      ctx.beginPath(); ctx.ellipse(VIEW.cx, VIEW.cy, VIEW.au, VIEW.au * VIEW.ky, 0, 0, TAU); ctx.stroke(); ctx.restore();
    });
  } else {
    earthAt(ctx, t, th, 44, { mood: t > SPIN_B ? 'proud' : 'normal' });
  }
  // the comet sweeps through the inner solar system exactly once
  const cp = prog(t, SPIN_A + 0.2, SPIN_B + 0.6);
  if (cp > 0 && cp < 1) {
    const nu = lerp(-2.3, 2.4, cp), p = project(cometPos(nu));
    const away = Math.atan2(p.y - VIEW.cy, p.x - VIEW.cx);
    const g = ctx.createLinearGradient(p.x, p.y, p.x + Math.cos(away) * 150, p.y + Math.sin(away) * 150);
    g.addColorStop(0, 'rgba(170,230,255,0.75)'); g.addColorStop(1, 'rgba(170,230,255,0)');
    ctx.save(); ctx.strokeStyle = g; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(away) * 150, p.y + Math.sin(away) * 150); ctx.stroke(); ctx.restore();
    glow(ctx, p.x, p.y, 36, 'rgba(170,230,255,0.6)');
    nucleus(ctx, p.x, p.y, 15, t, 1);
  }
  const comets = t >= SPIN_A + 0.2 + (SPIN_B + 0.4 - SPIN_A) * 0.5 ? 1 : 0;
  alpha(ctx, fade(t, SPIN_A - 0.3), () => {
    panel(ctx, 90, 1290, 430, 120, C.blue);
    text(ctx, '地球', 160, 1350, 32, C.blue);
    text(ctx, `${Math.round(L)} 圈`, 380, 1350, 52, C.white);
    panel(ctx, 560, 1290, 430, 120, C.gold);
    text(ctx, '彗星', 630, 1350, 32, C.gold);
    text(ctx, `${comets} 圈`, 850, 1350, 52, C.white);
  });
  alpha(ctx, yearly, () => glow(ctx, NODE_XY.x, NODE_XY.y, 150, 'rgba(255,225,150,0.3)'));
  alpha(ctx, fade(t, at('comet133', '碎屑')), () => pill(ctx, '碎屑流一直都在', 800, 560, C.gold, 34));
}

export const scenes = [
  { from: S('key'), to: S('comet133'), draw: calendarOrbit },
  { from: S('comet133'), to: S('vary'), draw: cometYears },
];
export const events = [
  ...[...Array(12)].map((_, k) => ({ type: 'tick', n: 72 + (k % 5) * 2, t: lerp(at('key', '日历'), at('key', '位置'), k / 12) })),
  { type: 'whoosh', t: LAP_START, d: LAP_END - LAP_START, amp: 0.25, from: 300, to: 900 },
  { type: 'ding', t: LAP_END, amp: 0.6 },
  { type: 'stamp', t: at('again', '又到') + 0.25 },
  { type: 'whoosh', t: SPIN_A, d: SPIN_B - SPIN_A, amp: 0.35, from: 400, to: 3000 },
  { type: 'ding', t: SPIN_B, n: 91, amp: 0.5 },
  { type: 'sparkle', t: at('comet133', '碎屑'), amp: 0.4 },
];
