import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-white transition-all duration-200 hover:text-primary">
          AI Check
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/check"
            className="text-white/70 transition-all duration-200 hover:text-white cursor-pointer"
          >
            チェック
          </Link>
          <Link
            href="/generate/llms-txt"
            className="hidden text-white/70 transition-all duration-200 hover:text-white cursor-pointer sm:block"
          >
            生成ツール
          </Link>
          <Link
            href="/guides/geo"
            className="hidden text-white/70 transition-all duration-200 hover:text-white cursor-pointer sm:block"
          >
            GEO対策ガイド
          </Link>
          <Link
            href="/about"
            className="text-white/70 transition-all duration-200 hover:text-white cursor-pointer"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
