import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "業界別GEO対策ガイド - EC・SaaS・メディア・士業のAI検索最適化",
  description:
    "ECサイト、SaaS、メディア、士業・コンサルなど業界別のGEO対策（AI検索最適化）を解説。ChatGPT・Perplexityで引用されるための業界固有の施策と構造化データの使い分けを紹介。",
  alternates: { canonical: "https://ai-check.ezoai.jp/guides/industry" },
  openGraph: {
    title: "業界別GEO対策ガイド - EC・SaaS・メディア・士業のAI検索最適化",
    description: "ECサイト、SaaS、メディア、士業・コンサルなど業界別のGEO対策（AI検索最適化）を解説。ChatGPT・Perplexityで引用されるための業界固有の施策を紹介。",
    url: "https://ai-check.ezoai.jp/guides/industry",
    images: [
      {
        url: "https://ai-check.ezoai.jp/opengraph-image",
        width: 1200,
        height: 630,
        alt: "業界別GEO対策ガイド - EC・SaaS・メディア・士業のAI検索最適化",
      },
    ],
  },
  keywords: [
    "ECサイト GEO対策",
    "SaaS AI検索対策",
    "メディア AI検索",
    "士業 GEO対策",
    "業界別 AI検索最適化",
    "ECサイト 構造化データ",
    "SaaS llms.txt",
    "ChatGPT ECサイト",
    "Perplexity 対策 業界別",
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "AI Check", item: "https://ai-check.ezoai.jp" },
    { "@type": "ListItem", position: 2, name: "業界別GEO対策", item: "https://ai-check.ezoai.jp/guides/industry" },
  ],
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "業界別GEO対策ガイド - EC・SaaS・メディア・士業のAI検索最適化",
  description:
    "ECサイト、SaaS、メディア、士業など業界別のGEO対策を解説。AI検索で引用されるための業界固有の施策を紹介。",
  url: "https://ai-check.ezoai.jp/guides/industry",
  datePublished: "2026-03-08",
  dateModified: new Date().toISOString().split("T")[0],
  publisher: {
    "@type": "Organization",
    name: "AI Check",
    url: "https://ai-check.ezoai.jp",
  },
  inLanguage: "ja",
};

