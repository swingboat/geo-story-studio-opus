// Props for the habitable-planet interview: thermometers, speech bubbles, podiums, buzzer, gauge, molecules, microbe and condition icons.
import { C, ZH, SANS, NUM, clamp, lerp, rand, txt, measure, card } from './lib.mjs';

const TAU = Math.PI * 2;

// Vertical thermometer. value in ℃ mapped between min..max; label shown in a pill above.
export function thermometer(ctx, x, y, h, value, o = {}) {
  const { min = -200, max = 500, color = C.fire, label, w = 46, ticks = [], a = 1 } = o;
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  const top = y - h / 2, bot = y + h / 2, br = w * 0.95;
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath(); ctx.roundRect(x - w / 2, top, w, h, w / 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x, bot + br * 0.6, br, 0, TAU); ctx.fill();
  const f = clamp((value - min) / (max - min));
  const lv = lerp(bot, top + w * 0.4, f);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect(x - w * 0.27, lv, w * 0.54, bot - lv + br * 0.4, w * 0.27); ctx.fill();
  ctx.beginPath(); ctx.arc(x, bot + br * 0.6, br * 0.74, 0, TAU); ctx.fill();
  for (const tk of ticks) {
    const ty = lerp(bot, top + w * 0.4, clamp((tk - min) / (max - min)));
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x + w / 2 + 4, ty); ctx.lineTo(x + w / 2 + 22, ty); ctx.stroke();
    txt(ctx, `${tk}℃`, x + w / 2 + 30, ty, { size: 30, font: NUM, align: 'left', color: 'rgba(255,255,255,0.85)' });
  }
  if (label) {
    const lw = measure(ctx, label, 54, NUM) + 50;
    card(ctx, x - lw / 2, top - 96, lw, 80, { fill: color, edge: C.white, ew: 5, drop: 0, r: 40 });
    txt(ctx, label, x, top - 54, { size: 54, font: NUM, color: C.white, stroke: 'rgba(0,0,0,0.35)', sw: 6 });
  }
  ctx.restore();
}

// Speech bubble anchored with its tail at (x, y); side = which way the body extends (-1 left, 1 right); up = bubble above.
export function bubble(ctx, x, y, text, o = {}) {
  const { side = 1, size = 52, color = C.white, ink = C.ink, a = 1, sc = 1, up = true } = o;
  if (a <= 0 || sc <= 0) return;
  const w = measure(ctx, text, size) + 70, h = size + 56;
  const bx = side > 0 ? x - 60 : x - w + 60, by = up ? y - h - 40 : y + 40;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  ctx.translate(x, y); ctx.scale(sc, sc); ctx.translate(-x, -y);
  ctx.fillStyle = color; ctx.strokeStyle = ink; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.roundRect(bx, by, w, h, h / 2); ctx.fill(); ctx.stroke();
  const ty = up ? by + h : by;
  ctx.beginPath(); ctx.moveTo(x - 22 * side, ty - 3 * (up ? 1 : -1)); ctx.lineTo(x, y); ctx.lineTo(x + 18 * side, ty - 3 * (up ? 1 : -1)); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 22 * side, ty); ctx.lineTo(x, y); ctx.lineTo(x + 18 * side, ty); ctx.stroke();
  txt(ctx, text, bx + w / 2, by + h / 2 + 3, { size, color: ink });
  ctx.restore();
}

// Contest podium with a name plate; top surface at y.
export function podium(ctx, x, y, w, name, color, o = {}) {
  const { h = 170, lit = 0 } = o;
  ctx.save();
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#2a3170'); g.addColorStop(1, '#141842');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x + w / 2, y); ctx.lineTo(x + w / 2 - 16, y + h); ctx.lineTo(x - w / 2 + 16, y + h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = color;
  ctx.fillRect(x - w / 2, y, w, 12);
  if (lit > 0) {
    ctx.fillStyle = `rgba(255,255,255,${0.25 * lit})`;
    ctx.fillRect(x - w / 2, y, w, h);
  }
  card(ctx, x - w * 0.36, y + 42, w * 0.72, 74, { fill: C.cream, edge: color, ew: 5, drop: 0, r: 18 });
  txt(ctx, name, x, y + 80, { size: 46, color: C.ink });
  ctx.restore();
}

