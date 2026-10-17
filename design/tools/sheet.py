#!/usr/bin/env python3
"""Contact sheet: python3 -I tools/sheet.py out.png COLS THUMB_W img1.png img2.png ..."""
import sys
from PIL import Image, ImageDraw
out, cols, tw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
paths = sys.argv[4:]
ims = [Image.open(p).convert('RGB') for p in paths]
th = int(tw * ims[0].height / ims[0].width)
rows = (len(ims) + cols - 1) // cols
pad, label = 16, 22
sheet = Image.new('RGB', (cols * (tw + pad) + pad, rows * (th + pad + label) + pad), (40, 44, 52))
d = ImageDraw.Draw(sheet)
for i, (p, im) in enumerate(zip(paths, ims)):
    r, c = divmod(i, cols)
    x, y = pad + c * (tw + pad), pad + r * (th + pad + label)
    d.text((x, y + 2), p.split('/')[-1], fill=(230, 235, 240))
    sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + label))
sheet.save(out)
print(out)
