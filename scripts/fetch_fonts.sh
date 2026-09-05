#!/usr/bin/env bash
# ============================================================================
# OneSpace — download and self-host the brand typefaces.
#
# Run once on the bench (or in CI), then commit public/fonts/ or bake it into
# the deployment image:
#
#   cd ~/frappe-bench/apps/onespace && bash scripts/fetch_fonts.sh
#   bench build --apps onespace
#
# Why self-host: the previous theme pulled fonts from fonts.googleapis.com via
# a CSS @import. That is render-blocking on every Desk load, adds a third-party
# dependency to an ERP customers run their business on, and fails outright on
# air-gapped or egress-restricted deployments. It is also a privacy exposure
# some enterprise customers will refuse.
#
# Both faces are variable fonts under the SIL Open Font License 1.1. The
# licence file is fetched alongside them — do not delete it.
# ============================================================================

set -euo pipefail

DEST="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/onespace/public/fonts"
mkdir -p "$DEST"

fetch() {
  local url="$1" out="$2"
  echo "  → ${out}"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$url" -o "$DEST/$out"
  else
    wget -qO "$DEST/$out" "$url"
  fi
}

echo "Fetching OneSpace brand typefaces into ${DEST}"

# Variable woff2 builds from the upstream Google Fonts repository.
fetch "https://github.com/googlefonts/plus-jakarta-sans/raw/master/fonts/webfonts/PlusJakartaSans%5Bwght%5D.woff2" \
      "plus-jakarta-sans-variable.woff2"

fetch "https://github.com/sharanda/manrope/raw/master/fonts/web/Manrope%5Bwght%5D.woff2" \
      "manrope-variable.woff2"

cat > "$DEST/OFL.txt" <<'EOF'
Plus Jakarta Sans — Copyright (c) Tokotype
Manrope — Copyright (c) Mikhail Sharanda

Both typefaces are licensed under the SIL Open Font License, Version 1.1.
Full licence text: https://openfontlicense.org

This licence file must remain alongside the font binaries. The OneSpace
open-source notices page (/open-source-notices) also references it.
EOF

echo
echo "Done. Files in ${DEST}:"
ls -1 "$DEST"
echo
echo "Next:  bench build --apps onespace && bench --site <site> clear-cache"