// Round arcade buzzer; pressed 0..1 squashes the cap.
export function buzzer(ctx, x, y, color, pressed = 0) {
  ctx.save();
  ctx.fillStyle = '#20264f';
  ctx.beginPath(); ctx.ellipse(x, y + 18, 64, 22, 0, 0, TAU); ctx.fill();
  ctx.fillRect(x - 64, y - 4, 128, 22);
  ctx.beginPath(); ctx.ellipse(x, y - 4, 64, 22, 0, 0, TAU); ctx.fill();
  const lift = lerp(26, 6, pressed);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(x, y - 4 - lift, 46, 18, 0, 0, TAU); ctx.fill();
  ctx.fillRect(x - 46, y - 4 - lift, 92, lift);
  ctx.beginPath(); ctx.ellipse(x, y - 4, 46, 18, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath(); ctx.ellipse(x - 14, y - 10 - lift, 16, 6, -0.2, 0, TAU); ctx.fill();
  ctx.restore();
}

// Dial gauge; frac 0..1 sweeps the needle across a 240° face.
export function gauge(ctx, x, y, r, frac, o = {}) {
  const { label = '', color = C.fire, marks = [] } = o;
  ctx.save();
  ctx.fillStyle = C.cream; ctx.strokeStyle = C.ink; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke();
  const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25;
  ctx.lineWidth = r * 0.12; ctx.strokeStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r * 0.8, lerp(a0, a1, 0.7), a1); ctx.stroke();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
  for (let i = 0; i <= 10; i++) {
    const a = lerp(a0, a1, i / 10);
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.66, y + Math.sin(a) * r * 0.66); ctx.lineTo(x + Math.cos(a) * r * 0.74, y + Math.sin(a) * r * 0.74); ctx.stroke();
  }
  for (const [f, s] of marks) {
    const a = lerp(a0, a1, f);
    txt(ctx, s, x + Math.cos(a) * r * 0.48, y + Math.sin(a) * r * 0.48, { size: r * 0.17, font: NUM, color: C.ink });
  }
  const a = lerp(a0, a1, clamp(frac, 0, 1.04));
  ctx.strokeStyle = C.fire; ctx.lineWidth = r * 0.06; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r * 0.72, y + Math.sin(a) * r * 0.72); ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.beginPath(); ctx.arc(x, y, r * 0.09, 0, TAU); ctx.fill();
  if (label) txt(ctx, label, x, y + r * 0.5, { size: r * 0.2, color: C.ink });
  ctx.restore();
}

