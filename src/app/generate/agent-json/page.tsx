import type { Metadata } from "next";
import Link from "next/link";
import { AgentJsonGenerator } from "./generator-client";

export const metadata: Metadata = {
  title: "agent.json 生成ツール (A2A Agent Card)",
  description:
    "A2A（Agent-to-Agent）プロトコル対応のagent.jsonを自動生成。AIエージェント同士が連携するための名刺ファイル。",
  alternates: { canonical: "https://ai-check.ezoai.jp/generate/agent-json" },
  openGraph: {
    title: "agent.json 生成ツール (A2A Agent Card)",
    description: "A2A（Agent-to-Agent）プロトコル対応のagent.jsonを自動生成。AIエージェント同士が連携するための名刺ファイル。",
    url: "https://ai-check.ezoai.jp/generate/agent-json",
    images: [
      {
        url: "https://ai-check.ezoai.jp/opengraph-image",
        width: 1200,
        height: 630,
        alt: "agent.json 生成ツール (A2A Agent Card)",
      },
    ],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "AI Check", item: "https://ai-check.ezoai.jp" },
    { "@type": "ListItem", position: 2, name: "agent.json 生成ツール", item: "https://ai-check.ezoai.jp/generate/agent-json" },
  ],
};

export default function AgentJsonPage() {
  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <h1 className="mb-2 text-3xl font-bold text-white">
        agent.json 生成ツール
      </h1>
      <p className="mb-8 text-white/50">
        A2A Agent Card（AIエージェント名刺）をフォーム入力で自動生成。
        /.well-known/agent.json に配置してください。
      </p>
      <AgentJsonGenerator />

      <section className="mt-16">
        <h2 className="mb-4 text-2xl font-bold text-white">他の生成ツール</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/generate/llms-txt" className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-white/20">
            <h3 className="mb-1 text-sm font-semibold text-white">llms.txt 生成</h3>
            <p className="text-xs text-white/40">AI向けサイト説明ファイルを自動生成</p>
          </Link>
          <Link href="/generate/robots-txt" className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-white/20">
            <h3 className="mb-1 text-sm font-semibold text-white">robots.txt 生成</h3>
            <p className="text-xs text-white/40">AIクローラー対応のrobots.txtを生成</p>
          </Link>
          <Link href="/generate/json-ld" className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-white/20">
            <h3 className="mb-1 text-sm font-semibold text-white">JSON-LD 生成</h3>
            <p className="text-xs text-white/40">構造化データを自動生成</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
