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
