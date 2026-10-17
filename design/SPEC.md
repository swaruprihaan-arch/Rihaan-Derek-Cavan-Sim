# CONTRAIL Flight Simulator — UI design spec (shared by every artboard)

This file is the single source of truth. Every artboard must follow it exactly so that
fourteen screens authored in parallel look like one product.

## 0. What we are making

A static, NON-interactive, hi-fi UI design for a desktop flight simulator called **CONTRAIL**.
Fourteen screens, each a fixed **1600 × 900** artboard (16:9, a 1080p-class game UI).

**Look (nameable): "cockpit at night".** Near-black blue-grey ground, flat panels separated by
hairlines, instrument-placard typography (condensed caps for headings and labels), **amber** as
the single primary accent (the colour of backlit switch legends) and **EFIS cyan** for values the
pilot has set. Industrial, utilitarian, precise. No gradient washes (gradients only inside an
illustration such as a horizon or a sky), no glows, no glassmorphism, no emoji, no rounded
"cards with a coloured left border". Density is high but orderly; everything sits on an 8-px rhythm.

## 1. Tokens — use these exact values and nothing else

### Colour
| token | hex | use |
|---|---|---|
| bg0 | `#0A0D12` | page ground, top/bottom bars |
| bg1 | `#10151C` | panels, cards, sidebars |
| bg2 | `#161D26` | inputs, raised controls, table header rows |
| bg3 | `#1E2733` | hover/selected rows, active segmented option |
| line | `#27313D` | hairline borders (1 px) |
| line2 | `#394655` | stronger borders, slider/track rails, dividers inside controls |
| text | `#E6EBF0` | primary text |
| text2 | `#A3AFBC` | secondary text, inactive nav |
| text3 | `#7B8999` | muted labels/eyebrows (never on bg3 — use text2 there) |
| amber | `#F5B942` | primary accent: CTAs, active tab underline, toggles ON, slider fill, selected border |
| amber-ink | `#1A1200` | text/icons on an amber fill |
| amber-dim | `rgba(245,185,66,0.14)` | tinted background behind amber text (badges, selected list rows) |
| cyan | `#57C7DB` | set values / data readouts / silhouette line art |
| cyan-dim | `rgba(87,199,219,0.14)` | tinted background behind cyan text |
| green | `#5BD68A` | OK / online / armed-and-normal |
| red | `#FF6B6B` | warnings, failures, destructive |

Contrast is already verified: text3 on bg1 ≈ 5:1; amber, cyan, green ≥ 9:1 on bg0/bg1; amber-ink on amber ≈ 10:1.
White text on a coloured fill is NOT used anywhere except green/red status dots (no text on them).

### Type (Google Fonts, loaded by the helmet `<link>` below)
| role | css | sizes |
|---|---|---|
| display | `font-family:'Barlow Condensed','Arial Narrow',sans-serif` weight 600 (700 for the wordmark) | page title 36 px (uppercase, letter-spacing 0.04em); section title 22 px (uppercase, 0.04em); panel title 18 px (uppercase, 0.06em); nav tabs 18 px (uppercase, 0.1em); button labels 16 px (uppercase, 0.08em); eyebrow 12 px (uppercase, 0.14em, text3); badge 11 px (uppercase, 0.1em) |
| body | `font-family:Barlow,'Helvetica Neue',Arial,sans-serif` weight 400 / 500 / 600 | body 15 px; small 13 px; large 17 px; line-height 1.4 |
| mono | `font-family:'IBM Plex Mono',Menlo,Consolas,monospace` weight 400 / 500 | readouts 14–16 px; big readouts 24–28 px; key caps 12 px; tiny tags 11 px |

Numbers that are measurements or settings (altitudes, frequencies, knots, percentages, times,
coordinates, ICAO codes) are set in **mono**; set-by-the-pilot values are **cyan**, measured/static
values are **text**. Headings are condensed caps. Never use Inter, Roboto, Arial, system-ui as a first choice.

### Geometry
- Base unit 8 px. Page padding **40 px** left/right. Content column gap **24 px**. Card padding **20 px**.
- Radii: controls/buttons **4 px**, cards/panels **6 px**, chips/toggles **999 px**. Nothing larger.
- Borders: 1 px `line`; selected card: 2 px `amber` (use `outline:2px solid #F5B942;outline-offset:-2px` so the size does not change).
- No drop shadows. Depth comes from bg0 → bg1 → bg2 → bg3 steps only.
- Hit targets ≥ 44 × 44 px for buttons; list rows ≥ 44 px tall; icon buttons 40 × 40 minimum (44 preferred).
- Icons: inline stroke SVG on a 24 grid, rendered at 18 / 20 / 24 px, `stroke-width="1.75"`, round caps/joins, `currentColor`.

## 2. File format — `.dc.html` hard rules (each failure is silent in the canvas, so obey all)

