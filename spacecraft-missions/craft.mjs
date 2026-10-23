// Cartoon spacecraft: 天宫 space station, 北斗 satellite, 嫦娥五号 modules (lander, ascender, orbiter, returner), rocket.
// All are simplified, friendly shapes with faces; s = 1 is the "hero" size for each.
import { C, TAU, clamp, lerp } from './lib.mjs';
import { face, glow } from './chars.mjs';

// Blue solar array centred at (x,y), w×h, with a grid and a soft sheen.
export function panel(ctx, x, y, w, h, o = {}) {
  const { rot = 0, cells = [6, 2], color = C.panel } = o;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = color; ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 6); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(200,225,255,0.55)'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 1; i < cells[0]; i++) { const xx = -w / 2 + (w * i) / cells[0]; ctx.moveTo(xx, -h / 2); ctx.lineTo(xx, h / 2); }
  for (let j = 1; j < cells[1]; j++) { const yy = -h / 2 + (h * j) / cells[1]; ctx.moveTo(-w / 2, yy); ctx.lineTo(w / 2, yy); }
  ctx.stroke();
  const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.25)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,0.12)');
  ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.restore();
}

function capsule(ctx, x, y, w, h, fill = C.hull) {
  ctx.fillStyle = fill; ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, Math.min(w, h) / 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.roundRect(x - w / 2 + 10, y - h / 2 + 8, w - 20, h * 0.18, 6); ctx.fill();
}

// 天宫: T-shaped — a crossbar of two lab modules with big wings, the core module as the stem.
// (x,y) = central node. o.lights 0..1 makes the windows glow (lab busy).
export function tiangong(ctx, t, x, y, s, o = {}) {
  const { talk = 0, mood = 'happy', lights = 0, flap = 0 } = o;
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.lineJoin = 'round';
  const wingTilt = Math.sin(t * 1.5) * 0.04 + flap * Math.sin(t * 12) * 0.12;
  // wings at the crossbar ends
  for (const k of [-1, 1]) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(k * 270, 0); ctx.lineTo(k * 300, 0); ctx.stroke();
    panel(ctx, k * 300, -105, 70, 170, { rot: k * wingTilt, cells: [2, 6] });
    panel(ctx, k * 300, 105, 70, 170, { rot: -k * wingTilt, cells: [2, 6] });
  }
  // core module stem (with its own small wings)
  capsule(ctx, 0, 165, 92, 230);
  for (const k of [-1, 1]) panel(ctx, k * 105, 230, 110, 46, { cells: [5, 1], rot: k * wingTilt * 0.5 });
  // lab modules (crossbar)
  capsule(ctx, -165, 0, 230, 92);
  capsule(ctx, 165, 0, 230, 92);
  // windows
  for (const [wx, wy] of [[-210, 0], [-140, 0], [140, 0], [210, 0], [0, 150], [0, 215]]) {
    if (lights > 0.01) glow(ctx, wx, wy, 4, 40, `rgba(255,220,120,${0.6 * lights})`);
    ctx.fillStyle = lights > 0.5 ? '#ffe28a' : '#2b3a7a'; ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(wx, wy, 13, 0, TAU); ctx.fill(); ctx.stroke();
  }
  // node sphere with the face, plus a little antenna
  ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(0, -108); ctx.stroke();
  ctx.fillStyle = C.no; ctx.beginPath(); ctx.arc(0, -112, 9 + Math.sin(t * 5), 0, TAU); ctx.fill();
  ctx.fillStyle = C.hull;
  ctx.beginPath(); ctx.arc(0, 0, 76, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.tg;
  ctx.fillRect(-74, 34, 148, 10);
  ctx.restore();
  face(ctx, t, x, y - 6 * s, 62 * s, { talk, mood });
}

// 北斗 satellite: gold-foil bus, two wings, an antenna array facing Earth (downwards). (x,y) = bus centre.
export function beidou(ctx, t, x, y, s, o = {}) {
  const { talk = 0, mood = 'happy', face: hasFace = true, wave = 0, rot = 0 } = o;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const flapA = wave * Math.sin(t * 10) * 0.25;
  for (const k of [-1, 1]) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(k * 70, 0); ctx.lineTo(k * 110, 0); ctx.stroke();
    ctx.save(); ctx.translate(k * 110, 0); ctx.rotate(k * flapA);
    panel(ctx, k * 105, 0, 190, 80, { cells: [6, 2] });
    ctx.restore();
  }
  // antenna array underneath
  ctx.fillStyle = '#dfe6f5'; ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.roundRect(-40, 70, 80, 26, 8); ctx.fill(); ctx.stroke();
  for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(i * 24, 104, 9, 0, TAU); ctx.fill(); ctx.stroke(); }
  // bus
  const g = ctx.createLinearGradient(-70, -75, 70, 75);
  g.addColorStop(0, '#ffe08a'); g.addColorStop(0.5, C.foil); g.addColorStop(1, C.foilDark);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.roundRect(-70, -75, 140, 150, 22); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(120,80,10,0.35)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-60, -20); ctx.lineTo(60, -28); ctx.moveTo(-60, 30); ctx.lineTo(60, 22); ctx.stroke();
  // dish on top
  ctx.fillStyle = C.hull; ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(0, -75); ctx.lineTo(0, -98); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -104, 34, 14, 0, Math.PI, TAU); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  if (hasFace) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.translate(-x, -y);
    face(ctx, t, x, y + 4 * s, 56 * s, { talk, mood });
    ctx.restore();
  }
}

