# QA Report - web-url-a (AI Check)

**Date:** 2026-03-12 (Night 39 QA Pass)
**Project:** AI Check (GEO Score Analyzer)
**Domain:** ai-check.ezoai.jp

## Build & Lint

| Check | Status |
|-------|--------|
| `npm run build` | PASS (44 static pages) |
| `npm run lint` | PASS (0 errors, 0 warnings) |

## Night 39 Fixes

### LOW: Lint warnings - unused imports in check-client.tsx
- **File:** `src/app/check/check-client.tsx:9,47`
- **Fix:** 未使用の `GRADE_HEX_COLORS` インポートと `GRADE_COLORS` 変数を削除

### LOW: Feedback widget - missing focus management
- **File:** `src/components/feedback-widget.tsx`
- **Fix:** ダイアログ開閉時のフォーカス管理を追加（textareaへの自動フォーカス、閉じた時のトリガーボタンへのフォーカス復帰）

### LOW: Feedback API - silent failure when GITHUB_TOKEN missing
- **File:** `src/app/api/feedback/route.ts:71`
- **Fix:** GITHUB_TOKEN未設定時に `console.warn` でログ出力を追加

## Night 38 Fixes

### LOW: Lint warning - unused variable `allImageSrcs`
- **File:** `src/app/api/check/route.ts:211`
- **Fix:** destructuring から `allImageSrcs` を除外（下流で未使用）

### MEDIUM: Feedback widget - missing `type="button"` on all buttons
- **File:** `src/components/feedback-widget.tsx`
- **Fix:** 全4箇所の `<button>` に `type="button"` を追加

### LOW: Feedback widget - textarea missing maxLength
- **File:** `src/components/feedback-widget.tsx`
- **Fix:** `maxLength={2000}` を追加

### MEDIUM: Badge generator - React hook dependency issue
- **File:** `src/app/generate/badge/generator-client.tsx`
- **Issue:** `useEffect` 内で `setBadgeUrl` を呼んでおり、React 19 lint ルール `react-hooks/set-state-in-effect` 違反
- **Fix:** `computeInitialBadgeUrl()` を作成し、`useState` の初期値として計算。useEffect を除去

### LOW: CSV escaping in compare page
- **File:** `src/app/check/compare/compare-client.tsx:21`
- **Fix:** URL内のダブルクォートをCSV標準 (`""`) でエスケープ

## Night 37 Fixes

### LOW: Header Accessibility - Missing aria-controls
- **File:** `src/components/header.tsx`
- **Fix:** ガイドボタンに `aria-controls="guides-dropdown"`、モバイルメニューに `aria-controls="mobile-nav"` を追加

### LOW: Check API Missing Error Logging
- **File:** `src/app/api/check/route.ts`
- **Fix:** catch-all エラーハンドラーに `console.error` を追加

## Previous Night Fixes (History)

### Night 36
- Batch API error message exposure (security) - ユーザー入力のエラーメッセージ反映を除去
- Clipboard operation false success - コピー失敗時の誤表示を修正
- Feedback widget missing loading state - 送信中の二重送信防止

### Night 34
- Stats Grid responsive修正（再発対応）
- Placeholder text contrast向上（WCAG AA準拠）
- Inline object allocation最適化（module-level constants化）

### Night 33
- FAQ Accordion `aria-labelledby` 追加

### Night 32
- MCP Route input sanitization（セキュリティ）
- MCP Route schema type validation
- Stats Grid responsive対応
- Low contrast text修正（WCAG）
- SVG Charts accessibility attributes追加
- Badge Generator URL正規化
- JSON-LD Generator FAQ parsing修正

## Known Issues (Low Priority)

### Performance
- `check-client.tsx` (2095行) - 大きなコンポーネント。将来的にファイル分割を検討
- `React.memo` の使用なし - パフォーマンス影響が顕在化した場合に対応

### Accessibility (Minor)
- SVGチャート: `<desc>` 要素が未設定（`role="img"` + `aria-label` は設定済み）

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
| Structured data (JSON-LD) | Organization + WebSite + WebApplication + FAQ + HowTo + BreadcrumbList |
| robots.txt | 12 AI crawlers explicitly allowed |
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
| Timeout protection | AbortSignal on all external fetches (10-25s) |
| CORS | Proper headers on all API routes |
| Error sanitization | User input not reflected in error messages |
| Error logging | console.error in all API catch blocks |

## Accessibility

| Check | Status |
|-------|--------|
| Skip-to-content link | Present in root layout |
| role="alert" on errors | error.tsx + global-error.tsx |
| role="status" on loading | loading.tsx + check-client.tsx |
| aria-label on inputs | All form inputs |
| aria-pressed on toggles | Feedback type buttons |
| aria-expanded on accordions | Header menu + AllFixCodes |
| aria-controls on menus | Guides dropdown + mobile nav |
| Semantic HTML | Proper headings, landmarks, table scope |
| Color contrast | White on black base, text-white/50+ for secondary |
| Focus states | Present on all interactive elements |
| Keyboard navigation | Cmd+K shortcut, Escape closes menus, arrow keys in autocomplete |

## Design System Compliance

| Rule | Status |
|------|--------|
| Background: #000000 | bg-black throughout |
| Text: white base | text-white, text-white/70, text-white/50 |
| No emojis | Verified: 0 emoji usage |
| No icon libraries | Verified: custom SVG only, no Lucide/Heroicons |
| Cards: bg-white/5 border-white/10 | Consistent across all pages |
| Hover: cursor-pointer + transition | All interactive elements |
| Font: 16px+, line-height 1.5-1.75 | text-base+ with leading-relaxed |
