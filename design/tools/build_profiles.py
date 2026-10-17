#!/usr/bin/env python3
"""Builds assets/profiles.json, assets/liveries.json, assets/liveries_preview.html, assets/liveries_check.html.
Every shape below is hand-authored path data (no procedural/random geometry)."""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

OUT = 'stroke="#0A0D12" stroke-opacity="0.35" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"'
DARK = "#2B2F36"

# ---------------------------------------------------------------- Boeing 737-800
FUSE_737 = ("M 40,128 C 44,114 62,97 100,92 C 112,90 122,88 134,88 L 440,88 C 500,88 560,97 597,101 "
            "C 600,101 602,103 602,104 C 602,105 600,107 597,107 L 545,126 "
            "C 512,139 470,152 420,152 L 110,152 C 70,152 50,138 40,128 Z")
UPPER_737 = ("M 40,128 C 44,114 62,97 100,92 C 112,90 122,88 134,88 L 440,88 C 500,88 560,97 597,101 "
             "C 600,101 602,103 602,104 C 602,105 600,107 597,107 L 545,126 Z")
BAND_737 = "M 40,128 L 43,125 L 553,123 L 537,129 L 43,131 Z"
FIN_737 = ("M 436,92 C 484,89 505,85 517,72 L 564,21 C 565,20 566,20 568,20 L 602,20 "
           "C 605,20 607,22 606,24 L 597,106 L 436,106 Z")
LOGO_737 = "M 546,82 L 568,48 L 590,82 L 578,82 L 568,66 L 558,82 Z"
STAB_737 = "M 518,128 L 586,146 L 604,138 L 584,110 Z"
WING_737 = "M 250,146 L 372,198 L 398,202 L 372,164 L 372,146 Z"
WINGLET_737 = "M 374,199 C 379,194 383,186 386,177 L 394,175 C 396,183 397,192 399,202 Z"
FARWINGLET_737 = "M 382,90 L 388,66 L 392,66 L 396,90 Z"
NACELLE_737 = ("M 238,152 L 312,153 C 324,154 331,161 331,169 L 331,177 C 331,184 325,189 316,190 "
               "L 240,194 C 230,194 226,187 226,179 L 226,164 C 226,156 231,152 238,152 Z")
LIP_737 = ("M 238,152 C 231,152 226,156 226,164 L 226,179 C 226,187 230,194 240,194 L 240,189 "
           "C 234,189 231,185 231,179 L 231,164 C 231,158 234,157 238,157 Z")
EXHAUST_737 = "M 326,160 L 346,165 L 346,177 L 326,182 Z"
SHEEN_737 = ("M 42,126 C 46,113 62,97 100,92 C 112,90 122,88 134,88 L 440,88 C 500,88 560,97 597,101 "
             "M 482,88 C 498,86 507,83 517,72 L 564,21 L 602,20 M 240,153 L 312,153")
RUDDER_737 = "M 586,24 L 592,104"

def windows_737():
    out = []
    for i in range(28):
        x = 130 + 13 * i
        out.append('<rect x="%d" y="109" width="4" height="6" rx="1.2" style="fill:#0A0D12;fill-opacity:0.55"></rect>' % x)
    return "\n".join(out)

