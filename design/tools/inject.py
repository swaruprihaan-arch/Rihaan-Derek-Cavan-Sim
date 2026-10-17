#!/usr/bin/env python3
"""inject.py - replace asset tokens in .dc.html files with the real SVG markup from assets/*.json.
usage: python3 -I tools/inject.py project/Foo.dc.html [more files]
Tokens:
  @@ICON:name@@ or @@ICON:name:SIZE@@   -> full 24-grid stroke icon <svg> (default size 20)
  @@MARK@@ or @@MARK:SIZE@@             -> the CONTRAIL wordmark glyph (28-grid, default size 28)
  @@SIL:key@@                           -> full top-down silhouette <svg> (width/height 100%; size it with the wrapper)
  @@PROFILE:b737@@ / @@PROFILE:f16@@    -> full side-profile <svg> (width/height 100%; set --c-* vars on the wrapper)
Idempotent: tokens that were already replaced are gone; re-run after adding new tokens. Unknown names are left in place and reported."""
import sys, json, re, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
icons = json.load(open(f'{ROOT}/assets/icons.json', encoding='utf-8'))
sils = json.load(open(f'{ROOT}/assets/silhouettes.json', encoding='utf-8'))
profs = json.load(open(f'{ROOT}/assets/profiles.json', encoding='utf-8'))

def icon(name, size):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{icons[name]}</svg>')

def mark(size):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{icons["mark"]}</svg>')

for path in sys.argv[1:]:
    s = open(path, encoding='utf-8').read()
    missing = []
    def rep_icon(m):
        name, size = m.group(1), m.group(2) or '20'
        if name not in icons: missing.append('icon:' + name); return m.group(0)
        return icon(name, size)
    def rep_sil(m):
        k = m.group(1)
        if k not in sils: missing.append('sil:' + k); return m.group(0)
        return sils[k]
    def rep_prof(m):
        k = m.group(1)
        if k not in profs: missing.append('profile:' + k); return m.group(0)
        return profs[k]
    s = re.sub(r'@@ICON:([a-z0-9-]+)(?::(\d+))?@@', rep_icon, s)
    s = re.sub(r'@@MARK(?::(\d+))?@@', lambda m: mark(m.group(1) or '28'), s)
    s = re.sub(r'@@SIL:([a-z0-9-]+)@@', rep_sil, s)
    s = re.sub(r'@@PROFILE:([a-z0-9-]+)@@', rep_prof, s)
    open(path, 'w', encoding='utf-8').write(s)
    left = re.findall(r'@@[A-Za-z]+[^@]*@@', s)
    print(f'{path}: injected. missing={missing} unresolved={left}')
    print('available icons: ' + ', '.join(sorted(icons))) if missing else None
