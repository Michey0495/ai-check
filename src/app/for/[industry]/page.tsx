import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UrlCheckForm } from "@/components/url-check-form";
import { CtaBanner } from "@/components/cta-banner";

/* ------------------------------------------------------------------ */
/*  Industry data                                                      */
/* ------------------------------------------------------------------ */

interface IndustryData {
  slug: string;
  name: string;
  shortName: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  intro: string[];
  challenges: { title: string; description: string }[];
  recommendations: { title: string; description: string; code?: string }[];
  schemaSection: {
    description: string;
    types: string[];
    example: string;
  };
}

const industries: Record<string, IndustryData> = {
  /* ================================================================ */
  /*  EC                                                               */
  /* ================================================================ */
  ec: {
    slug: "ec",
    name: "ECサイト・ネットショップ",
    shortName: "ECサイト",
    metaTitle: "ECサイトのGEO対策 - AI検索で商品を見つけてもらう方法",
    metaDescription:
      "ECサイト・ネットショップ向けのGEO対策（AI検索最適化）を解説。ChatGPT・Perplexity・Geminiの「おすすめ商品」「比較」検索で引用されるためのProduct構造化データ・llms.txt・レビュー対策の具体的手順。",
    metaKeywords: [
      "ECサイト GEO対策",
      "ネットショップ AI検索",
      "ECサイト AI検索 対策",
      "ECサイト 構造化データ",
      "Product JSON-LD",
      "ECサイト ChatGPT",
      "ネットショップ Perplexity",
      "EC AI検索最適化",
    ],
    intro: [
      "AI検索の普及により、消費者の購買行動は大きく変化しています。「おすすめのワイヤレスイヤホン」「コスパの良いプロテイン」といったクエリに対して、ChatGPTやPerplexityが直接商品を推薦する時代が到来しました。従来のGoogleショッピング広告やSEOだけでは、この新しい検索チャネルからの流入を獲得できません。",
      "ECサイトにとってGEO対策は売上に直結します。AIが商品を推薦する際には、構造化データから価格・在庫・レビュー評価を読み取り、llms.txtからブランドの特徴やラインナップを把握します。これらの情報が整備されていないサイトは、AIの推薦候補にすら入れません。",
      "特に重要なのは、AIクローラーがサイトにアクセスできる状態を作ることです。robots.txtでGPTBotやClaudeBotをブロックしているECサイトもあり、それだけで機会損失が発生している可能性があります。まずは現状のGEOスコアを確認し、改善ポイントを特定することから始めましょう。",
    ],
    challenges: [
      {
        title: "商品情報がAIに読み取られていない",
        description:
          "商品名・価格・在庫状況・レビュー評価が構造化データとして設定されていないため、AIが正確な商品情報を取得できない。「おすすめの〇〇」で推薦されるには、Product構造化データが必須です。",
      },
      {
        title: "AIクローラーをブロックしている",
        description:
          "ECプラットフォームのデフォルトrobots.txtがAIクローラーをブロックしていることがあります。GPTBot、ClaudeBot、PerplexityBotへのアクセス許可を明示的に設定する必要があります。",
      },
      {
        title: "商品説明が画像依存で機械可読性が低い",
        description:
          "商品の特徴やスペックが画像テキストに埋め込まれており、AIが内容を解析できない。テキストベースの商品説明と構造化されたスペック表が重要です。",
      },
      {
        title: "レビュー・口コミ情報が構造化されていない",
        description:
          "ユーザーレビューや評価がAIにとって不透明な状態。AggregateRating構造化データでレビュー数と平均評価をマークアップすることで、AIの信頼性判定に反映されます。",
      },
    ],
    recommendations: [
      {
        title: "全商品ページにProduct構造化データを設置する",
        description:
          "商品名、説明文、価格、在庫状況、ブランド名、SKU、レビュー評価をJSON-LDで記述します。これがAI検索で商品が推薦される最も基本的な条件です。",
        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "ノイズキャンセリング ワイヤレスイヤホン Pro",
  "description": "最大40時間再生、ANC搭載のワイヤレスイヤホン",
  "brand": { "@type": "Brand", "name": "ブランド名" },
  "sku": "WH-PRO-001",
  "offers": {
    "@type": "Offer",
    "price": "12800",
    "priceCurrency": "JPY",
    "availability": "https://schema.org/InStock",
    "url": "https://example.com/products/wh-pro-001"
  },
  "review": []
}
</script>`,
      },
      {
        title: "llms.txtにカテゴリ構造と主力商品を記載する",
        description:
          "AIがサイト全体を俯瞰するためのllms.txtを作成します。取扱カテゴリ、主力商品ライン、送料・返品ポリシーなどをテキストで記述しましょう。",
        code: `# ECサイト名
> オーディオ専門通販。(実際の商品点数を入力)点以上の商品を取り扱い。

## カテゴリ
- ワイヤレスイヤホン: /category/wireless-earbuds
- ヘッドホン: /category/headphones
- スピーカー: /category/speakers

## 人気商品
- WH-PRO-001 ノイズキャンセリングイヤホン Pro (¥12,800)
- SP-HOME-200 スマートスピーカー Home (¥8,900)

## ポリシー
- 送料: 5,000円以上無料
- 返品: 30日以内対応`,
      },
      {
        title: "FAQPageで購入前の疑問に答える",
        description:
          "「送料はいくら？」「返品はできる？」「サイズの選び方は？」といったAIが回答を引用しやすい形式で情報を提供します。",
        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "送料はいくらですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "5,000円以上のご注文で送料無料です。5,000円未満の場合は全国一律550円（税込）です。"
      }
    },
    {
      "@type": "Question",
      "name": "返品・交換はできますか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "商品到着後30日以内であれば、未使用・未開封の商品に限り返品・交換を承ります。"
      }
    }
  ]
}
</script>`,
      },
      {
        title: "robots.txtでAIクローラーを明示的に許可する",
        description:
          "ECサイトではデフォルトでAIクローラーをブロックしている場合があります。GPTBot、ClaudeBot、PerplexityBot、Google-Extendedを許可する設定に変更しましょう。",
        code: `User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://example.com/sitemap.xml`,
      },
      {
        title: "商品比較コンテンツを充実させる",
        description:
          "「〇〇 vs △△」「〇〇 おすすめ ランキング」といったAI検索に対応するために、テキストベースの比較表やカテゴリ別おすすめガイドを作成します。テーブルタグで構造化された比較情報はAIが特に取得しやすいフォーマットです。",
      },
    ],
    schemaSection: {
      description:
        "ECサイトでは、Product構造化データが最も重要です。全商品ページに設置し、カテゴリページにはItemListを、FAQ・サポートページにはFAQPageを追加します。",
      types: [
        "Product",
        "Offer",
        "AggregateRating",
        "Review",
        "ItemList",
        "FAQPage",
        "BreadcrumbList",
        "Organization",
      ],
      example: `{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "オーガニック プロテイン チョコレート味 1kg",
  "description": "国産原料100%使用。人工甘味料不使用のオーガニックプロテイン。1食あたり20gのタンパク質を配合。",
  "image": "https://example.com/images/protein-choco.jpg",
  "brand": {
    "@type": "Brand",
    "name": "NatureFit"
  },
  "sku": "NF-PROT-CHOCO-1KG",
  "gtin13": "4901234567890",
  "offers": {
    "@type": "Offer",
    "price": "3980",
    "priceCurrency": "JPY",
    "availability": "https://schema.org/InStock",
    "priceValidUntil": "2026-12-31",
    "seller": {
      "@type": "Organization",
      "name": "NatureFit公式ストア"
    }
  },
  "review": []
}`,
    },
  },

  /* ================================================================ */
  /*  SaaS                                                             */
  /* ================================================================ */
  saas: {
    slug: "saas",
    name: "SaaS・Webサービス",
    shortName: "SaaS",
    metaTitle: "SaaSのGEO対策 - AI検索でツール推薦を獲得する方法",
    metaDescription:
      "SaaS・Webサービス向けのGEO対策を解説。「おすすめツール」「〇〇 比較」でChatGPT・Perplexityに推薦されるためのSoftwareApplication構造化データ、llms.txt、MCP/A2A対応の実装方法。",
    metaKeywords: [
      "SaaS GEO対策",
      "Webサービス AI検索",
      "SaaS AI検索 対策",
      "SoftwareApplication JSON-LD",
      "SaaS ChatGPT 推薦",
      "ツール比較 AI",
      "MCP Server",
      "agent.json A2A",
    ],
    intro: [
      "「おすすめのプロジェクト管理ツール」「CRM 比較 2026」---このようなクエリに対してAIが直接ツールを推薦する時代において、SaaSプロバイダにとってGEO対策はリード獲得の新しいチャネルです。従来のリスティング広告やコンテンツSEOに加え、AIの推薦リストに載ることも重要な施策の一つです。",
      "SaaS業界のGEO対策には独自のアドバンテージがあります。SoftwareApplication構造化データで機能・料金を明示するだけでなく、MCP（Model Context Protocol）エンドポイントやA2A（Agent-to-Agent）Agent Cardを実装することで、AIエージェントが直接ツールとして利用できる状態を作れます。これは他の業界にはないSaaS特有の強力なGEO施策です。",
      "また、SaaSの技術ドキュメントやAPI仕様は、AI検索が高く評価する「構造化された事実情報」です。llms.txtで料金プラン・機能一覧・API仕様を整理することで、AIがツール比較や推薦を行う際の信頼性の高い情報源になれます。",
    ],
    challenges: [
      {
        title: "料金・機能情報が動的レンダリングのみ",
        description:
          "料金プランや機能比較がJavaScriptの動的レンダリングのみで提供されており、AIクローラーが読み取れない。SSR/SSGで静的HTMLを生成するか、構造化データで情報を補完する必要があります。",
      },
      {
        title: "競合他社との差別化ポイントが不明確",
        description:
          "AIが「おすすめツール」を選ぶ際に参照する差別化情報が不足。独自機能、対象ユーザー、他社との違いをテキストで明確に記述する必要があります。",
      },
      {
        title: "技術ドキュメントがAIに閉じている",
        description:
          "API仕様やインテグレーションガイドがログイン必須エリアにあり、AIクローラーがアクセスできない。公開可能な範囲のドキュメントはクローラーに開放しましょう。",
      },
    ],
    recommendations: [
      {
        title: "SoftwareApplication構造化データを設置する",
        description:
          "サービス名、カテゴリ、対応OS、料金プラン、機能一覧をJSON-LDで記述します。AIが「おすすめの〇〇ツール」を回答する際の基本データになります。",
        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "TaskFlow",
  "applicationCategory": "ProjectManagement",
  "operatingSystem": "Web, iOS, Android",
  "description": "チーム向けプロジェクト管理ツール。カンバン・ガントチャート・タイムトラッキングを統合。",
  "offers": [
    {
      "@type": "Offer",
      "name": "無料プラン",
      "price": "0",
      "priceCurrency": "JPY"
    },
    {
      "@type": "Offer",
      "name": "プロプラン",
      "price": "1980",
      "priceCurrency": "JPY",
      "billingIncrement": "月額"
    }
  ],
  "featureList": [
    "カンバンボード",
    "ガントチャート",
    "タイムトラッキング",
    "Slack連携",
    "API提供"
  ],
}
</script>`,
      },
      {
        title: "llms.txtに料金・機能・API情報を記載する",
        description:
          "AIがツール比較する際に参照する包括的な情報をllms.txtにまとめます。無料プランの有無、主要機能、連携先、APIの有無は必須情報です。",
        code: `# TaskFlow - プロジェクト管理ツール
> チーム向けプロジェクト管理SaaS。カンバン・ガント・タイムトラッキングを1つに統合。

## 料金プラン
- Free: 0円/月（5プロジェクトまで）
- Pro: 1,980円/ユーザー/月
- Enterprise: お問い合わせ

## 主要機能
- カンバンボード
- ガントチャート
- タイムトラッキング
- レポート・ダッシュボード

## 連携
- Slack, Microsoft Teams, Google Workspace
- Zapier, API (REST)

## ドキュメント
- API Reference: /docs/api
- Getting Started: /docs/quickstart`,
      },
      {
        title: "A2A Agent Card（agent.json）を配置する",
        description:
          "AIエージェントがサービスを自動的に発見・利用できるようにするAgent Cardを配置します。/.well-known/agent.jsonに設置するだけで、AIエージェントエコシステムにおける発見可能性が大幅に向上します。",
        code: `// /.well-known/agent.json
{
  "name": "TaskFlow",
  "description": "プロジェクト管理API。タスクの作成・更新・一覧取得が可能。",
  "url": "https://taskflow.example.com",
  "version": "1.0.0",
  "capabilities": {
    "streaming": false,
    "pushNotifications": false
  },
  "authentication": {
    "schemes": ["Bearer"]
  },
  "skills": [
    {
      "name": "task-management",
      "description": "タスクの作成、更新、検索、一覧取得"
    }
  ]
}`,
      },
      {
        title: "MCPエンドポイントを実装する",
        description:
          "Model Context Protocol（MCP）エンドポイントを実装すると、Claude等のAIエージェントがツールとして直接サービスを利用できるようになります。これは他のどのGEO施策よりも強力な「AIネイティブ」対応です。",
        code: `// /api/mcp エンドポイントの例
// MCPサーバーが公開するツール定義
{
  "tools": [
    {
      "name": "create_task",
      "description": "新しいタスクを作成する",
      "inputSchema": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "assignee": { "type": "string" },
          "dueDate": { "type": "string", "format": "date" }
        },
        "required": ["title"]
      }
    }
  ]
}`,
      },
      {
        title: "比較ページとユースケースガイドを作成する",
        description:
          "「TaskFlow vs Asana」「マーケティングチーム向けプロジェクト管理」のような比較・ユースケース別ページを作成します。AIが特定の条件での推薦を行う際、具体的な比較情報やユースケースマッチが判断材料になります。",
      },
    ],
    schemaSection: {
      description:
        "SaaSではSoftwareApplicationが中心です。料金ページにはOffer、ユースケースページにはHowTo、ヘルプセンターにはFAQPageを追加します。",
      types: [
        "SoftwareApplication",
        "Offer",
        "HowTo",
        "FAQPage",
        "Organization",
        "WebAPI",
        "BreadcrumbList",
      ],
      example: `{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "TaskFlow",
  "applicationCategory": "ProjectManagement",
  "operatingSystem": "Web, iOS, Android",
  "description": "チーム向けプロジェクト管理SaaS。(実際の利用社数)社以上が利用。",
  "url": "https://taskflow.example.com",
  "screenshot": "https://taskflow.example.com/images/dashboard.png",
  "softwareVersion": "3.2.0",
  "datePublished": "2026-03-15",
  "offers": [
    {
      "@type": "Offer",
      "name": "Free",
      "price": "0",
      "priceCurrency": "JPY",
      "description": "5プロジェクトまで無料"
    },
    {
      "@type": "Offer",
      "name": "Pro",
      "price": "1980",
      "priceCurrency": "JPY",
      "description": "無制限プロジェクト、ガントチャート、API"
    }
  ],
  "featureList": [
    "カンバンボード",
    "ガントチャート",
    "タイムトラッキング",
    "Slack連携",
    "REST API"
  ],
}`,
    },
  },

  /* ================================================================ */
  /*  Media                                                            */
  /* ================================================================ */
  media: {
    slug: "media",
    name: "メディア・ブログ",
    shortName: "メディア",
    metaTitle: "メディア・ブログのGEO対策 - AI検索で記事が引用される方法",
    metaDescription:
      "メディア・ブログサイト向けGEO対策を解説。ChatGPT・Perplexityの回答ソースとして引用されるためのArticle構造化データ、著者情報E-E-A-T強化、llms.txtの書き方を具体的に紹介。",
    metaKeywords: [
      "メディア GEO対策",
      "ブログ AI検索",
      "メディア AI検索 対策",
      "Article JSON-LD",
      "E-E-A-T AI検索",
      "ブログ ChatGPT 引用",
      "メディア Perplexity",
      "記事 AI検索最適化",
    ],
    intro: [
      "メディアサイトやブログにとって、AI検索からの引用は新しいトラフィックソースであると同時に、存在意義に関わる問題です。ChatGPTやPerplexityがユーザーの質問に回答する際、信頼できるソースとして記事を引用するかどうかが、PV・広告収益・ブランド認知に直結します。",
      "AI検索エンジンが引用元を選ぶ基準は、従来のSEOとは異なります。ドメインの権威性だけでなく、記事の著者情報（E-E-A-T）、公開日・更新日の新鮮さ、そして情報の構造化度合いが重視されます。Article構造化データで著者・日付を明示し、パンくずリストでサイト構造を伝えることが基本です。",
      "特にメディアサイトでは、AIクローラーへのアクセス許可が死活問題です。コンテンツがAIクローラーに読み取られなければ、そもそも引用候補に入りません。著作権保護と引用メリットのバランスを考慮した上で、robots.txtの設定を最適化する判断が求められます。",
    ],
    challenges: [
      {
        title: "著者情報（E-E-A-T）が不足している",
        description:
          "記事の著者名・経歴・専門分野が構造化データとして提供されていない。AIは信頼性の高い著者の記事を優先的に引用するため、Person構造化データでの著者情報の明示が不可欠です。",
      },
      {
        title: "公開日・更新日が不明確",
        description:
          "記事のdatePublished/dateModifiedが設定されておらず、AIが情報の鮮度を判断できない。古い情報と新しい情報を区別するためにArticle構造化データに日付情報を含めましょう。",
      },
      {
        title: "サイト構造がAIに伝わらない",
        description:
          "カテゴリ階層やタグ構造がBreadcrumbListやサイトマップで表現されていない。AIがサイトの専門分野や記事間の関連性を把握できず、特定テーマの権威として認識されにくくなります。",
      },
      {
        title: "AIクローラーとのコンテンツ保護の葛藤",
        description:
          "コンテンツの無断学習を防ぎたいが、引用はされたい。robots.txtでの制御だけでなく、llms.txtで引用条件を明示することで、AIとの適切な関係を構築できます。",
      },
    ],
    recommendations: [
      {
        title: "全記事にArticle構造化データを設置する",
        description:
          "記事タイトル、著者、公開日、更新日、カテゴリ、アイキャッチ画像をJSON-LDで記述します。AIが引用元として記事を評価する際の基本情報になります。",
        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "2026年版 リモートワークの生産性を高める7つの方法",
  "author": {
    "@type": "Person",
    "name": "田中太郎",
    "url": "https://example.com/author/tanaka",
    "jobTitle": "生産性コンサルタント",
    "description": "大手IT企業でのマネジメント経験(実績年数)年。リモートワーク導入支援(実績数)社以上。"
  },
  "datePublished": "2026-03-15",
  "dateModified": "2026-03-16",
  "image": "https://example.com/images/remote-work.jpg",
  "publisher": {
    "@type": "Organization",
    "name": "WorkStyle Magazine",
    "url": "https://example.com"
  },
  "articleSection": "働き方",
  "wordCount": 3500,
  "inLanguage": "ja"
}
</script>`,
      },
      {
        title: "著者プロフィールページをPerson構造化データで強化する",
        description:
          "著者の経歴、専門分野、実績、SNSアカウントを構造化データで明示します。E-E-A-T（経験・専門性・権威性・信頼性）のシグナルをAIに伝える最も効果的な方法です。",
        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "田中太郎",
  "jobTitle": "生産性コンサルタント",
  "description": "リモートワーク導入支援の専門家。著書『リモート時代の働き方』。",
  "url": "https://example.com/author/tanaka",
  "sameAs": [
    "https://twitter.com/tanaka_work",
    "https://linkedin.com/in/tanaka-taro"
  ],
  "knowsAbout": ["リモートワーク", "生産性向上", "チームマネジメント"],
  "alumniOf": {
    "@type": "Organization",
    "name": "東京大学"
  }
}
</script>`,
      },
      {
        title: "llms.txtでサイトの専門性とコンテンツ構造を伝える",
        description:
          "メディアの運営方針、専門カテゴリ、人気記事、著者一覧をllms.txtにまとめます。AIがサイトの信頼性と専門分野を素早く把握できるようになります。",
        code: `# WorkStyle Magazine
