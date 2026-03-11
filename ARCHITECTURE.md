# Architecture - AI Check

## 設計方針

- MVP: URL入力 -> GEOスコアチェック + 修正コード生成のシンプルなフロー
- SEO重視: 各生成ツール・ガイドページがSEOランディングページとして機能
- AI-First: MCP Server、llms.txt、agent.jsonを初期から搭載
- 外部API依存なし: 全チェックはサーバーサイドのHTTP fetchで完結

## 技術スタック

| 技術 | 用途 |
|------|------|
| Next.js 16 (App Router) | フレームワーク |
| TypeScript (strict) | 言語 |
| Tailwind CSS v4 | スタイリング |
| shadcn/ui | UIコンポーネント |
| Vercel | ホスティング |

## ディレクトリ構造

```
src/
├── app/
│   ├── layout.tsx              # ルートレイアウト（黒背景、メタデータ、GA、JSON-LD）
│   ├── page.tsx                # トップページ（ヒーロー、7指標、3ステップ、FAQ）
│   ├── sitemap.ts              # 動的サイトマップ（21+ページ）
│   ├── loading.tsx             # ローディングUI
│   ├── error.tsx               # エラーバウンダリ
│   ├── not-found.tsx           # 404ページ
│   ├── check/
│   │   ├── page.tsx            # チェックページ（Suspense wrapper）
│   │   ├── check-client.tsx    # チェック結果メイン（Client Component）
│   │   ├── check-utils.ts      # ユーティリティ関数（履歴管理、レポート生成）
│   │   ├── check-sections.tsx   # 共通UIコンポーネント（ScoreCircle、SectionNav等）
│   │   ├── check-report-sections.tsx # レポート表示セクション（16セクション）
│   │   ├── compare/            # 複数サイト比較（2〜5サイト、CSV出力）
│   │   └── [indicator]/page.tsx # チェック項目別SEOランディング（7ページ）
│   ├── generate/
│   │   ├── llms-txt/           # llms.txt生成ツール
│   │   ├── robots-txt/         # robots.txt生成ツール
│   │   ├── json-ld/            # JSON-LD生成ツール（6スキーマタイプ）
│   │   ├── agent-json/         # agent.json生成ツール
│   │   └── badge/              # GEOスコアバッジ生成ツール
│   ├── for/[industry]/page.tsx # 業界別SEOランディング（6ページ）
│   ├── guides/
│   │   ├── geo/                # GEO対策ガイド
│   │   ├── geo-vs-seo/         # GEO vs SEO比較ガイド
│   │   ├── llms-txt/           # llms.txt書き方ガイド
│   │   ├── checklist/          # GEO対策チェックリスト（インタラクティブ）
│   │   ├── industry/           # 業界別GEO対策ガイド
│   │   ├── quick-start/        # 5分で始めるGEO対策
│   │   └── glossary/           # GEO・AI検索用語集
│   ├── about/page.tsx          # サービス概要
│   ├── developers/page.tsx     # API / 開発者向けドキュメント
│   └── api/
│       ├── check/route.ts      # GEOスコアチェックAPI（SSRF保護、レート制限）
│       ├── generate/route.ts   # ファイル生成API
│       ├── mcp/route.ts        # MCP Server (JSON-RPC 2.0, 5ツール)
│       ├── badge/route.ts      # GEOスコアバッジSVG生成
│       └── feedback/route.ts   # フィードバック収集
├── components/
│   ├── header.tsx              # サイトヘッダー（ガイドドロップダウン、アクティブ状態）
│   ├── footer.tsx              # サイトフッター（4カラムリンク）
│   ├── url-check-form.tsx      # URL入力フォーム（Client Component）
│   ├── cta-banner.tsx          # CTAバナー
│   ├── feedback-widget.tsx     # フィードバックウィジェット
│   ├── google-analytics.tsx    # GA追跡スクリプト
│   └── ui/                     # shadcn/ui (button, input, textarea, badge, card, tabs, label, separator)
├── lib/
│   ├── check-indicators.ts     # 7指標定義、型定義、スコア計算
│   ├── zip.ts                  # クライアントサイドZIPファイル生成
│   └── utils.ts                # shadcn/ui ユーティリティ
public/
├── llms.txt                    # AI向けサイト説明
├── robots.txt                  # AIクローラー許可
└── .well-known/
    └── agent.json              # A2A Agent Card v1.5.0
```

## データフロー

