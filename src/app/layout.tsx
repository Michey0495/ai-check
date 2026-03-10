import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { GoogleAnalytics } from "@/components/google-analytics";
import { FeedbackWidget } from "@/components/feedback-widget";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    "AI Overview 対策",
    "Applebot",
    "AI検索 引用",
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
  alternates: {
    canonical: "https://ai-check.ezoai.jp",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-black text-white antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "AI Check",
              url: "https://ai-check.ezoai.jp",
              description:
                "AI検索対応度チェッカー & GEO対策ツール。URLを入力するだけでAI検索最適化を実現。",
              sameAs: ["https://github.com/Michey0495/web-url-a"],
            }),
          }}
        />
        <GoogleAnalytics />
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
      </body>
    </html>
  );
}
