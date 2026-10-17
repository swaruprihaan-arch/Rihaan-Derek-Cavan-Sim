#!/usr/bin/env python3
"""crop.py - zoom into a region of a render for close inspection.
usage: python3 -I tools/crop.py render/Foo.png X Y W H [scale=2] -> render/Foo_crop_X_Y.png"""
import sys
from PIL import Image
p, x, y, w, h = sys.argv[1], *map(int, sys.argv[2:6])
sc = float(sys.argv[6]) if len(sys.argv) > 6 else 2.0
im = Image.open(p).crop((x, y, x + w, y + h))
im = im.resize((int(w * sc), int(h * sc)), Image.LANCZOS)
out = p.rsplit('.', 1)[0] + f'_crop_{x}_{y}.png'
im.save(out); print(out)
