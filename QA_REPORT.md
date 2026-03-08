# QA Report - web-url-a (AI Check)

Date: 2026-03-08 (QA Pass 10)

## Build & Lint

| Check | Result |
|-------|--------|
| `npm run build` | PASS (22 routes, 0 errors) |
| `npm run lint` | PASS (0 errors, 0 warnings) |

## Issues Found & Fixed (This Pass)

### 1. [CRITICAL] Mobile Responsive Grid - Stats Section (FIXED)
- **File**: `src/app/page.tsx:169`
- **Severity**: High
- **Issue**: `grid-cols-3` applied without mobile breakpoint, causing cramped layout on small screens
- **Fix**: Changed to `grid-cols-1 sm:grid-cols-3`

### 2. Feedback Widget Overflow on Small Screens (FIXED)
- **File**: `src/components/feedback-widget.tsx:42`
- **Severity**: Medium
- **Issue**: Fixed `w-80` (320px) could exceed viewport on small phones
- **Fix**: Changed to `w-72 max-w-[calc(100vw-2rem)] sm:w-80`

### 3. Progress Bar Missing ARIA Attributes (FIXED)
- **File**: `src/app/check/check-client.tsx:483`
- **Severity**: Medium
- **Issue**: Progress bars lacked `role="progressbar"` and aria attributes
- **Fix**: Added `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`

### 4. llms.txt Version Mismatch (FIXED)
- **File**: `public/llms.txt:36`
- **Severity**: Low
- **Issue**: Referenced "Next.js 15" but project uses Next.js 16.1.6
- **Fix**: Updated to "Next.js 16"

### 5. API Input Validation - Whitespace-only URLs (FIXED)
- **File**: `src/app/api/check/route.ts:363`
- **Severity**: Low
- **Issue**: Whitespace-only strings passed URL validation
- **Fix**: Added `!url.trim()` check

### 6. Hardcoded dateModified in Guide Pages (FIXED)
- **Files**: `src/app/guides/geo-vs-seo/page.tsx:28`, `src/app/guides/industry/page.tsx:39`
- **Severity**: Low
- **Issue**: `dateModified` hardcoded instead of dynamic
- **Fix**: Changed to `new Date().toISOString().split("T")[0]`

### 7. Footer Links Missing Focus Styles (FIXED)
- **File**: `src/components/footer.tsx`
- **Severity**: Low
- **Issue**: No visible focus indicator for keyboard navigation
- **Fix**: Added `focus:text-white/70 focus:outline-none`

## Issues Found & Fixed (Pass 9)

### 1. About Page Tech Stack Version (FIXED)
- **File**: `src/app/about/page.tsx`
- **Severity**: Low
- **Issue**: Tech stack listed "Next.js 15 (App Router)" but actual version is 16.1.6
- **Fix**: Updated to "Next.js 16 (App Router)"

## Issues Found & Fixed (Pass 8)

### 1. Unused Variables - Lint Warnings (FIXED)
- **File**: `src/app/api/check/route.ts`
- **Severity**: Low
- **Issue**: `bonusCount` and `bonusItems` variables assigned but never used
- **Fix**: Removed unused variables

### 2. Unused Import - Lint Warning (FIXED)
- **File**: `src/app/check/check-client.tsx`
- **Severity**: Low
- **Issue**: `router` (useRouter) declared but never used
- **Fix**: Removed `router` variable and `useRouter` import

### Not Fixed (Low Priority / By Design)

| # | Issue | Notes |
|---|-------|-------|
| 1 | Social proof numbers hardcoded | Acceptable for MVP |
| 2 | In-memory rate limiter resets on cold start | Acceptable for Vercel serverless |
| 3 | Score visualization uses colored grades (green/yellow/red) | Functional data indicators, not decorative - acceptable |
| 4 | geo-vs-seo uses `bg-primary/5` for one card | Intentional design differentiation |

## Previously Fixed (QA Pass 1-7)

- Fabricated aggregateRating in JSON-LD (removed)
- Generator empty state text not responsive-friendly (fixed wording)
- Unused default Next.js SVG files (deleted)
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
- Green colors in checklist replaced with primary accent (design system)

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
| Accent color: primary only (checklist fixed) | PASS |

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

- All content pages statically generated (14 static, 8 dynamic)
- API check route uses `Promise.all` for parallel fetches
- Client components use `useCallback`/`useMemo` appropriately
- `useSyncExternalStore` for hydration-safe localStorage
- `maxDuration: 30` for Vercel serverless timeout
- No unnecessary re-renders identified
- next/font/google with variable fonts (no FOUT)
- API responses cached: `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`
- Bundle size: ~17MB .next directory (normal for Next.js 16)

## Issues Found & Fixed (Pass 11)

### 1. Rate Limiter Memory Leak (FIXED)
- **File**: `src/app/api/check/route.ts`
- **Severity**: Medium
- **Issue**: In-memory rate limit Map grows unbounded under sustained traffic
- **Fix**: Added size-based purge - when entries exceed 10K, expired entries are cleaned up

### 2. Regex Partial Crawler Name Match (FIXED)
- **File**: `src/app/api/check/route.ts`
- **Severity**: Medium
- **Issue**: Pattern `User-agent:\s*GPTBot` could match `MyGPTBot`; special chars in crawler names not escaped
- **Fix**: Added regex escaping + newline boundary after User-agent value

### 3. Confusing Fetch Result Ternary (FIXED)
- **File**: `src/app/api/check/route.ts`
- **Severity**: Low
- **Issue**: `robotsRes.text === "" ? null : ""` was always evaluating to `null` since safeFetch returns `""` on failure
- **Fix**: Simplified to `ok ? text : null`

### 4. No Rate Limiting on Feedback API (FIXED)
- **File**: `src/app/api/feedback/route.ts`
- **Severity**: Medium
- **Issue**: Feedback endpoint could be abused to spam GitHub Issues
- **Fix**: Added 5 req/5min per-IP rate limiter with memory cleanup

### 5. Feedback Message Length Unlimited (FIXED)
- **File**: `src/app/api/feedback/route.ts`
- **Severity**: Low
- **Issue**: No limit on message length for feedback submissions
- **Fix**: Added 5,000 character limit

### 6. Feedback Dialog Missing aria-labelledby (FIXED)
- **File**: `src/components/feedback-widget.tsx`
- **Severity**: Low
- **Issue**: Dialog had `aria-label` but not linked to heading via `aria-labelledby`
- **Fix**: Added `id="feedback-title"` + `aria-labelledby="feedback-title"`

### 7. CRLF Line Endings Break Generators (FIXED)
- **Files**: 4 generator files + API generate route
- **Severity**: Low
- **Issue**: `split("\n")` fails for Windows CRLF line endings in textarea input
- **Fix**: Changed to `split(/\r?\n/)`

### 8. Generic Error in Compare Tool (FIXED)
- **File**: `src/app/check/compare/compare-client.tsx`
- **Severity**: Low
- **Issue**: All fetch errors show generic "failed" message
- **Fix**: Detect TypeError for network-specific error message

### 9. No Input Size Validation on Generate API (FIXED)
- **File**: `src/app/api/generate/route.ts`
- **Severity**: Low
- **Issue**: Large payloads accepted without limit
- **Fix**: Added 50KB payload size guard

## Conclusion

Project is production-ready. 9 issues fixed in pass 11 (3 medium security/reliability, 6 low). Total fixes across all QA passes: 39+. No blocking issues remain.
