# QA Report - web-url-a (AI Check)

Date: 2026-03-08 (QA Pass 3)

## Build & Lint

| Check | Result |
|-------|--------|
| `npm run build` | PASS (18 routes, 0 errors) |
| `npm run lint` | PASS (0 errors, 0 warnings) |

## Issues Found & Fixed (This Pass)

### 1. Missing viewport export (FIXED)
- **File**: `src/app/layout.tsx`
- **Severity**: Low
- **Issue**: `export const viewport` was not defined. Next.js 15+ best practice requires explicit viewport configuration.
- **Fix**: Added `Viewport` type import and explicit viewport export with `width: "device-width"`, `initialScale: 1`, `maximumScale: 5`.

### 2. Unused `lucide-react` dependency (FIXED)
- **File**: `package.json`
- **Severity**: Low
- **Issue**: `lucide-react` was listed in dependencies but never imported. Design system forbids icon libraries.
- **Fix**: Removed with `npm uninstall lucide-react`.

### 3. ScoreCircle SVG missing a11y attributes (FIXED)
- **File**: `src/app/check/check-client.tsx`
- **Severity**: Medium
- **Issue**: Score visualization SVG had no `role` or `aria-label`, invisible to screen readers.
- **Fix**: Added `role="img"` and dynamic `aria-label` with grade and score.

### 4. Feedback widget missing dialog semantics (FIXED)
- **File**: `src/components/feedback-widget.tsx`
- **Severity**: Medium
- **Issue**: Feedback modal lacked `role="dialog"` and `aria-modal="true"`.
- **Fix**: Added `role="dialog"`, `aria-modal="true"`, and `aria-label="フィードバック"`.

## Previously Fixed (QA Pass 1-2)

- setState in useEffect pattern in check-client.tsx (replaced with useSyncExternalStore)
- Unused imports (GENERATOR_TYPES, API route imports)
- Missing 404/error/loading pages (created)
- Missing OGP image route (created)
- URL input validation (maxLength, type="url", aria-label)
- Feedback close button aria-label
- Feedback textarea aria-label
- JSON-LD generator select aria-label

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
- [x] JSON-LD structured data (WebApplication + FAQPage on homepage)
- [x] Design system compliance (black bg, white text, no emojis, no icon libraries)
- [x] No lucide-react or icon library imports (dependency removed)
- [x] Interactive elements have cursor-pointer + transitions
- [x] Form inputs have accessible labels
- [x] Semantic HTML structure (header, main, footer, nav, section, h1-h3)
- [x] Dialog/modal a11y (role, aria-modal)
- [x] SVG a11y (role="img", aria-label)

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
| Canonical URL | PASS |
| Sitemap | PASS |
| robots.txt (AI crawlers) | PASS |
| llms.txt | PASS |
| /.well-known/agent.json | PASS |
| /api/mcp (JSON-RPC 2.0) | PASS |
| JSON-LD structured data | PASS |
| OGP image (1200x630) | PASS |

## Notes

- `text-sm` (14px) used in secondary UI elements (badges, labels, footer). Acceptable for auxiliary text.
- Mobile menu header lacks focus trap but has proper aria attributes.
- All 18 routes build successfully (11 static, 7 dynamic).

## Conclusion

Project is production-ready. 4 new issues found and fixed in this pass, building on 8 fixes from previous passes. No blocking issues remain.
