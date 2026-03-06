import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AI Check - AI検索対応度チェッカー & ジェネレーター",
    template: "%s | AI Check",
  },
  description:
    "URLを入力するだけでWebサイトのAI検索対応度をスコア化。llms.txt・robots.txt・JSON-LD構造化データを自動生成。GEO対策の第一歩を無料で。",
  keywords: [
    "GEO対策",
    "AI検索 対策",
    "llms.txt",
    "構造化データ",
    "JSON-LD",
    "AI検索最適化",
    "LLMO",
    "AEO",
    "SEO",
    "robots.txt",
    "agent.json",
  ],
  openGraph: {
    title: "AI Check - AI検索対応度チェッカー & ジェネレーター",
    description:
      "URLを入力するだけでWebサイトのAI検索対応度をスコア化。llms.txt・robots.txt・JSON-LD構造化データを自動生成。",
    url: "https://ai-check.ezoai.jp",
    siteName: "AI Check",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Check - AI検索対応度チェッカー & ジェネレーター",
    description:
      "URLを入力するだけでWebサイトのAI検索対応度をスコア化。GEO対策の第一歩を無料で。",
  },
  robots: {
    index: true,
    follow: true,
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
        <Header />
        <main className="mx-auto max-w-5xl px-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
