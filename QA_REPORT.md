# QA Report - AI Check (web-url-a)

**Date**: 2026-03-14 02:30 (Night 46 QA)
**Tester**: Claude Code (automated QA)

## Checklist

- [x] `npm run build` 成功 (44 routes, 0 errors)
- [x] `npm run lint` エラーなし
- [x] レスポンシブ対応（モバイル・デスクトップ） - Tailwind breakpoints (sm/md/lg) 全ページ
- [x] favicon, OGP設定 - icon.tsx, apple-icon.tsx, opengraph-image.tsx (1200x630)
- [x] 404ページ - not-found.tsx (メタデータ付き、関連リンク表示)
- [x] ローディング状態の表示 - loading.tsx (spinner + aria-label)
- [x] エラー状態の表示 - error.tsx + global-error.tsx (role="alert", retry/home)

## 修正した問題

### 1. デザインシステム違反: Hero badge の赤色使用 (Medium)
- `src/app/page.tsx` line 141: `border-red-500/30 bg-red-500/10 text-red-400` を primary カラーに変更
- 装飾目的の赤色がアクセントカラー1色ルールに違反

### 2. デザインシステム違反: Before/After セクションの赤/緑 (Medium)
- `src/app/page.tsx` lines 336-346: GEO対策なし(赤)/あり(緑) を white/opacity と primary に変更
- 装飾的な対比色がデザインシステムルールに違反

### 3. デザインシステム違反: LINE シェアボタン (Medium)
- `src/app/check/check-client.tsx` line 468: `#06C755` (LINE green) を primary カラーに変更

## 確認済み項目 (問題なし)

### SEO/AI対応
- メタデータ: 全ページに title, description, canonical, OGP 設定済み
- JSON-LD: Organization, WebSite, WebApplication, FAQPage, HowTo, BreadcrumbList
- robots.ts: 16種類のAIクローラー許可
- sitemap.ts: 43 routes, 適切な priority/changeFrequency
- llms.txt: 100+ 行のAI向けサイト説明
- agent.json: A2A Agent Card v4.6.0, 94 capabilities

### セキュリティ
- SSRF保護: isPrivateHostname() でプライベートIP/ホスト名ブロック
- レート制限: 全APIエンドポイントにIP ベース制限 + レスポンスヘッダー
- 入力バリデーション: URL長2048文字、プロトコル検証、JSON形式チェック
- CORS: corsHeaders + OPTIONS ハンドラー
- Badge style: ホワイトリスト検証 ("flat"/"card")

### アクセシビリティ
- Skip-to-content リンク
- ARIA: role="alert", aria-label, navigation, status
- キーボード: Cmd/Ctrl+K, Escape, Arrow keys
- セマンティックHTML: header, main, footer, nav
- カラーコントラスト: White on black = 21:1 (AAA)

### エッジケース
- 空入力: バリデーションメッセージ + disabled button
- 長文入力: maxLength 制限 (URL: 2048, feedback: 2000)
- 不正URL: try/catch + エラー表示
- 特殊文字: encodeURIComponent, XML escape (SVG)
- バッチ: max 10 URLs, 15s/URL timeout

### パフォーマンス
- Server Components デフォルト、"use client" は最小限
- Suspense でコード分割
- 静的生成 44 ページ
- API に maxDuration 設定

## 許容事項
- check-report-sections.tsx 等のステータスカラー (green/yellow/red): Pass/Warn/Fail のセマンティックカラーであり装飾目的ではないため許容
- public/robots.txt, public/llms.txt のドメイン参照: Next.js 生成版が優先されるため実影響なし

## Verdict

**PASS** - 全チェック項目クリア。デザインシステム違反3件を修正済み。本番デプロイ可能。
