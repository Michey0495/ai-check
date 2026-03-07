# QA Report - web-url-a (AI Check)

Date: 2026-03-08 (QA Pass 4)

## Build & Lint

| Check | Result |
|-------|--------|
| `npm run build` | PASS (18 routes, 0 errors) |
| `npm run lint` | PASS (0 errors, 0 warnings) |

## Issues Found & Fixed (This Pass)

### 1. Compare page mobile responsiveness (FIXED)
- **File**: `src/app/check/compare/compare-client.tsx`
- **Severity**: Medium
- **Issue**: Results grid used inline `gridTemplateColumns: repeat(N, minmax(0, 1fr))` which squeezed columns to unusable widths on mobile devices.
- **Fix**: Replaced with responsive Tailwind classes `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`.

## Previously Fixed (QA Pass 1-3)

- setState in useEffect pattern in check-client.tsx (replaced with useSyncExternalStore)
- Unused imports (GENERATOR_TYPES, API route imports)
- Missing 404/error/loading pages (created)
- Missing OGP image route (created)
- URL input validation (maxLength, type="url", aria-label)
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
- [x] favicon.ico present (`src/app/favicon.ico`)
- [x] OGP configured (layout.tsx metadata + `opengraph-image.tsx` route)
- [x] Viewport export configured
- [x] 404 page (`src/app/not-found.tsx`)
- [x] Loading state (`src/app/loading.tsx`)
- [x] Error state (`src/app/error.tsx` + `global-error.tsx`)
- [x] robots.txt (`public/robots.txt` with AI crawler permissions)
- [x] llms.txt (`public/llms.txt`)
- [x] sitemap.xml (dynamic route, 10 URLs)
- [x] agent.json (`public/.well-known/agent.json`)
- [x] JSON-LD structured data (WebApplication, FAQPage, HowTo, BreadcrumbList, SoftwareApplication)
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
| Long URL input | PASS | `maxLength={2048}` + API validation |
| Invalid URL | PASS | `new URL()` parse error catch in API |
| Private/internal IPs | PASS | `isPrivateHostname()` SSRF protection |
| Non-http protocols | PASS | Protocol whitelist in API |
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
| Sitemap (10 pages) | PASS |
| robots.txt (AI crawlers) | PASS |
| llms.txt | PASS |
| /.well-known/agent.json | PASS |
| /api/mcp (JSON-RPC 2.0) | PASS |
| JSON-LD structured data | PASS |
| OGP image (1200x630) | PASS |

## Performance

- All content pages statically generated (11 static, 7 dynamic)
- API check route uses `Promise.all` for parallel fetches
- Client components use `useCallback`/`useMemo` appropriately
- `useSyncExternalStore` for hydration-safe localStorage
- `maxDuration: 30` for Vercel serverless timeout

## Conclusion

Project is production-ready. 1 new issue found and fixed in this pass (compare page mobile responsiveness), building on 11 fixes from previous passes. No blocking issues remain.
