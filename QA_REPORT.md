# QA Report - web-url-a

**Date:** 2026-03-15
**Project:** AI Check (web-url-a)

## Checklist

- [x] `npm run build` 成功
- [x] `npm run lint` エラーなし
- [x] レスポンシブ対応（Tailwind responsive classes確認済み）
- [x] favicon, OGP設定（全ページに動的OGP画像あり）
- [x] 404ページ（`not-found.tsx` 実装済み）
- [x] ローディング状態の表示（`loading.tsx` with aria-label）
- [x] エラー状態の表示（`error.tsx` + `global-error.tsx`）

## SEO

- [x] メタデータ: 107+キーワード、title template、description設定済み
- [x] OGP: 全ページに動的OGP画像生成（`opengraph-image.tsx`）
- [x] 構造化データ: Organization, WebSite, FAQPage, HowTo, BreadcrumbList
- [x] `robots.ts`: AIクローラー（GPTBot, ClaudeBot等）許可
- [x] `sitemap.ts`: 41 URL entries
- [x] `/llms.txt`: AI向けサイト説明
- [x] `/.well-known/agent.json`: A2A Agent Card v5.1.0

## 修正した問題

### 1. parseInt radix指定漏れ (Medium)

`parseInt()` に基数引数(10)が未指定の箇所を修正:

- `src/app/check/check-sections.tsx:277`
- `src/lib/check-engine/analyzers.ts:417`
- `src/lib/check-engine/checkers.ts:429`

### 2. アクセシビリティ: ドロップダウンボタンのaria-label (Low)

- `src/components/header.tsx` - ガイドメニューボタンに `aria-label` を追加

### 3. フォームバリデーション: 空入力時のフィードバック不足 (Low)

- `src/app/generate/llms-txt/generator-client.tsx` - URL空欄時にエラーメッセージ表示
- `src/app/generate/agent-json/generator-client.tsx` - 同上

## 確認済み（問題なし）

- XSS対策: dangerouslySetInnerHTMLはJSON-LDと定義済みデータのみ
- SSRF対策: API routeでSSRFブロック実装済み
- レート制限: IP-based rate limiting（5 req/300sec）
- URL入力: バリデーション、正規化、maxLength制限あり
- スキップリンク: layout.tsxに実装済み
- フォーム: aria-invalid、aria-describedby適切に使用
- エラーハンドリング: API routeで適切なエラーコード返却
