import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareClient } from "./compare-client";

export const metadata: Metadata = {
  title: "GEOスコア比較",
  description:
    "複数のURLのAI検索対応度を比較。GEOスコアを横並びで確認し、競合サイトとの差分を把握できます。",
  alternates: { canonical: "https://ai-check.ezoai.jp/check/compare" },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "AI Check", item: "https://ai-check.ezoai.jp" },
    { "@type": "ListItem", position: 2, name: "GEOスコアチェック", item: "https://ai-check.ezoai.jp/check" },
    { "@type": "ListItem", position: 3, name: "GEOスコア比較", item: "https://ai-check.ezoai.jp/check/compare" },
  ],
};

export default function ComparePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense fallback={<div className="py-16 text-center text-white/50">読み込み中...</div>}>
        <CompareClient />
      </Suspense>
    </>
  );
}
