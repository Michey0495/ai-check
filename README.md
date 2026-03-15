# AI Check

AI検索対応度チェッカー & ジェネレーター。URLを入力するだけでWebサイトのGEOスコアを算出し、llms.txt・robots.txt・JSON-LD構造化データを自動生成。

## 技術スタック

- Next.js 16 (App Router)
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
| `/history` | チェック履歴（過去のGEOスコアチェック結果一覧） |
| `/tools` | GEO対策ツール一覧（全5ツールの詳細紹介） |
| `/privacy` | プライバシーポリシー |

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
| `/api/check/batch` | POST | 複数URLの一括GEOスコアチェック（最大10件） |
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

### Night 19 (完了)
- 修正: fabricated social proof（「5,000+サイトが利用中」）をトップページから削除
- コンテンツ: プライバシーポリシーページ追加（/privacy）- GA・Cookie・データ取り扱いの開示
- チェックAPI強化: 対象サイト到達不可時の明確なエラーメッセージ追加（422レスポンス）
- ナビゲーション: フッターにプライバシーポリシーリンク追加（ガイドカラム + フッターバー）
- SEO: sitemap.xml, llms.txtにプライバシーページ追加
- AI公開チャネル: agent.json v1.8.0に更新

### Night 20 (完了)
- 修正: 業界別ページ（/for/[industry]）のJSON-LDコード例から fabricated aggregateRating を削除（Googleガイドライン違反防止）
- 修正: ローカルビジネスのaggregateRating教示例をプレースホルダー形式に変更（実データ入力を促す表記に）
- チェック強化: メタタグの文字数最適化チェック追加（title 30-60文字、description 70-160文字の推奨範囲から外れると警告、スコア減点）
- チェック強化: llms.txt品質チェック追加（セクション見出し・URL・API情報の有無を評価、300文字未満または見出しなしでwarn）
- チェック強化: サイトマップにlastmod設定状況表示を追加（lastmod設定件数・割合を表示）
- AI公開チャネル: agent.json v1.9.0に更新、llms.txtにチェック指標の詳細説明を追記

### Night 21 (完了)
- チェック強化: JSON-LD構造化データの必須プロパティ検証追加（17スキーマタイプ対応: WebSite, Product, Article, FAQ, HowTo, Organization, LocalBusiness等）- 不完全なJSON-LDに警告、パースエラー検出
- チェック強化: robots.txt Sitemapディレクティブ検出追加（Sitemap行の有無を報告、未設定時は追加を推奨）
- チェック強化: HTMLサイズ（ページ重量）をレポートに追加（htmlSizeKB）
- コンテンツ: GEO対策ツール一覧ページ追加（/tools）- 全5ツールの詳細説明・ユースケース・機能リスト、CollectionPage構造化データ付き
- ナビゲーション: ヘッダー「生成ツール」→「ツール」に変更（/toolsへリンク）、フッターにツール一覧リンク追加
- SEO: sitemap.xml, llms.txt, agent.json v2.0.0にツール一覧ページ追記
- UX: チェック結果にHTMLサイズ表示追加

### Night 22 (完了)
- チェックAPI強化: HTTPS使用検出をレポートに追加（暗号化状態をバッジ表示）
- チェックAPI強化: ページ内リンク分析追加（内部リンク数・外部リンク数をレポート・テキストレポートに表示）
- チェック強化: robots.txtの全ブロック検出改善（User-agent: * / Disallow: / でAIクローラーが個別Allowされていない場合のブロック検出）
- チェック強化: おすすめスキーマタイプ推定（ページ内容からProduct, Article, FAQPage, Recipe, Event, Course等を自動判定、構造化データ未設置時に表示）
- UX: チェック結果に「改善コードまとめ」セクション追加（全改善コードを一括表示・一括コピー、折りたたみ式）
- AI公開チャネル: agent.json v2.1.0に更新、llms.txtにレポート追加情報セクション追記