> 働き方・生産性・リモートワークの専門メディア。月間(実際のPV数)PV。

## 編集方針
- 全記事に専門家レビューを実施
- 出典・参考文献を明示
- 月次で既存記事を更新

## カテゴリ
- リモートワーク: /category/remote-work
- 生産性: /category/productivity
- チームマネジメント: /category/management

## 主要著者
- 田中太郎（生産性コンサルタント）: /author/tanaka
- 佐藤花子（HR専門家）: /author/sato

## 人気記事
- リモートワークの生産性を高める7つの方法: /articles/remote-productivity
- 2026年おすすめプロジェクト管理ツール比較: /articles/pm-tools-comparison`,
      },
      {
        title: "BreadcrumbListでサイト構造を明確化する",
        description:
          "パンくずリストの構造化データにより、AIがサイトのカテゴリ構造と記事の位置づけを理解します。全ページにBreadcrumbListを設置しましょう。",
        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "ホーム",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "リモートワーク",
      "item": "https://example.com/category/remote-work"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "生産性を高める7つの方法",
      "item": "https://example.com/articles/remote-productivity"
    }
  ]
}
</script>`,
      },
      {
        title: "記事内のデータをテーブルやリストで構造化する",
        description:
          "比較表、ランキング、統計データをHTMLのtableタグやol/ulタグで構造化します。AIは非構造化テキストよりも、表形式やリスト形式のデータを正確に引用します。見出し（h2/h3）で情報を論理的に区切ることも重要です。",
      },
    ],
    schemaSection: {
      description:
        "メディアサイトではArticle（またはNewsArticle）が中核です。著者情報にPerson、サイト構造にBreadcrumbList、Q&AコンテンツにFAQPageを組み合わせます。",
      types: [
        "Article",
        "NewsArticle",
        "Person",
        "BreadcrumbList",
        "FAQPage",
        "Organization",
        "WebSite",
        "ItemList",
      ],
      example: `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "2026年版 リモートワークの生産性を高める7つの方法",
  "description": "リモートワーク歴10年のコンサルタントが、実践で効果を確認した生産性向上テクニックを7つ紹介。",
  "author": {
    "@type": "Person",
    "name": "田中太郎",
    "url": "https://example.com/author/tanaka",
    "jobTitle": "生産性コンサルタント"
  },
  "publisher": {
    "@type": "Organization",
    "name": "WorkStyle Magazine",
    "url": "https://example.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "datePublished": "2026-03-15",
  "dateModified": "2026-03-16",
  "mainEntityOfPage": "https://example.com/articles/remote-productivity",
  "image": "https://example.com/images/remote-work-hero.jpg",
  "articleSection": "リモートワーク",
  "wordCount": 3500,
  "inLanguage": "ja"
}`,
    },
  },

  /* ================================================================ */
  /*  Professional                                                     */
  /* ================================================================ */
  professional: {
    slug: "professional",
    name: "士業・コンサルティング",
    shortName: "士業",
    metaTitle: "士業・コンサルティングのGEO対策 - AI検索で専門家として推薦される方法",
    metaDescription:
      "弁護士・税理士・社労士・コンサルタント向けGEO対策を解説。「〇〇 相談」「〇〇 専門家 おすすめ」でChatGPT・Perplexityに推薦されるためのProfessionalService構造化データ・FAQ対策の実装方法。",
    metaKeywords: [
      "士業 GEO対策",
      "弁護士 AI検索",
      "税理士 AI検索 対策",
      "コンサルティング GEO",
      "ProfessionalService JSON-LD",
      "士業 ChatGPT",
      "専門家 AI推薦",
      "コンサル Perplexity",
    ],
    intro: [
      "「相続税に強い税理士 東京」「労務トラブル 弁護士 相談」---このような専門家探しのクエリは、AI検索に移行する最も早い分野のひとつです。なぜなら、ユーザーは「誰に相談すべきか」という判断をAIに委ねやすいためです。AI検索で推薦される専門家とそうでない専門家の間で、集客力に大きな格差が生まれています。",
      "士業・コンサルティングのGEO対策で最も重要なのは「信頼性の証明」です。AIは資格情報、実績、専門分野、所在地、対応実績などを総合的に評価して推薦先を選びます。ProfessionalService構造化データで事務所情報を、Person構造化データで専門家個人の資格・経歴を明示することが出発点です。",
      "また、士業サイトにとってFAQコンテンツは強力なGEO資産です。「相続手続きの流れ」「会社設立に必要な費用」といったよくある質問への回答は、AIが直接引用する情報源になります。FAQPage構造化データで質問と回答をマークアップすることで、AIの回答に自事務所の情報が使われる可能性が格段に高まります。",
    ],
    challenges: [
      {
        title: "事務所の専門分野がAIに伝わらない",
        description:
          "「何でもできます」という汎用的な表現では、AIが特定の相談内容に対して推薦できない。得意分野・対応実績を具体的に構造化データとllms.txtで明示する必要があります。",
      },
      {
        title: "資格・実績情報が構造化されていない",
        description:
          "弁護士登録番号、税理士登録番号、対応件数などの信頼性情報がテキストのみで提供されている。Person構造化データで資格情報を機械可読にすることで、AIの信頼性評価に反映されます。",
      },
      {
        title: "地域情報が不十分",
        description:
          "対応エリアや事務所所在地の情報が不足しており、「〇〇市 弁護士」のようなローカル検索に対応できていない。PostalAddressとareaServedの構造化データで地理情報を明確にしましょう。",
      },
      {
        title: "事例紹介が抽象的で引用されにくい",
        description:
          "「多くの実績があります」のような抽象的な記述では、AIが具体的な推薦理由を組み立てられない。守秘義務の範囲内で、数値や具体的な状況を含む事例を掲載しましょう。",
      },
    ],
    recommendations: [
      {
        title: "ProfessionalService構造化データで事務所情報を設置する",
        description:
          "事務所名、専門分野、所在地、営業時間、対応エリア、連絡先を構造化データで明示します。AIが「〇〇 専門家」を推薦する際の基本情報です。",
        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "山田税理士事務所",
  "description": "相続税・事業承継を専門とする税理士事務所。年間対応件数(実績数)件以上。",
  "url": "https://yamada-tax.example.com",
  "telephone": "03-1234-5678",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "千代田区丸の内1-1-1",
    "addressLocality": "千代田区",
    "addressRegion": "東京都",
    "postalCode": "100-0005",
    "addressCountry": "JP"
  },
  "areaServed": ["東京都", "神奈川県", "埼玉県", "千葉県"],
  "openingHours": "Mo-Fr 09:00-18:00",
  "priceRange": "初回相談無料",
  "knowsAbout": ["相続税申告", "事業承継", "税務調査対応", "確定申告"]
}
</script>`,
      },
      {
        title: "専門家個人のPerson構造化データを設置する",
        description:
          "資格、経歴、専門分野、実績を構造化データで記述します。AIが専門家の信頼性を評価する際、この情報が決定的な役割を果たします。",
        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "山田一郎",
  "jobTitle": "税理士",
  "description": "相続税専門の税理士。国税局OBとして(実績年数)年の実務経験。年間(実績数)件の相続税申告実績。",
  "url": "https://yamada-tax.example.com/about",
  "worksFor": {
    "@type": "ProfessionalService",
    "name": "山田税理士事務所"
  },
  "hasCredential": {
    "@type": "EducationalOccupationalCredential",
    "credentialCategory": "税理士",
    "recognizedBy": {
      "@type": "Organization",
      "name": "日本税理士会連合会"
    }
  },
  "knowsAbout": ["相続税", "事業承継", "税務調査"]
}
</script>`,
      },
      {
        title: "FAQPageでよくある質問を構造化する",
        description:
          "「費用はいくら？」「初回相談は無料？」「対応エリアは？」といった質問をFAQPage構造化データで記述します。AIが質問に回答する際の引用元として最も利用されやすい形式です。",
        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "相続税の申告は自分でもできますか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "法律上は自身での申告も可能ですが、相続財産の評価方法が複雑なため、特に不動産や非上場株式を含む場合は税理士への依頼を推奨します。申告ミスにより過大な税金を払ったり、税務調査の対象になるリスクがあります。"
      }
    },
    {
      "@type": "Question",
      "name": "税理士への相続税申告の費用はどのくらいですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "相続財産の総額の0.5〜1%が目安です。遺産総額5,000万円の場合、25万〜50万円程度。当事務所では初回相談無料、正式なお見積りを事前にお伝えしています。"
      }
    }
  ]
}
</script>`,
      },
      {
        title: "llms.txtに専門分野と対応実績を記載する",
        description:
          "AIが事務所の強みを素早く把握できるよう、専門分野、対応実績（数値）、対応エリア、料金の目安をllms.txtにまとめます。",
        code: `# 山田税理士事務所
