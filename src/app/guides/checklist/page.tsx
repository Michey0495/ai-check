import type { Metadata } from "next";
import Link from "next/link";
import { ChecklistClient } from "./checklist-client";

export const metadata: Metadata = {
  title: "GEO対策チェックリスト - AI検索対応 完全ガイド",
  description:
    "AI検索（ChatGPT・Perplexity・Gemini）に対応するためのGEO対策チェックリスト。7カテゴリ・全20項目を順番にクリアして、AI検索対応度を最大化。進捗は自動保存。",
  alternates: { canonical: "https://ai-check.ezoai.jp/guides/checklist" },
  openGraph: {
    title: "GEO対策チェックリスト - AI検索対応 完全ガイド",
    description: "AI検索（ChatGPT・Perplexity・Gemini）に対応するためのGEO対策チェックリスト。7カテゴリ・全20項目を順番にクリアして、AI検索対応度を最大化。",
    url: "https://ai-check.ezoai.jp/guides/checklist",
    images: [
      {
        url: "https://ai-check.ezoai.jp/guides/checklist/opengraph-image",
        width: 1200,
        height: 630,
        alt: "GEO対策チェックリスト - AI検索対応 完全ガイド",
      },
    ],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "AI Check", item: "https://ai-check.ezoai.jp" },
    { "@type": "ListItem", position: 2, name: "GEO対策チェックリスト", item: "https://ai-check.ezoai.jp/guides/checklist" },
  ],
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "GEO対策チェックリスト - AI検索対応の全手順",
  description:
    "WebサイトをAI検索（ChatGPT・Perplexity・Gemini）に対応させるための完全チェックリスト。7カテゴリ・全20項目。",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "AIクローラーアクセスの設定",
      text: "robots.txtでGPTBot、ClaudeBot、PerplexityBot等のAIクローラーを明示的に許可する。",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "llms.txtの設置",
      text: "サイトルートにllms.txtを配置し、サイト概要・主要ページ・API情報をAI向けに記述する。",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "構造化データの設置",
      text: "JSON-LD形式でWebSite、Organization、FAQPage等の構造化データを各ページに設置する。",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "メタデータの最適化",
      text: "title、description、OGPタグを全ページに設定し、AI検索エンジンがコンテンツを正確に理解できるようにする。",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "コンテンツ構造の改善",
      text: "セマンティックHTML（h1-h6、article、section、nav、main）を使用してコンテンツの論理構造を明確にする。",
    },
    {
      "@type": "HowToStep",
      position: 6,
      name: "レンダリングの最適化",
      text: "SSR/SSGを使用してHTMLにコンテンツを含め、AIクローラーがコンテンツを読み取れるようにする。",
    },
    {
      "@type": "HowToStep",
      position: 7,
      name: "AI連携の設定",
      text: "agent.json（A2A Agent Card）を設置し、サービスの能力をAIエージェントに宣言する。",
    },
  ],
  totalTime: "PT2H",
  datePublished: "2026-03-15",
  dateModified: "2026-03-15",
};

export default function ChecklistPage() {
  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      <h1 className="mb-4 text-3xl font-bold text-white">
        GEO対策チェックリスト
      </h1>
      <p className="mb-12 text-lg leading-relaxed text-white/60">
        AI検索（ChatGPT・Perplexity・Gemini）に対応するための全20項目。
        上から順番にチェックしていくだけで、サイトのAI検索対応度を最大化できます。
        進捗はブラウザに自動保存されます。
      </p>

      <ChecklistClient />

      <div className="mt-16 space-y-12">
        <section>
          <h2 className="mb-4 text-2xl font-bold text-white">
            チェックリストの使い方
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-white/60">
            <p>
              このチェックリストは、GEO対策の全体像を把握し、漏れなく実施するためのものです。
              各項目をクリックして完了マークを付けていきましょう。進捗はブラウザに自動保存されるため、
              途中で離脱しても続きから再開できます。
            </p>
            <p>
              まずは
              <Link href="/check" className="text-primary transition-all duration-200 hover:text-primary/80">
                GEOスコアチェック
              </Link>
              でサイトの現状を把握し、スコアの低い項目から優先的に対策することをおすすめします。
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-white">関連コンテンツ</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { href: "/check", title: "GEOスコアチェック", desc: "URLを入力してAI検索対応度を無料診断" },
              { href: "/guides/geo", title: "GEO対策ガイド", desc: "AI検索最適化の基本を体系的に解説" },
              { href: "/guides/geo-vs-seo", title: "GEO vs SEO", desc: "GEOとSEOの違いと両立する方法" },
              { href: "/guides/glossary", title: "GEO用語集", desc: "GEO・AI検索に関する用語をまとめて解説" },
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
      </div>
    </div>
  );
}
