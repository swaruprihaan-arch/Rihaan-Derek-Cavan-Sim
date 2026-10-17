/* Simulator selection stays independent of flight simulation and saved progress. */
(() => {
  const arrow = '<span aria-hidden="true">↗</span>';
  const plane = `<svg viewBox="0 0 500 300" fill="none" aria-hidden="true"><path d="M36 228 205 170 261 54Q270 38 278 55L273 151 438 201 442 215 269 192 264 248 303 269 301 278 250 266 201 279 198 270 237 246 234 190 39 243Z" fill="currentColor"/><path d="m251 166 17-100m-35 115-155 46" stroke="#def6ff" stroke-width="2" opacity=".5"/></svg>`;
  const car = `<svg viewBox="0 0 500 300" fill="none" aria-hidden="true"><ellipse cx="255" cy="241" rx="181" ry="16" fill="#000" opacity=".4"/><path d="m78 205 17-42 66-14 48-47h111l57 50 38 14 14 45-18 24H93Z" fill="currentColor"/><path d="m179 149 37-36h94l40 36Z" fill="#162333"/><path d="m265 113 5 36M106 178l69 6m169 0 54-6" stroke="#ffe3c8" stroke-width="5"/><path d="m190 190 19 30h103l18-30Z" fill="#111821"/><rect x="102" y="221" width="39" height="29" rx="11" fill="#10151c"/><rect x="367" y="221" width="39" height="29" rx="11" fill="#10151c"/><path d="M162 96h179" stroke="currentColor" stroke-width="9" stroke-linecap="round"/></svg>`;
  function render(page, route) {
    page.scrollTop = 0;
    page.innerHTML = `<div class="portal-shell">
      <header class="portal-header"><a href="#/choose" class="portal-brand" aria-label="Simulator selection"><span aria-hidden="true">S</span>SIM<span class="portal-brand-detail">SIMULATION COLLECTION</span></a><span class="portal-note">A new perspective. Every time.</span></header>
      ${route === 'racing' ? `<section class="racing-preview"><a class="portal-back" href="#/choose">← All simulators</a><span class="portal-kicker">NEXT ON THE GRID</span><h1>Racing Simulator</h1><div class="preview-art">${car}</div><span class="portal-pill">Coming soon</span><p>The racing simulator is not available yet.<br>Take to the skies in Flight Simulator while the garage is being built.</p><a class="portal-action" href="#/home">Open Flight Simulator ${arrow}</a></section>` : `
      <section class="portal-intro"><span class="portal-kicker">CHOOSE YOUR WORLD</span><h1>Where will you go?</h1><p>Above the clouds or beyond the apex. Your next session starts here.</p></section>
      <div class="sim-choices">
        <a class="sim-choice flight-choice" href="#/home" aria-label="Open Flight Simulator">
          <div class="choice-top"><span class="choice-index">01 / AIR</span><span class="portal-pill available">Ready to fly</span></div>
          <div class="choice-art">${plane}</div>
          <div class="choice-copy"><span class="portal-kicker">THE SKY IS YOURS</span><h2>Flight<br>Simulator</h2><p>Find your aircraft. Plan your route.<br>Make every landing count.</p><span class="choice-action">Enter flight deck ${arrow}</span></div>
        </a>
        <a class="sim-choice racing-choice" href="#/race" aria-label="Open Racing Simulator">
          <div class="choice-top"><span class="choice-index">02 / TRACK</span><span class="portal-pill available">Ready to race</span></div>
          <div class="choice-art">${car}</div>
          <div class="choice-copy"><span class="portal-kicker">CHASE THE PERFECT LAP</span><h2>Racing<br>Simulator</h2><p>8 cars. 5 circuits. AI rivals.<br>Brake late, chase the perfect lap.</p><span class="choice-action">Enter the garage ${arrow}</span></div>
        </a>
      </div><footer class="portal-footer"><span>TWO WORLDS. ONE PLACE TO START.</span><span>Built for the joy of simulation.</span></footer>`}
    </div>`;
  }
  window.CT_PORTAL = { render };
})();
