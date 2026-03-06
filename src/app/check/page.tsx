import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckPageClient } from "./check-client";

export const metadata: Metadata = {
  title: "GEOスコアチェック",
  description:
    "URLを入力してWebサイトのAI検索対応度をチェック。7つの指標でGEOスコアを算出し、改善ポイントを提示します。",
};

export default function CheckPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-white/50">読み込み中...</div>}>
      <CheckPageClient />
    </Suspense>
  );
}
