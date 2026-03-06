# Architecture - AI Check

## 設計方針

- MVP: URL入力 -> GEOスコアチェック + 修正コード生成のシンプルなフロー
- SEO重視: 各生成ツール・ガイドページがSEOランディングページとして機能
- AI-First: MCP Server、llms.txt、agent.jsonを初期から搭載
- 外部API依存なし: 全チェックはサーバーサイドのHTTP fetchで完結

## 技術スタック

| 技術 | 用途 |
|------|------|
| Next.js 15 (App Router) | フレームワーク |
| TypeScript (strict) | 言語 |
| Tailwind CSS v4 | スタイリング |
| shadcn/ui | UIコンポーネント |
| Vercel | ホスティング |

## ディレクトリ構造

```
src/
├── app/
│   ├── layout.tsx              # ルートレイアウト（黒背景、メタデータ）
│   ├── page.tsx                # トップページ（ヒーロー、7指標、3ステップ、FAQ）
│   ├── sitemap.ts              # 動的サイトマップ
│   ├── check/
│   │   ├── page.tsx            # チェックページ（Suspense wrapper）
│   │   └── check-client.tsx    # チェック結果表示（Client Component）
│   ├── generate/
│   │   ├── llms-txt/           # llms.txt生成ツール
│   │   ├── robots-txt/         # robots.txt生成ツール
│   │   ├── json-ld/            # JSON-LD生成ツール
│   │   └── agent-json/         # agent.json生成ツール
│   ├── guides/
│   │   ├── geo/page.tsx        # GEO対策ガイド
│   │   └── llms-txt/page.tsx   # llms.txt書き方ガイド
│   ├── about/page.tsx          # サービス概要
│   └── api/
│       ├── check/route.ts      # GEOスコアチェックAPI
│       ├── generate/route.ts   # ファイル生成API
│       └── mcp/route.ts        # MCP Server (JSON-RPC 2.0)
├── components/
│   ├── header.tsx              # サイトヘッダー
│   ├── footer.tsx              # サイトフッター
│   ├── url-check-form.tsx      # URL入力フォーム（Client Component）
│   └── ui/                     # shadcn/ui
├── lib/
│   ├── check-indicators.ts     # 7指標定義、型定義、スコア計算
│   └── utils.ts                # shadcn/ui ユーティリティ
public/
├── llms.txt                    # AI向けサイト説明
├── robots.txt                  # AIクローラー許可
└── .well-known/
    └── agent.json              # A2A Agent Card
```

## データフロー

```
[ユーザー / AIエージェント]
        │
        ├── UI経由 → /check?url=xxx → CheckPageClient
        │       fetch POST /api/check → サーバーサイドチェック → CheckReport表示
        │
        ├── UI経由 → /generate/* → 各GeneratorClient
        │       フォーム入力 → クライアントサイド生成 → コピー/ダウンロード
        │
        ├── REST API → POST /api/check
        │       { url } → 7指標チェック → CheckReport JSON response
        │
        ├── REST API → POST /api/generate
        │       { type, data } → ファイル生成 → content + filename
        │
        └── MCP → POST /api/mcp (JSON-RPC 2.0)
                tools/list → ツール一覧
                tools/call → check_geo_score / generate_llms_txt / generate_robots_txt
```

## チェックエンジン設計

POST /api/check は以下の手順でチェックを実行:

1. URLバリデーション
2. robots.txt取得 → AIクローラー（GPTBot, ClaudeBot等）のブロック状況を確認
3. llms.txt取得 → 存在・内容量を確認
4. メインページHTML取得 →
   a. JSON-LD構造化データの存在を確認
   b. メタタグ（title, description, OGP）の存在を確認
   c. セマンティックHTML（h1, article, section, nav, main）の使用を確認
   d. SSR（HTMLにコンテンツが含まれるか）を確認
5. sitemap.xml取得 → 存在・URL数を確認
6. 各指標のスコア合算 → グレード（A-F）算出

## コンポーネント設計

- Server Components: ページ、ヘッダー、フッター（SEO、メタデータ対応）
- Client Components: UrlCheckForm, CheckPageClient, 各Generator（フォーム操作、fetch）

## API設計

### REST API: POST /api/check

```json
// Request
{ "url": "https://example.com" }

// Response (200)
{
  "url": "https://example.com",
  "totalScore": 65,
  "maxScore": 100,
  "grade": "C",
  "results": [
    {
      "id": "robots-txt",
      "score": 15,
      "maxScore": 15,
      "status": "pass",
      "message": "AIクローラーアクセス: 全て許可",
      "details": "...",
      "code": null
    }
  ],
  "checkedAt": "2026-03-07T05:00:00.000Z"
}
```

### MCP Server: POST /api/mcp

JSON-RPC 2.0 プロトコル。3つのツールを提供:

| ツール名 | 説明 | パラメータ |
|----------|------|-----------|
| `check_geo_score` | GEOスコアチェック | `url`: チェックURL |
| `generate_llms_txt` | llms.txt生成 | `siteName`, `siteUrl`, `description`, `pages` |
| `generate_robots_txt` | robots.txt生成 | `sitemapUrl`, `allowedCrawlers` |

## AI公開チャネル

| チャネル | パス | 目的 |
|----------|------|------|
| MCP Server | `/api/mcp` | AIエージェントが直接ツールとして利用 |
| A2A Agent Card | `/.well-known/agent.json` | エージェント間の発見・接続 |
| llms.txt | `/llms.txt` | AI向けサイト説明・API仕様 |
| robots.txt | `/robots.txt` | AIクローラー許可 |
| sitemap.xml | `/sitemap.xml` | 動的ページ一覧 |

## SEO戦略

- トップページ: 「AI検索 対策」「GEO対策」
- /check: 「AI検索 チェック」「GEOスコア」
- /generate/llms-txt: 「llms.txt 作り方」「llms.txt 生成」
- /generate/robots-txt: 「robots.txt AIクローラー」
- /generate/json-ld: 「JSON-LD 生成」「構造化データ 自動生成」
- /generate/agent-json: 「agent.json 作り方」
- /guides/geo: 「GEO対策 ガイド」「AI検索 最適化」
- /guides/llms-txt: 「llms.txt 書き方」

## デプロイ

- Vercel (自動デプロイ)
- ドメイン: `ai-check.ezoai.jp`
- DNS: Xserver管理
