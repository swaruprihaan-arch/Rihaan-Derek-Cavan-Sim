/* CONTRAIL RACING — arcade-sim racing engine + menu pages.
   Three.js (shared loader from sim.js), procedural closed-loop tracks, AI opponents, laps, timing,
   on-screen keyboard (keypad.js). Menu pages register into window.CT_ROUTES using helpers from app.js (window.CT_H). */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const KMH = 3.6, MPH = 2.236936;

  /* ---------------- data ---------------- */
  const CARS = [
    { id: 'hatch', name: 'Volt Hatch R', cls: 'Street', type: 'hatch', top: 195, acc: 6.0, grip: 7.5, brake: 1.0, off: .55, color: '#2A62B5', len: 4.0, wid: 1.8, hgt: 1.45, desc: 'Light, nimble and forgiving. The perfect first car.' },
    { id: 'rally', name: 'Dune Rally 4x4', cls: 'Rally', type: 'rally', top: 205, acc: 7.0, grip: 7.0, brake: 1.0, off: .85, color: '#F26B21', len: 4.2, wid: 1.85, hgt: 1.5, desc: 'Barely slows down on grass and gravel. Loves to slide.' },
    { id: 'muscle', name: 'Thunder V8', cls: 'Muscle', type: 'muscle', top: 255, acc: 8.2, grip: 6.0, brake: .9, off: .55, color: '#B8322B', len: 4.8, wid: 1.95, hgt: 1.35, desc: 'Huge power, not much grip. Easy to drift, hard to master.' },
    { id: 'sports', name: 'Kestrel GT-S', cls: 'Sports', type: 'sports', top: 272, acc: 8.6, grip: 8.4, brake: 1.1, off: .5, color: '#F5B942', len: 4.4, wid: 1.9, hgt: 1.25, desc: 'Balanced sports coupe. Quick everywhere.' },
    { id: 'gt', name: 'Meridian GT3', cls: 'GT', type: 'gt', top: 292, acc: 9.2, grip: 9.4, brake: 1.25, off: .45, color: '#10264A', len: 4.6, wid: 2.0, hgt: 1.2, desc: 'Race-bred GT with a big wing and serious downforce.' },
    { id: 'hyper', name: 'Zenith Hyper X', cls: 'Hyper', type: 'hyper', top: 345, acc: 11.0, grip: 9.6, brake: 1.3, off: .4, color: '#111417', len: 4.6, wid: 2.05, hgt: 1.12, desc: 'Absurd straight-line speed. Brake early.' },
    { id: 'open', name: 'Formula C1', cls: 'Open-wheel', type: 'open', top: 330, acc: 12.0, grip: 12.0, brake: 1.5, off: .35, color: '#C8102E', len: 5.0, wid: 1.9, hgt: .95, desc: 'Single-seater. Corners like it is on rails.' },
    { id: 'truck', name: 'Canyon Pickup', cls: 'Truck', type: 'truck', top: 185, acc: 5.4, grip: 5.6, brake: .85, off: .9, color: '#5E6469', len: 5.2, wid: 2.0, hgt: 1.85, desc: 'Heavy and slow, but nothing stops it off-road.' }
  ];
  const COLORS = ['#F5B942', '#C8102E', '#2A62B5', '#10264A', '#5BD68A', '#F26B21', '#F4F6F8', '#111417', '#8E44AD', '#57C7DB', '#5E6469', '#E8739A'];
  const TRACKS = [
    { id: 'coast', name: 'Coastline GP', theme: 'coast', time: 'day', desc: 'Flowing seaside circuit with a long back straight and a tight hairpin.',
      pts: [[0, 0], [320, 0], [540, 50], [620, 210], [540, 380], [390, 420], [320, 560], [400, 720], [310, 870], [80, 880], [-130, 790], [-170, 610], [-60, 490], [-210, 360], [-310, 200], [-230, 40]] },
    { id: 'oval', name: 'Thunder Oval', theme: 'oval', time: 'sunset', desc: 'Flat-out speedway. Draft, dive, and do not lift.', oval: true },
    { id: 'mountain', name: 'Alpine Pass', theme: 'mountain', time: 'day', desc: 'Climbing, twisting mountain road with big elevation changes.', mountain: true },
    { id: 'city', name: 'Neon City', theme: 'city', time: 'night', desc: 'Street circuit through downtown. Walls everywhere, 90° corners.',
      pts: [[0, 0], [380, 0], [430, 30], [440, 280], [400, 320], [300, 330], [270, 360], [270, 520], [230, 560], [0, 560], [-40, 520], [-40, 360], [-80, 320], [-220, 310], [-260, 270], [-260, 40], [-220, 0]] },
    { id: 'desert', name: 'Mirage Raceway', theme: 'desert', time: 'day', desc: 'Fast desert circuit with sweeping esses and a sandy run-off.',
      pts: [[0, 0], [450, -20], [700, 80], [760, 260], [620, 360], [700, 520], [600, 700], [380, 640], [260, 760], [40, 700], [-120, 540], [10, 380], [-140, 230], [-160, 70]] }
  ];
  function trackPoints(t) {
    if (t.pts) return t.pts.map(p => [p[0], 0, p[1]]);
    const out = [];
    if (t.oval) { for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; const sx = Math.abs(Math.cos(a)) > .3 ? 1 : 1; out.push([Math.cos(a) * 520 * (1 + .12 * Math.cos(a) ** 8), 0, Math.sin(a) * 230]); } return out; }
    for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2; const r = 420 + 130 * Math.sin(a * 3) + 60 * Math.cos(a * 5); out.push([Math.cos(a) * r, 34 * Math.sin(a * 2) + 18 * Math.sin(a * 5) + 30, Math.sin(a) * r * .8]); }
    return out;
  }

  /* ---------------- persistence ---------------- */
  const KEY = 'contrail.race';
  const defaults = () => ({ car: 'sports', color: '', track: 'coast', laps: 3, opp: 5, diff: 'normal', time: 'auto', weather: 'dry', units: 'kmh', cam: 'chase', keypad: true, assist: true, sound: true, volume: 70, races: 0, wins: 0, podiums: 0, best: {}, history: [] });
  function load() { try { return Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return defaults(); } }
  let RS = load();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(RS)); } catch (e) { } };
  const carById = id => CARS.find(c => c.id === id) || CARS[0];
  const trackById = id => TRACKS.find(t => t.id === id) || TRACKS[0];
  const carColor = c => (RS.car === c.id && RS.color) ? RS.color : c.color;

  /* ---------------- 2D art ---------------- */
  function carSVG(car, color) {
    const c = color || car.color, t = car.type, dark = '#0A0D12', glass = '#1E2733';
    const wheel = (x, r) => `<circle cx="${x}" cy="${78 - r}" r="${r}" fill="#15181c" stroke="#394655" stroke-width="2"></circle><circle cx="${x}" cy="${78 - r}" r="${r * .45}" fill="#7B8999"></circle>`;
    let body;
    if (t === 'open') body = `<path d="M18 60 L60 56 L90 48 L150 46 L175 52 L222 54 L222 62 L18 66 Z" fill="${c}" stroke="${dark}" stroke-width="1.5"></path><path d="M112 47 C118 34 140 34 146 46 Z" fill="${glass}"></path><rect x="196" y="28" width="30" height="6" fill="${c}" stroke="${dark}"></rect><rect x="208" y="34" width="5" height="20" fill="${dark}"></rect><rect x="8" y="58" width="28" height="5" fill="${c}" stroke="${dark}"></rect>${wheel(52, 16)}${wheel(190, 17)}`;
    else if (t === 'truck') body = `<path d="M16 66 L16 40 L40 38 L60 18 L110 16 L118 38 L226 38 L226 66 Z" fill="${c}" stroke="${dark}" stroke-width="1.5"></path><path d="M66 22 L106 21 L112 38 L54 38 Z" fill="${glass}"></path><rect x="120" y="34" width="104" height="5" fill="${dark}" opacity=".5"></rect>${wheel(52, 18)}${wheel(190, 18)}`;
    else {
      const roof = { hatch: 'M60 40 L84 20 L150 20 L176 40', rally: 'M58 40 L82 20 L148 20 L178 40', muscle: 'M74 40 L100 24 L150 24 L180 40', sports: 'M70 42 L102 24 L150 25 L186 42', gt: 'M76 42 L106 26 L150 27 L188 42', hyper: 'M78 44 L112 28 L150 29 L196 44' }[t] || 'M70 42 L102 24 L150 25 L186 42';
      const tail = t === 'hatch' || t === 'rally' ? 'L200 40 L222 44 L224 64' : 'L210 42 L228 48 L228 64';
      body = `<path d="M12 64 L12 52 L30 44 L64 40 ${roof.replace(/^M\S+ \S+ /, 'L')} ${tail} L12 64 Z" fill="${c}" stroke="${dark}" stroke-width="1.5"></path><path d="${roof} Z" fill="${glass}" opacity=".95"></path><path d="M14 54 L226 54" stroke="${dark}" stroke-opacity=".25"></path>`;
      if (t === 'gt' || t === 'hyper') body += `<rect x="198" y="30" width="32" height="5" fill="${dark}"></rect><rect x="206" y="34" width="4" height="10" fill="${dark}"></rect>`;
      if (t === 'rally') body += `<rect x="96" y="14" width="40" height="4" fill="${dark}"></rect><circle cx="30" cy="50" r="4" fill="#fff6c8"></circle>`;
      if (t === 'muscle') body += `<rect x="40" y="38" width="30" height="4" fill="${dark}" opacity=".6"></rect>`;
      body += wheel(54, t === 'rally' ? 17 : 15) + wheel(188, t === 'rally' ? 17 : 15);
    }
    return `<svg viewBox="0 0 240 90" role="img" aria-label="${car.name}"><ellipse cx="120" cy="80" rx="110" ry="5" fill="#000" opacity=".35"></ellipse>${body}</svg>`;
  }
  function trackSVG(t, size) {
    const pts = trackPoints(t); let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
    // sample a smooth closed curve (Catmull-Rom) in 2D
    const n = pts.length, sm = [];
    for (let i = 0; i < n; i++) for (let k = 0; k < 8; k++) {
      const u = k / 8, p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      const f = (a, b, c, d) => .5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
      const x = f(p0[0], p1[0], p2[0], p3[0]), z = f(p0[2], p1[2], p2[2], p3[2]); sm.push([x, z]);
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
    }
    const W = size || 200, s = (W - 24) / Math.max(maxX - minX, maxZ - minZ), ox = (W - (maxX - minX) * s) / 2, oz = (W - (maxZ - minZ) * s) / 2;
    const d = sm.map((p, i) => (i ? 'L' : 'M') + ((p[0] - minX) * s + ox).toFixed(1) + ' ' + ((p[1] - minZ) * s + oz).toFixed(1)).join(' ') + 'Z';
    const st = sm[0];
    return `<svg viewBox="0 0 ${W} ${W}" role="img" aria-label="${t.name} layout"><path d="${d}" fill="none" stroke="#394655" stroke-width="9" stroke-linejoin="round"></path><path d="${d}" fill="none" stroke="#57C7DB" stroke-width="3" stroke-linejoin="round"></path><circle cx="${((st[0] - minX) * s + ox).toFixed(1)}" cy="${((st[1] - minZ) * s + oz).toFixed(1)}" r="6" fill="#F5B942"></circle></svg>`;
  }

  /* ---------------- 3D helpers ---------------- */
  let THREE = null;
  function texCanvas(w, h, draw) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
  function buildCar(car, color) {
    const T = THREE, g = new T.Group(), L = car.len, W = car.wid, H = car.hgt;
    const paint = new T.MeshStandardMaterial({ color, roughness: .35, metalness: .45 });
    const dark = new T.MeshStandardMaterial({ color: 0x15181c, roughness: .8 });
    const glass = new T.MeshStandardMaterial({ color: 0x0e1620, roughness: .1, metalness: .8 });
    const add = (geo, mat, x, y, z) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
    const wr = car.type === 'truck' || car.type === 'rally' ? .42 : car.type === 'open' ? .38 : .34;
    if (car.type === 'open') {
      add(new T.BoxGeometry(.9, .45, L * .78), paint, 0, .45, 0);
      add(new T.BoxGeometry(.6, .35, 1.2), paint, 0, .5, -L * .45);
      add(new T.BoxGeometry(1.8, .08, .5), paint, 0, .25, -L * .5);
      add(new T.BoxGeometry(1.4, .08, .5), paint, 0, 1.0, L * .45);
      add(new T.BoxGeometry(.08, .55, .4), dark, .5, .75, L * .45); add(new T.BoxGeometry(.08, .55, .4), dark, -.5, .75, L * .45);
      add(new T.BoxGeometry(1.5, .4, 1.2), paint, 0, .45, L * .08);
      add(new T.SphereGeometry(.28, 12, 8), new T.MeshStandardMaterial({ color: 0xF5B942, roughness: .3 }), 0, .85, -L * .02);
    } else {
      const bh = H * .5, cabH = H * .42;
      add(new T.BoxGeometry(W, bh, L), paint, 0, wr + bh / 2 - .05, 0);
      const cabL = car.type === 'truck' ? L * .32 : car.type === 'hatch' || car.type === 'rally' ? L * .55 : L * .45;
      const cabZ = car.type === 'truck' ? -L * .12 : car.type === 'hatch' || car.type === 'rally' ? L * .06 : L * .02;
      const cab = add(new T.BoxGeometry(W * .86, cabH, cabL), paint, 0, wr + bh + cabH / 2 - .06, cabZ);
      add(new T.BoxGeometry(W * .88, cabH * .8, cabL * .82), glass, 0, wr + bh + cabH / 2 - .06, cabZ);
      if (car.type === 'gt' || car.type === 'hyper') { add(new T.BoxGeometry(W * .95, .07, .45), dark, 0, wr + bh + .45, L * .46); add(new T.BoxGeometry(.07, .4, .2), dark, .5, wr + bh + .22, L * .44); add(new T.BoxGeometry(.07, .4, .2), dark, -.5, wr + bh + .22, L * .44); }
      if (car.type === 'rally') add(new T.BoxGeometry(W * .7, .06, .5), dark, 0, wr + bh + cabH + .02, cabZ);
      if (car.type === 'truck') add(new T.BoxGeometry(W * .95, .12, L * .4), dark, 0, wr + bh + .02, L * .28);
    }
    // lights
    const hl = new T.MeshStandardMaterial({ color: 0xfff6d8, emissive: 0xfff2c0, emissiveIntensity: 1.2 });
    const tl = new T.MeshStandardMaterial({ color: 0x550000, emissive: 0xff1010, emissiveIntensity: .6 });
    if (car.type !== 'open') { const y = wr + car.hgt * .3; [-1, 1].forEach(k => { add(new T.BoxGeometry(.4, .14, .05), hl, k * W * .32, y, -L / 2 - .01); add(new T.BoxGeometry(.4, .12, .05), tl, k * W * .34, y + .05, L / 2 + .01); }); }
    else add(new T.BoxGeometry(.25, .12, .05), tl, 0, .55, L * .48);
    // wheels
    const wheels = [];
    const wg = new T.CylinderGeometry(wr, wr, car.type === 'open' ? .45 : .3, 18); wg.rotateZ(Math.PI / 2);
    const hub = new T.MeshStandardMaterial({ color: 0x9aa1a8, metalness: .8, roughness: .3 });
    const tx = car.type === 'open' ? W * .55 : W * .47;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      const holder = new T.Group(); holder.position.set(sx * tx, wr, sz * L * (car.type === 'open' ? .38 : .33)); g.add(holder);
      const w = new T.Mesh(wg, dark); w.castShadow = true; holder.add(w);
      const h = new T.Mesh(new T.CylinderGeometry(wr * .5, wr * .5, .32, 10).rotateZ(Math.PI / 2), hub); w.add(h);
      wheels.push({ holder, w, front: sz < 0 });
    });
    return { group: g, wheels, tail: tl };
  }

  /* ---------------- audio ---------------- */
  function makeAudio(vol) {
    let ctx; try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    const m = ctx.createGain(); m.gain.value = vol; m.connect(ctx.destination);
    const o = ctx.createOscillator(); o.type = 'sawtooth'; const o2 = ctx.createOscillator(); o2.type = 'square';
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; const eg = ctx.createGain(); eg.gain.value = 0;
    o.connect(f); o2.connect(f); f.connect(eg).connect(m); o.start(); o2.start();
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), ch = buf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    const n = ctx.createBufferSource(); n.buffer = buf; n.loop = true; const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 1800; nf.Q.value = 2; const ng = ctx.createGain(); ng.gain.value = 0; n.connect(nf).connect(ng).connect(m); n.start();
    return {
      ctx, set(rpm, thr, skid) { const t = ctx.currentTime; o.frequency.setTargetAtTime(40 + rpm * 160, t, .05); o2.frequency.setTargetAtTime(20 + rpm * 80, t, .05); eg.gain.setTargetAtTime(.05 + thr * .08, t, .1); ng.gain.setTargetAtTime(Math.min(.25, skid * .3), t, .05); },
      beep(fq, d) { const oo = ctx.createOscillator(), gg = ctx.createGain(); oo.frequency.value = fq; gg.gain.setValueAtTime(.25, ctx.currentTime); gg.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + d); oo.connect(gg).connect(m); oo.start(); oo.stop(ctx.currentTime + d); },
      close() { try { ctx.close(); } catch (e) { } }
    };
  }

  /* ---------------- race session ---------------- */
  let R = null;
  const KEYS = { gas: 'KeyW', brake: 'KeyS', left: 'KeyA', right: 'KeyD', hand: 'Space', boost: 'ShiftLeft', reset: 'KeyR', cam: 'KeyV', back: 'KeyC' };

  async function start(cfg, onExit) {
    stop();
    let root = document.getElementById('race');
    if (!root) { root = document.createElement('div'); root.id = 'race'; document.body.appendChild(root); }
    root.innerHTML = `<div id="r-loading" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;background:#0A0D12;z-index:6;font-family:var(--display);letter-spacing:.14em;text-transform:uppercase;color:var(--text2)"><div>Building track…</div><div class="mono muted" id="r-ld" style="font-size:12px"></div></div>`;
    root.classList.add('on');
    try { THREE = await window.CT_SIM.preload(); } catch (e) {
      root.querySelector('#r-ld').textContent = 'Could not load the 3D engine (needs internet the first time). ' + e.message;
      root.querySelector('#r-loading').insertAdjacentHTML('beforeend', '<button class="btn sec" type="button" id="r-bail">Back</button>');
      root.querySelector('#r-bail').onclick = () => { stop(); onExit && onExit(null); }; return;
    }
    await new Promise(r => setTimeout(r, 30));
    R = new Race(cfg, onExit, root); window.__race = R; R.init();
  }
  function stop() { if (R) { R.dispose(); R = null; } const root = document.getElementById('race'); if (root) { root.classList.remove('on'); root.innerHTML = ''; } window.__race = null; }

  class Race {
    constructor(cfg, onExit, root) { this.cfg = cfg; this.onExit = onExit; this.root = root; this.keys = {}; this.paused = false; this.camMode = RS.cam || 'chase'; }
    init() {
      const T = THREE, cfg = this.cfg, tr = cfg.track;
      this.W = tr.theme === 'oval' ? 22 : tr.theme === 'city' ? 13 : 15;
      this.verge = tr.theme === 'city' ? 4 : tr.theme === 'oval' ? 14 : 22;
      // curve + samples
      const cp = trackPoints(tr).map(p => new T.Vector3(p[0], p[1], p[2]));
      const curve = new T.CatmullRomCurve3(cp, true, 'centripetal');
      const len = curve.getLength(), N = Math.round(len / 4);
      this.N = N; this.len = len;
      const P = curve.getSpacedPoints(N); P.pop();
      this.P = P; this.Tn = []; this.Nn = []; this.curv = [];
      for (let i = 0; i < N; i++) { const a = P[(i - 1 + N) % N], b = P[(i + 1) % N]; const t = new T.Vector3(b.x - a.x, 0, b.z - a.z).normalize(); this.Tn.push(t); this.Nn.push(new T.Vector3(-t.z, 0, t.x)); }
      for (let i = 0; i < N; i++) { const t0 = this.Tn[(i - 2 + N) % N], t1 = this.Tn[(i + 2) % N]; const ang = Math.acos(clamp(t0.dot(t1), -1, 1)); this.curv.push(ang / 16); }
      // renderer
      const canvas = document.createElement('canvas'); canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'; this.root.prepend(canvas); this.canvas = canvas;
      const r = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
      r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
      r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; this.renderer = r;
      const scene = new T.Scene(); this.scene = scene;
      this.camera = new T.PerspectiveCamera(68, 1, .3, 6000);
      this.buildWorld();
      this.buildCars();
      this.buildHud();
      this.resize(); this._rs = () => this.resize(); window.addEventListener('resize', this._rs);
      this.bindInput();
      this.audio = RS.sound === false ? null : makeAudio((RS.volume ?? 70) / 100 * .5);
      this.root.querySelector('#r-loading').remove();
      this.reset();
      this.last = performance.now(); this.alive = true;
      const loop = t => { if (!this.alive) return; this.raf = requestAnimationFrame(loop); this.frame(t); };
      this.raf = requestAnimationFrame(loop);
    }
    timeOfDay() { const t = this.cfg.time; return t === 'auto' ? this.cfg.track.time : t; }
    buildWorld() {
      const T = THREE, sc = this.scene, tr = this.cfg.track, N = this.N, P = this.P, Nn = this.Nn, W = this.W, V = this.verge;
      const tod = this.timeOfDay(), night = tod === 'night', sunset = tod === 'sunset', rain = this.cfg.weather === 'rain';
      const pal = { coast: [0x4f7a35, 0x2a6f9c], oval: [0x4a6b33, 0x4a6b33], mountain: [0x3d5a2e, 0x6d6f73], city: [0x3a3d42, 0x2d3036], desert: [0xc9a46a, 0xb08850] }[tr.theme];
      const sky = night ? 0x05070d : sunset ? 0xe39a6a : rain ? 0x7d8792 : 0x8ec3ea;
      sc.background = new T.Color(sky); sc.fog = new T.Fog(sky, night ? 120 : 300, night ? 900 : rain ? 900 : 2200);
      this.hemi = new T.HemisphereLight(night ? 0x4a5a80 : 0xcfe6ff, pal[0], night ? .55 : 1.0); sc.add(this.hemi);
      const sun = new T.DirectionalLight(night ? 0x8899cc : sunset ? 0xffb07a : 0xffffff, night ? .35 : sunset ? 1.8 : 2.4);
      sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const s = sun.shadow.camera; s.left = s.bottom = -60; s.right = s.top = 60; s.near = 1; s.far = 600;
      sc.add(sun, sun.target); this.sun = sun; this.sunOff = new T.Vector3(sunset ? -200 : 120, sunset ? 70 : 260, 140);
      this.renderer.toneMappingExposure = night ? .9 : 1;
      let minY = 1e9; P.forEach(p => minY = Math.min(minY, p.y)); this.minY = minY;
      // ground
      const gnd = new T.Mesh(new T.PlaneGeometry(9000, 9000), new T.MeshStandardMaterial({ color: pal[0], roughness: 1 }));
      gnd.rotation.x = -Math.PI / 2; gnd.position.y = minY - .6; gnd.receiveShadow = true; sc.add(gnd);
      if (tr.theme === 'coast') { const sea = new T.Mesh(new T.PlaneGeometry(9000, 4000), new T.MeshStandardMaterial({ color: 0x1f5f8a, roughness: .2, metalness: .3 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, minY - .5, -2300); sc.add(sea); }
      // ribbons
      const ribbon = (o1, o2, yOff, mat, vScale) => {
        const pos = [], uv = [], idx = []; let dist = 0;
        for (let i = 0; i <= N; i++) {
          const k = i % N, p = P[k], n = Nn[k];
          if (i > 0) dist += P[k].distanceTo(P[(i - 1) % N]);
          pos.push(p.x + n.x * o1, p.y + yOff, p.z + n.z * o1, p.x + n.x * o2, p.y + yOff, p.z + n.z * o2);
          uv.push(0, dist / vScale, 1, dist / vScale);
          if (i < N) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
        }
        const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
        const m = new T.Mesh(g, mat); m.receiveShadow = true; sc.add(m); return m;
      };
      const asphalt = texCanvas(128, 256, (x, w, h) => {
        x.fillStyle = tr.theme === 'desert' ? '#4a4540' : '#34373c'; x.fillRect(0, 0, w, h);
        for (let i = 0; i < 2500; i++) { x.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '0,0,0'},${Math.random() * .07})`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
        x.fillStyle = '#e8e8e8'; x.fillRect(3, 0, 4, h); x.fillRect(w - 7, 0, 4, h);
        if (tr.theme === 'oval' || tr.theme === 'city') { x.fillStyle = '#d9d9d9'; x.fillRect(w / 2 - 2, 0, 4, h * .5); }
      });
      ribbon(-W / 2, W / 2, .02, new T.MeshStandardMaterial({ map: asphalt, roughness: rain ? .25 : .9, metalness: rain ? .3 : 0, side: T.DoubleSide }), 32);
      const kerb = texCanvas(32, 64, (x, w, h) => { x.fillStyle = '#e8e8e8'; x.fillRect(0, 0, w, h); x.fillStyle = '#c8102e'; x.fillRect(0, 0, w, h / 2); });
      const kerbMat = new T.MeshStandardMaterial({ map: kerb, roughness: .7, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1 });
      ribbon(-W / 2 - 1.4, -W / 2, .04, kerbMat, 4); ribbon(W / 2, W / 2 + 1.4, .04, kerbMat, 4);
      const vergeCol = tr.theme === 'desert' ? 0xd8b67a : tr.theme === 'city' ? 0x55585e : tr.theme === 'mountain' ? 0x4b6b38 : 0x5c8a3d;
      const vm = new T.MeshStandardMaterial({ color: vergeCol, roughness: 1, side: T.DoubleSide });
      ribbon(-W / 2 - V, -W / 2 - 1.4, -.02, vm, 10); ribbon(W / 2 + 1.4, W / 2 + V, -.02, vm, 10);
      // barriers
      const bar = texCanvas(64, 32, (x, w, h) => { const city = tr.theme === 'city'; x.fillStyle = city ? '#9aa1a8' : '#f4f6f8'; x.fillRect(0, 0, w, h); if (!city) { x.fillStyle = '#c8102e'; x.fillRect(0, 0, w / 2, h); } else { x.fillStyle = '#57C7DB'; x.fillRect(0, h * .4, w, h * .2); } });
      const wallRibbon = off => {
        const pos = [], uv = [], idx = []; let dist = 0; const H = tr.theme === 'city' ? 2.2 : 1.1;
        for (let i = 0; i <= N; i++) { const k = i % N, p = P[k], n = Nn[k]; if (i) dist += P[k].distanceTo(P[(i - 1) % N]); const x = p.x + n.x * off, z = p.z + n.z * off; pos.push(x, p.y - .5, z, x, p.y + H, z); uv.push(dist / 6, 0, dist / 6, 1); if (i < N) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
        const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
        const m = new T.Mesh(g, new T.MeshStandardMaterial({ map: bar, roughness: .7, side: T.DoubleSide })); m.castShadow = true; sc.add(m);
      };
      this.wallOff = W / 2 + V; wallRibbon(-this.wallOff); wallRibbon(this.wallOff);
      // start line + gantry
      const p0 = P[0], n0 = Nn[0], t0 = this.Tn[0];
      const chk = texCanvas(64, 16, (x, w, h) => { for (let i = 0; i < 16; i++) for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 2 ? '#111' : '#fff'; x.fillRect(i * 4, j * 4, 4, 4); } });
      const slg = new T.PlaneGeometry(W, 2.4); slg.rotateX(-Math.PI / 2);
      const sl = new T.Mesh(slg, new T.MeshStandardMaterial({ map: chk, roughness: .8, polygonOffset: true, polygonOffsetFactor: -2 }));
      sl.position.set(p0.x, p0.y + .05, p0.z); sl.rotation.y = Math.atan2(t0.x, t0.z);
      sc.add(sl);
      const gant = new T.Group(); gant.position.copy(p0); gant.rotation.y = Math.atan2(t0.x, t0.z); sc.add(gant);
      const steel = new T.MeshStandardMaterial({ color: 0x2b2f36, roughness: .5, metalness: .6 });
      [-1, 1].forEach(k => { const post = new T.Mesh(new T.BoxGeometry(.6, 8, .6), steel); post.position.set(k * (W / 2 + 2), 4, 0); post.castShadow = true; gant.add(post); });
      const beam = new T.Mesh(new T.BoxGeometry(W + 4.6, 1.4, .8), steel); beam.position.set(0, 7.6, 0); gant.add(beam);
      this.lights = [];
      for (let i = 0; i < 5; i++) { const m = new T.Mesh(new T.CircleGeometry(.42, 16), new T.MeshBasicMaterial({ color: 0x220000 })); m.position.set((i - 2) * 1.3, 7.6, -.41); m.rotation.y = Math.PI; gant.add(m); this.lights.push(m); }
      // scenery
      const rnd = mulberry(tr.id.length * 977);
      const dummy = new T.Object3D(), col = new T.Color();
      const outside = (x, z, margin) => { let best = 1e9; for (let i = 0; i < N; i += 3) { const p = P[i]; const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < best) best = d; } return Math.sqrt(best) > this.wallOff + margin; };
      if (tr.theme === 'city') {
        const NB = 260, bm = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), new T.MeshStandardMaterial({ color: 0xffffff, roughness: .6, emissive: 0x223355, emissiveIntensity: night ? .5 : 0 }), NB); let bi = 0;
        for (let i = 0; i < NB * 6 && bi < NB; i++) { const x = (rnd() - .4) * 1400, z = (rnd() - .3) * 1200; const w = 20 + rnd() * 40; if (!outside(x, z, w * .75)) continue; const h = 15 + rnd() * rnd() * 140; dummy.position.set(x, minY + h / 2, z); dummy.scale.set(w, h, w * (.7 + rnd() * .6)); dummy.updateMatrix(); bm.setMatrixAt(bi, dummy.matrix); col.setHSL(.6, .1, .2 + rnd() * .35); bm.setColorAt(bi, col); bi++; }
        bm.count = bi; bm.castShadow = true; sc.add(bm);
        // street lamps
        const lampMat = new T.MeshBasicMaterial({ color: 0xfff1c0 });
        for (let i = 0; i < N; i += 12) { const p = P[i], n = Nn[i]; const lamp = new T.Mesh(new T.SphereGeometry(.5, 8, 6), lampMat); lamp.position.set(p.x + n.x * (this.wallOff + 1), p.y + 7, p.z + n.z * (this.wallOff + 1)); sc.add(lamp); }
      } else {
        const NT = 1600, tree = new T.InstancedMesh(tr.theme === 'desert' ? new T.CylinderGeometry(.5, .7, 1, 6).translate(0, .5, 0) : new T.ConeGeometry(1, 1, 7).translate(0, .5, 0), new T.MeshStandardMaterial({ color: 0xffffff, roughness: 1 }), NT); let ti = 0;
        for (let i = 0; i < NT * 4 && ti < NT; i++) { const x = (rnd() - .5) * 2600, z = (rnd() - .5) * 2600; if (!outside(x, z, 6)) continue; let near = P[0]; let bd = 1e18; for (let j = 0; j < N; j += 6) { const d = (P[j].x - x) ** 2 + (P[j].z - z) ** 2; if (d < bd) { bd = d; near = P[j]; } } const h = tr.theme === 'desert' ? 2 + rnd() * 4 : 6 + rnd() * 12; dummy.position.set(x, near.y - .6, z); dummy.scale.set(h * .35, h, h * .35); dummy.updateMatrix(); tree.setMatrixAt(ti, dummy.matrix); col.setHSL(tr.theme === 'desert' ? .25 : .28 + rnd() * .06, tr.theme === 'desert' ? .3 : .45, .14 + rnd() * .1); tree.setColorAt(ti, col); ti++; }
        tree.count = ti; tree.castShadow = true; sc.add(tree);
        if (tr.theme === 'mountain' || tr.theme === 'desert') { for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, d = 1600 + rnd() * 900, h = 250 + rnd() * 500; const mtn = new T.Mesh(new T.ConeGeometry(h * .9, h, 7), new T.MeshStandardMaterial({ color: tr.theme === 'desert' ? 0xb07a4a : 0x6d6f73, roughness: 1, flatShading: true })); mtn.position.set(Math.cos(a) * d, minY + h / 2 - 5, Math.sin(a) * d); sc.add(mtn); if (tr.theme === 'mountain') { const cap = new T.Mesh(new T.ConeGeometry(h * .32, h * .36, 7), new T.MeshStandardMaterial({ color: 0xf4f6f8, flatShading: true })); cap.position.set(mtn.position.x, minY + h * .82 - 5, mtn.position.z); sc.add(cap); } } }
      }
      // grandstands near start
      const stand = new T.MeshStandardMaterial({ color: 0x8a96a3, roughness: .7 }), crowd = new T.MeshStandardMaterial({ color: 0x3a4a63, roughness: 1 });
      for (let k = -2; k <= 2; k++) { const i = (k * 10 + N) % N, p = P[i], n = Nn[i]; const off = this.wallOff + 14; const st = new T.Mesh(new T.BoxGeometry(18, 8, 40), stand); st.position.set(p.x - n.x * off, p.y + 3, p.z - n.z * off); st.rotation.y = Math.atan2(this.Tn[i].x, this.Tn[i].z); st.castShadow = true; sc.add(st); const cr = new T.Mesh(new T.BoxGeometry(12, 2, 38), crowd); cr.position.copy(st.position).add(new T.Vector3(n.x * 2, 4.5, n.z * 2)); cr.rotation.copy(st.rotation); sc.add(cr); }
      // rain
      if (rain) { const n = 3000, pp = new Float32Array(n * 3); for (let i = 0; i < n * 3; i++) pp[i] = (Math.random() - .5) * 80; const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pp, 3)); this.rain = new T.Points(g, new T.PointsMaterial({ color: 0xaabbcc, size: .12, transparent: true, opacity: .6 })); sc.add(this.rain); }
    }
    buildCars() {
      const T = THREE, cfg = this.cfg, n = cfg.opp;
      this.cars = [];
      const me = { car: cfg.car, color: cfg.color, ai: false, name: 'You' };
      const pool = CARS.filter(c => c.id !== cfg.car.id), names = ['Nova', 'Raptor', 'Blaze', 'Kai', 'Vega', 'Orion', 'Jett', 'Luna', 'Rex', 'Storm', 'Ace'];
      const grid = [];
      for (let i = 0; i < n; i++) { const c = cfg.sameClass ? cfg.car : pool[i % pool.length]; grid.push({ car: c, color: COLORS[(i * 5 + 2) % COLORS.length], ai: true, name: names[i % names.length] }); }
      const playerSlot = Math.min(n, cfg.gridPos === 'front' ? 0 : cfg.gridPos === 'back' ? n : Math.floor(n / 2));
      grid.splice(playerSlot, 0, me);
      const skill = { easy: .84, normal: .93, hard: 1.0, pro: 1.06 }[cfg.diff] || .93;
      grid.forEach((g, i) => {
        const m = buildCar(g.car, g.color); this.scene.add(m.group);
        this.cars.push(Object.assign(g, { mesh: m, i, slot: i, pos: new T.Vector3(), vel: new T.Vector3(), heading: 0, steer: 0, idx: 0, lap: 0, check: true, lapStart: 0, laps: [], best: Infinity, finished: false, finishT: 0, skill: skill * (.97 + (i % 4) * .015), lane: ((i % 3) - 1) * 2.4, rpm: 0, gear: 1, wrongT: 0, boost: 1, offT: 0 }));
      });
      this.me = this.cars.find(c => !c.ai);
      if (this.timeOfDay() === 'night') { const L = new T.SpotLight(0xfff2d0, 90, 120, .45, .5, 1.2); L.position.set(0, 1.2, -2); const tgt = new T.Object3D(); tgt.position.set(0, 0, -30); this.me.mesh.group.add(L, tgt); L.target = tgt; }
    }
    reset() {
      const N = this.N;
      this.cars.forEach((c, k) => {
        const row = Math.floor(k / 2), side = k % 2 ? -1 : 1, idx = (N - 3 - row * 3) % N;
        const p = this.P[idx], n = this.Nn[idx], t = this.Tn[idx];
        c.pos.set(p.x + n.x * side * this.W * .22, p.y, p.z + n.z * side * this.W * .22); c.vel.set(0, 0, 0);
        c.heading = Math.atan2(t.x, -t.z); c.idx = idx; c.lap = 0; c.check = true; c.laps = []; c.best = Infinity; c.finished = false; c.finishT = 0; c.steer = 0; c.wrongT = 0; c.offT = 0; c.boostLeft = 1;
      });
      this.t = 0; this.phase = 'count'; this.countT = 0; this.raceT = 0; this.resultShown = false; this.boostMeter = 1;
      this.root.querySelector('#r-end').classList.remove('on'); this.camSmooth = null;
      this.lights.forEach(l => l.material.color.set(0x220000));
    }

    /* ---------- input ---------- */
    bindInput() {
      this._kd = e => {
        if (e.code === 'Escape') { e.preventDefault(); if (!this.resultShown) this.togglePause(); return; }
        if (this.paused) return;
        if (Object.values(KEYS).includes(e.code) || e.code.startsWith('Arrow') || e.code === 'KeyK' || e.code === 'KeyP') e.preventDefault(); else return;
        this.keys[e.code] = true; if (e.repeat) return;
        if (e.code === KEYS.cam) { const m = ['chase', 'far', 'hood']; this.camMode = m[(m.indexOf(this.camMode) + 1) % m.length]; RS.cam = this.camMode; save(); this.camSmooth = null; this.flash({ chase: 'Chase cam', far: 'Far cam', hood: 'Bonnet cam' }[this.camMode], .8, 32); }
        if (e.code === KEYS.reset) this.resetCar(this.me);
        if (e.code === 'KeyK') this.keypad && this.keypad.toggle();
        if (e.code === 'KeyP') this.togglePause();
      };
      this._ku = e => { this.keys[e.code] = false; };
      this._bl = () => { this.keys = {}; if (!this.paused && !this.resultShown) this.togglePause(true); };
      window.addEventListener('keydown', this._kd); window.addEventListener('keyup', this._ku); window.addEventListener('blur', this._bl);
      this.root.querySelectorAll('[data-r]').forEach(b => b.onclick = () => this.menu(b.dataset.r));
    }
    menu(a) {
      if (a === 'resume') this.togglePause(false);
      else if (a === 'restart') { this.reset(); this.togglePause(false); }
      else if (a === 'exit') { const res = this.result || null; const cb = this.onExit; stop(); cb && cb(res); }
    }
    togglePause(v) { this.paused = v === undefined ? !this.paused : v; this.root.querySelector('#r-pause').classList.toggle('on', this.paused); if (this.audio) this.paused ? this.audio.ctx.suspend() : this.audio.ctx.resume(); }
    resetCar(c) {
      const p = this.P[c.idx], t = this.Tn[c.idx];
      c.pos.set(p.x, p.y, p.z); c.vel.set(0, 0, 0); c.heading = Math.atan2(t.x, -t.z); c.wrongT = 0; c.offT = 0;
      if (!c.ai) this.flash('Back on track', .8, 32);
    }

    /* ---------- physics ---------- */
    nearest(c) {
      const N = this.N; let best = 1e18, bi = c.idx;
      for (let k = -10; k <= 30; k++) { const i = (c.idx + k + N) % N, p = this.P[i]; const d = (p.x - c.pos.x) ** 2 + (p.z - c.pos.z) ** 2; if (d < best) { best = d; bi = i; } }
      if (best > 900) for (let i = 0; i < N; i++) { const p = this.P[i]; const d = (p.x - c.pos.x) ** 2 + (p.z - c.pos.z) ** 2; if (d < best) { best = d; bi = i; } }
      return bi;
    }
    controlsFor(c, dt) {
      if (this.phase === 'count') return { gas: 0, brake: 1, steer: 0, hand: 0, boost: 0 };
      if (!c.ai) {
        const k = this.keys;
        if (c.finished) return { gas: 0, brake: .4, steer: 0, hand: 0, boost: 0 };
        const steerIn = (k[KEYS.right] || k.ArrowRight ? 1 : 0) - (k[KEYS.left] || k.ArrowLeft ? 1 : 0);
        return { gas: k[KEYS.gas] || k.ArrowUp ? 1 : 0, brake: k[KEYS.brake] || k.ArrowDown ? 1 : 0, steer: steerIn, hand: k[KEYS.hand] ? 1 : 0, boost: k[KEYS.boost] ? 1 : 0 };
      }
      // AI: aim at a point ahead on its lane, brake for corners ahead
      const N = this.N, v = c.vel.length(), look = Math.round((12 + v * .9) / 4);
      const ti = (c.idx + look) % N, tp = this.P[ti], tn = this.Nn[ti];
      const tx = tp.x + tn.x * c.lane, tz = tp.z + tn.z * c.lane;
      const want = Math.atan2(tx - c.pos.x, -(tz - c.pos.z));
      let dh = want - c.heading; while (dh > Math.PI) dh -= 2 * Math.PI; while (dh < -Math.PI) dh += 2 * Math.PI;
      let kmax = 0; const span = Math.round((20 + v * 2.6) / 4);
      for (let k = 2; k < span; k++) kmax = Math.max(kmax, this.curv[(c.idx + k) % N]);
      const gripAcc = c.car.grip / 8 * 1.35 * 9.81 * (this.cfg.weather === 'rain' ? .78 : 1) * c.skill;
      const vmax = c.car.top / KMH * c.skill;
      let vt = Math.min(vmax, kmax > 1e-4 ? Math.sqrt(gripAcc / kmax) * 1.05 : vmax);
      // rubber band
      const lead = (c.lap * N + c.idx) - (this.me.lap * N + this.me.idx);
      if (lead > 40) vt *= .95; else if (lead < -60) vt *= 1.04;
      // avoid car directly ahead
      let block = false;
      for (const o of this.cars) { if (o === c) continue; const dx = o.pos.x - c.pos.x, dz = o.pos.z - c.pos.z; const f = dx * Math.sin(c.heading) - dz * Math.cos(c.heading), l = dx * Math.cos(c.heading) + dz * Math.sin(c.heading); if (f > 0 && f < 12 && Math.abs(l) < 2.6) { block = true; c.lane = clamp(c.lane + (l > 0 ? -1 : 1) * dt * 4, -this.W * .32, this.W * .32); } }
      if (!block) c.lane += (((c.slot % 3) - 1) * 2.4 - c.lane) * dt * .3;
      return { gas: v < vt ? 1 : 0, brake: v > vt + 2 ? clamp((v - vt) / 8, 0, 1) : 0, steer: clamp(dh * 2.2, -1, 1), hand: 0, boost: 0 };
    }
    stepCar(c, dt) {
      const car = c.car, ctl = this.controlsFor(c, dt);
      const fwd = { x: Math.sin(c.heading), z: -Math.cos(c.heading) }, right = { x: Math.cos(c.heading), z: Math.sin(c.heading) };
      let vf = c.vel.x * fwd.x + c.vel.z * fwd.z, vl = c.vel.x * right.x + c.vel.z * right.z;
      // surface
      const i = c.idx, p = this.P[i], n = this.Nn[i];
      const lat = (c.pos.x - p.x) * n.x + (c.pos.z - p.z) * n.z;
      const onRoad = Math.abs(lat) < this.W / 2 + 1.4;
      const rain = this.cfg.weather === 'rain' ? .78 : 1;
      const surf = onRoad ? 1 : car.off;
      let vmax = car.top / KMH * surf * (c.ai ? c.skill : 1);
      // boost (player only)
      let boosting = false;
      if (!c.ai && ctl.boost && this.boostMeter > 0 && vf > 5) { boosting = true; this.boostMeter = Math.max(0, this.boostMeter - dt / 4); vmax *= 1.15; }
      else if (!c.ai) this.boostMeter = Math.min(1, this.boostMeter + dt / 18);
      c.boosting = boosting;
      // longitudinal
      let a = 0;
      if (ctl.gas) a += car.acc * (boosting ? 1.5 : 1) * clamp(1 - Math.pow(Math.max(vf, 0) / vmax, 1.7), -.5, 1);
      if (ctl.brake) { if (vf > 1) a -= 13 * car.brake * rain * ctl.brake; else if (!c.ai) a -= 5; }
      if (!ctl.gas && !ctl.brake) a -= Math.sign(vf) * 1.4;
      a -= vf * Math.abs(vf) * .0009 + (onRoad ? 0 : vf * .25 * (1 - car.off));
      if (ctl.hand) a -= Math.sign(vf) * 4;
      vf += a * dt; if (vf < -12) vf = -12;
      if (!ctl.gas && !ctl.brake && Math.abs(vf) < .3) vf = 0;
      // steering
      const assist = !c.ai && RS.assist !== false;
      const maxSteer = .62 / (1 + Math.abs(vf) / (assist ? 16 : 22));
      const tgtSteer = ctl.steer * maxSteer;
      c.steer += clamp(tgtSteer - c.steer, -dt * 3.2, dt * 3.2);
      let yaw = vf * Math.tan(c.steer) / 2.6;
      const gripG = car.grip / 8 * 1.35 * rain * (onRoad ? 1 : .7);
      const yawMax = gripG * 9.81 / Math.max(Math.abs(vf), 4) * (ctl.hand ? 1.9 : 1.15);
      yaw = clamp(yaw, -yawMax, yawMax);
      c.heading += yaw * dt;
      // lateral grip
      const latGrip = (ctl.hand ? 1.4 : car.grip * (onRoad ? 1 : .55)) * rain;
      vl *= Math.exp(-latGrip * dt);
      c.skid = Math.abs(vl);
      const nf = { x: Math.sin(c.heading), z: -Math.cos(c.heading) }, nr = { x: Math.cos(c.heading), z: Math.sin(c.heading) };
      c.vel.set(nf.x * vf + nr.x * vl, 0, nf.z * vf + nr.z * vl);
      c.pos.x += c.vel.x * dt; c.pos.z += c.vel.z * dt;
      // walls
      c.idx = this.nearest(c);
      const p2 = this.P[c.idx], n2 = this.Nn[c.idx], lat2 = (c.pos.x - p2.x) * n2.x + (c.pos.z - p2.z) * n2.z;
      const lim = this.wallOff - 1.2;
      if (Math.abs(lat2) > lim) {
        const push = Math.abs(lat2) - lim, s = Math.sign(lat2);
        c.pos.x -= n2.x * s * push; c.pos.z -= n2.z * s * push;
        const vn = c.vel.x * n2.x + c.vel.z * n2.z;
        if (vn * s > 0) { c.vel.x -= n2.x * vn * 1.4; c.vel.z -= n2.z * vn * 1.4; c.vel.multiplyScalar(.82); if (!c.ai && Math.abs(vn) > 4) { this.shake = Math.min(1, Math.abs(vn) / 20); this.audio && this.audio.beep(90, .15); } }
      }
      // height on the track (interpolate)
      const nxt = this.P[(c.idx + 1) % this.N];
      const tt = clamp(((c.pos.x - p2.x) * (nxt.x - p2.x) + (c.pos.z - p2.z) * (nxt.z - p2.z)) / Math.max(1, (nxt.x - p2.x) ** 2 + (nxt.z - p2.z) ** 2), -1, 1);
      c.pos.y = tt >= 0 ? lerp(p2.y, nxt.y, tt) : lerp(p2.y, this.P[(c.idx - 1 + this.N) % this.N].y, -tt);
      c.slope = (nxt.y - p2.y) / 4;
      c.offRoad = !onRoad;
      // laps
      const N = this.N, prev = c._prevIdx ?? c.idx;
      if (c.idx > N * .4 && c.idx < N * .6) c.check = true;
      if (prev > N * .85 && c.idx < N * .15 && c.check) {
        c.check = false; c.lap++;
        if (c.lap > 1) { const lt = this.raceT - c.lapStart; c.laps.push(lt); if (lt < c.best) { c.best = lt; if (!c.ai) this.flash('Best lap ' + fmt(lt), 1.6, 34); } }
        c.lapStart = this.raceT;
        if (c.lap > this.cfg.laps && !c.finished) { c.finished = true; c.finishT = this.raceT; c.place = this.cars.filter(o => o.finished).length; if (!c.ai) this.playerFinished(); }
        else if (!c.ai && c.lap === this.cfg.laps && this.cfg.laps > 1) this.flash('Final lap', 1.4, 48);
      } else if (prev < N * .15 && c.idx > N * .85) { c.lap--; c.check = true; }
      c._prevIdx = c.idx;
      // wrong way
      const tgn = this.Tn[c.idx]; const dot = Math.sin(c.heading) * tgn.x - Math.cos(c.heading) * tgn.z;
      c.wrongT = dot < -.3 && Math.abs(vf) > 3 ? c.wrongT + dt : 0;
      c.offT = c.offRoad && Math.abs(vf) < 2 ? c.offT + dt : 0;
      if (c.ai && (c.wrongT > 2 || c.offT > 3)) this.resetCar(c);
      c.vf = vf; c.rpmIn = ctl.gas; c.braking = !!ctl.brake;
      c.gear = Math.max(1, Math.min(6, 1 + Math.floor(Math.abs(vf) / (car.top / KMH) * 6)));
      c.rpm = vf < 0 ? .3 : clamp(.25 + ((Math.abs(vf) / (car.top / KMH) * 6) % 1) * .75 * (c.gear < 6 ? 1 : 1.2), .2, 1);
    }
    collide() {
      const cs = this.cars;
      for (let a = 0; a < cs.length; a++) for (let b = a + 1; b < cs.length; b++) {
        const A = cs[a], B = cs[b], dx = B.pos.x - A.pos.x, dz = B.pos.z - A.pos.z, d = Math.hypot(dx, dz), min = 2.3;
        if (d < min && d > 1e-3) {
          const nx = dx / d, nz = dz / d, push = (min - d) / 2;
          A.pos.x -= nx * push; A.pos.z -= nz * push; B.pos.x += nx * push; B.pos.z += nz * push;
          const rv = (B.vel.x - A.vel.x) * nx + (B.vel.z - A.vel.z) * nz;
          if (rv < 0) { const j = -rv * .65; A.vel.x -= nx * j; A.vel.z -= nz * j; B.vel.x += nx * j; B.vel.z += nz * j; if (A === this.me || B === this.me) { this.shake = Math.min(1, -rv / 10); this.audio && this.audio.beep(140, .1); } }
        }
      }
    }
    playerFinished() {
      const place = this.me.place;
      this.flash(place === 1 ? 'You win!' : `Finished ${ord(place)}`, 3, 64);
      setTimeout(() => this.showResults(), 2600);
    }
    showResults() {
      if (this.resultShown) return; this.resultShown = true;
      const N = this.N, total = (this.cfg.laps) * N;
      this.cars.forEach(c => { if (!c.finished) { const done = Math.max(1, (c.lap - 1) * N + c.idx), avg = done / Math.max(1, this.raceT - (c.laps.length ? 0 : 0)); c.estT = this.raceT + Math.max(0, total - done) / Math.max(avg, .1); } });
      const ft = c => c.finished ? c.finishT : c.estT;
      const order = this.cars.slice().sort((a, b) => ft(a) - ft(b));
      const _unused = this.cars.slice().sort((a, b) => (a.finished && b.finished) ? a.finishT - b.finishT : a.finished ? -1 : b.finished ? 1 : (b.lap * N + b.idx) - (a.lap * N + a.idx));
      const pPos = order.indexOf(this.me) + 1, win = order[0];
      const body = this.root.querySelector('#r-ebody');
      body.innerHTML = `<table class="results" style="width:100%;border-collapse:collapse"><tr><th>Pos</th><th>Driver</th><th>Car</th><th>Time</th><th>Best lap</th></tr>${order.map((c, i) => `<tr class="${c === this.me ? 'me' : ''}"><td class="mono">${i + 1}</td><td>${c.name}</td><td>${c.car.name}</td><td class="mono">${i === 0 ? fmt(ft(c)) : '+' + fmt(ft(c) - ft(win))}${c.finished ? '' : ' <span class="muted">est.</span>'}</td><td class="mono">${isFinite(c.best) ? fmt(c.best) : '—'}</td></tr>`).join('')}</table>`;
      this.root.querySelector('#r-etitle').textContent = pPos === 1 ? 'Victory!' : `${ord(pPos)} place`;
      this.root.querySelector('#r-etitle').style.color = pPos === 1 ? 'var(--green)' : pPos <= 3 ? 'var(--amber)' : 'var(--text)';
      this.root.querySelector('#r-end').classList.add('on');
      this.result = { pos: pPos, of: this.cars.length, time: this.me.finishT, best: this.me.best, track: this.cfg.track.id, car: this.cfg.car.id, laps: this.cfg.laps };
    }

    /* ---------- frame ---------- */
    frame(now) {
      let dt = Math.min(.05, (now - this.last) / 1000); this.last = now;
      if (!this.paused) {
        this.t += dt;
        if (this.phase === 'count') {
          this.countT += dt; const lit = Math.min(5, Math.floor(this.countT / .7));
          this.lights.forEach((l, i) => l.material.color.set(i < lit ? 0xff1a1a : 0x220000));
          if (lit !== this._lit) { this._lit = lit; if (lit > 0 && lit <= 5) { this.audio && this.audio.beep(440, .15); this.flash(lit < 5 ? String(lit) : 'Ready', .6, 80); } }
          if (this.countT > 4.2) { this.phase = 'race'; this.lights.forEach(l => l.material.color.set(0x1aff4a)); this.flash('GO!', 1, 96); this.audio && this.audio.beep(880, .4); this.cars.forEach(c => c.lapStart = 0); }
        } else this.raceT += dt;
        const sub = 3, h = dt / sub;
        for (let s = 0; s < sub; s++) { this.cars.forEach(c => this.stepCar(c, h)); this.collide(); }
        if (this.me.finished && !this.resultShown && this.raceT - this.me.finishT > 6) this.showResults();
      }
      // meshes
      this.cars.forEach(c => {
        const g = c.mesh.group; g.position.copy(c.pos); g.rotation.set(Math.atan(c.slope || 0), -c.heading + Math.PI, 0, 'YXZ');
        c.mesh.wheels.forEach(w => { w.w.rotation.x -= (c.vf || 0) * dt / .35; if (w.front) w.holder.rotation.y = -c.steer; });
        c.mesh.tail.emissiveIntensity = c.braking ? 2.5 : .6;
      });
      if (this.rain) { const pa = this.rain.geometry.attributes.position; for (let i = 0; i < pa.count; i++) { let y = pa.getY(i) - 30 * dt; if (y < -40) y += 80; pa.setY(i, y); } pa.needsUpdate = true; this.rain.position.copy(this.camera.position); }
      this.updateCamera(dt);
      this.sun.position.copy(this.me.pos).add(this.sunOff); this.sun.target.position.copy(this.me.pos);
      this.renderer.render(this.scene, this.camera);
      this.updateHud(dt);
      if (this.audio) this.audio.set(this.me.rpm || .2, this.me.rpmIn ? 1 : 0, this.me.skid > 3 && !this.me.offRoad ? (this.me.skid - 3) / 6 : 0);
    }
    updateCamera(dt) {
      const c = this.me, cam = this.camera, f = { x: Math.sin(c.heading), z: -Math.cos(c.heading) };
      const back = this.keys[KEYS.back] ? -1 : 1;
      if (this.camMode === 'hood') {
        cam.position.set(c.pos.x + f.x * .6, c.pos.y + c.car.hgt * .9 + .2, c.pos.z + f.z * .6);
        cam.lookAt(c.pos.x + f.x * 30 * back, c.pos.y + .8, c.pos.z + f.z * 30 * back);
      } else {
        const d = this.camMode === 'far' ? 15 : 8.5, hgt = this.camMode === 'far' ? 5.5 : 2.9;
        const want = new THREE.Vector3(c.pos.x - f.x * d * back, c.pos.y + hgt, c.pos.z - f.z * d * back);
        if (!this.camSmooth) this.camSmooth = want.clone();
        this.camSmooth.lerp(want, 1 - Math.exp(-dt * 7));
        cam.position.copy(this.camSmooth); cam.lookAt(c.pos.x + f.x * 4 * back, c.pos.y + 1.1, c.pos.z + f.z * 4 * back);
      }
      const spd = Math.abs(c.vf || 0); cam.fov = 66 + Math.min(14, spd / 6) + (c.boosting ? 6 : 0); cam.updateProjectionMatrix();
      if (this.shake > .01) { cam.position.x += (Math.random() - .5) * this.shake * .5; cam.position.y += (Math.random() - .5) * this.shake * .3; this.shake *= .88; }
    }
    resize() { const w = this.root.clientWidth, h = this.root.clientHeight; this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }

    /* ---------- HUD ---------- */
    buildHud() {
      this.root.insertAdjacentHTML('beforeend', `
        <div class="rpanel" id="r-pos"></div><div class="rpanel" id="r-time"></div><div class="rpanel" id="r-speed"></div>
        <div class="rpanel" id="r-msg"></div><div class="rpanel" id="r-warn"></div>
        <canvas class="rmini" id="r-mini" width="400" height="400"></canvas>
        <div class="overlay" id="r-pause"><div class="card"><div class="eyebrow">Paused</div><h3>Race paused</h3><div class="btns"><button class="btn" type="button" data-r="resume">Resume</button><button class="btn sec" type="button" data-r="restart">Restart race</button><button class="btn ghost" type="button" data-r="exit">Quit to menu</button></div></div></div>
        <div class="overlay" id="r-end"><div class="card" style="width:min(640px,94vw)"><div class="eyebrow">${this.cfg.track.name} · ${this.cfg.laps} laps</div><h3 id="r-etitle"></h3><div id="r-ebody"></div><div class="btns"><button class="btn" type="button" data-r="restart">Race again</button><button class="btn ghost" type="button" data-r="exit">Back to menu</button></div></div></div>`);
      const keys = [
        { code: KEYS.gas, label: 'gas', row: 0, col: 1 },
        { code: KEYS.left, label: 'left', row: 1, col: 0 }, { code: KEYS.brake, label: 'brake', row: 1, col: 1 }, { code: KEYS.right, label: 'right', row: 1, col: 2 },
        { code: KEYS.boost, label: 'boost', row: 2, col: 0, w: 1.4 }, { code: KEYS.hand, label: 'drift', row: 2, col: 1.4, w: 1.6 },
        { code: KEYS.reset, label: 'reset', row: 0, col: 3.3 }, { code: KEYS.cam, label: 'camera', row: 1, col: 3.3 }, { code: 'Escape', label: 'pause', row: 2, col: 3.3 }
      ];
      this.keypad = window.CT_KEYPAD ? window.CT_KEYPAD(this.root, keys, { title: 'Driving keys', visible: RS.keypad !== false }) : null;
      this.mctx = this.root.querySelector('#r-mini').getContext('2d');
      let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9; this.P.forEach(p => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); });
      const s = 340 / Math.max(maxX - minX, maxZ - minZ); this.mm = { s, ox: (400 - (maxX - minX) * s) / 2 - minX * s, oz: (400 - (maxZ - minZ) * s) / 2 - minZ * s };
    }
    flash(t, sec, size) { const m = this.root.querySelector('#r-msg'); if (!m) return; m.textContent = t; m.style.fontSize = (size || 72) + 'px'; m.style.opacity = 1; this._msgT = sec; }
    suggest() {
      const c = this.me, out = [];
      if (this.phase === 'count') return [KEYS.gas];
      if (c.finished || this.paused) return out;
      if (c.wrongT > 1 || c.offT > 1.5) return [KEYS.reset];
      const v = Math.abs(c.vf || 0); if (v < 8) out.push(KEYS.gas);
      // corner warning
      let kmax = 0, dir = 0; for (let k = 3; k < Math.round((20 + v * 2.2) / 4); k++) { const i = (c.idx + k) % this.N; if (this.curv[i] > kmax) { kmax = this.curv[i]; const t0 = this.Tn[c.idx], t1 = this.Tn[i]; dir = t0.x * t1.z - t0.z * t1.x; } }
      const safe = kmax > 1e-4 ? Math.sqrt(c.car.grip / 8 * 1.35 * 9.81 / kmax) : 999;
      if (v > safe * 1.1) out.push(KEYS.brake);
      if (kmax > .006 && v > 10) out.push(dir > 0 ? KEYS.right : KEYS.left);
      if (this.boostMeter > .95 && !out.length && v > 20) out.push(KEYS.boost);
      return out;
    }
    updateHud(dt) {
      if (this.keypad) this.keypad.update(this.keys, this.suggest());
      const m = this.root.querySelector('#r-msg'); if (this._msgT !== undefined) { this._msgT -= dt; m.style.opacity = clamp(this._msgT * 2, 0, 1); }
      this._ht = (this._ht || 0) + dt; if (this._ht < .1) return; this._ht = 0;
      const c = this.me, N = this.N, n = this.cars.length;
      const order = this.cars.slice().sort((a, b) => (a.finished && b.finished) ? a.finishT - b.finishT : a.finished ? -1 : b.finished ? 1 : (b.lap * N + b.idx) - (a.lap * N + a.idx));
      const pos = order.indexOf(c) + 1;
      this.root.querySelector('#r-pos').innerHTML = `<div><span class="eyebrow">Pos</span><div class="big">${pos}<small>/${n}</small></div></div><div><span class="eyebrow">Lap</span><div class="big">${clamp(c.lap, 1, this.cfg.laps)}<small>/${this.cfg.laps}</small></div></div>`;
      const cur = this.phase === 'race' && c.lap >= 1 && !c.finished ? this.raceT - c.lapStart : 0;
      const rec = RS.best[this.cfg.track.id];
      this.root.querySelector('#r-time').innerHTML = `<span class="muted" style="font-size:11px;letter-spacing:.08em">${this.cfg.track.name.toUpperCase()}</span><span>Lap <b class="cyan">${fmt(cur)}</b></span><span>Best ${isFinite(c.best) ? fmt(c.best) : '—'}</span><span class="muted">Record ${rec ? fmt(rec.t) : '—'}</span><span class="muted">Total ${fmt(this.raceT)}</span>`;
      const v = Math.abs(c.vf || 0), u = RS.units === 'mph';
      this.root.querySelector('#r-speed').innerHTML = `<div class="stack" style="gap:6px"><span class="eyebrow">Gear ${c.vf < -.5 ? 'R' : c.gear}</span><span class="rpm"><i style="width:${(c.rpm || 0) * 100}%;${c.rpm > .92 ? 'background:var(--red)' : ''}"></i></span><span class="statbar">Boost <span class="meter" style="width:110px"><i style="width:${this.boostMeter * 100}%;background:var(--cyan)"></i></span></span></div><div class="v">${Math.round(v * (u ? MPH : KMH))}</div><span class="muted" style="padding-bottom:6px">${u ? 'MPH' : 'KM/H'}</span>`;
      const w = this.root.querySelector('#r-warn');
      const wt = c.wrongT > 1 ? 'WRONG WAY — press R' : c.offT > 1.5 ? 'STUCK? press R' : '';
      w.textContent = wt; w.style.display = wt ? 'block' : 'none';
      // minimap
      const x = this.mctx, mm = this.mm; x.clearRect(0, 0, 400, 400);
      x.strokeStyle = '#394655'; x.lineWidth = 14; x.lineJoin = 'round'; x.beginPath(); this.P.forEach((p, i) => i ? x.lineTo(p.x * mm.s + mm.ox, p.z * mm.s + mm.oz) : x.moveTo(p.x * mm.s + mm.ox, p.z * mm.s + mm.oz)); x.closePath(); x.stroke();
      x.strokeStyle = '#7B8999'; x.lineWidth = 3; x.stroke();
      const p0 = this.P[0]; x.fillStyle = '#fff'; x.fillRect(p0.x * mm.s + mm.ox - 4, p0.z * mm.s + mm.oz - 4, 8, 8);
      this.cars.forEach(o => { x.fillStyle = o === c ? '#F5B942' : o.color; x.beginPath(); x.arc(o.pos.x * mm.s + mm.ox, o.pos.z * mm.s + mm.oz, o === c ? 9 : 6, 0, 7); x.fill(); if (o === c) { x.strokeStyle = '#0A0D12'; x.lineWidth = 2; x.stroke(); } });
    }
    dispose() {
      this.alive = false; cancelAnimationFrame(this.raf);
      window.removeEventListener('keydown', this._kd); window.removeEventListener('keyup', this._ku); window.removeEventListener('blur', this._bl); window.removeEventListener('resize', this._rs);
      this.audio && this.audio.close(); this.keypad && this.keypad.dispose();
      if (this.renderer) { this.scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.map && m.map.dispose(); m.dispose(); }); }); this.renderer.dispose(); }
    }
  }
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function fmt(t) { if (!isFinite(t) || t <= 0) return '0:00.00'; const m = Math.floor(t / 60), s = t % 60; return `${m}:${s.toFixed(2).padStart(5, '0')}`; }
  const ord = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th');

  /* ---------------- menu pages ---------------- */
  function launchRace(over) {
    const car = carById(RS.car), cfg = Object.assign({ car, color: carColor(car), track: trackById(RS.track), laps: RS.laps, opp: RS.opp, diff: RS.diff, time: RS.time, weather: RS.weather }, over || {});
    document.activeElement && document.activeElement.blur();
    start(cfg, res => {
      if (res) {
        RS.races++; if (res.pos === 1) RS.wins++; if (res.pos <= 3) RS.podiums++;
        if (isFinite(res.best) && (!RS.best[res.track] || res.best < RS.best[res.track].t)) RS.best[res.track] = { t: res.best, car: res.car };
        RS.history.push({ date: Date.now(), track: res.track, car: res.car, pos: res.pos, of: res.of, time: res.time }); if (RS.history.length > 60) RS.history.shift();
        save();
      }
      window.CT_UI && window.CT_UI.route();
    });
  }
  function registerPages() {
    const H = window.CT_H, routes = window.CT_ROUTES; if (!H || !routes) return;
    const { $, $$, esc, head, foot, toast, go, I } = H;
    const statRow = (label, v) => `<div class="statbar"><span style="width:76px">${label}</span><span class="meter"><i style="width:${clamp(v, 0, 1) * 100}%;background:var(--amber)"></i></span></div>`;
    const carStats = c => statRow('Speed', (c.top - 150) / 210) + statRow('Accel', (c.acc - 4) / 8.5) + statRow('Grip', (c.grip - 5) / 7.5) + statRow('Off-road', (c.off - .3) / .65);
    const keyCap = (k, label) => `<div style="display:flex;flex-direction:column;align-items:center;gap:4px"><kbd style="min-width:52px;height:46px;font-size:15px">${esc(window.CT_KEYNAME(k))}</kbd><small class="muted" style="font-size:12px">${label}</small></div>`;

    routes.race = (page, args) => {
      const sub = args[0];
      if (sub === 'garage') return garage(page);
      if (sub === 'tracks') return tracks(page);
      if (sub === 'howto') return howto(page);
      if (sub === 'settings') return settingsPage(page);
      const car = carById(RS.car), tr = trackById(RS.track);
      page.innerHTML = `
        <section class="hero" style="background:linear-gradient(180deg,#1b1410 0%,#3b2a1c 52%,#5a3d26 66%,#1b1d21 66.2%,#0f1114 100%)">
          <div class="art" style="bottom:20px">${carSVG(car, carColor(car))}</div>
          <div class="content">
            <span class="eyebrow">Next race · ${esc(tr.name)} · ${RS.laps} laps · ${RS.opp} opponents</span>
            <h1 style="font-size:48px">${esc(car.name)}</h1>
            <div class="dim">${esc(car.cls)} · ${car.top} km/h top speed · ${esc(RS.diff)} AI · ${esc(RS.weather === 'rain' ? 'wet' : 'dry')} track</div>
            <div class="hstack" style="margin-top:8px">
              <button class="btn" type="button" id="r-go">${I('play', 18)}Race now</button>
              <a class="btn sec" href="#/race/garage">Garage</a>
              <a class="btn sec" href="#/race/tracks">Choose track</a>
              <button class="btn ghost" type="button" id="r-tt">Time trial</button>
              <a class="btn ghost" href="#/race/howto">How to drive</a>
            </div>
          </div>
        </section>
        <div class="grid g4">${[['Races', RS.races], ['Wins', RS.wins], ['Podiums', RS.podiums], ['Lap records', Object.keys(RS.best).length + '/' + TRACKS.length]].map(x => `<section class="card" style="gap:6px"><span class="eyebrow">${x[0]}</span><span class="stat"><b>${x[1]}</b></span></section>`).join('')}</div>
        <div class="split3">
          <section class="card"><div class="titlerow"><h2>Recent races</h2></div>
            ${RS.history.length ? RS.history.slice(-8).reverse().map(h => `<div class="row"><span class="lbl"><b style="font-weight:500">${esc(trackById(h.track).name)}</b><small>${esc(carById(h.car).name)} · ${new Date(h.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</small></span><span class="ctl"><span class="mono dim">${fmt(h.time)}</span><span class="badge ${h.pos === 1 ? 'green' : h.pos <= 3 ? 'amber' : ''}">${ord(h.pos)} / ${h.of}</span></span></div>`).join('') : '<div class="empty">No races yet. Press <b>Race now</b>.</div>'}
          </section>
          <section class="card"><div class="titlerow"><h2>Lap records</h2></div>
            ${TRACKS.map(t => `<div class="row" style="padding:6px 0"><span class="lbl"><b style="font-weight:500">${esc(t.name)}</b><small>${RS.best[t.id] ? esc(carById(RS.best[t.id].car).name) : 'No record yet'}</small></span><span class="ctl mono cyan">${RS.best[t.id] ? fmt(RS.best[t.id].t) : '—'}</span></div>`).join('')}
          </section>
        </div>`;
      $('#r-go').onclick = () => launchRace();
      $('#r-tt').onclick = () => launchRace({ opp: 0 });
      foot([['W', 'Gas'], ['A D', 'Steer']], `<button class="btn" type="button" id="f-go">${I('play', 18)}Race now</button>`);
      $('#f-go').onclick = () => launchRace();
    };
    function garage(page) {
      const sel = carById(RS.car);
      page.innerHTML = `${head('Racing · Garage', 'Choose your car', `<span class="muted">${CARS.length} cars</span>`)}
        <div class="split3">
          <div class="acgrid" id="cgrid">${CARS.map(c => `<div class="ac ${c.id === sel.id ? 'sel' : ''}" data-car="${c.id}" role="button" tabindex="0"><div class="hstack" style="justify-content:space-between"><span class="badge">${esc(c.cls)}</span><span class="mono muted" style="font-size:12px">${c.top} km/h</span></div><div class="pic" style="height:90px;display:flex;align-items:center">${carSVG(c, c.id === sel.id ? carColor(c) : c.color)}</div><div class="nm">${esc(c.name)}</div>${carStats(c)}</div>`).join('')}</div>
          <section class="card" style="align-self:start"><span class="eyebrow">${esc(sel.cls)}</span><h3>${esc(sel.name)}</h3>
            <div class="profile" style="height:150px" id="gprev">${carSVG(sel, carColor(sel))}</div>
            <p style="margin:0">${esc(sel.desc)}</p>
            ${carStats(sel)}
            <span class="eyebrow">Paint</span>
            <div class="hstack" id="gcol">${COLORS.map(c => `<button class="swatch" type="button" data-col="${c}" aria-label="Colour ${c}" aria-pressed="${carColor(sel).toLowerCase() === c.toLowerCase()}" style="background:${c}"></button>`).join('')}<input type="color" id="gcust" value="${carColor(sel)}" aria-label="Custom colour"></div>
            <button class="btn" type="button" id="g-go">${I('play', 18)}Race with this car</button>
          </section>
        </div>`;
      $$('[data-car]').forEach(el => { const f = () => { RS.car = el.dataset.car; RS.color = ''; save(); garage(page); }; el.onclick = f; el.onkeydown = e => { if (e.key === 'Enter') f(); }; });
      const setCol = c => { RS.color = c; save(); $('#gprev').innerHTML = carSVG(sel, c); $$('#gcol .swatch').forEach(b => b.setAttribute('aria-pressed', b.dataset.col.toLowerCase() === c.toLowerCase())); const card = $(`[data-car="${sel.id}"] .pic`); if (card) card.innerHTML = carSVG(sel, c); };
      $$('#gcol .swatch').forEach(b => b.onclick = () => setCol(b.dataset.col));
      $('#gcust').oninput = e => setCol(e.target.value);
      $('#g-go').onclick = () => launchRace();
      foot([], `<button class="btn" type="button" id="f-go">${I('play', 18)}Race now</button>`); $('#f-go').onclick = () => launchRace();
    }
    function tracks(page) {
      const sel = trackById(RS.track);
      const seg = (id, opts, val) => `<div class="seg" data-rs="${id}">${opts.map(([k, l]) => `<button type="button" data-v="${k}" aria-pressed="${String(val) === String(k)}">${l}</button>`).join('')}</div>`;
      page.innerHTML = `${head('Racing · Tracks', 'Choose a track', '')}
        <div class="split3">
          <div class="acgrid" id="tgrid">${TRACKS.map(t => `<div class="ac ${t.id === sel.id ? 'sel' : ''}" data-tr="${t.id}" role="button" tabindex="0"><div class="hstack" style="justify-content:space-between"><span class="badge">${{ day: 'Day', sunset: 'Sunset', night: 'Night' }[t.time]}</span>${RS.best[t.id] ? `<span class="badge green">${fmt(RS.best[t.id].t)}</span>` : ''}</div><div class="pic" style="height:130px">${trackSVG(t, 200)}</div><div class="nm">${esc(t.name)}</div><div class="muted" style="font-size:13px">${esc(t.desc)}</div></div>`).join('')}</div>
          <section class="card" style="align-self:start"><span class="eyebrow">Race settings</span><h3>${esc(sel.name)}</h3>
            <div class="row" style="padding:6px 0"><label class="lbl" for="rl">Laps</label><span class="ctl"><input type="range" id="rl" min="1" max="10" value="${RS.laps}" style="width:150px"><span class="val" id="rl-v">${RS.laps}</span></span></div>
            <div class="row" style="padding:6px 0"><label class="lbl" for="ro">Opponents</label><span class="ctl"><input type="range" id="ro" min="0" max="11" value="${RS.opp}" style="width:150px"><span class="val" id="ro-v">${RS.opp}</span></span></div>
            <div class="stack" style="gap:6px"><span class="eyebrow">AI difficulty</span>${seg('diff', [['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard'], ['pro', 'Pro']], RS.diff)}</div>
            <div class="stack" style="gap:6px"><span class="eyebrow">Time of day</span>${seg('time', [['auto', 'Track default'], ['day', 'Day'], ['sunset', 'Sunset'], ['night', 'Night']], RS.time)}</div>
            <div class="stack" style="gap:6px"><span class="eyebrow">Weather</span>${seg('weather', [['dry', 'Dry'], ['rain', 'Rain']], RS.weather)}</div>
            <button class="btn" type="button" id="t-go">${I('play', 18)}Race here</button>
          </section>
        </div>`;
      $$('[data-tr]').forEach(el => { const f = () => { RS.track = el.dataset.tr; save(); tracks(page); }; el.onclick = f; el.onkeydown = e => { if (e.key === 'Enter') f(); }; });
      [['rl', 'laps'], ['ro', 'opp']].forEach(([id, k]) => { const i = $('#' + id); i.oninput = () => { RS[k] = +i.value; $('#' + id + '-v').textContent = i.value; save(); }; });
      $$('[data-rs]').forEach(g => $$('button', g).forEach(b => b.onclick = () => { RS[g.dataset.rs] = b.dataset.v; save(); $$('button', g).forEach(x => x.setAttribute('aria-pressed', x === b)); }));
      $('#t-go').onclick = () => launchRace();
      foot([], `<button class="btn" type="button" id="f-go">${I('play', 18)}Race now</button>`); $('#f-go').onclick = () => launchRace();
    }
    function howto(page) {
      page.innerHTML = `${head('Racing · Tutorial', 'How to drive', `<button class="btn" type="button" id="h-go">${I('play', 18)}Practice lap</button>`)}
        <div class="grid g3">
          <section class="card"><span class="eyebrow">Step 1</span><h3>Drive with WASD</h3>
            <div style="display:grid;grid-template-columns:repeat(3,auto);gap:8px;justify-content:center"><span></span>${keyCap(KEYS.gas, 'gas')}<span></span>${keyCap(KEYS.left, 'left')}${keyCap(KEYS.brake, 'brake')}${keyCap(KEYS.right, 'right')}</div>
            <p class="muted" style="margin:0">Hold <kbd>W</kbd> to go, <kbd>S</kbd> to brake (keep holding to reverse), <kbd>A</kbd> / <kbd>D</kbd> to steer. Arrow keys work too.</p></section>
          <section class="card"><span class="eyebrow">Step 2</span><h3>Corners</h3>
            <p style="margin:0">Brake <b>before</b> the corner, steer through it, then press <kbd>W</kbd> again as the road straightens. The keyboard in the corner lights up <b class="cyan">blue</b> to tell you when to brake and which way to turn.</p></section>
          <section class="card"><span class="eyebrow">Step 3</span><h3>Tricks</h3>
            <div class="hstack" style="gap:18px;justify-content:center">${keyCap(KEYS.boost, 'boost')}${keyCap(KEYS.hand, 'drift')}${keyCap(KEYS.reset, 'reset')}</div>
            <p class="muted" style="margin:0"><kbd>Shift</kbd> uses boost (blue bar refills over time). <kbd>Space</kbd> pulls the handbrake to slide round hairpins. <kbd>R</kbd> puts you back on the road if you get stuck or turned around.</p></section>
        </div>
        <section class="card" style="padding:4px 20px">
          ${[[KEYS.gas, 'Accelerate'], [KEYS.brake, 'Brake / reverse'], [KEYS.left + ' ' + KEYS.right, 'Steer left / right'], [KEYS.hand, 'Handbrake drift'], [KEYS.boost, 'Boost'], [KEYS.reset, 'Reset car onto the track'], [KEYS.cam, 'Change camera (chase / far / bonnet)'], [KEYS.back, 'Look back (hold)'], ['KeyK', 'Show / hide the on-screen keyboard'], ['Escape', 'Pause']].map(([k, l]) => `<div class="row"><span class="ctl" style="margin:0;min-width:120px;gap:6px">${k.split(' ').map(x => `<kbd>${esc(window.CT_KEYNAME(x))}</kbd>`).join('')}</span><span class="lbl">${l}</span></div>`).join('')}
        </section>`;
      $('#h-go').onclick = () => launchRace({ opp: 0, laps: 1, track: trackById('coast'), diff: 'easy' });
      foot([], `<button class="btn" type="button" id="f-go">${I('play', 18)}Practice lap</button>`); $('#f-go').onclick = () => launchRace({ opp: 0, laps: 1, track: trackById('coast') });
    }
    function settingsPage(page) {
      const sw = (k, label, hint) => `<div class="row"><span class="lbl">${label}${hint ? `<small>${hint}</small>` : ''}</span><span class="ctl"><button class="switch" type="button" role="switch" aria-checked="${RS[k] !== false}" data-sw="${k}" aria-label="${label}"></button></span></div>`;
      page.innerHTML = `${head('Racing · Settings', 'Settings', '')}
        <section class="card" style="padding:4px">
          ${sw('keypad', 'On-screen keyboard', 'Shows which key does what and lights up the keys you press')}
          ${sw('assist', 'Steering assist', 'Gentler steering at high speed')}
          ${sw('sound', 'Sound')}
          <div class="row"><span class="lbl">Speed units</span><span class="ctl"><div class="seg" id="su">${[['kmh', 'km/h'], ['mph', 'mph']].map(([k, l]) => `<button type="button" data-v="${k}" aria-pressed="${RS.units === k}">${l}</button>`).join('')}</div></span></div>
          <div class="row"><span class="lbl">Reset racing progress<small>Races, wins and lap records</small></span><span class="ctl"><button class="btn danger sm" type="button" id="rreset">Reset</button></span></div>
        </section>`;
      $$('[data-sw]').forEach(b => b.onclick = () => { const on = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', on); RS[b.dataset.sw] = on; save(); });
      $$('#su button').forEach(b => b.onclick = () => { RS.units = b.dataset.v; save(); $$('#su button').forEach(x => x.setAttribute('aria-pressed', x === b)); });
      $('#rreset').onclick = () => { const keep = { car: RS.car, color: RS.color }; RS = Object.assign(defaults(), keep); save(); toast('Racing progress reset'); settingsPage(page); };
      foot([], `<button class="btn" type="button" id="f-go">${I('play', 18)}Race now</button>`); $('#f-go').onclick = () => launchRace();
    }
  }

  window.CT_RACE = { start, stop, launch: launchRace, get session() { return R; }, CARS, TRACKS, carSVG, trackSVG, registerPages, state: () => RS };
})();
