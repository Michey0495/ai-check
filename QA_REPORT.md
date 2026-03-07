# QA Report - web-url-a (AI Check)

Date: 2026-03-08 (QA Pass 5)

## Build & Lint

| Check | Result |
|-------|--------|
| `npm run build` | PASS (20 routes, 0 errors) |
| `npm run lint` | PASS (0 errors, 0 warnings) |

## Issues Found & Fixed (This Pass)

### 1. Missing Favicon - icon.tsx / apple-icon.tsx (FIXED)
- **Files**: Created `src/app/icon.tsx` and `src/app/apple-icon.tsx`
- **Severity**: Medium
- **Issue**: No favicon existed. The previous report mentioned `favicon.ico` but no such file was present.
- **Fix**: Created dynamic favicon (32x32) and Apple touch icon (180x180) using Next.js ImageResponse API, matching the site's black/white design.

### 2. Input type="url" Blocking Domain-Only Input (FIXED)
- **Files**: `src/components/url-check-form.tsx`, `src/app/check/compare/compare-client.tsx`
- **Severity**: Medium
- **Issue**: `type="url"` caused browser-level validation to reject inputs like "example.com" (no protocol), despite code already handling normalization by prepending `https://`.
- **Fix**: Changed to `type="text"` in both files.

### 3. Compare Page Input Missing a11y Attributes (FIXED)
- **File**: `src/app/check/compare/compare-client.tsx`
- **Severity**: Low
- **Issue**: Compare page URL inputs lacked `maxLength` and `aria-label` attributes.
- **Fix**: Added `maxLength={2048}` and `aria-label` per slot.

## Previously Fixed (QA Pass 1-4)

- Compare page mobile responsiveness (responsive grid classes)
- setState in useEffect pattern (replaced with useSyncExternalStore)
- Unused imports (GENERATOR_TYPES, API route imports)
- Missing 404/error/loading pages (created)
- Missing OGP image route (created)
- URL input validation (maxLength, aria-label)
- Feedback close/textarea aria-labels
- JSON-LD generator select aria-label
- Missing viewport export (added)
- Unused lucide-react dependency (removed)
- ScoreCircle SVG missing a11y attributes (added role="img", aria-label)
- Feedback widget missing dialog semantics (added role="dialog", aria-modal)

## Checklist

- [x] `npm run build` success
- [x] `npm run lint` no errors
- [x] Responsive layout (Tailwind sm/lg breakpoints throughout)
- [x] Favicon (icon.tsx 32x32, apple-icon.tsx 180x180)
- [x] OGP configured (layout.tsx metadata + `opengraph-image.tsx` route)
- [x] Viewport export configured
- [x] 404 page (`src/app/not-found.tsx`)
- [x] Loading state (`src/app/loading.tsx`)
- [x] Error state (`src/app/error.tsx` + `global-error.tsx`)
- [x] robots.txt (`public/robots.txt` with AI crawler permissions)
- [x] llms.txt (`public/llms.txt`)
- [x] sitemap.xml (dynamic route, 12 URLs)
- [x] agent.json (`public/.well-known/agent.json`)
- [x] JSON-LD structured data (WebApplication, FAQPage, HowTo, BreadcrumbList, SoftwareApplication, Organization)
- [x] Design system compliance (black bg, white text, no emojis, no icon libraries)
- [x] Interactive elements have cursor-pointer + transitions
- [x] Form inputs have accessible labels
- [x] Semantic HTML structure (header, main, footer, nav, section, h1-h3)
- [x] Dialog/modal a11y (role, aria-modal)
- [x] SVG a11y (role="img", aria-label)

## Edge Case Handling

| Case | Status | Implementation |
|------|--------|----------------|
| Empty URL input | PASS | `if (!url.trim()) return;` in form |
| Domain-only input | PASS | Auto-prepend `https://` + type="text" |
| Long URL input | PASS | `maxLength={2048}` + API validation |
| Invalid URL | PASS | `new URL()` parse error catch in API |
| Private/internal IPs | PASS | `isPrivateHostname()` SSRF protection |
| Non-http protocols | PASS | Protocol whitelist in API |
| Rate limiting | PASS | 10 req/min per IP |
| Compare: min/max sites | PASS | 2-5 site limit enforced |

## Design System Compliance

| Rule | Status |
|------|--------|
| Background: #000000 | PASS |
| Text: white base | PASS |
| No emojis | PASS |
| No icon libraries | PASS |
| Cards: bg-white/5 border border-white/10 | PASS |
| Hover: cursor-pointer, transition-all duration-200 | PASS |
| UI language: Japanese | PASS |

## SEO & AI-First

| Requirement | Status |
|-------------|--------|
| Metadata (title, description, keywords) | PASS |
| Open Graph | PASS |
| Twitter Card | PASS |
| Viewport | PASS |
| Canonical URL (all pages) | PASS |
| Sitemap (12 pages) | PASS |
| robots.txt (AI crawlers) | PASS |
| llms.txt | PASS |
| /.well-known/agent.json | PASS |
| /api/mcp (JSON-RPC 2.0) | PASS |
| JSON-LD structured data | PASS |
| OGP image (1200x630) | PASS |
| Favicon (32x32 + 180x180 Apple) | PASS |

## Performance

- All content pages statically generated (13 static, 7 dynamic)
- API check route uses `Promise.all` for parallel fetches
- Client components use `useCallback`/`useMemo` appropriately
- `useSyncExternalStore` for hydration-safe localStorage
- `maxDuration: 30` for Vercel serverless timeout
- Build output: 16MB

## Conclusion

Project is production-ready. 3 new issues found and fixed in this pass (favicon, input type, compare a11y), building on 12 fixes from previous passes. No blocking issues remain.
