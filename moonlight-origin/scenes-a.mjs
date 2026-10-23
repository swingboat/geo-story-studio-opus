// Scenes 1–2: a kid on a hill spots the bright Moon; the Moon wakes up and whispers that its light is borrowed.
import { W, H, C, S, E, at, atEnd, prog, lerp, easeIO, easeOut, pop, fadeIn, bob, txt, around, header, burst, talkLevel } from './lib.mjs';
import { moon, kid } from './chars.mjs';

function hill(ctx) {
  ctx.fillStyle = '#0b2033';
  ctx.beginPath(); ctx.moveTo(0, 1290); ctx.quadraticCurveTo(W * 0.45, 1150, W, 1250); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#081827';
  ctx.beginPath(); ctx.moveTo(0, 1420); ctx.quadraticCurveTo(W * 0.6, 1330, W, 1400); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
}

// Question marks bouncing out around the Moon.
function questions(ctx, t, t0, cx, cy) {
  const spots = [[-300, -120, -0.3], [290, -170, 0.25], [-250, 190, -0.15], [310, 150, 0.3]];
  spots.forEach(([dx, dy, rot], i) => {
    const t1 = t0 + i * 0.14;
    const s = pop(t, t1, 0.4);
    around(ctx, cx + dx, cy + dy + bob(t, 10, 3, i), s, fadeIn(t, t1, 0.15), () =>
      txt(ctx, '?', cx + dx, cy + dy + bob(t, 10, 3, i), { size: 110, color: [C.gold, C.sky, C.pink, C.mint][i], stroke: C.ink, sw: 12 }), rot + Math.sin(t * 3 + i) * 0.15);
  });
}

// ---------- scene 1: night hill ----------
const T_OPEN = at('hook', '发光');
function night(ctx, t) {
  const zoom = lerp(1, 1.12, easeIO(prog(t, S('ask'), E('ask'))));
  ctx.save();
  ctx.translate(W / 2, 700); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -700);
  const mx = 650, my = 720 + bob(t, 6, 1.4);
  const eyes = t < T_OPEN ? 'closed' : 'open';
  const blink = t > S('ask') && (t % 3.1) < 0.12 ? 1 : 0;
  moon(ctx, t, mx, my, 210, { glow: 1, face: { eyes, blink, look: [-0.6, 0.6], mouth: 0 } });
  if (t < T_OPEN) txt(ctx, 'z', mx + 210 + 30 * ((t * 0.7) % 1), my - 190 - 80 * ((t * 0.7) % 1), { size: 54, color: 'rgba(245,239,223,0.7)' });
  burst(ctx, t, T_OPEN, mx, my, { r: 300, n: 12 });
  hill(ctx);
  const hop = Math.max(0, Math.sin(Math.PI * prog(t, at('hook', '好亮'), at('hook', '好亮') + 0.45))) * 40;
  kid(ctx, t, 300, 1262, 1.15, {
    point: easeOut(prog(t, S('hook') + 0.1, S('hook') + 0.6)) * (1 - prog(t, E('hook') + 0.6, E('hook') + 1.1)),
    aim: -0.85, look: -0.7, talk: talkLevel(t, ['hook']), hop,
  });
  ctx.restore();
  header(ctx, t, S('ask'), '月亮那么亮', '它的光从哪里来？');
  questions(ctx, t, at('ask', '光从'), 650, 720);
}

// ---------- scene 2: the Moon's secret ----------
const T_SHH = S('confess'), T_BORROW = at('confess', '借来');
function secret(ctx, t) {
  const r = 300, mx = W / 2, my = 860;
  const lean = Math.sin(Math.PI * prog(t, at('confess', '告诉'), at('confess', '秘密') + 0.5)) * 0.12;
  const look = t < at('confess', '告诉') ? [Math.sin((t - T_SHH) * 9) > 0 ? -1 : 1, 0] : [0, 0];
  const eyes = t >= T_BORROW + 0.1 ? 'wink' : 'open';
  around(ctx, mx, my + r, 1, 1, () => {
    moon(ctx, t, mx, my + bob(t, 6, 1.6), r, { glow: 1, face: { eyes, look, mouth: talkLevel(t, ['confess']) } });
  }, lean);
  // "shh" finger and whisper marks
  const shh = fadeIn(t, T_SHH, 0.25) * (1 - fadeIn(t, at('confess', '秘密') + 0.3, 0.3));
  around(ctx, mx + 330, my - 220, pop(t, T_SHH, 0.4), shh, () => {
    ctx.fillStyle = 'rgba(245,239,223,0.95)';
    ctx.beginPath(); ctx.roundRect(mx + 250, my - 290, 170, 120, 40); ctx.fill();
    ctx.beginPath(); ctx.moveTo(mx + 270, my - 190); ctx.lineTo(mx + 230, my - 150); ctx.lineTo(mx + 310, my - 180); ctx.fill();
    txt(ctx, '嘘~', mx + 335, my - 228, { size: 64, color: C.ink });
  });
  // the "借" seal stamps down onto the scene
  const sp = prog(t, T_BORROW - 0.15, T_BORROW + 0.15);
  if (sp > 0) {
    const sc = lerp(2.4, 1, easeOut(sp));
    around(ctx, 820, 1180, sc, sp, () => {
      ctx.strokeStyle = '#ff5d5d'; ctx.lineWidth = 12; ctx.fillStyle = 'rgba(255,93,93,0.14)';
      ctx.beginPath(); ctx.roundRect(720, 1080, 200, 200, 30); ctx.fill(); ctx.stroke();
      txt(ctx, '借', 820, 1184, { size: 140, color: '#ff5d5d' });
    }, -0.18);
  }
  burst(ctx, t, T_BORROW + 0.12, 820, 1180, { r: 220, colors: ['#ff5d5d', C.gold, C.cream] });
  header(ctx, t, T_SHH + 0.2, '月亮的小秘密', '');
  const n = fadeIn(t, atEnd('confess', '借来的') + 0.1, 0.4);
  around(ctx, W / 2, 470, 1, n, () => txt(ctx, '我的亮光，是借来的！', W / 2, 440, { size: 54, color: C.gold }));
}

export const scenesA = [
  { from: 0, to: S('confess') - 0.25, draw: night },
  { from: S('confess') - 0.25, to: S('sun') - 0.3, draw: secret },
];

export const eventsA = [
  { type: 'sparkle', t: 0.4, amp: 0.6 },
  { type: 'boing', t: at('hook', '好亮') - 0.05, amp: 0.6 },
  { type: 'sparkle', t: T_OPEN },
  { type: 'pop', t: T_OPEN + 0.05, f: 900 },
  { type: 'whoosh', t: S('ask') - 0.3, d: 0.5 },
  ...[0, 1, 2, 3].map((i) => ({ type: 'pop', t: at('ask', '光从') + i * 0.14, f: 600 + i * 150, amp: 0.8 })),
  { type: 'whoosh', t: S('confess') - 0.45, d: 0.5 },
  { type: 'scribble', t: T_SHH, d: 0.4 },
  { type: 'stamp', t: T_BORROW + 0.1 },
  { type: 'ding', t: T_BORROW + 0.3, n: 88 },
];
