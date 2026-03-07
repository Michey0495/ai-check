import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareClient } from "./compare-client";

export const metadata: Metadata = {
  title: "GEOスコア比較",
  description:
    "複数のURLのAI検索対応度を比較。GEOスコアを横並びで確認し、競合サイトとの差分を把握できます。",
};

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-white/50">読み込み中...</div>}>
      <CompareClient />
    </Suspense>
  );
}