### Night 23 (完了)
- API: チェックAPIにGETメソッド対応追加（GET /api/check?url=xxx でブラウザから直接アクセス可能に）
- チェック強化: X-Robots-Tagレスポンスヘッダーによるnoindex検出追加（meta robotsに加えHTTPヘッダーでのnoindexも検出）
- チェック強化: アクセシビリティ分析追加（画像alt属性の設定状況、スキップナビゲーション検出、ARIAランドマーク数、aria-label使用検出）
- UX: チェック結果に「アクセシビリティ概要」セクション追加（画像alt・スキップナビ・ARIAランドマークの3指標を表示）
- UX: チェック結果のサイト情報バッジに画像alt属性の設定率を表示
- UX: テキストレポートにアクセシビリティ情報を追加
- 開発者ドキュメント: GETメソッドのAPIリファレンスを追加
- AI公開チャネル: agent.json v2.2.0に更新、llms.txtにGET API・アクセシビリティ情報追記

### Night 24 (完了)
- チェック強化: セキュリティヘッダー分析追加（HSTS、CSP、X-Frame-Options、X-Content-Type-Options、Referrer-Policyの5項目検出・スコア表示）
- チェック強化: パフォーマンスヒント分析追加（preconnect/prefetch数、画像遅延読み込み率、スクリプト最適化状況、font-display検出）
- UX: チェック結果に「セキュリティヘッダー」セクション追加（5項目のヘッダー設定状況をビジュアル表示）
- UX: チェック結果に「パフォーマンスヒント」セクション追加（リソースヒント・遅延読み込み・スクリプト最適化・font-displayの4指標）
- UX: テキストレポートにセキュリティヘッダー・パフォーマンスヒント情報を追加
- 修正: llms.txt技術スタック Next.js 16→15
- AI公開チャネル: agent.json v2.3.0に更新、llms.txtにセキュリティ・パフォーマンス情報追記

### Night 25 (完了)
- PWA: Web App Manifest（manifest.json）追加（アプリインストール対応）
- チェック強化: Content-Languageヘッダー検出追加（多言語対応状況をレポートに表示）
- チェック強化: hreflangタグ検出追加（多言語ページの代替言語設定をレポートに表示）
- チェック強化: メタタグチェック結果に多言語対応情報を統合表示
- UX: LINEシェアボタン追加（日本市場向け、X/Twitter・URL共有に加えLINEでの共有が可能に）
- UX: チェック結果のサイト情報バッジにContent-Language・hreflangタグを表示
- UX: テキストレポートに多言語対応セクション追加
- AI公開チャネル: agent.json v2.4.0に更新、llms.txtに多言語対応検出情報追記

### Night 26 (完了)
- チェック強化: CMS/フレームワーク自動検出追加（WordPress, Next.js, Shopify, Nuxt.js, React, Angular, Vue.js, SvelteKit, Gatsby, Remix, Hugo, Wix, Squarespace + Google Analytics, Microsoft Clarity）
- チェック強化: OG画像アクセス可否検証追加（og:image URLにHEADリクエストを送信し、画像が実際にアクセス可能かを検証）
- UX: チェック結果に「検出テクノロジー」セクション追加（検出されたフレームワーク・CMS・ツールをタグ表示）
- UX: チェック結果のサイト情報バッジにOG画像アクセス可否・検出テクノロジーを表示
- UX: テキストレポートに検出テクノロジー・OG画像アクセス情報を追加
- AI公開チャネル: agent.json v2.5.0に更新、llms.txtにCMS検出・OG画像検証情報追記

### Night 27 (完了)
- コンテンツ: チェック履歴ページ追加（/history）- 過去のチェック結果一覧、統計サマリー（平均スコア・グレード分布）、日付/スコア順ソート、個別削除・一括クリア
- チェック強化: Core Web Vitalsヒント分析追加（LCP候補検出、CLSリスク要因分析、レンダーブロッキングリソース数、インラインCSSサイズ計測、fetchpriority検出）
- UX: チェック結果に「Core Web Vitalsヒント」セクション追加（レンダーブロック・CLSリスク・LCP候補・インラインCSSの4指標をビジュアル表示）
- UX: テキストレポートにCore Web Vitals情報を追加
- ナビゲーション: ヘッダー・フッターにチェック履歴ページへのリンク追加
- SEO: sitemap.xmlに履歴ページ追加
- AI公開チャネル: agent.json v2.6.0に更新、llms.txtにCore Web Vitals・履歴ページ情報追記

