// Scenes 1–2: 小宇 spots dark patches and imagines a black hole; the Sun protests; safety card for viewing the Sun.
import { C, TAU, S, E, at, prog, lerp, clamp, easeOut, pop, fadeIn, txt, around, burst, card, talkLevel, shakeOf, arrow } from './lib.mjs';
import { astronaut, glow } from './cast.mjs';
import { title, stamp } from './props.mjs';
import { sunBuddy } from './sun.mjs';
import { diskSpots } from './spot.mjs';
import { telescope, thought, blackHole, shockLines } from './gear.mjs';

const INK = '#0a0828';
const SUN = [730, 790], SR = 205;
export const SPOTS = [
  { u: 0.42, v: 0.3, s: 0.15, seed: 3 }, { u: 0.6, v: 0.18, s: 0.07, seed: 5 },
  { u: -0.5, v: -0.42, s: 0.09, seed: 8 }, { u: -0.33, v: -0.5, s: 0.05, seed: 9 },
];

function check(ctx, x, y, s, p, ok) {
  if (p <= 0) return;
  around(ctx, x, y, pop(p, 0, 1) * s, 1, () => {
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [col, w] of [[INK, 40], [ok ? C.mint : C.no, 24]]) {
      ctx.strokeStyle = col; ctx.lineWidth = w;
      ctx.beginPath();
      if (ok) { ctx.moveTo(x - 50, y); ctx.lineTo(x - 12, y + 40); ctx.lineTo(x + 60, y - 50); }
      else { ctx.moveTo(x - 45, y - 45); ctx.lineTo(x + 45, y + 45); ctx.moveTo(x + 45, y - 45); ctx.lineTo(x - 45, y + 45); }
      ctx.stroke();
    }
    ctx.restore();
  });
}

// ---------- scene 1: "黑点点…黑洞？！" ----------
function hookScene(ctx, t) {
  const tDots = at('spot', '黑点点'), tHole = at('hole', '黑洞'), tNo = S('sunNo'), tName = at('sunNo', '黑子');
  title(ctx, t, 0.3, '太阳脸上的黑点点', '是什么？', { y: 300, size: 76, t1: tNo - 0.2 });
  title(ctx, t, tNo, '太阳：那是我的黑子！', null, { y: 300, size: 72, color: C.gold });

  const angry = prog(t, tNo - 0.1, tNo + 0.1) * (1 - prog(t, E('sunNo') + 0.1, E('sunNo') + 0.4));
  const [jx, jy] = shakeOf(t, tNo, 22, 0.6);
  const sIn = pop(t, 0.3, 0.7);
  const grow = (i) => easeOut(prog(t, tDots - 0.5 + i * 0.12, tDots + i * 0.12));
  around(ctx, SUN[0], SUN[1], sIn, sIn, () => {
    const x = SUN[0] + jx, y = SUN[1] + jy;
    sunBuddy(ctx, t, x, y, SR, {
      talk: talkLevel(t, ['sunNo']), mood: angry > 0.5 ? 'angry' : t > tHole ? 'wow' : 'happy', look: -0.7, lookY: 0.4,
      inside: () => diskSpots(ctx, 0, x, y, SR, SPOTS, { grow }),
    });
    if (angry > 0) {
      shockLines(ctx, t, x, y, SR * 1.25, angry, C.no);
      // little steam puffs of annoyance
      glow(ctx, x + SR * 0.85, y - SR * 0.9, 0, 50 * angry, 'rgba(255,90,90,0.6)');
    }
  });

  // dashed ring + "?" calling attention to the spots
  const ring = fadeIn(t, tDots, 0.3) * (1 - prog(t, tHole - 0.2, tHole));
  if (ring > 0) {
    const rx = SUN[0] + 0.42 * SR, ry = SUN[1] + 0.3 * SR;
    ctx.save(); ctx.globalAlpha *= ring;
    ctx.strokeStyle = C.sky; ctx.lineWidth = 7; ctx.setLineDash([18, 12]); ctx.lineDashOffset = -t * 40;
    ctx.beginPath(); ctx.arc(rx, ry, 70 + 6 * Math.sin(t * 6), 0, TAU); ctx.stroke();
    ctx.restore();
    txt(ctx, '？', rx + 90, ry - 90 + Math.sin(t * 5) * 8, { size: 90, color: C.gold, stroke: INK, sw: 10 });
  }

  // 小宇's imagination: a black hole gobbling the Sun
  const bub = pop(t, tHole - 0.35, 0.5) * (1 - prog(t, tNo + 0.25, tNo + 0.45));
  thought(ctx, 290, 590, 440, 310, 230, 980, bub, () => {
    const bx = 290, by = 590;
    blackHole(ctx, t, bx, by, 52, { rays: 0.8 });
    const sp = (t * 0.9) % 1, ang = sp * TAU * 1.5;
    const d = lerp(150, 40, sp);
    sunBuddy(ctx, t, bx + Math.cos(ang) * d, by + Math.sin(ang) * d * 0.6, lerp(34, 6, sp), { mood: 'wow', faceA: 1 - sp });
  });
  burst(ctx, t, tNo + 0.25, 290, 590, { n: 10, r: 260 });

  // "黑子" stamp with a pointer at the spots
  const sp = pop(t, tName - 0.1, 0.45);
  if (sp > 0) {
    const tx = 300, ty = 600, sx = SUN[0] + 0.42 * SR, sy = SUN[1] + 0.3 * SR;
    ctx.save(); ctx.globalAlpha *= clamp(sp);
    arrow(ctx, tx + 60, ty + 80, sx - 40, sy - 26, { color: C.gold, w: 9, head: 34, p: easeOut(prog(t, tName, tName + 0.35)) });
    ctx.restore();
    stamp(ctx, tx, ty, '黑子', sp, { size: 100 });
  }

  // 小宇 with a filtered telescope
  const fly = easeOut(prog(t, 0.2, 1.2));
  const tAng = Math.atan2(SUN[1] - 1180, SUN[0] - 490);
  telescope(ctx, t, lerp(-300, 490, fly), 1180, 0.78, { ang: tAng, filter: 1 });
  const scared = prog(t, tHole - 0.2, tHole + 0.1) * (1 - prog(t, tNo + 0.4, tNo + 0.8));
  astronaut(ctx, t, lerp(-200, 210, fly), 1170 - scared * 30, 0.7, {
    talk: talkLevel(t, ['spot', 'hole']), look: 1, lookY: -1, arm: -0.7,
    mood: scared > 0.5 ? 'wow' : angry > 0.5 ? 'sad' : 'happy', scratch: angry > 0.5 ? 1 : 0,
  });
}