- Exact skeleton (copy):

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>CONTRAIL — Hangar</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
…helmet block from §3, verbatim…
</helmet>
<div style="width:1600px;height:900px;…root style from §4…">
  …the screen…
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1600,"height":900}}'>
class Component extends DCLogic {
  renderVals() { return {}; }
}
</script>
</body>
</html>
```

- **All styling is inline `style="…"`** on each element (that is what the canvas's properties panel edits).
  The only stylesheet is the helmet block in §3 — copy it verbatim, never add rules to it.
- **Close every element explicitly, including every SVG child**: `<path d="…"></path>`, `<circle …></circle>`,
  `<rect …></rect>`, `<line …></line>`, `<polygon …></polygon>`, `<ellipse …></ellipse>`, `<g>…</g>`. **Never write `/>`.**
  Void elements (`<img>`, `<input>`, `<br>`, `<link>`, `<meta>`) are written without a slash and without a closing tag.
- Quote every attribute. Single-quote the `data-props` attribute; it is exactly `{"$preview":{"width":1600,"height":900}}` — no other props.
- **No template holes** (`{{…}}`), no `<sc-for>`, `<sc-if>`, `<dc-import>`, no `onClick`/`on*` attributes, no links between
  artboards. `renderVals()` returns `{}`. The design is static.
- No `<iframe>`, `<object>`, `<embed>`, no network except the Google Fonts link, no `data:` URIs, no external images.
  Everything visual is HTML + inline SVG.
- **Accessible as drawn**: clickable things are `<button type="button">` or `<a href="#">`; toggles are
  `<button type="button" role="switch" aria-checked="true|false" aria-label="…">`; sliders are `<input type="range" aria-label="…">`;
  text fields `<input type="text" value="…" aria-label="…">` (or paired with a visible `<label for>`); checkboxes
  `<input type="checkbox" checked aria-label="…">`. **Never** `role`, `tabindex` or handlers on a `<div>`/`<span>`.
  Icon-only buttons carry `aria-label`. Decorative SVG gets `aria-hidden="true"`; meaningful SVG gets `role="img" aria-label="…"`.
- Layout: flex/grid with `gap` for every sibling group (never margins between siblings, never whitespace-spaced inline items).
  Grids use `grid-template-columns:repeat(N,minmax(0,1fr))`. Avoid `position:fixed`, `vh`, `vw`.
- The root is `overflow:hidden`; scrollable regions are drawn cut off cleanly at their bottom edge with a **scrollbar indicator**
  (a 4-px-wide track in `line` with a `text3` thumb, see §5) — never actually scrolling.
- Only `#`-anchored `href`s. No `target`, no `onclick`.
- Text must never overflow its box: give flexible text `min-width:0`, use `white-space:nowrap;overflow:hidden;text-overflow:ellipsis` for one-liners in tight cells.

## 3. Helmet block — copy verbatim (do not add rules)

```html
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
body{margin:0;background:#0A0D12}
x-dc *{box-sizing:border-box}
a{color:#E6EBF0;text-decoration:none}a:hover{color:#F5B942}
button{font:inherit;color:inherit;cursor:pointer}
input{font:inherit;color:inherit}
input[type=range]{-webkit-appearance:none;appearance:none;height:4px;border-radius:2px;margin:0;padding:0;border:0;outline:none;background:#394655;flex:none}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;border-radius:50%;background:#E6EBF0;border:2px solid #0A0D12;box-shadow:0 0 0 1px #394655}
input[type=checkbox],input[type=radio]{-webkit-appearance:none;appearance:none;width:18px;height:18px;margin:0;border:1px solid #394655;background:#161D26;position:relative;flex:none}
input[type=checkbox]{border-radius:3px}
input[type=radio]{border-radius:50%}
input[type=checkbox]:checked,input[type=radio]:checked{background:#F5B942;border-color:#F5B942}
input[type=checkbox]:checked::after{content:"";position:absolute;left:5px;top:1px;width:5px;height:10px;border:solid #1A1200;border-width:0 2px 2px 0;transform:rotate(45deg)}
input[type=radio]:checked::after{content:"";position:absolute;left:4px;top:4px;width:8px;height:8px;border-radius:50%;background:#1A1200}
:focus-visible{outline:2px solid #F5B942;outline-offset:2px}
</style>
</helmet>
```

## 4. Shared chrome — copy verbatim, change only what is marked

