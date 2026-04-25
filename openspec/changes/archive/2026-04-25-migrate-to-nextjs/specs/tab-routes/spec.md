# Spec — tab-routes

## Purpose
Each tab is a first-class Next.js route. Replaces the legacy
`sessionStorage.setItem('initTab', ...)` + `location.replace('/')` redirect.

## ADDED Requirements

### Requirement: Expose these routes, all statically exported
MUST expose these routes, all statically exported: - `/` → `<Terminal />` - `/cli/` → `<Terminal />` (canonical = `/`, via `alternates.canonical` metadata) - `/companies/` → Portfolio `<FileTree />` + cards - `/team/` → Team `<FileTree />` + cards - `/about/` → About `<FileTree />` + readme - `/blog/` → blog index (cards) - `/blog/[slug]/` → MDX article, one route per post - `/about/legal/` → meta-refresh to `https://www.redriverwest.com/legal` with a visible text fallback link

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST expose these routes, all statically exported: - `/` → `<Terminal />` - `/cli/` → `<Terminal />` (canonical = `/`, via `alternates.canonical` metadata) - `/companies/` → Portfolio `<FileTree />` + cards - `/team/` → Team `<FileTree />` + cards - `/about/` → About `<FileTree />` + readme - `/blog/` → blog index (cards) - `/blog/[slug]/` → MDX article, one route per post - `/about/legal/` → meta-refresh to `https://www.redriverwest.com/legal` with a visible text fallback link

### Requirement: Preserve the trailing slash on every URL (`trailingSlash
MUST preserve the trailing slash on every URL (`trailingSlash: true`).

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST preserve the trailing slash on every URL (`trailingSlash: true`).

### Requirement: Use `sessionStorage` for tab selection
MUST NOT use `sessionStorage` for tab selection. Tab state is derived from the URL via `usePathname()`.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST NOT use `sessionStorage` for tab selection. Tab state is derived from the URL via `usePathname()`.

### Requirement: Return a 404 page (`app/not-found.tsx`) for unknown routes in the exported output
MUST return a 404 page (`app/not-found.tsx`) for unknown routes in the exported output.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** MUST return a 404 page (`app/not-found.tsx`) for unknown routes in the exported output.

### Requirement: Each tab route MUST set its own `<title>` and `<meta description>` via
Each tab route MUST set its own `<title>` and `<meta description>` via `generateMetadata`.

#### Scenario: applies as documented
- **WHEN** the migrate-to-nextjs change is applied
- **THEN** Each tab route MUST set its own `<title>` and `<meta description>` via `generateMetadata`.

## Non-goals
- Dynamic catch-all routes. The set of tabs is fixed and enumerated.