// Ball-and-stick molecule: 'N2' | 'O2' | 'CO2'.
export function molecule(ctx, x, y, kind, r = 16, rot = 0) {
  const atoms = {
    N2: [[-0.9, 0, '#5b8cff'], [0.9, 0, '#5b8cff']],
    O2: [[-0.9, 0, '#ff5a5a'], [0.9, 0, '#ff5a5a']],
    CO2: [[-1.7, 0, '#ff5a5a'], [0, 0, '#3a3a46'], [1.7, 0, '#ff5a5a']],
  }[kind];
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = r * 0.35;
  ctx.beginPath(); ctx.moveTo(atoms[0][0] * r, 0); ctx.lineTo(atoms[atoms.length - 1][0] * r, 0); ctx.stroke();
  for (const [ax, ay, col] of atoms) {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(ax * r, ay * r, r, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath(); ctx.arc(ax * r - r * 0.3, -r * 0.3, r * 0.3, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// A cheerful little microbe (blob with wiggling cilia).
export function microbe(ctx, t, x, y, r, color = '#8be08b') {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color; ctx.lineWidth = r * 0.08; ctx.lineCap = 'round';
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * TAU, w = Math.sin(t * 9 + i) * 0.25;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.75);
    ctx.lineTo(Math.cos(a + w) * r * 1.3, Math.sin(a + w) * r * 1.05);
    ctx.stroke();
  }
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.78, Math.sin(t * 2) * 0.1, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 0.3, r * 0.3, r * 0.18, -0.4, 0, TAU); ctx.fill();
  ctx.fillStyle = C.ink;
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.arc(k * r * 0.28, -r * 0.05, r * 0.1, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = C.ink; ctx.lineWidth = r * 0.07;
  ctx.beginPath(); ctx.arc(0, r * 0.12, r * 0.18, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  ctx.restore();
}

// Round badge with a tick (or cross when ok = false).
export function checkBadge(ctx, x, y, r, color = C.ok, ok = true) {
  ctx.save();
  ctx.fillStyle = color; ctx.strokeStyle = C.white; ctx.lineWidth = r * 0.12;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = C.white; ctx.lineWidth = r * 0.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  if (ok) { ctx.moveTo(x - r * 0.45, y); ctx.lineTo(x - r * 0.1, y + r * 0.35); ctx.lineTo(x + r * 0.5, y - r * 0.35); }
  else { ctx.moveTo(x - r * 0.38, y - r * 0.38); ctx.lineTo(x + r * 0.38, y + r * 0.38); ctx.moveTo(x + r * 0.38, y - r * 0.38); ctx.lineTo(x - r * 0.38, y + r * 0.38); }
  ctx.stroke();
  ctx.restore();
}

// Condition icons used on chips and the combo lock: temp | air | water | light | safe.
export function condIcon(ctx, t, kind, x, y, r) {
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (kind === 'temp') {
    ctx.fillStyle = C.white;
    ctx.beginPath(); ctx.roundRect(x - r * 0.2, y - r * 0.8, r * 0.4, r * 1.2, r * 0.2); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y + r * 0.5, r * 0.35, 0, TAU); ctx.fill();
    ctx.fillStyle = C.fire;
    ctx.fillRect(x - r * 0.08, y - r * 0.3, r * 0.16, r * 0.7);
    ctx.beginPath(); ctx.arc(x, y + r * 0.5, r * 0.24, 0, TAU); ctx.fill();
  } else if (kind === 'air') {
    ctx.strokeStyle = C.white; ctx.lineWidth = r * 0.16;
    for (const [dy, len] of [[-0.4, 1.2], [0, 1.5], [0.4, 1.0]]) {
      ctx.beginPath(); ctx.moveTo(x - r * 0.8, y + dy * r);
      ctx.lineTo(x - r * 0.8 + len * r * 0.8, y + dy * r);
      ctx.arc(x - r * 0.8 + len * r * 0.8, y + dy * r - r * 0.18, r * 0.18, Math.PI / 2, -Math.PI * 0.9, true);
      ctx.stroke();
    }
  } else if (kind === 'water') {
    ctx.fillStyle = C.white;
    ctx.beginPath(); ctx.moveTo(x, y - r * 0.85);
    ctx.bezierCurveTo(x + r * 0.2, y - r * 0.4, x + r * 0.65, y, x + r * 0.62, y + r * 0.28);
    ctx.arc(x, y + r * 0.28, r * 0.62, 0, Math.PI);
    ctx.bezierCurveTo(x - r * 0.65, y, x - r * 0.2, y - r * 0.4, x, y - r * 0.85); ctx.fill();
  } else if (kind === 'light') {
    ctx.fillStyle = C.white; ctx.strokeStyle = C.white; ctx.lineWidth = r * 0.13;
    ctx.beginPath(); ctx.arc(x, y, r * 0.38, 0, TAU); ctx.fill();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + t * 0.5;
      ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.58, y + Math.sin(a) * r * 0.58); ctx.lineTo(x + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.85); ctx.stroke();
    }
  } else if (kind === 'safe') {
    ctx.fillStyle = C.white;
    ctx.beginPath(); ctx.moveTo(x, y - r * 0.85);
    ctx.lineTo(x + r * 0.7, y - r * 0.55); ctx.lineTo(x + r * 0.6, y + r * 0.2);
    ctx.quadraticCurveTo(x + r * 0.4, y + r * 0.7, x, y + r * 0.9);
    ctx.quadraticCurveTo(x - r * 0.4, y + r * 0.7, x - r * 0.6, y + r * 0.2);
    ctx.lineTo(x - r * 0.7, y - r * 0.55); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

export const CONDS = {
  temp: { name: '适宜的温度', color: C.temp },
  air: { name: '适合生物呼吸的大气', color: C.air },
  water: { name: '液态水', color: C.water },
  light: { name: '稳定的光照', color: C.light },
  safe: { name: '安全的宇宙环境', color: C.safe },
};

// Coloured pill with icon + condition name.
export function chip(ctx, t, kind, x, y, o = {}) {
  const { size = 46, label = CONDS[kind].name } = o;
  const col = CONDS[kind].color, w = measure(ctx, label, size) + size * 2.3, h = size * 1.7;
  card(ctx, x - w / 2, y - h / 2, w, h, { fill: 'rgba(10,12,44,0.92)', edge: col, ew: 5, drop: 0, r: h / 2 });
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x - w / 2 + h / 2, y, h * 0.38, 0, TAU); ctx.fill();
  condIcon(ctx, t, kind, x - w / 2 + h / 2, y, h * 0.3);
  txt(ctx, label, x + h * 0.4, y + 2, { size, color: col });
}

// Wavy infrared "heat" arrow from (x1,y1) to (x2,y2).
export function heatWave(ctx, t, x1, y1, x2, y2, o = {}) {
  const { color = '#ff6b4a', w = 8, amp = 12, p = 1 } = o;
  if (p <= 0) return;
  const len = Math.hypot(x2 - x1, y2 - y1) * p, a = Math.atan2(y2 - y1, x2 - x1);
  ctx.save();
  ctx.translate(x1, y1); ctx.rotate(a);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let d = 0; d <= len - 20; d += 4) ctx.lineTo(d, Math.sin(d * 0.09 - t * 10) * amp);
  ctx.stroke();
  ctx.beginPath(); ctx.moveTo(len, 0); ctx.lineTo(len - 26, -15); ctx.lineTo(len - 26, 15); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// Six-armed ice crystal.
export function snowflake(ctx, x, y, r, rot = 0, color = C.ice) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, r * 0.14); ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    ctx.rotate(TAU / 6);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r);
    ctx.moveTo(0, -r * 0.55); ctx.lineTo(r * 0.25, -r * 0.75);
    ctx.moveTo(0, -r * 0.55); ctx.lineTo(-r * 0.25, -r * 0.75);
    ctx.stroke();
  }
  ctx.restore();
}

