import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdGenerator } from "./generator-client";

export const metadata: Metadata = {
  title: "JSON-LD 構造化データ生成ツール",
  description:
    "Schema.org準拠のJSON-LD構造化データをフォーム入力だけで自動生成。WebSite, Organization, FAQPage, Product, Event等12タイプ対応。",
  alternates: { canonical: "https://ai-check.ezoai.jp/generate/json-ld" },
  openGraph: {
    title: "JSON-LD 構造化データ生成ツール",
    description: "Schema.org準拠のJSON-LD構造化データをフォーム入力だけで自動生成。WebSite, Organization, FAQPage等に対応。",
    url: "https://ai-check.ezoai.jp/generate/json-ld",
    images: [
      {
        url: "https://ai-check.ezoai.jp/opengraph-image",
        width: 1200,
        height: 630,
        alt: "JSON-LD 構造化データ生成ツール",
      },
    ],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "AI Check", item: "https://ai-check.ezoai.jp" },
    { "@type": "ListItem", position: 2, name: "JSON-LD 生成ツール", item: "https://ai-check.ezoai.jp/generate/json-ld" },
  ],
};

export default function JsonLdPage() {
  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <h1 className="mb-2 text-3xl font-bold text-white">
        JSON-LD 構造化データ生成
      </h1>
      <p className="mb-8 text-white/50">
        Schema.org準拠の構造化データをフォーム入力で自動生成。HTMLの
        {"<head>"}にそのまま貼り付け可能。
      </p>
      <JsonLdGenerator />

      <section className="mt-16">
        <h2 className="mb-4 text-2xl font-bold text-white">他の生成ツール</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/generate/llms-txt" className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-white/20">
            <h3 className="mb-1 text-sm font-semibold text-white">llms.txt 生成</h3>
            <p className="text-xs text-white/40">AI向けサイト説明ファイルを自動生成</p>
          </Link>
          <Link href="/generate/robots-txt" className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-white/20">
            <h3 className="mb-1 text-sm font-semibold text-white">robots.txt 生成</h3>
            <p className="text-xs text-white/40">AIクローラー対応のrobots.txtを生成</p>
          </Link>
          <Link href="/generate/agent-json" className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-white/20">
            <h3 className="mb-1 text-sm font-semibold text-white">agent.json 生成</h3>
            <p className="text-xs text-white/40">A2A Agent Cardを自動生成</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