> 相続税・事業承継専門の税理士事務所。国税局OB税理士が対応。

## 専門分野
- 相続税申告（年間(実績数)件以上）
- 事業承継対策
- 税務調査対応
- 不動産の相続税評価

## 実績
- 相続税申告実績: 累計(実績件数)件以上
- 税務調査対応: (実際の是認率)%の是認率
- 相続税還付実績: 平均還付額(実績金額)万円

## 対応エリア
- 東京都、神奈川県、埼玉県、千葉県

## 料金
- 初回相談: 無料
- 相続税申告: 遺産総額の0.5%〜`,
      },
      {
        title: "事例紹介記事をArticle構造化データで公開する",
        description:
          "守秘義務の範囲内で、対応事例を記事として公開し、Article構造化データでマークアップします。「相続税 節税 事例」のようなAI検索で引用される情報源になります。具体的な数値を含めることが重要です。",
      },
    ],
    schemaSection: {
      description:
        "士業ではProfessionalServiceとPersonが中核です。FAQPageで相談前の疑問に答え、Articleで事例紹介を構造化します。",
      types: [
        "ProfessionalService",
        "Person",
        "FAQPage",
        "Article",
        "PostalAddress",
        "EducationalOccupationalCredential",
        "BreadcrumbList",
      ],
      example: `{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "山田税理士事務所",
  "description": "相続税・事業承継専門。国税局OB税理士が年間(実績数)件以上の相続税申告を対応。",
  "url": "https://yamada-tax.example.com",
  "telephone": "03-1234-5678",
  "email": "info@yamada-tax.example.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "千代田区丸の内1-1-1 丸の内ビル10F",
    "addressLocality": "千代田区",
    "addressRegion": "東京都",
    "postalCode": "100-0005",
    "addressCountry": "JP"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 35.6812,
    "longitude": 139.7671
  },
  "areaServed": [
    { "@type": "State", "name": "東京都" },
    { "@type": "State", "name": "神奈川県" },
    { "@type": "State", "name": "埼玉県" },
    { "@type": "State", "name": "千葉県" }
  ],
  "openingHours": "Mo-Fr 09:00-18:00",
  "priceRange": "初回相談無料",
  "knowsAbout": ["相続税", "事業承継", "税務調査対応"],
  "employee": {
    "@type": "Person",
    "name": "山田一郎",
    "jobTitle": "税理士",
    "hasCredential": {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "税理士"
    }
  }
}`,
    },
  },

  /* ================================================================ */
  /*  Local                                                            */
  /* ================================================================ */
  local: {
    slug: "local",
    name: "ローカルビジネス・店舗",
    shortName: "ローカルビジネス",
    metaTitle: "ローカルビジネス・店舗のGEO対策 - AI検索で地域のお客様に見つけてもらう方法",
    metaDescription:
      "飲食店・美容院・クリニック・小売店向けGEO対策を解説。「近くの〇〇」「〇〇 おすすめ 地域名」でChatGPT・Perplexityに推薦されるためのLocalBusiness構造化データ・口コミ対策の実装方法。",
    metaKeywords: [
      "ローカルビジネス GEO対策",
      "店舗 AI検索",
      "飲食店 AI検索 対策",
      "LocalBusiness JSON-LD",
      "地域ビジネス ChatGPT",
      "店舗 Perplexity",
      "ローカルSEO AI",
      "口コミ 構造化データ",
    ],
    intro: [
      "「渋谷 おすすめ イタリアン」「新宿 肩こり 整体」---地域名を含む検索クエリは、AI検索でもよく使われるパターンです。ChatGPTやPerplexityは、ユーザーの質問に対して具体的な店舗名とその特徴を回答するようになっており、ここで推薦されるかどうかが来店数に直結します。",
      "ローカルビジネスのGEO対策は、Googleマイビジネス（GBP）とは異なるアプローチが必要です。AI検索エンジンはGBPではなく、Webサイト上の構造化データを読み取ります。LocalBusiness構造化データで住所・営業時間・メニュー・価格帯を明示し、口コミ情報をAggregateRatingでマークアップすることが基本です。",
      "特に飲食店や美容院では、メニュー情報と口コミ・評価の構造化が最も効果的です。AIは「雰囲気が良い」「コスパが高い」といった定性的な情報よりも、「ランチ 1,200円〜」のような定量情報を引用しやすい傾向があります。実際の口コミ・評価データがあれば、AggregateRatingで構造化しましょう。",
    ],
    challenges: [
      {
        title: "店舗情報がGBPにしかない",
        description:
          "住所・営業時間・電話番号などの基本情報がGoogleビジネスプロフィールにしか登録されておらず、Webサイトに構造化データとして設置されていない。AI検索エンジンはGBPではなくWebサイトをクロールするため、サイト上での情報整備が必須です。",
      },
      {
        title: "メニューや料金が画像のみ",
        description:
          "メニュー表や料金表がPDFや画像でしか提供されておらず、AIクローラーが読み取れない。テキストベースのメニューページを用意し、構造化データでマークアップする必要があります。",
      },
      {
        title: "口コミ・評価が自社サイトにない",
        description:
          "口コミがGoogleレビューや食べログにしか存在せず、自社サイトで評価情報を構造化データとして提供できていない。AggregateRating構造化データを自社サイトにも設置することが重要です。",
      },
    ],
    recommendations: [
      {
        title: "LocalBusiness構造化データを設置する",
        description:
          "店舗名、住所、電話番号、営業時間、価格帯、座標情報をJSON-LDで記述します。業種に応じてRestaurant、HealthAndBeautyBusiness、MedicalClinicなどのサブタイプを使いましょう。",
        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "トラットリア ベッラ",
  "description": "渋谷駅徒歩3分の本格イタリアン。自家製パスタと窯焼きピザが自慢。",
  "url": "https://bella.example.com",
  "telephone": "03-9876-5432",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "渋谷区道玄坂1-2-3",
    "addressLocality": "渋谷区",
    "addressRegion": "東京都",
    "postalCode": "150-0043",
    "addressCountry": "JP"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 35.6580,
    "longitude": 139.7016
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "11:30",
      "closes": "22:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday","Sunday"],
      "opens": "11:00",
      "closes": "22:00"
    }
  ],
  "priceRange": "¥1,200〜¥3,500",
  "servesCuisine": "イタリアン",
  "acceptsReservations": true,
}
</script>`,
      },
      {
        title: "メニューをテキストベースでMenu構造化データに記述する",
        description:
          "料理名、説明、価格をMenu構造化データで記述します。AIが「渋谷 ランチ 1500円以下」のようなクエリに回答する際、この情報が使われます。",
        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Menu",
  "name": "ランチメニュー",
  "hasMenuSection": [
    {
      "@type": "MenuSection",
      "name": "パスタ",
      "hasMenuItem": [
        {
          "@type": "MenuItem",
          "name": "自家製ボロネーゼ",
          "description": "牛肉100%のラグーソースと自家製フェットチーネ",
          "offers": {
            "@type": "Offer",
            "price": "1380",
            "priceCurrency": "JPY"
          }
        },
        {
          "@type": "MenuItem",
          "name": "ペスカトーレ",
          "description": "魚介たっぷりのトマトソースリングイネ",
          "offers": {
            "@type": "Offer",
            "price": "1580",
            "priceCurrency": "JPY"
          }
        }
      ]
    }
  ]
}
</script>`,
      },
      {
        title: "llms.txtに店舗の特徴とアクセス情報を記載する",
        description:
          "AIが店舗を推薦する際に使う情報をllms.txtにまとめます。アクセス、価格帯、特徴、席数、予約可否などを簡潔に記述しましょう。",
        code: `# トラットリア ベッラ
