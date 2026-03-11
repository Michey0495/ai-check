# QA Report - web-url-a (AI Check)

**Date:** 2026-03-12 (Night 34 QA Pass)
**Project:** AI Check (GEO Score Analyzer)
**Domain:** ai-check.ezoai.jp

## Build & Lint

| Check | Status |
|-------|--------|
| `npm run build` | PASS (43 static pages, compiled in 7.3s) |
| `npm run lint` | PASS (0 errors, 0 warnings) |

## Night 34 Fixes

### MEDIUM: Stats Grid Still Not Responsive (Regression)
- **File:** `src/app/page.tsx:175`
- **Issue:** Previous fix had reverted; hero stats grid was back to `grid-cols-3` without mobile breakpoint
- **Fix:** Re-applied `grid-cols-1 sm:grid-cols-3`

### MEDIUM: Placeholder Text Contrast Below WCAG AA
- **Files:** `src/components/url-check-form.tsx:51`, `src/components/feedback-widget.tsx:76`
- **Issue:** `placeholder:text-white/30` (30% opacity on dark bg) failed WCAG AA contrast ratio
- **Fix:** Changed to `placeholder:text-white/50`

### MEDIUM: Inline Objects Recreated on Every Render
- **File:** `src/app/check/check-client.tsx`
- **Issue:** `gradeColors`, `strokeColors`, `nameMap` were declared inside components, causing unnecessary object allocation on each render
- **Fix:** Extracted to module-level constants (`GRADE_COLORS`, `STROKE_COLORS`, `DOWNLOAD_NAME_MAP`)

## Night 33 Fixes

### LOW: FAQ Accordion Missing aria-labelledby (Accessibility)
- **File:** `src/components/faq-accordion.tsx`
- **Issue:** `role="region"` panels had no `aria-labelledby`, so screen readers couldn't associate regions with their trigger buttons
- **Fix:** Added `id={faq-button-${i}}` to buttons and `aria-labelledby={faq-button-${i}}` to region panels

## Night 32 Fixes

### HIGH: MCP Route Missing Input Sanitization (Security)
- **File:** `src/app/api/mcp/route.ts`
- **Issue:** `generate_llms_txt` and `generate_robots_txt` tools embedded user input without sanitizing newlines, unlike `/api/generate` route which uses `sanitizeLine()`
- **Fix:** Added `sanitizeLine()` and applied to all user inputs in MCP tool handlers

### HIGH: MCP Route Missing Schema Type Validation
- **File:** `src/app/api/mcp/route.ts`
- **Issue:** `generate_json_ld` accepted arbitrary `@type` values without validation against allowed enum
- **Fix:** Added validation against `["WebSite", "Organization", "FAQPage", "HowTo", "Product", "Article"]`

### MEDIUM: MCP Route Invalid Array Entry Handling
- **File:** `src/app/api/mcp/route.ts`
- **Issue:** FAQPage and HowTo handlers didn't validate array item structure (missing question/answer or name/text)
- **Fix:** Added `.filter()` to ensure required properties exist before mapping

### MEDIUM: Stats Grid Not Responsive on Mobile
- **File:** `src/app/page.tsx:175`
- **Issue:** Hero stats grid used `grid-cols-3` without mobile breakpoint, cramped on small screens
- **Fix:** Changed to `grid-cols-1 sm:grid-cols-3`

### MEDIUM: Low Contrast Text (WCAG Accessibility)
- **Files:** `src/app/page.tsx`, `src/app/history/history-client.tsx`
- **Issue:** `text-white/20` (comparison table) and SVG text `rgba(255,255,255,0.25-0.3)` had insufficient contrast
- **Fix:** Increased to `text-white/40` and `rgba(255,255,255,0.5)` respectively

### MEDIUM: SVG Charts Missing Accessibility Attributes
- **Files:** `src/app/check/compare/compare-client.tsx`, `src/app/history/history-client.tsx`
- **Issue:** Radar chart and score trend chart SVGs had no `role` or `aria-label`
- **Fix:** Added `role="img"` and descriptive `aria-label` to both SVGs

### MEDIUM: Badge Generator URL Inconsistency
- **File:** `src/app/generate/badge/generator-client.tsx`
- **Issue:** `handleCopy` used raw URL while `generate` normalized to add `https://`, causing mismatch
- **Fix:** Applied same URL normalization in `handleCopy`

### MEDIUM: JSON-LD Generator FAQ Parsing Edge Case
- **File:** `src/app/generate/json-ld/generator-client.tsx`
- **Issue:** FAQ parsing could produce entries with empty question or answer
- **Fix:** Added validation to filter out incomplete entries

## Night 31 Fixes

### MEDIUM: RecentChecks hydration mismatch
- **File:** `src/components/recent-checks.tsx`
- **Issue:** `useMemo` with `typeof window === "undefined"` guard was used to read localStorage, but this causes hydration mismatch: SSR returns empty array, client render returns localStorage data. Previous Night 30 fix (useState lazy initializer) had the same issue conceptually.
- **Fix:** Replaced with `useSyncExternalStore` with proper server snapshot (`emptyHistory`), matching the pattern already used in `check-client.tsx`'s `CheckHistory` component. This ensures SSR/client consistency and satisfies the `react-hooks/set-state-in-effect` lint rule.
- **Result:** No hydration mismatch, lint passes, build succeeds

