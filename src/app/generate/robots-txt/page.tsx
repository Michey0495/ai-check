import type { Metadata } from "next";
import { RobotsTxtGenerator } from "./generator-client";

export const metadata: Metadata = {
  title: "robots.txt 生成ツール（AIクローラー対応）",
  description:
    "AIクローラー（GPTBot, ClaudeBot, PerplexityBot等）対応のrobots.txtを自動生成。AI検索に対応するための第一歩。",
  alternates: { canonical: "https://ai-check.ezoai.jp/generate/robots-txt" },
  openGraph: {
    title: "robots.txt 生成ツール（AIクローラー対応）",
    description: "AIクローラー（GPTBot, ClaudeBot, PerplexityBot等）対応のrobots.txtを自動生成。AI検索に対応するための第一歩。",
    url: "https://ai-check.ezoai.jp/generate/robots-txt",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "AI Check", item: "https://ai-check.ezoai.jp" },
    { "@type": "ListItem", position: 2, name: "robots.txt 生成ツール", item: "https://ai-check.ezoai.jp/generate/robots-txt" },
  ],
};

export default function RobotsTxtPage() {
  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <h1 className="mb-2 text-3xl font-bold text-white">
        robots.txt 生成ツール
      </h1>
      <p className="mb-8 text-white/50">
        AIクローラー対応のrobots.txtをワンクリックで生成。
      </p>
      <RobotsTxtGenerator />

      <section className="mt-16 space-y-6">
        <h2 className="text-2xl font-bold text-white">
          AIクローラーとrobots.txt
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/60">
          <p>
            ChatGPT (GPTBot)、Claude (ClaudeBot)、Perplexity (PerplexityBot)
            などのAI検索エンジンは、独自のクローラーでWebサイトを巡回しています。
          </p>
          <p>
            robots.txtでこれらのクローラーをブロックしていると、
            AI検索結果にサイト情報が反映されません。
            GEO対策の基本は、AIクローラーのアクセスを明示的に許可することです。
          </p>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="mb-4 text-2xl font-bold text-white">他の生成ツール</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <a href="/generate/llms-txt" className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-white/20">
            <h3 className="mb-1 text-sm font-semibold text-white">llms.txt 生成</h3>
            <p className="text-xs text-white/40">AI向けサイト説明ファイルを自動生成</p>
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
      </section>
    </div>
  );
}
