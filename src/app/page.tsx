import Link from "next/link";
import { UrlCheckForm } from "@/components/url-check-form";
import { CHECK_INDICATORS, GENERATOR_TYPES } from "@/lib/check-indicators";

const faqData = [
  {
    q: "GEO対策とは何ですか?",
    a: "GEO（Generative Engine Optimization）は、ChatGPT、Perplexity、Gemini等のAI検索エンジンに自サイトの情報を正しく参照・引用してもらうための最適化手法です。従来のSEO（検索エンジン最適化）のAI版と言えます。",
  },
  {
    q: "なぜGEO対策が必要なのですか?",
    a: "2026年現在、AI検索が全検索市場の25%（約$72B）を占めると予測されています。しかし89%のWebサイトがAI検索に未対応です。GEO対策をしないと、AI検索結果に表示されず、大きなトラフィック機会を逃すことになります。",
  },
  {
    q: "チェックは無料ですか?",
    a: "はい、基本チェックは完全無料でご利用いただけます。アカウント登録も不要です。URLを入力するだけで7つの指標でサイトを分析します。",
  },
  {
    q: "llms.txtとは何ですか?",
    a: "llms.txtは、AIエージェントやLLM（大規模言語モデル）に対してサイトの概要・構造・API情報を伝えるためのテキストファイルです。robots.txtのAI版と考えると分かりやすいです。",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AI Check",
  url: "https://ai-check.ezoai.jp",
  description:
    "URLを入力するだけでWebサイトのAI検索対応度を7指標でスコア化。llms.txt・robots.txt・JSON-LD構造化データを自動生成するGEO対策ツール。",
  applicationCategory: "SEO Tool",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
  },
  featureList: [
    "AI検索対応度スコア（7指標）",
    "llms.txt自動生成",
    "robots.txt AIクローラー設定生成",
    "JSON-LD構造化データ生成",
    "agent.json（A2A Agent Card）生成",
    "改善提案レポート",
  ],
  inLanguage: "ja",
  publisher: {
    "@type": "Organization",
    name: "ezoai.jp",
    url: "https://ezoai.jp",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqData.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export default function Home() {
  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Hero */}
      <section className="py-16 text-center">
        <p className="mb-4 text-sm font-medium tracking-wide text-primary/80">
          89%のWebサイトがAI検索に未対応
        </p>
        <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          あなたのサイトは
          <br />
          <span className="text-primary">AI検索</span>に対応していますか?
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/70">
          ChatGPT、Perplexity、Geminiで検索されたとき、あなたのサイトは表示されていますか?
          URLを入力するだけで対応度を7指標でスコア化し、修正コードまで自動生成。
        </p>
        <div className="mx-auto max-w-xl">
          <UrlCheckForm size="lg" />
        </div>
        <p className="mt-4 text-sm text-white/40">
          無料 / 登録不要 / 30秒で結果表示
        </p>
        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-4">
          {[
            { stat: "25%", label: "AI検索の市場シェア（2026年）" },
            { stat: "89%", label: "AI検索に未対応のWebサイト" },
            { stat: "7項目", label: "GEOスコア チェック指標" },
          ].map((item) => (
            <div key={item.stat} className="text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl">{item.stat}</p>
              <p className="mt-1 text-xs text-white/40 sm:text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7 Indicators */}
      <section className="py-16">
        <h2 className="mb-2 text-center text-2xl font-bold text-white">
          7つのチェック指標
        </h2>
        <p className="mb-10 text-center text-white/50">
          AI検索エンジン（ChatGPT, Perplexity, Gemini等）に最適化するための7項目
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHECK_INDICATORS.map((indicator, i) => (
            <div
              key={indicator.id}
              className="rounded-lg border border-white/10 bg-white/5 p-6 transition-all duration-200 hover:border-white/20"
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-white">{indicator.name}</h3>
              </div>
              <p className="text-sm leading-relaxed text-white/50">
                {indicator.description}
              </p>
            </div>
          ))}
          <div className="flex items-center justify-center rounded-lg border border-dashed border-white/10 p-6">
            <p className="text-center text-sm text-white/30">
              各指標は重み付けスコアで
              <br />
              総合GEOスコアを算出
            </p>
          </div>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="py-16">
        <h2 className="mb-10 text-center text-2xl font-bold text-white">
          3ステップでGEO対策
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "URLを入力",
              desc: "チェックしたいWebサイトのURLを入力するだけ。登録不要で即座に分析開始。",
            },
            {
              step: "2",
              title: "スコアを確認",
              desc: "7つの指標でAI検索対応度をスコア化。問題点と改善ポイントを具体的に表示。",
            },
            {
              step: "3",
              title: "コードを生成",
              desc: "llms.txt, robots.txt, JSON-LD等の修正コードをワンクリックで自動生成・ダウンロード。",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary">
                {item.step}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/50">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Who needs GEO */}
      <section className="py-16">
        <h2 className="mb-2 text-center text-2xl font-bold text-white">
          こんな方に必要です
        </h2>
        <p className="mb-10 text-center text-white/50">
          AI検索対策が遅れると、競合にトラフィックを奪われます
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { role: "Web制作会社", pain: "クライアントから「AI検索でうちのサイトが出ない」と相談されたら?" },
            { role: "ECサイト運営者", pain: "ChatGPTに商品を聞いたとき、競合だけが表示されていたら?" },
            { role: "SaaSプロダクト", pain: "Perplexityで「おすすめツール」を聞かれたとき、あなたのサービスは候補に入る?" },
            { role: "メディア・ブログ", pain: "AI検索が記事を引用してくれない = PV機会の損失" },
          ].map((item) => (
            <div
              key={item.role}
              className="rounded-lg border border-white/10 bg-white/5 p-6"
            >
              <h3 className="mb-2 font-semibold text-primary">{item.role}</h3>
              <p className="text-sm leading-relaxed text-white/50">
                {item.pain}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Generator Tools */}
      <section className="py-16">
        <h2 className="mb-2 text-center text-2xl font-bold text-white">
          無料生成ツール
        </h2>
        <p className="mb-10 text-center text-white/50">
          AI検索対応に必要なファイルをワンクリックで生成
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {GENERATOR_TYPES.map((gen) => (
            <Link
              key={gen.id}
              href={gen.path}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-6 transition-all duration-200 hover:border-primary/30 hover:bg-white/[0.08]"
            >
              <h3 className="mb-1 font-semibold text-white">{gen.name}</h3>
              <p className="text-sm text-white/50">{gen.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <h2 className="mb-10 text-center text-2xl font-bold text-white">
          よくある質問
        </h2>
        <div className="mx-auto max-w-2xl space-y-6">
          {faqData.map((faq) => (
            <div
              key={faq.q}
              className="rounded-lg border border-white/10 bg-white/5 p-6"
            >
              <h3 className="mb-2 font-semibold text-white">{faq.q}</h3>
              <p className="text-sm leading-relaxed text-white/50">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 text-center">
        <h2 className="mb-4 text-2xl font-bold text-white">
          GEO対策は今がチャンス
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-white/50">
          SEO対策ツールは1,000以上ある。でもGEO対策ツールは?
          日本語対応はほぼゼロ。競合が少ない今が先行者優位を取れるタイミング。
        </p>
        <div className="mx-auto max-w-xl">
          <UrlCheckForm size="lg" />
        </div>
        <p className="mt-4 text-sm text-white/40">
          無料・登録不要 / あなたのサイトのGEOスコアを30秒で表示
        </p>
      </section>
    </div>
  );
}
