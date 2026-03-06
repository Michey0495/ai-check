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
    </div>
  );
}
