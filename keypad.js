/* CONTRAIL — on-screen mini keyboard. Shows what each key does, lights up keys you are pressing,
   pulses the key you should press next, and doubles as touch buttons. Used by flight (ext.js) and racing (race.js). */
(function () {
  const NAMES = { Space: 'Space', ShiftLeft: 'Shift', ShiftRight: 'Shift', ControlLeft: 'Ctrl', Escape: 'Esc', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Enter: 'Enter', Tab: 'Tab', Slash: '/' };
  const keyName = c => !c ? '—' : NAMES[c] || c.replace(/^Key/, '').replace(/^Digit/, '');
  window.CT_KEYNAME = keyName;

  /* keys: [{ code, label, row, col, w }] — row/col in key units. opts: { title, corner, visible } */
  window.CT_KEYPAD = function (root, keys, opts) {
    opts = opts || {};
    const U = 46, G = 4;
    const cols = Math.max(...keys.map(k => k.col + (k.w || 1))), rows = Math.max(...keys.map(k => k.row + 1));
    const el = document.createElement('div');
    el.className = 'keypad'; el.setAttribute('aria-label', 'Keyboard controls');
    el.innerHTML = `<div class="kp-head"><span>${opts.title || 'Controls'}</span><span class="kp-hide">K hide</span></div>
      <div class="kp-grid" style="width:${cols * U - G}px;height:${rows * U - G}px"></div>
      <div class="kp-now"><span class="muted">Pressing:</span> <b id="kp-now">nothing</b></div>`;
    const grid = el.querySelector('.kp-grid'), now = el.querySelector('#kp-now');
    const nodes = {};
    keys.forEach(k => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'kp-key'; b.dataset.code = k.code; b.tabIndex = -1;
      b.style.cssText = `left:${k.col * U}px;top:${k.row * U}px;width:${(k.w || 1) * U - G}px;height:${U - G}px`;
      b.innerHTML = `<b>${keyName(k.code)}</b><small>${k.label}</small>`;
      b.setAttribute('aria-label', `${keyName(k.code)}: ${k.label}`);
      const fire = type => window.dispatchEvent(new KeyboardEvent(type, { code: k.code, key: k.code, bubbles: true }));
      let held = false;
      b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); held = true; b.setPointerCapture && b.setPointerCapture(e.pointerId); fire('keydown'); });
      const up = e => { if (!held) return; held = false; fire('keyup'); };
      b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
      grid.appendChild(b); nodes[k.code] = { b, k };
    });
    el.addEventListener('mousedown', e => e.stopPropagation());
    root.appendChild(el);
    let visible = opts.visible !== false; el.style.display = visible ? '' : 'none';
    let lastSig = '';
    return {
      el,
      update(pressed, suggest) {
        if (!visible) return;
        const sug = new Set(suggest || []); const on = [];
        let sig = '';
        for (const code in nodes) {
          const d = !!pressed[code], h = sug.has(code) && !d;
          sig += (d ? 1 : 0) + '' + (h ? 1 : 0);
          if (d) on.push(nodes[code].k.label);
        }
        if (sig === lastSig) return; lastSig = sig;
        for (const code in nodes) { const n = nodes[code]; n.b.classList.toggle('down', !!pressed[code]); n.b.classList.toggle('hint', sug.has(code) && !pressed[code]); }
        now.textContent = on.length ? on.join(' + ') : 'nothing';
      },
      toggle(v) { visible = v === undefined ? !visible : v; el.style.display = visible ? '' : 'none'; lastSig = ''; return visible; },
      get visible() { return visible; },
      dispose() { el.remove(); }
    };
  };
})();
