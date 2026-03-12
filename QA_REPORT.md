# QA Report - AI Check (web-url-a)

**Date**: 2026-03-13
**Tester**: Claude Code (automated QA)

## Checklist

- [x] `npm run build` 成功 (44ページ、7.1秒)
- [x] `npm run lint` エラーなし
- [x] レスポンシブ対応（モバイル・デスクトップ）
- [x] favicon, OGP設定
- [x] 404ページ
- [x] ローディング状態の表示
- [x] エラー状態の表示

## Build

- Next.js 16.1.6 (Turbopack)
- 44 static pages generated
- TypeScript strict: pass
- 0 lint errors

## Issues Found & Fixed

### 1. Redundant `public/robots.txt` (Fixed)

**Severity**: Medium
**Description**: `public/robots.txt` referenced wrong domain (`web-url-a.ezoai.jp`) while the app uses `ai-check.ezoai.jp`. It was also redundant since `src/app/robots.ts` already generates a proper robots.txt via the Next.js Metadata API.
**Fix**: Removed `public/robots.txt`. The dynamic `src/app/robots.ts` is the canonical source.

### 2. `<a>` tags instead of Next.js `<Link>` in generator pages (Fixed)

**Severity**: Low (performance)
**Description**: 4 generator pages (`llms-txt`, `json-ld`, `robots-txt`, `agent-json`) used plain `<a href>` tags for internal links instead of Next.js `<Link>`. This causes full page reloads instead of client-side navigation.
**Files fixed**:
- `src/app/generate/llms-txt/page.tsx` (4 links)
- `src/app/generate/json-ld/page.tsx` (3 links)
- `src/app/generate/robots-txt/page.tsx` (3 links)
- `src/app/generate/agent-json/page.tsx` (3 links)
**Fix**: Replaced all internal `<a>` tags with `<Link>` from `next/link`.

## No Issues Found (Pass)

### UI/Layout
- All pages render correctly with black background design system
- Card styles consistent (`bg-white/5 border border-white/10`)
- Hover states working (`cursor-pointer`, `transition-all duration-200`)
- Font sizes 16px+ with proper line-height
- No emojis or illustration icons used

### Edge Cases
- Empty URL input: proper validation ("URLを入力してください。")
- Invalid URL: proper validation ("有効なURLを入力してください。")
- Long URL: maxLength=2048 on client, 2048 char limit on API
- Special characters: URL encoding via `encodeURIComponent`
- SSRF protection: private IP/hostname blocking
- Rate limiting: 10 requests/min per IP with proper headers

### SEO
- Metadata: title template, description, keywords (100+), OGP, Twitter cards
- JSON-LD: Organization, WebSite, WebApplication, FAQPage, HowTo, BreadcrumbList
- Sitemap: 32 URLs with proper priorities
- robots.ts: All major AI crawlers explicitly allowed
- Canonical URLs set on all pages
- Dynamic OGP images (1200x630) for root and check pages

### Accessibility
- Skip-to-main-content link
- `lang="ja"` on html
- `role="status"` on loading spinner
- `role="alert"` on error messages
- `aria-label`, `aria-expanded`, `aria-controls` on interactive elements
- `aria-pressed` on feedback type toggles
- `aria-invalid` and `aria-describedby` on form inputs
- `aria-autocomplete` and `role="listbox"` on URL suggestions
- `role="progressbar"` with proper aria-value attributes
- Keyboard navigation: Escape closes mobile menu, Cmd/Ctrl+K focuses search
- Focus management in feedback widget

### Performance
- Server Components by default, "use client" only where needed
- Concurrent data fetching in API (`Promise.all`)
- Response body size limit (5MB)
- API timeout (10s per resource, 30s max duration)
- AbortSignal.timeout on fetch calls
- Rate limit map cleanup to prevent memory leaks

### Security
- SSRF protection (private IP/hostname blocking)
- Protocol validation (http/https only)
- Rate limiting with proper headers
- CORS support
- Input sanitization on all API endpoints
- No secrets exposed in client code

## Summary

Overall quality is high. The codebase follows consistent patterns, has proper error handling, and comprehensive SEO/accessibility support. Only 2 minor issues were found and fixed.