// Big section header "第X关 · 名称" pill near the top.
export function levelTitle(ctx, num, name, color, a = 1, y = 320) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  const label = `第${num}关`, w1 = measure(ctx, label, 56) + 60, w2 = measure(ctx, name, 72) + 70;
  const x0 = 540 - (w1 + w2) / 2;
  card(ctx, x0, y - 56, w1 + w2, 112, { fill: 'rgba(10,12,44,0.92)', edge: color, ew: 6, drop: 0, r: 56 });
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect(x0 + 8, y - 48, w1, 96, 48); ctx.fill();
  txt(ctx, label, x0 + 8 + w1 / 2, y + 2, { size: 56, color: C.ink });
  txt(ctx, name, x0 + w1 + w2 / 2, y + 2, { size: 72, color });
  ctx.restore();
}

// Level header plus a check badge pinned to its right end, popping at tOk.
export function levelPass(ctx, t, num, name, color, a, tOk, y = 1340) {
  levelTitle(ctx, num, name, color, a, y);
  if (a <= 0 || t < tOk) return;
  const w = measure(ctx, `第${num}关`, 56) + 60 + measure(ctx, name, 72) + 70;
  const x = 540 + w / 2 - 10, by = y - 50, p = clamp((t - tOk) / 0.3);
  const s = 1 + 0.6 * (1 - p) * (1 - p);
  ctx.save();
  ctx.globalAlpha *= p;
  ctx.translate(x, by); ctx.scale(s, s); ctx.translate(-x, -by);
  checkBadge(ctx, x, by, 46, C.ok);
  ctx.restore();
}

export { rand, ZH, SANS };
