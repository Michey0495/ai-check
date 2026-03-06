import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Checkについて",
  description:
    "AI Checkは、WebサイトのAI検索対応度をチェックし、改善コードを自動生成する無料ツールです。",
};

export default function AboutPage() {
  return (
    <div className="py-16">
      <h1 className="mb-4 text-3xl font-bold text-white">AI Checkについて</h1>
      <p className="mb-12 text-lg leading-relaxed text-white/60">
        AI Checkは、WebサイトのAI検索対応度をチェックし、
        llms.txt・robots.txt・JSON-LD構造化データを自動生成する無料ツールです。
      </p>

      <div className="space-y-12">
        <section>
          <h2 className="mb-4 text-2xl font-bold text-white">なぜ必要か</h2>
          <div className="space-y-4 text-sm leading-relaxed text-white/60">
            <p>
              2026年現在、AI検索は全検索市場の約25%を占めると予測されています。
              ChatGPT、Perplexity、Geminiなどの生成AI検索エンジンが急速に普及する中、
              89%のWebサイトがAI検索に未対応のままです。
            </p>
            <p>
              AI Checkは「何が足りないのか」「どう改善すればいいのか」を
              7つの指標で具体的に診断し、修正コードまで自動生成します。
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-white">機能一覧</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                name: "GEOスコアチェック",
                desc: "URLを入力するだけで7指標でAI検索対応度を診断",
                path: "/check",
              },
              {
                name: "llms.txt生成",
                desc: "AI向けサイト説明ファイルをフォーム入力で自動生成",
                path: "/generate/llms-txt",
              },
              {
                name: "robots.txt生成",
                desc: "AIクローラー対応のrobots.txtを自動生成",
                path: "/generate/robots-txt",
              },
              {
                name: "JSON-LD生成",
                desc: "Schema.org準拠の構造化データを自動生成",
                path: "/generate/json-ld",
              },
              {
                name: "agent.json生成",
                desc: "A2A Agent Card（AIエージェント名刺）を自動生成",
                path: "/generate/agent-json",
              },
              {
                name: "GEO対策ガイド",
                desc: "AI検索最適化の基本から実践まで解説",
                path: "/guides/geo",
              },
            ].map((feature) => (
              <Link
                key={feature.name}
                href={feature.path}
                className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-primary/30"
              >
                <h3 className="mb-1 font-semibold text-white">
                  {feature.name}
                </h3>
                <p className="text-sm text-white/50">{feature.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-white">技術スタック</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Next.js 15 (App Router)",
              "TypeScript (strict)",
              "Tailwind CSS",
              "shadcn/ui",
              "Vercel",
            ].map((tech) => (
              <div
                key={tech}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70"
              >
                {tech}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-white">
            AI公開チャネル
          </h2>
          <div className="space-y-3 text-sm text-white/60">
            <p>AI Check自体もAI検索に完全対応しています:</p>
            <ul className="list-inside list-disc space-y-1 text-white/50">
              <li>
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-white/80">/llms.txt</code>{" "}
                - AI向けサイト説明
              </li>
              <li>
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-white/80">
                  /.well-known/agent.json
                </code>{" "}
                - A2A Agent Card
              </li>
              <li>
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-white/80">/robots.txt</code>{" "}
                - AIクローラー許可設定
              </li>
              <li>
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-white/80">/api/mcp</code>{" "}
                - MCP Server
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
