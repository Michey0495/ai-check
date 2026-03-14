import type { Metadata } from "next";
import Link from "next/link";
import { UrlCheckForm } from "@/components/url-check-form";
import { CtaBanner } from "@/components/cta-banner";

export const metadata: Metadata = {
  title: "5分で始めるGEO対策 - クイックスタートガイド",
  description:
    "AI検索対応（GEO対策）を5分で始める方法。robots.txt、llms.txt、JSON-LD構造化データの3つを設定するだけで、ChatGPT・Perplexity・Geminiにあなたのサイトが表示されるようになります。",
  openGraph: {
    title: "5分で始めるGEO対策 - クイックスタートガイド",
    description:
      "robots.txt、llms.txt、JSON-LDの3ファイルを設定するだけ。AI検索対応を最短で実現するクイックスタートガイド。",
    images: [
      {
        url: "https://ai-check.ezoai.jp/guides/quick-start/opengraph-image",
        width: 1200,
        height: 630,
        alt: "5分で始めるGEO対策 - クイックスタートガイド",
      },
    ],
  },
  alternates: {
    canonical: "https://ai-check.ezoai.jp/guides/quick-start",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "ホーム",
      item: "https://ai-check.ezoai.jp",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "5分で始めるGEO対策",
      item: "https://ai-check.ezoai.jp/guides/quick-start",
    },
  ],
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "5分で始めるGEO対策 - AI検索にサイトを対応させる方法",
  description:
    "robots.txt、llms.txt、JSON-LDの3ファイルを設定するだけで、AI検索エンジンにサイト情報を正しく伝えられるようになります。",
  totalTime: "PT5M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "現状を確認する",
      text: "AI Checkでサイトをチェックし、現在のGEOスコアと問題点を把握する。",
      url: "https://ai-check.ezoai.jp/check",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "robots.txtでAIクローラーを許可する",
      text: "robots.txtにAIクローラー（GPTBot、ClaudeBot、PerplexityBot等）のアクセスを明示的に許可する設定を追加する。",
      url: "https://ai-check.ezoai.jp/generate/robots-txt",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "llms.txtを設置する",
      text: "サイトの概要・主要ページ・API情報をまとめたllms.txtファイルを作成し、ルートディレクトリに配置する。",
      url: "https://ai-check.ezoai.jp/generate/llms-txt",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "JSON-LD構造化データを追加する",
      text: "サイトの種類に合ったJSON-LD構造化データをHTMLのheadタグ内に設置する。",
      url: "https://ai-check.ezoai.jp/generate/json-ld",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "再チェックして改善を確認する",
      text: "AI Checkで再度スコアをチェックし、改善されたことを確認する。",
      url: "https://ai-check.ezoai.jp/check",
    },
  ],
  tool: {
    "@type": "HowToTool",
    name: "AI Check - GEO対策ツール",
  },
  datePublished: "2026-03-06",
  dateModified: "2026-03-15",
};

