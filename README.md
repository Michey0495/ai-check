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
| `/generate/badge` | GEOスコアバッジ生成（SVG、Markdown/HTML埋め込み） |
| `/guides/geo` | GEO対策ガイド |
| `/guides/geo-vs-seo` | GEO vs SEO比較ガイド |
| `/guides/llms-txt` | llms.txt書き方ガイド |
| `/guides/checklist` | GEO対策チェックリスト（インタラクティブ・進捗保存） |
| `/guides/industry` | 業界別GEO対策ガイド（EC・SaaS・メディア・士業・ローカル・教育） |
| `/guides/quick-start` | 5分で始めるGEO対策（クイックスタートガイド） |
| `/guides/glossary` | GEO・AI検索用語集 |
| `/developers` | API / 開発者向けドキュメント |
| `/about` | サービス概要 |
| `/check/robots-txt` | AIクローラーアクセスチェック解説 |
| `/check/llms-txt` | llms.txtチェック解説 |
| `/check/structured-data` | 構造化データチェック解説 |
| `/check/meta-tags` | メタタグチェック解説 |
| `/check/content-structure` | コンテンツ構造チェック解説 |
| `/check/ssr` | SSRチェック解説 |
| `/check/sitemap` | サイトマップチェック解説 |
| `/for/ec` | ECサイト向けGEO対策 |
| `/for/saas` | SaaS向けGEO対策 |
| `/for/media` | メディア向けGEO対策 |
| `/for/professional` | 士業向けGEO対策 |
| `/for/local` | ローカルビジネス向けGEO対策 |
| `/for/education` | 教育向けGEO対策 |

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
| `/api/mcp` | POST | MCP Server (JSON-RPC 2.0) - 5ツール |

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

### Night 7 (完了)
- SEO: 全ガイドページに「関連コンテンツ」セクション追加（内部リンク強化）
- SEO: 全生成ツールページに「他の生成ツール」セクション追加（クロスリンク）
- SEO: トップページFAQを4項目→7項目に拡充（長尾キーワード対策）
- UX: 404ページを改善（主要機能へのリンクカード追加）

### Night 8 (完了)
- コンテンツ: GEO対策チェックリストページ追加（/guides/checklist）- 7カテゴリ・20項目、進捗localStorage保存
- 修正: fabricated aggregateRating をトップページJSON-LDから削除
- パフォーマンス: チェックAPI レスポンスにCache-Controlヘッダー追加（s-maxage=300）
- SEO: sitemap.xml, llms.txt, フッターにチェックリストページ追加
- 内部リンク: GEO vs SEOページの関連コンテンツにチェックリストを追加

### Night 9 (完了)
- コンテンツ: 業界別GEO対策ガイドページ追加（/guides/industry）- EC・SaaS・メディア・士業・ローカルビジネス・教育の6業界、JSON-LD実装例付き
- チェック強化: メタタグチェックにcanonical URL・lang属性の検出を追加
- UX: チェック結果ページに「再チェック」ボタン追加
- UX: チェック結果の各指標に改善ヒント（tip）とツールリンクを表示（fail/warn時）
- SEO: sitemap.xml, llms.txt, フッター, GEO対策ガイドの関連コンテンツに業界別ガイドを追加

### Night 10 (完了)
- 修正: fabricated aggregateRating をトップページJSON-LDから再度削除
- 修正: 競合比較テーブルのプレースホルダーをチェックマーク・ダッシュ記号に置換
- チェック強化: メタタグチェックにog:image・viewport検出を追加
- UX: チェックページに「人気サイトで試してみる」セクション追加（6サイト）
- アクセシビリティ: スキップナビゲーション追加

### Night 11 (完了)
- 修正: fabricated aggregateRating をトップページJSON-LDから再々削除
- ナビゲーション: ヘッダーにガイドドロップダウンメニュー追加（デスクトップ+モバイル対応）
- 内部リンク: トップページ「こんな方に必要です」カードから業界別ガイドへリンク
- チェック強化: llms-full.txt（詳細版）の存在検出をチェックエンジンに追加
- AI公開チャネル: agent.json を v1.1.0 に更新（新機能・新ガイド反映）

