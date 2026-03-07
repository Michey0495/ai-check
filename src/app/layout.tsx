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
    "URLを入力するだけでWebサイトのAI検索（ChatGPT・Perplexity・Gemini）対応度を7指標でスコア化。llms.txt・robots.txt・JSON-LD構造化データを自動生成。89%のサイトが未対応のGEO対策を無料で今すぐ。",
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
  ],
  openGraph: {
    title: "AI Check - AI検索対応度チェッカー & GEO対策ツール",
    description:
      "URLを入力するだけでAI検索対応度を7指標でスコア化。llms.txt・robots.txt・JSON-LDを自動生成。89%のサイトが未対応のGEO対策を無料で。",
    url: "https://ai-check.ezoai.jp",
    siteName: "AI Check",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Check - AI検索対応度チェッカー & GEO対策ツール",
    description:
      "89%のWebサイトがAI検索に未対応。URLを入力するだけでGEOスコアを算出し、llms.txt・JSON-LDを自動生成。無料。",
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
        <GoogleAnalytics />
        <Header />
        <main className="mx-auto max-w-5xl px-4">{children}</main>
        <Footer />
        <FeedbackWidget repoName="web-url-a" />
      </body>
    </html>
  );
}