```
[ユーザー / AIエージェント]
        │
        ├── UI経由 → /check?url=xxx → CheckPageClient
        │       fetch POST /api/check → サーバーサイドチェック → CheckReport表示
        │       履歴保存（localStorage, 直近20件）、スコアトレンド表示
        │
        ├── UI経由 → /check/compare → CompareClient
        │       複数URL入力（2〜5サイト）→ 並行チェック → 比較テーブル → CSV出力
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
        ├── REST API → GET /api/badge?url=xxx&style=flat|card
        │       SVGバッジ生成 → image/svg+xml
        │
        └── MCP → POST /api/mcp (JSON-RPC 2.0)
                tools/list → 5ツール一覧
                tools/call → check / generate_llms_txt / generate_robots_txt
                              / generate_json_ld / generate_agent_json
```

## チェックエンジン設計

POST /api/check は以下の手順でチェックを実行:

1. URLバリデーション + SSRF保護（プライベートIP/ホスト名ブロック）
2. レート制限（IP単位、10リクエスト/分）
3. 並行フェッチ:
   - robots.txt → AIクローラー（GPTBot, ClaudeBot, PerplexityBot等）のブロック状況確認
   - llms.txt → 存在・内容量確認（llms-full.txt も検出）
   - メインページHTML → JSON-LD / メタタグ / セマンティックHTML / SSR
   - sitemap.xml → 存在・URL数確認
4. 各指標のスコア合算 → グレード（A-F）算出
5. レスポンス: スコア + 結果 + OG画像 + サイトタイトル + favicon + responseTimeMs

## コンポーネント設計

- Server Components: ページ、ヘッダー、フッター（SEO、メタデータ対応）
- Client Components: UrlCheckForm, CheckPageClient, CompareClient, 各Generator, ChecklistClient（フォーム操作、fetch、localStorage）

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
  "checkedAt": "2026-03-07T05:00:00.000Z",
  "responseTimeMs": 1234,
  "ogImage": "https://example.com/og.png",
  "siteTitle": "Example Site",
  "favicon": "https://example.com/favicon.ico"
}
```

### MCP Server: POST /api/mcp

JSON-RPC 2.0 プロトコル。5つのツールを提供:

| ツール名 | 説明 | パラメータ |
|----------|------|-----------|
| `check_geo_score` | GEOスコアチェック | `url`: チェックURL |
| `generate_llms_txt` | llms.txt生成 | `siteName`, `siteUrl`, `description`, `pages` |
| `generate_robots_txt` | robots.txt生成 | `sitemapUrl`, `allowedCrawlers` |
| `generate_json_ld` | JSON-LD生成（6タイプ） | `type`, `data` |
| `generate_agent_json` | agent.json生成 | `name`, `url`, `description`, `capabilities` |

## AI公開チャネル

| チャネル | パス | 目的 |
|----------|------|------|
| MCP Server | `/api/mcp` | AIエージェントが直接ツールとして利用（5ツール） |
| A2A Agent Card | `/.well-known/agent.json` | エージェント間の発見・接続 (v2.4.0) |
| llms.txt | `/llms.txt` | AI向けサイト説明・API仕様 |
| robots.txt | `/robots.txt` | AIクローラー許可 |
| sitemap.xml | `/sitemap.xml` | 動的ページ一覧 |
| Badge API | `/api/badge` | GEOスコアバッジ（SVG埋め込み用） |

## SEO戦略

- トップページ: 「AI検索 対策」「GEO対策」
- /check: 「AI検索 チェック」「GEOスコア」
- /check/compare: 「GEOスコア 比較」「AI検索対応度 比較」
- /generate/llms-txt: 「llms.txt 作り方」「llms.txt 生成」
- /generate/robots-txt: 「robots.txt AIクローラー」
- /generate/json-ld: 「JSON-LD 生成」「構造化データ 自動生成」
- /generate/agent-json: 「agent.json 作り方」
- /generate/badge: 「GEOスコア バッジ」
- /guides/geo: 「GEO対策 ガイド」「AI検索 最適化」
- /guides/geo-vs-seo: 「GEO SEO 違い」「AI検索 SEO」
- /guides/llms-txt: 「llms.txt 書き方」
- /guides/checklist: 「GEO対策 チェックリスト」
- /guides/quick-start: 「GEO対策 始め方」「AI検索対応 5分」
- /guides/glossary: 「GEO 用語集」「AI検索 用語」
- /guides/industry: 「業界別 GEO対策」
- /check/[indicator]: 7つのチェック項目別ランディング
- /for/[industry]: 6つの業界別ランディング（EC, SaaS, メディア, 士業, ローカル, 教育）

## デプロイ

- Vercel (自動デプロイ)
- ドメイン: `ai-check.ezoai.jp`
- DNS: Xserver管理