**A complete, lint-clean template of this chrome is `assets/skeleton.dc.html`: start every artboard by copying it** (its sample `<section>` shows the component recipes rendered; replace the main's content). A render of it is at `render/skeleton_ref.png` for reference.

### 4.1 Root
```html
<div style="width:1600px;height:900px;background:#0A0D12;color:#E6EBF0;font-family:Barlow,'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.4;display:flex;flex-direction:column;overflow:hidden;position:relative">
```

### 4.2 Top bar (64 px). Exactly one tab carries `aria-current="page"` + the amber style; the others use the grey style.
The `@@MARK@@` token inside the wordmark link becomes the CONTRAIL mark when you run `tools/inject.py` (see §6).

```html
<header style="height:64px;flex:none;display:flex;align-items:center;gap:48px;padding:0 40px;border-bottom:1px solid #27313D;background:#0A0D12">
  <a href="#" aria-label="CONTRAIL home" style="display:flex;align-items:center;gap:12px;color:#E6EBF0">
    @@MARK@@
    <span style="font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:700;font-size:26px;letter-spacing:0.2em;line-height:1">CONTRAIL</span>
    <span style="font-family:'IBM Plex Mono',Menlo,Consolas,monospace;font-size:11px;color:#7B8999;letter-spacing:0.04em;margin-top:3px">v1.4.2</span>
  </a>
  <nav aria-label="Primary" style="display:flex;align-items:stretch;gap:36px;height:64px">
    <a href="#" style="display:flex;align-items:center;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:600;font-size:18px;letter-spacing:0.1em;text-transform:uppercase;color:#A3AFBC;border-top:2px solid transparent;border-bottom:2px solid transparent">Home</a>
    <a href="#" aria-current="page" style="display:flex;align-items:center;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:600;font-size:18px;letter-spacing:0.1em;text-transform:uppercase;color:#F5B942;border-top:2px solid transparent;border-bottom:2px solid #F5B942">Hangar</a>
    <a href="#" style="…grey style…">Fly</a>
    <a href="#" style="…grey style…">Missions</a>
    <a href="#" style="…grey style…">Settings</a>
  </nav>
  <div style="margin-left:auto;display:flex;align-items:center;gap:28px">
    <div style="display:flex;align-items:center;gap:8px;font-family:'IBM Plex Mono',Menlo,Consolas,monospace;font-size:12px;letter-spacing:0.08em;color:#5BD68A"><span style="width:8px;height:8px;border-radius:50%;background:#5BD68A;display:block"></span>ONLINE</div>
    <div style="font-family:'IBM Plex Mono',Menlo,Consolas,monospace;font-size:14px;color:#A3AFBC">14:32Z</div>
    <a href="#" style="display:flex;align-items:center;gap:12px;color:#E6EBF0">
      <span style="width:34px;height:34px;border-radius:50%;background:#1E2733;border:1px solid #394655;display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:600;font-size:14px;letter-spacing:0.06em">ML</span>
      <span style="display:flex;flex-direction:column;line-height:1.2"><span style="font-size:14px;font-weight:500">Capt. Mara Lindqvist</span><span style="font-size:12px;color:#7B8999">1,284 h logged</span></span>
    </a>
  </div>
</header>
```
Which tab is active per screen: Main → Home; Hangar, AircraftAirliner, AircraftFighter, Liveries, LiveryEditor → Hangar;
FlightPlanner, FlightSetup, Weather → Fly; Missions → Missions; SettingsGraphics, SettingsControls, SettingsRealism → Settings.
The InFlight screen has no top bar or bottom bar (see its brief).

### 4.3 Content area
```html
<main style="flex:1;min-height:0;display:flex;flex-direction:column;padding:24px 40px 24px;gap:20px;overflow:hidden">
```
First row inside `<main>` is the **page header** (unless the brief says otherwise):
```html
<div style="display:flex;align-items:flex-end;gap:24px;flex:none">
  <div style="display:flex;flex-direction:column;gap:4px">
    <span style="font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:600;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#7B8999">Hangar</span>
    <h1 style="margin:0;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:600;font-size:36px;letter-spacing:0.04em;text-transform:uppercase;line-height:1">Aircraft</h1>
  </div>
  <div style="margin-left:auto;display:flex;align-items:center;gap:12px">…page-level controls (search, filters, tabs)…</div>
</div>
```

### 4.4 Bottom bar (56 px). Left: key hints. Right: page-specific key hints + the page's primary action button.
```html
<footer style="height:56px;flex:none;display:flex;align-items:center;gap:28px;padding:0 40px;border-top:1px solid #27313D;background:#0A0D12">
  <div style="display:flex;align-items:center;gap:10px;font-size:13px;color:#A3AFBC"><kbd style="font-family:'IBM Plex Mono',Menlo,Consolas,monospace;font-size:12px;min-width:26px;height:24px;padding:0 7px;display:inline-flex;align-items:center;justify-content:center;background:#161D26;border:1px solid #394655;border-bottom-width:2px;border-radius:3px;color:#E6EBF0">Esc</kbd>Back</div>
  <div style="display:flex;align-items:center;gap:10px;font-size:13px;color:#A3AFBC"><kbd style="…same kbd style…">Tab</kbd>Next panel</div>
  <div style="margin-left:auto;display:flex;align-items:center;gap:28px">
    …more hints, e.g. <kbd>F</kbd>Favourite…
    <button type="button" style="…primary button, §5…">Select aircraft</button>
  </div>
</footer>
```

## 5. Component recipes (inline styles; copy and adapt)

- **Primary button**: `<button type="button" style="height:44px;padding:0 22px;background:#F5B942;color:#1A1200;border:0;border-radius:4px;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:600;font-size:16px;letter-spacing:0.08em;text-transform:uppercase;display:inline-flex;align-items:center;gap:10px;white-space:nowrap">Fly now</button>` (optional 18-px icon inside).
- **Secondary button**: same but `background:transparent;color:#E6EBF0;border:1px solid #394655`.
- **Ghost button**: `background:transparent;color:#A3AFBC;border:0;padding:0 12px`.
- **Danger text button**: ghost with `color:#FF6B6B`.
- **Icon button** (40 × 40): `<button type="button" aria-label="Favourite" style="width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;background:#161D26;border:1px solid #27313D;border-radius:4px;color:#A3AFBC;padding:0">` + 20-px icon. Active: `color:#F5B942;border-color:#F5B942`.
- **Card / panel**: `<section style="background:#10151C;border:1px solid #27313D;border-radius:6px;padding:20px;display:flex;flex-direction:column;gap:16px">`. Selected card adds `outline:2px solid #F5B942;outline-offset:-2px`.
- **Panel title row**: `<div style="display:flex;align-items:center;gap:12px"><h2 style="margin:0;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:600;font-size:18px;letter-spacing:0.06em;text-transform:uppercase">Fuel</h2><span style="margin-left:auto;…">…</span></div>`.
- **Eyebrow label**: `font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:600;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#7B8999`.
- **Tabs row** (in-page): container `display:flex;gap:28px;border-bottom:1px solid #27313D`; each tab a `<button type="button" role="tab" aria-selected="true|false" style="height:40px;padding:0;background:none;border:0;border-bottom:2px solid transparent;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:600;font-size:16px;letter-spacing:0.08em;text-transform:uppercase;color:#A3AFBC">`; selected: `color:#F5B942;border-bottom-color:#F5B942`. Wrap them in `<div role="tablist">`? **No** — role on a div is banned; use `<nav aria-label="Sections">`.
- **Toggle (ON)**: `<button type="button" role="switch" aria-checked="true" aria-label="Volumetric clouds" style="width:44px;height:24px;border-radius:12px;background:#F5B942;border:0;position:relative;padding:0;flex:none"><span style="position:absolute;top:3px;left:23px;width:18px;height:18px;border-radius:50%;background:#1A1200;display:block"></span></button>`
  **Toggle (OFF)**: `background:#394655` and the knob `left:3px;background:#A3AFBC`.
- **Slider row**: `<div style="display:flex;align-items:center;gap:16px"><label for="rs" style="width:180px;font-size:14px;color:#E6EBF0">Render scale</label><input id="rs" type="range" min="50" max="200" value="120" style="width:260px;background:linear-gradient(to right,#F5B942 0 47%,#394655 47% 100%)"><span style="font-family:'IBM Plex Mono',Menlo,Consolas,monospace;font-size:14px;color:#57C7DB;min-width:56px;text-align:right">120 %</span></div>` — the gradient stop equals the value position; thumb styling comes from the helmet.
- **Segmented control**: container `display:inline-flex;background:#161D26;border:1px solid #27313D;border-radius:4px;padding:3px;gap:2px`; options `<button type="button" aria-pressed="true|false" style="height:32px;padding:0 14px;border:0;border-radius:3px;background:#1E2733;color:#F5B942;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:600;font-size:14px;letter-spacing:0.06em;text-transform:uppercase">` (inactive: `background:transparent;color:#A3AFBC`).
- **Select (static)**: `<button type="button" aria-label="Runway" style="height:40px;padding:0 12px 0 14px;background:#161D26;border:1px solid #27313D;border-radius:4px;color:#E6EBF0;display:inline-flex;align-items:center;justify-content:space-between;gap:12px;min-width:200px;font-size:14px">16L · 11,901 ft <svg …chevron-down 16px, color #7B8999…></svg></button>`
- **Text input**: `<input type="text" value="N737CT" aria-label="Registration" style="height:40px;padding:0 14px;background:#161D26;border:1px solid #27313D;border-radius:4px;color:#E6EBF0;font-size:14px;width:200px">` (mono font for codes).
- **Search field**: a flex box `height:40px;background:#161D26;border:1px solid #27313D;border-radius:4px;padding:0 12px;display:flex;align-items:center;gap:10px;color:#7B8999` with the search icon + `<input type="text" placeholder="Search aircraft" aria-label="Search aircraft" style="background:none;border:0;outline:none;color:#E6EBF0;font-size:14px;width:220px;padding:0">`.
- **Checkbox row**: `<label style="display:flex;align-items:center;gap:12px;height:36px;font-size:14px"><input type="checkbox" checked> Show AI traffic</label>`.
- **Badge**: `<span style="font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:600;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;padding:3px 8px;border-radius:999px;background:#1E2733;color:#A3AFBC">Included</span>`; amber variant `background:rgba(245,185,66,0.14);color:#F5B942`; cyan variant `background:rgba(87,199,219,0.14);color:#57C7DB`; green `background:rgba(91,214,138,0.14);color:#5BD68A`.
- **Key cap**: `<kbd>` style in §4.4.
- **Stat block**: eyebrow + `<span style="font-family:'IBM Plex Mono',Menlo,Consolas,monospace;font-size:22px;line-height:1.1;color:#E6EBF0">2,935<span style="font-size:13px;color:#7B8999;margin-left:4px">nm</span></span>`.
- **Data row** (settings list): `<div style="display:flex;align-items:center;gap:16px;min-height:48px;padding:0 16px;border-bottom:1px solid #27313D">` label (15 px, text) + optional hint (13 px, text3) on the left, control on the right (`margin-left:auto`).
- **Scrollbar indicator** for a cut-off region: inside a `position:relative` container add `<div aria-hidden="true" style="position:absolute;top:0;right:0;width:4px;height:100%;background:#27313D;border-radius:2px"><div style="width:4px;height:38%;background:#7B8999;border-radius:2px"></div></div>` — thumb height/offset chosen to look plausible.
- **Divider**: `<div style="height:1px;background:#27313D"></div>` (horizontal) / `width:1px;align-self:stretch` (vertical).
- **Sidebar list item** (settings sections, hangar categories): `<a href="#" style="display:flex;align-items:center;gap:12px;height:44px;padding:0 16px;border-radius:4px;color:#A3AFBC;font-size:15px">` icon 20 px + label + count in mono text3 at `margin-left:auto`; active: `background:#1E2733;color:#F5B942` (count stays text2).
- **Progress / meter bar**: track `height:6px;background:#27313D;border-radius:3px` with inner `height:6px;width:62%;background:#57C7DB;border-radius:3px` (amber for user-set amounts, cyan for computed/measured, red beyond a limit).

## 6. Icons and asset tokens — `assets/icons.json` + `tools/inject.py`

Never paste SVG markup by hand. Write a TOKEN where an asset goes, then run `python3 -I tools/inject.py project/<Name>.dc.html`
(idempotent; re-run after adding tokens) and the token is replaced with the real markup:
- `@@ICON:name@@` → a 20-px stroke icon; `@@ICON:name:18@@` / `@@ICON:name:24@@` for other sizes. It expands to
  `<svg width=… viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" … aria-hidden="true">…</svg>`, so colour it with `color:` on the parent.
- `@@MARK@@` → the 28-px CONTRAIL wordmark glyph (`@@MARK:56@@` for 56 px).
- `@@SIL:key@@` → a top-down silhouette (§7); `@@PROFILE:b737@@` / `@@PROFILE:f16@@` → a side profile (§8). Both expand with
  `width="100%" height="100%"`, so size them with the wrapper element.
Icon names available: see the keys of `assets/icons.json` (home, hangar, plane, plane-takeoff, plane-landing, map, globe, compass, route, pin,
sliders, cog, gamepad, joystick, monitor, speaker, keyboard, mouse, cloud, cloud-rain, cloud-snow, cloud-lightning, wind, sun, moon, sunrise,
thermometer, gauge, clock, calendar, fuel, weight, scale, paint, palette, layers, camera, headset, radio, checklist, wrench, warning, info,
search, filter, grid, list, star, star-filled, check, x, plus, minus, chevron-down/up/left/right, arrow-right/left/up/down, play, pause, replay,
record, users, user, trophy, graduation, flag, lock, unlock, download, upload, save, undo, redo, eye, eye-off, rotate, crosshair, target, menu,
more-horizontal, external, bookmark, bell, shield, zap, link, copy, trash, edit, maximize, volume, mic, power, refresh, history, tower, runway,
helicopter, snowflake, droplet, eyedropper, swap, sort, tag, image, film, pen, hand, cursor, parachute, anchor, medal, book, lightbulb, wifi, battery …).
Never emoji, never Unicode symbols as icons. If a name is missing, inject.py reports it: pick the closest existing icon.

## 7. Aircraft silhouettes (top-down line art) — `assets/silhouettes.json`

`{ "<key>": "<complete <svg …>…</svg> markup>" }`. Each is a plan-view (nose up) blueprint drawing,
`viewBox="0 0 240 200"`, stroke `currentColor` 2 px, shapes filled with `var(--sil-fill,#10151C)` so
overlapping parts occlude correctly. Use: set `color:#57C7DB` (cyan) on the wrapper and `--sil-fill` to the
background the drawing sits on (`#10151C` on a card, `#0A0D12` on the page ground, `#161D26` in a raised panel),
e.g. `<div style="color:#57C7DB;--sil-fill:#10151C;width:160px;height:133px">@@SIL:narrowbody@@</div>` (token, see §6).
Keys and the catalogue rows that use them are in §9.

## 8. Side-profile livery templates — `assets/profiles.json` + `assets/liveries.json`

`profiles.json` = `{ "b737": "<svg …>", "f16": "<svg …>" }`: side views (nose LEFT) whose paint regions use CSS variables.
`liveries.json` = `{ "b737": [ {id,name,airline,vars:{…}} … ], "f16": [ … ] }`. To show a livery, wrap the profile
svg in an element that sets the variables inline, e.g.
`<div style="--c-fuselage:#F2F4F6;--c-belly:#10264A;--c-cheat:#F5B942;--c-tail:#10264A;--c-engine:#F2F4F6;--c-logo:#F5B942;--c-wing:#C9D0D8;width:320px;height:110px">@@PROFILE:b737@@</div>` (viewBox 640 × 220, so height = width × 0.344).
Variables for the 737: `--c-fuselage --c-belly --c-cheat --c-tail --c-engine --c-logo --c-wing`.
Variables for the F-16: `--c-upper --c-lower --c-radome --c-fin --c-stripe --c-canopy`.
Livery colour sets (also in liveries.json):

**Boeing 737-800**
| id | name | fuselage | belly | cheat | tail | engine | logo | wing |
|---|---|---|---|---|---|---|---|---|
| meridian-signature | Meridian Air · Signature | #F2F4F6 | #10264A | #F5B942 | #10264A | #F2F4F6 | #F5B942 | #C9D0D8 |
| meridian-retro | Meridian Air · Retro '68 | #F3EBD8 | #F3EBD8 | #B8322B | #B8322B | #F3EBD8 | #F3EBD8 | #C9C2B0 |
| nordlys | Nordlys | #F7F9FA | #0E7C86 | #58D3C7 | #0E7C86 | #0E7C86 | #F7F9FA | #CDD6DB |
| pacifica | Pacifica Airways | #1C4F9C | #F4F6F8 | #F4F6F8 | #F28C28 | #1C4F9C | #F4F6F8 | #B9C2CC |
| austral | Aerolíneas Austral | #C8CDD3 | #C8CDD3 | #4A90D9 | #F4F6F8 | #C8CDD3 | #2A62B5 | #AEB5BD |
| kestrel | Kestrel Cargo | #2B2F36 | #2B2F36 | #F26B21 | #F26B21 | #2B2F36 | #2B2F36 | #3A3F47 |
| sakura | Sakura Air | #FBFBFC | #FBFBFC | #E8739A | #E8739A | #FBFBFC | #FBFBFC | #D5D9DE |
| zenith | Zenith Express | #111417 | #111417 | #D4A64A | #111417 | #111417 | #D4A64A | #23272C |
| house | Contrail House Colours | #B9BFC7 | #B9BFC7 | #F5B942 | #0A0D12 | #B9BFC7 | #F5B942 | #9AA1A9 |
| clean | Clean Sheet | #F4F6F8 | #D9DEE3 | #D9DEE3 | #F4F6F8 | #F4F6F8 | #F4F6F8 | #C9D0D8 |
| alrimal | Al Rimal | #E9DCC3 | #E9DCC3 | #7A1F2B | #7A1F2B | #E9DCC3 | #E9DCC3 | #CBBFA6 |
| marlin | Marlin Pacific | #1F6FB2 | #0C2E57 | #5CC8F2 | #0C2E57 | #1F6FB2 | #5CC8F2 | #8FA9C2 |

**F-16C Fighting Falcon**
| id | name | upper | lower | radome | fin | stripe | canopy |
|---|---|---|---|---|---|---|---|
| lowvis | Low-Vis Grey | #7C838A | #9AA1A8 | #5E6469 | #7C838A | #5E6469 | #8A7A3E |
| aggressor-arctic | Aggressor · Arctic Splinter | #4D6A86 | #8EA6BD | #2E4257 | #2E4257 | #8EA6BD | #8A7A3E |
| aggressor-desert | Aggressor · Desert | #A58A5A | #C9B894 | #6B5A3C | #6B5A3C | #C9B894 | #8A7A3E |
| heritage-sea | Heritage · SEA Camo | #4F5E3B | #B9B29A | #3A3A3A | #6E5A3B | #3A3A3A | #8A7A3E |
| demo-team | Demonstration Team | #F4F6F8 | #F4F6F8 | #1B3A7A | #C8102E | #1B3A7A | #8A7A3E |
| black-knights | Black Knights · CO bird | #2A2D31 | #3B3F45 | #141618 | #141618 | #F5B942 | #8A7A3E |

## 9. Aircraft catalogue (data for the Hangar and the detail screens)

Figures are approximate public performance numbers, fine for a mockup. `sil` = silhouette key.
Tags: **Included** (base game), **Expansion** (add-on), **Study** (study-level systems), **New**.

| id | name | manufacturer | category | sil | engines | speed | range | ceiling | seats | tags |
|---|---|---|---|---|---|---|---|---|---|---|
| b738 | Boeing 737-800 | Boeing | Airliner | narrowbody | 2× CFM56-7B | 453 kt | 2,935 nm | 41,000 ft | 189 | Included, Study |
| a20n | Airbus A320neo | Airbus | Airliner | narrowbody | 2× LEAP-1A | 450 kt | 3,500 nm | 39,800 ft | 194 | Included, Study |
| b789 | Boeing 787-9 | Boeing | Airliner | widebody | 2× GEnx-1B | 488 kt | 7,635 nm | 43,100 ft | 296 | Included |
| a359 | Airbus A350-900 | Airbus | Airliner | widebody | 2× Trent XWB | 488 kt | 8,100 nm | 43,100 ft | 325 | Expansion, Study |
| b748 | Boeing 747-8 | Boeing | Airliner | jumbo | 4× GEnx-2B | 493 kt | 7,730 nm | 43,100 ft | 410 | Expansion |
| bcs3 | Airbus A220-300 | Airbus | Airliner | narrowbody-small | 2× PW1500G | 447 kt | 3,400 nm | 41,000 ft | 145 | Included, New |
| e190 | Embraer E190 | Embraer | Airliner | narrowbody-small | 2× CF34-10E | 447 kt | 2,450 nm | 41,000 ft | 106 | Included |
| at76 | ATR 72-600 | ATR | Airliner | turboprop-regional | 2× PW127M | 275 kt | 825 nm | 25,000 ft | 72 | Included |
| dh8d | Dash 8 Q400 | De Havilland Canada | Airliner | turboprop-regional | 2× PW150A | 360 kt | 1,100 nm | 27,000 ft | 78 | Expansion |
| c25c | Citation CJ4 | Cessna | Business | bizjet | 2× FJ44-4A | 451 kt | 2,165 nm | 45,000 ft | 9 | Included |
| glf6 | Gulfstream G650ER | Gulfstream | Business | bizjet | 2× BR725 | 516 kt | 7,500 nm | 51,000 ft | 19 | Expansion |
| pc12 | Pilatus PC-12 NGX | Pilatus | Business | single-turboprop | 1× PT6E-67XP | 290 kt | 1,803 nm | 30,000 ft | 9 | Included |
| e55p | Phenom 300E | Embraer | Business | bizjet | 2× PW535E1 | 464 kt | 2,010 nm | 45,000 ft | 10 | Included, New |
| f16 | F-16C Fighting Falcon | Lockheed Martin | Military | fighter-single | 1× F110-GE-129 | Mach 2.0 | 2,280 nm | 50,000 ft | 1 | Included, Study |
| fa18 | F/A-18E Super Hornet | Boeing | Military | fighter-twin | 2× F414-GE-400 | Mach 1.6 | 1,800 nm | 50,000 ft | 1 | Included, Study |
| f15e | F-15E Strike Eagle | Boeing | Military | fighter-twin | 2× F100-PW-229 | Mach 2.5 | 2,100 nm | 60,000 ft | 2 | Expansion |
| f22 | F-22A Raptor | Lockheed Martin | Military | fighter-stealth | 2× F119-PW-100 | Mach 2.25 | 1,600 nm | 65,000 ft | 1 | Expansion |
| eufi | Eurofighter Typhoon | Airbus · BAE · Leonardo | Military | canard-delta | 2× EJ200 | Mach 2.0 | 1,840 nm | 55,000 ft | 1 | Included |
| rfal | Dassault Rafale C | Dassault | Military | canard-delta | 2× M88-2 | Mach 1.8 | 2,000 nm | 50,000 ft | 1 | Expansion |
| jas39 | Saab JAS 39 Gripen E | Saab | Military | fighter-single | 1× F414G | Mach 2.0 | 2,160 nm | 52,000 ft | 1 | Included, New |
| su27 | Sukhoi Su-27 | Sukhoi | Military | fighter-twin | 2× AL-31F | Mach 2.35 | 1,900 nm | 62,500 ft | 1 | Expansion |
| a10 | A-10C Thunderbolt II | Fairchild Republic | Military | attack | 2× TF34-GE-100 | 381 kt | 2,240 nm | 45,000 ft | 1 | Included, Study |
| t38 | T-38C Talon | Northrop | Military | trainer | 2× J85-GE-5 | Mach 1.3 | 1,140 nm | 50,000 ft | 2 | Included |
| c130 | C-130J Super Hercules | Lockheed Martin | Military | transport | 4× AE 2100D3 | 362 kt | 2,417 nm | 28,000 ft | 3 | Expansion |
| b52 | B-52H Stratofortress | Boeing | Military | bomber | 8× TF33-P-3 | 560 kt | 7,650 nm | 50,000 ft | 5 | Expansion |
| c172 | Cessna 172S Skyhawk | Cessna | General Aviation | ga-high | 1× IO-360-L2A | 124 kt | 640 nm | 14,000 ft | 4 | Included |
| sr22 | Cirrus SR22 G6 | Cirrus | General Aviation | ga-low | 1× IO-550-N | 183 kt | 1,169 nm | 17,500 ft | 5 | Included, Study |
| p28a | Piper PA-28 Archer | Piper | General Aviation | ga-low | 1× O-360-A4M | 128 kt | 522 nm | 13,000 ft | 4 | Included |
| be58 | Beechcraft Baron G58 | Beechcraft | General Aviation | ga-twin | 2× IO-550-C | 202 kt | 1,480 nm | 20,688 ft | 6 | Included |
| da40 | Diamond DA40 NG | Diamond | General Aviation | ga-low | 1× AE 300 | 154 kt | 940 nm | 16,400 ft | 4 | Included |
| e300 | Extra 330LX | Extra | General Aviation | aerobatic | 1× AEIO-580 | 185 kt | 460 nm | 16,000 ft | 2 | Included |
| dhc2 | DHC-2 Beaver (floats) | De Havilland Canada | General Aviation | bush-floats | 1× R-985 Wasp Jr. | 125 kt | 395 nm | 18,000 ft | 7 | Included |
| xcub | CubCrafters XCub | CubCrafters | General Aviation | bush | 1× CC363i | 153 kt | 800 nm | 14,000 ft | 2 | Included, New |
| a5 | Icon A5 | Icon | General Aviation | amphibian | 1× Rotax 912 iS | 95 kt | 427 nm | 15,000 ft | 2 | Included |
| h135 | Airbus H135 | Airbus Helicopters | Helicopter | heli | 2× PW206B3 | 137 kt | 340 nm | 20,000 ft | 7 | Included, Study |
| b407 | Bell 407 | Bell | Helicopter | heli | 1× 250-C47B | 133 kt | 324 nm | 18,690 ft | 7 | Included |
| r44 | Robinson R44 Raven II | Robinson | Helicopter | heli-light | 1× IO-540 | 110 kt | 300 nm | 14,000 ft | 4 | Included |
| uh60 | UH-60M Black Hawk | Sikorsky | Helicopter | heli-mil | 2× T700-GE-701D | 151 kt | 320 nm | 19,000 ft | 2+11 | Expansion |
| ask21 | Schleicher ASK 21 | Alexander Schleicher | Glider | glider | — | 151 kt Vne | 34:1 glide | 20,000 ft | 2 | Included |
| dg1001 | DG-1001 Club | DG Flugzeugbau | Glider | glider | — | 146 kt Vne | 46:1 glide | 20,000 ft | 2 | Included |
| spit | Spitfire Mk IX | Supermarine | Warbird | warbird-elliptical | 1× Merlin 66 | 350 kt | 434 nm | 43,000 ft | 1 | Expansion |
| p51 | P-51D Mustang | North American | Warbird | warbird | 1× V-1650-7 | 383 kt | 1,650 nm | 41,900 ft | 1 | Expansion |
| dc3 | Douglas DC-3 | Douglas | Warbird | vintage-airliner | 2× R-1830 | 180 kt | 1,500 nm | 23,200 ft | 28 | Included |

Category counts: All 43 · Airliners 9 · Business 4 · Military 12 · General Aviation 9 · Helicopters 4 · Gliders 2 · Warbirds & Vintage 3.
Silhouette keys needed (24): narrowbody, narrowbody-small, widebody, jumbo, turboprop-regional, bizjet, single-turboprop,
fighter-single, fighter-twin, fighter-stealth, canard-delta, attack, trainer, transport, bomber, ga-high, ga-low, ga-twin,
aerobatic, bush-floats, bush, amphibian, heli, heli-light, heli-mil, glider, warbird-elliptical, warbird, vintage-airliner (29 with variants).

## 10. Copy, data and tone

- Terse and aviation-literate: ICAO codes (KSEA, KSFO, EGLL), runways (16L), Zulu time (14:32Z), knots, feet, nautical miles,
  flight levels (FL350), frequencies (118.700), QNH 1013, METAR-style weather strings.
- Today is **16 OCT 2026**. The pilot is **Capt. Mara Lindqvist**, 1,284 h logged, online. Sim version v1.4.2.
- The "current" aircraft across the flow is the **Boeing 737-800** in the **Meridian Air · Signature** livery, registration **N737CT**,
  planned flight **KSEA → KSFO** (590 nm great-circle, cruise FL350, block 2 h 05 m, alternate KOAK). The fighter flow uses the **F-16C** in **Low-Vis Grey**, tail number **AF 91-0372**, from **KLSV** (Nellis).
- No lorem ipsum, no "[placeholder]" text, no invented marketing copy, no stats that are not useful. Every number is one a pilot
  would expect to see on that screen. When a real value is unknowable, prefer a plausible round figure over leaving a blank.
- Static only: no hover states need drawing, but draw ONE clear selected/active state per group (tab, card, row, option).

## 11. Verification loop (mandatory for every artboard)

0. `python3 -I tools/inject.py project/<Name>.dc.html` → replaces asset tokens (re-run whenever you add tokens).
1. `python3 -I tools/lint.py project/<Name>.dc.html` → must report **0 errors** (fix warnings when cheap).
2. `tools/render.sh project/<Name>.dc.html` → `render/<Name>.png`; **view the PNG** (Read tool) and check: nothing clipped or
   overflowing its box, no overlapping text, every column aligned, type sizes match §1, colours match §1, chrome identical to §4,
   the brief's content is all present, no empty regions, silhouettes/profiles render (not blank), contrast fine.
3. Fix and repeat until clean. Two passes minimum.
