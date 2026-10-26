// Characters and props: talking Earth, the little dust grain, comet nucleus, sun, calendar, moon, cloud, stamp.
import { C, glow, text, rand, alpha, clamp, lerp } from './lib.mjs';

const LANDS = [
  [[-86, -52], [-58, -78], [-12, -69], [8, -43], [-19, -15], [-26, 15], [-42, 6], [-52, -20], [-78, -28]],
  [[-21, 7], [4, 15], [26, 41], [10, 62], [-8, 87], [-15, 56], [-27, 29]],
  [[20, -87], [37, -92], [46, -73], [33, -51], [20, -57]],
];

// mood: 'normal' | 'puzzled' | 'proud'; mouth: 0..1 openness, negative hides the face.
export function earth(ctx, x, y, r, t, o = {}) {
  const { mouth = 0, mood = 'normal', face = true } = o;
  ctx.save(); ctx.translate(x, y);
  glow(ctx, 0, 0, r * 1.4, 'rgba(52,166,255,0.25)');
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
  const g = ctx.createRadialGradient(-r * 0.45, -r * 0.4, r * 0.05, r * 0.1, r * 0.15, r * 1.15);
  g.addColorStop(0, '#5ad2ed'); g.addColorStop(0.5, '#2477b4'); g.addColorStop(1, '#0c2549');
  ctx.fillStyle = g; ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.save(); ctx.scale(r / 100, r / 100); ctx.translate(Math.sin(t * 0.3) * 6, 0);
  ctx.fillStyle = '#9bcf9b';
  for (const pts of LANDS) {
    ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  const shade = ctx.createLinearGradient(-r, -r * 0.5, r, r * 0.4);
  shade.addColorStop(0, 'rgba(0,8,30,0)'); shade.addColorStop(1, 'rgba(0,8,30,0.7)');
  ctx.fillStyle = shade; ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.restore();
  ctx.save(); ctx.strokeStyle = '#87dbff'; ctx.lineWidth = Math.max(1.5, r * 0.02);
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  if (face && r >= 30) earthFace(ctx, x, y, r, t, mouth, mood);
}

function earthFace(ctx, x, y, r, t, mouth, mood) {
  ctx.save(); ctx.translate(x + r * 0.06, y + r * 0.04);
  const blink = Math.sin(t * 1.7 + 0.4) > 0.992;
  for (const ex of [-0.25, 0.25]) {
    const ey = -r * 0.12;
    if (mood === 'proud' || blink) {
      ctx.strokeStyle = '#09152b'; ctx.lineWidth = r * 0.045; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(r * ex, ey + r * 0.03, r * 0.09, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      continue;
    }
    ctx.fillStyle = '#fff8e9'; ctx.beginPath(); ctx.ellipse(r * ex, ey, r * 0.105, r * 0.145, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#09152b'; ctx.beginPath(); ctx.ellipse(r * ex + r * 0.02, ey + r * 0.02, r * 0.05, r * 0.08, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r * ex + r * 0.035, ey - r * 0.01, r * 0.018, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = '#09152b'; ctx.lineWidth = r * 0.035; ctx.lineCap = 'round';
  if (mood === 'puzzled') {
    ctx.beginPath(); ctx.moveTo(r * 0.14, -r * 0.33); ctx.lineTo(r * 0.36, -r * 0.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r * 0.36, -r * 0.33); ctx.lineTo(-r * 0.14, -r * 0.31); ctx.stroke();
  }
  ctx.fillStyle = '#09152b';
  if (mouth > 0.05) {
    ctx.beginPath(); ctx.ellipse(0, r * 0.27, r * 0.13, r * (0.03 + mouth * 0.1), 0, 0, Math.PI * 2); ctx.fill();
  } else if (mood === 'puzzled') {
    ctx.beginPath(); ctx.moveTo(-r * 0.1, r * 0.29); ctx.quadraticCurveTo(0, r * 0.24, r * 0.12, r * 0.3); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(0, r * 0.18, r * (mood === 'proud' ? 0.17 : 0.12), Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,140,150,0.35)';
  for (const cx of [-0.4, 0.4]) { ctx.beginPath(); ctx.ellipse(r * cx, r * 0.12, r * 0.08, r * 0.045, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

function rockPath(ctx, r, seed, n = 11) {
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, rr = r * (0.8 + rand(i + seed) * 0.22);
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
}

// The little dust grain. heat 0..1 makes it glow orange-white; wave 0..1 lifts its arm.
export function grain(ctx, x, y, r, t, o = {}) {
  const { mouth = 0, heat = 0, wave = 0, rot = 0 } = o;
  if (heat > 0) glow(ctx, x, y, r * (2 + heat * 2.5), `rgba(255,190,110,${0.55 * heat})`);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  if (wave > 0) {
    const a = -0.6 - Math.sin(t * 12) * 0.5 * wave;
    ctx.strokeStyle = '#8b97a3'; ctx.lineWidth = r * 0.16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(r * 0.7, -r * 0.1); ctx.lineTo(r * 0.7 + Math.cos(a) * r * 0.75, -r * 0.1 + Math.sin(a) * r * 0.75); ctx.stroke();
  }
  const g = ctx.createLinearGradient(-r, -r, r, r);
  g.addColorStop(0, heat > 0 ? `rgb(${lerp(171, 255, heat)},${lerp(180, 230, heat)},${lerp(188, 170, heat)})` : '#abb4bc');
  g.addColorStop(1, heat > 0 ? `rgb(${lerp(53, 255, heat)},${lerp(69, 140, heat)},${lerp(87, 60, heat)})` : '#3a4a5c');
  ctx.fillStyle = g; rockPath(ctx, r, 3); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.translate(x, y);
  for (const ex of [-0.28, 0.28]) {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(r * ex, -r * 0.12, r * 0.2, r * 0.25, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0a1426'; ctx.beginPath(); ctx.arc(r * ex + r * 0.05, -r * 0.08, r * 0.11, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#0a1426';
  ctx.beginPath(); ctx.ellipse(0, r * 0.35, r * 0.16, r * (0.04 + mouth * 0.16), 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function nucleus(ctx, x, y, r, t, heat = 0) {
  if (heat > 0) glow(ctx, x - r * 0.4, y - r * 0.2, r * 1.9, `rgba(255,190,120,${0.25 * heat})`);
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 0.4) * 0.08);
  const g = ctx.createLinearGradient(-r, -r, r, r);
  g.addColorStop(0, '#9aa3ab'); g.addColorStop(0.55, '#4f5c69'); g.addColorStop(1, '#232d3a');
  ctx.fillStyle = g; rockPath(ctx, r, 11, 15); ctx.fill();
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = `rgba(220,242,255,${0.55 - heat * 0.3})`;
    ctx.beginPath(); ctx.ellipse((rand(i + 40) - 0.6) * r * 1.1, (rand(i + 70) - 0.5) * r * 1.2, r * 0.12, r * 0.07, rand(i) * 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(20,28,40,0.5)';
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc((rand(i + 9) - 0.5) * r, (rand(i + 19) - 0.5) * r, r * 0.1, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

export function sun(ctx, x, y, r, t) {
  glow(ctx, x, y, r * 2.8, 'rgba(255,170,65,0.25)');
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
  g.addColorStop(0, '#fff7c0'); g.addColorStop(0.6, '#ffd476'); g.addColorStop(1, '#f59b43');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.strokeStyle = 'rgba(255,216,140,0.3)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, r + 9 + Math.sin(t * 2) * 3, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}

// Desk calendar. flip 0..1 animates the top page folding up.
export function calendar(ctx, x, y, s, month, year, flip = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#c9d3d8'; ctx.beginPath(); ctx.roundRect(-118, -78, 236, 200, 18); ctx.fill();
  const page = (alphaPage, sy) => {
    ctx.save(); ctx.globalAlpha *= alphaPage; ctx.translate(0, -90); ctx.scale(1, sy); ctx.translate(0, 90);
    ctx.fillStyle = '#f2f5f3'; ctx.beginPath(); ctx.roundRect(-125, -90, 250, 205, 18); ctx.fill();
    ctx.fillStyle = '#e0565b'; ctx.beginPath(); ctx.roundRect(-125, -90, 250, 58, [18, 18, 0, 0]); ctx.fill();
    text(ctx, year, 0, -61, 30, '#fff');
    text(ctx, month, 0, 40, 84, '#14263a', 'center', 'YuanB');
    ctx.restore();
  };
  page(1, 1);
  if (flip > 0 && flip < 1) page(1 - flip * 0.3, Math.cos(flip * Math.PI / 2));
  ctx.strokeStyle = '#0e2235'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  for (const xx of [-70, 70]) { ctx.beginPath(); ctx.moveTo(xx, -104); ctx.lineTo(xx, -78); ctx.stroke(); }
  ctx.restore();
}

export function moon(ctx, x, y, r, bright = 1) {
  glow(ctx, x, y, r * 4, `rgba(230,236,255,${0.28 * bright})`);
  ctx.fillStyle = '#f5f1df'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(180,176,160,0.6)';
  for (const [dx, dy, rr] of [[-0.3, -0.2, 0.2], [0.25, 0.15, 0.15], [-0.05, 0.4, 0.12]]) {
    ctx.beginPath(); ctx.arc(x + dx * r, y + dy * r, rr * r, 0, Math.PI * 2); ctx.fill();
  }
}

export function cloud(ctx, x, y, s, color = '#8ea6b8') {
  ctx.fillStyle = color;
  for (const [dx, dy, r] of [[-60, 12, 42], [-10, -14, 58], [52, 10, 44], [0, 24, 40]]) {
    ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2); ctx.fill();
  }
}

// Red rubber stamp that slams in as p goes 0→1.
export function stamp(ctx, x, y, label, p, color = '#ff6b6b') {
  if (p <= 0) return;
  const sc = lerp(2.2, 1, clamp(p * 1.6)), a = clamp(p * 3);
  alpha(ctx, a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.18); ctx.scale(sc, sc);
    ctx.strokeStyle = color; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.roundRect(-150, -52, 300, 104, 18); ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(-138, -40, 276, 80, 12); ctx.stroke();
    text(ctx, label, 0, 3, 52, color);
    ctx.restore();
  });
}
