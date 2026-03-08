import Link from "next/link";

export function CtaBanner({
  title = "あなたのサイトのGEOスコアをチェック",
  description = "URLを入力するだけで、AI検索対応度を7つの指標で無料診断。改善コードも自動生成します。",
  href = "/check",
  label = "無料でチェックする",
}: {
  title?: string;
  description?: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 text-center sm:p-8">
      <h3 className="text-lg font-bold text-white sm:text-xl">{title}</h3>
      <p className="mt-2 text-sm text-white/50">{description}</p>
      <Link
        href={href}
        className="mt-4 inline-block cursor-pointer rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary/90"
      >
        {label}
      </Link>
    </div>
  );
}
