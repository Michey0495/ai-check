import type { Metadata } from "next";
import Link from "next/link";
import { CtaBanner } from "@/components/cta-banner";

export const metadata: Metadata = {
  title: "GEO対策 vs SEO対策 - 違いと両立する方法",
  description:
    "GEO（AI検索最適化）とSEO（検索エンジン最適化）の違いを徹底比較。ChatGPT・Perplexity時代に必要な対策と、SEOとの両立方法を解説。",
  alternates: { canonical: "https://ai-check.ezoai.jp/guides/geo-vs-seo" },
  openGraph: {
    title: "GEO対策 vs SEO対策 - 違いと両立する方法",
    description: "GEO（AI検索最適化）とSEO（検索エンジン最適化）の違いを徹底比較。ChatGPT・Perplexity時代に必要な対策と、SEOとの両立方法を解説。",
    url: "https://ai-check.ezoai.jp/guides/geo-vs-seo",
    images: [
      {
        url: "https://ai-check.ezoai.jp/opengraph-image",
        width: 1200,
        height: 630,
        alt: "GEO対策 vs SEO対策 - 違いと両立する方法",
      },
    ],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "AI Check", item: "https://ai-check.ezoai.jp" },
    { "@type": "ListItem", position: 2, name: "GEO vs SEO", item: "https://ai-check.ezoai.jp/guides/geo-vs-seo" },
  ],
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "GEO対策 vs SEO対策 - 違いと両立する方法",
  description:
    "GEO（AI検索最適化）とSEO（検索エンジン最適化）の違いを徹底比較。ChatGPT・Perplexity時代に必要な対策と、SEOとの両立方法を解説。",
  url: "https://ai-check.ezoai.jp/guides/geo-vs-seo",
  datePublished: "2026-03-08",
  dateModified: new Date().toISOString().split("T")[0],
  publisher: {
    "@type": "Organization",
    name: "AI Check",
    url: "https://ai-check.ezoai.jp",
  },
  inLanguage: "ja",
};

const comparisonData = [
  {
    aspect: "最適化対象",
    seo: "Google, Bingなどの検索エンジン",
    geo: "ChatGPT, Perplexity, GeminiなどのAI検索",
  },
  {
    aspect: "目的",
    seo: "検索結果ページ（SERP）で上位表示",
    geo: "AI回答に引用・参照される",
  },
  {
    aspect: "主な手法",
    seo: "キーワード最適化、被リンク構築、テクニカルSEO",
    geo: "構造化データ、llms.txt、AIクローラー許可、セマンティックHTML",
  },
  {
    aspect: "コンテンツ形式",
    seo: "キーワードを意識した自然文",
    geo: "機械可読性の高い構造化コンテンツ",
  },
  {
    aspect: "効果測定",
    seo: "検索順位、CTR、オーガニックトラフィック",
    geo: "AI引用率、AI経由トラフィック、ブランド言及",
  },
  {
    aspect: "robots.txt",
    seo: "Googlebotを許可",
    geo: "GPTBot, ClaudeBot, PerplexityBot等を許可",
  },
  {
    aspect: "構造化データ",
    seo: "リッチスニペット取得が目的",
    geo: "AIがコンテンツを正確に理解するために必須",
  },
  {
    aspect: "更新頻度の重要性",
    seo: "定期的な更新がプラス評価",
    geo: "最新情報であることが引用に直結",
  },
];

const bothStrategies = [
  {
    title: "構造化データ（JSON-LD）の設置",
    desc: "SEOではリッチスニペット、GEOではAI理解度の向上。両方に有効な最重要施策。",
    link: "/generate/json-ld",
  },
  {
    title: "セマンティックHTMLの使用",
    desc: "h1-h6、article、section等の適切な使用は、検索エンジンとAIの両方が文書構造を理解する助けになる。",
  },
  {
    title: "サイトマップの最適化",
    desc: "sitemap.xmlは従来の検索エンジンとAIクローラーの両方がサイト構造を把握するために使用する。",
  },
  {
    title: "高品質なメタデータ",
    desc: "title, description, OGPは検索エンジンとAI検索の両方でコンテンツの要約として参照される。",
  },
  {
    title: "SSR/SSGによるレンダリング",
    desc: "HTMLにコンテンツを含めることで、JavaScriptを実行できないクローラー（検索エンジン・AI）の両方に対応。",
  },
];

const geoOnlyStrategies = [
  {
    title: "llms.txtの設置",
    desc: "AI専用のサイト説明ファイル。SEOには影響しないが、GEOでは重要度が高い。",
    link: "/generate/llms-txt",
  },
  {
    title: "AIクローラーの明示的許可",
    desc: "robots.txtでGPTBot, ClaudeBot等を個別に許可。SEOのGooglebot許可とは別に設定が必要。",
    link: "/generate/robots-txt",
  },
  {
    title: "agent.json（A2A Agent Card）の設置",
    desc: "AIエージェント間の自動発見プロトコル。SEOには不要だが、AI時代のサービス連携で重要。",
    link: "/generate/agent-json",
  },
  {
    title: "MCP Server エンドポイント",
    desc: "AIエージェントがサービスをツールとして利用できるAPIエンドポイント。完全にGEO固有の施策。",
  },
];

