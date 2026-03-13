import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "llms.txt書き方ガイド",
  description:
    "llms.txtの書き方を完全解説。AI検索エンジンやLLMにサイト情報を伝えるためのフォーマット、記載項目、設置方法を紹介。",
  alternates: { canonical: "https://ai-check.ezoai.jp/guides/llms-txt" },
  openGraph: {
    title: "llms.txt書き方ガイド",
    description: "llms.txtの書き方を完全解説。AI検索エンジンやLLMにサイト情報を伝えるためのフォーマット、記載項目、設置方法を紹介。",
    url: "https://ai-check.ezoai.jp/guides/llms-txt",
    images: [
      {
        url: "https://ai-check.ezoai.jp/opengraph-image",
        width: 1200,
        height: 630,
        alt: "llms.txt書き方ガイド",
      },
    ],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "AI Check", item: "https://ai-check.ezoai.jp" },
    { "@type": "ListItem", position: 2, name: "llms.txt書き方ガイド", item: "https://ai-check.ezoai.jp/guides/llms-txt" },
  ],
};

export default function LlmsTxtGuidePage() {
  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <h1 className="mb-4 text-3xl font-bold text-white">
        llms.txt 書き方ガイド
      </h1>
      <p className="mb-12 text-lg leading-relaxed text-white/60">
        llms.txtはAI向けのサイト説明ファイルです。
        Webサイトのルートに配置することで、AI検索エンジンやエージェントがサイトを正確に理解できるようになります。
      </p>

      <div className="space-y-12">
        <section>
          <h2 className="mb-4 text-2xl font-bold text-white">基本フォーマット</h2>
          <pre className="overflow-x-auto rounded-lg border border-white/10 bg-white/5 p-6 text-sm leading-relaxed text-white/70">
            <code>{`# サイト名

> サイトの簡潔な説明（1-2文）

## 主要ページ
- [トップ](https://example.com/): サイトの概要
- [サービス](https://example.com/services): 提供するサービス
- [ブログ](https://example.com/blog): 技術記事・お知らせ

## API
- [REST API](https://example.com/api): データ取得用API
- [MCP Server](https://example.com/api/mcp): AIエージェント連携

## 連絡先
- サイト: https://example.com
- メール: info@example.com`}</code>
          </pre>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-white">記載すべき項目</h2>
          <div className="space-y-4">
            {[
              {
                title: "サイト名と概要",
                desc: "Markdownの見出し（#）でサイト名を、引用（>）で概要を記載します。AIがサイトの目的を即座に理解できるよう、簡潔に書きましょう。",
              },
              {
                title: "主要ページ",
                desc: "サイトの重要なページをリスト形式で記載します。各ページの役割を簡潔に説明することで、AIが適切なページを参照できます。",
              },
              {
                title: "API情報",
                desc: "REST API、MCP Server、GraphQL等のエンドポイント情報を記載します。AIエージェントが直接APIを利用する際の手がかりとなります。",
              },
              {
                title: "連絡先",
                desc: "サイトURLやメールアドレスなど、信頼性を示す情報を記載します。",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-white/10 bg-white/5 p-5"
              >
                <h3 className="mb-1 font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-white">設置方法</h2>
          <div className="space-y-4 text-sm leading-relaxed text-white/60">
            <p>
              作成したllms.txtファイルをWebサイトのルートディレクトリに配置します。
              https://example.com/llms.txt でアクセスできるようにしてください。
            </p>
            <p>
              Next.jsの場合は <code className="rounded bg-white/10 px-1.5 py-0.5 text-white/80">public/llms.txt</code> に配置します。
            </p>
          </div>
        </section>

        <section className="text-center">
          <Link
            href="/generate/llms-txt"
            className="inline-block cursor-pointer rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/80"
          >
            llms.txtを自動生成
          </Link>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-white">関連コンテンツ</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { href: "/guides/geo", title: "GEO対策ガイド", desc: "AI検索最適化の基本7ステップ" },
              { href: "/guides/geo-vs-seo", title: "GEO vs SEO 比較ガイド", desc: "GEOとSEOの違いを整理" },
              { href: "/generate/robots-txt", title: "robots.txt生成ツール", desc: "AIクローラー対応のrobots.txtを生成" },
              { href: "/generate/agent-json", title: "agent.json生成ツール", desc: "A2A Agent Cardを自動生成" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-white/20"
              >
                <h3 className="mb-1 text-sm font-semibold text-white">{item.title}</h3>
                <p className="text-xs text-white/40">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
