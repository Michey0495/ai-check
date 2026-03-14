import type { Metadata } from "next";
import Link from "next/link";
import { CtaBanner } from "@/components/cta-banner";

export const metadata: Metadata = {
  title: "GEO・AI検索 用語集",
  description:
    "GEO対策・AI検索最適化に関する用語集。llms.txt、robots.txt、JSON-LD、A2A Agent Card、MCP Server等のキーワードを分かりやすく解説。",
  alternates: { canonical: "https://ai-check.ezoai.jp/guides/glossary" },
  openGraph: {
    title: "GEO・AI検索 用語集",
    description: "GEO対策・AI検索最適化に関する用語集。llms.txt、robots.txt、JSON-LD、A2A Agent Card、MCP Server等のキーワードを分かりやすく解説。",
    url: "https://ai-check.ezoai.jp/guides/glossary",
    images: [
      {
        url: "https://ai-check.ezoai.jp/guides/glossary/opengraph-image",
        width: 1200,
        height: 630,
        alt: "GEO・AI検索 用語集",
      },
    ],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "AI Check", item: "https://ai-check.ezoai.jp" },
    { "@type": "ListItem", position: 2, name: "用語集", item: "https://ai-check.ezoai.jp/guides/glossary" },
  ],
};

const glossaryTerms = [
  {
    term: "GEO（Generative Engine Optimization）",
    reading: "ジー・イー・オー",
    definition:
      "生成AI検索エンジン（ChatGPT、Perplexity、Gemini等）に対してWebサイトを最適化する手法の総称。従来のSEOがGoogleなどの検索エンジン向けであるのに対し、GEOはAI検索エンジン向けの最適化を指す。",
    related: ["/guides/geo", "/guides/geo-vs-seo"],
  },
  {
    term: "llms.txt",
    reading: "エル・エル・エム・エス・テキスト",
    definition:
      "Webサイトのルートディレクトリに配置するテキストファイル。AIエージェントやLLM（大規模言語モデル）に対して、サイトの概要・構造・API情報を伝える。robots.txtのAI版と位置づけられる。",
    related: ["/generate/llms-txt", "/guides/llms-txt"],
  },
  {
    term: "JSON-LD",
    reading: "ジェイソン・エルディー",
    definition:
      "JavaScript Object Notation for Linked Dataの略。Schema.orgの語彙を使って、Webページのコンテンツの意味（構造化データ）を記述する形式。<script type=\"application/ld+json\">タグ内にJSON形式で記述する。",
    related: ["/generate/json-ld"],
  },
  {
    term: "構造化データ",
    reading: "こうぞうかデータ",
    definition:
      "Webページのコンテンツの意味を機械可読な形式で記述したデータ。検索エンジンやAIがコンテンツの種類（記事、商品、FAQ等）を正確に理解するために使用する。JSON-LD、Microdata、RDFaなどの形式がある。",
    related: ["/generate/json-ld"],
  },
  {
    term: "robots.txt",
    reading: "ロボッツ・テキスト",
    definition:
      "Webサイトのルートに配置するファイルで、クローラー（検索エンジンやAIのボット）に対してアクセスの許可・拒否を指示する。GEO対策ではGPTBot、ClaudeBot等のAIクローラーを明示的に許可することが重要。",
    related: ["/generate/robots-txt"],
  },
  {
    term: "A2A（Agent-to-Agent）プロトコル",
    reading: "エー・トゥ・エー",
    definition:
      "Googleが提唱するAIエージェント間通信のオープンプロトコル。agent.jsonファイルを通じて、サービスの能力やAPIエンドポイントをAIエージェントに宣言する。",
    related: ["/generate/agent-json"],
  },
  {
    term: "agent.json（Agent Card）",
    reading: "エージェント・ジェイソン",
    definition:
      "A2Aプロトコルに基づいたJSON形式のファイル。/.well-known/agent.json に配置し、サービスの名称・説明・能力・APIエンドポイントをAIエージェントに宣言する。",
    related: ["/generate/agent-json"],
  },
  {
    term: "MCP（Model Context Protocol）",
    reading: "エム・シー・ピー",
    definition:
      "Anthropicが策定したプロトコルで、AIモデル（Claude等）が外部ツールやデータソースに接続するための標準規格。サービスをMCP Serverとして実装することで、AIエージェントが直接ツールとして利用できるようになる。",
  },
  {
    term: "AIクローラー",
    reading: "エーアイ・クローラー",
    definition:
      "AI検索エンジンがWebページの情報を収集するためのボット。代表的なものにGPTBot（OpenAI）、ClaudeBot/Anthropic-AI（Anthropic）、PerplexityBot（Perplexity）、Google-Extended（Google）がある。",
    related: ["/generate/robots-txt"],
  },
  {
    term: "SEO（Search Engine Optimization）",
    reading: "エス・イー・オー",
    definition:
      "検索エンジン最適化。Googleなどの従来の検索エンジンで上位表示されるためにWebサイトを最適化する手法。キーワード最適化、被リンク構築、テクニカルSEO等が含まれる。",
    related: ["/guides/geo-vs-seo"],
  },
  {
    term: "セマンティックHTML",
    reading: "セマンティック・エイチティーエムエル",
    definition:
      "文書の意味や構造を適切に表現するHTMLタグの使用法。<article>、<section>、<nav>、<main>、<header>、<footer>等のタグを使うことで、検索エンジンやAIが文書構造を正確に理解できるようになる。",
  },
  {
    term: "SSR（Server-Side Rendering）",
    reading: "エス・エス・アール",
    definition:
      "サーバーサイドレンダリング。WebページのHTMLをサーバー側で生成してからクライアントに送信する手法。AIクローラーの多くはJavaScriptを実行できないため、SSRによりコンテンツをHTML内に含めることがGEO対策として重要。",
  },
  {
    term: "GEOスコア",
    reading: "ジー・イー・オー・スコア",
    definition:
      "WebサイトのAI検索対応度を数値化した指標。AI Check では、robots.txt、llms.txt、構造化データ、メタタグ、コンテンツ構造、SSR、サイトマップの7項目をチェックし、100点満点でスコアを算出する。",
    related: ["/check"],
  },
  {
    term: "OGP（Open Graph Protocol）",
    reading: "オー・ジー・ピー",
    definition:
      "Facebookが策定したプロトコルで、Webページの情報（タイトル、説明、画像等）をSNSやAI検索エンジンに伝えるためのメタタグ規格。og:title、og:description、og:image等のタグを<head>内に記述する。",
  },
  {
    term: "サイトマップ（sitemap.xml）",
    reading: "サイトマップ",
    definition:
      "WebサイトのURL一覧をXML形式で記述したファイル。検索エンジンやAIクローラーがサイト内の全ページを効率的に発見・クロールするために使用する。",
  },
];

