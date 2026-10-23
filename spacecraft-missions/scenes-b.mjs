// Scenes 5–9: 天宫's microgravity lab → 豆豆 asks about navigation → 北斗's team → how positioning works → 定位·导航·授时.
import { W, C, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, around, burst, card, talkLevel, rings } from './lib.mjs';
import { kid, glow } from './chars.mjs';
import { beidou } from './craft.mjs';
import { banner, bubble, astro, groundStation, phone, clock, stamp } from './props.mjs';

// ---------- scene 5: experiments + why microgravity matters ----------
function waterFlame(ctx, t, x, y, space) {
  // water: a falling stream on the ground, a wobbling floating ball in orbit
  if (!space) {
    ctx.fillStyle = C.sky;
    for (let k = 0; k < 4; k++) {
      const yy = y - 90 + ((t * 220 + k * 40) % 160);
      ctx.beginPath(); ctx.ellipse(x - 70, yy, 9, 14, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(x - 110, y + 40); ctx.lineTo(x - 100, y + 100); ctx.lineTo(x - 40, y + 100); ctx.lineTo(x - 30, y + 40); ctx.stroke();
  } else {
    const wob = Math.sin(t * 5) * 6;
    glow(ctx, x - 70, y, 10, 70, 'rgba(76,201,240,0.35)');
    ctx.fillStyle = C.sky;
    ctx.beginPath(); ctx.ellipse(x - 70, y + Math.sin(t * 2) * 10, 44 + wob, 44 - wob, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.ellipse(x - 84, y - 14, 10, 14, 0.5, 0, Math.PI * 2); ctx.fill();
  }
  // candle flame: tall teardrop on the ground, a round blue ball in microgravity
  ctx.fillStyle = '#e9e1cf'; ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(x + 55, y + 30, 30, 70, 6); ctx.fill(); ctx.stroke();
  const fx = x + 70, fy = y + 10;
  if (!space) {
    const f = 1 + Math.sin(t * 14) * 0.06;
    glow(ctx, fx, fy - 30, 5, 70, 'rgba(255,170,60,0.5)');
    ctx.fillStyle = '#ffb627';
    ctx.beginPath(); ctx.moveTo(fx, fy - 90 * f); ctx.quadraticCurveTo(fx + 30, fy - 10, fx, fy + 6); ctx.quadraticCurveTo(fx - 30, fy - 10, fx, fy - 90 * f); ctx.fill();
  } else {
    glow(ctx, fx, fy - 18, 5, 60, 'rgba(110,160,255,0.55)');
    ctx.fillStyle = '#6fa0ff';
    ctx.beginPath(); ctx.arc(fx, fy - 18, 26 + Math.sin(t * 6) * 2, 0, Math.PI * 2); ctx.fill();
  }
}

function labScene(ctx, t) {
  const tExp = at('tgLab', '科学实验'), tMicro = at('tgLab', '微重力'), tHard = at('tgLab', '很难');
  const split = easeIO(prog(t, tMicro - 0.3, tMicro + 0.3));
  // lab rack with blinking experiment boxes; it slides up and shrinks when the comparison appears
  const ry = lerp(880, 680, split), rs = lerp(1, 0.7, split);
  around(ctx, W / 2, ry, rs, 1, () => {
    card(ctx, 180, ry - 230, 720, 460, { fill: '#dfe6f5', edge: C.ink, ew: 6, r: 30, drop: 12 });
    [330, 540, 750].forEach((bx, i) => {
      const p = pop(t, tExp - 0.2 + i * 0.15, 0.4);
      around(ctx, bx, ry - 60, p, 1, () => {
        card(ctx, bx - 85, ry - 170, 170, 220, { fill: '#16244f', edge: C.ink, ew: 5, r: 18, drop: 0 });
        if (i === 0) {
          const g = clamp((t - tExp) / 3);
          ctx.strokeStyle = C.mint; ctx.lineWidth = 8; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(bx, ry + 20); ctx.lineTo(bx, ry + 20 - 120 * g); ctx.stroke();
          ctx.fillStyle = C.mint;
          for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(bx + k * 26, ry + 20 - 100 * g, 24 * g, 12 * g, k * 0.5, 0, Math.PI * 2); ctx.fill(); }
        } else if (i === 1) {
          ctx.fillStyle = C.lilac;
          ctx.save(); ctx.translate(bx, ry - 60); ctx.rotate(t * 0.8);
          ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(36, 0); ctx.lineTo(0, 50); ctx.lineTo(-36, 0); ctx.closePath(); ctx.fill();
          ctx.restore();
        } else {
          for (let k = 0; k < 6; k++) {
            ctx.fillStyle = k % 2 ? C.pink : C.gold;
            ctx.beginPath(); ctx.arc(bx + Math.cos(t + k) * 40, ry - 60 + Math.sin(t * 1.3 + k * 2) * 50, 12, 0, Math.PI * 2); ctx.fill();
          }
        }
        ctx.fillStyle = Math.sin(t * 6 + i * 2) > 0 ? C.ok : '#334';
        ctx.beginPath(); ctx.arc(bx + 60, ry + 30, 9, 0, Math.PI * 2); ctx.fill();
      });
    });
    astro(ctx, t, 850, ry + 170 + Math.sin(t * 2) * 8, 0.8, { rot: -0.3 });
  });
  banner(ctx, t, '科学实验', W / 2, lerp(580, 520, split), tExp - 0.15, 1e9, { size: 46, fill: C.tg });
  if (split <= 0) return;
  // ground vs orbit comparison
  [['地面', false, 290], ['太空 · 微重力', true, 790]].forEach(([label, space, x], i) => {
    const p = pop(t, tMicro + i * 0.25, 0.45);
    around(ctx, x, 1035, p, 1, () => {
      card(ctx, x - 230, 880, 460, 310, { fill: space ? '#16244f' : '#fff6e0', edge: space ? C.tg : C.ink, ew: 6, r: 30, drop: 10 });
      txt(ctx, label, x, 925, { size: 38, color: space ? C.tg : C.ink });
      waterFlame(ctx, t, x, 1065, space);
    });
  });
  banner(ctx, t, '微重力：地面很难长时间做到', W / 2, 1262, tHard - 0.1, 1e9, { size: 36, fill: C.gold });
}

// ---------- scene 6: whose help is my phone's navigation? → 北斗 + friends ----------
const FRIENDS = [[250, 620, 0.42], [560, 560, 0.38], [880, 700, 0.4]];
function helloBeidou(ctx, t) {
  const tHi = S('bdHi'), tTeam = at('bdHi', '单打独斗');
  const kp = easeOut(prog(t, S('kidNav') - 0.4, S('kidNav') + 0.1));
  kid(ctx, t, lerp(-200, 220, kp), 1270, 0.85, { talk: talkLevel(t, ['kidNav']), phone: 1, mood: t < tHi ? 'wow' : 'happy' });
  bubble(ctx, t, '谁在帮我导航？', 360, 760, at('kidNav', '导航'), { tx: 230, ty: 860, size: 44, t1: tHi + 0.4 });
  // 北斗 flies down from the top right
  const fp = easeOut(prog(t, tHi - 0.4, tHi + 0.5));
  const bx = lerp(1300, 700, fp), by = lerp(300, 880, fp);
  if (fp > 0) {
    rings(ctx, t, bx, by + 100, { alpha: fp * 0.8, r: 300 });
    beidou(ctx, t, bx, by, 0.95, { talk: talkLevel(t, ['bdHi']), wave: t < at('bdHi', '不过') ? 1 : 0, mood: 'happy' });
    burst(ctx, t, tHi + 0.2, bx, by, { r: 300, n: 12, colors: [C.bd, C.white, C.sky] });
  }
  // friends join in: "not fighting alone"
  FRIENDS.forEach(([x, y, s], i) => {
    const p = pop(t, tTeam - 0.2 + i * 0.12, 0.45);
    around(ctx, x, y, p, 1, () => {
      rings(ctx, t + i * 0.3, x, y + 50, { r: 140, w: 4, alpha: 0.6 });
      beidou(ctx, t + i, x, y, s, { mood: 'wink', rot: Math.sin(t * 1.5 + i) * 0.08 });
    });
  });
}

// ---------- scene 7: the three teams — space, ground and user segments ----------
const GROUND = 1150;
function teamScene(ctx, t) {
  const t1 = at('bdTeam', '卫星'), t2 = at('bdTeam', '站点'), t3 = at('bdTeam', '终端');
  // ground strip
  ctx.fillStyle = '#2a6b4f';
  ctx.beginPath(); ctx.roundRect(40, GROUND, 1000, 110, 30); ctx.fill();
  ctx.fillStyle = C.land; ctx.beginPath(); ctx.roundRect(40, GROUND - 10, 1000, 30, 15); ctx.fill();
  const sats = [[230, 640], [540, 590], [850, 640]];
  sats.forEach(([x, y], i) => {
    const p = pop(t, t1 - 0.25 + i * 0.1, 0.45);
    around(ctx, x, y, p, 1, () => beidou(ctx, t + i, x, y + Math.sin(t * 2 + i) * 8, 0.5, { mood: 'happy' }));
  });
  const gp = pop(t, t2 - 0.2, 0.45);
  around(ctx, 250, GROUND, gp, 1, () => groundStation(ctx, t, 250, GROUND, 1.1, { aim: -1.1 + Math.sin(t) * 0.1 }));
  const up = easeOut(prog(t, t3 - 0.4, t3 + 0.1));
  kid(ctx, t, lerp(1250, 800, up), GROUND + 10, 0.75, { phone: 1, mood: 'happy', flip: -1 });
  // labels
  [['空间段', '卫星', 540, 790, t1, C.bd], ['地面段', '站点', 250, 1010, t2, C.mint], ['用户段', '终端', 760, 870, t3, C.pink]].forEach(([a, b, x, y, tt, col]) => {
    const p = pop(t, tt, 0.4);
    around(ctx, x, y, p, 1, () => {
      card(ctx, x - 120, y - 40, 240, 80, { fill: col, ew: 0, r: 40, drop: 6 });
      txt(ctx, `${a} · ${b}`, x, y + 2, { size: 36, color: C.space });
    });
  });
  // collaboration loop once all three are on stage
  const lp = easeOut(prog(t, t3 + 0.3, t3 + 1.2));
  if (lp > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 5; ctx.setLineDash([14, 14]); ctx.lineDashOffset = -t * 50;
    ctx.globalAlpha = lp;
    ctx.beginPath(); ctx.moveTo(300, 690); ctx.lineTo(260, 990); ctx.moveTo(380, 1040); ctx.lineTo(700, 1010); ctx.moveTo(780, 1000); ctx.lineTo(820, 700); ctx.stroke();
    ctx.restore();
  }
}

// ---------- scene 8: satellites broadcast, the terminal works out where it is ----------
const SKY = [[170, 640], [420, 570], [680, 580], [920, 660]];
function signalScene(ctx, t) {
  const tSig = at('bdSig', '信号'), tMany = at('bdSig', '好几颗'), tCalc = at('bdSig', '算出');
  SKY.forEach(([x, y], i) => {
    const p = pop(t, S('bdSig') - 0.2 + i * 0.08, 0.4);
    around(ctx, x, y, p, 1, () => {
      rings(ctx, t + i * 0.25, x, y + 50, { r: 220, alpha: fadeIn(t, tSig - 0.3, 0.4), w: 5 });
      beidou(ctx, t + i, x, y, 0.4, { mood: 'happy' });
    });
  });
  const ph = phone;
  const lp = easeOut(prog(t, tMany - 0.2, tMany + 0.6));
  if (lp > 0) {
    ctx.save();
    ctx.strokeStyle = C.signal; ctx.lineWidth = 4; ctx.setLineDash([10, 12]); ctx.lineDashOffset = -t * 80;
    SKY.forEach(([x, y]) => {
      ctx.beginPath(); ctx.moveTo(x, y + 60); ctx.lineTo(lerp(x, 528, lp), lerp(y + 60, 1090, lp)); ctx.stroke();
    });
    ctx.restore();
  }
  ph(ctx, t, W / 2, 1040, 0.85, { calc: prog(t, tMany + 0.4, tCalc + 0.1), pin: prog(t, tCalc, tCalc + 0.4) });
  bubble(ctx, t, '我在这儿！', 790, 920, tCalc + 0.3, { tx: 560, ty: 1080, size: 44, fill: C.gold });
  banner(ctx, t, '终端自己算位置', 280, 900, tCalc + 0.1, 1e9, { size: 36, fill: C.cream, color: C.ink });
}

// ---------- scene 9: 定位 · 导航 · 授时 stamps, then clocks snap into sync ----------
function threeScene(ctx, t) {
  const words = ['定位', '导航', '授时'], cols = [C.no, C.sky, C.bd];
  words.forEach((w, i) => {
    const tw = at('bdThree', w);
    stamp(ctx, 200 + i * 340, 640, 0.9, w, cols[i], prog(t, tw - 0.1, tw + 0.2), -0.12 + i * 0.1);
  });
  const tTime = at('bdTime', '对得'), swap = easeIO(prog(t, S('bdTime') - 0.4, S('bdTime')));
  around(ctx, W / 2, 1010, 1, 1 - swap, () => {
    phone(ctx, t, W / 2, 1010, 0.7, { pin: 1, route: prog(t, at('bdThree', '导航'), at('bdThree', '导航') + 1.4) });
    beidou(ctx, t, 830, 900, 0.45, { talk: talkLevel(t, ['bdThree']), mood: 'happy' });
  });
  if (swap > 0) {
    const sync = easeOut(prog(t, tTime, tTime + 0.5));
    [[220, 2.3], [540, 9.7], [860, 6.1]].forEach(([x, wrong], i) => {
      const p = pop(t, S('bdTime') - 0.2 + i * 0.1, 0.4);
      const spin = wrong + t * (0.5 + i * 0.4);
      const time = lerp(spin, 10.25 + (t - tTime) * 0.02, sync);
      around(ctx, x, 1010, p, 1, () => clock(ctx, x, 1010, 120, time, { ok: sync }), Math.sin(t * 9 + i) * 0.08 * (1 - sync));
    });
    banner(ctx, t, '时间对得准准的', W / 2, 1220, tTime + 0.2, 1e9, { size: 44, fill: C.ok });
    burst(ctx, t, tTime + 0.3, W / 2, 1010, { r: 380, n: 14 });
  }
}

export const scenes = [
  { from: S('tgLab') - 0.3, to: S('kidNav') - 0.4, draw: labScene },
  { from: S('kidNav') - 0.4, to: S('bdTeam') - 0.3, draw: helloBeidou },
  { from: S('bdTeam') - 0.3, to: S('bdSig') - 0.3, draw: teamScene },
  { from: S('bdSig') - 0.3, to: S('bdThree') - 0.3, draw: signalScene },
  { from: S('bdThree') - 0.3, to: S('kidMoon') - 0.4, draw: threeScene },
];

export const events = [
  { type: 'whoosh', t: S('tgLab') - 0.3, d: 0.4 },
  { type: 'sparkle', t: at('tgLab', '科学实验') },
  { type: 'wobble', t: at('tgLab', '微重力'), d: 1.4, f: 300, rate: 4, amp: 0.4 },
  { type: 'buzz', t: at('tgLab', '很难') },
  { type: 'whoosh', t: S('kidNav') - 0.4, d: 0.4 },
  { type: 'boing', t: at('kidNav', '导航'), amp: 0.5 },
  { type: 'whoosh', t: S('bdHi') - 0.4, d: 0.8, from: 3000, to: 500 },
  { type: 'tada', t: S('bdHi') + 0.2, amp: 0.7 },
  { type: 'pop', t: at('bdHi', '单打独斗') - 0.2, f: 700 },
  { type: 'pop', t: at('bdHi', '单打独斗') - 0.08, f: 850 },
  { type: 'pop', t: at('bdHi', '单打独斗') + 0.04, f: 1000 },
  { type: 'whoosh', t: S('bdTeam') - 0.3, d: 0.4 },
  { type: 'note', t: at('bdTeam', '卫星'), n: 72 },
  { type: 'note', t: at('bdTeam', '站点'), n: 76 },
  { type: 'note', t: at('bdTeam', '终端'), n: 79 },
  { type: 'whoosh', t: S('bdSig') - 0.3, d: 0.4 },
  { type: 'zap', t: at('bdSig', '信号'), amp: 0.7 },
  { type: 'zap', t: at('bdSig', '好几颗'), amp: 0.7 },
  { type: 'scribble', t: at('bdSig', '好几颗') + 0.4, d: 1.0 },
  { type: 'ding', t: at('bdSig', '算出') + 0.3, n: 91 },
  { type: 'stamp', t: at('bdThree', '定位') + 0.05, shake: 8 },
  { type: 'stamp', t: at('bdThree', '导航') + 0.05, shake: 8 },
  { type: 'stamp', t: at('bdThree', '授时') + 0.05, shake: 8 },
  { type: 'tick', t: S('bdTime'), n: 84 },
  { type: 'tick', t: S('bdTime') + 0.5, n: 86 },
  { type: 'ding', t: at('bdTime', '对得') + 0.3, n: 88 },
];
