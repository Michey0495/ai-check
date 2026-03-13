# QA Report - AI Check (web-url-a)

**Date**: 2026-03-14 01:32 (Night 45 QA)
**Tester**: Claude Code (automated QA)

## Checklist

- [x] `npm run build` 成功
- [x] `npm run lint` エラーなし
- [x] レスポンシブ対応（モバイル・デスクトップ） - Tailwind breakpoints (sm/md/lg) 全ページ
- [x] favicon, OGP設定 - icon.tsx, apple-icon.tsx, opengraph-image.tsx, manifest.json
- [x] 404ページ - not-found.tsx (メタデータ付き、関連リンク表示)
- [x] ローディング状態の表示 - loading.tsx (spinner + aria-label), check-client.tsx (7項目アニメーション)
- [x] エラー状態の表示 - error.tsx + global-error.tsx + API各エンドポイント

## 修正した問題 (2件)

### 1. Badge API style パラメータ未検証 (High)
- `src/app/api/badge/route.ts`: style パラメータを "flat"/"card" のホワイトリストで検証するよう修正
- 任意の値がSVG生成に渡される可能性があった

### 2. Feedback 文字数制限の不一致 (Low)
- `src/app/api/feedback/route.ts`: サーバー側上限を5000→2000に変更
- クライアント側 (feedback-widget.tsx) の maxLength=2000 と統一

## 確認済み項目

### ビルド & コード品質
- TypeScript strict mode: エラーなし
- ESLint: エラーなし
- 44ページ静的生成成功
- Division-by-zero: `getGrade()` に maxScore===0 ガード済み

### SEO/AI対応
- メタデータ: 全ページに title, description, canonical, OGP 設定済み
- JSON-LD: Organization, WebSite, WebApplication, FAQPage, HowTo, BreadcrumbList
- robots.ts: 16種類のAIクローラー許可
- sitemap.ts: 全ルート網羅
- llms.txt: 120行の包括的AI向けサイト説明
- agent.json: A2A Agent Card v4.4.0, 92 capabilities
- manifest.json: PWA対応

### セキュリティ
- SSRF保護: isPrivateHostname() でプライベートIP/ホスト名ブロック
- レート制限: IP ベース + レスポンスヘッダー
- 入力バリデーション: URL長2048文字、プロトコル検証、JSON形式チェック
- CORS: corsHeaders + OPTIONS ハンドラー
- X-Content-Type-Options: nosniff

### アクセシビリティ
- Skip-to-content リンク
- ARIA labels: navigation, progressbar, dialog, status, alert
- キーボードナビゲーション: Cmd/Ctrl+K, Escape, Arrow keys
- セマンティックHTML: header, main, footer, nav
- Focus states 設定済み

### エッジケース (URL入力)
- 空入力: バリデーションメッセージ表示
- 長文入力: maxLength=2048 制限
- プロトコルなし: 自動で https:// 付与
- 不正URL: try/catch でエラー表示
- 特殊文字: encodeURIComponent でエスケープ

### パフォーマンス
- Server Components デフォルト
- "use client" は必要な箇所のみ
- Suspense でコード分割
- 静的生成 (SSG/ISR) 最大活用
- API レスポンスに Cache-Control ヘッダー

## 低優先度の改善提案

| # | 提案 | 理由 |
|---|------|------|
| 1 | 生成ツールの URL フォーマット検証 | クライアントサイドテキスト生成のためセキュリティリスクなし。UX改善として有効 |
| 2 | CSV エクスポート失敗時のフィードバック | compare ページでデータ不足時にサイレントリターン |
| 3 | バッジ画像読み込み失敗時のエラー表示 | badge generator の img onError が display:none のみ |

## Verdict

**PASS** - 全チェック項目クリア。重複robots.txt削除を実施。本番デプロイ可能。