B737 = "\n".join([
    '<svg viewBox="0 0 640 220" width="100%" height="100%" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">',
    # far-side winglet peeking above the fuselage
    '<path d="%s" style="fill:var(--c-wing)" %s></path>' % (FARWINGLET_737, OUT),
    # vertical fin with dorsal fillet, logo, then its outline
    '<path d="%s" style="fill:var(--c-tail)"></path>' % FIN_737,
    '<path d="%s" style="fill:var(--c-logo)"></path>' % LOGO_737,
    '<path d="%s" style="fill:none" %s></path>' % (FIN_737, OUT),
    # VHF blade antennas
    '<path d="M 196,89 L 199,82 L 206,82 L 209,89 Z" style="fill:%s"></path>' % DARK,
    '<path d="M 398,89 L 401,83 L 407,83 L 410,89 Z" style="fill:%s"></path>' % DARK,
    # nose gear (strut, door, wheel) - drawn before the fuselage so the strut root is hidden
    '<rect x="108" y="150" width="4" height="56" style="fill:%s"></rect>' % DARK,
    '<rect x="100" y="152" width="4" height="18" rx="1" style="fill:%s"></rect>' % DARK,
    '<circle cx="110" cy="206" r="6" style="fill:%s"></circle>' % DARK,
    '<circle cx="110" cy="206" r="2" style="fill:#6B727B"></circle>',
    # main gear
    '<rect x="336" y="150" width="5" height="54" style="fill:%s"></rect>' % DARK,
    '<circle cx="343" cy="204" r="8" style="fill:#1F2328"></circle>',
    '<circle cx="338" cy="204" r="8" style="fill:%s"></circle>' % DARK,
    '<circle cx="338" cy="204" r="2.5" style="fill:#6B727B"></circle>',
    # near wing + blended winglet
    '<path d="%s" style="fill:var(--c-wing)" %s></path>' % (WING_737, OUT),
    '<path d="%s" style="fill:var(--c-wing)" %s></path>' % (WINGLET_737, OUT),
    '<path d="%s" style="fill:#0A0D12;fill-opacity:0.12"></path>' % WINGLET_737,
    # fuselage: belly, upper, cheat band
    '<path d="%s" style="fill:var(--c-belly)"></path>' % FUSE_737,
    '<path d="%s" style="fill:var(--c-fuselage)"></path>' % UPPER_737,
    '<path d="%s" style="fill:var(--c-cheat)"></path>' % BAND_737,
    # windows, cockpit glazing, doors
    windows_737(),
    '<path d="M 72,113 L 76,103 L 87,99 L 90,110 Z" style="fill:#0A0D12;fill-opacity:0.7"></path>',
    '<path d="M 92,109 L 93,98 L 107,94 L 107,106 Z" style="fill:#0A0D12;fill-opacity:0.7"></path>',
    '<rect x="104" y="100" width="12" height="30" rx="2" style="fill:none;stroke:#0A0D12;stroke-opacity:0.35;stroke-width:1"></rect>',
    '<rect x="498" y="101" width="12" height="30" rx="2" style="fill:none;stroke:#0A0D12;stroke-opacity:0.35;stroke-width:1"></rect>',
    '<rect x="297" y="104" width="8" height="14" rx="1.5" style="fill:none;stroke:#0A0D12;stroke-opacity:0.35;stroke-width:1"></rect>',
    '<rect x="323" y="104" width="8" height="14" rx="1.5" style="fill:none;stroke:#0A0D12;stroke-opacity:0.35;stroke-width:1"></rect>',
    # fuselage outline on top of the paint
    '<path d="%s" style="fill:none" %s></path>' % (FUSE_737, OUT),
    '<path d="%s" style="fill:none;stroke:#0A0D12;stroke-opacity:0.2;stroke-width:1"></path>' % RUDDER_737,
    '<path d="%s" style="fill:none;stroke:#FFFFFF;stroke-opacity:0.16;stroke-width:1" stroke-linecap="round"></path>' % SHEEN_737,
    # near horizontal stabiliser
    '<path d="%s" style="fill:var(--c-fuselage)" %s></path>' % (STAB_737, OUT),
    # engine: exhaust cone, nacelle, intake lip
    '<path d="%s" style="fill:%s"></path>' % (EXHAUST_737, DARK),
    '<path d="%s" style="fill:var(--c-engine)" %s></path>' % (NACELLE_737, OUT),
    '<path d="%s" style="fill:%s"></path>' % (LIP_737, DARK),
    '</svg>',
])

# ---------------------------------------------------------------- F-16C
FIN_F16 = ("M 392,100 C 440,97 461,82 476,68 L 506,24 C 506,23 507,22 509,22 L 546,22 "
           "C 549,22 551,24 551,27 L 564,104 L 392,104 Z")
