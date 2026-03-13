import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { BadgeGenerator } from "./generator-client";

export const metadata: Metadata = {
  title: "GEOスコアバッジ生成 - サイトにスコアを埋め込む",
  description:
    "GEOスコアバッジを生成してREADMEやWebサイトに埋め込み。リアルタイムでAI検索対応度スコアを表示するSVGバッジ。",
  alternates: { canonical: "https://ai-check.ezoai.jp/generate/badge" },
  openGraph: {
    title: "GEOスコアバッジ生成 - サイトにスコアを埋め込む",
    description: "GEOスコアバッジを生成してREADMEやWebサイトに埋め込み。リアルタイムでAI検索対応度スコアを表示するSVGバッジ。",
    url: "https://ai-check.ezoai.jp/generate/badge",
    images: [
      {
        url: "https://ai-check.ezoai.jp/opengraph-image",
        width: 1200,
        height: 630,
        alt: "GEOスコアバッジ生成 - サイトにスコアを埋め込む",
      },
    ],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "AI Check", item: "https://ai-check.ezoai.jp" },
    { "@type": "ListItem", position: 2, name: "GEOスコアバッジ生成", item: "https://ai-check.ezoai.jp/generate/badge" },
  ],
};

export default function BadgePage() {
  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <h1 className="mb-2 text-3xl font-bold text-white">
        GEOスコアバッジ生成
      </h1>
      <p className="mb-8 text-white/50">
        サイトのGEOスコアをリアルタイムで表示するバッジを生成。
        GitHubのREADMEやWebサイトに埋め込めます。
      </p>
      <Suspense fallback={<div className="py-8 text-center text-white/50">読み込み中...</div>}>
        <BadgeGenerator />
      </Suspense>

      <section className="mt-16">
        <h2 className="mb-2 text-2xl font-bold text-white">使い方</h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/60">
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 font-semibold text-white">1. GitHubのREADMEに埋め込む</h3>
            <p>
              MarkdownコードをコピーしてリポジトリのREADME.mdに貼り付けるだけ。
              バッジをクリックすると詳細なチェック結果ページに遷移します。
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 font-semibold text-white">2. Webサイトに埋め込む</h3>
            <p>
              HTMLコードをサイトのフッターやサイドバーに追加。
              訪問者にAI検索対応度をアピールできます。
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 font-semibold text-white">3. スコアは自動更新</h3>
            <p>
              バッジは表示時にリアルタイムでGEOスコアを取得します（1時間キャッシュ）。
              サイトを改善すれば、バッジのスコアも自動的に上がります。
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="mb-4 text-2xl font-bold text-white">他の生成ツール</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/generate/llms-txt" className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-white/20">
            <h3 className="mb-1 text-sm font-semibold text-white">llms.txt 生成</h3>
            <p className="text-xs text-white/50">AI向けサイト説明ファイルを生成</p>
          </Link>
          <Link href="/generate/robots-txt" className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-white/20">
            <h3 className="mb-1 text-sm font-semibold text-white">robots.txt 生成</h3>
            <p className="text-xs text-white/50">AIクローラー対応のrobots.txtを生成</p>
          </Link>
          <Link href="/generate/json-ld" className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-white/20">
            <h3 className="mb-1 text-sm font-semibold text-white">JSON-LD 生成</h3>
            <p className="text-xs text-white/50">Schema.org準拠の構造化データを生成</p>
          </Link>
          <Link href="/generate/agent-json" className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-white/20">
            <h3 className="mb-1 text-sm font-semibold text-white">agent.json 生成</h3>
            <p className="text-xs text-white/50">A2A Agent Card を生成</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
