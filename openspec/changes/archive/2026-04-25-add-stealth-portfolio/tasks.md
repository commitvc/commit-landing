## 1. Data layer

- [x] 1.1 Add `stealth?: boolean` to the `Company` type in `lib/companies.ts`
- [x] 1.2 Add stealth Fund I entry: `inference` (`oneLiner: 'AI inference stack'`)
- [x] 1.3 Add stealth Fund I entry: `specs` (`oneLiner: 'Specifications framework'`)

## 2. Card render

- [x] 2.1 Add `StealthCard` function in `components/cards/CompanyCard.tsx`: renders one `<p>` with filename + `: Permission denied`
- [x] 2.2 In `CompanyCard`: early-return `<StealthCard>` when `company.stealth`
- [x] 2.3 Add `.stealthCard`, `.stealthLine`, `.stealthFile` classes to `CompanyCard.module.css`

## 3. File tree

- [x] 3.1 Add `.fileStealth` class to `FileTree.module.css` (faded green: `rgba(158, 206, 106, 0.55)`)
- [x] 3.2 In `FileTree.tsx`: detect stealth slug per line by matching `/^\/companies\/([^/]+)\.txt$/` against `COMPANIES.find(c => c.slug === match[1])?.stealth`
- [x] 3.3 Apply `fileStealth` class conditionally on the file label span

## 4. JSON-LD suppression

- [x] 4.1 In `app/(chrome)/(tabs)/companies/[slug]/page.tsx`: skip emitting Organization JSON-LD when `company.stealth`
- [x] 4.2 BreadcrumbList still emits on stealth pages
- [x] 4.3 In `lib/structured-data.ts` `activeCompaniesItemList()`: filter `c => !c.stealth`
- [x] 4.4 OG metadata for stealth pages: `description: "Stealth Fund I investment — <oneLiner>. Disclosure pending."`, no `og:image`

## 5. llms.txt + homepage thesis

- [x] 5.1 Add stealth entries to `public/llms.txt` Portfolio section with `Identity disclosed at launch.` tag
- [x] 5.2 Add Key Facts line: "Active Fund I commitments: 3 (1 announced — UMA; 2 stealth — disclosure pending)"
- [x] 5.3 Add count line to homepage SSR thesis in `app/page.tsx`

## 6. Verification

- [x] 6.1 Visit `/companies/inference/` → see `inference.txt: Permission denied`
- [x] 6.2 Visit `/companies/specs/` → see `specs.txt: Permission denied`
- [x] 6.3 Inspect HTML on stealth pages → no Organization JSON-LD; BreadcrumbList present
- [x] 6.4 Inspect `/companies/` HTML → two ItemLists; stealth entries absent from active list
- [x] 6.5 Inspect file tree → `inference.txt` and `specs.txt` muted, `uma.txt` regular green