// ---------- scene 2: how to look at the Sun safely ----------
function eye(ctx, t, x, y, s, hurt) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#fff'; ctx.strokeStyle = INK; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(-120, 0); ctx.quadraticCurveTo(0, -110, 120, 0); ctx.quadraticCurveTo(0, 110, -120, 0); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#4a7bd0'; ctx.beginPath(); ctx.arc(0, 0, 44, 0, TAU); ctx.fill();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0, 0, 20 * (1 - 0.5 * hurt), 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(14, -14, 9, 0, TAU); ctx.fill();
  ctx.restore();
}

function safeScene(ctx, t) {
  const t0 = S('safe'), tOk = at('safe', '滤光镜'), tNo = at('safe', '直接看');
  title(ctx, t, t0, '安全第一！', '看太阳，先护眼', { size: 84 });
  const L = [90, 560, 430, 640], Rr = [560, 560, 430, 640];
  const lp = pop(t, t0 + 0.15, 0.5), rp = pop(t, tNo - 0.5, 0.5);
  around(ctx, L[0] + L[2] / 2, L[1] + L[3] / 2, lp, lp, () => {
    card(ctx, ...L, { fill: 'rgba(8,10,36,0.88)', edge: C.mint, ew: 6, drop: 0 });
    sunBuddy(ctx, t, L[0] + 330, L[1] + 120, 60, { mood: 'happy', look: -0.5 });
    telescope(ctx, t, L[0] + 170, L[1] + 330, 0.55, { ang: -0.62, filter: easeOut(prog(t, tOk - 0.4, tOk + 0.2)) });
    txt(ctx, '专业太阳滤光镜', L[0] + L[2] / 2, L[1] + 570, { size: 44, color: C.mint });
  });
  check(ctx, L[0] + L[2] - 60, L[1] + 60, 0.8, prog(t, tOk, tOk + 0.4), true);
  const [sx, sy] = shakeOf(t, tNo + 0.2, 16, 0.5);
  around(ctx, Rr[0] + Rr[2] / 2 + sx, Rr[1] + Rr[3] / 2 + sy, rp, rp, () => {
    card(ctx, ...Rr, { fill: 'rgba(8,10,36,0.88)', edge: C.no, ew: 6, drop: 0 });
    const hurt = prog(t, tNo, tNo + 0.4);
    glow(ctx, Rr[0] + 215, Rr[1] + 290, 0, 200, `rgba(255,240,180,${0.3 + 0.5 * hurt})`);
    sunBuddy(ctx, t, Rr[0] + 330, Rr[1] + 120, 60, { mood: 'wow', look: -0.5 });
    eye(ctx, t, Rr[0] + 200, Rr[1] + 330, 1, hurt);
    txt(ctx, '肉眼直接看', Rr[0] + Rr[2] / 2, Rr[1] + 570, { size: 44, color: C.no });
  });
  check(ctx, Rr[0] + Rr[2] - 60, Rr[1] + 60, 0.8, prog(t, tNo + 0.1, tNo + 0.5), false);
}

export const scenes = [
  { id: 'hook', from: 0, to: S('safe') - 0.25, draw: hookScene },
  { id: 'safe', from: S('safe') - 0.25, to: S('photo') - 0.25, draw: safeScene },
];

export const events = [
  { type: 'sparkle', t: 0.4 }, { type: 'boing', t: 0.5, amp: 0.7 },
  ...[0, 1, 2, 3].map((i) => ({ type: 'pop', t: at('spot', '黑点点') - 0.4 + i * 0.12, f: 500 + i * 120 })),
  { type: 'whoosh', t: at('hole', '黑洞') - 0.4, d: 0.8, from: 2400, to: 200, amp: 0.7 },
  { type: 'alarm', t: S('sunNo') - 0.05 },
  { type: 'slam', t: at('sunNo', '黑子') - 0.05 },
  { type: 'ding', t: at('safe', '滤光镜') + 0.1, n: 88 },
  { type: 'buzz', t: at('safe', '直接看') + 0.1 },
];
