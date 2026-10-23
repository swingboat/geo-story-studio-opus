// Scenes 1–4: rocket hook → three "space workers" show their (still blank) job badges → 天宫 orbits Earth → life on board.
import { W, C, S, E, at, prog, lerp, clamp, easeOut, easeIO, pop, fadeIn, txt, around, burst, card, talkLevel } from './lib.mjs';
import { kid, earth, glow } from './chars.mjs';
import { tiangong, beidou, lander, rocket } from './craft.mjs';
import { banner, bubble, badge, astro } from './props.mjs';

// Mini portraits used on the job badges (shared with the recap scene).
export const ICONS = {
  tg: (ctx, x, y) => tiangong(ctx, 0, x, y - 10, 0.17, {}),
  bd: (ctx, x, y) => beidou(ctx, 0, x, y, 0.27, {}),
  ce: (ctx, x, y) => lander(ctx, 0, x, y + 75, 0.36, {}),
};
export const BADGES = {
  tg: { name: '中国空间站 · 天宫', color: C.tg },
  bd: { name: '北斗卫星导航系统', color: C.bd },
  ce: { name: '嫦娥五号（2020）', color: C.ce },
};

// ---------- scene 1: a rocket blasts off — what are all these spacecraft doing up there? ----------
function hookScene(ctx, t) {
  const tCraft = at('hook', '航天器'), tBusy = at('hook', '忙');
  const rise = easeIO(prog(t, 0, tCraft + 0.2));
  const ry = lerp(1250, 1060, rise) - Math.pow(prog(t, tCraft + 0.2, tCraft + 1.4), 2) * 1400;
  // exhaust trail
  ctx.save();
  const g = ctx.createLinearGradient(0, ry, 0, 1300);
  g.addColorStop(0, 'rgba(255,240,220,0.5)'); g.addColorStop(1, 'rgba(255,240,220,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(W / 2 - 30, ry + 40); ctx.lineTo(W / 2 - 140, 1300); ctx.lineTo(W / 2 + 140, 1300); ctx.lineTo(W / 2 + 30, ry + 40); ctx.fill();
  ctx.restore();
  around(ctx, W / 2, ry, 1, 1 - prog(ry, 760, 500), () => rocket(ctx, t, W / 2, ry, 1.1, { flame: 1 }));
  // three silhouettes pop out of the fairing and float apart, each with a question mark
  const pos = [[250, 720, 'tg'], [560, 590, 'bd'], [800, 900, 'ce']];
  pos.forEach(([x, y, k], i) => {
    const p = easeOut(prog(t, tCraft + i * 0.12, tCraft + 0.6 + i * 0.12));
    if (p <= 0) return;
    const cx = lerp(W / 2, x, p), cy = lerp(700, y, p) + Math.sin(t * 2 + i) * 10;
    around(ctx, cx, cy, p, 1, () => {
      glow(ctx, cx, cy, 10, 150, 'rgba(120,180,255,0.25)');
      if (k === 'tg') tiangong(ctx, t, cx, cy, 0.42, { mood: 'wow' });
      if (k === 'bd') beidou(ctx, t, cx, cy, 0.7, { mood: 'wow' });
      if (k === 'ce') lander(ctx, t, cx, cy + 120, 0.6, { mood: 'wow' });
    });
    const q = pop(t, tBusy + i * 0.1, 0.4);
    around(ctx, cx + 90, cy - 110, q, q, () => txt(ctx, '?', cx + 90, cy - 110, { size: 90, color: C.gold, stroke: C.space, sw: 10 }), Math.sin(t * 5 + i) * 0.15);
  });
  burst(ctx, t, tCraft + 0.1, W / 2, 800, { r: 300, n: 14 });
  kid(ctx, t, 190, 1290, 0.85, { talk: talkLevel(t, ['hook']), point: 1, mood: 'wow' });
}

// ---------- scene 2: three space workers show their badges ----------
const SPOTS = { tg: [310, 680], bd: [730, 900], ce: [310, 1120] };
function introScene(ctx, t) {
  const tCard = at('intro', '工牌');
  banner(ctx, t, '今日嘉宾', 790, 600, S('intro'), 1e9, { size: 46, fill: C.cream, color: C.ink });
  ['tg', 'bd', 'ce'].forEach((k, i) => {
    const [x, y] = SPOTS[k];
    badge(ctx, t, x, y, 0.82, {
      ...BADGES[k], icon: ICONS[k], tIn: S('intro') - 0.15 + i * 0.3,
      rows: [['地点', '', 1e9], ['任务', '', 1e9]],
    });
    const q = pop(t, tCard + 0.3 + i * 0.12, 0.35);
    // the badge rows sit at y-52 and y+20 (badge scale 0.82)
    if (q > 0) around(ctx, x + 90, y, q, q, () => {
      txt(ctx, '？？？', x + 90, y - 42, { size: 40, color: k === 'tg' ? C.tg : k === 'bd' ? C.goldDeep : C.ce });
      txt(ctx, '？？？', x + 90, y + 18, { size: 40, color: k === 'tg' ? C.tg : k === 'bd' ? C.goldDeep : C.ce });
    });
  });
}

// ---------- scene 3: 天宫 introduces itself and orbits Earth ----------
function orbitScene(ctx, t) {
  const tIn = S('tgHi') - 0.3, tOrbit = at('tgWhat', '绕着地球'), tLab = at('tgWhat', '实验平台');
  earth(ctx, t, W / 2, 1820, 760, { face: false, light: -1.8 });
  // orbit: a dashed arc hugging the Earth, highlighted while "绕着地球飞" is spoken
  const op = easeOut(prog(t, tOrbit - 0.2, tOrbit + 0.6));
  ctx.save();
  ctx.strokeStyle = `rgba(76,201,240,${0.25 + 0.6 * op})`; ctx.lineWidth = 6; ctx.setLineDash([22, 18]);
  ctx.lineDashOffset = -t * 60;
  ctx.beginPath(); ctx.ellipse(W / 2, 1820, 980, 1050, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
  ctx.restore();
  // fly in, then cruise along the orbit after "绕着地球"
  const fin = easeOut(prog(t, tIn, tIn + 0.9));
  const ang = -Math.PI / 2 + 0.22 * Math.sin(Math.max(0, t - tOrbit) * 0.5) * op;
  const ox = W / 2 + Math.cos(ang) * 980, oy = 1820 + Math.sin(ang) * 1050;
  const x = lerp(1400, ox, fin), y = lerp(500, oy + 20, fin);
  const talk = talkLevel(t, ['tgHi']);
  tiangong(ctx, t, x, y, 0.82, { talk, mood: t > tLab ? 'starry' : 'happy', flap: talk > 0 ? 1 : 0, lights: fadeIn(t, tLab, 0.4) });
  burst(ctx, t, at('tgHi', '天宫'), x, y, { r: 340, n: 14, colors: [C.tg, C.gold, C.white] });
  bubble(ctx, t, '我是天宫！', 290, 600, at('tgHi', '天宫') - 0.1, { tx: 380, ty: 700, size: 46, t1: S('tgWhat') });
  if (op > 0) {
    const ax = W / 2 + Math.cos(ang - 0.3) * 980, ay = 1820 + Math.sin(ang - 0.3) * 1050;
    around(ctx, ax, ay - 60, pop(t, tOrbit, 0.4), 1, () =>
      txt(ctx, '← 绕地球飞', ax + 40, ay - 80, { size: 40, color: C.tg, stroke: C.space, sw: 8 }));
  }
  banner(ctx, t, '太空中的实验平台', W / 2, 600, tLab - 0.1, 1e9, { size: 52, fill: C.tg });
}

// ---------- scene 4: life on board — eat, sleep, exercise ----------
const ROOMS = [
  { word: '吃饭', x: 220, label: '吃饭' },
  { word: '睡觉', x: 540, label: '睡觉' },
  { word: '锻炼', x: 860, label: '锻炼' },
];
function lifeScene(ctx, t) {
  const tLong = at('tgLive', '长期');
  // a cutaway of the module: hull outline with round ends
  ctx.save();
  card(ctx, 50, 610, 980, 650, { fill: '#e9eef8', edge: C.ink, ew: 8, r: 120, drop: 14 });
  ctx.fillStyle = 'rgba(76,201,240,0.18)';
  ctx.fillRect(110, 650, 860, 30);
  ctx.restore();
  txt(ctx, '舱内', 160, 690, { size: 34, color: 'rgba(43,26,85,0.45)' });
  ROOMS.forEach((r, i) => {
    const tw = at('tgLive', r.word);
    const p = pop(t, tw - 0.15, 0.45);
    const cy = 940;
    around(ctx, r.x, cy, p, 1, () => {
      ctx.fillStyle = 'rgba(43,26,85,0.07)';
      ctx.beginPath(); ctx.roundRect(r.x - 140, cy - 220, 280, 440, 40); ctx.fill();
      if (i === 0) {
        // floating snacks around a drifting astronaut
        for (let k = 0; k < 5; k++) {
          const a = t * 1.2 + k * 1.3;
          ctx.fillStyle = [C.warm, C.no, C.mint, C.gold, C.pink][k];
          ctx.beginPath(); ctx.arc(r.x + Math.cos(a) * 100, cy - 60 + Math.sin(a * 1.3) * 70, 13, 0, Math.PI * 2); ctx.fill();
        }
        astro(ctx, t, r.x, cy - 40 + Math.sin(t * 2) * 12, 0.95, { rot: Math.sin(t) * 0.2 });
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.roundRect(r.x + 40, cy - 30, 40, 56, 8); ctx.fill(); ctx.stroke();
      } else if (i === 1) {
        // sleeping bag strapped to the wall, with drifting Zzz
        card(ctx, r.x - 70, cy - 130, 140, 300, { fill: '#8a6bff', edge: C.ink, ew: 5, r: 50, drop: 0 });
        astro(ctx, t, r.x, cy - 120, 0.75, {});
        card(ctx, r.x - 70, cy - 60, 140, 230, { fill: '#8a6bff', edge: C.ink, ew: 5, r: 50, drop: 0 });
        for (let k = 0; k < 3; k++) {
          const ph = (t * 0.6 + k / 3) % 1;
          ctx.globalAlpha = Math.sin(ph * Math.PI);
          txt(ctx, 'Z', r.x + 70 + ph * 50, cy - 160 - ph * 80, { size: 30 + k * 8, color: C.ink });
          ctx.globalAlpha = 1;
        }
      } else {
        // exercise bike with a pedalling astronaut
        ctx.strokeStyle = C.ink; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.arc(r.x, cy + 120, 60, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(r.x, cy + 120); ctx.lineTo(r.x + Math.cos(t * 8) * 40, cy + 120 + Math.sin(t * 8) * 40); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(r.x - 50, cy + 190); ctx.lineTo(r.x + 50, cy + 190); ctx.stroke();
        astro(ctx, t, r.x, cy - 60 + Math.sin(t * 8) * 6, 0.85, {});
        for (let k = 0; k < 2; k++) {
          ctx.fillStyle = C.sky;
          ctx.beginPath(); ctx.arc(r.x + 80 + k * 20, cy - 110 + ((t * 40 + k * 30) % 60), 7, 0, Math.PI * 2); ctx.fill();
        }
      }
      txt(ctx, r.label, r.x, cy + 255, { size: 44, color: C.ink });
    });
    burst(ctx, t, tw, r.x, cy - 100, { r: 160, n: 8, size: 16 });
  });
  banner(ctx, t, '长期在轨 · 生活 + 工作', W / 2, 600, tLong - 0.1, 1e9, { size: 46, fill: C.tg });
}

export const scenes = [
  { from: 0, to: S('intro') - 0.2, draw: hookScene },
  { from: S('intro') - 0.2, to: S('tgHi') - 0.3, draw: introScene },
  { from: S('tgHi') - 0.3, to: S('tgLive') - 0.3, draw: orbitScene },
  { from: S('tgLive') - 0.3, to: S('tgLab') - 0.3, draw: lifeScene },
];

export const events = [
  { type: 'whoosh', t: 0, d: 2.6, from: 200, to: 900, amp: 0.8 },
  { type: 'slam', t: 0.02, shake: 8 },
  { type: 'pop', t: at('hook', '航天器'), f: 700 },
  { type: 'pop', t: at('hook', '航天器') + 0.12, f: 850 },
  { type: 'pop', t: at('hook', '航天器') + 0.24, f: 1000 },
  { type: 'boing', t: at('hook', '忙'), amp: 0.6 },
  { type: 'whoosh', t: S('intro') - 0.2, d: 0.4 },
  { type: 'tada', t: at('intro', '打工人'), amp: 0.8 },
  { type: 'stamp', t: at('intro', '工牌') + 0.3 },
  { type: 'whoosh', t: S('tgHi') - 0.3, d: 0.8, from: 2600, to: 400 },
  { type: 'sparkle', t: at('tgHi', '天宫') },
  { type: 'ding', t: at('tgWhat', '绕着地球'), n: 84 },
  { type: 'pop', t: at('tgWhat', '实验平台') - 0.1, f: 800 },
  { type: 'whoosh', t: S('tgLive') - 0.3, d: 0.4 },
  { type: 'note', t: at('tgLive', '吃饭') - 0.1, n: 72 },
  { type: 'note', t: at('tgLive', '睡觉') - 0.1, n: 76 },
  { type: 'note', t: at('tgLive', '锻炼') - 0.1, n: 79 },
  { type: 'ding', t: at('tgLive', '长期'), n: 88 },
];
