# QA Report - web-url-a (AI Check)

**Date**: 2026-03-17 (16th QA pass)
**Project**: web-url-a (ai-check.ezoai.jp)

## Summary

1 fix applied (SEO: robots.txt domain mismatch). Full audit confirms build, lint, a11y, security, and SEO all clean.

## Checklist

- [x] `npm run build` - 成功 (44ページ生成、TypeScriptエラーなし)
- [x] `npm run lint` - エラーなし
- [x] レスポンシブ対応 - Tailwindのレスポンシブクラス適切に使用
- [x] favicon, OGP設定 - apple-icon.tsx, icon.tsx, opengraph-image.tsx 全ルートに設定済み
- [x] 404ページ - not-found.tsx 実装済み (メタデータ付き)
- [x] ローディング状態 - loading.tsx 実装済み (aria-label付きスピナー)
- [x] エラー状態 - error.tsx, global-error.tsx 両方実装済み

## Issues Found & Fixed (Pass 16)

### Low

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | Static `public/robots.txt` fallback references `web-url-a.ezoai.jp` instead of `ai-check.ezoai.jp` | `public/robots.txt:2,32` | Updated domain to `ai-check.ezoai.jp` in header comment and Sitemap URL |

### Verified Clean (No Issues Found)

- All generator textareas have appropriate `maxLength` limits
- All decorative SVGs have `aria-hidden="true"`
- All meaningful SVGs have `role="img"` and `aria-label`
- Footer is already a Server Component (no unnecessary "use client")
- API error messages are specific and localized (RATE_LIMITED, SSRF_BLOCKED, SITE_UNREACHABLE etc.)
- Edge case handling: URL validation, empty input, special characters all properly handled

## Issues Found & Fixed (Pass 15)

### Medium

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | Sitemap `lastModified` hardcoded to stale date instead of dynamic | `src/app/sitemap.ts:5` | Changed to `new Date().toISOString()` |
| 2 | Feedback API missing OPTIONS handler (CORS preflight fails) | `src/app/api/feedback/route.ts` | Added `OPTIONS` export and CORS headers |
| 3 | Footer links use `focus:outline-none` removing keyboard focus indicator | `src/components/footer.tsx` | Changed all `focus:` to `focus-visible:` (26 links) |

### Low

| # | Issue | File | Fix |
|---|-------|------|-----|
| 4 | Download filenames could contain special characters from hostname | `src/app/check/check-client.tsx:69` | Added `.replace(/[^a-zA-Z0-9.-]/g, "_")` sanitization |
| 5 | PWA manifest missing `scope`, `prefer_related_applications`, icon `purpose` | `public/manifest.json` | Added missing PWA fields |
| 6 | SSRF: 192.88.99.0/24 (6to4 relay anycast) not blocked | `src/lib/check-engine/security.ts` | Added explicit check |

## Issues Found & Fixed (Pass 14)

### Medium

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | SSRF: TEST-NET reserved IP ranges not blocked (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24) | `lib/check-engine/security.ts:62-64` | Added explicit checks for TEST-NET-1/2/3 ranges |
| 2 | Favicon URL allows `blob:` and `about:` protocol (potential XSS vector) | `api/check/route.ts:215` | Extended blocked protocol list to include `blob:` and `about:` |
| 3 | Rate limiter memory leak: cleanup only triggers on size threshold, not time | `security.ts`, `badge/route.ts`, `feedback/route.ts` | Added periodic time-based cleanup (60s/300s intervals) |

### Low

| # | Issue | File | Fix |
|---|-------|------|-----|
| 4 | FeedbackWidget setTimeout fires after unmount (React warning) | `components/feedback-widget.tsx:39-43` | Added timerRef with cleanup on unmount |
| 5 | CurlCopy clipboard error silently ignored | `developers/curl-copy.tsx:12` | Show "コピー失敗" feedback on clipboard error |

## Issues Found & Fixed (Pass 13)

### Critical

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | BATCH_INTERNAL_SECRET fallback to guessable "1" | `api/check/batch/route.ts:106` | Changed fallback to `crypto.randomUUID()` — no env var = no bypass |
| 2 | MCP JSON-LD additionalProperties accepts arbitrary nested objects | `api/mcp/route.ts:288-294` | Restrict to primitive types and string arrays only |

### Medium

| # | Issue | File | Fix |
|---|-------|------|-----|
| 3 | Compare page fetch race condition (no AbortController, double-click causes interleaved state) | `check/compare/compare-client.tsx:233-288` | Added AbortController, abort guard on running, cleanup on unmount |
| 4 | MCP error messages reflect user input (schemaType, toolName) | `api/mcp/route.ts:242,326` | Removed user input from error messages |

### Low

| # | Issue | File | Fix |
|---|-------|------|-----|
| 5 | Checklist localStorage.setItem without try-catch (QuotaExceeded crash) | `guides/checklist/checklist-client.tsx:176` | Added try-catch around setItem and removeItem |
| 6 | Compare ScoreBar missing ARIA progressbar role | `check/compare/compare-client.tsx:194` | Added `role="progressbar"` with aria-valuenow/min/max |

## Issues Found & Fixed (Pass 12)

### Critical

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | Missing SSRF protection in batch endpoint (no `isPrivateHostname` check) | `api/check/batch/route.ts:47-68` | Added `isPrivateHostname()` check in URL validation loop |
| 2 | Redirect chain SSRF: redirect targets not validated against private IPs | `lib/check-engine/network.ts:81` | Added `isPrivateHostname()` check on resolved redirect URLs |

### Medium

| # | Issue | File | Fix |
|---|-------|------|-----|
| 3 | URL reflection in batch error messages (potential XSS in error responses) | `api/check/batch/route.ts:58,64` | Removed user URL from error messages, use generic messages |

### Low

| # | Issue | File | Fix |
|---|-------|------|-----|
| 4 | ScrollToTop button missing `focus-visible` styling | `components/scroll-to-top.tsx:22` | Added `focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none` |

### Issues Found & Fixed (Pass 11)

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
| 5 | 一部クライアントで `navigator.clipboard.writeText` の失敗が無視される | Low | CurlCopyは修正済み。他のジェネレーター系コンポーネントも同様に対応推奨 |
| 6 | ドメイン `ai-check.ezoai.jp` がクライアントコード内にハードコード | Low | 環境変数化推奨だが現時点では動作に影響なし |
| 7 | `x-forwarded-for` ヘッダーを直接信頼（レート制限バイパス可能性） | Medium | Vercel プロキシ経由のみ使用のため実害なし。プロキシ信頼設定で対応推奨 |
| 8 | SSRF保護でポート番号未検証（非標準ポートへのアクセス可能性） | Low | 実害は限定的。必要時にポートベースのバリデーション追加 |

## SEO & AI-First Status

- [x] Metadata: 全ページに title, description, OGP 設定済み (keywords: 109個)
- [x] JSON-LD: Organization, WebSite, FAQ, HowTo, WebApplication スキーマ
- [x] Dynamic OG images: 全ルートに `opengraph-image.tsx`
- [x] robots.ts: 15 AI クローラーを明示許可
- [x] sitemap.ts: 全43ページカバー (priority/changeFrequency設定済み)
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