### Night 28 (完了)
- UX: 比較ページにSVGレーダーチャート追加（7指標をスパイダーチャートでビジュアル比較、最大5サイト対応、凡例付き）
- UX: 履歴ページにスコア推移SVGチャート追加（直近20件の時間軸グラフ、グラデーション面グラフ、日付ラベル付き）
- チェック強化: PWA manifest.json検出・プロパティ検証追加（アプリ名、アイコン、start_url、display、テーマカラーの5項目を検証、HTMLのmanifestリンクとデフォルトパスの両方を検索）
- チェック強化: ソーシャルメタ情報検出追加（twitter:site、twitter:creator、fb:app_id、og:site_nameの4項目を検出・表示）
- UX: チェック結果に「PWA対応状況」セクション追加（manifest.json検出時に5項目の設定状況をビジュアル表示）
- UX: チェック結果に「ソーシャルメタ情報」セクション追加（SNSシェア時のブランド認証メタタグを表示）
- UX: テキストレポートにPWA対応・ソーシャルメタ情報を追加
- AI公開チャネル: agent.json v2.7.0に更新、llms.txtにPWA・ソーシャルメタ・チャート情報追記

### Night 29 (完了)
- UX: チェック結果に「改善シミュレーター」追加（失敗/警告項目をトグルして改善後の予測スコア・グレードをインタラクティブに確認、プログレスバーで現在→予測スコアを可視化）
- UX: チェック結果にJSONエクスポート機能追加（チェック結果をJSON形式でダウンロード）
- API: バッチチェックエンドポイント追加（POST /api/check/batch）- 最大10件のURLを一括チェック、並行実行
- 開発者ドキュメント: バッチチェックAPIのリファレンスを追加
- AI公開チャネル: agent.json v2.8.0に更新（バッチAPI追加）、llms.txtにシミュレーター・JSON出力・バッチAPI情報追記

### Night 30 (完了)
- チェック強化: コンテンツ圧縮検出追加（gzip/brotli/deflate対応状況をレスポンスヘッダーから検出・表示）
- チェック強化: Serverヘッダー検出追加（Webサーバーソフトウェア情報をレポートに表示）
- UX: チェック結果のサイト情報バッジにコンテンツ圧縮・Serverヘッダーを表示
- UX: テキストレポートにサーバー情報セクション追加（圧縮・Server）
- UX: 印刷/PDF対応追加（チェック結果ページに「印刷 / PDF」ボタン、@media printスタイルで白背景・読みやすい配色に最適化）
- AI公開チャネル: agent.json v2.9.0に更新、llms.txtに圧縮検出・Server検出・印刷対応情報追記

### Night 31 (完了)
- チェック強化: リダイレクトチェーン分析追加（HTTP→HTTPSリダイレクト検出、www正規化検出、リダイレクト回数・最終URL・チェーン全体を表示）
- チェック強化: canonical URL検出・不一致警告追加（アクセスURLとcanonical URLの整合性チェック）
- UX: チェック結果に「リダイレクト & canonical URL」セクション追加（リダイレクトチェーンの可視化、canonical不一致の警告）
- UX: チェック結果のサイト情報バッジにリダイレクト回数・canonical不一致を表示
- UX: テキストレポートにリダイレクト・canonical情報を追加
- UX: トップページに「最近のチェック」セクション追加（localStorage履歴から直近5件を表示、再チェックへの導線）
- SEO: 新規キーワード4件追加（リダイレクト チェック、canonical URL チェック、AI検索 リダイレクト、GEOスコア リダイレクト分析）
- AI公開チャネル: agent.json v3.1.0に更新、llms.txtにリダイレクト・canonical情報追記

### Night 32 (完了)
- チェック強化: SSL/TLS証明書分析追加（発行元、有効期限、残り日数、TLSプロトコルバージョン、SAN対象ドメイン検出）
- チェック強化: HTTPプロトコルバージョン検出追加（HTTP/1.1 vs HTTP/2判定）
- UX: チェック結果に「SSL/TLS証明書」セクション追加（発行元・プロトコル・有効期限・残り日数を4カラムで表示、SAN一覧、期限切れ警告）
- UX: チェック結果のサイト情報バッジにHTTPバージョン・SSL情報を表示
- UX: テキストレポートにSSL/TLS証明書セクション・HTTPプロトコル情報を追加
- AI公開チャネル: agent.json v3.2.0に更新、llms.txtにSSL・HTTP情報追記

