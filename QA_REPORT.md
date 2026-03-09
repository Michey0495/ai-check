# QA Report - web-url-a (AI Check)

**Date:** 2026-03-10 (7th pass)
**Status:** PASS

## Checklist

- [x] `npm run build` 成功 (42ページ、エラーなし)
- [x] `npm run lint` エラーなし
- [x] レスポンシブ対応（モバイル・デスクトップ）
- [x] favicon, OGP設定 (apple-icon.tsx, icon.tsx, opengraph-image.tsx)
- [x] 404ページ (not-found.tsx)
- [x] ローディング状態の表示 (loading.tsx)
- [x] エラー状態の表示 (error.tsx, global-error.tsx)

## 今回修正した問題 (7th pass)

| # | Severity | Issue | File | Fix |
|---|----------|-------|------|-----|
| 1 | High | React Compiler lint errors: `useCallback` + `entries` dependency caused `react-hooks/preserve-manual-memoization` (2 errors, 1 warning) | history-client.tsx | `useCallback` を除去。`removeEntry` は直接 localStorage から読み取るように変更。`clearHistory` も簡素化 |

## 前回までの修正済み

### 6th pass
- Form label accessibility (htmlFor/id) for all generator forms
- Badge generator: radiogroup ARIA role
- Copyright year dynamic (`new Date().getFullYear()`)


### 5th pass
- MCP API: CORS headers on all JSON-RPC responses
- MCP API: separate try/catch for request.json() returning -32700
- CheckHistory: division by zero guard (maxScore > 0)

### 4th pass
- SSRF: IPv6 private address blocking (fe80::, fc00::, fd00::, ::ffff: mapped)
- SVG badge XSS sanitization (`escapeXml()`)
- Badge API URL protocol validation
- CORS headers on all check/generate API error responses
- `request.json()` error handling in check API
- URL form protocol validation client-side
- Invalid URL form error messaging with `role="alert"`
- Clipboard API rejection handling in 8 files
- localStorage QuotaExceededError handling
- Division by zero guards in ScoreCircle and badge API
- `dateModified`/`lastmod` using fixed dates
- `aria-expanded` on expand/collapse buttons
- Escape key handler for mobile menu

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
- CORS: 全APIレスポンスにcorsHeaders設定（check, generate, feedback, mcp）

### Accessibility
- スキップナビゲーション, lang="ja", aria-label, aria-expanded, role, aria-live
- 全ジェネレーターフォームのlabel-input関連付け完了

## 既知の軽微な問題（対応不要）

- Desktop guides dropdown: arrow key navigation未実装 (tab navで動作)
- Mobile menu: focus trap未実装 (nav menu, not modal)
- `useSyncExternalStore` with `getHistory()`: new array on each call (minor re-renders)
- In-memory rate limiters: serverless cold start でリセット (現時点で許容)
- Breadcrumb JSON-LD: 1 item only on home page
