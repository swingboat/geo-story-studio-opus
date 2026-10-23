// Scenes 5–6: two "nebula ID cards" side by side, then the takeaway checklist and a cast curtain call.
import { W, C, TAU, S, E, at, prog, lerp, easeOut, pop, fadeIn, txt, around, burst, shakeOf, confetti, talkLevel } from './lib.mjs';
import { nebulaCloud, ringNebula, protostar, sticker, tag } from './cast.mjs';
import { title } from './scenes-a.mjs';

function tick(ctx, x, y, s, color = C.ok) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 40 * s, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 10 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - 18 * s, y + 1 * s); ctx.lineTo(x - 5 * s, y + 15 * s); ctx.lineTo(x + 20 * s, y - 14 * s); ctx.stroke();
}

function stamp(ctx, x, y, text, color, k) {
  around(ctx, x, y, lerp(2.2, 1, k), k, () => {
    ctx.strokeStyle = color; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.roundRect(x - 104, y - 40, 208, 80, 16); ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(x - 93, y - 29, 186, 58, 10); ctx.stroke();
    txt(ctx, text, x, y + 2, { size: 44, color });
  }, -0.15);
}

// ---------- scene 5: ID cards ----------
const CARDS = [
  { y: 520, name: '猎户座大星云', from: '来源：恒星形成区', proc: '过程：致密区收缩成原恒星', stampTxt: '见证诞生', col: C.nebPink, stampCol: C.ok },
  { y: 950, name: '环状星云', from: '来源：恒星晚年抛出的外层物质', proc: '过程：外层物质向外散开', stampTxt: '记录晚年', col: C.ring, stampCol: C.ringOut },
];

function compareScene(ctx, t) {
  const t0 = S('sum1') - 0.3, tNot = at('sum1', '不全是');
  const tIn = [S('sum2') - 0.6, S('sum2') - 0.3], tStamp = [at('sum2', '见证诞生'), at('sum2', '记录晚年')];
  const tFrom = at('sum2', '来源'), tProc = at('sum2', '内部过程');
  title(ctx, t, t0, '同叫星云，来源不同', '星云 ≠ 都是恒星摇篮');
  const np = pop(t, at('sum1', '星云'), 0.4) * (1 - prog(t, tIn[0] - 0.3, tIn[0]));
  around(ctx, W / 2, 800, np, np, () => {
    sticker(ctx, W / 2, 800, 1.5, -0.06);
    const sl = easeOut(prog(t, tNot, tNot + 0.25));
    if (sl > 0) {
      ctx.strokeStyle = C.no; ctx.lineWidth = 22; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(W / 2 - 260, 690); ctx.lineTo(W / 2 - 260 + 520 * sl, 690 + 220 * sl); ctx.stroke();
    }
    const ta = fadeIn(t, tNot + 0.2, 0.3);
    if (ta > 0) txt(ctx, '不是每片星云都适用', W / 2, 1000, { size: 52, color: `rgba(255,201,60,${ta})`, stroke: '#0a0828', sw: 10 });
  });
  CARDS.forEach((c, i) => {
    const k = easeOut(prog(t, tIn[i], tIn[i] + 0.5));
    if (k <= 0) return;
    const x0 = lerp(i ? 1100 : -1000, 70, k), y = c.y;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.roundRect(x0 + 4, y + 12, 940, 370, 34); ctx.fill();
    ctx.fillStyle = 'rgba(20,18,60,0.94)';
    ctx.beginPath(); ctx.roundRect(x0, y, 940, 370, 34); ctx.fill();
    ctx.strokeStyle = c.col; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = c.col;
    ctx.beginPath(); ctx.roundRect(x0, y, 940, 64, [34, 34, 0, 0]); ctx.fill();
    txt(ctx, '星云身份证', x0 + 36, y + 33, { size: 34, color: C.space, align: 'left' });
    txt(ctx, `No.${i + 1}`, x0 + 904, y + 33, { size: 30, color: C.space, align: 'right' });
    ctx.save();
    ctx.beginPath(); ctx.roundRect(x0 + 30, y + 86, 260, 260, 24); ctx.clip();
    ctx.fillStyle = '#0a0a2a'; ctx.fillRect(x0 + 30, y + 86, 260, 260);
    if (i === 0) nebulaCloud(ctx, t, x0 + 160, y + 216, 150, { faceA: 1, stars: 1 });
    else ringNebula(ctx, t, x0 + 160, y + 216, 125, { starR: 34 });
    ctx.restore();
    txt(ctx, c.name, x0 + 320, y + 130, { size: 54, color: c.col, align: 'left' });
    const hl = (tt) => (t > tt - 0.05 && t < tt + 1.2 ? 'rgba(255,201,60,0.2)' : 'rgba(0,0,0,0)');
    for (const [s, tt, yy] of [[c.from, tFrom, 215], [c.proc, tProc, 290]]) {
      ctx.fillStyle = hl(tt);
      ctx.beginPath(); ctx.roundRect(x0 + 308, y + yy - 32, 610, 64, 16); ctx.fill();
      txt(ctx, s, x0 + 320, y + yy, { size: 36, color: C.white, align: 'left' });
    }
    ctx.restore();
    const sk = easeOut(prog(t, tStamp[i] - 0.1, tStamp[i] + 0.15));
    if (sk > 0) stamp(ctx, x0 + 815, y + 125, c.stampTxt, c.stampCol, sk);
  });
  const nA = fadeIn(t, tIn[1] + 0.6, 0.4);
  if (nA > 0) txt(ctx, '这里只展示两个例子，不是全部星云类型', W / 2, 1400, { size: 34, color: `rgba(255,255,255,${0.7 * nA})` });
}

