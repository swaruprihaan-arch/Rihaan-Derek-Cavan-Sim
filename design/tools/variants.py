#!/usr/bin/env python3
"""Side-by-side design variants for the harder icons. Writes render/variants.html."""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build_icons as B  # noqa: E402

ROOT = B.ROOT


def rot_poly(local, deg, cx, cy):
    """local points are relative to (0,0); rotate by deg and translate to (cx,cy)."""
    out = []
    for x, y in local:
        rx, ry = B.rot(x, y, deg)
        out.append((rx + cx, ry + cy))
    return out


# 3/4-view aircraft silhouette, nose to +x, tail at x=0; y+ is "toward the viewer" (down on screen)
AIRCRAFT = [
    (17, 0), (15.5, -1.5), (3.5, -1.5), (2, -4.5), (0.5, -4.5), (0, -1.5), (0, 1.5),
    (5, 1.5), (3.5, 6), (6, 6), (10, 1.5), (15.5, 1.5),
]


def takeoff_a(deg=-24, scale=1.0, cx=11.5, cy=11.5):
    pts = [(x * scale - 8.5 * scale, y * scale) for x, y in AIRCRAFT]  # centre fuselage on x
    pts = rot_poly(pts, deg, cx, cy)
    return B.path_closed(pts) + '<path d="M2.5 21.5h19"></path>'


def landing_a(deg=24, scale=1.0, cx=11.5, cy=11.5):
    pts = [(x * scale - 8.5 * scale, y * scale) for x, y in AIRCRAFT]
    pts = rot_poly(pts, deg, cx, cy)
    return B.path_closed(pts) + '<path d="M2.5 21.5h19"></path>'


def cog8():
    cx, cy = 12, 12
    tip_r, root_r = 9.75, 7.0
    tip_half, root_half = 7.5, 11.5
    pts = []
    for i in range(8):
        t = -90 + i * 45
        for ang, rad in ((t - root_half, root_r), (t - tip_half, tip_r), (t + tip_half, tip_r), (t + root_half, root_r)):
            a = math.radians(ang)
            pts.append((cx + rad * math.cos(a), cy + rad * math.sin(a)))
    return B.path_closed(pts) + '<circle cx="12" cy="12" r="3"></circle>'


TOWER_B = (
    '<path d="M12 2.5v2"></path>'
    '<path d="M4.5 4.5h15v2l-2 3.5h-11l-2-3.5z"></path>'
    '<path d="M9.5 10v11.5"></path><path d="M14.5 10v11.5"></path>'
    '<path d="M5.5 21.5h13"></path>'
)
TOWER_C = (
    '<path d="M12 2.5v2"></path>'
    '<path d="M5 4.5h14v2.5l-2 3h-10l-2-3z"></path>'
    '<path d="m9.5 10-.75 11.5"></path><path d="m14.5 10 .75 11.5"></path>'
    '<path d="M5 21.5h14"></path>'
    '<path d="M7 7h10"></path>'
)
BOLT_OFF_B = (
    '<path d="M9.45 7.2 13.5 2.5l-1 8H20l-3.36 3.88"></path>'
    '<path d="M7.35 9.62 4 13.5h7.5l-1 8 4.05-4.69"></path>'
    '<path d="m4 4 16 16"></path>'
)
HELI_B = (
    '<path d="M2.5 4h19"></path>'
    '<path d="M12 4v3"></path>'
    '<path d="M8 7h3.5c3.3 0 6 2.3 6 5v2.5a1.5 1.5 0 0 1-1.5 1.5H7A3.5 3.5 0 0 1 3.5 12.5v-1A4.5 4.5 0 0 1 8 7z"></path>'
    '<path d="M17.5 11.5h4"></path><path d="M21.5 13.5V9"></path>'
    '<path d="M6.5 19.5h10"></path><path d="M9 16v3.5"></path><path d="M14 16v3.5"></path>'
)


def mark_v(L, W, N, lat, long_end, short_end, long_on_upper, shift, fill=False, gap=2.0):
    d = (math.sqrt(0.5), -math.sqrt(0.5))
    p = (math.sqrt(0.5), math.sqrt(0.5))
    tip = (24.0, 4.0)

    def at(lon, la):
        return (tip[0] + lon * d[0] + la * p[0] + shift[0], tip[1] + lon * d[1] + la * p[1] + shift[1])

    delta = [at(0, 0), at(-L, W), at(-N, 0), at(-L, -W)]
    lon_start = -(N + (lat / W) * (L - N)) - gap
    up = (at(lon_start, -lat), at(long_end if long_on_upper else short_end, -lat))
    lo = (at(lon_start, lat), at(short_end if long_on_upper else long_end, lat))
    extra = ' stroke-linejoin="miter"' + (' fill="currentColor"' if fill else '')
    out = B.polygon(delta, extra)
    for a, b in (up, lo):
        out += f'<path d="M{B.pt(*a)} L{B.pt(*b)}"></path>'
    return out


VARIANTS = [
    ("takeoff A -24", takeoff_a()),
    ("takeoff A -30 s.95", takeoff_a(-30, 0.95)),
    ("landing A", landing_a()),
    ("landing A 30 s.95", landing_a(30, 0.95)),
    ("cog 6 (cur)", B.cog_markup()),
    ("cog 8", cog8()),
    ("tower cur", B.icons_part2.ICONS["tower"]),
    ("tower B", TOWER_B),
    ("tower C", TOWER_C),
    ("bolt-off B", BOLT_OFF_B),
    ("heli cur", B.icons_part2.ICONS["helicopter"]),
    ("heli B", HELI_B),
]
MARKS = [
    ("mark cur", B.mark_markup()),
    ("mark wide stroke", mark_v(9, 6, 5, 4.5, -22, -15, True, (-0.5, 2.5))),
    ("mark wide filled", mark_v(9, 6, 5, 4.5, -22, -15, True, (-0.5, 2.5), fill=True)),
    ("mark wide filled lower-long", mark_v(9, 6, 5, 4.5, -22, -15, False, (-0.5, 2.5), fill=True)),
    ("mark L10 W5.5 filled", mark_v(10, 5.5, 5.5, 4.0, -23, -16, True, (-0.75, 2.5), fill=True)),
    ("mark L10 W5.5 stroke", mark_v(10, 5.5, 5.5, 4.0, -23, -16, True, (-0.75, 2.5))),
]

parts = [f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>variants</title>{B.ZOOM_CSS}'
         '<style>.small{display:flex;gap:12px;align-items:center;margin:6px 0 0}.small svg{display:block}</style></head><body><div class="z">']
for label, m in VARIANTS:
    parts.append(f'<div class="c"><div class="b"><i></i>{B.svg(m, 120, "#E6EBF0")}</div>'
                 f'<div class="small">{B.svg(m, 24, "#E6EBF0")}{B.svg(m, 18, "#A3AFBC")}</div><span>{label}</span></div>')
for label, m in MARKS:
    parts.append(f'<div class="c"><div class="b m">{B.svg(m, 120, "#E6EBF0", 28, 2)}</div>'
                 f'<div class="small">{B.svg(m, 28, "#E6EBF0", 28, 2)}{B.svg(m, 84, "#E6EBF0", 28, 2)}</div><span>{label}</span></div>')
parts.append('</div></body></html>\n')
with open(os.path.join(ROOT, "render", "variants.html"), "w", encoding="utf-8") as fh:
    fh.write("".join(parts))
print("ok")
