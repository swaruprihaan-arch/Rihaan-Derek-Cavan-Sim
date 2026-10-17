export const meta = {
  name: 'contrail-artboards',
  description: 'Author, adversarially review, and harmonise the 14 CONTRAIL flight-simulator UI artboards',
  phases: [
    { title: 'Author', detail: 'one agent per screen: write, inject assets, lint, render, self-check' },
    { title: 'Review', detail: 'fresh-eyes reviewer per screen finds and fixes defects' },
    { title: 'Harmonise', detail: 'cross-screen consistency critic, then per-file fixes' },
  ],
}
const ROOT = '/private/tmp/claude-501/-Users-arshishahin-Documents-Sim/b3baba45-677a-4d55-a538-b737c0b0de26/scratchpad/contrail'
const SCREENS = [
  { file: 'Main.dc.html', name: 'Main menu', tab: 'Home' },
  { file: 'Hangar.dc.html', name: 'Aircraft browser', tab: 'Hangar' },
  { file: 'AircraftAirliner.dc.html', name: 'Aircraft configuration (737-800)', tab: 'Hangar' },
  { file: 'AircraftFighter.dc.html', name: 'Fighter loadout (F-16C)', tab: 'Hangar' },
  { file: 'Liveries.dc.html', name: 'Livery gallery', tab: 'Hangar' },
  { file: 'LiveryEditor.dc.html', name: 'Livery editor', tab: 'Hangar' },
  { file: 'FlightPlanner.dc.html', name: 'Flight planner', tab: 'Fly' },
  { file: 'FlightSetup.dc.html', name: 'Flight briefing', tab: 'Fly' },
  { file: 'Weather.dc.html', name: 'Weather lab', tab: 'Fly' },
  { file: 'SettingsGraphics.dc.html', name: 'Settings: graphics', tab: 'Settings' },
  { file: 'SettingsControls.dc.html', name: 'Settings: controls', tab: 'Settings' },
  { file: 'SettingsRealism.dc.html', name: 'Settings: realism', tab: 'Settings' },
  { file: 'Missions.dc.html', name: 'Missions and training', tab: 'Missions' },
  { file: 'InFlight.dc.html', name: 'In-flight HUD with quick panel', tab: 'none' },
]
const stem = f => f.replace('.dc.html', '')

const AUTHOR_SCHEMA = { type: 'object', properties: { file: { type: 'string' }, png: { type: 'string' }, lint_errors: { type: 'integer' }, passes: { type: 'integer' }, notes: { type: 'string' } }, required: ['file', 'png', 'lint_errors', 'passes', 'notes'] }
const REVIEW_SCHEMA = { type: 'object', properties: { file: { type: 'string' }, png: { type: 'string' }, lint_errors: { type: 'integer' }, found: { type: 'array', items: { type: 'object', properties: { severity: { type: 'string', enum: ['high', 'medium', 'low'] }, issue: { type: 'string' }, fixed: { type: 'boolean' } }, required: ['severity', 'issue', 'fixed'] } }, notes: { type: 'string' } }, required: ['file', 'png', 'lint_errors', 'found', 'notes'] }
const CRITIC_SCHEMA = { type: 'object', properties: { issues: { type: 'array', items: { type: 'object', properties: { file: { type: 'string' }, issue: { type: 'string' }, fix: { type: 'string' } }, required: ['file', 'issue', 'fix'] } }, weakest: { type: 'array', items: { type: 'string' } }, notes: { type: 'string' } }, required: ['issues', 'weakest', 'notes'] }
const FIX_SCHEMA = { type: 'object', properties: { file: { type: 'string' }, applied: { type: 'array', items: { type: 'string' } }, skipped: { type: 'array', items: { type: 'string' } }, lint_errors: { type: 'integer' } }, required: ['file', 'applied', 'skipped', 'lint_errors'] }

const TOOLS = `Tools (run from ROOT): \`python3 -I tools/inject.py project/<file>\` replaces asset tokens with SVG; \`python3 -I tools/lint.py project/<file>\` validates the format (must be 0 errors); \`tools/render.sh project/<file>\` screenshots it to render/<stem>.png with headless Chrome; \`python3 -I tools/crop.py render/<stem>.png X Y W H\` writes a 2x zoomed crop for close inspection. VIEW every PNG you produce with your Read tool and judge it with your own eyes.`