> 渋谷駅徒歩3分の本格イタリアン。自家製パスタと窯焼きピザ。

## 基本情報
- 住所: 東京都渋谷区道玄坂1-2-3
- 最寄駅: 渋谷駅 徒歩3分
- 営業時間: 平日 11:30-22:00 / 土日 11:00-22:00
- 定休日: 水曜
- 席数: 45席（カウンター8席、テーブル37席）
- 予約: 可（電話・Web）

## 価格帯
- ランチ: 1,200〜1,800円
- ディナー: 3,000〜5,000円
- コース: 4,500円〜

## 特徴
- 自家製パスタ（毎日手打ち）
- 薪窯で焼くナポリピザ
- イタリア直輸入ワイン50種以上`,
      },
      {
        title: "口コミ・評価をAggregateRating構造化データで設置する",
        description:
          "自社サイトでの口コミ掲載と評価のマークアップを行います。AIは構造化された評価データを信頼性の指標として重視します。注意: aggregateRatingの値は必ず実際のレビューデータに基づく数値を使用してください。架空の数値はGoogleガイドライン違反です。",
        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "トラットリア ベッラ",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "（実際の平均評価を入力）",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": "（実際の評価数を入力）",
    "reviewCount": "（実際のレビュー数を入力）"
  },
  "review": [
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "（実際のレビュー投稿者名）" },
      "datePublished": "2026-03-15",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "（実際の評価値を入力）"
      },
      "reviewBody": "（実際のレビュー内容を入力）"
    }
  ]
}
</script>`,
      },
      {
        title: "複数店舗の場合は各店舗に個別のLocalBusinessデータを設置する",
        description:
          "チェーン店や複数拠点のビジネスでは、各店舗ページに固有のLocalBusiness構造化データを設置します。AIは「〇〇駅 近く」のようなクエリに対して、具体的な店舗情報をもとに回答します。共通の親組織はOrganizationで紐付けましょう。",
      },
    ],
    schemaSection: {
      description:
        "ローカルビジネスではLocalBusiness（またはRestaurant等のサブタイプ）が中核です。GeoCoordinatesで位置情報、Menuでメニュー、AggregateRatingで口コミ評価を補完します。",
      types: [
        "LocalBusiness",
        "Restaurant",
        "GeoCoordinates",
        "PostalAddress",
        "OpeningHoursSpecification",
        "Menu",
        "AggregateRating",
        "Review",
      ],
      example: `{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "トラットリア ベッラ",
  "description": "渋谷駅徒歩3分。自家製パスタと薪窯ナポリピザの本格イタリアン。",
  "image": "https://bella.example.com/images/storefront.jpg",
  "url": "https://bella.example.com",
  "telephone": "03-9876-5432",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "渋谷区道玄坂1-2-3",
    "addressLocality": "渋谷区",
    "addressRegion": "東京都",
    "postalCode": "150-0043",
    "addressCountry": "JP"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 35.6580,
    "longitude": 139.7016
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Thursday","Friday"],
      "opens": "11:30",
      "closes": "22:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday","Sunday"],
      "opens": "11:00",
      "closes": "22:00"
    }
  ],
  "priceRange": "¥1,200〜¥5,000",
  "servesCuisine": "イタリアン",
  "acceptsReservations": true,
  "menu": "https://bella.example.com/menu",
}`,
    },
  },

  /* ================================================================ */
  /*  Education                                                        */
  /* ================================================================ */
  education: {
    slug: "education",
    name: "教育・スクール",
    shortName: "教育",
    metaTitle: "教育・スクールのGEO対策 - AI検索で受講生を獲得する方法",
    metaDescription:
      "プログラミングスクール・英会話教室・オンライン学習サービス向けGEO対策を解説。「おすすめスクール」「〇〇 学び方」でChatGPT・Perplexityに推薦されるためのCourse構造化データ・カリキュラム対策の実装方法。",
    metaKeywords: [
      "教育 GEO対策",
      "スクール AI検索",
      "プログラミングスクール AI検索 対策",
      "Course JSON-LD",
      "オンライン学習 ChatGPT",
      "スクール Perplexity",
      "教育 AI検索最適化",
      "習い事 AI推薦",
    ],
    intro: [
      "「プログラミングスクール おすすめ 未経験」「英語 オンライン学習 比較」---学習・スクール選びは、AI検索が最も活用される分野のひとつです。ユーザーは「自分に合ったスクールはどれか」をAIに聞くことが増えており、ここで推薦されるかどうかが受講生獲得に直結します。",
      "教育サービスのGEO対策では、Course構造化データによるコース情報の明示が基本です。コース名、受講期間、料金、対象レベル、講師情報、修了後のキャリアパスをJSON-LDで記述することで、AIが「未経験者におすすめのプログラミングスクール」を回答する際の情報源になります。",
      "さらに、教育サービスはHowTo構造化データとの相性が抜群です。「Pythonの学び方」「英語のリスニング力を上げる方法」といったクエリに対して、学習ステップを構造化して提供することで、AIの回答にスクールの情報が自然に引用されるようになります。",
    ],
    challenges: [
      {
        title: "コース情報が構造化されていない",
        description:
          "コース名・料金・期間・対象レベルが構造化データとして提供されておらず、AIが比較情報を組み立てられない。Course構造化データでコース情報を機械可読にする必要があります。",
      },
      {
        title: "講師の信頼性情報が不足している",
        description:
          "講師のプロフィール・経歴・実績がテキストのみで、AIが講師の専門性を評価できない。Person構造化データで講師情報を明示しましょう。",
      },
      {
        title: "受講成果・卒業生実績がAIに伝わらない",
        description:
          "「転職成功率95%」「TOEIC平均200点UP」などの実績データが画像やPDFに埋もれている。テキストベースで記載し、構造化データで補強する必要があります。",
      },
      {
        title: "学習コンテンツの価値がAIに認識されない",
        description:
          "無料公開している学習コンテンツやブログ記事が、AIクローラーにブロックされている。教育コンテンツはAI引用との相性が良いため、積極的に公開すべきです。",
      },
    ],
    recommendations: [
      {
        title: "Course構造化データを全コースページに設置する",
        description:
          "コース名、説明、料金、期間、提供者、対象レベルをJSON-LDで記述します。AIが「おすすめスクール」を回答する際に比較可能な形で情報が提供されます。",
        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Webエンジニア転職コース",
  "description": "未経験からWebエンジニアへ。HTML/CSS/JavaScript/React/Node.jsを6ヶ月で習得。転職保証付き。",
  "provider": {
    "@type": "EducationalOrganization",
    "name": "TechAcademy Pro",
    "url": "https://techacademy-pro.example.com"
  },
  "timeRequired": "P6M",
  "educationalLevel": "初心者〜中級者",
  "teaches": ["HTML", "CSS", "JavaScript", "React", "Node.js"],
  "offers": {
    "@type": "Offer",
    "price": "498000",
    "priceCurrency": "JPY",
    "availability": "https://schema.org/InStock",
    "validFrom": "2026-04-01"
  },
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "オンライン",
    "courseSchedule": {
      "@type": "Schedule",
      "repeatFrequency": "weekly",
      "duration": "PT2H"
    }
  }
}
</script>`,
      },
      {
        title: "HowTo構造化データで学習ステップを公開する",
        description:
          "「Pythonの学び方」「英語のリスニング力を上げる方法」といったハウツーコンテンツを構造化データでマークアップします。AIの回答に学習ステップが引用され、スクールの認知向上につながります。",
        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "未経験からWebエンジニアになるための学習ロードマップ",
  "description": "プログラミング未経験者がWebエンジニアとして転職するまでの6ステップ。",
  "totalTime": "P6M",
  "step": [
    {
      "@type": "HowToStep",
      "name": "HTML/CSSの基礎を学ぶ",
      "text": "まずWebサイトの見た目を作るHTML/CSSを2週間で習得。簡単なWebページが作れるレベルを目指します。",
      "position": 1
    },
    {
      "@type": "HowToStep",
      "name": "JavaScriptの基礎を学ぶ",
      "text": "Webページに動きをつけるJavaScriptの基本文法を1ヶ月で習得。DOM操作とイベント処理を重点的に。",
      "position": 2
    },
    {
      "@type": "HowToStep",
      "name": "Reactでアプリ開発を学ぶ",
      "text": "モダンなフロントエンド開発の主流であるReactを2ヶ月で習得。SPAの設計と実装ができるレベルへ。",
      "position": 3
    }
  ]
}
</script>`,
      },
      {
        title: "講師情報をPerson構造化データで公開する",
        description:
          "講師の経歴、資格、専門分野、実績を構造化データで明示します。AIがスクールの信頼性を評価する際、講師の質は重要な判断材料です。",
        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "鈴木花子",
  "jobTitle": "シニアエンジニア / 講師",
  "description": "(経歴企業名)でのフロントエンド開発経験(年数)年。React/Next.js専門。受講生の転職成功率(実績値)%。",
  "worksFor": {
    "@type": "EducationalOrganization",
    "name": "TechAcademy Pro"
  },
  "knowsAbout": ["React", "Next.js", "TypeScript", "Web開発"],
  "alumniOf": {
    "@type": "Organization",
    "name": "Google"
  }
}
</script>`,
      },
      {
        title: "llms.txtにコース一覧と受講成果を記載する",
        description:
          "AIがスクールを比較・推薦する際に必要な情報をllms.txtにまとめます。コース一覧、料金、受講成果（転職率等）、特徴を簡潔に記述します。",
        code: `# TechAcademy Pro