const definitionListJsonLd = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name: "GEO・AI検索 用語集",
  description: "GEO対策・AI検索最適化に関する用語集",
  url: "https://ai-check.ezoai.jp/guides/glossary",
  datePublished: "2026-03-06",
  dateModified: "2026-03-15",
  hasDefinedTerm: glossaryTerms.map((t) => ({
    "@type": "DefinedTerm",
    name: t.term,
    description: t.definition,
  })),
};

export default function GlossaryPage() {
  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definitionListJsonLd) }}
      />

      <h1 className="mb-4 text-3xl font-bold text-white">
        GEO・AI検索 用語集
      </h1>
      <p className="mb-12 text-lg leading-relaxed text-white/60">
        GEO対策やAI検索最適化で頻出する用語を分かりやすく解説します。
      </p>

      <div className="space-y-6">
        {glossaryTerms.map((t) => (
          <div
            key={t.term}
            id={t.term.split("（")[0].toLowerCase().replace(/[\s.]/g, "-")}
            className="rounded-lg border border-white/10 bg-white/5 p-6"
          >
            <h2 className="text-lg font-bold text-white">{t.term}</h2>
            {t.reading && (
              <p className="mt-0.5 text-xs text-white/30">{t.reading}</p>
            )}
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {t.definition}
            </p>
            {t.related && t.related.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {t.related.map((r) => (
                  <Link
                    key={r}
                    href={r}
                    className="cursor-pointer rounded bg-white/5 px-2 py-1 text-xs text-primary/70 transition-all duration-200 hover:bg-white/10 hover:text-primary"
                  >
                    {r.startsWith("/generate/") ? "生成ツール" : r.startsWith("/guides/") ? "ガイド" : "チェック"} &rarr;
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="mb-4 text-2xl font-bold text-white">
          GEO対策を始める
        </h2>
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
            GEO対策ガイド
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="mb-4 text-2xl font-bold text-white">関連コンテンツ</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { href: "/guides/geo-vs-seo", title: "GEO vs SEO 比較ガイド", desc: "GEOとSEOの違い・共通点を整理" },
            { href: "/guides/llms-txt", title: "llms.txt書き方ガイド", desc: "llms.txtの構成と記述のコツ" },
            { href: "/generate/json-ld", title: "JSON-LD生成ツール", desc: "構造化データを自動生成" },
            { href: "/check", title: "GEOスコアチェック", desc: "URLを入力してAI検索対応度を診断" },
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
  );
}
