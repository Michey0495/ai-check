import type { Metadata } from "next";
import { HistoryClient } from "./history-client";

export const metadata: Metadata = {
  title: "チェック履歴 | AI Check",
  description:
    "過去にチェックしたサイトのGEOスコア履歴を確認。スコアの推移を追跡し、改善効果を可視化。",
  alternates: { canonical: "https://ai-check.ezoai.jp/history" },
  openGraph: {
    title: "チェック履歴 | AI Check",
    description:
      "過去にチェックしたサイトのGEOスコア履歴を確認。スコアの推移を追跡し、改善効果を可視化。",
    url: "https://ai-check.ezoai.jp/history",
    type: "website",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "ホーム",
      item: "https://ai-check.ezoai.jp",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "チェック履歴",
      item: "https://ai-check.ezoai.jp/history",
    },
  ],
};

export default function HistoryPage() {
  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <h1 className="mb-2 text-3xl font-bold text-white">チェック履歴</h1>
      <p className="mb-8 text-white/50">
        過去にチェックしたサイトのGEOスコア履歴を確認できます。データはブラウザのlocalStorageに保存されています。
      </p>
      <HistoryClient />
    </div>
  );
}
