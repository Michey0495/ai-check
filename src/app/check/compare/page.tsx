import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareClient } from "./compare-client";

export const metadata: Metadata = {
  title: "GEOスコア比較 - 複数サイトのAI検索対応度を比較",
  description:
    "最大5サイトのAI検索対応度を横並びで比較。GEOスコアの差分を可視化し、競合との差を把握。無料・登録不要。",
  alternates: { canonical: "https://ai-check.ezoai.jp/check/compare" },
  openGraph: {
    title: "GEOスコア比較 - 複数サイトのAI検索対応度を比較",
    description: "最大5サイトのGEOスコアを横並びで比較。競合との差を可視化。",
    url: "https://ai-check.ezoai.jp/check/compare",
    images: [
      {
        url: "https://ai-check.ezoai.jp/check/compare/opengraph-image",
        width: 1200,
        height: 630,
        alt: "GEOスコア比較 - 複数サイトのAI検索対応度を比較",
      },
    ],
  },
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
