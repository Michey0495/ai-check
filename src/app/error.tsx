"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AI Check] Page error:", error.message, error.digest ?? "");
  }, [error]);

  return (
    <div role="alert" className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="mb-2 text-3xl font-bold text-white">
        エラーが発生しました
      </h1>
      <p className="mb-4 text-white/50">
        予期しないエラーが発生しました。再度お試しください。
      </p>
      {error.digest && (
        <p className="mb-6 font-mono text-xs text-white/30">
          エラーID: {error.digest}
        </p>
      )}
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="cursor-pointer rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/80"
        >
          再試行
        </button>
        <Link
          href="/"
          className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-white/10"
        >
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}
