# QA Report - web-url-a (AI Check)

**Date:** 2026-03-09
**Tester:** Claude Code (自動QA)

## チェックリスト

- [x] `npm run build` 成功
- [x] `npm run lint` エラーなし (警告0)
- [x] レスポンシブ対応 (モバイル・デスクトップ) - 全ページでsm/lg breakpoint確認済み
- [x] favicon, OGP設定 - icon.tsx, apple-icon.tsx, opengraph-image.tsx 実装済み
- [x] 404ページ - not-found.tsx 実装済み (ナビゲーションカード付き)
- [x] ローディング状態の表示 - loading.tsx + check-client内のloading state
- [x] エラー状態の表示 - error.tsx, global-error.tsx, API error handling

## 発見した問題と対応

### 修正済み

| # | 問題 | ファイル | 対応 |
|---|------|---------|------|
| 1 | 未使用の`corsHeaders`インポート (lint警告) | `src/app/api/generate/route.ts:2` | インポートから削除 |
| 2 | ヒーローバッジのtext-xs (12px) がデザインルール違反 | `src/app/page.tsx:156` | text-smに変更 |
| 3 | 統計ラベルのtext-xs | `src/app/page.tsx:182` | text-smに統一 |
| 4 | ユースケースCTAのtext-xs | `src/app/page.tsx:301` | text-smに変更 |
| 5 | 404ページ説明文のtext-xs | `src/app/not-found.tsx:23,30,37` | text-smに変更 |

### 許容とした項目

| # | 項目 | 理由 |
|---|------|------|
| 1 | `<pre>`コードブロック内のtext-xs | コードブロックは等幅フォントで小さいサイズが標準的 |
| 2 | shadcn/ui コンポーネント(badge, button)のtext-xs | UIコンポーネントライブラリの標準仕様 |
| 3 | 補足的なラベル/注釈のtext-xs (スコア表示、時間表示等) | UIクローム要素として許容範囲 |

## 品質評価

### SEO (5/5)
- メタデータ完備 (title, description, keywords, OGP, Twitter Cards)
- 構造化データ4種 (WebApplication, FAQPage, HowTo, BreadcrumbList)
- サイトマップ 27ルート
- robots.txt, llms.txt, agent.json 実装済み

### アクセシビリティ (4/5)
- スキップリンク実装済み
- ARIA属性適切 (role="alert", aria-live="polite", aria-expanded等)
- フォーム要素にaria-label
- テーブルにaria-label + scope
- 見出し階層 H1>H2>H3 正しい

### デザインシステム準拠 (5/5)
- 背景: #000000 (bg-black)
- テキスト: 白ベース (text-white, text-white/70等)
- 絵文字: なし
- アイコンライブラリ: 未使用
- カード: bg-white/5 border border-white/10 統一
- ホバー: cursor-pointer + transition-all duration-200

### エッジケース (5/5)
- 空入力: trim()チェック
- 長文入力: maxLength=2048
- プロトコルなしURL: https://自動付与
- 特殊文字: encodeURIComponent処理
- ペイロードサイズ制限: API側でガード

## 結論

重大な問題なし。lint警告1件と主要ページのフォントサイズ違反5箇所を修正。
