import type { Metadata } from "next";
import Link from "next/link";
import { UrlCheckForm } from "@/components/url-check-form";

export const metadata: Metadata = {
  title: "無料GEO対策ツール一覧 - llms.txt・robots.txt・JSON-LD・agent.json生成",
  description:
    "AI検索対応に必要なファイルを無料で自動生成。llms.txt生成、robots.txt AIクローラー設定、JSON-LD構造化データ生成、agent.json A2A Agent Card生成、GEOスコアバッジ生成の5ツール。",
  alternates: {
    canonical: "https://ai-check.ezoai.jp/tools",
  },
  openGraph: {
    title: "無料GEO対策ツール一覧 - AI検索対応ファイルを自動生成",
    description:
      "llms.txt・robots.txt・JSON-LD・agent.jsonを無料で自動生成。AI検索（ChatGPT・Perplexity・Gemini）対応に必要なファイルをワンクリックで作成。",
    url: "https://ai-check.ezoai.jp/tools",
  },
};

const tools = [
  {
    id: "llms-txt",
    name: "llms.txt 生成ツール",
    path: "/generate/llms-txt",
    description:
      "AIエージェントやLLMに対してサイトの概要・構造・API情報を伝えるためのllms.txtファイルを自動生成します。",
    details: [
      "サイトURL・名前・説明を入力するだけで生成",
      "主要ページ・API・技術情報セクションを含むMarkdown形式",
      "AIクローラー（ChatGPT, Claude, Perplexity等）がサイトを正確に理解",
    ],
    useCase: "全サイト必須。AI検索でサイト情報を正確に伝えるための基本ファイル。",
  },
  {
    id: "robots-txt",
    name: "robots.txt 生成ツール",
    path: "/generate/robots-txt",
    description:
      "GPTBot, ClaudeBot, PerplexityBot等の主要AIクローラーを明示的に許可するrobots.txtを生成します。",
    details: [
      "10種類のAIクローラーに対応（GPTBot, ChatGPT-User, ClaudeBot等）",
      "許可/ブロックをクローラーごとに個別設定可能",
      "Sitemapディレクティブを自動追加",
    ],
    useCase: "AIクローラーがサイトにアクセスできるよう、明示的に許可設定するために必要。",
  },
  {
    id: "json-ld",
    name: "JSON-LD 構造化データ生成ツール",
    path: "/generate/json-ld",
    description:
      "Schema.org準拠のJSON-LD構造化データを生成。WebSite, Organization, Product, Article, FAQ等の主要スキーマに対応。",
    details: [
      "12種類のスキーマタイプに対応（WebSite, Organization, Product, Article, FAQ, LocalBusiness, Event, Course等）",
      "必須プロパティを自動設定",
      "Google リッチリザルト対応",
    ],
    useCase: "AI検索エンジンがコンテンツの種類・構造を正確に理解するために不可欠。SEOにも効果的。",
  },
  {
    id: "agent-json",
    name: "agent.json 生成ツール",
    path: "/generate/agent-json",
    description:
      "Google A2A Protocol準拠のAgent Card（agent.json）を生成。AIエージェントがサービスを自動発見するための能力宣言ファイル。",
    details: [
      "A2A (Agent-to-Agent) Protocol に準拠",
      "サービスの能力・APIエンドポイントを宣言",
      "AIエージェントによる自動発見・自動連携を実現",
    ],
    useCase: "AIエージェント間連携（A2A）を見据えたサービス公開に。先進的なAI対策として。",
  },
  {
    id: "badge",
    name: "GEOスコアバッジ生成",
    path: "/generate/badge",
    description:
      "サイトのGEOスコアを示すSVGバッジを生成。GitHub README、Webサイト、ドキュメントに埋め込み可能。",
    details: [
      "リアルタイムスコア反映のSVGバッジ",
      "Markdown / HTML埋め込みコード自動生成",
      "flat / for-the-badge の2スタイル対応",
    ],
    useCase: "GitHub READMEやサイトフッターにGEO対策状況を表示し、信頼性をアピール。",
  },
];

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ホーム", item: "https://ai-check.ezoai.jp" },
    { "@type": "ListItem", position: 2, name: "ツール一覧", item: "https://ai-check.ezoai.jp/tools" },
  ],
};

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "GEO対策 無料ツール一覧",
  description: "AI検索対応に必要なファイルを無料で自動生成するツール集",
  url: "https://ai-check.ezoai.jp/tools",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: tool.name,
      url: `https://ai-check.ezoai.jp${tool.path}`,
      description: tool.description,
    })),
  },
};

export default function ToolsPage() {
  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <nav className="mb-8 text-sm text-white/40">
        <Link href="/" className="transition-all duration-200 hover:text-white/60">
          ホーム
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white/60">ツール一覧</span>
      </nav>

      <h1 className="mb-4 text-3xl font-bold text-white">
        無料GEO対策ツール
      </h1>
      <p className="mb-12 max-w-2xl text-lg leading-relaxed text-white/60">
        AI検索（ChatGPT・Perplexity・Gemini・Google AI Mode）に対応するために必要なファイルを、フォーム入力だけで自動生成。すべて無料・登録不要。
      </p>

      <div className="space-y-6">
        {tools.map((tool, i) => (
          <Link
            key={tool.id}
            href={tool.path}
            className="block cursor-pointer rounded-lg border border-white/10 bg-white/5 p-6 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08]"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                {i + 1}
              </span>
              <div className="flex-1">
                <h2 className="mb-1 text-lg font-semibold text-white">
                  {tool.name}
                </h2>
                <p className="mb-3 text-sm leading-relaxed text-white/60">
                  {tool.description}
                </p>
                <ul className="mb-3 space-y-1">
                  {tool.details.map((d) => (
                    <li key={d} className="text-sm text-white/40">
                      - {d}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-primary/70">
                  {tool.useCase}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <section className="mt-16 text-center">
        <h2 className="mb-4 text-2xl font-bold text-white">
          まずはGEOスコアをチェック
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-white/50">
          どのツールを使うべきか分からない場合は、まずGEOスコアチェックを実行。改善が必要な項目に応じて最適なツールをご案内します。
        </p>
        <div className="mx-auto max-w-xl">
          <UrlCheckForm size="lg" />
        </div>
        <p className="mt-4 text-sm text-white/40">
          無料・登録不要 / 30秒でスコア表示
        </p>
      </section>

      {/* Related Content */}
      <section className="mt-16">
        <h2 className="mb-6 text-xl font-bold text-white">関連コンテンツ</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { href: "/guides/quick-start", title: "5分で始めるGEO対策", desc: "robots.txt・llms.txt・JSON-LDの設定手順" },
            { href: "/guides/geo", title: "GEO対策ガイド", desc: "AI検索最適化の基本と実践" },
            { href: "/developers", title: "API / 開発者向け", desc: "REST API・MCP Serverリファレンス" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08]"
            >
              <p className="text-sm font-medium text-white">{link.title}</p>
              <p className="mt-1 text-xs text-white/40">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
