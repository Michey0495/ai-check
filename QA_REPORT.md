# QA Report - web-url-a (AI Check)

**Date:** 2026-03-12 (Night 36 QA Pass)
**Project:** AI Check (GEO Score Analyzer)
**Domain:** ai-check.ezoai.jp

## Build & Lint

| Check | Status |
|-------|--------|
| `npm run build` | PASS (43 static pages, compiled in 7.4s) |
| `npm run lint` | PASS (0 errors, 0 warnings) |

## Night 36 Fixes

### MEDIUM: Batch API Error Message Exposure (Security)
- **File:** `src/app/api/check/batch/route.ts:44`
- **Issue:** ユーザー入力がエラーメッセージにそのまま反映されていた。オブジェクト型を送信した場合に`[object Object]`が表示される等の情報漏洩リスク
- **Fix:** 入力値をエラーメッセージに含めないよう変更（固定メッセージ化）

### MEDIUM: Clipboard Operation False Success
- **Files:** `src/app/generate/llms-txt/generator-client.tsx`, `src/app/generate/robots-txt/generator-client.tsx`, `src/app/generate/json-ld/generator-client.tsx`, `src/app/generate/agent-json/generator-client.tsx`, `src/app/generate/badge/generator-client.tsx`
- **Issue:** `navigator.clipboard.writeText().catch(() => {})` でエラーを無視し、クリップボードアクセス失敗時も「コピー済み」と表示
- **Fix:** `.then()` チェーンで成功時のみ「コピー済み」を表示するよう修正

### LOW: Feedback Widget Missing Loading State
- **File:** `src/components/feedback-widget.tsx`
- **Issue:** 送信中のローディング状態がなく、二重送信が可能
- **Fix:** `submitting` state追加、送信中はボタンを無効化し「送信中...」を表示、空メッセージ時もボタン無効化

## Known Issues (Not Fixed - Low Priority)

### Performance
- `check-client.tsx` (2095行) - 大きなコンポーネント。将来的にファイル分割を検討
- `React.memo` の使用なし - パフォーマンス影響が顕在化した場合に対応
- 一部のインラインアロー関数 - `useCallback` 化で最適化可能

### Accessibility (Minor)
- フィードバックダイアログ: フォーカストラップ未実装
- SVGチャート: `<desc>` 要素が未設定（`role="img"` + `aria-label` は設定済み）
- ヘッダーメニューボタン: `aria-controls` 属性が未設定

## Previous Night Fixes (History)

### Night 34
- Stats Grid responsive修正（再発対応）
- Placeholder text contrast向上（WCAG AA準拠）
- Inline object allocation最適化（module-level constants化）

### Night 33
- FAQ Accordion `aria-labelledby` 追加

### Night 32
- MCP Route input sanitization（セキュリティ）
- MCP Route schema type validation
- MCP Route array entry validation
- Stats Grid responsive対応
- Low contrast text修正（WCAG）
- SVG Charts accessibility attributes追加
- Badge Generator URL正規化
- JSON-LD Generator FAQ parsing修正

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
| Structured data (JSON-LD) | Organization + WebSite (SearchAction) |
| robots.txt | 12 AI crawlers explicitly allowed |
| sitemap.xml | 43 URLs with priority/changeFrequency |
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

## Accessibility

| Check | Status |
|-------|--------|
| Skip-to-content link | Present in root layout |
| role="alert" on errors | error.tsx + global-error.tsx |
| role="status" on loading | loading.tsx + check-client.tsx |
| aria-label on inputs | All form inputs |
| aria-pressed on toggles | Feedback type buttons |
| aria-expanded on accordions | Header menu + AllFixCodes |
| Semantic HTML | Proper headings, landmarks, table scope |
| Color contrast | White on black base, text-white/50+ for secondary |
| Focus states | Present on all interactive elements |
| Keyboard navigation | Cmd+K shortcut, Escape closes menus, arrow keys in autocomplete |
