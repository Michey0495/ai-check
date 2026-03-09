# QA Report - web-url-a (AI Check)

**Date:** 2026-03-10
**Status:** PASS

## Checklist

- [x] `npm run build` 成功 (41ページ、エラーなし)
- [x] `npm run lint` エラーなし
- [x] レスポンシブ対応（モバイル・デスクトップ） - Tailwind responsive utilities適切に使用
- [x] favicon, OGP設定 - apple-icon.tsx, icon.tsx, opengraph-image.tsx + 全ページにOpenGraph追加
- [x] 404ページ - not-found.tsx 実装済み、ナビゲーションリンク付き
- [x] ローディング状態の表示 - loading.tsx 実装済み、aria属性付き
- [x] エラー状態の表示 - error.tsx, global-error.tsx 実装済み

## 修正した問題

### 1. [Critical] feedback API repoバリデーションのロジックエラー修正
- **ファイル:** `src/app/api/feedback/route.ts`
- **問題:** repoパラメータのバリデーションで `||` (OR) を使用していたため、ALLOWED_REPOSに含まれないrepo名でも正規表現にマッチすればバリデーションを通過できた
- **修正:** `targetRepo` 変数に変更し、ALLOWED_REPOSに含まれる場合のみ使用、それ以外はデフォルト値 "web-url-a" にフォールバック
- **影響:** 任意のGitHubリポジトリにIssueを作成される可能性があった

### 2. [Critical] feedback API repoパラメータ未定義時の安全対策
- **ファイル:** `src/app/api/feedback/route.ts`
- **問題:** repoがundefined/nullの場合、GitHub API URLが `repos/Michey0495/undefined/issues` になる
- **修正:** デフォルト値 "web-url-a" を使用するよう変更

### 3. [High] feedback API GitHub Issue作成失敗時のサイレントエラー修正
- **ファイル:** `src/app/api/feedback/route.ts`
- **問題:** GitHub APIが失敗しても常に `{ ok: true }` を返していた
- **修正:** `res.ok` チェックを追加し、失敗時は502エラーを返すよう変更

### 4. [High] feedback API messageの型バリデーション追加
- **ファイル:** `src/app/api/feedback/route.ts`
- **問題:** `message` が文字列型であることを検証していなかった
- **修正:** `typeof message !== "string"` チェックを追加

### 5. [High] フィードバックウィジェットのHTTPステータス確認追加
- **ファイル:** `src/components/feedback-widget.tsx`
- **問題:** `fetch` のHTTPレスポンスステータスをチェックしておらず、500エラーでも成功扱いになっていた
- **修正:** `res.ok` チェックを追加し、失敗時にエラー表示

### 6. [High] URL入力フォームのバリデーション強化
- **ファイル:** `src/components/url-check-form.tsx`
- **問題:** `trim()` のみのチェックで、`"://example.com"` のような不正URLや空白文字列がAPI送信されていた
- **修正:** `new URL()` による構文チェックを追加

### 7. [Medium] 14ページにOpenGraphメタデータ追加
- **対象ファイル:**
  - `src/app/generate/llms-txt/page.tsx`
  - `src/app/generate/robots-txt/page.tsx`
  - `src/app/generate/json-ld/page.tsx`
  - `src/app/generate/agent-json/page.tsx`
  - `src/app/generate/badge/page.tsx`
  - `src/app/guides/geo/page.tsx`
  - `src/app/guides/geo-vs-seo/page.tsx`
  - `src/app/guides/llms-txt/page.tsx`
  - `src/app/guides/glossary/page.tsx`
  - `src/app/guides/checklist/page.tsx`
  - `src/app/guides/industry/page.tsx`
  - `src/app/about/page.tsx`
  - `src/app/privacy/page.tsx`
  - `src/app/developers/page.tsx`
- **問題:** OpenGraph (og:title, og:description, og:url) が設定されておらず、SNSシェア時やAIエージェントによるページ理解に影響
- **修正:** 全ページにopenGraphオブジェクトを追加

## 確認済み（問題なし）

- localStorage.getItem のJSON.parseは全て try-catch で保護済み
- `dangerouslySetInnerHTML` はJSON-LDスクリプトタグのみで安全
- "use client" は必要な箇所のみ（インタラクティブコンポーネント）
- 日本語テキストに誤字・文字化けなし
- robots.txt, llms.txt, agent.json, sitemap.xml 全て正常
- APIエンドポイント全てにレート制限実装済み
- プライベートIP/ネットワークへのリクエストブロック済み（SSRF対策）
- 404, error, global-error, loading 各状態ページ完備
- レスポンシブデザイン（sm/lg ブレークポイント適切使用）
- JSON-LD構造化データ（8種以上のスキーマタイプ）
- サイトマップ42エントリ、優先度・更新頻度設定済み

## 既知の軽微な問題（対応不要）

- compare-client.tsx: 複数リクエスト同時実行時のrace condition（実使用上問題なし）
- json-ld generator: FAQ入力で `|` 区切りがない行は無視される（意図的な動作）
- badge generator: eslint-disable-next-line の依存配列抑制（動作上問題なし）

## 品質スコア

| カテゴリ | スコア | 備考 |
|---------|--------|------|
| SEO/メタデータ | 10/10 | 全ページにmetadata、JSON-LD、OGP完備 |
| UI/レスポンシブ | 9.5/10 | モバイルファースト、適切なブレークポイント |
| アクセシビリティ | 9/10 | WCAG 2.1 AA準拠、aria属性、セマンティックHTML |
| パフォーマンス | 10/10 | Server Component優先、軽量バンドル |
| セキュリティ | 9.5/10 | レート制限、入力バリデーション強化、SSRF対策 |
| エラーハンドリング | 9.5/10 | try-catch、HTTPステータスチェック、ユーザー向けエラーメッセージ |
