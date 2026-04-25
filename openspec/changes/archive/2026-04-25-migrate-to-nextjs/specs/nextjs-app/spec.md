# Spec — nextjs-app

## Purpose
The site is a Next.js 15 App Router application that builds to a static
export (`out/`) deployable on GitHub Pages.

## ADDED Requirements

### Requirement: Use Next.js 15 or later, React 19 or later, TypeScript with `strict
MUST use Next.js 15 or later, React 19 or later, TypeScript with `strict: true`.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST use Next.js 15 or later, React 19 or later, TypeScript with `strict: true`.

### Requirement: Set `output
MUST set `output: 'export'` and `trailingSlash: true` in `next.config.mjs`.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST set `output: 'export'` and `trailingSlash: true` in `next.config.mjs`.

### Requirement: Rely on server-side features at runtime (no API routes, no `revalidate`, no
MUST NOT rely on server-side features at runtime (no API routes, no `revalidate`, no `headers()`/`cookies()`/`redirects()` in `next.config`).

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST NOT rely on server-side features at runtime (no API routes, no `revalidate`, no `headers()`/`cookies()`/`redirects()` in `next.config`).

### Requirement: Use `next/font/local` to self-host the MesloLGS NF font; MUST include the existing
MUST use `next/font/local` to self-host the MesloLGS NF font; MUST include the existing `font.ttf` as a fallback if a woff2 subset cannot reproduce the box-drawing glyphs used in the nav separator.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST use `next/font/local` to self-host the MesloLGS NF font; MUST include the existing `font.ttf` as a fallback if a woff2 subset cannot reproduce the box-drawing glyphs used in the nav separator.

### Requirement: Use `next/image` with `unoptimized
MUST use `next/image` with `unoptimized: true` for all portfolio/team images.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST use `next/image` with `unoptimized: true` for all portfolio/team images.

### Requirement: Pass `pnpm biome check .` and `pnpm tsc --noEmit` without errors in
MUST pass `pnpm biome check .` and `pnpm tsc --noEmit` without errors in CI.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST pass `pnpm biome check .` and `pnpm tsc --noEmit` without errors in CI.

### Requirement: Produce `out/CNAME` identical to the current root `CNAME`
MUST produce `out/CNAME` identical to the current root `CNAME`.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST produce `out/CNAME` identical to the current root `CNAME`.

### Requirement: Keep every static asset under `public/` and every source under `app/`, `components/`
The migration SHALL ensure: SHOULD keep every static asset under `public/` and every source under `app/`, `components/`, `lib/`, `content/`, `styles/`.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** SHOULD keep every static asset under `public/` and every source under `app/`, `components/`, `lib/`, `content/`, `styles/`.

## Non-goals
- Server components calling external APIs at build time (can be added later).
- i18n — site is English-only today.
