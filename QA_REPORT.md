# QA Report - web-url-a (AI Check)

**Date:** 2026-03-10 (4th pass)
**Status:** PASS

## Checklist

- [x] `npm run build` 成功 (41ページ、エラーなし)
- [x] `npm run lint` エラーなし
- [x] レスポンシブ対応（モバイル・デスクトップ）
- [x] favicon, OGP設定 (apple-icon.tsx, icon.tsx, opengraph-image.tsx)
- [x] 404ページ (not-found.tsx)
- [x] ローディング状態の表示 (loading.tsx)
- [x] エラー状態の表示 (error.tsx, global-error.tsx)

## 今回修正した問題 (4th pass)

### Security (Critical)

| # | Severity | Issue | File | Fix |
|---|----------|-------|------|-----|
| S1 | High | SSRF: IPv6 private addresses not blocked (fe80::, fc00::, fd00::, ::ffff:127.0.0.1) | api/check/route.ts | Added IPv6 private/link-local range and IPv4-mapped IPv6 blocking |
| S2 | High | SVG badge XSS: grade/score values unsanitized in SVG output | api/badge/route.ts | Added `escapeXml()` sanitization |
| S3 | High | Badge API SSRF: no URL protocol validation | api/badge/route.ts | Added URL parsing and http/https-only validation |
| S4 | Medium | Missing CORS headers on 429/400 error responses | api/check/route.ts | Added `corsHeaders()` to all error responses |
| S5 | Medium | Missing CORS headers on all generate API responses | api/generate/route.ts | Added `corsHeaders()` to all responses |
| S6 | Medium | `request.json()` crash on malformed request body | api/check/route.ts | Wrapped in try/catch with proper 400 error |
| S7 | Medium | URL form allowed non-http protocols client-side | url-check-form.tsx | Added protocol validation |

### Edge Cases

| # | Issue | File | Fix |
|---|-------|------|-----|
| E1 | Silent failure on invalid URL input (no user feedback) | url-check-form.tsx | Added visible error message with `role="alert"` |
| E2 | `navigator.clipboard.writeText` unhandled rejection (8 files) | all generator-clients + check-client | Added `.catch(() => {})` |
| E3 | `localStorage.setItem` QuotaExceededError unhandled | check-client.tsx | Wrapped in try/catch |
| E4 | Division by zero in ScoreCircle (maxScore=0) | check-client.tsx | Added `maxScore > 0` guard |
| E5 | Division by zero in badge API score calculation | api/badge/route.ts | Added `maxScore > 0` guard |

### SEO

| # | Issue | File | Fix |
|---|-------|------|-----|
| SEO1 | `dateModified` using runtime `new Date()` (misleading crawlers) | page.tsx | Changed to fixed date |
| SEO2 | Sitemap `lastModified` using runtime date (all pages appear freshly modified) | sitemap.ts | Changed to fixed date |

### Accessibility

| # | Issue | File | Fix |
|---|-------|------|-----|
| A1 | AllFixCodes expand/collapse button missing `aria-expanded` | check-client.tsx | Added `aria-expanded={open}` |
| A2 | Mobile menu: no Escape key handler | header.tsx | Added Escape key listener |

## 前回までの修正済み

### 3rd pass
- llms.txt のNext.jsバージョン記載ミス修正 (15 -> 16)

### 2nd pass
- loading.tsx アクセシビリティ改善 (role/aria-label追加)
- not-found.tsx メタデータ追加
- FAQ accordion aria-controls設定
- generate API CRLFインジェクション防止
- generate API type パラメータ検証追加
- 全ジェネレーター入力にmaxLength制限追加
- フッターリンクのfocus表示改善

### 1st pass
- feedback API repoバリデーションのロジックエラー修正
- feedback API GitHub Issue作成失敗時のサイレントエラー修正
- feedback API messageの型バリデーション追加
- フィードバックウィジェットのHTTPステータス確認追加
- URL入力フォームのバリデーション強化
- 14ページにOpenGraphメタデータ追加

## 確認済み（問題なし）

### SEO / Metadata
- 全ページにtitle/description/OG/canonical設定済み
- JSON-LD構造化データ (Organization, WebApplication, FAQ, HowTo, BreadcrumbList等)
- robots.txt: AIクローラー許可設定済み + Sitemapディレクティブ
- llms.txt: 75行、サービス概要・API情報・チェック指標記載
- /.well-known/agent.json: A2A Agent Card実装済み
- sitemap.xml: 32エントリ、優先度・更新頻度・lastmod設定済み

### UI / Design System
- 背景色: `bg-black` (純黒)
- テキスト: `text-white`, `text-white/70` 等
- カード: `bg-white/5 border border-white/10`
- ホバー: `cursor-pointer`, `transition-all duration-200` 統一
- SVGインラインのみ（外部アイコンライブラリ不使用）

### Edge Cases / Security
- URL: maxLength=2048, https://自動付与, protocol検証, SSRF防止(IPv4+IPv6), レートリミット
- XSS: React escaping + SVG escapeXml
- CORS: 全APIレスポンスにcorsHeaders設定

### Accessibility
- スキップナビゲーション, lang="ja", aria-label, aria-expanded, role, aria-live

## 既知の軽微な問題（対応不要）

- Desktop guides dropdown: arrow key navigation未実装 (tab navで動作)
- Mobile menu: focus trap未実装 (nav menu, not modal)
- Generator form labels: `htmlFor`/`id` association未設定
- `useSyncExternalStore` with `getHistory()`: new array on each call (minor re-renders)
- In-memory rate limiters: serverless cold start でリセット (現時点で許容)
- Copyright year: 2026ハードコード
- Breadcrumb JSON-LD: 1 item only on home page