### Night 33 (完了)
- チェック強化: 画像最適化分析追加（WebP/AVIF次世代フォーマット検出率、srcset属性・picture要素の利用状況を分析・表示）
- チェック強化: リダイレクトステータスコード詳細追加（301恒久/302一時/307/308の判別をリダイレクトチェーンに表示）
- UX: チェック結果に「スコア内訳」バーチャート追加（7指標の獲得ポイントをプログレスバーで可視化、合計表示）
- UX: チェック結果に「画像最適化」セクション追加（次世代フォーマット使用率・レスポンシブ画像・picture要素の4指標を表示）
- UX: テキストレポートに画像最適化・リダイレクトステータスコード情報を追加
- SEO: WebSite SearchActionスキーマをルートレイアウトに追加（検索エンジンがURLチェック機能を認識）
- AI公開チャネル: agent.json v3.3.0に更新、llms.txtに画像最適化・リダイレクトステータスコード情報追記

### Night 34 (完了)
- チェック強化: コンテンツ分析追加（単語数、文字数、段落数、テキスト/HTML比率、平均文長を計測・表示）
- チェック強化: RSS/Atomフィード検出追加（HTMLからRSS/Atomフィードリンクを検出、フィードURL表示）
- チェック強化: ファビコン分析追加（favicon、apple-touch-icon、SVGアイコン、複数サイズ検出、manifest icons対応状況）
- UX: チェック結果に「コンテンツ分析」セクション追加（5指標をグリッド表示、テキスト/HTML比率の色分け判定）
- UX: チェック結果に「フィード検出」セクション追加（RSS/Atomの検出状況とフィードURL表示）
- UX: チェック結果に「ファビコン分析」セクション追加（5項目のファビコン設定状況をチェックリスト表示）
- UX: チェック結果のサイト情報バッジにテキスト/HTML比率・フィード検出を表示
- UX: テキストレポートにコンテンツ分析・フィード検出・ファビコン分析セクションを追加
- AI公開チャネル: agent.json v3.4.0に更新、llms.txtにコンテンツ分析・フィード検出・ファビコン分析情報追記

### Night 35 (完了)
- 修正: fabricated social proof（「4,500+サイト分析済み」）をトップページから削除
- UX: チェック結果に「ソーシャルシェアプレビュー」セクション追加（og:title、og:description、og:imageに基づくSNS共有時の表示イメージをビジュアル確認、不足項目の警告表示）
- UX: チェック結果に「見出し構造ツリー」セクション追加（h1〜h6の全見出しを階層ツリー形式で可視化、レベル別色分け、最大30個）
- チェック強化: 重複メタタグ検出追加（title、meta description、og:title、og:description、canonicalの重複を検出・警告）
- チェック強化: OGプレビューデータ抽出追加（og:title、og:description、og:urlの値をレスポンスに追加）
- チェック強化: 見出しツリー抽出追加（全見出しのレベル・テキストをレスポンスに追加）
- UX: テキストレポートにOGプレビュー・見出し構造・重複メタタグ情報を追加
- AI公開チャネル: agent.json v3.5.0に更新、llms.txtにソーシャルプレビュー・見出しツリー・重複メタタグ情報追記

### Night 36 (完了)
- 修正: fabricated social proof（「4,500+分析済みサイト数」）をトップページ統計から削除、底部CTAの捏造数値を削除
- UX: 開発者ページにAPI Playground追加（ブラウザからAPIを直接テスト、レスポンスタイム表示、6エンドポイント対応）
- UX: URL入力フォームにオートコンプリート追加（チェック履歴からURL候補を表示、キーボード操作対応）
- UX: グローバルキーボードショートカット追加（Ctrl+K / Cmd+K でURL入力にフォーカス）
- 開発者ページ: 全REST APIエンドポイントにcurlコマンドコピーボタン追加
- AI公開チャネル: agent.json v3.6.0に更新、llms.txtにAPI Playground・オートコンプリート・ショートカット情報追記

### Night 37 (完了)
- UX: チェック結果ページにセクションナビゲーション追加（スクロール連動するスティッキー目次バー、22セクション対応、IntersectionObserverによるアクティブハイライト）
- チェック強化: DNS解決時間計測追加（dnsResolutionMs: DNS名前解決に要した時間をミリ秒で計測・表示、速度別の色分けバッジ）
- API: レート制限情報ヘッダー追加（X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-ResetをAPIレスポンスヘッダーに付与）
- UX: 比較ページに印刷/PDF対応追加（レーダーチャート・指標別比較テーブルを印刷最適化）
- AI公開チャネル: agent.json v3.7.0に更新、llms.txtにセクションナビ・DNS計測・レート制限・比較印刷情報追記

