import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "GEO対策ガイド - AI検索最適化の基本",
  description:
    "GEO（Generative Engine Optimization）対策の完全ガイド。ChatGPT, Perplexity, GeminiなどのAI検索エンジンに対応するための7つのステップを解説。",
};

export default function GeoGuidePage() {
  return (
    <div className="py-16">
      <h1 className="mb-4 text-3xl font-bold text-white">
        GEO対策ガイド - AI検索最適化の基本
      </h1>
      <p className="mb-12 text-lg leading-relaxed text-white/60">
        GEO（Generative Engine Optimization）は、AI検索エンジンに自サイトの情報を
        正しく参照・引用してもらうための最適化手法です。
        このガイドでは、GEO対策の基本から実践まで解説します。
      </p>

      <div className="space-y-12">
        <section>
          <h2 className="mb-4 text-2xl font-bold text-white">
            GEOとは何か
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-white/60">
            <p>
              従来のSEO（Search Engine Optimization）がGoogleなどの検索エンジンへの最適化であるのに対し、
              GEOはChatGPT、Perplexity、Geminiなどの生成AI検索エンジンへの最適化です。
            </p>
            <p>
              2026年現在、AI検索は全検索市場の約25%（約$72B）を占めると予測されています。
              しかし89%のWebサイトがAI検索に未対応のままです。
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-white">
            GEO対策の7つのステップ
          </h2>
          <div className="space-y-6">
            {[
              {
                title: "1. AIクローラーのアクセスを許可する",
                content:
                  "robots.txtでGPTBot, ClaudeBot, PerplexityBot等のAIクローラーを明示的に許可します。多くのサイトがデフォルトでブロックしていますが、AI検索に表示されるためにはアクセスを許可する必要があります。",
                link: "/generate/robots-txt",
                linkText: "robots.txt生成ツール",
              },
              {
                title: "2. llms.txtを設置する",
                content:
                  "llms.txtはAIエージェントにサイトの概要を伝えるファイルです。サイトのルートディレクトリに配置することで、AI検索エンジンがサイトの構造や提供するサービスを正確に把握できます。",
                link: "/generate/llms-txt",
                linkText: "llms.txt生成ツール",
              },
              {
                title: "3. 構造化データ（JSON-LD）を設置する",
                content:
                  "Schema.org準拠のJSON-LD構造化データにより、AIがコンテンツの意味を正確に理解できます。WebSite, Organization, FAQPage, Article等のスキーマタイプを適切に使い分けましょう。",
                link: "/generate/json-ld",
                linkText: "JSON-LD生成ツール",
              },
              {
                title: "4. メタタグを最適化する",
                content:
                  "title, meta description, OGPタグを適切に設定します。AIはこれらの情報をコンテンツの要約として参照するため、正確で簡潔な記述が重要です。",
              },
              {
                title: "5. セマンティックHTMLを使用する",
                content:
                  "h1-h6の見出し階層、article, section, nav, main等のセマンティックタグを正しく使用します。AIがドキュメント構造を理解する際の重要な手がかりとなります。",
              },
              {
                title: "6. サーバーサイドレンダリングを確保する",
                content:
                  "AIクローラーはJavaScriptの実行が制限される場合があります。重要なコンテンツがHTMLに含まれるよう、SSR（サーバーサイドレンダリング）またはSSG（静的サイト生成）を使用しましょう。",
              },
              {
                title: "7. サイトマップを最適化する",
                content:
                  "sitemap.xmlを設置し、全ての重要なページを登録します。lastmodを定期的に更新することで、AIクローラーに新しいコンテンツの存在を伝えられます。",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="rounded-lg border border-white/10 bg-white/5 p-6"
              >
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/60">
                  {step.content}
                </p>
                {step.link && (
                  <Link
                    href={step.link}
                    className="mt-3 inline-block text-sm text-primary transition-all duration-200 hover:text-primary/80 cursor-pointer"
                  >
                    {step.linkText} &rarr;
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-white">
            今すぐチェック
          </h2>
          <p className="mb-4 text-sm text-white/60">
            あなたのサイトのGEO対応度を無料でチェックできます。
          </p>
          <Link
            href="/check"
            className="inline-block cursor-pointer rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/80"
          >
            GEOスコアをチェック
          </Link>
        </section>
      </div>
    </div>
  );
}
