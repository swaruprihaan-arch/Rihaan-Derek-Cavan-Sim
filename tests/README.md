# CONTRAIL audit

Run `npm ci` once, then `npm test` from the project root. Dependencies are development-only; the website remains a static HTML/JavaScript application.

## Coverage

- Actual HTML script order, referenced local assets, JavaScript syntax, and CSS parsing.
- Simulator chooser, racing preview, all main flight pages, and all settings sections.
- All 43 aircraft detail/paint-shop pages and all 12 mission briefings.
- Hangar search, sorting, filters and favourites; flight plan changes; settings persistence; weather/time/fuel controls.
- Custom livery creation, blank names, safe SVG registration text, keyboard selection and storage failure.
- Key-binding swaps, cancellation, multiple capture requests and navigation away from capture.
- Confirmation dialog labelling, focus trap/cancel, reset and resume-data removal.
- Automated axe semantic accessibility checks across 21 pages, plus tab keyboard behavior. Color contrast is disabled because JSDOM cannot render layout.
- All aircraft mesh positions and dimensions; all airport terrain/runway samples.
- All aircraft in runway, approach and airborne physics starts (129 scenarios), checking finite state. This does not certify aerodynamic realism.
- Full scene initialization and camera math for six representative flight models using real Three.js geometry and a mocked WebGL renderer/2D canvas.
- Failed startup, overlapping starts, cancellation during loading, cleanup, restart results and late completion callbacks.
- In-flight extension initialization; replay/live-state restoration; saved-flight validation; helicopter collective, payload, trim and weather on resume.
- On-screen keypad pointer press/release/cancel, state display, visibility and disposal.
- Pause menu native keyboard behavior and return of focus to flight.

## Fixes made during the audit

Invalid nested routes and damaged saves now recover. Normal Tab navigation is restored, tab arrow keys work, selectable cards support keyboards, and aircraft favourites are no longer nested inside another interactive control. Destructive dialogs keep and restore focus. Abandoned key-binding capture no longer changes controls on another screen.

Livery names have a fallback and unique IDs; registration text is escaped before insertion into SVG. Reset clears the flight-resume snapshot. Invalid snapshots are ignored. Replay restores throttle and gear. Resume preserves helicopter collective, payload, trim, spoiler state, and adjusted wind/turbulence.

Flight startup errors now provide an exit. Cancelled or superseded startup does not create a hidden session. Restart clears stale results and completion timers; disposed sessions ignore late completion callbacks. Pause controls keep native keyboard behavior.

## Checks that still require a real browser/device

The available Chrome profile's managed web filter blocked the local preview. No filter settings were changed. Safari observation also failed with a screen-capture error. Therefore, this audit does **not** claim verified screenshots, actual responsive geometry, WebGL shader rendering/performance, audio, physical gamepad behavior, or touch behavior on a real phone. The automated renderer mocks cannot substitute for those checks.

The racing engine is now included in this audit. Added checks cover all eight cars on all five tracks in dry and wet conditions (80 combinations), all camera modes, a 12-car wet-night field, countdown behavior, lap completion, time formatting, results persistence, garage/paint/track controls, confirmed progress reset, and startup/restart/disposal failures.

The second pass fixed racing startup cancellation/error handling, stale results on restart, late result callbacks, malformed saved state, minute-boundary timing, native keyboard access, missing Space activation on car/track cards, paint-control synchronization, racing-home navigation, and backward motion during the countdown. Racing progress reset now asks for confirmation and preserves configuration. Flight cloud-base persistence and bounded performance settings were also checked and corrected. Other contributors are editing the shared project, so rerun this suite after their changes arrive.