### Night 38 (完了)
- リファクタリング: チェックAPI（1,459行）をモジュール分割（security.ts, network.ts, checkers.ts, analyzers.ts）- 保守性・可読性向上
- リファクタリング: グレード色定義を共有ユーティリティ（lib/grade-colors.ts）に統合 - check-client, compare-client, history-client, badge APIの重複排除
- 改善: error.tsx / global-error.tsx にエラーログ出力追加（console.error）、エラーIDの表示、トップへの導線追加

### Night 39 (完了)
- リファクタリング: check-client.tsx（2,178行）を4ファイルに分割 - check-utils.ts（ユーティリティ関数・履歴管理・レポート生成）、check-sections.tsx（共通UIコンポーネント8個）、check-report-sections.tsx（レポート表示セクション16個）、check-client.tsx（メイン740行）
- 修正: Next.js バージョン参照を全ファイルで15→16に統一（README, ARCHITECTURE, About, llms.txt）
- AI公開チャネル: agent.json v3.8.0に更新
- ドキュメント: ARCHITECTURE.mdにチェック結果ページの新ファイル構成を反映

### Night 40 (完了)
- 修正: fabricated statistics（25%、89%、$72B、4.5%等の出典のない数値）をトップページ・About・GEO対策ガイド・GEO vs SEO・OGP画像から一括削除
- 生成ツール強化: JSON-LD生成ツールのスキーマタイプを5→12に拡大（Product, Event, Course, VideoObject, BreadcrumbList, HowTo, NewsArticle追加）- 各タイプに専用フィールドUI
- チェック強化: テクノロジー検出を拡張（Astro, Qwik, SolidJS, Ghost, Contentful, Strapi, Jekyll, Webflow, Hotjar, Plausible Analytics追加）
- UX: チェック結果の補足分析18セクションを4つの折りたたみ式カテゴリに整理（セキュリティ&ネットワーク、パフォーマンス&最適化、コンテンツ&SEO、テクノロジー&ソーシャル）- モバイルでの閲覧性向上
- AI公開チャネル: agent.json v4.0.0に更新、llms.txtにJSON-LD拡張・テクノロジー検出・セクショングループ化情報追記

### Night 41 (完了)
- チェック強化: JSON-LDブロック詳細分析追加（ページ内のJSON-LDブロック数とスキーマタイプ一覧を検出・表示、@graph内のノードも対応）
- チェック強化: サードパーティドメイン分析追加（外部CSS/JS/preloadリソースの読み込み元ドメインを一覧表示、ユニークドメイン数の可視化）
- UX: スクロールトップボタン追加（600px以上スクロール時に画面右下に表示、長いチェック結果ページのナビゲーション改善、印刷時非表示）
- UX: チェック結果の「コンテンツ & SEO」グループにJSON-LDブロック詳細セクション追加
- UX: 外部リソースセクションにサードパーティドメイン一覧を表示
- UX: テキストレポートにJSON-LDブロック・サードパーティドメイン情報を追加
- AI公開チャネル: agent.json v4.1.0に更新、llms.txtにJSON-LDブロック分析・サードパーティドメイン分析・スクロールトップ情報追記

### Night 42 (完了)
- チェック強化: AIコンテンツプレビュー追加（AIクローラーがインデックスする主要テキストコンテンツの抽出・表示、nav/header/footer/script除外、主要トピック抽出、読了時間推定）
- チェック強化: リンク品質分析追加（follow/nofollow/sponsored/ugcリンクの分類・比率表示、follow率の可視化）
- チェック強化: リッチリザルト適格性判定追加（検出JSON-LDスキーマからGoogle Rich Results対応状況を判定、17タイプ対応：Product、Article、FAQPage、HowTo、Recipe、Event等）
- UX: チェック結果の「コンテンツ & SEO」グループに3セクション追加（AIが見るコンテンツ、リンク品質分析、リッチリザルト適格性）
- UX: セクションナビゲーションに3セクション追加（AIが見るコンテンツ、リンク品質、リッチリザルト）
- UX: テキストレポートにAIコンテンツプレビュー・リンク品質・リッチリザルト情報を追加
- AI公開チャネル: agent.json v4.2.0に更新、llms.txtにAIコンテンツプレビュー・リンク品質分析・リッチリザルト適格性情報追記

