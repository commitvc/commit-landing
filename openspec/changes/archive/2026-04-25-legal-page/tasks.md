## 1. Virtual Filesystem — `legal.txt` in `about/`

- [x] 1.1 Add `legal.txt` to `about/` virtual filesystem — summary preview (not full content), key legal facts as signature block
- [x] 1.2 Verify `ls about/` lists `legal.txt`

## 2. `legalNotice` Renderer

- [x] 2.1 Implement `legalNotice` renderer — parses key:value fields with yellow labels, plain text paragraphs, "Open full legal notice" link auto-derived from path `/about/legal/`
- [x] 2.2 Route `legal.txt` in `viewFile()` and `cat` dispatch

## 3. Static Page — `/about/legal/`

- [x] 3.1 Create `about/legal/index.html` — same layout as landing (inline CSS, ASCII art via HTML entities, RRW button fixed top-right, tab bar with full-width dashed line)
- [x] 3.2 SEO metadata: title, description, canonical (`commit.fund/about/legal`), OG tags
- [x] 3.3 Tab bar: About active, other tabs link to clean paths (`/cli`, `/companies`, `/blog`, `/team`)
- [x] 3.4 Full legal content with section headings, all emails replaced with `enquiry@commit.fund`
- [x] 3.5 Logo alignment: container `padding-top: 3px` compensates for ASCII art blank first line

## 4. Email Consolidation

- [x] 4.1 All contact emails (`hey@`, `complaints@`, `dpo@redriverwest.com`) replaced with `enquiry@commit.fund` in both static page and virtual filesystem
