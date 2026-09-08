#!/usr/bin/env bash
# ============================================================================
# OneSpace — download and self-host the brand typefaces.
#
#   cd ~/frappe-bench/apps/onespace && bash scripts/fetch_fonts.sh
#   cd ~/frappe-bench && bench build --apps onespace
#
# Why self-host: the theme previously pulled fonts from fonts.googleapis.com via
# a CSS @import. That is render-blocking on every Desk load, adds a third-party
# dependency to software customers run their business on, fails outright on
# air-gapped or egress-restricted deployments, and leaks user IPs to Google —
# which some enterprise customers will refuse outright.
#
# The URLs are resolved from the Google Fonts CSS API rather than hardcoded.
# An earlier version of this script guessed at raw.githubusercontent paths and
# 404'd. Asset paths on fonts.gstatic.com carry version hashes (v20, v8, ...)
# and change without notice; the CSS API is the only stable way to ask "what is
# the current file for this family?".
#
# The browser User-Agent is load-bearing: without it Google serves static .ttf
# per weight (four files, ~4x the bytes). With it, one variable .woff2 per
# family covering the whole weight range.
#
# Both faces are SIL Open Font License 1.1. OFL.txt is written alongside them
# and must stay there — it is also referenced from /open-source-notices.
# ============================================================================

set -euo pipefail

DEST="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/onespace/public/fonts"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

mkdir -p "$DEST"

# Google returns one @font-face per unicode subset — cyrillic-ext, cyrillic,
# greek, vietnamese, latin-ext, latin — in that order, with `latin` LAST.
# Taking the first woff2 silently yields the Cyrillic subset: a ~2 KB file that
# contains none of the Latin glyphs, so every character falls back to the system
# font and the theme looks exactly as if self-hosting had not worked at all.
#
# We pull latin and latin-ext only. Together they cover Western and Central
# European text; _typography.scss declares each with its unicode-range so the
# browser downloads only what a given page actually needs.
SUBSETS="latin latin-ext"

fetch_family() {
  local css_family="$1" slug="$2" label="$3"
  local css subset url

  echo "  ${label}"

  css=$(curl -fsSL -A "$UA" "https://fonts.googleapis.com/css2?family=${css_family}&display=swap") || {
    echo "    ! could not reach the Google Fonts CSS API" >&2
    return 1
  }

  if ! printf '%s' "$css" | grep -q '\.woff2'; then
    echo "    ! no woff2 in the response — got .ttf? the User-Agent is wrong" >&2
    return 1
  fi

  for subset in $SUBSETS; do
    # The src: line sits ~6 lines below the "/* <subset> */" marker, so the
    # window has to be wide enough to reach it. The trailing " */" in the
    # pattern is what stops "latin" from also matching "/* latin-ext */".
    url=$(printf '%s\n' "$css" \
      | grep -A10 "/\* ${subset} \*/" \
      | grep -oE 'https://[^)]+\.woff2' \
      | head -1) || true

    if [ -z "${url:-}" ]; then
      echo "    ! subset '${subset}' not found in the API response" >&2
      return 1
    fi

    curl -fsSL "$url" -o "${DEST}/${slug}-${subset}.woff2"
    echo "    ${slug}-${subset}.woff2  ($(wc -c < "${DEST}/${slug}-${subset}.woff2") bytes)"
  done
}

echo "Fetching OneSpace brand typefaces into ${DEST}"

rm -f "$DEST"/*.woff2

fetch_family "Manrope:wght@400..700"           "manrope"           "Manrope 400-700"
fetch_family "Plus+Jakarta+Sans:wght@600..800" "plus-jakarta-sans" "Plus Jakarta Sans 600-800"

cat > "$DEST/OFL.txt" <<'EOF'
Plus Jakarta Sans — Copyright (c) Tokotype
Manrope — Copyright (c) Mikhail Sharanda

Both typefaces are licensed under the SIL Open Font License, Version 1.1.
Full licence text: https://openfontlicense.org

This licence file must remain alongside the font binaries. The OneSpace
open-source notices page (/open-source-notices) also references it.
EOF

echo
echo "Done:"
ls -1sh "$DEST"
echo
echo "Next:  cd ~/frappe-bench && bench build --apps onespace && bench --site <site> clear-cache"
