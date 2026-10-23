// Scenes 10–13: 嫦娥五号 — meet the four-part probe on the Moon → sample & lift off → dock and transfer in lunar orbit → returner brings it home.
import { W, C, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, around, burst, card, talkLevel, confetti } from './lib.mjs';
import { kid, moon, earth, glow } from './chars.mjs';
import { lander, ascender, orbiter, returner, sampleJar } from './craft.mjs';
import { banner, bubble } from './props.mjs';

// Lunar surface: a huge grey disc rising from the bottom with craters.
function surface(ctx, t, top) {
  ctx.save();
  ctx.fillStyle = '#b9bcc8';
  ctx.beginPath(); ctx.ellipse(W / 2, top + 900, 1400, 900, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#9ea2b0';
  for (const [x, dy, r] of [[150, 60, 46], [420, 140, 30], [760, 70, 54], [960, 160, 34], [300, 230, 40]]) {
    ctx.beginPath(); ctx.ellipse(x, top + dy, r, r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function tag(ctx, t, s, x, y, t0, col) {
  const p = pop(t, t0, 0.4);
  around(ctx, x, y, p, 1, () => {
    card(ctx, x - 130, y - 32, 260, 64, { fill: col, ew: 0, r: 32, drop: 6 });
    txt(ctx, s, x, y + 2, { size: 32, color: C.space });
  });
}

// ---------- scene 10: "what's Chang'e doing on the Moon?" → the probe lands and introduces itself ----------
function meetScene(ctx, t) {
  const tHi = S('ceHi'), t2020 = at('ceHi', '2020'), tSoil = at('ceHi', '取土');
  const zoom = easeIO(prog(t, tHi - 0.5, tHi + 0.4));
  // before: the kid points at a smiling Moon
  if (zoom < 1) around(ctx, W / 2, 900, 1 + zoom * 0.6, 1 - zoom, () => {
    moon(ctx, t, 760, 760, 170, { face: true, mood: 'happy' });
    kid(ctx, t, 230, 1270, 0.85, { talk: talkLevel(t, ['kidMoon']), point: 1, mood: 'wow' });
    bubble(ctx, t, '去月亮上干嘛？', 380, 820, at('kidMoon', '月亮'), { tx: 270, ty: 920, size: 44 });
  });
  if (zoom <= 0) return;
  ctx.save();
  ctx.globalAlpha *= zoom;
  surface(ctx, t, lerp(1500, 1160, zoom));
  // orbiter + returner pass overhead
  const ox = lerp(1250, 700, easeOut(prog(t, tHi, tHi + 1.4)));
  orbiter(ctx, t, ox, 640, 0.6, {});
  tag(ctx, t, '轨道器 + 返回器', 680, 750, tHi + 1.0, C.cool);
  // lander + ascender touch down
  const land = easeOut(prog(t, tHi - 0.2, tHi + 1.0));
  const ly = lerp(820, 1190, land);
  if (land < 1) glow(ctx, W / 2 - 60, ly, 5, 120 * (1 - land), 'rgba(255,190,90,0.5)');
  lander(ctx, t, W / 2 - 60, ly, 0.85, { talk: talkLevel(t, ['ceHi']), mood: t > tSoil ? 'starry' : 'happy' });
  tag(ctx, t, '着陆器 + 上升器', 800, 900, tHi + 1.2, C.ce);
  // 2020 stamp
  const sp = pop(t, t2020, 0.4);
  around(ctx, 210, 820, sp, 1, () => {
    ctx.fillStyle = C.ce; ctx.beginPath(); ctx.arc(210, 820, 90, 0, Math.PI * 2); ctx.fill();
    txt(ctx, '2020', 210, 806, { size: 54, color: C.space });
    txt(ctx, '年任务', 210, 856, { size: 30, color: C.space });
  }, -0.15);
  ctx.restore();
}

// ---------- scene 11: scoop + drill the soil, then the ascender lifts off with the sample ----------
function digScene(ctx, t) {
  const tSam = at('ceDig', '采样'), tUp = at('ceDig', '上升器'), tLeave = at('ceDig', '离开月球');
  surface(ctx, t, 1160);
  const LX = W / 2 - 80, LY = 1190;
  const arm = 0.5 + 0.5 * Math.sin(Math.max(0, t - S('ceDig') + 0.2) * 4);
  const lift = easeIO(prog(t, tLeave - 0.4, tLeave + 1.2));
  // soil grains hop from the scoop into the sample canister
  const jarX = LX, jarY = LY - 235 * 0.85 - 40 * 0.85 * 0.9;
  lander(ctx, t, LX, LY, 0.85, { ascender: false, arm: t < tUp ? arm : lerp(arm, 0, prog(t, tUp - 0.3, tUp)), drill: t > tSam ? 1 : 0, mood: lift > 0 ? 'wow' : 'happy' });
  const ay = lerp(LY - 235 * 0.85, 520, lift);
  ascender(ctx, t, LX, ay, 0.77, { flame: lift > 0 ? 1 : 0, sample: t > tSam + 0.8 });
  if (t > tSam && t < tUp) {
    for (let k = 0; k < 4; k++) {
      const ph = ((t - tSam) * 1.3 + k / 4) % 1;
      const x = lerp(LX + 240, jarX, ph), y = lerp(LY - 30, jarY, ph) - Math.sin(ph * Math.PI) * 120;
      ctx.fillStyle = '#7b7e8c'; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
    }
  }
  if (lift > 0) {
    // dust kicked up by the ascender engine
    ctx.fillStyle = `rgba(225,226,234,${0.7 * (1 - lift)})`;
    for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.ellipse(LX + (k - 2.5) * 80 * (1 + lift), LY - 10, 50 + lift * 40, 22 + lift * 10, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  banner(ctx, t, '① 月面采样', W / 2, 590, tSam - 0.2, tUp - 0.2, { size: 46, fill: C.ce });
  banner(ctx, t, '② 上升器带样品起飞', W / 2, 590, tUp, 1e9, { size: 46, fill: C.ce });
  tag(ctx, t, '着陆器留在月面', 760, 1250, tLeave + 0.4, C.cream);
}

// ---------- scene 12: rendezvous & docking in lunar orbit, sample moves into the returner ----------
function dockScene(ctx, t) {
  const tDock = at('ceDock', '对接'), tMove = at('ceDock', '转移');
  moon(ctx, t, W / 2, 1320, 330, { face: false });
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 4; ctx.setLineDash([16, 16]);
  ctx.beginPath(); ctx.ellipse(W / 2, 1320, 520, 560, 0, Math.PI, Math.PI * 2); ctx.stroke();
  ctx.restore();
  const OX = 560, OY = 820;
  orbiter(ctx, t, OX, OY, 0.9, {});
  // ascender rises from the Moon to the orbiter's right end
  const app = easeIO(prog(t, S('ceDock') - 0.3, tDock + 0.1));
  const ax = lerp(900, OX + 210, app), ay = lerp(1180, OY + 45, app);
  ascender(ctx, t, ax, ay, 0.7, { flame: app < 1 ? 0.6 : 0 });
  burst(ctx, t, tDock + 0.1, OX + 160, OY, { r: 220, n: 12 });
  // the sample canister moves along the stack into the returner
  const mv = easeIO(prog(t, tMove - 0.3, tMove + 0.9));
  if (t > S('ceDock') - 0.3) {
    const jx = lerp(ax, OX - 135, mv), jy = lerp(ay - 35, OY - 10, mv) - Math.sin(mv * Math.PI) * 120;
    sampleJar(ctx, jx, jy, 0.75, { shine: mv > 0 && mv < 1 ? 1 : 0.4 });
  }
  banner(ctx, t, '③ 环月轨道 · 交会对接', W / 2, 590, tDock - 0.4, tMove - 0.3, { size: 44, fill: C.cool });
  banner(ctx, t, '④ 样品转移进返回器', W / 2, 590, tMove - 0.2, 1e9, { size: 44, fill: C.cool });
  tag(ctx, t, '返回器', 290, 700, tMove + 0.5, C.gold);
}

// ---------- scene 13: the returner comes home; samples go to scientists ----------
function homeScene(ctx, t) {
  const t0 = S('ceHome') - 0.3, tHome = at('ceHome', '回到地球'), tSci = S('ceSci'), tStudy = at('ceSci', '研究');
  const toSci = easeIO(prog(t, tSci - 0.4, tSci + 0.3));
  earth(ctx, t, W / 2, lerp(1800, 2100, toSci), 650, { face: false, light: -1.6 });
  // orbiter carries the returner in, they separate, the returner re-enters and floats down under its chute
  const sep = prog(t, t0 + 0.6, t0 + 1.2);
  const cx = lerp(150, 520, easeOut(prog(t, t0, t0 + 0.8)));
  if (sep < 1) orbiter(ctx, t, cx + 150 * 0.7 + sep * 300, 640 - sep * 200, 0.7, { withReturner: false });
  const fall = easeIO(prog(t, t0 + 0.8, tHome + 0.4));
  const rx = lerp(cx, W / 2, fall), ry = lerp(640, 1090, fall);
  const heat = Math.sin(Math.PI * prog(t, t0 + 1.0, tHome - 0.3));
  const chute = easeOut(prog(t, tHome - 0.4, tHome + 0.2));
  if (toSci < 1) around(ctx, rx, ry, 1, 1 - toSci, () =>
    returner(ctx, t, rx, ry, 0.95, { rot: lerp(-0.6, 0, fall), heat, chute, faceOn: true, mood: chute > 0.5 ? 'starry' : 'happy' }));
  banner(ctx, t, '⑤ 返回器带样品回家', W / 2, 590, t0 + 0.2, tSci - 0.4, { size: 46, fill: C.gold });
  burst(ctx, t, tHome + 0.2, W / 2, 1050, { r: 300, n: 14 });
  if (toSci <= 0) return;
  // the precious sample under a magnifier
  around(ctx, W / 2, 880, toSci, 1, () => {
    glow(ctx, W / 2, 880, 30, 280, 'rgba(255,220,130,0.35)');
    sampleJar(ctx, W / 2, 880, 3.2, { shine: 1 });
  });
  const kp = easeOut(prog(t, tSci, tSci + 0.6));
  kid(ctx, t, lerp(-150, 210, kp), 1270, 0.8, { point: 1, mood: 'starry' });
  const mg = pop(t, tStudy - 0.3, 0.4);
  around(ctx, 760, 1000, mg, 1, () => {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 22; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(840, 1080); ctx.lineTo(930, 1180); ctx.stroke();
    ctx.fillStyle = 'rgba(180,230,255,0.35)'; ctx.strokeStyle = C.ink; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.arc(780, 1010, 95, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }, Math.sin(t * 3) * 0.08);
  banner(ctx, t, '交给科学家研究', W / 2, 590, tStudy - 0.3, 1e9, { size: 48, fill: C.ce });
  if (t > tStudy) confetti(ctx, t, tStudy + 0.1, 90);
}

export const scenes = [
  { from: S('kidMoon') - 0.4, to: S('ceDig') - 0.3, draw: meetScene },
  { from: S('ceDig') - 0.3, to: S('ceDock') - 0.3, draw: digScene },
  { from: S('ceDock') - 0.3, to: S('ceHome') - 0.3, draw: dockScene },
  { from: S('ceHome') - 0.3, to: S('recap') - 0.4, draw: homeScene },
];

export const events = [
  { type: 'whoosh', t: S('kidMoon') - 0.4, d: 0.4 },
  { type: 'boing', t: at('kidMoon', '月亮'), amp: 0.6 },
  { type: 'whoosh', t: S('ceHi') - 0.5, d: 0.9, from: 2600, to: 300 },
  { type: 'slam', t: S('ceHi') + 1.0, shake: 6 },
  { type: 'stamp', t: at('ceHi', '2020') + 0.1, shake: 6 },
  { type: 'sparkle', t: at('ceHi', '取土') },
  { type: 'whoosh', t: S('ceDig') - 0.3, d: 0.4 },
  { type: 'scribble', t: at('ceDig', '采样'), d: 1.2 },
  { type: 'whoosh', t: at('ceDig', '离开月球') - 0.4, d: 1.4, from: 200, to: 1600, amp: 0.9 },
  { type: 'whoosh', t: S('ceDock') - 0.3, d: 0.4 },
  { type: 'slam', t: at('ceDock', '对接') + 0.1, shake: 5 },
  { type: 'ding', t: at('ceDock', '对接') + 0.2, n: 84 },
  { type: 'pop', t: at('ceDock', '转移') - 0.2, f: 700 },
  { type: 'ding', t: at('ceDock', '转移') + 0.9, n: 91 },
  { type: 'whoosh', t: S('ceHome') + 0.7, d: 1.6, from: 300, to: 2500, amp: 0.8 },
  { type: 'boing', t: at('ceHome', '回到地球') - 0.3, amp: 0.7 },
  { type: 'tada', t: at('ceHome', '回到地球') + 0.2, amp: 0.8 },
  { type: 'sparkle', t: S('ceSci') },
  { type: 'confetti', t: at('ceSci', '研究') + 0.1 },
];