### Night 43 (完了)
- 修正: トップページの競合比較テーブルを削除（未検証の価格情報・機能比較を含んでいたため）→「AI Checkでできること」機能紹介セクションに置換
- 修正: トップページ底部CTAの未検証の主張（「多くのサイトのGEOスコアはグレードD以下」）を削除
- 修正: 業界別ページ（/for/[industry]）のコード例内の捏造統計をプレースホルダー形式に変更（EC・SaaS・メディア・士業・教育の各業界、15箇所以上）
- セキュリティ: バッチチェックAPI（/api/check/batch）にレート制限追加（IP単位、10リクエスト/分）- 単体APIと同一のレート制限を適用
- 修正: バッチAPIのタイムアウト不整合を修正（25秒→15秒/URL、maxDuration=60秒内に収まるよう調整）
- AI公開チャネル: agent.json v4.3.0に更新

### Night 44 (完了)
- 修正: 比較ページのScoreBarコンポーネントで除算ゼロによるUI破損の可能性があるバグを修正
- UX: チェック結果にグレード別スコアインサイト（コンテキストに応じた改善メッセージ）を追加
- UX: 比較ページで最高スコアのサイトに「Best」ハイライト表示を追加
- UX: チェック履歴の日付表示を日時表示に変更（同日の複数チェックを区別可能に）
- アクセシビリティ: セクションナビゲーションにnav要素・aria-label・role属性を追加
- 修正: ツール一覧ページのJSON-LDスキーマタイプ数を実態に合わせて更新（6→12種類）

### Night 45 (完了)
- UX: チェック結果ページにレーダーチャート追加（7指標をスパイダーチャートでビジュアル表示、グレード色対応）
- リファクタリング: ファイルダウンロード関数の重複排除（downloadFile共通ヘルパー抽出）
- リファクタリング: recent-checks.tsxのグレード色定義をgrade-colors.tsの共有ユーティリティに統合
- UX: 再チェックボタンにdisabled状態追加（チェック中の二重実行防止、視覚的フィードバック）
- セクションナビゲーション: レーダーチャートセクションを追加
- AI公開チャネル: agent.json v4.4.0に更新、llms.txtにレーダーチャート情報追記

### Night 46 (完了)
- 修正: 未検証の主張を削除（「急速に拡大」「市場シェアは毎月拡大中」「競合はもうGEO対策を始めている」等の根拠なき記述をトップ・About・GEO対策ガイド・GEO vs SEOから一括除去）
- SEO: トップページのBreadcrumbList JSON-LDを削除（1アイテムのみのBreadcrumbListはスキーマ違反）
- SEO: Organization JSON-LDにareaServed: "JP"を追加（日本市場ターゲットの明示）
- UX: トップページ「こんな方に必要です」のリンク先を業界別専用ページ（/for/[industry]）に変更、業界カード4種を適切にマッピング（EC・SaaS・メディア・士業）
- UX: 対応AI検索エンジン表示をピルバッジスタイルに変更（モバイル折り返し改善）
- UX: 3ステップセクションにステップ間コネクター追加（視覚的フロー改善）
- UX: Before/After「GEO対策あり」の表現を断定的な保証から可能性を示す表現に修正
- UX: 底部CTAを事実ベースの訴求に置換（FOMO表現を削除）

### Night 47 (完了)
- UX: 生成ツール（llms.txt, agent.json）にURL形式バリデーション追加（不正URL入力時にエラー表示）
- UX: 比較ページのCSVエクスポートにエラーフィードバック追加（データ不足時に警告メッセージ表示）
- UX: バッジ画像読み込み失敗時のフォールバックUI追加（バッジ生成ツール + チェック結果ページ）
- 修正: 未検証の主張を修正（「30〜50%削減」「25%以上推奨」「Cランク以上に改善」等の根拠なき数値表現を事実ベースの表現に置換）
- AI公開チャネル: agent.json v4.5.0に更新

### Night 48 (完了)
- 修正: 全ページのdatePublished/dateModifiedを修正（2024/2025年の古い日付を2026年に統一、hardcoded日付を最新化）
- リファクタリング: checkRobotsTxt関数のAIクローラーリスト重複を排除（aiCrawlers配列をAI_CRAWLERS定数+analyzeAiCrawlerStatus関数に統合）
- チェック強化: サイトマップインデックス（sitemapindex）検出追加（サブサイトマップ数を表示、大規模サイト対応）
- チェック強化: サイトマップURL数上限チェック追加（50,000件超過時にwarn+スコア減点、サイトマップインデックスの利用を推奨）
- AI公開チャネル: agent.json v4.6.0に更新、llms.txtにサイトマップインデックス・URL上限チェック情報追記