STRIPE_F16 = "M 496.5,38 L 552.9,38 L 554.9,50 L 488.3,50 Z"
BODY_F16 = ("M 128,101 L 156,98 L 284,97 L 400,97 L 568,103 L 582,108 L 582,152 L 430,166 L 200,166 "
            "C 182,166 166,163 162,156 C 158,150 160,143 168,139 L 172,137 L 128,138 Z")
UPPER_F16 = "M 128,101 L 156,98 L 284,97 L 400,97 L 568,103 L 582,108 L 582,128 L 128,121 Z"
RADOME_F16 = "M 52,124 C 76,113 104,104 128,101 L 128,138 C 104,138 76,132 52,124 Z"
CANOPY_F16 = "M 156,98 C 162,82 180,67 200,67 C 228,67 258,80 284,97 Z"
SEAT_F16 = "M 212,97 C 212,86 220,80 230,82 C 238,84 240,92 240,97 Z"
WING_F16 = "M 244,128 C 286,130 312,135 326,142 L 462,170 L 506,170 L 506,139 L 326,139 Z"
VENT_F16 = "M 500,158 L 510,176 L 540,176 L 546,155 Z"
NOZZLE_F16 = "M 580,108 L 606,116 L 606,146 L 580,153 Z"
RINGS_F16 = "M 588,110.5 L 588,150.5 M 596,113 L 596,148.5 M 602,114.5 L 602,147"
STAB_F16 = "M 512,133 L 558,170 L 602,170 L 584,133 Z"
DIVERTER_F16 = "M 172,137 L 214,137 L 214,140 L 173,140 Z"
INTAKE_F16 = "M 162,156 C 158,150 160,143 168,139 L 173,140 C 166,144 164,150 168,157 Z"
SHEEN_F16 = ("M 54,123 C 76,113 104,104 128,101 L 156,98 M 284,97 L 400,97 L 568,103 "
             "M 430,97 C 450,94 464,84 476,68 L 506,24 L 546,22 M 158,96 C 164,80 182,68 200,68 C 228,68 256,80 282,96")

F16 = "\n".join([
    '<svg viewBox="0 0 640 220" width="100%" height="100%" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">',
    '<g transform="translate(0,12)">',
    # vertical fin: fill, stripe band, outline
    '<path d="%s" style="fill:var(--c-fin)"></path>' % FIN_F16,
    '<path d="%s" style="fill:var(--c-stripe)"></path>' % STRIPE_F16,
    '<path d="%s" style="fill:none" %s></path>' % (FIN_F16, OUT),
    # fuselage: lower, upper, intake details, outline
    '<path d="%s" style="fill:var(--c-lower)"></path>' % BODY_F16,
    '<path d="%s" style="fill:var(--c-upper)"></path>' % UPPER_F16,
    '<path d="%s" style="fill:#0A0D12;fill-opacity:0.55"></path>' % DIVERTER_F16,
    '<path d="%s" style="fill:#0A0D12;fill-opacity:0.45"></path>' % INTAKE_F16,
    '<path d="%s" style="fill:none" %s></path>' % (BODY_F16, OUT),
    # radome + pitot
    '<path d="%s" style="fill:var(--c-radome)" %s></path>' % (RADOME_F16, OUT),
    '<path d="M 52,124 L 24,124" style="fill:none;stroke:%s;stroke-width:2" stroke-linecap="round"></path>' % DARK,
    # bubble canopy with seat shadow and frame line
    '<path d="%s" style="fill:var(--c-canopy)" %s></path>' % (CANOPY_F16, OUT),
    '<path d="%s" style="fill:#0A0D12;fill-opacity:0.3"></path>' % SEAT_F16,
    '<path d="M 156,98 L 284,97" style="fill:none;stroke:#0A0D12;stroke-opacity:0.6;stroke-width:1.5"></path>',
    # ventral fin, near wing (with strake), nozzle, near stabilator
    '<path d="%s" style="fill:var(--c-lower)" %s></path>' % (VENT_F16, OUT),
    '<path d="%s" style="fill:var(--c-upper)" %s></path>' % (WING_F16, OUT),
    '<path d="%s" style="fill:#3A3F47" %s></path>' % (NOZZLE_F16, OUT),
    '<path d="%s" style="fill:none;stroke:#0A0D12;stroke-opacity:0.45;stroke-width:1"></path>' % RINGS_F16,
    '<path d="%s" style="fill:var(--c-upper)" %s></path>' % (STAB_F16, OUT),
    '<path d="M 537,30 L 550,103" style="fill:none;stroke:#0A0D12;stroke-opacity:0.2;stroke-width:1"></path>',
    '<ellipse cx="246" cy="115" rx="4" ry="2" style="fill:#0A0D12;fill-opacity:0.5"></ellipse>',
    '<path d="%s" style="fill:none;stroke:#FFFFFF;stroke-opacity:0.16;stroke-width:1" stroke-linecap="round"></path>' % SHEEN_F16,
    '</g>',
    '</svg>',
])

