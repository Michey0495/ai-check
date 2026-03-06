"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="mb-2 text-3xl font-bold text-white">
        エラーが発生しました
      </h1>
      <p className="mb-8 text-white/50">
        予期しないエラーが発生しました。再度お試しください。
      </p>
      <button
        onClick={reset}
        className="cursor-pointer rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/80"
      >
        再試行
      </button>
    </div>
  );
}
