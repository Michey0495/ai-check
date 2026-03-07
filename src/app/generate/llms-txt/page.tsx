import type { Metadata } from "next";
import { LlmsTxtGenerator } from "./generator-client";

export const metadata: Metadata = {
  title: "llms.txt 生成ツール",
  description:
    "AI向けサイト説明ファイル（llms.txt）をフォーム入力だけで自動生成。AI検索エンジンにサイト情報を正しく伝える第一歩。",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "AI Check", item: "https://ai-check.ezoai.jp" },
    { "@type": "ListItem", position: 2, name: "llms.txt 生成ツール", item: "https://ai-check.ezoai.jp/generate/llms-txt" },
  ],
};

export default function LlmsTxtPage() {
  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <h1 className="mb-2 text-3xl font-bold text-white">llms.txt 生成ツール</h1>
      <p className="mb-8 text-white/50">
        AI向けサイト説明ファイルをフォーム入力だけで自動生成。サイトのルートに配置してください。
      </p>
      <LlmsTxtGenerator />

      <section className="mt-16 space-y-6">
        <h2 className="text-2xl font-bold text-white">llms.txtとは</h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/60">
          <p>
            llms.txtは、LLM（大規模言語モデル）やAIエージェントに対して、
            Webサイトの概要・構造・提供するAPI情報を伝えるためのテキストファイルです。
          </p>
          <p>
            robots.txtがクローラーのアクセス制御を行うのに対し、
            llms.txtはAIがサイトを「理解」するための情報を提供します。
          </p>
          <p>
            Webサイトのルートディレクトリ（例: https://example.com/llms.txt）に配置することで、
            AI検索エンジンやエージェントがサイトの情報を正確に把握できるようになります。
          </p>
        </div>
      </section>
    </div>
  );
}