### Night 49 (完了)
- 修正: チェック項目別ページのコード例内の古い日付を2026年に更新（5箇所: article:published_time, article:modified_time, sitemap lastmod）
- 修正: 未検証の「多くの」表現を事実ベースの表現に置換（トップページFAQ、robots.txtチェック解説、EC業界ページの3箇所）
- 改善: MCP Server APIルートの型安全性向上（`as any`を`Record<string, unknown>`に置換、eslint-disableコメント削減）

### Night 50 (完了)
- パフォーマンス: 外部画像（OG画像・favicon・バッジ）にlazy loading追加（loading="lazy", decoding="async"でLCP/CLS改善）
- パフォーマンス: favicon画像にwidth/height属性追加（レイアウトシフト防止）
- パフォーマンス: フォント読み込みにdisplay: "swap"を明示指定（FOIT防止）
- パフォーマンス: Google Analytics外部リソースにDNS prefetchヒント追加（初回接続高速化）
- UX: 比較ページにMarkdownエクスポート機能追加（サマリー＋指標別比較テーブルをMarkdown形式でダウンロード）
- AI公開チャネル: agent.json v4.7.0に更新（Markdownエクスポート・画像遅延読み込み・DNS prefetch情報追記）

### Night 51 (完了)
- SEO: 全ページにカスタムOGP画像追加（21ファイル）- 共有OGP画像ユーティリティ（lib/ogp-image.tsx）で統一デザイン
  - 個別ページ: about, developers, tools, compare, history, privacy（6ファイル）
  - ガイドページ: geo, geo-vs-seo, llms-txt, checklist, industry, quick-start, glossary（7ファイル）
  - 生成ツールページ: llms-txt, robots-txt, json-ld, agent-json, badge（5ファイル）
  - 動的ルート: check/[indicator]（7指標別）, for/[industry]（6業界別）（2ファイル、計13パターン）
- AI公開チャネル: agent.json v4.8.0に更新

### Night 52 (完了)
- 修正: トップページの未検証統計データを削除（「61% CTR低下」「93%ゼロクリック」「$17B市場規模」等の出典なき数値を事実ベースの定性的表現に置換）
- 修正: 業界別ページ（/for/[industry]）ローカルビジネス例のレビューratingValueをプレースホルダーに変更（hardcoded "5" を削除）
- UX: チェック結果のSNSシェア時にOGP画像にスコア・グレードを動的表示（X/LINE/URLコピー時のシェアURLにscore・gradeパラメータを付与、OGP画像でグレード色付き大文字表示）
- SEO: チェックページのメタデータを動的生成に変更（score・grade付きURLアクセス時にタイトル・OGP画像を動的に設定）
- AI公開チャネル: agent.json v4.9.0に更新

### Night 53 (完了)
- 修正: 未検証の主張を事実ベースに修正（「急拡大中」→「増加」、「多くのWebサイト」→「少なくないWebサイト」、「多くのサイトがブロック」→「ブロックしているサイトもある」、トップ・About・GEO対策ガイドの4箇所）
- チェック強化: robots.txt Crawl-delay検出追加（グローバルおよびAIクローラー個別のCrawl-delay設定を検出・表示、クローラーのアクセス間隔制限を可視化）
- UX: 比較ページに「比較サマリー」セクション追加（総合トップサイト表示、サイト別の強み/未対応項目をタグ表示、指標別トップの自動分析）
- UX: テキストレポートにCrawl-delay情報を追加
- AI公開チャネル: agent.json v5.0.0に更新、llms.txtにCrawl-delay検出・比較サマリー情報追記

### Night 54 (完了)
- アクセシビリティ: チェック結果にaria-liveリージョン追加（スクリーンリーダーにスコア・グレードを自動通知）
- UX: チェック中のエラーメッセージを細分化（タイムアウト・ネットワークエラー・一般エラーを区別、適切な対処法を表示）
- アクセシビリティ: noscriptフォールバック追加（JavaScript無効時にメッセージ表示）

