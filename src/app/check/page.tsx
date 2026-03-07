import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckPageClient } from "./check-client";

export const metadata: Metadata = {
  title: "GEOスコアチェック",
  description:
    "URLを入力してWebサイトのAI検索対応度をチェック。7つの指標でGEOスコアを算出し、改善ポイントを提示します。",
  alternates: { canonical: "https://ai-check.ezoai.jp/check" },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "AI Check", item: "https://ai-check.ezoai.jp" },
    { "@type": "ListItem", position: 2, name: "GEOスコアチェック", item: "https://ai-check.ezoai.jp/check" },
  ],
};

export default function CheckPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense fallback={<div className="py-16 text-center text-white/50">読み込み中...</div>}>
        <CheckPageClient />
      </Suspense>
    </>
  );
}