const industries = [
  {
    id: "ec",
    name: "ECサイト / オンラインショップ",
    description:
      "「おすすめの〇〇」「〇〇 比較」といったAI検索で商品が引用されるかどうかが売上に直結します。",
    priority: "高",
    keyPoints: [
      "Product構造化データ（JSON-LD）を全商品ページに設置。価格・在庫・レビュー情報を含める",
      "llms.txtにカテゴリ構造と主力商品ラインナップを記載",
      "FAQPage構造化データで「よくある質問」を機械可読にする",
      "robots.txtでAIクローラーを許可し、商品データへのアクセスを開放",
      "レビュー・評価データをAggregateRating構造化データで公開",
    ],
    schemaTypes: ["Product", "AggregateRating", "FAQPage", "BreadcrumbList", "Organization"],
    example: `{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "商品名",
  "description": "商品の説明",
  "offers": {
    "@type": "Offer",
    "price": "3980",
    "priceCurrency": "JPY",
    "availability": "https://schema.org/InStock"
  }
}`,
  },
  {
    id: "saas",
    name: "SaaS / Webサービス",
    description:
      "「〇〇 おすすめツール」「〇〇 比較」でAIに推薦されることが新規獲得の鍵になります。",
    priority: "高",
    keyPoints: [
      "SoftwareApplication構造化データで機能・料金プランを明記",
      "llms.txtにAPI仕様・連携機能・料金体系を詳細に記載",
      "agent.json（A2A Agent Card）でAIエージェントからの自動発見を可能にする",
      "MCPエンドポイントを実装し、AIが直接ツールとして利用できるようにする",
      "比較ページやユースケースページにHowTo構造化データを追加",
    ],
    schemaTypes: ["SoftwareApplication", "HowTo", "FAQPage", "Organization", "WebAPI"],
    example: `{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "サービス名",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "featureList": ["機能1", "機能2", "機能3"]
}`,
  },
  {
    id: "media",
    name: "メディア / ブログ / ニュースサイト",
    description:
      "AI検索が記事を引用元として参照するかどうかで、PV・収益に大きな差が出ます。",
    priority: "高",
    keyPoints: [
      "Article構造化データを全記事に設置。著者・公開日・更新日を含める",
      "llms.txtにカテゴリ一覧・人気記事・専門分野を記載",
      "著者情報をPerson構造化データで明示し、E-E-A-T（経験・専門性・権威性・信頼性）を強化",
      "記事内のデータ・統計をTable構造化データで機械可読にする",
      "パンくずリスト（BreadcrumbList）でサイト構造を明確化",
    ],
    schemaTypes: ["Article", "NewsArticle", "Person", "BreadcrumbList", "FAQPage"],
    example: `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "記事タイトル",
  "author": {
    "@type": "Person",
    "name": "著者名",
    "url": "https://example.com/author"
  },
  "datePublished": "2026-03-08",
  "dateModified": "2026-03-14"
}`,
  },
  {
    id: "professional",
    name: "士業 / コンサルティング / 専門サービス",
    description:
      "「〇〇 相談」「〇〇 専門家」といったAI検索で推薦されることが集客に直結します。",
    priority: "中",
    keyPoints: [
      "ProfessionalService構造化データで所在地・営業時間・対応エリアを明記",
      "FAQPage構造化データで「よくある質問」を充実させ、AIの回答ソースになる",
      "llms.txtに専門分野・実績・対応可能な相談内容を詳細に記載",
      "著者・専門家プロフィールをPerson構造化データで公開し権威性を証明",
      "事例紹介をArticle構造化データで構造化し、具体的な実績を機械可読にする",
    ],
    schemaTypes: ["ProfessionalService", "Person", "FAQPage", "Article", "LocalBusiness"],
    example: `{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "事務所名",
  "description": "専門分野の説明",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "東京都",
    "addressCountry": "JP"
  },
  "areaServed": "東京都"
}`,
  },
  {
    id: "local",
    name: "ローカルビジネス / 店舗",
    description:
      "「近くの〇〇」「〇〇 おすすめ 地域名」でAIに推薦されることで来店につながります。",
    priority: "中",
    keyPoints: [
      "LocalBusiness構造化データで住所・電話番号・営業時間・地図情報を明記",
      "llms.txtに店舗の特徴・メニュー・アクセス情報を簡潔に記載",
      "レビュー・口コミ情報をAggregateRating構造化データで公開",
      "メニューや料金表をMenu/Offer構造化データで機械可読にする",
      "複数店舗がある場合はそれぞれのLocalBusiness構造化データを設置",
    ],
    schemaTypes: ["LocalBusiness", "Restaurant", "AggregateRating", "Menu", "GeoCoordinates"],
    example: `{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "店舗名",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "住所",
    "addressLocality": "市区町村",
    "addressRegion": "都道府県"
  },
  "telephone": "03-xxxx-xxxx",
  "openingHours": "Mo-Fr 09:00-18:00"
}`,
  },
  {
    id: "education",
    name: "教育 / オンライン学習 / スクール",
    description:
      "「〇〇 学び方」「〇〇 おすすめスクール」でAIに推薦されることが受講生獲得の鍵です。",
    priority: "中",
    keyPoints: [
      "Course構造化データでコース名・講師・料金・期間を明記",
      "llms.txtにカリキュラム概要・受講者の声・修了後のキャリアパスを記載",
      "HowTo構造化データで学習ステップを構造化",
      "FAQPage構造化データで「受講に関するよくある質問」を機械可読にする",
      "講師情報をPerson構造化データで公開し専門性を証明",
    ],
    schemaTypes: ["Course", "Person", "HowTo", "FAQPage", "EducationalOrganization"],
    example: `{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "コース名",
  "description": "コースの説明",
  "provider": {
    "@type": "EducationalOrganization",
    "name": "スクール名"
  },
  "offers": {
    "@type": "Offer",
    "price": "50000",
    "priceCurrency": "JPY"
  }
}`,
  },
];

const commonActions = [
  {
    title: "構造化データ（JSON-LD）を設置する",
    description: "業界に適したSchema.orgタイプを選び、主要ページにJSON-LDを設置。AIが情報を正確に理解する基盤になります。",
    link: "/generate/json-ld",
    linkLabel: "JSON-LD生成ツール",
  },
  {
    title: "llms.txtを作成する",
    description: "サイトの概要・主要ページ・API情報をAI向けに要約。AIクローラーがサイト全体を素早く把握できます。",
    link: "/generate/llms-txt",
    linkLabel: "llms.txt生成ツール",
  },
  {
    title: "robots.txtでAIクローラーを許可する",
    description: "GPTBot, ClaudeBot, PerplexityBot等のAIクローラーを明示的に許可。ブロックしているとAI検索に表示されません。",
    link: "/generate/robots-txt",
    linkLabel: "robots.txt生成ツール",
  },
  {
    title: "GEOスコアをチェックする",
    description: "現在のAI検索対応状況を7指標でスコア化。改善すべきポイントが一目でわかります。",
    link: "/check",
    linkLabel: "GEOスコアチェック",
  },
];

