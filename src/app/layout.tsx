import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { GoogleAnalytics } from "@/components/google-analytics";
import { FeedbackWidget } from "@/components/feedback-widget";
import { ScrollToTop } from "@/components/scroll-to-top";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "AI Check - AI検索対応度チェッカー & GEO対策ツール | 無料",
    template: "%s | AI Check - GEO対策ツール",
  },
  description:
    "URLを入力するだけでWebサイトのAI検索（ChatGPT・Perplexity・Gemini・Google AI Mode）対応度を7指標でスコア化。llms.txt・robots.txt・JSON-LD構造化データ・agent.jsonを自動生成。無料・登録不要のGEO対策ツール。",
  keywords: [
    "GEO対策",
    "GEO対策 ツール",
    "AI検索 対策",
    "AI検索 最適化",
    "llms.txt",
    "llms.txt 作り方",
    "llms.txt 書き方",
    "構造化データ",
    "構造化データ 書き方",
    "JSON-LD",
    "JSON-LD 生成",
    "AI検索最適化",
    "LLMO",
    "AEO",
    "SEO",
    "Generative Engine Optimization",
    "robots.txt AIクローラー",
    "agent.json",
    "ChatGPT SEO",
    "Perplexity 対策",
    "AI検索 対応",
    "Gemini 対策",
    "Claude 対策",
    "AI クローラー",
    "GPTBot",
    "ClaudeBot",
    "PerplexityBot",
    "Google-Extended",
    "A2A Agent Card",
    "MCP Server",
    "GEO スコア",
    "AI検索 無料ツール",
    "Web制作 AI対策",
    "Google AI Mode",
    "Google AI Mode 対策",
    "AI Overview 対策",
    "AI検索 CTR",
    "GEO対策 無料",
    "GEO対策 チェッカー",
    "LLM最適化",
    "Applebot",
    "AI検索 引用",
    "GEO対策 やり方",
    "AI検索 流入",
    "Copilot 対策",
    "AI検索 トラフィック",
    "GEO 無料診断",
    "AI検索 引用されない",
    "llms.txt 自動生成",
    "AI検索 対策ツール 無料",
    "SearchGPT 対策",
    "AI検索 表示されない",
    "GEO対策 初心者",
    "AI検索 引用率",
    "GEO対策 2026",
    "AI Mode 対策",
    "AIに引用されるサイト",
    "リダイレクト チェック",
    "canonical URL チェック",
    "AI検索 リダイレクト",
    "GEOスコア リダイレクト分析",
    "GEO対策 始め方",
    "AI検索 スコア",
    "llms.txt ジェネレーター",
    "agent.json 作り方",
    "AI検索 無料診断",
    "Google AI Mode 日本",
    "GEO対策 MCP",
    "AI検索 MCP Server",
    "GEO チェッカー 無料",
    "AI検索 対応 チェック",
    "llms.txt 無料 生成ツール",
  ],
  openGraph: {
    title: "AI Check - AI検索対応度チェッカー & GEO対策ツール",
    description:
      "URLを入力するだけでAI検索対応度を7指標でスコア化。llms.txt・robots.txt・JSON-LD・agent.jsonを自動生成。無料・登録不要。Google AI Mode対策に。",
    url: "https://ai-check.ezoai.jp",
    siteName: "AI Check",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "https://ai-check.ezoai.jp/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AI Check - AI検索対応度チェッカー & GEO対策ツール",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Check - AI検索対応度チェッカー & GEO対策ツール",
    description:
      "URLを入力するだけでGEOスコアを算出し、llms.txt・JSON-LDを自動生成。無料・登録不要のGEO対策ツール。",
    images: ["https://ai-check.ezoai.jp/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: "https://ai-check.ezoai.jp",
    languages: {
      ja: "https://ai-check.ezoai.jp",
    },
  },
  metadataBase: new URL("https://ai-check.ezoai.jp"),
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-black text-white antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "AI Check",
                url: "https://ai-check.ezoai.jp",
                description:
                  "AI検索対応度チェッカー & GEO対策ツール。URLを入力するだけでAI検索最適化を実現。",
                areaServed: "JP",
                sameAs: ["https://github.com/Michey0495/web-url-a"],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "AI Check",
                url: "https://ai-check.ezoai.jp",
                description: "AI検索対応度チェッカー & GEO対策ツール",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: "https://ai-check.ezoai.jp/check?url={search_term_string}",
                  },
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        <GoogleAnalytics />
        <noscript>
          <div style={{ background: "#1a1a1a", color: "#fff", padding: "1rem", textAlign: "center" }}>
            AI Checkの全機能を利用するにはJavaScriptを有効にしてください。
          </div>
        </noscript>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-black"
        >
          メインコンテンツへスキップ
        </a>
        <Header />
        <main id="main-content" className="mx-auto max-w-5xl px-4">{children}</main>
        <Footer />
        <FeedbackWidget repoName="web-url-a" />
        <ScrollToTop />
      </body>
    </html>
  );
}