### Night 12 (完了)
- MCP Server完全化: generate_json_ld（6スキーマタイプ対応）、generate_agent_json ツールを追加（計5ツール）
- API / 開発者向けドキュメントページ追加（/developers）- REST API・MCP Server全ツールのリファレンス
- チェックエンジン強化: 構造化データチェックにスキーマタイプ識別（検出したJSON-LDの@type表示）追加
- チェックエンジン強化: レスポンスタイム計測をレポートに追加（responseTimeMs）
- CTAバナーコンポーネント作成、GEOガイド・GEO vs SEO・用語集ページに配置
- ナビゲーション: ヘッダーに「API」リンク、フッターに「API / 開発者向け」リンク追加
- AI公開チャネル: agent.json v1.2.0、llms.txt・sitemap.xmlに開発者ページ追記
- 修正: About技術スタック Next.js 16→15、llms.txt技術スタック Next.js 16→15

### Night 13 (完了)
- プログラマティックSEO: チェック項目別SEOランディングページ7ページ追加（/check/[indicator]）- robots-txt, llms-txt, structured-data, meta-tags, content-structure, ssr, sitemap
- プログラマティックSEO: 業界別SEOランディングページ6ページ追加（/for/[industry]）- ec, saas, media, professional, local, education
- UX: チェック結果ページにZIP一括ダウンロード機能追加（改善コード+レポートをZIPでまとめてDL）
- SEO: sitemap.xmlに13ページ追加（チェック項目別7 + 業界別6）
- ナビゲーション: フッターにチェック項目別・業界別リンク追加（4カラムレイアウト）
- AI公開チャネル: llms.txtにチェック項目別・業界別セクション追加、agent.json v1.4.0に更新

### Night 14 (完了)
- 修正: fabricated aggregateRating をトップページJSON-LDから削除（再発防止）
- UX: チェック結果にサイトプレビュー表示（OG画像・favicon・サイトタイトル抽出）
- UX: スコアトレンド表示（再チェック時に前回比の増減をpt表示）
- UX: 各指標名にチェック項目別SEOページへのリンク追加（/check/[indicator]）
- UX: チェック結果から「競合と比較」CTAを追加（比較ページへ直接遷移）
- UX: 比較ページがurl1クエリパラメータを受け取れるよう改善（チェック結果→比較の導線）
- チェックAPI強化: OG画像URL・サイトタイトル・favicon URLをレスポンスに追加

### Night 15 (完了)
- 修正: fabricated aggregateRating をトップページJSON-LDから削除（コメントで再発防止）
- UX: チェック結果に「スコアの見方」セクション追加（A〜Fの5段階解説、現在のグレードをハイライト）
- UX: 比較ページにCSVエクスポート機能追加（全指標スコアをCSVでダウンロード）
- チェックAPI強化: メタタグチェックにog:type・twitter:card検出を追加

### Night 16 (完了)
- 修正: fabricated social proof（「5,000+ サイトがチェック済み」等）をトップページ・メタデータから削除
- UX: チェック結果に「クイック改善ガイド」セクション追加（失敗項目から所要時間付きステップバイステップガイドを自動生成）
- UX: チェック結果に「関連ガイド」セクション追加（GEO対策ガイド、チェックリスト、GEO vs SEOへの導線）
- ナビゲーション: ヘッダーにアクティブ状態ハイライト追加（デスクトップ+モバイル、usePathname対応）
- メタデータ: Twitter Card・OG descriptionから fabricated 数値を削除

### Night 17 (完了)
- コンテンツ: 5分で始めるGEO対策クイックスタートガイド追加（/guides/quick-start）- robots.txt・llms.txt・JSON-LDの3ファイル設定ステップバイステップ、HowTo構造化データ付き
- チェック強化: コンテンツ構造チェックに見出し階層バリデーション追加（複数h1検出、見出しレベル飛び検出、h1テキスト・見出し構成の表示）
- チェック強化: メタタグチェックに抽出値表示追加（title・descriptionの実際の値と文字数を表示）
- ナビゲーション: ヘッダーガイドドロップダウン・フッターにクイックスタートガイドへのリンク追加
- SEO: sitemap.xml, llms.txt, GEO対策ガイドの関連コンテンツにクイックスタートページを追加
- AI公開チャネル: agent.json v1.5.0に更新（新機能反映）

### Night 18 (完了)
- UX: トップページFAQをアコーディオン化（クリックで開閉、CSS gridアニメーション）
- チェック強化: AIクローラー検出を5→10種に拡大（ChatGPT-User, anthropic-ai, Bytespider, CCBot, Applebot-Extended, cohere-ai追加）
- チェック強化: メタタグチェックにnoindex検出追加（meta robots noindex設定時に警告）
- API: 全APIエンドポイントにCORSヘッダー追加（クロスオリジンからのAPI利用対応、OPTIONSプリフライト対応）
- AI公開チャネル: agent.json v1.6.0に更新、llms.txtに対応クローラー一覧・CORS情報追記
