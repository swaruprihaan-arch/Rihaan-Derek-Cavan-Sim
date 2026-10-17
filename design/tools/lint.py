#!/usr/bin/env python3
"""lint.py - validate CONTRAIL .dc.html artboards against the Design-canvas format rules.
usage: python3 -I tools/lint.py project/Foo.dc.html [more files...] [--w 1600 --h 900]
Exit status 1 if any file has ERRORs. Warnings are advisory but should be fixed when cheap."""
import sys, re, json, html as htmlmod
from html.parser import HTMLParser

VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
EMOJI = re.compile('[\U0001F000-\U0001FAFF☀-➿⬀-⯿️]')

def lint(path, W, H):
    errors, warns = [], []
    E, Wn = errors.append, warns.append
    src = open(path, encoding='utf-8').read()
    lines = src.split('\n')
    if '<script src="./support.js"></script>' not in src: E('missing exact head line <script src="./support.js"></script>')
    if not re.search(r'<!doctype html>', src, re.I): E('missing <!doctype html>')
    if not re.search(r'<html\s+lang="', src): E('missing <html lang="...">')
    if not re.search(r'<meta charset="utf-8">', src, re.I): E('missing <meta charset="utf-8">')
    m = re.search(r'<title>(.*?)</title>', src, re.S)
    if not m or not m.group(1).strip(): E('missing/empty <title>')
    if src.count('<x-dc>') != 1: E('expected exactly one <x-dc>')
    if '<helmet>' not in src: E('missing <helmet>')
    if 'fonts.googleapis.com/css2' not in src: E('missing Google Fonts css2 <link> in helmet')
    for mm in re.finditer(r'https?://[^\s"\'<>)]+', src):
        u = mm.group(0)
        if not (u.startswith('https://fonts.googleapis.com') or u.startswith('https://fonts.gstatic.com') or u.startswith('http://www.w3.org/')):
            E(f'external URL not allowed: {u}')
    if re.search(r'["\'(]\s*data:', src): E('data: URI found (not allowed)')
    if '{{' in src: E('template hole {{...}} found - static artboards must have none')
    if re.search(r'lorem', src, re.I): E('lorem ipsum found')
    for mm in re.finditer(r'@@[A-Za-z]+[^@\n]*@@', src): E(f'line {src[:mm.start()].count(chr(10)) + 1}: unresolved asset token {mm.group(0)} - run tools/inject.py')
    for i, ln in enumerate(lines, 1):
        if EMOJI.search(ln): E(f'line {i}: emoji character found')
        if re.search(r'\son[a-z]+\s*=', ln, re.I): E(f'line {i}: inline event handler attribute (static design: none allowed)')
        if re.search(r'<(iframe|object|embed)\b', ln, re.I): E(f'line {i}: <iframe>/<object>/<embed> not allowed')
        if re.search(r'position\s*:\s*fixed', ln): Wn(f'line {i}: position:fixed (use absolute inside the root instead)')
        if re.search(r'\d(vh|vw)\b', ln): Wn(f'line {i}: vh/vw unit (avoid in a fixed artboard)')
        if re.search(r'<(div|span)\b[^>]*\srole=', ln): E(f'line {i}: role attribute on <div>/<span> (use a real element)')
        if re.search(r'<(div|span)\b[^>]*\stabindex=', ln): E(f'line {i}: tabindex on <div>/<span> (use a real element)')
    for mm in re.finditer(r'<([a-zA-Z][\w:-]*)\b[^<>]*?/>', src):
        tag = mm.group(1).lower()
        if tag not in VOID:
            E(f'line {src[:mm.start()].count(chr(10)) + 1}: self-closing <{tag} .../> - write <{tag} ...></{tag}>')
    for mm in re.finditer(r'<[a-zA-Z][^<>]*>', src):
        t = mm.group(0)
        if re.search(r'\s[\w:-]+=(?!["\'])[^\s>]', t):
            E(f'line {src[:mm.start()].count(chr(10)) + 1}: unquoted attribute value in {t[:70]}')
    mm = re.search(r'<script\s+type="text/x-dc"\s+data-dc-script\s+data-props=\'(.*?)\'\s*>(.*?)</script>', src, re.S)
    if not mm:
        E('missing <script type="text/x-dc" data-dc-script data-props=\'...\'> block (data-props must be single-quoted)')
    else:
        try:
            props = json.loads(htmlmod.unescape(mm.group(1)))
            pv = props.get('$preview', {})
            if pv.get('width') != W or pv.get('height') != H: E(f'$preview must be {W}x{H}, got {pv}')
            extra = [k for k in props if k != '$preview']
            if extra: Wn(f'data-props declares tweak props {extra} - the spec says none')
        except Exception as ex:
            E(f'data-props is not valid JSON: {ex}')
        if 'class Component extends DCLogic' not in mm.group(2): E('logic class must be `class Component extends DCLogic`')
        if not re.search(r'renderVals\s*\(\s*\)\s*\{\s*return\s*\{\s*\}\s*;?\s*\}', mm.group(2)): Wn('renderVals() should `return {}`')

    class P(HTMLParser):
        def __init__(s):
            super().__init__(convert_charrefs=False); s.stack = []; s.root = None; s.in_xdc = False
        def handle_starttag(s, tag, attrs):
            if tag in VOID: s.check(tag, attrs); return
            s.stack.append((tag, s.getpos()[0])); s.check(tag, attrs)
            if tag == 'x-dc': s.in_xdc = True
            elif s.in_xdc and s.root is None and tag != 'helmet' and len(s.stack) >= 2 and s.stack[-2][0] == 'x-dc':
                s.root = (tag, dict(attrs), s.getpos()[0])
        def handle_startendtag(s, tag, attrs):
            if tag in VOID: s.check(tag, attrs)
        def handle_endtag(s, tag):
            if tag in VOID: return
            if not s.stack: E(f'line {s.getpos()[0]}: stray </{tag}>'); return
            if s.stack[-1][0] != tag:
                names = [t for t, _ in s.stack]
                if tag in names:
                    while s.stack and s.stack[-1][0] != tag:
                        t, l = s.stack.pop(); E(f'line {s.getpos()[0]}: </{tag}> closes while <{t}> (opened line {l}) is still open')
                    s.stack.pop()
                else:
                    E(f'line {s.getpos()[0]}: unexpected </{tag}> (not open)')
            else:
                s.stack.pop()
        def check(s, tag, attrs):
            d = dict(attrs); ln = s.getpos()[0]
            if tag == 'button' and d.get('type') != 'button': Wn(f'line {ln}: <button> without type="button"')
            if tag == 'img' and 'alt' not in d: E(f'line {ln}: <img> without alt')
            if tag == 'svg' and 'aria-hidden' not in d and d.get('role') != 'img': Wn(f'line {ln}: <svg> needs aria-hidden="true" (decor) or role="img" aria-label="..."')
            if tag == 'svg' and d.get('role') == 'img' and not d.get('aria-label'): E(f'line {ln}: <svg role="img"> without aria-label')
            if tag == 'input' and d.get('type') != 'hidden' and not (d.get('aria-label') or d.get('id') or d.get('aria-labelledby')) and not any(t == 'label' for t, _ in s.stack): Wn(f'line {ln}: <input> without aria-label or id (pair with a <label for> or wrap it in a <label>)')
            if tag == 'a' and 'href' not in d: E(f'line {ln}: <a> without href')
            if tag == 'button' and d.get('role') not in (None, 'switch', 'tab', 'radio', 'checkbox', 'menuitem'): Wn(f'line {ln}: unusual role on <button>: {d.get("role")}')
            if tag == 'button' and d.get('role') == 'switch' and d.get('aria-checked') not in ('true', 'false'): E(f'line {ln}: role="switch" needs aria-checked="true|false"')
            if tag == 'dc-import' or tag == 'sc-for' or tag == 'sc-if': E(f'line {ln}: <{tag}> not allowed in a static artboard')
    p = P(); p.feed(src); p.close()
    for t, l in p.stack:
        E(f'<{t}> opened at line {l} is never closed')
    if p.root is None:
        E('no root element inside <x-dc> after <helmet>')
    else:
        st = p.root[1].get('style', '')
        if not re.search(rf'width\s*:\s*{W}px', st) or not re.search(rf'height\s*:\s*{H}px', st): E(f'root <{p.root[0]}> (line {p.root[2]}) must have inline width:{W}px;height:{H}px')
        if 'font-family' not in st: E(f'root <{p.root[0]}> must set font-family inline')
        if 'overflow' not in st: Wn('root should set overflow:hidden')
    return errors, warns

if __name__ == '__main__':
    args = sys.argv[1:]; W, H = 1600, 900
    if '--w' in args: W = int(args[args.index('--w') + 1]); del args[args.index('--w'):args.index('--w') + 2]
    if '--h' in args: H = int(args[args.index('--h') + 1]); del args[args.index('--h'):args.index('--h') + 2]
    bad = 0
    for f in args:
        errs, warns = lint(f, W, H)
        print(f'== {f}: {len(errs)} error(s), {len(warns)} warning(s)')
        for e in errs: print('  ERROR  ' + e)
        for w in warns: print('  warn   ' + w)
        bad += bool(errs)
    sys.exit(1 if bad else 0)
