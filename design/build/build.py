#!/usr/bin/env python3
"""Assemble assets/silhouettes.json and the two preview pages from the hand-authored definitions."""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
ROOT = os.path.dirname(HERE)
from sil_defs_a import A
from sil_defs_b import B

ORDER = ['narrowbody', 'narrowbody-small', 'widebody', 'jumbo', 'turboprop-regional', 'bizjet', 'single-turboprop',
         'fighter-single', 'fighter-twin', 'fighter-stealth', 'canard-delta', 'attack', 'trainer', 'transport', 'bomber',
         'ga-high', 'ga-low', 'ga-twin', 'aerobatic', 'bush-floats', 'bush', 'amphibian', 'heli', 'heli-light', 'heli-mil',
         'glider', 'warbird-elliptical', 'warbird', 'vintage-airliner']
ALL = {**A, **B}
out = {k: ALL[k] for k in ORDER}
missing = [k for k in ORDER if k not in ALL]
assert not missing, missing

# hard-rule checks
for k, s in out.items():
    assert '/>' not in s, (k, 'self-closing tag')
    assert 'data:' not in s and '<text' not in s, k
    for t in re.findall(r'<[a-zA-Z][^<>]*>', s):
        assert not re.search(r'\s[\w:-]+=(?!")', t), (k, t)
    opens = re.findall(r'<(path|circle|svg)\b', s); closes = re.findall(r'</(path|circle|svg)>', s)
    assert sorted(opens) == sorted(closes), (k, len(opens), len(closes))
    for m in re.finditer(r'-?\d+(?:\.\d+)?', s):
        pass

os.makedirs(os.path.join(ROOT, 'assets'), exist_ok=True)
with open(os.path.join(ROOT, 'assets', 'silhouettes.json'), 'w', encoding='utf-8') as f:
    json.dump(out, f, indent=1, ensure_ascii=True)

def page(title, size, cols, outname, label_px=13):
    cw, ch = size
    cards = ''.join(
        f'<figure class="c"><div class="w" style="width:{cw}px;height:{ch}px">{out[k]}</div>'
        f'<figcaption>{k}</figcaption></figure>' for k in ORDER)
    html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&display=swap">
<style>
body{{margin:0;background:#0A0D12;font-family:Barlow,'Helvetica Neue',Arial,sans-serif;color:#E6EBF0;padding:24px 40px}}
h1{{font:600 18px/1.2 Barlow,sans-serif;letter-spacing:.04em;text-transform:uppercase;margin:0 0 20px;color:#A3AFBC}}
.g{{display:grid;grid-template-columns:repeat({cols},{cw}px);gap:24px;justify-content:start}}
.c{{margin:0;width:{cw}px}}
.w{{background:#10151C;border:1px solid #27313D;border-radius:6px;box-sizing:border-box;color:#57C7DB;--sil-fill:#10151C}}
.w svg{{display:block}}
figcaption{{color:#A3AFBC;font-size:{label_px}px;line-height:1.4;margin-top:6px;text-align:center}}
</style></head><body><h1>{title}</h1><div class="g">{cards}</div></body></html>'''
    with open(os.path.join(ROOT, 'assets', outname), 'w', encoding='utf-8') as f:
        f.write(html)

page('CONTRAIL silhouettes - 240 x 200', (240, 200), 6, 'silhouettes_preview.html')
page('CONTRAIL silhouettes - hangar card 96 px', (96, 80), 10, 'silhouettes_preview_small.html', label_px=11)
print('wrote', len(out), 'silhouettes')
