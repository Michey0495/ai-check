import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="mb-2 text-6xl font-bold text-white">404</h1>
      <p className="mb-8 text-lg text-white/50">
        ページが見つかりませんでした
      </p>
      <Link
        href="/"
        className="cursor-pointer rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/80"
      >
        トップに戻る
      </Link>

      <div className="mt-12 grid w-full max-w-2xl gap-4 sm:grid-cols-3">
        <Link
          href="/check"
          className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 text-left transition-all duration-200 hover:border-white/20"
        >
          <h2 className="mb-1 text-sm font-semibold text-white">GEOスコアチェック</h2>
          <p className="text-sm text-white/40">URLを入力してAI検索対応度を診断</p>
        </Link>
        <Link
          href="/generate/llms-txt"
          className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 text-left transition-all duration-200 hover:border-white/20"
        >
          <h2 className="mb-1 text-sm font-semibold text-white">生成ツール</h2>
          <p className="text-sm text-white/40">llms.txt, robots.txt, JSON-LDを生成</p>
        </Link>
        <Link
          href="/guides/geo"
          className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 text-left transition-all duration-200 hover:border-white/20"
        >
          <h2 className="mb-1 text-sm font-semibold text-white">GEO対策ガイド</h2>
          <p className="text-sm text-white/40">AI検索最適化の基本を解説</p>
        </Link>
      </div>
    </div>
  );
}