export default function GeoVsSeoPage() {
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

      <h1 className="mb-4 text-3xl font-bold text-white">
        GEO対策 vs SEO対策 - 違いと両立する方法
      </h1>
      <p className="mb-12 text-lg leading-relaxed text-white/60">
        SEO（Search Engine Optimization）とGEO（Generative Engine Optimization）は
        どちらもWebサイトの発見可能性を高める施策ですが、最適化の対象と手法が異なります。
        この記事では、両者の違いと効果的な両立方法を解説します。
      </p>

      <div className="space-y-12">
        {/* Comparison Table */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-white">
            SEO vs GEO 比較表
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left font-semibold text-white/70">項目</th>
                  <th className="px-4 py-3 text-left font-semibold text-white/70">SEO</th>
                  <th className="px-4 py-3 text-left font-semibold text-primary">GEO</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row) => (
                  <tr key={row.aspect} className="border-b border-white/5">
                    <td className="px-4 py-3 font-medium text-white">{row.aspect}</td>
                    <td className="px-4 py-3 text-white/50">{row.seo}</td>
                    <td className="px-4 py-3 text-white/50">{row.geo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Market Context */}
        <section>
          <h2 className="mb-4 text-2xl font-bold text-white">
            なぜ今、GEO対策が必要か
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-white/60">
            <p>
              AI検索（ChatGPT、Perplexity、Gemini等）を利用するユーザーが増えており、
              AI経由の検索トラフィックは今後も重要性を増すと考えられています。
            </p>
            <p>
              一方、SEOは依然として検索トラフィックの主要なソースです。
              SEOを放棄してGEOだけに注力するのは現実的ではありません。
              重要なのは、SEOとGEOを両立させる戦略です。
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { value: "7項目", label: "GEOスコア チェック指標" },
              { value: "5ツール", label: "無料生成ツール" },
              { value: "30秒", label: "チェック所要時間" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-xs text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Both strategies */}
        <section>
          <h2 className="mb-2 text-2xl font-bold text-white">
            SEOとGEO、両方に効果がある施策
          </h2>
          <p className="mb-6 text-sm text-white/50">
            以下の施策はSEOとGEOの両方に効果があります。まずはここから始めましょう。
          </p>
          <div className="space-y-4">
            {bothStrategies.map((s) => (
              <div key={s.title} className="rounded-lg border border-white/10 bg-white/5 p-6">
                <h3 className="mb-2 font-semibold text-white">{s.title}</h3>
                <p className="text-sm leading-relaxed text-white/60">{s.desc}</p>
                {s.link && (
                  <Link
                    href={s.link}
                    className="mt-3 inline-block cursor-pointer text-sm text-primary transition-all duration-200 hover:text-primary/80"
                  >
                    生成ツールを使う &rarr;
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* GEO-only strategies */}
        <section>
          <h2 className="mb-2 text-2xl font-bold text-white">
            GEO固有の施策
          </h2>
          <p className="mb-6 text-sm text-white/50">
            以下はGEO特有の施策で、従来のSEOには含まれないものです。
          </p>
          <div className="space-y-4">
            {geoOnlyStrategies.map((s) => (
              <div key={s.title} className="rounded-lg border border-white/10 bg-white/5 p-6">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">GEO</span>
                  <h3 className="font-semibold text-white">{s.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-white/60">{s.desc}</p>
                {s.link && (
                  <Link
                    href={s.link}
                    className="mt-3 inline-block cursor-pointer text-sm text-primary transition-all duration-200 hover:text-primary/80"
                  >
                    生成ツールを使う &rarr;
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Priority Matrix */}
        <section>
          <h2 className="mb-4 text-2xl font-bold text-white">
            優先順位の考え方
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-white/60">
            <p>
              SEOがまだ整っていないサイトは、SEO対策から始めるべきです。
              SEOの基本（メタタグ、構造化データ、サイトマップ）はGEOにも効果があるため、
              SEOを整えることで同時にGEOの基盤も構築できます。
            </p>
            <p>
              SEOが一定水準に達しているサイトは、GEO固有の施策（llms.txt、AIクローラー許可、agent.json）を追加することで、
              AI検索からのトラフィックを獲得できます。
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <p className="mb-3 text-sm font-semibold text-white">SEO未対応のサイト</p>
              <ol className="space-y-2 text-sm text-white/50">
                <li>1. メタタグの最適化</li>
                <li>2. 構造化データの設置</li>
                <li>3. サイトマップの作成</li>
                <li>4. SSR/SSG対応</li>
                <li>5. llms.txt + AIクローラー許可</li>
              </ol>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
              <p className="mb-3 text-sm font-semibold text-primary">SEO対応済みのサイト</p>
              <ol className="space-y-2 text-sm text-white/50">
                <li>1. llms.txtの設置</li>
                <li>2. AIクローラーの許可</li>
                <li>3. agent.json（A2A）の設置</li>
                <li>4. 構造化データの拡充</li>
                <li>5. MCP Server APIの構築</li>
              </ol>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <h2 className="mb-4 text-2xl font-bold text-white">
            今すぐGEOスコアをチェック
          </h2>
          <p className="mb-4 text-sm text-white/60">
            あなたのサイトのSEO/GEO対応状況を無料で診断できます。
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/check"
              className="inline-block cursor-pointer rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/80"
            >
              GEOスコアをチェック
            </Link>
            <Link
              href="/guides/geo"
              className="inline-block cursor-pointer rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-white/10"
            >
              GEO対策ガイドを読む
            </Link>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-white">関連コンテンツ</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { href: "/guides/llms-txt", title: "llms.txt書き方ガイド", desc: "llms.txtの構成と記述のコツ" },
              { href: "/guides/checklist", title: "GEO対策チェックリスト", desc: "AI検索対応の全20項目を順番にチェック" },
              { href: "/guides/glossary", title: "GEO・AI検索 用語集", desc: "GEO関連の用語をまとめて解説" },
              { href: "/generate/llms-txt", title: "llms.txt生成ツール", desc: "AI向けサイト説明ファイルを自動生成" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-white/20"
              >
                <h3 className="mb-1 text-sm font-semibold text-white">{item.title}</h3>
                <p className="text-xs text-white/40">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <CtaBanner />
      </div>
    </div>
  );
}
