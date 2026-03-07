import type { Metadata } from "next";
import { JsonLdGenerator } from "./generator-client";

export const metadata: Metadata = {
  title: "JSON-LD 構造化データ生成ツール",
  description:
    "Schema.org準拠のJSON-LD構造化データをフォーム入力だけで自動生成。WebSite, Organization, FAQPage等に対応。",
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
    </div>
  );
}