// 嫦娥五号 lander (着陆器) on four legs; (x,y) = footpads level. o.ascender draws the ascender on top;
// o.arm 0..1 swings the sampling arm down to the surface; o.drill 0..1 runs the drill.
export function lander(ctx, t, x, y, s, o = {}) {
  const { talk = 0, mood = 'happy', ascender: hasAsc = true, arm = 0, drill = 0 } = o;
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // legs
  ctx.strokeStyle = '#8f97ad'; ctx.lineWidth = 12;
  for (const k of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(k * 80, -110); ctx.lineTo(k * 150, -8); ctx.stroke();
    ctx.fillStyle = '#8f97ad';
    ctx.beginPath(); ctx.ellipse(k * 150, -4, 32, 10, 0, 0, TAU); ctx.fill();
  }
  // drill under the body
  if (drill > 0) {
    const d = 40 * clamp(drill);
    ctx.strokeStyle = '#5b6380'; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(-30, -100); ctx.lineTo(-30, -40 + d); ctx.stroke();
    ctx.strokeStyle = '#c9cfdf'; ctx.lineWidth = 4;
    for (let i = 0; i < 4; i++) {
      const yy = -80 + i * 14 + ((t * 80) % 14);
      ctx.beginPath(); ctx.moveTo(-36, yy); ctx.lineTo(-24, yy + 6); ctx.stroke();
    }
  }
  // sampling arm (shoulder on the right side of the body), scoop at the end
  const a1 = lerp(-0.5, 0.75, clamp(arm)) + Math.sin(t * 6) * 0.05 * clamp(arm);
  const sx = 110, sy = -150, ex = sx + Math.cos(a1) * 120, ey = sy + Math.sin(a1) * 120;
  const a2 = a1 + lerp(1.2, 0.6, clamp(arm));
  const hx = ex + Math.cos(a2) * 100, hy = ey + Math.sin(a2) * 100;
  ctx.strokeStyle = C.ink; ctx.lineWidth = 18;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.strokeStyle = '#dfe6f5'; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.fillStyle = '#7d86b8'; ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(hx, hy, 18, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
  // solar wings
  for (const k of [-1, 1]) panel(ctx, k * 190, -175, 120, 60, { cells: [4, 2], rot: k * 0.08 });
  // body (gold foil, octagon-ish)
  const g = ctx.createLinearGradient(-110, -220, 110, -90);
  g.addColorStop(0, '#ffe08a'); g.addColorStop(0.5, C.foil); g.addColorStop(1, C.foilDark);
  ctx.fillStyle = g; ctx.strokeStyle = C.ink; ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-80, -235); ctx.lineTo(80, -235); ctx.lineTo(120, -195); ctx.lineTo(120, -130);
  ctx.lineTo(80, -95); ctx.lineTo(-80, -95); ctx.lineTo(-120, -130); ctx.lineTo(-120, -195); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.restore();
  if (hasAsc) ascender(ctx, t, x, y - 235 * s, s * 0.9, {});
  face(ctx, t, x, y - 160 * s, 58 * s, { talk, mood });
}