const steps = [
  {
    num: 0,
    title: "現状を把握する",
    time: "30秒",
    description:
      "まず、あなたのサイトが今どの程度AI検索に対応しているかを確認します。下のフォームにURLを入力してチェックしてください。",
    hasForm: true,
    code: null,
    fileName: null,
    toolLink: null,
    toolLabel: null,
  },
  {
    num: 1,
    title: "robots.txtでAIクローラーを許可する",
    time: "1分",
    description:
      "robots.txtは、検索エンジンのクローラーにアクセスルールを伝えるファイルです。AI検索エンジン（ChatGPT、Perplexity、Gemini等）のクローラーを明示的に許可します。",
    hasForm: false,
    code: `User-agent: *
Allow: /

# AIクローラーを明示的に許可
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://yoursite.com/sitemap.xml`,
    fileName: "robots.txt（サイトのルートに配置）",
    toolLink: "/generate/robots-txt",
    toolLabel: "robots.txt生成ツールで自動生成",
  },
  {
    num: 2,
    title: "llms.txtを作成する",
    time: "2分",
    description:
      "llms.txtは、AIエージェントにサイトの概要を伝えるためのファイルです。サイト名、説明、主要ページの一覧を記載します。robots.txtの「AI版」と考えてください。",
    hasForm: false,
    code: `# サイト名

> サイトの一行説明（何のサイトで、誰向けか）

## 主要ページ
- [トップページ](https://yoursite.com/): サイトの概要
- [サービス](https://yoursite.com/services): 提供するサービス一覧
- [ブログ](https://yoursite.com/blog): 技術ブログ・お知らせ
- [お問い合わせ](https://yoursite.com/contact): お問い合わせフォーム

## API
- なし（APIがある場合はここに記載）`,
    fileName: "llms.txt（サイトのルートに配置）",
    toolLink: "/generate/llms-txt",
    toolLabel: "llms.txt生成ツールで自動生成",
  },
  {
    num: 3,
    title: "JSON-LD構造化データを追加する",
    time: "2分",
    description:
      "JSON-LDは、ページの内容を機械可読な形式で伝える構造化データです。サイトの種類に合わせたスキーマを選び、HTMLのhead内に設置します。",
    hasForm: false,
    code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "サイト名",
  "url": "https://yoursite.com",
  "description": "サイトの説明文",
  "inLanguage": "ja",
  "publisher": {
    "@type": "Organization",
    "name": "運営者名"
  }
}
</script>`,
    fileName: "HTMLの<head>内に追加",
    toolLink: "/generate/json-ld",
    toolLabel: "JSON-LD生成ツールで自動生成",
  },
];

const schemaExamples = [
  { type: "WebSite", use: "コーポレートサイト、ポートフォリオ" },
  { type: "Product", use: "ECサイト、商品ページ" },
  { type: "Article", use: "ブログ、ニュースサイト" },
  { type: "LocalBusiness", use: "店舗、クリニック、飲食店" },
  { type: "SoftwareApplication", use: "SaaS、Webツール" },
  { type: "FAQPage", use: "よくある質問ページ" },
];

export default function QuickStartGuidePage() {
  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      <nav className="mb-8 text-sm text-white/40">
        <Link
          href="/"
          className="cursor-pointer transition-all duration-200 hover:text-white/70"
        >
          ホーム
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white/70">5分で始めるGEO対策</span>
      </nav>

      <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
        5分で始めるGEO対策
      </h1>
      <p className="mb-4 max-w-2xl text-lg leading-relaxed text-white/60">
        AI検索（ChatGPT、Perplexity、Gemini）にあなたのサイトを表示させるために、
        最低限必要な3つのファイルを設定するだけ。技術的な知識がなくても始められます。
      </p>
      <p className="mb-12 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary/80">
        この3つを設定するだけで、GEOスコアの大幅な改善が期待できます。まずはチェックして現状を確認しましょう。
      </p>

      {/* Overview: 3 files */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-white">
          設定する3つのファイル
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              name: "robots.txt",
              role: "AIクローラーのアクセスを許可",
              time: "1分",
            },
            {
              name: "llms.txt",
              role: "AIにサイト情報を伝える",
              time: "2分",
            },
            {
              name: "JSON-LD",
              role: "コンテンツを構造化データで伝える",
              time: "2分",
            },
          ].map((file, i) => (
            <div
              key={file.name}
              className="rounded-lg border border-white/10 bg-white/5 p-5"
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <span className="font-semibold text-white">{file.name}</span>
              </div>
              <p className="text-sm text-white/50">{file.role}</p>
              <p className="mt-2 text-xs text-white/30">~{file.time}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Step-by-step */}
      <section className="space-y-12">
        {steps.map((step) => (
          <div key={step.num} id={`step-${step.num}`}>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary">
                {step.num}
              </span>
              <div>
                <h2 className="text-xl font-bold text-white">{step.title}</h2>
                <p className="text-xs text-white/30">~{step.time}</p>
              </div>
            </div>
            <p className="mb-4 max-w-2xl text-sm leading-relaxed text-white/60">
              {step.description}
            </p>

            {step.hasForm && (
              <div className="mx-auto max-w-xl">
                <UrlCheckForm size="sm" />
              </div>
            )}

            {step.code && (
              <div className="overflow-hidden rounded-lg border border-white/10">
                {step.fileName && (
                  <div className="border-b border-white/10 bg-white/5 px-4 py-2">
                    <p className="text-xs text-white/40">{step.fileName}</p>
                  </div>
                )}
                <pre className="overflow-x-auto bg-black/50 p-4 text-xs leading-relaxed text-white/70">
                  <code>{step.code}</code>
                </pre>
              </div>
            )}

            {step.toolLink && (
              <Link
                href={step.toolLink}
                className="mt-3 inline-block cursor-pointer text-sm text-primary/70 transition-all duration-200 hover:text-primary"
              >
                {step.toolLabel} →
              </Link>
            )}

            {/* Schema type examples for JSON-LD step */}
            {step.num === 3 && (
              <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-5">
                <h3 className="mb-3 text-sm font-semibold text-white">
                  サイトの種類別: 推奨スキーマタイプ
                </h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {schemaExamples.map((ex) => (
                    <div key={ex.type} className="text-sm">
                      <span className="font-mono text-primary/80">
                        {ex.type}
                      </span>
                      <span className="ml-2 text-white/40">{ex.use}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/generate/json-ld"
                  className="mt-3 inline-block cursor-pointer text-xs text-primary/60 transition-all duration-200 hover:text-primary"
                >
                  JSON-LD生成ツールで6タイプに対応 →
                </Link>
              </div>
            )}
          </div>
        ))}

        {/* Step 4: Re-check */}
        <div id="step-4">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/20 text-lg font-bold text-green-400">
              4
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">
                再チェックして確認する
              </h2>
              <p className="text-xs text-white/30">~30秒</p>
            </div>
          </div>
          <p className="mb-4 max-w-2xl text-sm leading-relaxed text-white/60">
            3つのファイルをサーバーにアップロードしたら、再度チェックしてスコアの改善を確認しましょう。
            前回比のスコア変化も自動で表示されます。
          </p>
          <div className="mx-auto max-w-xl">
            <UrlCheckForm size="sm" />
          </div>
        </div>
      </section>

      {/* Next steps */}
      <section className="mt-16">
        <h2 className="mb-6 text-2xl font-bold text-white">
          さらにスコアを上げるには
        </h2>
        <p className="mb-6 text-sm text-white/50">
          上記の3ファイルでCランク以上を達成した後、以下の施策でAランクを目指せます。
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "メタタグの最適化",
              desc: "title、description、OGPタグ、canonical URL、lang属性を全ページに設定する",
              link: "/check/meta-tags",
            },
            {
              title: "セマンティックHTMLの改善",
              desc: "h1-h6の見出し階層、main、article、section、navタグで文書構造を明確にする",
              link: "/check/content-structure",
            },
            {
              title: "sitemap.xmlの充実",
              desc: "全主要ページを含むサイトマップを作成し、robots.txtからリンクする",
              link: "/check/sitemap",
            },
            {
              title: "agent.jsonの設置",
              desc: "A2A Agent Cardを設置して、AIエージェントがサービスを自動発見できるようにする",
              link: "/generate/agent-json",
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.link}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08]"
            >
              <h3 className="mb-1 text-sm font-semibold text-white">
                {item.title}
              </h3>
              <p className="text-xs leading-relaxed text-white/40">
                {item.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Related content */}
      <section className="mt-16">
        <h2 className="mb-4 text-xl font-bold text-white">関連コンテンツ</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              href: "/guides/geo",
              title: "GEO対策ガイド",
              desc: "AI検索最適化の基本と実践を詳しく解説",
            },
            {
              href: "/guides/checklist",
              title: "GEO対策チェックリスト",
              desc: "20項目のインタラクティブリストで進捗管理",
            },
            {
              href: "/guides/industry",
              title: "業界別GEO対策",
              desc: "EC・SaaS・メディア・士業等の業界別ガイド",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08]"
            >
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="mt-1 text-xs text-white/40">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-12">
        <CtaBanner />
      </div>
    </div>
  );
}