// ---------- scene 6: takeaway + curtain call ----------
function endScene(ctx, t) {
  const t0 = S('end1') - 0.3, tHold = at('end1', '先别急'), tCradle = at('end1', '摇篮');
  const tQ1 = at('end2', '从哪里来'), tQ2 = at('end2', '发生什么'), tCta = S('cta') - 0.2, tCmt = at('cta', '评论区');
  title(ctx, t, t0, '先看来源，再下结论', '星云 ≠ 都是恒星摇篮');
  const away = prog(t, tCta - 0.4, tCta);
  // a new mystery nebula and a sticker that gets held back
  if (away < 1) {
    ctx.save();
    ctx.globalAlpha *= 1 - away;
    nebulaCloud(ctx, t, 540, 760, 280, { a: 0.75, stars: 0.5 });
    txt(ctx, '？', 540, 760 + Math.sin(t * 3) * 10, { size: 200, color: 'rgba(255,255,255,0.9)', stroke: '#0a0828', sw: 14 });
    const hold = easeOut(prog(t, tHold - 0.4, tHold));
    const back = easeOut(prog(t, tCradle + 0.2, tCradle + 0.8));
    const [sx] = shakeOf(t, tHold, 20, 0.6);
    const x = lerp(1250, 860, hold) + back * 400 + sx;
    sticker(ctx, x, 560, 0.9, 0.2);
    const hp = pop(t, tHold, 0.35) * (1 - prog(t, tQ1 - 0.4, tQ1));
    around(ctx, 300, 560, hp, hp, () => txt(ctx, '先别急！', 300, 560, { size: 76, color: C.no, stroke: '#0a0828', sw: 12 }), -0.08);
    // two-question checklist
    const cA = fadeIn(t, tQ1 - 0.4, 0.3);
    if (cA > 0) {
      ctx.globalAlpha *= cA;
      ctx.fillStyle = 'rgba(20,18,60,0.94)';
      ctx.beginPath(); ctx.roundRect(110, 1090, 860, 280, 30); ctx.fill();
      ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.stroke();
      [['① 它从哪里来？', tQ1, 1170], ['② 它正在发生什么？', tQ2, 1290]].forEach(([s, tt, y]) => {
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.roundRect(160, y - 34, 68, 68, 14); ctx.stroke();
        const k = pop(t, tt + 0.3, 0.35);
        if (k > 0) around(ctx, 194, y, k, 1, () => tick(ctx, 194, y, 0.95));
        txt(ctx, s, 270, y, { size: 52, color: t > tt ? C.white : 'rgba(255,255,255,0.55)', align: 'left' });
      });
    }
    ctx.restore();
  }
  // curtain call: the whole cast waves goodbye
  const k = easeOut(prog(t, tCta, tCta + 0.6));
  if (k > 0) {
    const hop = (i) => Math.abs(Math.sin(t * 4 + i)) * 18;
    nebulaCloud(ctx, t, 250, 820 - hop(0), 190 * k, { faceA: 1, talk: 0 });
    ringNebula(ctx, t, 830, 820 - hop(2), 165 * k, { starR: 46 * k, faceA: 1 });
    protostar(ctx, t, 540, 890 - hop(1), 92 * k, { mood: 'happy', heat: 0.9 });
    const qp = pop(t, tCta + 0.2, 0.45);
    around(ctx, W / 2, 1160, qp, qp, () => {
      txt(ctx, '你还认识哪些星云？', W / 2, 1160, { size: 76, color: C.white, stroke: '#0a0828', sw: 14 });
    });
    const cp = pop(t, tCmt, 0.45);
    around(ctx, W / 2, 1290, cp, cp, () => tag(ctx, W / 2, 1290, '评论区说说它的身世！', null, { color: C.gold, size: 52 }));
    confetti(ctx, t, tCmt);
  }
  burst(ctx, t, tCta + 0.3, W / 2, 860, { n: 14, r: 380, size: 26 });
}

export const scenesD = [
  { id: 'compare', from: S('sum1') - 0.3, to: S('end1') - 0.3, draw: compareScene },
  { id: 'end', from: S('end1') - 0.3, to: E('cta') + 10, draw: endScene },
];

export const eventsD = [
  { type: 'buzz', t: at('sum1', '不全是') },
  { type: 'whoosh', t: S('sum2') - 0.6, d: 0.5, from: 500, to: 2200 },
  { type: 'whoosh', t: S('sum2') - 0.3, d: 0.5, from: 500, to: 2200 },
  { type: 'stamp', t: at('sum2', '见证诞生') + 0.1 },
  { type: 'stamp', t: at('sum2', '记录晚年') + 0.1 },
  { type: 'alarm', t: at('end1', '先别急') },
  { type: 'tick', t: at('end2', '从哪里来') + 0.3, n: 79 },
  { type: 'tick', t: at('end2', '发生什么') + 0.3, n: 84 },
  { type: 'tada', t: S('cta') },
  { type: 'confetti', t: at('cta', '评论区') },
];
