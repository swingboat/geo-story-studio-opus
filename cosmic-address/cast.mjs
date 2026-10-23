// The cast and props: the alien courier, its saucer, the parcel and the gold location pin.
import { C, clamp, lerp, txt } from './lib.mjs';
import { face, glow } from './bodies.mjs';

const TAU = Math.PI * 2;

// Alien courier. (x,y) = body centre; s = scale (1 → body radius 90 px).
export function alien(ctx, t, x, y, s, o = {}) {
  const { talk = 0, mood = 'happy', wave = 0, look = 0, parcelOn = false } = o;
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // antennae with glowing tips
  for (const k of [-1, 1]) {
    const sway = Math.sin(t * 3 + k) * 0.18;
    const tx = k * 46 + Math.sin(sway) * 60, ty = -150 + Math.abs(sway) * 10;
    ctx.strokeStyle = '#5fcf6a'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(k * 26, -78); ctx.quadraticCurveTo(k * 40, -120, tx, ty); ctx.stroke();
    glow(ctx, tx, ty, 4, 34, 'rgba(255,240,120,0.65)');
    ctx.fillStyle = '#fff38a'; ctx.beginPath(); ctx.arc(tx, ty, 13, 0, TAU); ctx.fill();
  }
  // arms (behind the body)
  ctx.strokeStyle = '#6fdc78'; ctx.lineWidth = 22;
  ctx.beginPath(); ctx.moveTo(-70, 10); ctx.quadraticCurveTo(-118, 40, -106, 82); ctx.stroke();
  const wa = lerp(0.6, -1.1 + Math.sin(t * 11) * 0.4, clamp(wave));
  ctx.beginPath(); ctx.moveTo(70, 10); ctx.lineTo(70 + Math.cos(wa) * 70, 10 + Math.sin(wa) * 70); ctx.stroke();
  // body
  const g = ctx.createRadialGradient(-30, -40, 10, 0, 0, 100);
  g.addColorStop(0, '#b6ffb0'); g.addColorStop(0.7, '#6fdc78'); g.addColorStop(1, '#3fae55');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, 0, 90, 96, 0, 0, TAU); ctx.fill();
  // courier vest + badge
  ctx.save();
  ctx.beginPath(); ctx.ellipse(0, 0, 90, 96, 0, 0, TAU); ctx.clip();
  ctx.fillStyle = C.sunHot; ctx.fillRect(-90, 52, 180, 60);
  ctx.fillStyle = '#ffd166'; ctx.fillRect(-90, 52, 180, 9);
  ctx.restore();
  // courier cap
  ctx.fillStyle = '#2f6fe0';
  ctx.beginPath(); ctx.ellipse(0, -70, 70, 40, 0, Math.PI, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(36, -70, 58, 13, 0.06, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(-6, -92, 15, 0, TAU); ctx.fill();
  ctx.restore();
  txt(ctx, '宇', x - 6 * s, y - 91 * s, { size: 20 * s, color: '#2f6fe0' });
  face(ctx, t, x, y - 4 * s, 78 * s, { talk, mood, look });
  if (parcelOn) parcel(ctx, x - 104 * s, y + 92 * s, 0.55 * s, -0.12);
}

// A flying saucer with the alien riding in the dome.
export function ufo(ctx, t, x, y, s, o = {}) {
  const { beam = 0 } = o;
  if (beam > 0) {
    const g = ctx.createLinearGradient(x, y, x, y + 420 * s);
    g.addColorStop(0, `rgba(160,255,200,${0.5 * beam})`); g.addColorStop(1, 'rgba(160,255,200,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x - 60 * s, y + 30 * s); ctx.lineTo(x + 60 * s, y + 30 * s);
    ctx.lineTo(x + 200 * s, y + 420 * s); ctx.lineTo(x - 200 * s, y + 420 * s); ctx.closePath(); ctx.fill();
  }
  alien(ctx, t, x, y - 60 * s, 0.62 * s, o);
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  // glass dome
  ctx.fillStyle = 'rgba(170,230,255,0.22)';
  ctx.strokeStyle = 'rgba(220,245,255,0.7)'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.ellipse(0, -10, 112, 140, 0, Math.PI, TAU); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.ellipse(0, -10, 88, 116, 0, Math.PI * 1.15, Math.PI * 1.4); ctx.stroke();
  // saucer
  const sg = ctx.createLinearGradient(0, -30, 0, 50);
  sg.addColorStop(0, '#e9eef8'); sg.addColorStop(0.5, '#a8b3cc'); sg.addColorStop(1, '#6c7795');
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.ellipse(0, 10, 220, 54, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#5a6482';
  ctx.beginPath(); ctx.ellipse(0, 40, 110, 22, 0, 0, Math.PI); ctx.fill();
  const cols = [C.gold, C.pink, C.sky, C.mint];
  for (let i = 0; i < 7; i++) {
    const on = Math.floor(t * 6 + i) % 3 === 0;
    const lx = -165 + i * 55, ly = 18 + Math.abs(i - 3) * -3;
    ctx.fillStyle = on ? cols[i % 4] : 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.arc(lx, ly, 11, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// Cardboard parcel; (x,y) = centre.
export function parcel(ctx, x, y, s, rot = 0, label = '地球') {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(10,5,40,0.35)';
  ctx.beginPath(); ctx.roundRect(-96, -66, 200, 150, 14); ctx.fill();
  ctx.fillStyle = '#d9a066';
  ctx.beginPath(); ctx.roundRect(-100, -76, 200, 150, 14); ctx.fill();
  ctx.fillStyle = '#c08550'; ctx.fillRect(-100, -76, 200, 26);
  ctx.fillStyle = '#f2d7a8'; ctx.fillRect(-16, -76, 32, 150);
  ctx.fillStyle = '#fffaf0';
  ctx.beginPath(); ctx.roundRect(-84, -6, 120, 64, 8); ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  txt(ctx, '收件人', -24 * s, 10 * s, { size: 18 * s, color: '#8a6a4a' });
  txt(ctx, label, -24 * s, 36 * s, { size: 26 * s, color: C.ink });
  ctx.restore();
}

// Gold location pin whose tip touches (x,y); the halo breathes.
export function pin(ctx, t, x, y, s, label) {
  const br = 1 + 0.12 * Math.sin(t * 4);
  ctx.save();
  ctx.strokeStyle = `rgba(255,201,60,${0.7 - 0.35 * Math.sin(t * 4)})`; ctx.lineWidth = 5 * s;
  ctx.beginPath(); ctx.ellipse(x, y, 34 * s * br, 12 * s * br, 0, 0, TAU); ctx.stroke();
  ctx.translate(x, y - 6 * s * (1 + Math.sin(t * 4))); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(10,5,40,0.35)';
  ctx.beginPath(); ctx.moveTo(4, 4); ctx.bezierCurveTo(-36, -50, -36, -100, 4, -100); ctx.bezierCurveTo(44, -100, 44, -50, 4, 4); ctx.fill();
  ctx.fillStyle = C.gold;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-40, -54, -40, -104, 0, -104); ctx.bezierCurveTo(40, -104, 40, -54, 0, 0); ctx.fill();
  ctx.fillStyle = C.goldDeep; ctx.beginPath(); ctx.arc(0, -66, 16, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff6d0'; ctx.beginPath(); ctx.arc(0, -66, 8, 0, TAU); ctx.fill();
  ctx.restore();
  if (label) txt(ctx, label, x, y - 140 * s, { size: 40 * s, color: C.gold, stroke: C.space, sw: 9 * s });
}

// Rounded info tag with an optional small caption line (used for the sourced numbers).
export function tag(ctx, x, y, main, sub, o = {}) {
  const { size = 46, color = C.white, edge = C.gold, a = 1 } = o;
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.font = `${size}px YuanB, RoundB, UniB, HiraGB`;
  const w = Math.max(ctx.measureText(main).width, sub ? ctx.measureText(sub).width * 0.6 : 0) + 64;
  const h = sub ? size * 2.35 : size * 1.5;
  ctx.fillStyle = 'rgba(8,10,40,0.82)';
  ctx.strokeStyle = edge; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 22); ctx.fill(); ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha *= a;
  txt(ctx, main, x, sub ? y - size * 0.4 : y, { size, color });
  if (sub) txt(ctx, sub, x, y + size * 0.66, { size: size * 0.6, color: 'rgba(255,255,255,0.65)' });
  ctx.restore();
}