### Night 55 (完了)
- 修正: 全ページのdatePublished/dateModifiedを2026-03-15に更新（check/[indicator]、for/[industry]、developers、guides/industry、guides/geo-vs-seo、JSON-LD生成ツールプレースホルダー）
- セキュリティ: バッチチェックAPI（/api/check/batch）のレート制限をURL単位に変更（バッチ内のURL数分のレート制限を消費、内部呼び出しの二重カウントを防止）
- UX: チェック結果のエクスポートボタンをドロップダウンメニューに統合（テキスト/JSON/Markdown/ZIP/印刷を「保存」メニューにまとめ、モバイルUI改善）
- アクセシビリティ: 比較ページに完了時のaria-liveアナウンス追加（スクリーンリーダーに成功/エラー件数を通知）
- AI公開チャネル: agent.json v5.1.0に更新

### Night 56 (完了)
- 修正: 残存していたdatePublished古い日付を2026-03-15に統一（guides/checklist, quick-start, geo, glossary, for/[industry]の6箇所）
- UX: Viewportにcolor-scheme: dark, themeColor: #000000を追加（モバイルブラウザのアドレスバー色統一、リーダーモード対応、PWA連携改善）
- アクセシビリティ: URL入力フォームのヒントテキストコントラスト比改善（text-white/20→text-white/40、WCAG AA準拠）

### Night 57 (完了)
- 修正: トップページ「急成長」ラベルを「利用者拡大」に変更（未検証の主張を中立的表現に置換）
- チェック強化: meta robots / X-Robots-Tag の nofollow 検出追加（noindex検出に加え、nofollowが設定されている場合に警告・スコア減点、リンク評価伝播への影響を通知）
- UX: チェック結果の詳細セクションに個別コードコピーボタン追加（各修正コードブロックの右上にコピーボタン、ワンクリックでクリップボードにコピー）
- AI公開チャネル: agent.json v5.2.0に更新、llms.txtにnofollow検出情報追記

### Night 58 (完了)
- チェック強化: meta http-equiv="refresh"検出追加（meta refreshリダイレクトの遅延時間・リダイレクト先URLを検出・警告、AIクローラーへの影響を通知、301リダイレクトへの置換を推奨）
- UX: チェック結果に「meta refreshリダイレクト」セクション追加（セキュリティ&ネットワークグループ内、警告色表示）
- レポート: Markdownレポートを完全化（テキストレポートと同等の全セクションを網羅: リダイレクト、SSL/TLS、canonical、サーバー情報、Crawl-delay、パフォーマンスヒント、Core Web Vitals、画像最適化、PWA、OGプレビュー、見出し構造、重複メタタグ、ファビコン、フィード、ソーシャルメタ、外部リソース、JSON-LDブロック、AIコンテンツプレビュー、リンク品質、リッチリザルト、meta refresh）
- AI公開チャネル: agent.json v5.3.0に更新、llms.txtにmeta refresh検出・Markdownレポート完全化情報追記

### Night 59 (完了)
- チェック強化: スニペット制御ディレクティブ検出追加（max-snippet、max-image-preview、max-video-previewをmeta robots / googlebot / X-Robots-Tagから検出。AI検索エンジンのコンテンツ引用制限を可視化）
- チェック強化: OpenSearch記述ファイル検出追加（link rel="search" type="application/opensearchdescription+xml" の存在を検出、タイトル表示）
- UX: チェック結果に「スニペット制御 & 検索機能」セクション追加（コンテンツ&SEOグループ内、制限ありの場合は黄色警告表示、推奨設定をガイド）
- レポート: テキストレポート・Markdownレポートにスニペット制御・OpenSearch情報を追加
- AI公開チャネル: agent.json v5.4.0に更新、llms.txtにスニペット制御・OpenSearch検出情報追記

### Night 60 (完了)
- 修正: stale `public/robots.txt`を削除（誤ったドメイン`web-url-a.ezoai.jp`が動的`src/app/robots.ts`をシャドウしていた問題を解消）
- アクセシビリティ: ヘッダーのガイドドロップダウンにキーボードナビゲーション追加（ArrowUp/Down/Escape/Enter/Spaceキー対応、role="menu"/"menuitem"、フォーカス管理）
- アクセシビリティ: ナビゲーションリンクにaria-current="page"属性追加（デスクトップ+モバイル、スクリーンリーダーの現在ページ認識向上）
- アクセシビリティ: フッターの4カラムリンクグループをセマンティック`<nav>`要素に変更（aria-label付き、ランドマークナビゲーション対応）
- AI公開チャネル: agent.json v5.6.0に更新
