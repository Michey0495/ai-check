# QA Report - web-url-a (AI Check)

**Date:** 2026-03-11
**Project:** AI Check (GEO Score Analyzer)
**Domain:** ai-check.ezoai.jp

## Build & Lint

| Check | Status |
|-------|--------|
| `npm run build` | PASS |
| `npm run lint` | PASS (0 errors) |

## Issues Found & Fixed

### HIGH: Batch API missing timeout (fixed)
- **File:** `src/app/api/check/batch/route.ts`
- **Problem:** Internal fetch to `/api/check` had no AbortSignal timeout, risking indefinite hangs
- **Fix:** Added `signal: AbortSignal.timeout(25000)` to batch internal fetches

### MEDIUM: Generate route missing maxDuration (fixed)
- **File:** `src/app/api/generate/route.ts`
- **Problem:** No `maxDuration` export, could theoretically run indefinitely on edge
- **Fix:** Added `export const maxDuration = 10`

### MEDIUM: PWA grid layout broken on tablets (fixed)
- **File:** `src/app/check/check-client.tsx`
- **Problem:** `sm:grid-cols-5` caused cramped 5-column layout on 640-768px screens
- **Fix:** Changed to `grid-cols-2 sm:grid-cols-3 md:grid-cols-5` for progressive breakpoints

### MEDIUM: Grade explanation grid broken on tablets (fixed)
- **File:** `src/app/check/check-client.tsx`
- **Problem:** Same 5-column issue as PWA grid
- **Fix:** Changed to `grid-cols-2 sm:grid-cols-3 md:grid-cols-5`

### LOW: Global error button barely visible (fixed)
- **File:** `src/app/global-error.tsx`
- **Problem:** `bg-white/10` button too subtle on black background
- **Fix:** Added `border border-white/20` for better visibility

### LOW: Global error missing role="alert" (fixed)
- **File:** `src/app/global-error.tsx`
- **Problem:** Missing WCAG alert role for screen readers
- **Fix:** Added `role="alert"` to error container

### LOW: 404 page grid on small tablets (fixed)
- **File:** `src/app/not-found.tsx`
- **Problem:** Cards too narrow at 640px with `sm:grid-cols-3`
- **Fix:** Added explicit `grid-cols-1` base for single column before sm breakpoint

## Checklist

- [x] `npm run build` success
- [x] `npm run lint` no errors
- [x] Responsive layout (mobile/tablet/desktop grids fixed)
- [x] favicon (favicon.ico + dynamic icon.tsx + apple-icon.tsx)
- [x] OGP (opengraph-image.tsx + per-page metadata)
- [x] 404 page (custom not-found.tsx with navigation cards)
- [x] Loading state (loading.tsx with spinner)
- [x] Error state (error.tsx + global-error.tsx with reset)

## SEO Status

| Item | Status |
|------|--------|
| Page metadata (title, description) | All 22 pages have unique metadata |
| OGP images | Dynamic generation (1200x630) |
| Structured data (JSON-LD) | Organization, BreadcrumbList, HowTo, FAQPage, SoftwareApplication, CollectionPage |
| robots.txt | 10 AI crawlers explicitly allowed |
| sitemap.xml | 43 URLs with priority/changeFrequency |
| llms.txt | Comprehensive AI site description |
| .well-known/agent.json | A2A v2.8.0 with 49 capabilities, 5 MCP tools |
| manifest.json | PWA-ready |

## API Security

| Check | Status |
|-------|--------|
| SSRF protection | Private IP/hostname blocking |
| Rate limiting | Per-IP limits (5-30 req/min per endpoint) |
| Input validation | URL length (2048), protocol (http/https), payload size (50KB) |
| XSS prevention | SVG escaping, JSON.stringify for schema |
| Timeout protection | AbortSignal on all external fetches |
| CORS | Proper headers on all API routes |

## Accessibility

| Check | Status |
|-------|--------|
| Skip-to-content link | Present in root layout |
| role="alert" on errors | error.tsx + global-error.tsx |
| Semantic HTML | Proper headings, landmarks |
| Color contrast | White on black (#000) base, accent colors for status |
| Focus states | Present on interactive elements |

## Performance Notes

- All pages default to Server Components; "use client" only where needed (11 components)
- check-client.tsx is large (1,540 lines) but functional; splitting would add complexity without clear benefit
- Edge-rendered OG images for fast social preview generation
- Rate limiting with memory cleanup prevents unbounded growth
