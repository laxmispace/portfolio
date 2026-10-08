// @ts-nocheck - ported as-is from the hand-tuned walking-character prototype
// (Desktop/Pookie-dump/walking-character.html); the rig maths is untyped by design.
// The walking character: blends two leg drawings over a 3-bone rig and scrolls the
// ground, so the figure walks in place. Ids inside the SVG are prefixed per instance.

/* ---- Tweak these to taste ---------------------------------------- */
var CONFIG = {
  loopSeconds: 3, stepsPerLoop: 4, stanceFraction: 0.6, pushOffDeg: 8, kneeBend: 1,
  bodyBob: 18, bobLag: 0.08, footClearance: 12, followThrough: 1,
  leanDeg: -2.5, rockDeg: 1.2,
  armSwingDeg: 10, armLag: 0.08,     // fist-arm swing, opposite the near leg
  flowerSwayDeg: 6, flowerPulse: 0.02,
  hillsPerLoop: 1, hillHeight: 10,
  legLineBoost: 0.6, heelSink: 5.4,
  blink: true
};
/* ------------------------------------------------------------------ */

export function initWalker(svg: SVGSVGElement, prefix: string): () => void {
  var $ = function (n) { return svg.querySelector('[data-wk="' + n + '"]'); };
  var RIG = {
    straight: { hipL: [302.5, 282.5], hipR: [328.7, 294.4], kneeF: [227.5, 383.4], ankleF: [143.5, 491.9],
                toe: [10.7, 454], heel: [150.6, 554.8], kneeB: [244.2, 419.2], heelContact: [150.6, 566], toeContact: [-0.5, 457] },
    curvy:    { hipL: [337.4, 302.9], hipR: [356.3, 305.5], kneeF: [383, 468], ankleF: [489.7, 354.9],
                toe: [614.4, 386.6], heel: [485.3, 293], kneeB: [425.5, 416] },
    nearHip: [315.6, 288.5], farHip: [346.9, 288.5], viewRight: 670,
    bodyBase: [354.7, 292.8], bodyShadowX: 366
  };
  var el = {
    ground: $("ground-track"), groundPath: $("ground"), groundStatic: $("ground-static"), legsStatic: $("legs-static"),
    shBody: $("shadow-body"), shNear: $("shadow-near"), shFar: $("shadow-far"),
    char: $("character"), upper: $("upper"),
    nearInk: $("near-ink"), nearPaper: $("near-paper"), farInk: $("far-ink"), farPaper: $("far-paper"),
    armL: $("arm-left"), armR: $("arm-right"), flower: $("flower"), bloom: $("bloom"), tip: $("stem-tip"),
    smile: $("smile"), eyes: [$("eye-1"), $("eye-2")]
  };
  [el.nearInk, el.nearPaper, el.farInk, el.farPaper].forEach(function (p) { p.setAttribute("stroke-width", CONFIG.legLineBoost); });
  el.groundPath.style.display = ""; el.groundStatic.style.display = "none"; el.legsStatic.style.display = "none";

  const DEG = Math.PI / 180, TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = u => (u = clamp(u, 0, 1), u * u * (3 - 2 * u));
  const hermite = (p0, p1, v0, v1, u) => { const u2 = u * u, u3 = u2 * u;
    return (2*u3 - 3*u2 + 1) * p0 + (u3 - 2*u2 + u) * v0 + (-2*u3 + 3*u2) * p1 + (u3 - u2) * v1; };
  const f1 = n => Math.round(n * 10) / 10, f2 = n => Math.round(n * 100) / 100;

  /* ---- shapes: flatten your paths, cut at landmarks, resample so straight and curvy share points ---- */
  function parsePath(d) {
    const tok = d.match(/[MLHVCZ]|-?\d*\.?\d+(?:e-?\d+)?/gi), loops = [];
    let cur = null, cmd = '', i = 0, x = 0, y = 0; const num = () => parseFloat(tok[i++]);
    while (i < tok.length) { const t = tok[i];
      if (/[MLHVCZ]/i.test(t)) { cmd = t; i++; if (cmd === 'Z') { cur = null; continue; } }
      if (cmd === 'M') { x = num(); y = num(); cur = [[x, y]]; loops.push(cur); cmd = 'L'; }
      else if (cmd === 'L') { x = num(); y = num(); cur.push([x, y]); }
      else if (cmd === 'H') { x = num(); cur.push([x, y]); }
      else if (cmd === 'V') { y = num(); cur.push([x, y]); }
      else if (cmd === 'C') { const x1 = num(), y1 = num(), x2 = num(), y2 = num(), x3 = num(), y3 = num();
        const n = Math.max(6, Math.ceil(Math.hypot(x3 - x, y3 - y) / 4));
        for (let k = 1; k <= n; k++) { const s = k / n, r = 1 - s;
          cur.push([r*r*r*x + 3*r*r*s*x1 + 3*r*s*s*x2 + s*s*s*x3, r*r*r*y + 3*r*r*s*y1 + 3*r*s*s*y2 + s*s*s*y3]); }
        x = x3; y = y3; }
      else throw new Error('unsupported path command ' + cmd); }
    return loops; }
  const nearestIndex = (pts, p) => { let b = 0, bd = 1e18; for (let i = 0; i < pts.length; i++) { const d = (pts[i][0]-p[0])**2 + (pts[i][1]-p[1])**2; if (d < bd) { bd = d; b = i; } } return b; };
  function resampleSeg(pts, n) { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i-1] + Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]));
    const total = L[L.length - 1], out = []; let j = 0;
    for (let k = 0; k < n; k++) { const s = total * k / n; while (j < L.length - 2 && L[j+1] < s) j++;
      const seg = L[j+1] - L[j] || 1, f = (s - L[j]) / seg; out.push([pts[j][0] + (pts[j+1][0]-pts[j][0]) * f, pts[j][1] + (pts[j+1][1]-pts[j][1]) * f]); }
    return out; }
  const ORDER = ['hipL', 'kneeF', 'ankleF', 'toe', 'heel', 'kneeB', 'hipR'], COUNTS = [40, 40, 36, 30, 40, 40, 14];
  // insert a vertex at the closest point of the outline to each landmark (long straight edges have no vertices otherwise)
  function insertLandmark(loop, p) { let best = 1e18, bi = 0, bp = null;
    for (let i = 0; i < loop.length; i++) { const a = loop[i], b = loop[(i + 1) % loop.length], dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1;
      const t = clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2, 0, 1), q = [a[0] + t * dx, a[1] + t * dy], d = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2;
      if (d < best) { best = d; bi = i; bp = q; } }
    loop.splice(bi + 1, 0, bp); }
  function normalizeLoop(loop, lm) {
    if (loop.length > 1 && Math.hypot(loop[0][0]-loop[loop.length-1][0], loop[0][1]-loop[loop.length-1][1]) < 1e-6) loop = loop.slice(0, -1);
    loop = loop.slice(); for (const k of ORDER) insertLandmark(loop, lm[k]);
    const N = loop.length, idx = ORDER.map(k => nearestIndex(loop, lm[k])), fwd = (a, b) => (b - a + N) % N;
    if (fwd(idx[0], idx[1]) > fwd(idx[0], idx[6])) { loop = loop.slice().reverse(); for (let i = 0; i < idx.length; i++) idx[i] = N - 1 - idx[i]; }
    const out = [];
    for (let s = 0; s < ORDER.length; s++) { const a = idx[s], b = idx[(s + 1) % ORDER.length], seg = [];
      for (let i = a; ; i = (i + 1) % N) { seg.push(loop[i]); if (i === b) break; } out.push(...resampleSeg(seg, COUNTS[s])); }
    return out; }
  const outerLoop = id => parsePath(svg.querySelector('#' + prefix + '-' + id).getAttribute('d'))[0];
  const SHAPES = { straight: { ink: normalizeLoop(outerLoop('legStraightInk'), RIG.straight), paper: normalizeLoop(outerLoop('legStraightFill'), RIG.straight) },
                   curvy:    { ink: normalizeLoop(outerLoop('legCurvyInk'),    RIG.curvy),    paper: normalizeLoop(outerLoop('legCurvyFill'),    RIG.curvy) } };
  const mid = (a, b) => [(a[0]+b[0])/2, (a[1]+b[1])/2];
  const hipS = RIG.nearHip, hipC = mid(RIG.curvy.hipL, RIG.curvy.hipR);
  const thighS = Math.atan2(mid(RIG.straight.kneeF, RIG.straight.kneeB)[1] - hipS[1], mid(RIG.straight.kneeF, RIG.straight.kneeB)[0] - hipS[0]);
  const thighC = Math.atan2(mid(RIG.curvy.kneeF, RIG.curvy.kneeB)[1] - hipC[1], mid(RIG.curvy.kneeF, RIG.curvy.kneeB)[0] - hipC[0]);
  // --- 3-bone rig (thigh, shin, foot) measured from each drawing; the blend swings the shin about the knee
  //     and the foot about the ankle instead of sliding points straight across, so shapes never fold ---
  function buildRig(D) { const lm = RIG[D], hip = D === 'straight' ? hipS : hipC;
    const K = [(lm.kneeF[0] + lm.kneeB[0]) / 2 - hip[0], (lm.kneeF[1] + lm.kneeB[1]) / 2 - hip[1]];
    const A = [(lm.ankleF[0] + lm.heel[0]) / 2 - hip[0], (lm.ankleF[1] + lm.heel[1]) / 2 - hip[1]];
    const T = [lm.toe[0] - hip[0], lm.toe[1] - hip[1]];
    return { O: [[0, 0], K, A], th: [Math.atan2(K[1], K[0]), Math.atan2(A[1] - K[1], A[0] - K[0]), Math.atan2(T[1] - A[1], T[0] - A[0])],
             LT: Math.hypot(K[0], K[1]), LS: Math.hypot(A[0] - K[0], A[1] - K[1]) }; }
  const RIGS = { straight: buildRig('straight'), curvy: buildRig('curvy') };
  const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
  const chainParam = (seg, f) => [f, 1 + f, 2 + f, 3 - 0.9 * f, 2.1 - 1.1 * f, 1 - f, 0][seg];
  function weights(c) { const w = [0, 0, 0];
    for (const j of [1, 2]) if (Math.abs(c - j) < 0.15) { const t = smooth((c - (j - 0.15)) / 0.3); w[j - 1] = 1 - t; w[j] = t; return w; }
    w[Math.min(2, Math.floor(c))] = 1; return w; }
  function skin(pts, hip, rig) {   // per point: bone weights + local coords in each bone frame
    const out = []; let i = 0;
    for (let seg = 0; seg < COUNTS.length; seg++) for (let k = 0; k < COUNTS[seg]; k++, i++) {
      const p = [pts[i][0] - hip[0], pts[i][1] - hip[1]], w = weights(chainParam(seg, k / COUNTS[seg])), loc = [];
      for (let b = 0; b < 3; b++) { const c = Math.cos(-rig.th[b]), sn = Math.sin(-rig.th[b]), dx = p[0] - rig.O[b][0], dy = p[1] - rig.O[b][1];
        loc.push([dx * c - dy * sn, dx * sn + dy * c]); }
      out.push({ w, loc }); }
    return out; }
  const SKIN = { straight: { ink: skin(SHAPES.straight.ink, hipS, RIGS.straight), paper: skin(SHAPES.straight.paper, hipS, RIGS.straight) },
                 curvy:    { ink: skin(SHAPES.curvy.ink, hipC, RIGS.curvy),       paper: skin(SHAPES.curvy.paper, hipC, RIGS.curvy) } };
  // build one leg: thigh angle a (SVG angle, 90° = straight down), knee bend m (0 = straight drawing … 1 = curvy drawing), hip at (hx, hy)
  function legPoints(kind, a, m, hx, hy) {
    const rS = RIGS.straight, rC = RIGS.curvy, S = SKIN.straight[kind], C = SKIN.curvy[kind];
    const kneeS = rS.th[1] - rS.th[0], kneeC = rC.th[1] - rC.th[0], ankS = rS.th[2] - rS.th[1], ankC = rC.th[2] - rC.th[1];
    const knee = kneeS + m * wrap(kneeC - kneeS), ank = ankS + m * wrap(ankC - ankS);
    const LT = rS.LT + m * (rC.LT - rS.LT), LS = rS.LS + m * (rC.LS - rS.LS);
    const th = [a, a + knee, a + knee + ank];
    const K = [LT * Math.cos(th[0]), LT * Math.sin(th[0])], A = [K[0] + LS * Math.cos(th[1]), K[1] + LS * Math.sin(th[1])];
    const O = [[0, 0], K, A], cs = th.map(Math.cos), sn = th.map(Math.sin), out = new Array(S.length);
    for (let i = 0; i < S.length; i++) { const w = S[i].w; let x = 0, y = 0;
      for (let b = 0; b < 3; b++) { if (!w[b]) continue;
        const lx = S[i].loc[b][0] + m * (C[i].loc[b][0] - S[i].loc[b][0]), ly = S[i].loc[b][1] + m * (C[i].loc[b][1] - S[i].loc[b][1]);
        x += w[b] * (O[b][0] + lx * cs[b] - ly * sn[b]); y += w[b] * (O[b][1] + lx * sn[b] + ly * cs[b]); }
      out[i] = [hx + x, hy + y]; }
    return out; }
  const toPath = pts => { let d = 'M' + f1(pts[0][0]) + ' ' + f1(pts[0][1]); for (let i = 1; i < pts.length; i++) d += 'L' + f1(pts[i][0]) + ' ' + f1(pts[i][1]); return d + 'Z'; };

  /* ---- timing + stance geometry ---- */
  const LOOP = CONFIG.loopSeconds, STEP = LOOP / CONFIG.stepsPerLoop, CYC = STEP * 2;
  const stanceDur = CYC * CONFIG.stanceFraction, swingDur = CYC - stanceDur;
  const vHeel = [RIG.straight.heelContact[0] - hipS[0], RIG.straight.heelContact[1] - hipS[1]];
  const vToe  = [RIG.straight.toeContact[0] - hipS[0],  RIG.straight.toeContact[1] - hipS[1]];
  const rH = Math.hypot(vHeel[0], vHeel[1]), aH0 = Math.atan2(vHeel[1], vHeel[0]);
  const rT = Math.hypot(vToe[0], vToe[1]),   aT0 = Math.atan2(vToe[1], vToe[0]);
  const soleAng = Math.atan2(vToe[1] - vHeel[1], vToe[0] - vHeel[0]);
  const phiFlat = -Math.PI - soleAng, bFlat = aT0 + phiFlat, bOff = bFlat - CONFIG.pushOffDeg * DEG;
  const D1 = rH * (Math.cos(aH0 + phiFlat) - Math.cos(aH0)), D2 = rT * (Math.cos(bOff) - Math.cos(bFlat));
  const V = (D1 + D2) / stanceDur, LAMBDA = V * LOOP / Math.max(1, Math.round(CONFIG.hillsPerLoop));
  const heelRefY = hipS[1] + rH * Math.sin(aH0), baseY = heelRefY - CONFIG.heelSink;
  const terrain = u => baseY + CONFIG.hillHeight * Math.sin(TAU * u / LAMBDA);
  const groundAt = (x, t) => terrain(x - V * t);
  const slopeAt = (x, t) => CONFIG.hillHeight * TAU / LAMBDA * Math.cos(TAU * (x - V * t) / LAMBDA);
  (() => { const x0 = -LAMBDA - 120, x1 = RIG.viewRight + 120; let d = '';
    for (let x = x0; x <= x1; x += 6) d += (d ? 'L' : 'M') + f2(x) + ' ' + f2(terrain(x)); el.groundPath.setAttribute('d', d); })();
  const bodyY = t => (groundAt(RIG.bodyShadowX, t) - baseY) - CONFIG.bodyBob * (1 - Math.cos(TAU * (t / STEP - CONFIG.bobLag))) / 2;

  /* ---- one leg ---- */
  function heelPhase(ts, ev) { const x = ev.heelX0 + V * ts, a = Math.acos(clamp((x - ev.hx) / rH, -1, 1)), phi = a - aH0, T = ev.yH - ev.hy - rH * Math.sin(a);
    return { phi, T, heel: [x, ev.yH], toe: [ev.hx + rT * Math.cos(aT0 + phi), ev.hy + rT * Math.sin(aT0 + phi) + T] }; }
  function toePhase(ts, ev) { const x = ev.toeX + V * (ts - ev.tFlat), b = Math.acos(clamp((x - ev.hx) / rT, -1, 1)), phi = b - aT0, T = ev.yT - ev.hy - rT * Math.sin(b);
    return { phi, T, heel: [ev.hx + rH * Math.cos(aH0 + phi), ev.hy + rH * Math.sin(aH0 + phi) + T], toe: [x, ev.yT] }; }
  function makeLeg(hip, offset) {
    const [hx, hy] = hip, heelX0 = hx + vHeel[0], events = [];
    for (let c = 0; c < Math.round(LOOP / CYC); c++) { const t0 = offset + c * CYC, yH = groundAt(heelX0, t0);
      const ev = { t0, hx, hy, heelX0, yH, tFlat: stanceDur, toeX: 0, yT: yH };
      const gap = ts => { const p = heelPhase(ts, ev); return groundAt(p.toe[0], t0 + ts) - p.toe[1]; };
      if (gap(stanceDur) <= 0) { let lo = 0, hi = stanceDur; for (let i = 0; i < 48; i++) { const m = (lo + hi) / 2; (gap(m) > 0 ? lo = m : hi = m); }
        ev.tFlat = hi; ev.toeX = heelPhase(hi, ev).toe[0]; ev.yT = groundAt(ev.toeX, t0 + hi); }
      events.push(ev); }
    for (const ev of events) { const tEnd = ev.t0 + stanceDur, e = ev.tFlat < stanceDur ? toePhase(stanceDur, ev) : heelPhase(stanceDur, ev);
      const pts = legPoints('ink', thighS + e.phi, 0, hx, hy + e.T); let sink = 0; for (const q of pts) sink = Math.max(sink, q[1] - groundAt(q[0], tEnd));
      ev.sink0 = sink; }
    // swing kinematics for a given phase u of event c: thigh angle, knee bend, base slide (velocity-continuous with the stance)
    function swingKin(u, c) {
      const ev = events[c], EPS = 1e-3, at = (ts, e) => ts < e.tFlat ? heelPhase(ts, e) : toePhase(ts, e);
      const tEnd = ev.t0 + stanceDur, tNext = ev.t0 + CYC, end = at(stanceDur, ev), endPrev = at(stanceDur - EPS, ev);
      const aOff = thighS + end.phi, vA0 = (end.phi - endPrev.phi) / EPS * swingDur * CONFIG.followThrough;
      const lsOff = end.T - bodyY(tEnd), lsOffPrev = endPrev.T - bodyY(tEnd - EPS), vLs0 = (lsOff - lsOffPrev) / EPS * swingDur;
      const evNext = events[(c + 1) % events.length], n0 = heelPhase(0, evNext), n1 = heelPhase(EPS, evNext);
      const lsNext = n0.T - bodyY(tNext), vLs1 = ((n1.T - bodyY(tNext + EPS)) - lsNext) / EPS * swingDur;
      return { a: hermite(aOff, thighS, vA0, 0, u),
               m: CONFIG.kneeBend * smooth(u / 0.42) * (1 - smooth((u - 0.42) / 0.4)),   // knee bends over the first 40 %, straight again by 80 %
               lsH: hermite(lsOff, lsNext, vLs0, vLs1, u) }; }
    const allowAt = (ev, u) => ev.sink0 * (1 - smooth(u / 0.3)) - CONFIG.footClearance * Math.sin(Math.PI * u);
    const needLift = (ev, u, a, m, ls, t) => { const pts = legPoints('ink', a, m, hx, hy + ls + bodyY(t)), allow = allowAt(ev, u); let v = 0;
      for (const p of pts) { const d = p[1] - (groundAt(p[0], t) + allow); if (d > v) v = d; } return v; };
    // precomputed lift table per swing: required lift, widened in time (max filter) then averaged, so the leg rises early and smoothly
    const TS = 120, TR = 10;
    events.forEach((ev, c) => { const e = [];
      for (let k = 0; k <= TS; k++) { const u = k / TS, kin = swingKin(u, c); e.push(needLift(ev, u, kin.a, kin.m, kin.lsH, ev.t0 + stanceDur + u * swingDur)); }
      const mx = e.map((_, k) => { let v = 0; for (let j = Math.max(0, k - TR); j <= Math.min(TS, k + TR); j++) v = Math.max(v, e[j]); return v; });
      const sm = mx.map((_, k) => { let v = 0, n = 0; for (let j = Math.max(0, k - TR); j <= Math.min(TS, k + TR); j++) { v += mx[j]; n++; } return v / n; });
      ev.lift = e.map((v, k) => { const u = k / TS, f = smooth(u / 0.12) * smooth((1 - u) / 0.12); return Math.max(v, sm[k] * f); }); });
    const liftAt = (ev, u) => { const x = clamp(u, 0, 1) * TS, k = Math.min(TS - 1, Math.floor(x)), f = x - k; return ev.lift[k] + (ev.lift[k + 1] - ev.lift[k]) * f; };
    function pose(t) {
      const tc = ((t - offset) % CYC + CYC) % CYC, c = Math.floor((((t - offset) % LOOP) + LOOP) % LOOP / CYC) % events.length;
      const ev = events[c], by = bodyY(t);
      if (tc < stanceDur) { const p = tc < ev.tFlat ? heelPhase(tc, ev) : toePhase(tc, ev);
        return { a: thighS + p.phi, m: 0, ls: p.T - by, by, heel: p.heel, toe: p.toe, planted: true, hx, hy }; }
      const u = (tc - stanceDur) / swingDur, kin = swingKin(u, c);
      let ls = kin.lsH - liftAt(ev, u);
      ls -= needLift(ev, u, kin.a, kin.m, ls, t);                     // safety net for interpolation error
      const pts = legPoints('ink', kin.a, kin.m, hx, hy + ls + by);
      const footX = (pts[116][0] + pts[146][0]) / 2; let footLow = -1e9; for (let i = 80; i <= 146; i++) if (pts[i][1] > footLow) footLow = pts[i][1];
      return { a: kin.a, m: kin.m, ls, by, low: [footX, footLow], planted: false, hx, hy, u }; }
    return { pose }; }
  const nearLeg = makeLeg(RIG.nearHip, 0), farLeg = makeLeg(RIG.farHip, STEP);

  /* ---- upper body pivots (artwork coordinates) ---- */
  const SH_L = [292, 272], SH_R = [448, 206], GRIP = [161, 252], BLOOM = [159, 147], TIP = [176, 321];
  const PETALS = [175, 104], SMILE = [378, 92], EYE_RX = 7.89982;

  /* ---- face: irregular blinks with the odd double; the smile grows into a grin now and then ---- */
  const BLINKS = [0.9, 3.6, 3.86, 7.1], BLINK_CYCLE = 9, BLINK_LEN = 0.16;
  const blinkAt = t => { const c = ((t % BLINK_CYCLE) + BLINK_CYCLE) % BLINK_CYCLE; for (const b0 of BLINKS) { const u = (c - b0) / BLINK_LEN; if (u >= 0 && u <= 1) return Math.sin(Math.PI * u); } return 0; };
  const GRINS = [[1.6, 3.4], [5.4, 7.6]];
  const grinAt = t => { const c = ((t % BLINK_CYCLE) + BLINK_CYCLE) % BLINK_CYCLE; let v = 0; for (const g of GRINS) v = Math.max(v, smooth((c - g[0]) / 0.5) * smooth((g[1] - c) / 0.6)); return v; };

  /* ---- render ---- */
  const rot = (deg, x, y) => `rotate(${f2(deg)} ${f2(x)} ${f2(y)})`, tr = (x, y) => `translate(${f2(x)} ${f2(y)})`;
  const scaleAbout = (kx, ky, x, y) => `translate(${f2(x)} ${f2(y)}) scale(${f2(kx)} ${f2(ky)}) translate(${f2(-x)} ${f2(-y)})`;
  function drawLeg(p, inkEl, paperEl) { const hy = p.hy + p.ls;
    inkEl.setAttribute("d", toPath(legPoints("ink", p.a, p.m, p.hx, hy))); paperEl.setAttribute("d", toPath(legPoints("paper", p.a, p.m, p.hx, hy))); }
  function setShadow(node, cx, cy, rx, ry, op, ang) {
    node.setAttribute("cx", f2(cx)); node.setAttribute("cy", f2(cy)); node.setAttribute("rx", f2(Math.max(0, rx))); node.setAttribute("ry", f2(Math.max(0, ry)));
    node.setAttribute("opacity", f2(clamp(op, 0, 1))); node.setAttribute("transform", rot(ang, cx, cy)); }
  function footShadow(node, p, t) { let x, h;
    if (p.planted) { x = (p.heel[0] + p.toe[0]) / 2; h = 0; } else { x = p.low[0]; h = Math.max(0, groundAt(x, t) - p.low[1]); }
    const g = groundAt(x, t), hf = Math.min(1, h / 90);
    setShadow(node, x, g + 8, 80 - 28 * hf, 11 - 3 * hf, 0.85 * (1 - hf), Math.atan(slopeAt(x, t)) / DEG); }

  function render(t) {
    const tl = ((t % LOOP) + LOOP) % LOOP, near = nearLeg.pose(tl), far = farLeg.pose(tl), by = near.by;
    el.ground.setAttribute("transform", tr((V * tl) % LAMBDA, 0));
    el.char.setAttribute("transform", tr(0, by));
    drawLeg(far, el.farInk, el.farPaper); drawLeg(near, el.nearInk, el.nearPaper);
    const upperDy = clamp(0.4 * (bodyY(tl - 0.08) - by), -5, 5);
    const rock = CONFIG.leanDeg + CONFIG.rockDeg * Math.cos(TAU * (tl / STEP - 0.05));
    el.upper.setAttribute("transform", tr(0, upperDy) + " " + rot(rock, RIG.bodyBase[0], RIG.bodyBase[1]));
    // arms: the fist arm swings back when the near leg is forward, a beat behind; the flower arm follows lightly
    const swing = -CONFIG.armSwingDeg * Math.cos(TAU * (tl / CYC - CONFIG.armLag));
    el.armR.setAttribute("transform", rot(swing, SH_R[0], SH_R[1]));
    el.armL.setAttribute("transform", rot(-0.3 * swing, SH_L[0], SH_L[1]));
    // flower: breeze sway from the grip, a little jiggle each step, gentle pulse of the bloom
    const sway = CONFIG.flowerSwayDeg * Math.sin(TAU * t / LOOP) + 0.35 * CONFIG.flowerSwayDeg * Math.sin(TAU * 2 * t / LOOP - 1.2) + 1.2 * Math.sin(TAU * (t / STEP - 0.3));
    el.flower.setAttribute("transform", rot(sway, GRIP[0], GRIP[1]));
    const pulse = 1 + CONFIG.flowerPulse * Math.sin(TAU * t / LOOP - 0.6);
    el.bloom.setAttribute("transform", rot(0.4 * sway, BLOOM[0], BLOOM[1]) + " " + scaleAbout(pulse, pulse, PETALS[0], PETALS[1]));
    el.tip.setAttribute("transform", rot(-0.35 * sway, TIP[0], TIP[1]));
    // face
    const b = CONFIG.blink ? blinkAt(t) : 0, gr = grinAt(t);
    el.eyes.forEach(e => e.setAttribute("rx", f2(EYE_RX * (1 - 0.88 * b))));
    el.smile.setAttribute("transform", "translate(" + SMILE[0] + " " + f2(SMILE[1] - 2 * gr) + ") rotate(" + f2(-2 * gr) + ") scale(" + f2(1 + 0.05 * gr) + " " + f2(1 + 0.07 * gr - 0.02 * b) + ") translate(" + (-SMILE[0]) + " " + (-SMILE[1]) + ")");
    // shadows: body shadow tightens as the body rises; foot shadows fade as feet lift
    const bx = RIG.bodyShadowX, gBody = groundAt(bx, tl), rise = -(by - (gBody - baseY));
    setShadow(el.shBody, bx - 30, gBody + 9, 190 - 1.5 * rise, 15 - 0.1 * rise, clamp(0.6 - 0.01 * rise, 0.25, 0.7), Math.atan(slopeAt(bx, tl)) / DEG);
    footShadow(el.shNear, near, tl); footShadow(el.shFar, far, tl);
  }

  /* ---- loop: pauses off-screen and in hidden tabs; still pose for reduced motion ---- */
  const reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  let animTime = 0, last = null, visible = true, raf = 0, paused = false;
  const running = () => visible && !document.hidden && !reduce.matches && !paused;
  function frame(now) { raf = 0; if (last !== null) animTime += Math.min(0.1, (now - last) / 1000); last = now; render(animTime); if (running()) raf = requestAnimationFrame(frame); }
  function kick() { if (running() && !raf) { last = null; raf = requestAnimationFrame(frame); } else if (!running()) last = null; }
  render(0);
  if (!reduce.matches) kick();
  const onReduce = () => { if (reduce.matches) { animTime = 0; render(0); } else kick(); };
  if (reduce.addEventListener) reduce.addEventListener("change", onReduce);
  document.addEventListener("visibilitychange", kick);
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => { visible = es[0].isIntersecting; kick(); }, { threshold: 0.01 }) : null;
  if (io) io.observe(svg);
  // teardown for React unmounts
  return () => {
    paused = true; if (raf) cancelAnimationFrame(raf); raf = 0;
    if (reduce.removeEventListener) reduce.removeEventListener("change", onReduce);
    document.removeEventListener("visibilitychange", kick);
    if (io) io.disconnect();
  };
}
