#!/usr/bin/env python3
"""Assemble CONTRAIL icons.json + icons_preview.html from hand-authored parts.
usage: python3 -I tools/build_icons.py
"""
import json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import icons_part1, icons_part2, icons_part3, icons_part4  # noqa: E402

REQUIRED = """home hangar plane plane-takeoff plane-landing map globe compass route pin sliders cog gamepad
joystick monitor speaker keyboard mouse cloud cloud-rain cloud-snow cloud-lightning wind sun moon sunrise
thermometer gauge clock calendar fuel weight scale paint palette layers camera headset radio checklist wrench
warning info search filter grid list star star-filled check x plus minus chevron-down chevron-up chevron-left
chevron-right arrow-right arrow-left arrow-up arrow-down play pause replay record users user trophy graduation
flag lock unlock download upload save undo redo eye eye-off rotate crosshair target menu more-horizontal external
bookmark bell shield zap link copy trash edit maximize volume mic power refresh history tower runway helicopter
snowflake droplet eyedropper swap sort tag image film pen hand cursor parachute anchor medal book lightbulb wifi
battery bolt-off""".split()


def f(v):
    """Format a coordinate: at most 2 decimals, no trailing zeros."""
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def pt(x, y):
    return f"{f(x)} {f(y)}"


def rot(x, y, deg, cx=0.0, cy=0.0):
    a = math.radians(deg)
    dx, dy = x - cx, y - cy
    return (cx + dx * math.cos(a) - dy * math.sin(a), cy + dx * math.sin(a) + dy * math.cos(a))


def polygon(points, extra=""):
    return '<polygon points="' + " ".join(pt(x, y) for x, y in points) + f'"{extra}></polygon>'


def path_closed(points):
    return '<path d="M' + " L".join(pt(x, y) for x, y in points) + 'z"></path>'


# --- star: 5 points, outer r 9.5, inner r 4.2, centred slightly below middle so it sits optically ---
def star_points():
    cx, cy, R, r = 12, 12.75, 9.5, 4.2
    pts = []
    for i in range(10):
        ang = math.radians(-90 + i * 36)
        rad = R if i % 2 == 0 else r
        pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
    return pts


# --- cog: 8 trapezoid teeth on a ring, inner bore circle ---
def cog_markup():
    cx, cy = 12, 12
    tip_r, root_r = 9.75, 7.0
    tip_half, root_half = 7.5, 11.5  # degrees
    pts = []
    for i in range(8):
        t = -90 + i * 45  # a tooth straight up
        for ang, rad in ((t - root_half, root_r), (t - tip_half, tip_r), (t + tip_half, tip_r), (t + root_half, root_r)):
            a = math.radians(ang)
            pts.append((cx + rad * math.cos(a), cy + rad * math.sin(a)))
    return path_closed(pts) + '<circle cx="12" cy="12" r="3"></circle>'


# --- snowflake: 3 full-length spokes through the centre + a V branch near each of the 6 tips ---
def snowflake_markup():
    cx, cy = 12, 12
    out = []
    for k in range(3):
        a = k * 60
        x1, y1 = rot(12, 2.5, a, cx, cy)
        x2, y2 = rot(12, 21.5, a, cx, cy)
        out.append(f'<path d="M{pt(x1, y1)} L{pt(x2, y2)}"></path>')
    branch = [(9.75, 4.25), (12, 5.5), (14.25, 4.25)]  # V open toward the tip, on the top spoke
    for k in range(6):
        a = k * 60
        p = [rot(x, y, a, cx, cy) for x, y in branch]
        out.append('<path d="M' + " L".join(pt(x, y) for x, y in p) + '"></path>')
    return "".join(out)


# --- 3/4-view aircraft silhouette (nose to +x, tail at x=0, +y toward the viewer),
#     tilted nose-up for takeoff and nose-down for landing, over a ground line ---
AIRCRAFT = [
    (17, 0), (15.5, -1.5), (3.5, -1.5), (2, -4.5), (0.5, -4.5), (0, -1.5), (0, 1.5),
    (5, 1.5), (3.5, 6), (6, 6), (10, 1.5), (15.5, 1.5),
]


