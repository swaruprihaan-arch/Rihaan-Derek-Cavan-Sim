#!/bin/zsh
# usage: tools/render.sh <path/to/Name.dc.html or any .html> [width height]
# Screenshots the file with headless Chrome at the given size (default 1600x900)
# and writes render/<Name>.png (next to tools/). Prints the PNG path.
set -e
ROOT="${0:A:h:h}"
IN="$1"; W="${2:-1600}"; H="${3:-900}"
STEM="${${IN:t}%%.*}"
OUT="$ROOT/render/$STEM.png"
mkdir -p "$ROOT/render"
TMP=$(mktemp -d)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --no-first-run --user-data-dir="$TMP" --window-size=${W},${H} --virtual-time-budget=8000 --screenshot="$OUT" "file://${IN:A}" >/dev/null 2>&1 || true
rm -rf "$TMP"
if [[ -s "$OUT" ]]; then echo "$OUT"; else echo "render failed for $IN" >&2; exit 1; fi
