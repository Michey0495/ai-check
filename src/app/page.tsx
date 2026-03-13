import Link from "next/link";
import { UrlCheckForm } from "@/components/url-check-form";
import { FaqAccordion } from "@/components/faq-accordion";
import { RecentChecks } from "@/components/recent-checks";
import { CHECK_INDICATORS, GENERATOR_TYPES } from "@/lib/check-indicators";

const faqData = [
  {
    q: "GEO対策とは何ですか?",
    a: "GEO（Generative Engine Optimization）は、ChatGPT、Perplexity、Gemini等のAI検索エンジンに自サイトの情報を正しく参照・引用してもらうための最適化手法です。従来のSEO（検索エンジン最適化）のAI版と言えます。",
  },
  {
    q: "なぜGEO対策が必要なのですか?",
    a: "ChatGPT、Perplexity、Geminiなど、AI検索エンジン経由でWebサイトを探すユーザーが増えています。しかし多くのWebサイトがAI検索への対応を行っていません。GEO対策をしないと、AI検索結果に表示されず、トラフィック機会を逃すことになります。",
  },
  {
    q: "チェックは無料ですか?",
    a: "はい、完全無料でご利用いただけます。アカウント登録も不要です。URLを入力するだけで7つの指標でサイトを分析します。",
  },
  {
    q: "llms.txtとは何ですか?",
    a: "llms.txtは、AIエージェントやLLM（大規模言語モデル）に対してサイトの概要・構造・API情報を伝えるためのテキストファイルです。robots.txtのAI版と考えると分かりやすいです。",
  },
  {
    q: "GEOスコアはどう計算されますか?",
    a: "AIクローラーアクセス（15点）、llms.txt（15点）、構造化データ（20点）、メタタグ（15点）、コンテンツ構造（15点）、SSR（10点）、サイトマップ（10点）の7指標を重み付けスコアで合算し、A〜Fのグレードで評価します。",
  },
  {
    q: "SEO対策とGEO対策の違いは?",
    a: "SEOはGoogleなどの従来の検索エンジン向けの最適化、GEOはChatGPTやPerplexityなどのAI検索エンジン向けの最適化です。SEOの基本（構造化データ、メタタグ等）はGEOにも有効ですが、GEOにはllms.txtやAIクローラー許可など固有の施策が必要です。",
  },
  {
    q: "どのAI検索エンジンに対応していますか?",
    a: "ChatGPT（GPTBot）、Perplexity（PerplexityBot）、Claude（ClaudeBot）、Gemini（Google-Extended）、Microsoft Copilotなど、主要なAI検索エンジンのクローラー対応状況をチェックします。",
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
  datePublished: "2026-03-06",
  dateModified: "2026-03-14",
  // NOTE: aggregateRating は実データが無いため設置禁止（Google ガイドライン違反）
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

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "GEO対策の始め方 - AI検索対応度をチェックする方法",
  description:
    "URLを入力するだけでWebサイトのAI検索対応度をチェックし、改善コードを自動生成する3ステップ。",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "URLを入力",
      text: "チェックしたいWebサイトのURLを入力。登録不要で即座に分析開始。",
      url: "https://ai-check.ezoai.jp",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "スコアを確認",
      text: "7つの指標でAI検索対応度をスコア化。問題点と改善ポイントを表示。",
      url: "https://ai-check.ezoai.jp/check",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "コードを生成",
      text: "llms.txt, robots.txt, JSON-LD等の修正コードをワンクリックで自動生成・ダウンロード。",
      url: "https://ai-check.ezoai.jp/generate/llms-txt",
    },
  ],
  totalTime: "PT30S",
  tool: {
    "@type": "HowToTool",
    name: "AI Check - GEO対策ツール",
  },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      {/* Hero */}
      <section className="py-16 text-center">
        <p className="mb-4 text-sm font-medium tracking-wide text-primary/80">
          AI検索時代の新常識 -- あなたのサイトは対応済みですか?
        </p>
        <p className="mb-4 inline-block rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm font-semibold tracking-wide text-red-400">
          Google AI Mode 日本上陸 -- 従来SEOだけでは不十分な時代に
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
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-white/40">
          <span>無料 / 登録不要 / 30秒で結果表示</span>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { stat: "7項目", label: "GEOスコア チェック指標" },
            { stat: "5ツール", label: "無料生成ツール" },
            { stat: "30秒", label: "チェック所要時間" },
            { stat: "無料", label: "登録不要で即利用" },
          ].map((item) => (
            <div key={item.stat} className="text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl">{item.stat}</p>
              <p className="mt-1 text-sm text-white/40">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Checks */}
      <RecentChecks />

      {/* Supported AI Engines */}
      <section className="py-8">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-6 py-4">
          <span className="text-sm text-white/40">対応AI検索:</span>
          {["ChatGPT", "Perplexity", "Gemini", "Claude", "Copilot"].map(
            (engine) => (
              <span key={engine} className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs text-white/60">
                {engine}
              </span>
            )
          )}
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
            <p className="text-center text-sm text-white/40">
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
          ].map((item, i) => (
            <div key={item.step} className="relative text-center">
              {i < 2 && (
                <div className="absolute right-0 top-6 hidden h-px w-8 translate-x-full bg-white/10 sm:block" />
              )}
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
          AI検索対応で新しいトラフィック獲得チャネルを開拓
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { role: "ECサイト運営者", pain: "ChatGPTに商品を聞いたとき、競合だけが表示されていたら?", href: "/for/ec" },
            { role: "SaaSプロダクト", pain: "Perplexityで「おすすめツール」を聞かれたとき、あなたのサービスは候補に入る?", href: "/for/saas" },
            { role: "メディア・ブログ", pain: "AI検索が記事を引用してくれない = PV機会の損失", href: "/for/media" },
            { role: "士業・専門家", pain: "「おすすめの税理士」とAIに聞かれたとき、あなたの事務所は出てくる?", href: "/for/professional" },
          ].map((item) => (
            <Link
              key={item.role}
              href={item.href}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-6 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08]"
            >
              <h3 className="mb-2 font-semibold text-primary">{item.role}</h3>
              <p className="text-sm leading-relaxed text-white/50">
                {item.pain}
              </p>
              <p className="mt-3 text-sm text-primary/60">業界別ガイドを見る →</p>
            </Link>
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
        <FaqAccordion items={faqData} />
      </section>

      {/* Before / After */}
      <section className="py-16">
        <h2 className="mb-2 text-center text-2xl font-bold text-white">
          GEO対策 Before / After
        </h2>
        <p className="mb-10 text-center text-white/50">
          AI検索であなたのサイトがどう扱われるかが変わる
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6">
            <p className="mb-3 text-sm font-semibold text-red-400">GEO対策なし</p>
            <ul className="space-y-2 text-sm text-white/50">
              <li>AI検索結果に表示されない</li>
              <li>競合サイトだけが引用される</li>
              <li>AIクローラーにブロックされている可能性</li>
              <li>構造化データなしで情報が正確に伝わらない</li>
            </ul>
          </div>
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-6">
            <p className="mb-3 text-sm font-semibold text-green-400">GEO対策あり</p>
            <ul className="space-y-2 text-sm text-white/50">
              <li>ChatGPT・Perplexityに引用される可能性が向上</li>
              <li>AI経由の新規トラフィック獲得の機会が生まれる</li>
              <li>llms.txtでAIに正確な情報を提供</li>
              <li>JSON-LDでリッチな検索表示を実現</li>
            </ul>
          </div>
        </div>
      </section>

      {/* AI Check Features */}
      <section className="py-16">
        <h2 className="mb-2 text-center text-2xl font-bold text-white">
          AI Checkでできること
        </h2>
        <p className="mb-10 text-center text-white/50">
          GEO対策に必要な機能をすべて無料で提供
        </p>
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          {[
            { feature: "7指標GEOスコア算出", desc: "AIクローラー、llms.txt、構造化データ等の7項目を自動チェック" },
            { feature: "llms.txt / robots.txt 生成", desc: "AI向けサイト説明ファイルをフォーム入力で即生成" },
            { feature: "JSON-LD 構造化データ生成", desc: "12スキーマタイプ対応。リッチリザルト獲得を支援" },
            { feature: "agent.json (A2A) 生成", desc: "Google A2A Protocol準拠のAgent Card を自動生成" },
            { feature: "複数サイト比較", desc: "最大5サイトのGEOスコアをレーダーチャートで比較" },
            { feature: "完全無料・登録不要", desc: "全機能を制限なく利用可能。アカウント作成も不要" },
          ].map((item) => (
            <div
              key={item.feature}
              className="rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-white/20"
            >
              <h3 className="mb-1 font-semibold text-white">{item.feature}</h3>
              <p className="text-sm text-white/50">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 text-center">
        <h2 className="mb-4 text-2xl font-bold text-white">
          今すぐGEOスコアをチェック
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-white/50">
          URLを入力するだけで、AI検索対応の現状と改善ポイントが分かります。
          無料・登録不要で、修正コードまで自動生成。
        </p>
        <div className="mx-auto max-w-xl">
          <UrlCheckForm size="lg" />
        </div>
        <p className="mt-4 text-sm text-white/40">
          無料・登録不要 / 30秒でGEOスコアを表示
        </p>
      </section>
    </div>
  );
}