export default function IndustryGuidePage() {
  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-white/40">
        <Link href="/" className="transition-all duration-200 hover:text-white/70">
          AI Check
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white/70">業界別GEO対策ガイド</span>
      </nav>

      {/* Header */}
      <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
        業界別GEO対策ガイド
      </h1>
      <p className="mb-12 max-w-2xl text-lg leading-relaxed text-white/60">
        AI検索（ChatGPT・Perplexity・Gemini）で引用されるための施策は業界によって異なります。
        ECサイト、SaaS、メディア、士業など、あなたの業界に最適なGEO対策を解説します。
      </p>

      {/* Industry Navigation */}
      <section className="mb-16">
        <div className="flex flex-wrap gap-2">
          {industries.map((ind) => (
            <a
              key={ind.id}
              href={`#${ind.id}`}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition-all duration-200 hover:border-primary/30 hover:text-white"
            >
              {ind.name.split(" / ")[0]}
            </a>
          ))}
        </div>
      </section>

      {/* Industry Sections */}
      <div className="space-y-16">
        {industries.map((ind, idx) => (
          <section key={ind.id} id={ind.id} className="scroll-mt-20">
            <div className="mb-6 flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary">
                {idx + 1}
              </span>
              <div>
                <h2 className="text-2xl font-bold text-white">{ind.name}</h2>
                <p className="mt-1 text-white/50">{ind.description}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Key Points */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 font-semibold text-white">
                  GEO対策のポイント
                  <span className="ml-2 text-xs text-primary/70">優先度: {ind.priority}</span>
                </h3>
                <ul className="space-y-3">
                  {ind.keyPoints.map((point, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed text-white/60">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary/70">
                        {i + 1}
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Schema Types & Example */}
              <div className="space-y-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-3 font-semibold text-white">推奨 Schema.org タイプ</h3>
                  <div className="flex flex-wrap gap-2">
                    {ind.schemaTypes.map((type) => (
                      <span
                        key={type}
                        className="rounded border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-3 font-semibold text-white">JSON-LD 実装例</h3>
                  <pre className="overflow-x-auto rounded-lg bg-black/50 p-4 text-xs leading-relaxed text-white/60">
                    <code>{ind.example}</code>
                  </pre>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Common Actions */}
      <section className="mt-20">
        <h2 className="mb-2 text-2xl font-bold text-white">
          全業界共通: 今すぐ始める4ステップ
        </h2>
        <p className="mb-8 text-white/50">
          どの業界でも、まずはこの4つのアクションから始めましょう。
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {commonActions.map((action, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/10 bg-white/5 p-6"
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-white">{action.title}</h3>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-white/50">
                {action.description}
              </p>
              <Link
                href={action.link}
                className="cursor-pointer text-sm text-primary/80 transition-all duration-200 hover:text-primary"
              >
                {action.linkLabel} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Related Content */}
      <section className="mt-16 rounded-lg border border-white/10 bg-white/5 p-8">
        <h2 className="mb-6 text-xl font-bold text-white">関連コンテンツ</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: "/guides/geo", title: "GEO対策ガイド", desc: "AI検索最適化の基本を網羅的に解説" },
            { href: "/guides/geo-vs-seo", title: "GEO vs SEO", desc: "従来のSEOとの違いと両立方法" },
            { href: "/guides/checklist", title: "GEO対策チェックリスト", desc: "20項目のインタラクティブチェックリスト" },
            { href: "/guides/llms-txt", title: "llms.txt書き方ガイド", desc: "AI向けサイト説明ファイルの書き方" },
            { href: "/guides/glossary", title: "用語集", desc: "GEO・AI検索の重要用語を解説" },
            { href: "/check", title: "GEOスコアチェック", desc: "あなたのサイトのAI検索対応度を診断" },
          ].map((item) => (
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
