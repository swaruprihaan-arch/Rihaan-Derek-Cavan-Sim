# CONTRAIL — flight simulator UI design

Fourteen static 1600 × 900 screens for a fictional flight simulator, designed on 16 October 2026.
Nothing in them is interactive by design.

Published design canvas (private until you share it from the page's Share menu):
https://claude.ai/artifact/STvzqZ91YofAp5hgzMFEL4

The interactive app in the parent folder (`index.html`, `app.js`, `sim.js`, `data.js`, `art.js`, `style.css`,
`polish.css`) was built separately from `SPEC.md`; this folder is the design source it mirrors.

## What is where

| Path | Contents |
|---|---|
| `project/` | The 14 artboards (`*.dc.html`) exactly as published, plus `canvas.json` (board positions, titles, row labels). Every artboard opens directly in a browser. |
| `render/` | A full-size PNG of every screen and `contact-sheet.png` showing all 14. |
| `assets/` | Asset library: `icons.json` (122 stroke icons plus the CONTRAIL mark), `silhouettes.json` (29 plan-view aircraft shapes), `profiles.json` (737-800 and F-16C side profiles), `liveries.json` (12 airliner and 6 fighter paint schemes as CSS variables), `skeleton.dc.html` (page template with the shared top bar, header and footer) and preview pages for each set. |
| `SPEC.md` | Design system and rules: colours, type, spacing, component recipes, asset tokens, the 43-aircraft catalogue, liveries, copy and data. |
| `BRIEFS.md` | Content brief for each screen. |
| `tools/` | `lint.py` (format checker), `inject.py` (asset-token expander), `render.sh` (headless-Chrome screenshot), `crop.py` and `sheet.py` (zoom crops and contact sheets, need Pillow), the icon and profile generators, and the orchestration script used to author the screens (`artboards.workflow.js`, which still contains a session-specific path). |
| `build/` | Hand-authored silhouette definitions and `build.py`, which assembles `assets/silhouettes.json` and its preview pages. |

## Screens

| File | Screen |
|---|---|
| `Main.dc.html` | Main menu with the paused-flight hero, action tiles, pilot log, live weather and release notes |
| `Hangar.dc.html` | Aircraft browser: category sidebar, filters, 5 × 3 card grid, 737-800 selected |
| `AircraftAirliner.dc.html` | Boeing 737-800 configuration: fuel, payload, weight and balance, startup state, avionics |
| `AircraftFighter.dc.html` | F-16C Block 50 loadout: stations list, top-view stores diagram, store picker, totals |
| `Liveries.dc.html` | Livery gallery for the 737-800 with a preview and finish panel |
| `LiveryEditor.dc.html` | Livery editor: layers, side-view canvas with the cheatline selected, cheatline, finish and registration properties |
| `FlightPlanner.dc.html` | Route planner: departure and arrival, map with the KSEA to KSFO route, vertical profile, waypoints, fuel plan |
| `FlightSetup.dc.html` | Flight briefing: flight summary, departure and arrival METARs, conditions, realism, ready check |
| `Weather.dc.html` | Weather lab: cloud-layer cross-section, layer table, wind, precipitation, atmosphere, presets, METAR |
| `SettingsGraphics.dc.html` | Settings: graphics |
| `SettingsControls.dc.html` | Settings: controls with device strip, bindings table and axis response curve |
| `SettingsRealism.dc.html` | Settings: realism and assistance |
| `Missions.dc.html` | Missions and training: career panel, contract cards, flight school progress, mission details |
| `InFlight.dc.html` | In flight: head-up display over a banked horizon, top toolbar, quick-panel drawer |

## Design system in brief

| Token | Value |
|---|---|
| Backgrounds | `#0A0D12` ground, `#10151C` panel, `#161D26` inset, `#1E2733` raised |
| Lines | `#27313D` hairline, `#394655` control border |
| Text | `#E6EBF0` primary, `#A3AFBC` secondary, `#7B8999` tertiary |
| Accent | `#F5B942` amber (selected, primary actions), ink on amber `#1A1200` |
| Readouts | `#57C7DB` cyan for set values, `#5BD68A` green OK, `#FF6B6B` red danger |
| Type | Barlow Condensed for display caps, Barlow for body, IBM Plex Mono for readouts (Google Fonts) |
| Grid | 8 px grid, 40 px page padding, 64 px top bar, 56 px bottom bar, radii 4 / 6 / 999 |

The full rules and every component recipe are in `SPEC.md`.

## Editing a screen

1. Edit the file in `project/`. New icons, silhouettes or profiles go in as tokens
   (`@@ICON:name:SIZE@@`, `@@SIL:key@@`, `@@PROFILE:b737@@`, `@@MARK@@`), then expand them:

   ```sh
   python3 tools/inject.py project/Weather.dc.html
   ```

2. Check the format (must report 0 errors):

   ```sh
   python3 tools/lint.py project/Weather.dc.html
   ```

3. Render it to `render/Weather.png` (needs Google Chrome installed):

   ```sh
   tools/render.sh project/Weather.dc.html
   ```

4. To update the published canvas, republish `project/canvas.json` and the changed `project/*.dc.html` to the artifact URL above.

## Format notes

- Artboards use the design-canvas `.dc.html` format: inline styles only, explicit closing tags, no scripts or
  event handlers. The `./support.js` reference at the top of each file is the canvas runtime; it is not needed to
  view a file locally.
- The fonts load from Google Fonts, so an offline browser falls back to system fonts.
- Aircraft types are real. Airlines, liveries, the pilot, the flight numbers and the traffic figures are fictional.
