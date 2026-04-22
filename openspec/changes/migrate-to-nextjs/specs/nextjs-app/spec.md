# Spec — nextjs-app

## Purpose
The site is a Next.js 15 App Router application that builds to a static
export (`out/`) deployable on GitHub Pages.

## Requirements

- MUST use Next.js 15 or later, React 19 or later, TypeScript with `strict: true`.
- MUST set `output: 'export'` and `trailingSlash: true` in `next.config.mjs`.
- MUST NOT rely on server-side features at runtime (no API routes, no `revalidate`,
  no `headers()`/`cookies()`/`redirects()` in `next.config`).
- MUST use `next/font/local` to self-host the MesloLGS NF font; MUST include
  the existing `font.ttf` as a fallback if a woff2 subset cannot reproduce the
  box-drawing glyphs used in the nav separator.
- MUST use `next/image` with `unoptimized: true` for all portfolio/team images.
- MUST pass `pnpm biome check .` and `pnpm tsc --noEmit` without errors in CI.
- MUST produce `out/CNAME` identical to the current root `CNAME`.
- SHOULD keep every static asset under `public/` and every source under
  `app/`, `components/`, `lib/`, `content/`, `styles/`.

## Non-goals
- Server components calling external APIs at build time (can be added later).
- i18n — site is English-only today.