> 未経験からエンジニア転職を実現するプログラミングスクール。転職成功率(実績値)%。

## コース一覧
- Webエンジニア転職コース: 498,000円 / 6ヶ月
- データサイエンスコース: 398,000円 / 4ヶ月
- AI/機械学習コース: 598,000円 / 6ヶ月

## 受講実績
- 受講生数: 累計(実績数)名
- 転職成功率: (実績値)%
- 受講満足度: (実績値)/5.0

## 特徴
- 現役エンジニア講師によるマンツーマン指導
- 転職保証制度（転職できなければ全額返金）
- オンライン完結（全国どこからでも受講可能）

## 対象
- プログラミング未経験者
- キャリアチェンジを目指す社会人`,
      },
      {
        title: "FAQPageで受講前の疑問に答える",
        description:
          "「未経験でも大丈夫？」「働きながら受講できる？」「転職保証の条件は？」といった質問をFAQPage構造化データで記述します。スクール選びの段階でAIが引用する情報源になります。",
      },
    ],
    schemaSection: {
      description:
        "教育サービスではCourseが中核です。EducationalOrganizationで運営主体、Personで講師情報、HowToで学習ステップ、FAQPageで受講相談を補完します。",
      types: [
        "Course",
        "CourseInstance",
        "EducationalOrganization",
        "Person",
        "HowTo",
        "HowToStep",
        "FAQPage",
        "Offer",
      ],
      example: `{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Webエンジニア転職コース",
  "description": "未経験からWebエンジニア転職を実現。HTML/CSS/JavaScript/React/Node.jsを6ヶ月で習得。転職保証付き。",
  "url": "https://techacademy-pro.example.com/courses/web-engineer",
  "provider": {
    "@type": "EducationalOrganization",
    "name": "TechAcademy Pro",
    "url": "https://techacademy-pro.example.com",
    "description": "累計(実績数)名が受講。転職成功率(実績値)%のプログラミングスクール。"
  },
  "timeRequired": "P6M",
  "educationalLevel": "初心者",
  "teaches": ["HTML", "CSS", "JavaScript", "React", "Node.js", "Git"],
  "inLanguage": "ja",
  "offers": {
    "@type": "Offer",
    "price": "498000",
    "priceCurrency": "JPY",
    "availability": "https://schema.org/InStock"
  },
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "Online",
    "instructor": {
      "@type": "Person",
      "name": "鈴木花子",
      "jobTitle": "シニアエンジニア"
    }
  },
}`,
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Static params & metadata                                           */
/* ------------------------------------------------------------------ */

const validSlugs = Object.keys(industries);

export function generateStaticParams() {
  return validSlugs.map((slug) => ({ industry: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ industry: string }>;
}): Promise<Metadata> {
  const { industry: slug } = await params;
  const data = industries[slug];
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    keywords: data.metaKeywords,
    alternates: {
      canonical: `https://ai-check.ezoai.jp/for/${slug}`,
    },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: `https://ai-check.ezoai.jp/for/${slug}`,
      siteName: "AI Check",
      locale: "ja_JP",
      type: "article",
      images: [
        {
          url: `https://ai-check.ezoai.jp/for/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: data.metaTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: data.metaTitle,
      description: data.metaDescription,
      images: [`https://ai-check.ezoai.jp/for/${slug}/opengraph-image`],
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ industry: string }>;
}) {
  const { industry: slug } = await params;
  const data = industries[slug];
  if (!data) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "AI Check",
        item: "https://ai-check.ezoai.jp",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "業界別GEO対策",
        item: "https://ai-check.ezoai.jp/guides/industry",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${data.name}のGEO対策`,
        item: `https://ai-check.ezoai.jp/for/${slug}`,
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${data.name}のGEO対策 - AI検索で見つけてもらうために`,
    description: data.metaDescription,
    url: `https://ai-check.ezoai.jp/for/${slug}`,
    datePublished: "2026-03-15",
    dateModified: new Date().toISOString().split("T")[0],
    publisher: {
      "@type": "Organization",
      name: "AI Check",
      url: "https://ai-check.ezoai.jp",
    },
    inLanguage: "ja",
    mainEntityOfPage: `https://ai-check.ezoai.jp/for/${slug}`,
  };

  /* Related links differ per industry */
  const relatedLinks = getRelatedLinks(slug);

  return (
    <div className="py-16">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-white/40" aria-label="パンくずリスト">
        <Link
          href="/"
          className="transition-all duration-200 hover:text-white/70"
        >
          AI Check
        </Link>
        <span className="mx-2">/</span>
        <Link
          href="/guides/industry"
          className="transition-all duration-200 hover:text-white/70"
        >
          業界別GEO対策
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white/70">{data.shortName}</span>
      </nav>

      {/* H1 */}
      <h1 className="mb-6 text-3xl font-bold leading-tight text-white sm:text-4xl">
        {data.name}のGEO対策
        <span className="mt-2 block text-lg font-normal text-white/50 sm:text-xl">
          AI検索で見つけてもらうために
        </span>
      </h1>

      {/* Introduction */}
      <section className="mb-16 max-w-3xl space-y-4">
        {data.intro.map((p, i) => (
          <p
            key={i}
            className="text-base leading-relaxed text-white/70"
            style={{ lineHeight: "1.75" }}
          >
            {p}
          </p>
        ))}
      </section>

      {/* CTA: check form */}
      <section className="mb-16 rounded-lg border border-primary/20 bg-white/5 p-6 sm:p-8">
        <h2 className="mb-2 text-lg font-bold text-white">
          まずは現状をチェック
        </h2>
        <p className="mb-4 text-sm text-white/50">
          あなたの{data.shortName}サイトのGEOスコアを無料で診断します。URLを入力してください。
        </p>
        <UrlCheckForm size="lg" />
      </section>

      {/* Challenges */}
      <section className="mb-16">
        <h2 className="mb-8 text-2xl font-bold text-white">
          この業界でよくある課題
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {data.challenges.map((c, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/10 bg-white/5 p-6"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-sm font-bold text-red-400">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-white">{c.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-white/60">
                {c.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Recommendations */}
      <section className="mb-16">
        <h2 className="mb-8 text-2xl font-bold text-white">
          おすすめのGEO対策
        </h2>
        <div className="space-y-8">
          {data.recommendations.map((r, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/10 bg-white/5 p-6"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <h3 className="text-lg font-semibold text-white">{r.title}</h3>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-white/60">
                {r.description}
              </p>
              {r.code && (
                <pre className="overflow-x-auto rounded-lg bg-white/5 p-4 text-sm text-white/80">
                  <code>{r.code}</code>
                </pre>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Structured data section */}
      <section className="mb-16">
        <h2 className="mb-4 text-2xl font-bold text-white">
          推奨する構造化データ
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-white/60">
          {data.schemaSection.description}
        </p>

        {/* Schema types */}
        <div className="mb-6 flex flex-wrap gap-2">
          {data.schemaSection.types.map((t) => (
            <span
              key={t}
              className="rounded border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary/80"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Full example */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <h3 className="mb-3 font-semibold text-white">
            {data.shortName}向け JSON-LD 実装例
          </h3>
          <pre className="overflow-x-auto rounded-lg bg-white/5 p-4 text-sm text-white/80">
            <code>{data.schemaSection.example}</code>
          </pre>
        </div>
      </section>

      {/* CTA banner */}
      <section className="mb-16">
        <CtaBanner
          title={`${data.shortName}サイトのGEOスコアをチェック`}
          description={`URLを入力するだけで、${data.shortName}サイトのAI検索対応度を7つの指標で無料診断。改善コードも自動生成します。`}
          href="/check"
          label="無料でチェックする"
        />
      </section>

      {/* Related content */}
      <section>
        <h2 className="mb-6 text-xl font-bold text-white">関連コンテンツ</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {relatedLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/20 hover:bg-white/5"
            >
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-1 text-xs text-white/40">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Related links helper                                               */
/* ------------------------------------------------------------------ */

function getRelatedLinks(slug: string) {
  const common = [
    {
      href: "/guides/geo",
      title: "GEO対策 完全ガイド",
      desc: "AI検索最適化の基本を網羅的に解説",
    },
    {
      href: "/guides/checklist",
      title: "GEO対策チェックリスト",
      desc: "20項目のインタラクティブチェックリスト",
    },
    {
      href: "/guides/industry",
      title: "業界別GEO対策ガイド",
      desc: "全6業界のGEO対策を俯瞰",
    },
  ];

  const industrySpecific: Record<string, { href: string; title: string; desc: string }[]> = {
    ec: [
      {
        href: "/generate/json-ld",
        title: "JSON-LD生成ツール",
        desc: "Product構造化データを自動生成",
      },
      {
        href: "/generate/robots-txt",
        title: "robots.txt生成ツール",
        desc: "AIクローラー許可設定を自動生成",
      },
      {
        href: "/for/saas",
        title: "SaaSのGEO対策",
        desc: "SaaS・Webサービスの対策を見る",
      },
    ],
    saas: [
      {
        href: "/generate/json-ld",
        title: "JSON-LD生成ツール",
        desc: "SoftwareApplication構造化データを自動生成",
      },
      {
        href: "/generate/agent-json",
        title: "agent.json生成ツール",
        desc: "A2A Agent Cardを自動生成",
      },
      {
        href: "/for/ec",
        title: "ECサイトのGEO対策",
        desc: "ECサイト・ネットショップの対策を見る",
      },
    ],
    media: [
      {
        href: "/generate/llms-txt",
        title: "llms.txt生成ツール",
        desc: "AI向けサイト説明ファイルを自動生成",
      },
      {
        href: "/guides/llms-txt",
        title: "llms.txt書き方ガイド",
        desc: "メディア向けllms.txtの書き方",
      },
      {
        href: "/for/education",
        title: "教育のGEO対策",
        desc: "教育・スクールの対策を見る",
      },
    ],
    professional: [
      {
        href: "/generate/json-ld",
        title: "JSON-LD生成ツール",
        desc: "ProfessionalService構造化データを自動生成",
      },
      {
        href: "/generate/llms-txt",
        title: "llms.txt生成ツール",
        desc: "事務所情報をAI向けに整理",
      },
      {
        href: "/for/local",
        title: "ローカルビジネスのGEO対策",
        desc: "店舗・地域ビジネスの対策を見る",
      },
    ],
    local: [
      {
        href: "/generate/json-ld",
        title: "JSON-LD生成ツール",
        desc: "LocalBusiness構造化データを自動生成",
      },
      {
        href: "/generate/robots-txt",
        title: "robots.txt生成ツール",
        desc: "AIクローラー許可設定を自動生成",
      },
      {
        href: "/for/professional",
        title: "士業のGEO対策",
        desc: "士業・コンサルティングの対策を見る",
      },
    ],
    education: [
      {
        href: "/generate/json-ld",
        title: "JSON-LD生成ツール",
        desc: "Course構造化データを自動生成",
      },
      {
        href: "/generate/llms-txt",
        title: "llms.txt生成ツール",
        desc: "コース情報をAI向けに整理",
      },
      {
        href: "/for/media",
        title: "メディアのGEO対策",
        desc: "メディア・ブログの対策を見る",
      },
    ],
  };

  return [...common, ...(industrySpecific[slug] || [])];
}