## Night 30 Fixes

### MEDIUM: Lint error - setState in useEffect
- **File:** `src/components/recent-checks.tsx`
- **Issue:** `setHistory()` called synchronously inside `useEffect`, causing ESLint `react-hooks/set-state-in-effect` error
- **Fix:** Moved localStorage read to `useState` lazy initializer, removed unused `useEffect` import
- **Result:** Lint error resolved, eliminates unnecessary re-render on mount

## Previous Issues Fixed (Night 27)

### HIGH: Batch API missing timeout
- **File:** `src/app/api/check/batch/route.ts`
- **Fix:** Added `signal: AbortSignal.timeout(25000)` to batch internal fetches

### MEDIUM: Generate route missing maxDuration
- **File:** `src/app/api/generate/route.ts`
- **Fix:** Added `export const maxDuration = 10`

### MEDIUM: PWA/Grade grid layout broken on tablets
- **File:** `src/app/check/check-client.tsx`
- **Fix:** Progressive breakpoints `grid-cols-2 sm:grid-cols-3 md:grid-cols-5`

### LOW: Global error a11y improvements
- **File:** `src/app/global-error.tsx`
- **Fix:** Added `role="alert"` and `border border-white/20` for visibility

### LOW: 404 page grid fix
- **File:** `src/app/not-found.tsx`
- **Fix:** Explicit `grid-cols-1` base class

## Night 29 QA Results

### Fixed: Design system violation in /check/[indicator]
- **File:** `src/app/check/[indicator]/page.tsx` (line 736)
- **Issue:** Used `border-cyan-400/20` and `text-cyan-400` instead of primary color
- **Fix:** Replaced with `border-primary/20` and `text-primary`

### Full audit - no other issues found

Full audit of the following areas revealed no defects:

- **URL validation**: Empty input, protocol enforcement, 2048 char limit, SSRF protection all working
- **API security**: Rate limiting (10 req/min), body size limits (5MB), private hostname blocking, timeout protection
- **UI rendering**: All pages render correctly, responsive grids use proper breakpoints (sm/md/lg)
- **Loading/Error states**: Spinner with `role="status"`, error boundary with `role="alert"` and retry
- **Edge cases**: URL normalization (auto-prepend https://), special characters handled via `encodeURIComponent`
- **Print styles**: Comprehensive `@media print` rules for report output

## Checklist

- [x] `npm run build` success
- [x] `npm run lint` no errors
- [x] Responsive layout (mobile/tablet/desktop)
- [x] favicon (dynamic icon.tsx + apple-icon.tsx)
- [x] OGP (opengraph-image.tsx + per-page metadata)
- [x] 404 page (not-found.tsx with navigation cards)
- [x] Loading state (loading.tsx with spinner + aria)
- [x] Error state (error.tsx + global-error.tsx with reset)

## SEO Status

| Item | Status |
|------|--------|
| Page metadata (title, description) | All pages have unique metadata |
| OGP images | Dynamic generation (1200x630) |
| Structured data (JSON-LD) | Organization, BreadcrumbList, HowTo, FAQPage, WebApplication |
| robots.txt | 10 AI crawlers explicitly allowed |
| sitemap.xml | 44 URLs with priority/changeFrequency |
| llms.txt | Comprehensive AI site description |
| .well-known/agent.json | A2A Agent Card with MCP tools |
| manifest.json | PWA-ready |

## API Security

| Check | Status |
|-------|--------|
| SSRF protection | Private IP/hostname blocking (IPv4, IPv6, mapped) |
| Rate limiting | 10 req/min per IP with memory cleanup at 10K entries |
| Input validation | URL length (2048), protocol (http/https), body size (5MB) |
| Timeout protection | AbortSignal on all external fetches (10-15s) |
| CORS | Proper headers on all API routes |

## Accessibility

| Check | Status |
|-------|--------|
| Skip-to-content link | Present in root layout |
| role="alert" on errors | error.tsx + global-error.tsx |
| role="status" on loading | loading.tsx + check-client.tsx |
| aria-label on inputs | URL check form |
| aria-invalid on errors | URL check form |
| aria-expanded on accordions | AllFixCodes section |
| Semantic HTML | Proper headings, landmarks, table scope |
| Color contrast | White on black base |
| Focus states | Present on all interactive elements |
| Keyboard navigation | Escape closes mobile menu |

## Performance

- Static bundle: ~1.2MB total (acceptable for full-featured app)
- Server Components by default; "use client" only where needed
- Dynamic OG image generation (edge-rendered)
- Rate limiting with memory cleanup prevents unbounded growth
- 5MB response body limit on external fetches
- Concurrent fetching of all check resources (7 parallel requests)
