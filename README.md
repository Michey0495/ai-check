# AI Check

AI検索対応度チェッカー & ジェネレーター。URLを入力するだけでWebサイトのGEOスコアを算出し、llms.txt・robots.txt・JSON-LD構造化データを自動生成。

## 技術スタック

- Next.js 15 (App Router)
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui

## セットアップ

```bash
npm install
npm run dev
```

http://localhost:3000 で起動。

## ページ構成

| パス | 説明 |
|------|------|
| `/` | トップページ: URL入力、7指標説明、FAQ |
| `/check` | GEOスコアチェック結果ページ |
| `/check/compare` | 複数サイトGEOスコア比較 |
| `/generate/llms-txt` | llms.txt生成ツール |
| `/generate/robots-txt` | robots.txt生成ツール（AIクローラー対応） |
| `/generate/json-ld` | JSON-LD構造化データ生成ツール |
| `/generate/agent-json` | agent.json (A2A Agent Card) 生成ツール |
| `/guides/geo` | GEO対策ガイド |
| `/guides/geo-vs-seo` | GEO vs SEO比較ガイド |
| `/guides/llms-txt` | llms.txt書き方ガイド |
| `/guides/glossary` | GEO・AI検索用語集 |
| `/about` | サービス概要 |

## チェック指標（7項目）

| 指標 | 重み | 内容 |
|------|------|------|
| AIクローラーアクセス | 15 | robots.txtでAIクローラーを許可しているか |
| llms.txt | 15 | AI向けサイト説明ファイルが存在するか |
| 構造化データ | 20 | JSON-LDが適切に設置されているか |
| メタタグ & 鮮度 | 15 | title, description, OGP等が適切か |
| コンテンツ構造 | 15 | セマンティックHTMLを正しく使用しているか |
| SSR | 10 | サーバーサイドレンダリングされているか |
| サイトマップ | 10 | sitemap.xmlが存在し適切か |

## API

| エンドポイント | メソッド | 説明 |
|---------------|---------|------|
| `/api/check` | POST | URLのGEOスコアチェック |
| `/api/generate` | POST | ファイル生成（llms-txt, robots-txt） |
| `/api/mcp` | POST | MCP Server (JSON-RPC 2.0) |

## AI公開チャネル

- `/llms.txt` - AI向けサイト説明
- `/.well-known/agent.json` - A2A Agent Card
- `/robots.txt` - AIクローラー許可設定
- `/api/mcp` - MCP Server エンドポイント

## デプロイ

```bash
npm run build
```

Vercel にデプロイ。ドメイン: `ai-check.ezoai.jp`

## 開発進捗

### Night 1 (完了)
- プロジェクト初期化 (Next.js 15, Tailwind CSS, shadcn/ui)
- 7指標チェックエンジン（robots.txt, llms.txt, JSON-LD, メタタグ, コンテンツ構造, SSR, サイトマップ）
- GEOスコアチェックページ（URL入力 -> 即座にスコア表示 + 改善コード）
- 4つの生成ツール（llms.txt, robots.txt, JSON-LD, agent.json）
- GEO対策ガイド、llms.txt書き方ガイド
- REST API + MCP Server
- AI公開チャネル (llms.txt, agent.json, robots.txt, MCP)
- SEOメタデータ、OGP、sitemap.xml
- トップページ（ヒーロー、7指標、3ステップ、生成ツール、FAQ）

### Night 2 (完了)
- Google Analytics対応（NEXT_PUBLIC_GA_ID環境変数）
- フィードバックウィジェット + /api/feedback エンドポイント（GitHub Issues連携）
- JSON-LD構造化データ（WebApplication + FAQPage）をトップページに追加
- チェック結果ページUX改善:
  - SVGスコアサークル（アニメーション付きプログレスリング）
  - ローディングアニメーション（チェック項目インジケーター表示）
  - 各指標にスコアバー追加

### Night 3 (完了)
- チェック結果ページ機能強化:
  - レポートコピー・テキストファイルダウンロード機能
  - 改善アクションセクション（影響度順、生成ツールへの直リンク）
  - チェック履歴（localStorage、直近20件保存）
- About page tech stack修正（Next.js 16 → 15）

### Night 4 (完了)
- モバイルナビゲーション（ハンバーガーメニュー）追加
- チェック結果のソーシャルシェア機能（X/Twitter共有、URL共有）
- 複数サイトGEOスコア比較ページ（/check/compare）追加
- チェックAPI改善（並行フェッチ化で高速化、コード整理）
- 全サブページにBreadcrumbList構造化データ（JSON-LD）追加
- GEO対策ガイドにHowTo構造化データ追加
- AI公開チャネル更新（llms.txt, agent.json に比較機能追記）

### Night 5 (完了)
- セキュリティ: チェックAPIにSSRF保護追加（プライベートIP/ホスト名ブロック）
- SEO: 全サブページにcanonical URL追加
- SEO: チェック、比較、About、llms.txtガイドにBreadcrumbList JSON-LD追加
- SEO: AboutページにSoftwareApplication構造化データ追加
- UX: 比較ページのURL入力スロットを動的に追加/削除可能に（2〜5サイト）

### Night 6 (完了)
- コンテンツ: GEO vs SEO比較ガイドページ追加（/guides/geo-vs-seo）- SEOキーワード拡大
- コンテンツ: GEO・AI検索用語集ページ追加（/guides/glossary）- 15用語、DefinedTermSet構造化データ
- セキュリティ: チェックAPIにレート制限追加（IP単位、10リクエスト/分）
- チェック強化: agent.json（A2A Agent Card）の存在検出を構造化データチェックに統合
- SEO: チェック・比較ページのメタデータ強化（OGタグ追加）
- ナビゲーション: フッターに新ページへのリンク追加
- AI公開チャネル: llms.txt, sitemap.xmlを新ページで更新
