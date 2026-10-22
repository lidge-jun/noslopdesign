#!/usr/bin/env bash
# Full-page screenshots: measure document height at each width, then capture at that height.
set -euo pipefail
dir="$(cd "$(dirname "$0")" && pwd)"
url="file://$dir/index.html"
mkdir -p "$dir/shots"
for w in 390 768 1440; do
  h=$(/snap/bin/chromium --headless --disable-gpu --hide-scrollbars --window-size=$w,900 --virtual-time-budget=2000 --dump-dom "$url" 2>/dev/null | grep -o 'data-ready="[0-9]*"' | grep -o '[0-9]*')
  /snap/bin/chromium --headless --disable-gpu --hide-scrollbars --window-size=$w,$h --virtual-time-budget=2000 --screenshot="$dir/shots/$w.png" "$url" 2>/dev/null
  echo "$w x $h"
done
