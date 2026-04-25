# Spec — tab-routes

## Purpose
Each tab is a first-class Next.js route. Replaces the legacy
`sessionStorage.setItem('initTab', ...)` + `location.replace('/')` redirect.

## Requirements

- MUST expose these routes, all statically exported:
  - `/` → `<Terminal />`
  - `/cli/` → `<Terminal />` (canonical = `/`, via `alternates.canonical` metadata)
  - `/companies/` → Portfolio `<FileTree />` + cards
  - `/team/` → Team `<FileTree />` + cards
  - `/about/` → About `<FileTree />` + readme
  - `/blog/` → blog index (cards)
  - `/blog/[slug]/` → MDX article, one route per post
  - `/about/legal/` → meta-refresh to `https://www.redriverwest.com/legal`
    with a visible text fallback link
- MUST preserve the trailing slash on every URL (`trailingSlash: true`).
- MUST NOT use `sessionStorage` for tab selection. Tab state is derived from
  the URL via `usePathname()`.
- MUST return a 404 page (`app/not-found.tsx`) for unknown routes in the
  exported output.
- Each tab route MUST set its own `<title>` and `<meta description>` via
  `generateMetadata`.

## Non-goals
- Dynamic catch-all routes. The set of tabs is fixed and enumerated.