# ---------------------------------------------------------------- liveries (SPEC section 8)
B737_ROWS = [
    ("meridian-signature", "Meridian Air · Signature", "#F2F4F6", "#10264A", "#F5B942", "#10264A", "#F2F4F6", "#F5B942", "#C9D0D8"),
    ("meridian-retro", "Meridian Air · Retro '68", "#F3EBD8", "#F3EBD8", "#B8322B", "#B8322B", "#F3EBD8", "#F3EBD8", "#C9C2B0"),
    ("nordlys", "Nordlys", "#F7F9FA", "#0E7C86", "#58D3C7", "#0E7C86", "#0E7C86", "#F7F9FA", "#CDD6DB"),
    ("pacifica", "Pacifica Airways", "#1C4F9C", "#F4F6F8", "#F4F6F8", "#F28C28", "#1C4F9C", "#F4F6F8", "#B9C2CC"),
    ("austral", "Aerolíneas Austral", "#C8CDD3", "#C8CDD3", "#4A90D9", "#F4F6F8", "#C8CDD3", "#2A62B5", "#AEB5BD"),
    ("kestrel", "Kestrel Cargo", "#2B2F36", "#2B2F36", "#F26B21", "#F26B21", "#2B2F36", "#2B2F36", "#3A3F47"),
    ("sakura", "Sakura Air", "#FBFBFC", "#FBFBFC", "#E8739A", "#E8739A", "#FBFBFC", "#FBFBFC", "#D5D9DE"),
    ("zenith", "Zenith Express", "#111417", "#111417", "#D4A64A", "#111417", "#111417", "#D4A64A", "#23272C"),
    ("house", "Contrail House Colours", "#B9BFC7", "#B9BFC7", "#F5B942", "#0A0D12", "#B9BFC7", "#F5B942", "#9AA1A9"),
    ("clean", "Clean Sheet", "#F4F6F8", "#D9DEE3", "#D9DEE3", "#F4F6F8", "#F4F6F8", "#F4F6F8", "#C9D0D8"),
    ("alrimal", "Al Rimal", "#E9DCC3", "#E9DCC3", "#7A1F2B", "#7A1F2B", "#E9DCC3", "#E9DCC3", "#CBBFA6"),
    ("marlin", "Marlin Pacific", "#1F6FB2", "#0C2E57", "#5CC8F2", "#0C2E57", "#1F6FB2", "#5CC8F2", "#8FA9C2"),
]
B737_VARS = ["--c-fuselage", "--c-belly", "--c-cheat", "--c-tail", "--c-engine", "--c-logo", "--c-wing"]
F16_ROWS = [
    ("lowvis", "Low-Vis Grey", "#7C838A", "#9AA1A8", "#5E6469", "#7C838A", "#5E6469", "#8A7A3E"),
    ("aggressor-arctic", "Aggressor · Arctic Splinter", "#4D6A86", "#8EA6BD", "#2E4257", "#2E4257", "#8EA6BD", "#8A7A3E"),
    ("aggressor-desert", "Aggressor · Desert", "#A58A5A", "#C9B894", "#6B5A3C", "#6B5A3C", "#C9B894", "#8A7A3E"),
    ("heritage-sea", "Heritage · SEA Camo", "#4F5E3B", "#B9B29A", "#3A3A3A", "#6E5A3B", "#3A3A3A", "#8A7A3E"),
    ("demo-team", "Demonstration Team", "#F4F6F8", "#F4F6F8", "#1B3A7A", "#C8102E", "#1B3A7A", "#8A7A3E"),
    ("black-knights", "Black Knights · CO bird", "#2A2D31", "#3B3F45", "#141618", "#141618", "#F5B942", "#8A7A3E"),
]
F16_VARS = ["--c-upper", "--c-lower", "--c-radome", "--c-fin", "--c-stripe", "--c-canopy"]