const authorPrompt = s => `You are authoring ONE screen of a hi-fi, STATIC flight-simulator UI design called CONTRAIL. ROOT = ${ROOT}. Screen: ${s.name} → file ROOT/project/${s.file}, active primary tab "${s.tab}".

Read in full before writing anything: ROOT/SPEC.md (design system, hard format rules, chrome, component recipes, data) and the section "## ${s.file}" of ROOT/BRIEFS.md (exactly what this screen contains). If the brief uses liveries, read ROOT/assets/liveries.json; the silhouette keys are listed in SPEC §9.

START from the template: copy ROOT/assets/skeleton.dc.html to ROOT/project/${s.file} and edit it. The skeleton holds the exact helmet, root, top bar, page header, and bottom bar; its <section> panel is just a sample of the component recipes — replace the main's content with the brief. Keep the chrome byte-for-byte except: the <title>, the active nav tab (move aria-current + the amber style to "${s.tab}"), the page-header eyebrow/title/right-side controls, and the bottom bar's right-hand hints and buttons. ${s.tab === 'none' ? 'EXCEPTION for this screen: the brief says NO top bar, NO bottom bar and NO page header — delete the header, main and footer from the skeleton and build the layered scene the brief describes inside the root.' : ''}
Use asset tokens (SPEC §6: @@ICON:name@@, @@SIL:key@@, @@PROFILE:b737@@, @@MARK@@) for every icon, silhouette and side profile; never hand-draw an icon that exists in the set. Hand-drawn inline SVG is only for the diagrams/charts/maps the brief asks for.
${TOOLS}

Verification loop (mandatory, SPEC §11): inject → lint (0 errors) → render → VIEW the PNG → fix → repeat. Crop-zoom every dense region (tables, sliders, small text, the silhouettes) and check it. Do at least two full passes and keep going until a pass finds nothing to fix.
Layout discipline: 780 px usable height between the bars, minus the main's 24 px top/bottom padding and the page header; compute your column heights so nothing is clipped except the regions the brief says are cut off (those get the scrollbar indicator). Flex children that shrink need min-height:0 / min-width:0. One-line text in tight cells gets nowrap + ellipsis. Panels fill their column (flex:1 / min-height:0) rather than leaving bg0 holes. Silhouette and profile wrappers keep their aspect ratio (silhouette 240:200, profile 640:220).
Quality bar: this should look like a shipped AAA simulator's menu — tidy 8-px rhythm, consistent gaps, every control carrying a value, every label earning its place; no emoji, no gradients outside the single illustration the brief allows, no colours or fonts outside SPEC §1, no filler copy or invented statistics beyond the brief and spec.
Your final message is parsed as data. Return JSON: {"file": "<absolute path>", "png": "<absolute path of the final render>", "lint_errors": 0, "passes": <n>, "notes": "<what you are least sure about; anything from the brief you could not fit and how you handled it>"}`

const reviewPrompt = (s, a) => `You are the second pair of eyes on ONE screen of the CONTRAIL flight-simulator UI design (static, 1600×900). ROOT = ${ROOT}. File: ROOT/project/${s.file} (${s.name}). You did NOT write it. Assume it contains at least five defects and find them; the author's own notes were: ${JSON.stringify((a && a.notes) || 'none')}.

Read ROOT/SPEC.md and the section "## ${s.file}" of ROOT/BRIEFS.md. Then run: python3 -I tools/inject.py project/${s.file}; python3 -I tools/lint.py project/${s.file}; tools/render.sh project/${s.file} — and VIEW render/${stem(s.file)}.png. Also render ROOT/assets/skeleton.dc.html once (copy it to ROOT/render/skeleton_ref.html first, inject there, render it) to compare the chrome pixel-for-pixel: crop (tools/crop.py) the top bar (0,0,1600,64) and bottom bar (0,844,1600,56) of both and compare.
${TOOLS}

Check in this order and write down every defect:
1. Brief completeness — every element the brief lists is present with the stated values and selection states. Missing or wrong → add/fix.
2. Spec conformance — chrome identical to the skeleton except the allowed differences; helmet verbatim (SPEC §3); only token colours (grep the file for every hex and rgba value and compare against SPEC §1 — illustration colours the brief names are also allowed) and only the three font families; type sizes per §1; component recipes per §5 (toggle 44×24, buttons 44 tall, slider gradient stop matching the value, badges, key caps, select chevrons, scrollbar indicators on cut-off regions).
3. Layout — anything clipped, overflowing, overlapping, misaligned, uneven gaps, bg0 holes where a panel should fill, text wrapping awkwardly, ellipsis where it should not be, silhouettes/profiles missing or distorted (aspect ratio), column widths not matching the brief, panels not aligned to each other's top/bottom edges.
4. Copy and data — consistent with SPEC §10 (KSEA → KSFO, 590 nm, FL350, 14:50Z, 16 OCT 2026, N737CT, Meridian Air · Signature, Capt. Mara Lindqvist, F-16C AF 91-0372); no filler, no placeholders, no emoji, terse aviation language; sentence case for body copy and uppercase only via the condensed-caps recipes.
5. Accessibility (SPEC §2) — real buttons/links/inputs, aria-labels on icon-only buttons and inputs, no role/tabindex on div/span, every svg aria-hidden or role=img.
6. Lint — 0 errors; fix cheap warnings.
FIX every defect directly in the file (Edit tool), then inject → lint → render → VIEW again, until a complete pass finds nothing. Do not restyle what is already correct and do not change the design direction.
Return JSON: {"file": "<abs path>", "png": "<abs path>", "lint_errors": 0, "found": [{"severity": "high|medium|low", "issue": "...", "fixed": true}], "notes": "..."}`

