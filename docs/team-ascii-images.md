# Team ASCII Images

Team portraits use the GEOM ASCII generator by Ella Whit:
https://github.com/ellsabella/ascii-art-generator

The generator is the open-source app behind the deployed GEOM ASCII tool. The
repo script below clones that app into `.cache/team-ascii-generator`, prepares a
900x900 source image, drives the app with Playwright, and exports the final PNG.

Original and reference portrait assets are kept in `assets/team-originals/`:

```text
assets/team-originals/team/Abel.png
assets/team-originals/team/max.png
assets/team-originals/team/olivier.png
assets/team-originals/team/thomas.png
assets/team-originals/advisors/mark-porter.png
assets/team-originals/raw/abel.png
assets/team-originals/raw/mark.png
assets/team-originals/raw/thomas.png
```

Do not overwrite those files when iterating. They are the baseline references
for comparing generated replacements and for recovering the previous site
assets.

## Abel Recipe

Input source:

```bash
assets/team-originals/raw/abel.png
```

Generate the committed asset:

```bash
node scripts/generate-team-ascii.mjs --person abel --out public/team/Abel.png
```

Abel source prep:

```text
faceLift:
  size: 400x400
  ellipse: 184,142 98,112 0,360
  blur: 22
  gamma: 1.65
  brightnessContrast: 12x20
sourceAddPercent: 0
sourceScale: 1020
sourceResizeMode: cover
contrast: 0.8
midpoint: 125
gridColumns: 220
```

## Thomas Recipe

Input source:

```bash
assets/team-originals/raw/thomas.png
```

Generate the committed asset:

```bash
node scripts/generate-team-ascii.mjs --person thomas --out public/team/thomas.png
```

Thomas source prep:

```text
sourceAddPercent: 10
sourceScale: 1020
sourceResizeMode: cover
contrast: 0.8
midpoint: 125
gridColumns: 220
```

## Mark Recipe

Input source:

```bash
assets/team-originals/raw/mark.png
```

Generate the committed asset:

```bash
node scripts/generate-team-ascii.mjs --person mark --out public/advisors/mark-porter.png
```

Mark source prep:

```text
sourceAddPercent: 6
sourceScale: 900
sourceResizeMode: contain
contrast: 0.75
midpoint: 125
gridColumns: 240
```

## Shared Dark-Red GEOM Settings

Abel, Thomas, and Mark must use a clean dark red/black field. Do not use Offset
Pixels or image colors for these replacements; those modes create the dirty
source background or beige/black source-color rendering that made the old assets
stand out.

```text
density: "RBGHZ00  " (two trailing spaces)
contrast: 0.65
midpoint: 130
background mode: flat dark red
background RGB: [16, 2, 2]
use image colors: false
startColor HSLA: [8, 100, 62, 1]
endColor HSLA: [0, 70, 12, 1]
shadow mode: off
PNG width: 900
```

Each person can override contrast, midpoint, and grid columns. The source lifts
are intentional. Thomas's raw cutout has a black polo that collapses into the
dark field unless the source is raised before GEOM conversion. Mark needs a
smaller lift because his source is already brighter. Abel's raw cutout has a
clean alpha channel but an underexposed face, so his recipe applies a
deterministic face-region lift before GEOM conversion while keeping
`use image colors: false`.

## Requirements

- Node dependencies installed for this repo.
- Git, npm, and ImageMagick available on PATH.
- Playwright browser installed for `@playwright/test`.