def tilted_aircraft(deg, cx=11.5, cy=11.5):
    pts = []
    for x, y in AIRCRAFT:
        rx, ry = rot(x - 8.5, y, deg)
        pts.append((rx + cx, ry + cy))
    return pts


def takeoff_markup():
    return path_closed(tilted_aircraft(-24)) + '<path d="M2.5 21.5h19"></path>'


def landing_markup():
    return path_closed(tilted_aircraft(24)) + '<path d="M2.5 21.5h19"></path>'


# --- mark: solid delta pointing upper-right + two contrails of different length ---
def mark_markup(shift=(-0.4, 2.6)):
    d = (math.sqrt(0.5), -math.sqrt(0.5))   # direction of flight (upper-right)
    p = (math.sqrt(0.5), math.sqrt(0.5))    # lateral (lower-right)
    tip = (24.0, 4.0)
    L, W, N = 9.0, 6.0, 4.5                 # delta length, half-span, notch depth

    def at(lon, lat):
        return (tip[0] + lon * d[0] + lat * p[0] + shift[0], tip[1] + lon * d[1] + lat * p[1] + shift[1])

    delta = [at(0, 0), at(-L, W), at(-N, 0), at(-L, -W)]
    lat_c, gap = 4.5, 2.0                   # contrails trail the wingtips
    lon_start = -L - gap
    up = (at(lon_start, -lat_c), at(-23.0, -lat_c))
    lo = (at(lon_start, lat_c), at(-17.0, lat_c))
    out = polygon(delta, ' fill="currentColor" stroke-linejoin="miter"')
    for a, b in (up, lo):
        out += f'<path d="M{pt(*a)} L{pt(*b)}"></path>'
    return out


def build():
    icons = {}
    for mod in (icons_part1, icons_part2, icons_part3, icons_part4):
        icons.update(mod.ICONS)
    star = star_points()
    icons["star"] = polygon(star)
    icons["star-filled"] = polygon(star, ' fill="currentColor"')
    icons["cog"] = cog_markup()
    icons["snowflake"] = snowflake_markup()
    icons["plane-takeoff"] = takeoff_markup()
    icons["plane-landing"] = landing_markup()
    icons["mark"] = mark_markup()

    missing = [n for n in REQUIRED if n not in icons]
    extra = [n for n in icons if n not in REQUIRED and n != "mark"]
    if missing:
        sys.exit(f"missing icons: {missing}")
    if extra:
        print("note: extra icons not in the brief:", extra)
    # validation
    for name, m in icons.items():
        if "__" in m:
            sys.exit(f"{name}: unresolved placeholder")
        if "/>" in m:
            sys.exit(f"{name}: self-closing tag")
        if re.search(r"\s[\w:-]+=(?![\"'])", m):
            sys.exit(f"{name}: unquoted attribute")
        if "<text" in m or "data:" in m:
            sys.exit(f"{name}: forbidden content")
        opens = re.findall(r"<([a-z]+)\b", m)
        closes = re.findall(r"</([a-z]+)>", m)
        if opens != closes:
            sys.exit(f"{name}: open/close mismatch {opens} vs {closes}")
        if re.search(r"[^\x00-\x7f]", m):
            sys.exit(f"{name}: non-ascii character")
    ordered = {n: icons[n] for n in REQUIRED}
    ordered["mark"] = icons["mark"]
    os.makedirs(os.path.join(ROOT, "assets"), exist_ok=True)
    with open(os.path.join(ROOT, "assets", "icons.json"), "w", encoding="utf-8") as fh:
        json.dump(ordered, fh, indent=1)
        fh.write("\n")
    return ordered


