"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-black text-white antialiased">
        <div role="alert" className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-2 text-3xl font-bold text-white">
            予期しないエラーが発生しました
          </h1>
          <p className="mb-8 text-white/50">
            申し訳ございません。ページを再読み込みしてお試しください。
          </p>
          <button
            onClick={reset}
            className="cursor-pointer rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-white/20"
          >
            再試行
          </button>
        </div>
      </body>
    </html>
  );
}
