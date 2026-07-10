#!/usr/bin/env bash
#
# Regenerate public/font.woff2 from a full Meslo LGS Nerd Font TTF.
#
# The upstream Nerd Font ships ~13.8k glyphs (2.5 MB) — almost all of them
# icon glyphs we never render. That huge file loaded with `display: swap`
# caused a multi-second FOUT that reflowed and broke the ASCII logo, which is
# hand-tuned to Meslo's exact glyph metrics. We subset to just the Unicode
# ranges the site actually paints (Latin + accents, Greek, punctuation,
# arrows, math operators, box-drawing, blocks, geometric shapes) and ship a
# ~85 KB WOFF2 that loads before first paint. Emoji/flags are intentionally
# excluded — they fall back to the system emoji font, not this monospace face.
#
# Usage:  scripts/subset-font.sh path/to/full-meslo.ttf
# Output: public/font.woff2
#
# Requires: python3 with fonttools + brotli  (pip install fonttools brotli)

set -euo pipefail

SRC="${1:?usage: subset-font.sh <source.ttf>}"
OUT="public/font.woff2"

RANGES="U+0000-00FF,U+0100-024F,U+0300-036F,U+0370-03FF,\
U+2000-206F,U+2070-209F,U+20A0-20CF,U+2100-214F,U+2190-21FF,\
U+2200-22FF,U+2300-23FF,U+2500-257F,U+2580-259F,U+25A0-25FF,U+2600-26FF"

python3 -m fontTools.subset "$SRC" \
  --unicodes="$RANGES" \
  --layout-features='*' \
  --flavor=woff2 \
  --desubroutinize \
  --output-file="$OUT"

echo "Wrote $OUT ($(wc -c < "$OUT") bytes)"
