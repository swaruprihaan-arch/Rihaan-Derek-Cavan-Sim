#!/bin/zsh
# usage: tools/crop.sh <png> <x> <y> <w> <h> [scale] [name]
# Renders a region of a PNG (optionally magnified with nearest-neighbour) into render/<name>.png
set -e
ROOT="${0:A:h:h}"
PNG="${1:A}"; X="$2"; Y="$3"; W="$4"; H="$5"; S="${6:-1}"; NAME="${7:-crop}"
TMPHTML="$ROOT/render/$NAME.html"
cat > "$TMPHTML" <<EOF
<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;background:#0A0D12;overflow:hidden}
#v{position:relative;width:$((W*S))px;height:$((H*S))px;overflow:hidden}
#v img{position:absolute;left:$((-X*S))px;top:$((-Y*S))px;transform-origin:0 0;transform:scale($S);image-rendering:pixelated}
</style></head><body><div id="v"><img src="file://$PNG"></div></body></html>
EOF
"$ROOT/tools/render.sh" "$TMPHTML" $((W*S)) $((H*S))
