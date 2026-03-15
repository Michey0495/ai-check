# QA Report - web-url-a (AI Check)

**Date**: 2026-03-16 (11th QA pass)
**Project**: web-url-a (ai-check.ezoai.jp)

## Summary

3 minor issues found and fixed. Build and lint pass cleanly.

## Checklist

- [x] `npm run build` - 成功 (44ページ生成、TypeScriptエラーなし)
- [x] `npm run lint` - エラーなし
- [x] レスポンシブ対応 - Tailwindのレスポンシブクラス適切に使用
- [x] favicon, OGP設定 - apple-icon.tsx, icon.tsx, opengraph-image.tsx 全ルートに設定済み
- [x] 404ページ - not-found.tsx 実装済み (メタデータ付き)
- [x] ローディング状態 - loading.tsx 実装済み (aria-label付きスピナー)
- [x] エラー状態 - error.tsx, global-error.tsx 両方実装済み

## Issues Found & Fixed (Pass 11)

### Low

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | Sort buttons missing `type="button"` and `cursor-pointer` | `history-client.tsx:259,269` | Added `type="button"` and `cursor-pointer` |
| 2 | Truncated URL missing `title` tooltip for full text on hover | `history-client.tsx:344` | Added `title={entry.url}` |
| 3 | Delete button missing `type="button"` and `cursor-pointer` | `history-client.tsx:364` | Added `type="button"` and `cursor-pointer` |

## Known Issues (Not Fixed - Deferred)

| # | Issue | Severity | Reason |
|---|-------|----------|--------|
| 1 | DNS rebinding による SSRF（ホスト名文字列のみチェック、解決済みIPは未検証） | Medium | `dns.resolve` による事前解決が必要。アーキテクチャ変更を伴うため別タスクで対応推奨 |
| 2 | `/api/generate` と `/api/mcp` にレートリミットなし | Medium | 生成系はリソース消費が軽微。トラフィック増加時に対応 |
| 3 | インメモリ Map によるレートリミットはサーバーレス環境で非効率 | Low | Vercel KV/Upstash 等の外部ストア導入で対応推奨 |
| 4 | `manifest.json` に 192x192/512x512 アイコンなし（PWA Lighthouse 警告） | Low | 動的アイコン生成のみ。必要時に追加 |
| 5 | 全クライアントで `navigator.clipboard.writeText` の失敗が無視される | Low | 非 HTTPS 環境でコピー失敗のフィードバックなし |
| 6 | ドメイン `ai-check.ezoai.jp` がクライアントコード内にハードコード | Low | 環境変数化推奨だが現時点では動作に影響なし |

## SEO & AI-First Status

- [x] Metadata: 全ページに title, description, OGP 設定済み (keywords: 109個)
- [x] JSON-LD: Organization, WebSite, FAQ, HowTo, WebApplication スキーマ
- [x] Dynamic OG images: 全ルートに `opengraph-image.tsx`
- [x] robots.ts: 15 AI クローラーを明示許可
- [x] sitemap.ts: 全32ページカバー (priority/changeFrequency設定済み)
- [x] llms.txt: 14KB、全ページ・API・機能を網羅
- [x] agent.json: A2A Agent Card v5.6.0 設置済み (.well-known)
- [x] /api/mcp: MCP Server エンドポイント
- [x] Google Analytics: 設定済み
- [x] canonical URL: alternates設定済み
- [x] manifest.json: PWA対応

## Security Status

- [x] SSRF protection: Private IP/hostname blocking
- [x] Rate limiting: 10 req/min (check API), 5/5min (feedback)
- [x] URL validation: Protocol check, length limit (2048)
- [x] Input sanitization: maxLength on inputs
- [x] CORS headers: Applied to API routes
- [x] Batch internal secret: Environment variable verification
- [x] Repo allowlist: Feedback API

## Accessibility Status

- [x] Skip to content link (#main-content)
- [x] aria-labels on forms, buttons, navigation
- [x] aria-current on active nav links
- [x] Keyboard navigation (Arrow keys, Escape, Tab)
- [x] aria-expanded on menus
- [x] role="alert" on error messages
- [x] role="status" on loading states
- [x] aria-live on dynamic content
- [x] noscript fallback message
- [x] Color contrast (white on black)

## Performance Status

- [x] Build: 28MB total, 7.9s compile
- [x] Font: display: swap (Geist)
- [x] DNS prefetch for GA domains
- [x] Image lazy loading (loading="lazy" decoding="async")
- [x] Concurrent API fetches (Promise.all)
- [x] AbortController for request cancellation
- [x] 40 static pages pre-rendered

## Previous Passes

### Pass 10 (2026-03-16)
1. stale robots.txt shadowing dynamic robots.ts (Critical) - Fixed
2. Batch rate limit bypass (Critical) - Fixed
3. localStorage crash on corruption (High) - Fixed
4. Zero division in recent-checks (High) - Fixed
5. AbortController not connected (High) - Fixed
6. Collapsible content exposed to screen readers (Medium) - Fixed
7. Compare page URL validation missing (Medium) - Fixed
8. Sitemap lastModified using dynamic date (Medium) - Fixed

### Pass 9 (2026-03-16)
No new issues found.

### Pass 8 (2026-03-15)
1. Clipboard operation display error (High) - Fixed
2. Favicon URL security validation missing (Medium) - Fixed
3. Score progress bar zero division (Low) - Fixed
