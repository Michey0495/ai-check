# QA Report - web-url-a (AI Check)

**Date**: 2026-03-16 (10th QA pass)
**Project**: web-url-a (ai-check.ezoai.jp)

## Summary

8 issues found and fixed. Build and lint pass cleanly.

## Checklist

- [x] `npm run build` - 成功 (44ページ生成、TypeScriptエラーなし)
- [x] `npm run lint` - エラーなし
- [x] レスポンシブ対応 - Tailwindのレスポンシブクラス適切に使用
- [x] favicon, OGP設定 - apple-icon.tsx, icon.tsx, opengraph-image.tsx 全ルートに設定済み
- [x] 404ページ - not-found.tsx 実装済み (メタデータ付き)
- [x] ローディング状態 - loading.tsx 実装済み (aria-label付きスピナー)
- [x] エラー状態 - error.tsx, global-error.tsx 両方実装済み

## Issues Found & Fixed (Pass 10)

### Critical

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | `public/robots.txt` が `src/app/robots.ts` をシャドウし、誤ったドメイン (`web-url-a.ezoai.jp`) とクローラー名 (`Claude-Web`) が配信されていた | `public/robots.txt` | 静的ファイルを削除。動的 `robots.ts`（正しいドメイン・クローラー名）が配信される |
| 2 | `x-batch-internal: 1` ヘッダーを外部から設定するだけでレートリミットを完全にバイパス可能 | `src/app/api/check/route.ts:77` | 環境変数 `BATCH_INTERNAL_SECRET` によるシークレット検証に変更 |

### High

| # | Issue | File | Fix |
|---|-------|------|-----|
| 3 | `removeEntry` で `JSON.parse` に try/catch なし。localStorage 破損時にクラッシュ | `src/app/history/history-client.tsx:148` | try/catch を追加。破損時は localStorage をクリア |
| 4 | `entry.maxScore` が 0 の場合にゼロ除算で NaN 表示 | `src/components/recent-checks.tsx:58` | `maxScore > 0` ガードを追加 |
| 5 | AbortController 未使用で timeout エラーハンドリングがデッドコード | `src/app/check/check-client.tsx:194` | AbortController を接続し、unmount 時に abort() |

### Medium

| # | Issue | File | Fix |
|---|-------|------|-----|
| 6 | 折りたたみコンテンツがスクリーンリーダーに公開されたまま | `src/app/check/check-sections.tsx:54` | `aria-hidden` 属性を追加 |
| 7 | 比較ページで URL バリデーションなし | `src/app/check/compare/compare-client.tsx:234` | `new URL()` による検証を追加 |
| 8 | sitemap の `lastModified` が毎回 `new Date()` で変わりクロールバジェットを浪費 | `src/app/sitemap.ts:5` | 固定日付 (2026-03-16) に変更 |

## Known Issues (Not Fixed - Deferred)

| # | Issue | Severity | Reason |
|---|-------|----------|--------|
| 1 | DNS rebinding による SSRF（ホスト名文字列のみチェック、解決済みIPは未検証） | Medium | `dns.resolve` による事前解決が必要。アーキテクチャ変更を伴うため別タスクで対応推奨 |
| 2 | `/api/generate` と `/api/mcp` にレートリミットなし | Medium | 生成系はリソース消費が軽微。トラフィック増加時に対応 |
| 3 | インメモリ Map によるレートリミットはサーバーレス環境で非効率 | Low | Vercel KV/Upstash 等の外部ストア導入で対応推奨 |
| 4 | `manifest.json` に 192x192/512x512 アイコンなし（PWA Lighthouse 警告） | Low | 動的アイコン生成のみ。必要時に追加 |
| 5 | `agent.json` バージョン (5.5.0) と `package.json` (0.1.0) の不一致 | Low | 確認推奨 |
| 6 | 全クライアントで `navigator.clipboard.writeText` の失敗が無視される | Low | 非 HTTPS 環境でコピー失敗のフィードバックなし |
| 7 | ドメイン `ai-check.ezoai.jp` がクライアントコード内にハードコード | Low | 環境変数化推奨だが現時点では動作に影響なし |

## SEO & AI-First Status

- [x] Metadata: 全ページに title, description, OGP 設定済み
- [x] JSON-LD: Organization, WebSite, FAQ, HowTo, WebApplication スキーマ
- [x] Dynamic OG images: 全ルートに `opengraph-image.tsx`
- [x] robots.ts: 16 AI クローラーを明示許可
- [x] sitemap.ts: 全32ページカバー
- [x] llms.txt: 設置済み
- [x] agent.json: 設置済み (.well-known)
- [x] /api/mcp: MCP Server エンドポイント
- [x] Google Analytics: 設定済み

## Previous Passes

### Pass 8 (2026-03-15)
1. クリップボード操作の誤表示 (High) - 修正済み
2. Favicon URL セキュリティ検証なし (Medium) - 修正済み
3. スコア進捗バーのゼロ除算 (Low) - 修正済み

### Pass 9 (2026-03-16)
No new issues found.