def rows(table, varnames):
    out = []
    for r in table:
        name = r[1]
        airline = name.split(" · ")[0] if " · " in name else name
        out.append({"id": r[0], "name": name, "airline": airline, "vars": dict(zip(varnames, r[2:]))})
    return out

LIVERIES = {"b737": rows(B737_ROWS, B737_VARS), "f16": rows(F16_ROWS, F16_VARS)}
PROFILES = {"b737": B737, "f16": F16}

def style_of(vars_):
    return ";".join("%s:%s" % kv for kv in vars_.items())

def card(kind, liv, width):
    return ('<div class="card"><div class="art" style="%s;width:%dpx">%s</div>'
            '<div class="name">%s</div></div>' % (style_of(liv["vars"]), width, PROFILES[kind], liv["name"]))

def page(title, body, extra_css=""):
    return ("<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\"><title>%s</title>\n<style>\n"
            "html,body{margin:0;background:#0A0D12;font-family:Barlow,'Helvetica Neue',Arial,sans-serif}\n"
            ".grid{display:grid;grid-template-columns:repeat(4,384px);gap:16px;padding:16px 8px}\n"
            ".card{background:#10151C;border:1px solid #27313D;border-radius:6px;padding:12px}\n"
            ".art svg{display:block}\n"
            ".name{color:#A3AFBC;font-size:13px;line-height:20px;margin-top:6px}\n"
            "h2{color:#7B8999;font:600 12px/16px 'Barlow Condensed','Arial Narrow',sans-serif;text-transform:uppercase;letter-spacing:0.14em;margin:16px 8px 0}\n"
            "%s</style></head><body>\n%s\n</body></html>\n" % (title, extra_css, body))

def main():
    assets = os.path.join(ROOT, "assets")
    os.makedirs(assets, exist_ok=True)
    with open(os.path.join(assets, "profiles.json"), "w", encoding="utf-8") as f:
        json.dump(PROFILES, f, ensure_ascii=False, indent=1)
    with open(os.path.join(assets, "liveries.json"), "w", encoding="utf-8") as f:
        json.dump(LIVERIES, f, ensure_ascii=False, indent=1)
    grid = []
    grid.append("<h2>Boeing 737-800</h2><div class=\"grid\">")
    grid += [card("b737", l, 360) for l in LIVERIES["b737"]]
    grid.append("</div><h2>F-16C Fighting Falcon</h2><div class=\"grid\">")
    grid += [card("f16", l, 360) for l in LIVERIES["f16"]]
    grid.append("</div>")
    with open(os.path.join(assets, "liveries_preview.html"), "w", encoding="utf-8") as f:
        f.write(page("CONTRAIL liveries preview", "\n".join(grid)))
    zen = [l for l in LIVERIES["b737"] if l["id"] == "zenith"][0]
    cln = [l for l in LIVERIES["b737"] if l["id"] == "clean"][0]
    lv = LIVERIES["f16"][0]
    demo = [l for l in LIVERIES["f16"] if l["id"] == "demo-team"][0]
    body = "<div class=\"grid\" style=\"grid-template-columns:924px\">%s%s%s%s</div>" % (
        card("b737", zen, 900), card("b737", cln, 900), card("f16", lv, 900), card("f16", demo, 900))
    with open(os.path.join(assets, "liveries_check.html"), "w", encoding="utf-8") as f:
        f.write(page("CONTRAIL livery check", body))
    print("wrote", assets)

if __name__ == "__main__":
    main()
