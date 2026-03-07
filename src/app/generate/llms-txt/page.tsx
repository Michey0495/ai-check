import type { Metadata } from "next";
import { LlmsTxtGenerator } from "./generator-client";

export const metadata: Metadata = {
  title: "llms.txt 生成ツール",
  description:
    "AI向けサイト説明ファイル（llms.txt）をフォーム入力だけで自動生成。AI検索エンジンにサイト情報を正しく伝える第一歩。",
  alternates: { canonical: "https://ai-check.ezoai.jp/generate/llms-txt" },
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

      <section className="mt-16">
        <h2 className="mb-4 text-2xl font-bold text-white">他の生成ツール</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <a href="/generate/robots-txt" className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-white/20">
            <h3 className="mb-1 text-sm font-semibold text-white">robots.txt 生成</h3>
            <p className="text-xs text-white/40">AIクローラー対応のrobots.txtを生成</p>
          </a>
          <a href="/generate/json-ld" className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-white/20">
            <h3 className="mb-1 text-sm font-semibold text-white">JSON-LD 生成</h3>
            <p className="text-xs text-white/40">構造化データを自動生成</p>
          </a>
          <a href="/generate/agent-json" className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-white/20">
            <h3 className="mb-1 text-sm font-semibold text-white">agent.json 生成</h3>
            <p className="text-xs text-white/40">A2A Agent Cardを自動生成</p>
          </a>
        </div>
        <p className="mt-4 text-center text-sm text-white/40">
          書き方を知りたい方は <a href="/guides/llms-txt" className="cursor-pointer text-primary/70 transition-all duration-200 hover:text-primary">llms.txt書き方ガイド</a> をご覧ください。
        </p>
      </section>
    </div>
  );
}