// 上升器: small module; (x,y) = bottom centre. o.flame 0..1 fires the engine.
export function ascender(ctx, t, x, y, s, o = {}) {
  const { flame = 0, sample = false } = o;
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  if (flame > 0.02) {
    const f = flame * (1 + 0.15 * Math.sin(t * 40));
    glow(ctx, 0, 30, 4, 90 * f, 'rgba(255,170,60,0.7)');
    ctx.fillStyle = '#ffd36b';
    ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(0, 110 * f); ctx.lineTo(18, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff6d0';
    ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(0, 55 * f); ctx.lineTo(8, 0); ctx.closePath(); ctx.fill();
  }
  for (const k of [-1, 1]) panel(ctx, k * 88, -50, 70, 36, { cells: [3, 1] });
  ctx.fillStyle = '#dfe6f5'; ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.roundRect(-55, -95, 110, 90, 16); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffd36b';
  ctx.beginPath(); ctx.roundRect(-40, -80, 80, 18, 6); ctx.fill();
  if (sample) sampleJar(ctx, 0, -40, 0.7);
  ctx.restore();
}

// Orbiter (轨道器) with the returner (返回器) docked on its left end; (x,y) = orbiter centre.
// o.withReturner=false hides the returner (after separation).
export function orbiter(ctx, t, x, y, s, o = {}) {
  const { withReturner = true, talk = 0, mood = 'happy', faceOn = false } = o;
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  for (const k of [-1, 1]) panel(ctx, 0, k * 105, 120, 90, { cells: [3, 3] });
  ctx.strokeStyle = C.ink; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(0, 60); ctx.stroke();
  const g = ctx.createLinearGradient(-90, -55, 90, 55);
  g.addColorStop(0, '#ffe08a'); g.addColorStop(1, C.foilDark);
  ctx.fillStyle = g; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.roundRect(-90, -55, 180, 110, 18); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#5b6380';
  ctx.beginPath(); ctx.roundRect(88, -22, 26, 44, 6); ctx.fill(); ctx.stroke();
  ctx.restore();
  if (withReturner) returner(ctx, t, x - 150 * s, y, s * 0.85, { rot: -Math.PI / 2 });
  if (faceOn) face(ctx, t, x, y, 40 * s, { talk, mood });
}

// 返回器: a cone-shaped capsule; (x,y) = centre. o.heat 0..1 adds re-entry glow; o.chute 0..1 opens a parachute.
export function returner(ctx, t, x, y, s, o = {}) {
  const { rot = 0, heat = 0, chute = 0, talk = 0, mood = 'happy', faceOn = false } = o;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (chute > 0.02) {
    const c = clamp(chute);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3;
    for (const k of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(k * 120 * c, -200 * c); ctx.stroke(); }
    ctx.fillStyle = C.no;
    ctx.beginPath(); ctx.ellipse(0, -210 * c, 150 * c, 90 * c, 0, Math.PI, TAU); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.cream;
    ctx.beginPath(); ctx.ellipse(0, -210 * c, 50 * c, 90 * c, 0, Math.PI, TAU); ctx.closePath(); ctx.fill();
  }
  if (heat > 0.02) {
    glow(ctx, 0, 60, 10, 160 * heat, `rgba(255,120,40,${0.8 * heat})`);
    ctx.fillStyle = `rgba(255,200,90,${0.85 * heat})`;
    ctx.beginPath(); ctx.moveTo(-70, 40); ctx.quadraticCurveTo(0, 120 + 70 * heat, 70, 40); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = '#e7e2d6'; ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-28, -42); ctx.lineTo(28, -42); ctx.lineTo(68, 38); ctx.lineTo(-68, 38); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = heat > 0.3 ? '#a8461c' : '#6b5a4a';
  ctx.beginPath(); ctx.moveTo(-70, 38); ctx.quadraticCurveTo(0, 62, 70, 38); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  if (faceOn) face(ctx, t, x, y + 6 * s, 32 * s, { talk, mood });
}

// A little sealed sample canister with grey lunar soil inside.
export function sampleJar(ctx, x, y, s, o = {}) {
  const { shine = 0 } = o;
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  if (shine > 0) glow(ctx, 0, 0, 10, 90 * shine, 'rgba(255,230,140,0.6)');
  ctx.fillStyle = 'rgba(220,240,255,0.85)'; ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.roundRect(-30, -34, 60, 70, 14); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#8d8f9c';
  ctx.beginPath(); ctx.roundRect(-26, -2, 52, 34, 10); ctx.fill();
  ctx.fillStyle = '#6f7180';
  for (const [dx, dy] of [[-12, 8], [6, 16], [14, 4]]) { ctx.beginPath(); ctx.arc(dx, dy, 4, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#5b6380';
  ctx.beginPath(); ctx.roundRect(-34, -44, 68, 16, 6); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// Rocket with an optional flame; (x,y) = nozzle exit, pointing up.
export function rocket(ctx, t, x, y, s, o = {}) {
  const { flame = 1 } = o;
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  if (flame > 0.02) {
    const f = flame * (1 + 0.12 * Math.sin(t * 45));
    glow(ctx, 0, 60, 10, 200 * f, 'rgba(255,160,60,0.6)');
    ctx.fillStyle = '#ffb627';
    ctx.beginPath(); ctx.moveTo(-40, 0); ctx.quadraticCurveTo(0, 260 * f, 40, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff3c0';
    ctx.beginPath(); ctx.moveTo(-20, 0); ctx.quadraticCurveTo(0, 130 * f, 20, 0); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = C.hull; ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.lineJoin = 'round';
  for (const k of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(k * 40, -90); ctx.lineTo(k * 85, 0); ctx.lineTo(k * 40, -10); ctx.closePath();
    ctx.fillStyle = C.no; ctx.fill(); ctx.stroke();
  }
  ctx.fillStyle = C.hull;
  ctx.beginPath(); ctx.moveTo(-45, 0); ctx.lineTo(-45, -300); ctx.quadraticCurveTo(0, -420, 45, -300); ctx.lineTo(45, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.no; ctx.fillRect(-42, -260, 84, 22);
  ctx.fillStyle = '#2b3a7a'; ctx.beginPath(); ctx.arc(0, -180, 20, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.restore();
}
