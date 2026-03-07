# QA Report - web-url-a (AI Check)

Date: 2026-03-08 (QA Pass 6)

## Build & Lint

| Check | Result |
|-------|--------|
| `npm run build` | PASS (20 routes, 0 errors) |
| `npm run lint` | PASS (0 errors, 0 warnings) |

## Issues Found & Fixed (This Pass)

### 1. Fabricated aggregateRating in JSON-LD (FIXED)
- **File**: `src/app/page.tsx`
- **Severity**: Medium
- **Issue**: Homepage JSON-LD contained `aggregateRating` with fabricated data (4.8 rating, 47 reviews). Google may flag this as misleading structured data.
- **Fix**: Removed `aggregateRating` from WebApplication JSON-LD.

### 2. Generator Empty State Text Not Responsive-Friendly (FIXED)
- **File**: `src/app/generate/llms-txt/generator-client.tsx`
- **Severity**: Low
- **Issue**: Empty state text said "left form" which is incorrect on mobile where forms stack vertically.
- **Fix**: Changed to layout-agnostic wording.

### 3. Unused Default Next.js Files (FIXED)
- **Files**: `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`
- **Severity**: Low
- **Issue**: Leftover default Next.js scaffold files, unused anywhere in the project.
- **Fix**: Deleted all 5 files.

### Not Fixed (Low Priority / By Design)

| # | Issue | Notes |
|---|-------|-------|
| 1 | Social proof "500+" hardcoded | Acceptable for MVP |
| 2 | In-memory rate limiter resets on cold start | Acceptable for Vercel serverless |

## Previously Fixed (QA Pass 1-5)

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
- Missing favicon - created icon.tsx + apple-icon.tsx
- Input type="url" blocking domain-only input - changed to type="text"
- Compare page input missing a11y attributes
- Decorative SVG icons missing aria-hidden
- JSON parse error handling in feedback API
- Repo name validation in feedback API

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
- [x] sitemap.xml (dynamic route)
- [x] agent.json (`public/.well-known/agent.json`)
- [x] JSON-LD structured data (WebApplication, FAQPage, HowTo, BreadcrumbList, SoftwareApplication, Organization, Article, DefinedTermSet)
- [x] Design system compliance (black bg, white text, no emojis, no icon libraries)
- [x] Interactive elements have cursor-pointer + transitions
- [x] Form inputs have accessible labels
- [x] Semantic HTML structure (header, main, footer, nav, section, h1-h3)
- [x] Dialog/modal a11y (role, aria-modal)
- [x] SVG a11y (role="img", aria-label, aria-hidden)

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
| Fetch timeout | PASS | 10s default, 15s for page fetch |
| Request cancellation | PASS | `cancelled` flag in useEffect cleanup |

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
| Sitemap | PASS |
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
- No unnecessary re-renders identified
- next/font/google with variable fonts (no FOUT)

## Conclusion

Project is production-ready. 3 issues found and fixed in this pass (fabricated aggregateRating, generator text, unused files). No blocking issues remain. Total fixes across all QA passes: 18+.