const criticPrompt = () => `You are the art director doing the final cross-screen consistency pass over all 14 screens of the CONTRAIL flight-simulator UI design. ROOT = ${ROOT}. Read ROOT/SPEC.md (especially §1, §4, §5, §10) and skim ROOT/BRIEFS.md.
Renders are at ROOT/render/<stem>.png for: ${SCREENS.map(s => stem(s.file)).join(', ')}. Re-render any that are older than their .dc.html (run tools/render.sh project/<file>) before judging.
Build a contact sheet: python3 -I tools/sheet.py render/sheet.png 2 780 ${SCREENS.map(s => 'render/' + stem(s.file) + '.png').join(' ')} and VIEW it. Then VIEW each render individually. Crop the top bar (0,0,1600,64) and the bottom bar (0,844,1600,56) of every screen (tools/crop.py) and build sheets of those crops (python3 -I tools/sheet.py render/sheet_top.png 1 1200 <crops…>) so you can compare them in one image.
${TOOLS}

Report every inconsistency or quality problem, per file, each with a concrete fix: chrome differences (wordmark/mark, nav spacing, active tab, status/clock/profile cluster, bottom-bar key caps and button styles, the 13 non-InFlight screens must match exactly); page-header style; panel padding/radius/border; type sizes; control styles (toggle, slider, segmented, select, badge, kbd, checkbox); icon sizes; colours outside the token set; data inconsistencies across screens (aircraft, route, registration, livery names, times, pilot); layouts that feel empty or crammed relative to the others; anything that looks unfinished or clipped; silhouettes or profiles that render wrong. Name the two weakest screens and why. DO NOT edit any file.
Return JSON: {"issues": [{"file": "Hangar.dc.html", "issue": "...", "fix": "..."}], "weakest": ["<file>", "<file>"], "notes": "..."}`

const fixPrompt = (file, issues) => `Apply these fixes to ROOT/project/${file} of the CONTRAIL flight-simulator UI design (ROOT = ${ROOT}). First read ROOT/SPEC.md and the section "## ${file}" of ROOT/BRIEFS.md so the fixes follow the system. Fixes:
${issues.map((it, i) => `${i + 1}. ${it.issue} → ${it.fix}`).join('\n')}
Change only what these fixes require. ${TOOLS}
After editing: inject → lint (0 errors) → render → VIEW the PNG and confirm each fix visually (crop-zoom to check). Return JSON: {"file": "<abs path>", "applied": ["..."], "skipped": ["<fix> — <why>"], "lint_errors": 0}`

log(`authoring ${SCREENS.length} screens (pipeline: each is reviewed as soon as it is written)`)
const results = await pipeline(
  SCREENS,
  s => agent(authorPrompt(s), { label: `author:${stem(s.file)}`, phase: 'Author', schema: AUTHOR_SCHEMA }),
  (a, s) => agent(reviewPrompt(s, a), { label: `review:${stem(s.file)}`, phase: 'Review', schema: REVIEW_SCHEMA }),
)
const reviewed = results.filter(Boolean)
log(`review done: ${reviewed.length}/${SCREENS.length} screens; ${reviewed.reduce((n, r) => n + r.found.length, 0)} defects found, ${reviewed.reduce((n, r) => n + r.found.filter(f => f.fixed).length, 0)} fixed`)

phase('Harmonise')
const critic = await agent(criticPrompt(), { label: 'critic:consistency', phase: 'Harmonise', schema: CRITIC_SCHEMA })
const byFile = {}
for (const it of (critic ? critic.issues : [])) { (byFile[it.file] = byFile[it.file] || []).push(it) }
log(`critic: ${critic ? critic.issues.length : 0} issues across ${Object.keys(byFile).length} files; weakest: ${critic ? critic.weakest.join(', ') : 'n/a'}`)
const fixes = await parallel(Object.entries(byFile).map(([file, issues]) => () =>
  agent(fixPrompt(file, issues), { label: `fix:${stem(file)}`, phase: 'Harmonise', schema: FIX_SCHEMA })))
return { reviews: reviewed, critic, fixes: fixes.filter(Boolean) }
