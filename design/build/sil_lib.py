"""Helpers for hand-authored plan-view silhouettes (viewBox 0 0 240 200, centre line x=120).
All geometry is written by hand as left-half coordinates; the mirror is computed exactly."""
FILL = 'style="fill:var(--sil-fill,#10151C)"'
HEAD = ('<svg viewBox="0 0 240 200" width="100%" height="100%" fill="none" stroke="currentColor" '
        'stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">')

def fmt(v):
    s = f"{float(v):.1f}".rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s

def mx(x):
    return 240 - x

def cmd_str(c, mirror=False):
    op, nums = c[0], c[1:]
    pts = [(nums[i], nums[i + 1]) for i in range(0, len(nums), 2)]
    if mirror:
        pts = [(mx(x), y) for x, y in pts]
    return op + ' '.join(f"{fmt(x)} {fmt(y)}" for x, y in pts)

def sym_path(y0, cmds):
    """Closed path: starts at (120,y0), follows cmds down the LEFT half, then returns up the mirrored right half."""
    pts = [(120, y0)]
    out = [f"M120 {fmt(y0)}"]
    for c in cmds:
        out.append(cmd_str(c))
        pts.append((c[-2], c[-1]))
    end = pts[-1]
    if abs(end[0] - 120) > 1e-9:
        out.append(f"L{fmt(mx(end[0]))} {fmt(end[1])}")
    for i in range(len(cmds) - 1, -1, -1):
        c, start = cmds[i], pts[i]
        if c[0] == 'L':
            out.append(f"L{fmt(mx(start[0]))} {fmt(start[1])}")
        elif c[0] == 'C':
            x1, y1, x2, y2 = c[1:5]
            out.append(f"C{fmt(mx(x2))} {fmt(y2)} {fmt(mx(x1))} {fmt(y1)} {fmt(mx(start[0]))} {fmt(start[1])}")
        elif c[0] == 'Q':
            x1, y1 = c[1:3]
            out.append(f"Q{fmt(mx(x1))} {fmt(y1)} {fmt(mx(start[0]))} {fmt(start[1])}")
        else:
            raise ValueError(c)
    out.append('Z')
    return ' '.join(out)

def S(y0, *cmds, sw=None):
    """Symmetric filled closed shape."""
    extra = f' stroke-width="{sw}"' if sw else ''
    return f'<path d="{sym_path(y0, list(cmds))}" {FILL}{extra}></path>'

def abs_path(cmds, mirror=False):
    return ' '.join(cmd_str(c, mirror) for c in cmds) + ' Z'

def P(*cmds):
    """A closed filled shape on the left (cmds start with M) plus its exact mirror on the right."""
    return (f'<path d="{abs_path(list(cmds))}" {FILL}></path>'
            f'<path d="{abs_path(list(cmds), True)}" {FILL}></path>')

def line(x0, y0, x1, y1, sw=None):
    extra = f' stroke-width="{sw}"' if sw else ''
    return f'<path d="M{fmt(x0)} {fmt(y0)} L{fmt(x1)} {fmt(y1)}"{extra}></path>'

def line_pair(x0, y0, x1, y1, sw=None):
    return line(x0, y0, x1, y1, sw) + line(mx(x0), y0, mx(x1), y1, sw)

def fin(y0, y1):
    return line(120, y0, 120, y1)

def circ(cx, cy, r, filled=False, sw=None):
    extra = f' stroke-width="{sw}"' if sw else ''
    f = f' {FILL}' if filled else ''
    return f'<circle cx="{fmt(cx)}" cy="{fmt(cy)}" r="{fmt(r)}"{extra}{f}></circle>'

def disc(cx, cy, r, hub=3):
    """Propeller disc: thin outline circle (no fill) plus a filled hub/spinner dot."""
    return circ(cx, cy, r, sw=1.5) + circ(cx, cy, hub, filled=True)

def disc_pair(cx, cy, r, hub=3):
    return disc(cx, cy, r, hub) + disc(mx(cx), cy, r, hub)

def circ_pair(cx, cy, r, filled=False, sw=None):
    return circ(cx, cy, r, filled, sw) + circ(mx(cx), cy, r, filled, sw)

def rotor(cx, cy, r, blades=4, hub=5):
    """Thin disc circle, blades as lines from the hub (X layout for 4, sideways for 2), filled hub."""
    out = [circ(cx, cy, r, sw=1.5)]
    if blades == 4:
        d = r * 0.70710678
        for sx, sy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
            out.append(line(cx, cy, cx + sx * d, cy + sy * d))
    else:
        out.append(line(cx, cy, cx - r, cy))
        out.append(line(cx, cy, cx + r, cy))
    out.append(circ(cx, cy, hub, filled=True))
    return ''.join(out)

def svg(*parts):
    return HEAD + ''.join(parts) + '</svg>'
