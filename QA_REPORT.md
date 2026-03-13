# QA Report - web-url-a (AI Check)

**Date**: 2026-03-14
**Project**: AI Check - AI検索対応度チェッカー & GEO対策ツール
**QA Engineer**: Claude (automated)

## チェックリスト

- [x] `npm run build` 成功 (44ページ、7.2秒、エラー/警告なし)
- [x] `npm run lint` エラーなし
- [x] レスポンシブ対応（モバイル・デスクトップ）- Tailwind responsive classes 適切に使用
- [x] favicon, OGP設定 - 動的icon.tsx/apple-icon.tsx、OGP画像生成あり
- [x] 404ページ - not-found.tsx 実装済み、ナビゲーションリンク付き
- [x] ローディング状態の表示 - loading.tsx 実装済み（スピナー、aria-label付き）
- [x] エラー状態の表示 - error.tsx, global-error.tsx 両方実装済み

## 詳細チェック結果

### 1. ビルド & Lint
- `npm run build`: 成功（44ページ生成、Turbopack使用）
- `npm run lint`: エラー・警告なし
- TypeScript strict mode: OK
- ビルドサイズ: 25MB（.next/）、最大チャンク218KB（React framework bundle）

### 2. UI / レイアウト
- 全ページがデザインシステム準拠（背景#000、白テキスト、アクセントカラー1色）
- 絵文字なし（⚠はエクスポートテキストレポート内のUnicode記号のみ、UI非表示）
- アイコンライブラリ不使用（SVGは手書きのみ: ハンバーガーメニュー、ドロップダウン矢印）
- カード: `bg-white/5 border border-white/10` 統一
- ホバー: `cursor-pointer transition-all duration-200` 統一

### 3. SEO / メタデータ
- title, description, keywords: 充実（108キーワード）
- Open Graph: title, description, url, image, locale, type 設定済み
- Twitter Card: summary_large_image 設定済み
- canonical URL: 設定済み
- metadataBase: 設定済み

### 4. 構造化データ (JSON-LD)
- Organization, WebSite, WebApplication: layout.tsx
- FAQPage, HowTo: page.tsx（トップページ）
- BreadcrumbList: check/page.tsx

### 5. AI-First 必須ファイル
| ファイル | 状態 |
|---------|------|
| `/api/mcp` | 実装済み (5ツール) |
| `/.well-known/agent.json` | 設置済み (public/) |
| `/llms.txt` | 設置済み (public/) |
| `/robots.txt` | 動的生成 (robots.ts、15種AIクローラー対応) |
| `/sitemap.xml` | 動的生成 (sitemap.ts、43URL) |
| `/manifest.json` | 設置済み (PWA対応) |

### 6. アクセシビリティ
- skip-to-content リンク: 実装済み
- ARIA属性: フォーム、ドロップダウン、モバイルメニューに適切に設定
- キーボード操作: Escape/ArrowDown/ArrowUp/Enter 対応
- Cmd+K ショートカット: URL入力フォーカス
- role="alert": エラー表示
- role="status": ローディング表示
- aria-live="polite": チェック中表示
- aria-label: モバイルメニューボタン、URL入力

### 7. エッジケース処理
- 空入力: バリデーションエラー表示
- URL正規化: `https://` 自動付与
- プロトコル検証: http/httpsのみ許可
- 入力文字数制限: maxLength=2048
- APIレート制限: IP単位（check-engine/security.ts）
- SSRF防御: isPrivateHostname チェック
- キャンセル処理: fetchにcancelledフラグ

### 8. パフォーマンス
- DNS prefetch: Google Analytics ドメイン
- フォント: display: "swap" (FOUT防止)
- 画像: loading="lazy" decoding="async"
- 印刷対応: @media print スタイル実装
- Server Components: デフォルト使用、"use client" は必要箇所のみ
- Suspense: CheckPageClient で適切に使用

### 9. レスポンシブデザイン
- モバイルメニュー: sm: ブレークポイントで切り替え
- グリッドレイアウト: grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3/4
- フォームサイズ: lg/sm バリアント対応

## 発見した問題と対応

### 修正済み

| # | 重要度 | 問題 | 対応 |
|---|--------|------|------|
| 1 | Medium | `public/robots.txt` が古いドメインを参照（前回QAで修正済み） | 静的ファイル削除、動的版に統一 |
| 2 | High | プライバシーポリシーの最終更新日が `2026年3月9日` で古い | `2026年3月14日` に更新 |
| 3 | Medium | ガイド7ページ、生成ツール5ページ、比較ページ、プライバシーページでOpenGraph `images` が未設定 | 14ページすべてに `og:image` を追加 |

### 残存（低優先度・対応不要）

| # | 重要度 | 問題 | 備考 |
|---|--------|------|------|
| 1 | Low | `check/[indicator]/page.tsx` の `datePublished: "2026-03-07"` がハードコード | スキーマ上の初回公開日なので正確。`dateModified` は `2026-03-14` で最新 |
| 2 | Low | 開発者ページのAPIレスポンス例にハードコード日付 | ドキュメント内の例示のため問題なし |

## 総合評価

プロジェクトは本番リリース品質。ビルド・Lintクリーン、SEO/GEO対策は包括的（全ページOGP画像設定済み）、アクセシビリティも基本対応済み、デザインシステム完全準拠。発見した3件の問題はすべて修正済み。
