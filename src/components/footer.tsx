import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">チェック</h3>
            <ul className="space-y-2 text-sm text-white/50">
              <li>
                <Link href="/check" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  GEOスコアチェック
                </Link>
              </li>
              <li>
                <Link href="/check/compare" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  GEOスコア比較
                </Link>
              </li>
              <li>
                <Link href="/check/robots-txt" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  AIクローラーチェック
                </Link>
              </li>
              <li>
                <Link href="/check/llms-txt" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  llms.txtチェック
                </Link>
              </li>
              <li>
                <Link href="/check/structured-data" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  構造化データチェック
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">生成ツール</h3>
            <ul className="space-y-2 text-sm text-white/50">
              <li>
                <Link href="/generate/llms-txt" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  llms.txt 生成
                </Link>
              </li>
              <li>
                <Link href="/generate/robots-txt" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  robots.txt 生成
                </Link>
              </li>
              <li>
                <Link href="/generate/json-ld" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  JSON-LD 生成
                </Link>
              </li>
              <li>
                <Link href="/generate/agent-json" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  agent.json 生成
                </Link>
              </li>
              <li>
                <Link href="/generate/badge" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  GEOスコアバッジ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">ガイド</h3>
            <ul className="space-y-2 text-sm text-white/50">
              <li>
                <Link href="/guides/geo" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  GEO対策ガイド
                </Link>
              </li>
              <li>
                <Link href="/guides/geo-vs-seo" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  GEO vs SEO
                </Link>
              </li>
              <li>
                <Link href="/guides/llms-txt" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  llms.txt書き方ガイド
                </Link>
              </li>
              <li>
                <Link href="/guides/checklist" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  GEO対策チェックリスト
                </Link>
              </li>
              <li>
                <Link href="/guides/industry" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  業界別GEO対策
                </Link>
              </li>
              <li>
                <Link href="/guides/quick-start" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  5分で始めるGEO対策
                </Link>
              </li>
              <li>
                <Link href="/guides/glossary" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  用語集
                </Link>
              </li>
              <li>
                <Link href="/developers" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  API / 開発者向け
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  AI Checkについて
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">業界別GEO対策</h3>
            <ul className="space-y-2 text-sm text-white/50">
              <li>
                <Link href="/for/ec" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  ECサイト
                </Link>
              </li>
              <li>
                <Link href="/for/saas" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  SaaS
                </Link>
              </li>
              <li>
                <Link href="/for/media" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  メディア
                </Link>
              </li>
              <li>
                <Link href="/for/professional" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  士業
                </Link>
              </li>
              <li>
                <Link href="/for/local" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  ローカルビジネス
                </Link>
              </li>
              <li>
                <Link href="/for/education" className="transition-all duration-200 hover:text-white/70 focus:text-white/70 focus:outline-none cursor-pointer">
                  教育
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center gap-2 border-t border-white/10 pt-8 text-xs text-white/30">
          <div className="flex gap-4">
            <Link href="/privacy" className="transition-all duration-200 hover:text-white/50 cursor-pointer">
              プライバシーポリシー
            </Link>
            <Link href="/about" className="transition-all duration-200 hover:text-white/50 cursor-pointer">
              AI Checkについて
            </Link>
          </div>
          <p>&copy; 2026 AI Check - ezoai.jp</p>
        </div>
      </div>
    </footer>
  );
}