def svg(inner, size, color, vb=24, sw=1.75):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 {vb} {vb}" fill="none" stroke="currentColor" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" '
            f'style="color:{color}">{inner}</svg>')


HEAD = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>CONTRAIL icons</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&display=swap">
<style>
body{margin:0;background:#0A0D12;color:#E6EBF0;font-family:Barlow,'Helvetica Neue',Arial,sans-serif;padding:32px 40px 48px}
h2{font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#7B8999;margin:0 0 8px;padding-bottom:8px;border-bottom:1px solid #27313D}
.grid{display:grid;grid-template-columns:repeat(10,1fr);gap:0 16px;margin-bottom:32px}
.cell{display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 0 10px}
.cell span{font-size:13px;color:#7B8999;line-height:1.2}
.cell.s span{font-size:11px}
svg{display:block}
.lockup{display:flex;align-items:center;gap:0 0;margin:4px 0 28px}
.word{font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#E6EBF0;line-height:1}
.row{display:flex;align-items:flex-end;gap:64px}
</style></head><body>
"""


def preview(icons):
    names = [n for n in icons if n != "mark"]
    parts = [HEAD, f"<h2>{len(names)} icons at 24 px</h2>", '<div class="grid">']
    for n in names:
        parts.append(f'<div class="cell">{svg(icons[n], 24, "#E6EBF0")}<span>{n}</span></div>')
    parts.append('</div><h2>Same set at 18 px</h2><div class="grid">')
    for n in names:
        parts.append(f'<div class="cell s">{svg(icons[n], 18, "#A3AFBC")}<span>{n}</span></div>')
    parts.append('</div><h2>Wordmark</h2><div class="row">')
    for msize, wsize, gap in ((28, 26, 10), (84, 78, 24)):
        parts.append(f'<div class="lockup" style="gap:{gap}px">{svg(icons["mark"], msize, "#E6EBF0", 28, 2)}'
                     f'<div class="word" style="font-size:{wsize}px">CONTRAIL</div></div>')
    parts.append('</div></body></html>\n')
    with open(os.path.join(ROOT, "assets", "icons_preview.html"), "w", encoding="utf-8") as fh:
        fh.write("".join(parts))


ZOOM_CSS = """<style>
body{margin:0;background:#0A0D12;color:#E6EBF0;font-family:Menlo,monospace;padding:16px 24px}
.z{display:grid;grid-template-columns:repeat(8,1fr);gap:8px 12px}
.c{display:flex;flex-direction:column;align-items:center;gap:4px;padding:4px 0}
.c span{font-size:11px;color:#7B8999}
.b{position:relative;width:120px;height:120px;background-image:linear-gradient(#1E2733 1px,transparent 1px),linear-gradient(90deg,#1E2733 1px,transparent 1px);background-size:5px 5px;outline:1px solid #394655}
.b.m{background-size:4.2857px 4.2857px}
.b svg{position:absolute;left:0;top:0}
.b i{position:absolute;left:10px;top:10px;width:100px;height:100px;outline:1px dashed #57C7DB;opacity:.5}
</style>"""


def zoom(icons, per=40):
    names = list(icons)
    for i in range(0, len(names), per):
        parts = [f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>zoom</title>{ZOOM_CSS}</head><body><div class="z">']
        for n in names[i:i + per]:
            if n == "mark":
                parts.append(f'<div class="c"><div class="b m">{svg(icons[n], 120, "#E6EBF0", 28, 2)}</div><span>{n}</span></div>')
            else:
                parts.append(f'<div class="c"><div class="b"><i></i>{svg(icons[n], 120, "#E6EBF0")}</div><span>{n}</span></div>')
        parts.append('</div></body></html>\n')
        with open(os.path.join(ROOT, "render", f"zoom{i // per + 1}.html"), "w", encoding="utf-8") as fh:
            fh.write("".join(parts))


if __name__ == "__main__":
    icons = build()
    preview(icons)
    zoom(icons)
    print(f"wrote {len(icons)} entries (incl. mark)")
