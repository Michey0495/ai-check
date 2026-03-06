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
| `/generate/llms-txt` | llms.txt生成ツール |
| `/generate/robots-txt` | robots.txt生成ツール（AIクローラー対応） |
| `/generate/json-ld` | JSON-LD構造化データ生成ツール |
| `/generate/agent-json` | agent.json (A2A Agent Card) 生成ツール |
| `/guides/geo` | GEO対策ガイド |
| `/guides/llms-txt` | llms.txt書き方ガイド |
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
