"use client";

import { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { UrlCheckForm } from "@/components/url-check-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CheckReport } from "@/lib/check-indicators";
import { createZip } from "@/lib/zip";

type HistoryEntry = {
  url: string;
  totalScore: number;
  maxScore: number;
  grade: string;
  checkedAt: string;
  previousScore?: number;
};

const HISTORY_KEY = "aicheck-history";
const MAX_HISTORY = 20;

function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function getPreviousScore(url: string): number | undefined {
  const history = getHistory();
  const prev = history.find((h) => h.url === url);
  return prev ? Math.round((prev.totalScore / prev.maxScore) * 100) : undefined;
}

function saveToHistory(report: CheckReport) {
  const history = getHistory();
  const previous = history.find((h) => h.url === report.url);
  const entry: HistoryEntry = {
    url: report.url,
    totalScore: report.totalScore,
    maxScore: report.maxScore,
    grade: report.grade,
    checkedAt: report.checkedAt,
    previousScore: previous ? Math.round((previous.totalScore / previous.maxScore) * 100) : undefined,
  };
  const filtered = history.filter((h) => h.url !== entry.url);
  filtered.unshift(entry);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, MAX_HISTORY)));
  } catch {
    // Ignore QuotaExceededError
  }
}

function ScoreCircle({ score, maxScore, grade }: { score: number; maxScore: number; grade: string }) {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const gradeColors: Record<string, string> = {
    A: "text-green-400",
    B: "text-blue-400",
    C: "text-yellow-400",
    D: "text-orange-400",
    F: "text-red-400",
  };
  const strokeColors: Record<string, string> = {
    A: "#4ade80",
    B: "#60a5fa",
    C: "#facc15",
    D: "#fb923c",
    F: "#f87171",
  };

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-36 w-36 items-center justify-center">
        <svg className="absolute -rotate-90" width="144" height="144" viewBox="0 0 144 144" role="img" aria-label={`スコア: ${grade}ランク ${pct}/100`}>
          <circle cx="72" cy="72" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
          <circle
            cx="72" cy="72" r={radius} fill="none"
            stroke={strokeColors[grade] ?? "#fff"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="text-center">
          <span className={`text-4xl font-bold ${gradeColors[grade] ?? "text-white"}`}>{grade}</span>
          <div className="text-sm text-white/50">{pct}/100</div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "pass" | "warn" | "fail" }) {
  const variants: Record<string, { label: string; cls: string }> = {
    pass: { label: "OK", cls: "bg-green-500/20 text-green-400 border-green-500/30" },
    warn: { label: "警告", cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    fail: { label: "要対応", cls: "bg-red-500/20 text-red-400 border-red-500/30" },
  };
  const v = variants[status];
  return <Badge className={`${v.cls} border`}>{v.label}</Badge>;
}

function generateReportText(report: CheckReport): string {
  const pct = Math.round((report.totalScore / report.maxScore) * 100);
  const htmlSizeText = report.htmlSizeKB != null ? ` | HTML: ${report.htmlSizeKB}KB` : "";
  const httpsText = report.isHttps !== undefined ? ` | ${report.isHttps ? "HTTPS" : "HTTP"}` : "";
  const linkText = report.internalLinkCount != null ? ` | 内部リンク: ${report.internalLinkCount}件 / 外部リンク: ${report.externalLinkCount ?? 0}件` : "";
  const lines = [
    `AI Check - GEOスコアレポート`,
    `================================`,
    `URL: ${report.url}`,
    `スコア: ${pct}/100 (グレード: ${report.grade})`,
    `チェック日時: ${new Date(report.checkedAt).toLocaleString("ja-JP")}${htmlSizeText}${httpsText}${linkText}`,
    ``,
    `--- 詳細結果 ---`,
  ];

  for (const r of report.results) {
    const icon = r.status === "pass" ? "[OK]" : r.status === "warn" ? "[!]" : "[X]";
    lines.push(`${icon} ${r.message} (${r.score}/${r.maxScore})`);
    if (r.details) lines.push(`    ${r.details}`);
  }

  if (report.accessibility) {
    const a = report.accessibility;
    lines.push("");
    lines.push("--- アクセシビリティ ---");
    lines.push(`画像: ${a.imgCount}枚（alt属性あり: ${a.imgWithAlt}枚）`);
    lines.push(`スキップナビゲーション: ${a.hasSkipNav ? "あり" : "なし"}`);
    lines.push(`ARIAランドマーク: ${a.ariaLandmarks}件`);
  }

  if (report.securityHeaders) {
    const s = report.securityHeaders;
    lines.push("");
    lines.push(`--- セキュリティヘッダー (${s.score}/5) ---`);
    lines.push(`HSTS: ${s.hasHsts ? "あり" : "なし"}`);
    lines.push(`CSP: ${s.hasCsp ? "あり" : "なし"}`);
    lines.push(`X-Frame-Options: ${s.hasXFrameOptions ? "あり" : "なし"}`);
    lines.push(`X-Content-Type-Options: ${s.hasXContentTypeOptions ? "あり" : "なし"}`);
    lines.push(`Referrer-Policy: ${s.hasReferrerPolicy ? "あり" : "なし"}`);
  }

  if (report.performanceHints) {
    const p = report.performanceHints;
    lines.push("");
    lines.push("--- パフォーマンスヒント ---");
    if (p.preconnectCount > 0) lines.push(`preconnect: ${p.preconnectCount}件`);
    if (p.prefetchCount > 0) lines.push(`prefetch/preload: ${p.prefetchCount}件`);
    lines.push(`画像の遅延読み込み: ${p.lazyImageCount}/${p.totalImageCount}枚`);
    lines.push(`スクリプト: ${p.totalScriptCount}件（defer: ${p.deferScriptCount}, async: ${p.asyncScriptCount}）`);
  }

  if (report.contentLanguage || (report.hreflangTags && report.hreflangTags.length > 0)) {
    lines.push("");
    lines.push("--- 多言語対応 ---");
    if (report.contentLanguage) lines.push(`Content-Language: ${report.contentLanguage}`);
    if (report.hreflangTags && report.hreflangTags.length > 0) lines.push(`hreflang: ${report.hreflangTags.join(", ")}`);
  }

  if (report.detectedTech && report.detectedTech.length > 0) {
    lines.push("");
    lines.push("--- 検出テクノロジー ---");
    lines.push(report.detectedTech.join(", "));
  }

  if (report.coreWebVitals) {
    const c = report.coreWebVitals;
    lines.push("");
    lines.push("--- Core Web Vitals ヒント ---");
    lines.push(`レンダーブロッキングリソース: ${c.renderBlockingCount}件`);
    if (c.lcpCandidate) lines.push(`LCP候補: ${c.lcpCandidate}`);
    lines.push(`fetchpriority=high: ${c.hasFetchPriority ? "設定済み" : "未設定"}`);
    lines.push(`インラインCSS: ${c.inlineCssSize < 1024 ? `${c.inlineCssSize}B` : `${Math.round(c.inlineCssSize / 1024)}KB`}`);
    if (c.clsRiskFactors.length > 0) {
      lines.push(`CLSリスク要因: ${c.clsRiskFactors.join("、")}`);
    }
  }

  if (report.ogImageAccessible !== undefined) {
    lines.push("");
    lines.push(`--- OG画像 ---`);
    lines.push(`アクセス可否: ${report.ogImageAccessible ? "OK" : "アクセス不可（URLを確認してください）"}`);
  }

  if (report.pwaManifest?.exists) {
    lines.push("");
    lines.push("--- PWA対応 ---");
    const items = [
      report.pwaManifest.hasName ? "名前: 設定済み" : "名前: 未設定",
      report.pwaManifest.hasIcons ? "アイコン: 設定済み" : "アイコン: 未設定",
      report.pwaManifest.hasStartUrl ? "start_url: 設定済み" : "start_url: 未設定",
      report.pwaManifest.hasDisplay ? "display: 設定済み" : "display: 未設定",
      report.pwaManifest.hasThemeColor ? "テーマカラー: 設定済み" : "テーマカラー: 未設定",
    ];
    lines.push(items.join("、"));
  }

  if (report.socialMeta) {
    const parts: string[] = [];
    if (report.socialMeta.ogSiteName) parts.push(`og:site_name: ${report.socialMeta.ogSiteName}`);
    if (report.socialMeta.twitterSite) parts.push(`twitter:site: ${report.socialMeta.twitterSite}`);
    if (report.socialMeta.fbAppId) parts.push(`fb:app_id: ${report.socialMeta.fbAppId}`);
    if (parts.length > 0) {
      lines.push("");
      lines.push("--- ソーシャルメタ ---");
      parts.forEach((p) => lines.push(p));
    }
  }

  const failItems = report.results.filter((r) => r.status === "fail");
  const warnItems = report.results.filter((r) => r.status === "warn");

  if (failItems.length > 0 || warnItems.length > 0) {
    lines.push("");
    lines.push("--- 改善アクション ---");
    for (const item of [...failItems, ...warnItems]) {
      lines.push(`- ${item.message}`);
    }
  }

  lines.push("");
  lines.push("Generated by AI Check (https://ai-check.ezoai.jp)");

  return lines.join("\n");
}

function PriorityActions({ report }: { report: CheckReport }) {
  const actionItems = report.results
    .filter((r) => r.status === "fail" || r.status === "warn")
    .sort((a, b) => (b.maxScore - b.score) - (a.maxScore - a.score));

  if (actionItems.length === 0) {
    return (
      <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-6 text-center">
        <p className="text-lg font-semibold text-green-400">全項目クリア</p>
        <p className="mt-1 text-sm text-white/50">
          あなたのサイトはAI検索に十分対応しています。
        </p>
      </div>
    );
  }

  const generatorMap: Record<string, { path: string; name: string }> = {
    "robots-txt": { path: "/generate/robots-txt", name: "robots.txt生成ツール" },
    "llms-txt": { path: "/generate/llms-txt", name: "llms.txt生成ツール" },
    "structured-data": { path: "/generate/json-ld", name: "JSON-LD生成ツール" },
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">改善アクション</h2>
      <p className="text-sm text-white/50">
        影響度の高い順に改善することをおすすめします。
      </p>
      <div className="space-y-3">
        {actionItems.map((item, i) => {
          const potential = item.maxScore - item.score;
          const gen = generatorMap[item.id];
          return (
            <div
              key={item.id}
              className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                item.status === "fail" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
              }`}>
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{item.message}</p>
                <p className="mt-0.5 text-xs text-white/40">+{potential}pt 改善可能</p>
                {gen && (
                  <Link
                    href={gen.path}
                    className="mt-2 inline-block cursor-pointer text-xs text-primary/80 transition-all duration-200 hover:text-primary"
                  >
                    {gen.name}で修正 →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const emptyHistory: HistoryEntry[] = [];

function subscribeStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function CheckHistory({ currentUrl }: { currentUrl: string }) {
  const allHistory = useSyncExternalStore(subscribeStorage, getHistory, () => emptyHistory);

  const history = useMemo(
    () => allHistory.filter((h) => h.url !== currentUrl),
    [allHistory, currentUrl]
  );

  if (history.length === 0) return null;

  const gradeColors: Record<string, string> = {
    A: "text-green-400",
    B: "text-blue-400",
    C: "text-yellow-400",
    D: "text-orange-400",
    F: "text-red-400",
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">チェック履歴</h2>
      <div className="space-y-2">
        {history.slice(0, 5).map((entry) => (
          <Link
            key={`${entry.url}-${entry.checkedAt}`}
            href={`/check?url=${encodeURIComponent(entry.url)}`}
            className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:border-white/20"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white/70">{entry.url}</p>
              <p className="text-xs text-white/30">
                {new Date(entry.checkedAt).toLocaleDateString("ja-JP")}
              </p>
            </div>
            <div className="ml-4 text-right">
              <span className={`text-lg font-bold ${gradeColors[entry.grade] ?? "text-white"}`}>
                {entry.grade}
              </span>
              <p className="text-xs text-white/30">
                {entry.maxScore > 0 ? Math.round((entry.totalScore / entry.maxScore) * 100) : 0}/100
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function QuickFixGuide({ report }: { report: CheckReport }) {
  const pct = Math.round((report.totalScore / report.maxScore) * 100);
  const failItems = report.results.filter((r) => r.status === "fail");
  const warnItems = report.results.filter((r) => r.status === "warn");

  if (failItems.length === 0 && warnItems.length === 0) return null;

  // Generate personalized steps based on what's failing
  const steps: { time: string; action: string; link: string; linkLabel: string }[] = [];

  const hasRobotsFail = report.results.find((r) => r.id === "robots-txt" && r.status !== "pass");
  const hasLlmsFail = report.results.find((r) => r.id === "llms-txt" && r.status !== "pass");
  const hasStructuredFail = report.results.find((r) => r.id === "structured-data" && r.status !== "pass");
  const hasMetaFail = report.results.find((r) => r.id === "meta-tags" && r.status !== "pass");
  const hasSitemapFail = report.results.find((r) => r.id === "sitemap" && r.status !== "pass");

  if (hasRobotsFail) {
    steps.push({
      time: "1分",
      action: "robots.txtでAIクローラーを許可する",
      link: "/generate/robots-txt",
      linkLabel: "robots.txt生成ツール",
    });
  }
  if (hasLlmsFail) {
    steps.push({
      time: "3分",
      action: "llms.txtを作成してサイト情報をAIに伝える",
      link: "/generate/llms-txt",
      linkLabel: "llms.txt生成ツール",
    });
  }
  if (hasStructuredFail) {
    steps.push({
      time: "5分",
      action: "JSON-LD構造化データを設置する",
      link: "/generate/json-ld",
      linkLabel: "JSON-LD生成ツール",
    });
  }
  if (hasMetaFail) {
    steps.push({
      time: "5分",
      action: "title, description, OGPタグを設定する",
      link: "/guides/geo",
      linkLabel: "GEO対策ガイド",
    });
  }
  if (hasSitemapFail) {
    steps.push({
      time: "2分",
      action: "sitemap.xmlを作成・更新する",
      link: "/guides/geo",
      linkLabel: "GEO対策ガイド",
    });
  }

  if (steps.length === 0) return null;

  const totalMinutes = steps.reduce((sum, s) => sum + parseInt(s.time), 0);
  const potentialScore = report.results
    .filter((r) => r.status !== "pass")
    .reduce((sum, r) => sum + (r.maxScore - r.score), 0);

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
      <h2 className="mb-1 text-xl font-bold text-white">クイック改善ガイド</h2>
      <p className="mb-4 text-sm text-white/50">
        約{totalMinutes}分の作業で最大+{potentialScore}ptの改善が見込めます
      </p>
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={step.action} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              {i + 1}
            </span>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-medium text-white">{step.action}</p>
                <span className="shrink-0 text-xs text-white/30">~{step.time}</span>
              </div>
              <Link
                href={step.link}
                className="mt-0.5 inline-block cursor-pointer text-xs text-primary/70 transition-all duration-200 hover:text-primary"
              >
                {step.linkLabel} →
              </Link>
            </div>
          </div>
        ))}
      </div>
      {pct < 60 && (
        <div className="mt-4 rounded border border-white/5 bg-black/20 px-4 py-3">
          <p className="text-xs leading-relaxed text-white/40">
            まずはステップ1から順に対応するのがおすすめです。上から3つを実施するだけでも、多くのサイトでCランク以上に改善できます。
          </p>
        </div>
      )}
    </div>
  );
}

const indicatorTips: Record<string, { tip: string; guide?: string }> = {
  "robots-txt": {
    tip: "robots.txtでGPTBot, ClaudeBot, PerplexityBot等を明示的にAllowに設定しましょう。",
    guide: "/generate/robots-txt",
  },
  "llms-txt": {
    tip: "サイト概要・主要ページ・API情報をまとめたllms.txtを設置しましょう。",
    guide: "/generate/llms-txt",
  },
  "structured-data": {
    tip: "業界に合ったJSON-LD構造化データを設置しましょう。Product, Article, FAQPage等が有効です。",
    guide: "/generate/json-ld",
  },
  "meta-tags": {
    tip: "title, meta description, OGPタグ、canonical URL、lang属性を全ページに設定しましょう。",
  },
  "content-structure": {
    tip: "h1, main, nav, article, section等のセマンティックHTMLタグで文書構造を明確にしましょう。",
  },
  "ssr": {
    tip: "サーバーサイドレンダリング（SSR/SSG）を使用し、HTMLにコンテンツを含めましょう。",
  },
  "sitemap": {
    tip: "全主要ページを含むsitemap.xmlを設置し、robots.txtからリンクしましょう。",
  },
};

function AllFixCodes({ report }: { report: CheckReport }) {
  const [open, setOpen] = useState(false);
  const codesWithNames = report.results
    .filter((r) => r.code)
    .map((r) => ({
      id: r.id,
      message: r.message,
      code: r.code!,
    }));

  if (codesWithNames.length === 0) return null;

  const handleCopyAll = () => {
    const allCode = codesWithNames
      .map((c) => `/* --- ${c.message} --- */\n${c.code}`)
      .join("\n\n");
    navigator.clipboard.writeText(allCode).catch(() => {});
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/5">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between px-6 py-4 text-left transition-all duration-200 hover:bg-white/[0.03]"
      >
        <h2 className="text-lg font-semibold text-white">
          改善コードまとめ（{codesWithNames.length}件）
        </h2>
        <span className="text-sm text-white/40">{open ? "閉じる" : "展開"}</span>
      </button>
      {open && (
        <div className="border-t border-white/10 px-6 py-4">
          <div className="mb-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer border-white/10 bg-white/5 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
              onClick={handleCopyAll}
            >
              全コードをコピー
            </Button>
          </div>
          <div className="space-y-4">
            {codesWithNames.map((c) => (
              <div key={c.id}>
                <p className="mb-1 text-sm font-medium text-white/70">{c.message}</p>
                <pre className="overflow-x-auto rounded-lg bg-black/50 p-4 text-xs text-white/70">
                  <code>{c.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CheckPageClient() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") ?? "";
  const [report, setReport] = useState<CheckReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [recheckKey, setRecheckKey] = useState(0);
  const [prevScore, setPrevScore] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (url) {
      setPrevScore(getPreviousScore(url));
    }
  }, [url]);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;

    const runCheck = async () => {
      try {
        const res = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
        } else {
          setReport(data);
          saveToHistory(data);
        }
      } catch {
        if (!cancelled) setError("チェック中にエラーが発生しました。");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    setReport(null);
    setError("");
    setLoading(true);
    runCheck();

    return () => { cancelled = true; };
  }, [url, recheckKey]);

  const handleRecheck = useCallback(() => {
    if (!url || loading) return;
    setRecheckKey((k) => k + 1);
  }, [url, loading]);

  const handleCopyReport = useCallback(() => {
    if (!report) return;
    navigator.clipboard.writeText(generateReportText(report)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [report]);

  const handleDownloadReport = useCallback(() => {
    if (!report) return;
    const text = generateReportText(report);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `ai-check-report-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(blobUrl);
  }, [report]);

  const handleDownloadZip = useCallback(() => {
    if (!report) return;
    const files: { name: string; content: string }[] = [];
    for (const r of report.results) {
      if (r.code) {
        const nameMap: Record<string, string> = {
          "robots-txt": "robots.txt",
          "llms-txt": "llms.txt",
          "structured-data": "schema.jsonld",
          "meta-tags": "meta-tags.html",
          "content-structure": "content-structure.html",
          "ssr": "ssr-guide.txt",
          "sitemap": "sitemap.xml",
        };
        files.push({ name: nameMap[r.id] ?? `${r.id}.txt`, content: r.code });
      }
    }
    files.push({ name: "report.txt", content: generateReportText(report) });
    if (files.length <= 1) return;
    const blob = createZip(files);
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    let hostname = "site";
    try { hostname = new URL(report.url).hostname; } catch { /* use default */ }
    a.download = `ai-check-${hostname}-${new Date().toISOString().split("T")[0]}.zip`;
    a.click();
    URL.revokeObjectURL(blobUrl);
  }, [report]);

  const handleShareX = useCallback(() => {
    if (!report) return;
    const pct = Math.round((report.totalScore / report.maxScore) * 100);
    const text = `AI検索対応度チェック結果: ${report.grade}ランク (${pct}/100)\n${report.url}\n\n#GEO対策 #AI検索`;
    const shareUrl = `https://ai-check.ezoai.jp/check?url=${encodeURIComponent(report.url)}`;
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }, [report]);

  const handleShareLINE = useCallback(() => {
    if (!report) return;
    const pct = Math.round((report.totalScore / report.maxScore) * 100);
    const shareUrl = `https://ai-check.ezoai.jp/check?url=${encodeURIComponent(report.url)}`;
    const text = `AI検索対応度チェック結果: ${report.grade}ランク (${pct}/100) ${shareUrl}`;
    window.open(
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }, [report]);

  const handleCopyShareUrl = useCallback(() => {
    if (!report) return;
    const shareUrl = `https://ai-check.ezoai.jp/check?url=${encodeURIComponent(report.url)}`;
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  }, [report]);

  return (
    <div className="py-16">
      <h1 className="mb-8 text-center text-3xl font-bold text-white">
        GEOスコアチェック
      </h1>

      <div className="mx-auto mb-12 max-w-xl">
        <UrlCheckForm size="sm" />
      </div>

      {loading && (
        <div className="py-16 text-center" role="status" aria-live="polite">
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />
          <div className="mb-2 text-lg text-white/70">チェック中...</div>
          <p className="text-sm text-white/40">{url} を分析しています</p>
          <div className="mx-auto mt-6 max-w-xs space-y-3">
            {["robots.txt", "llms.txt", "llms-full.txt", "HTML構造", "メタデータ", "サイトマップ", "agent.json"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-white/30">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/30" />
                {item} を確認中
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="mx-auto max-w-xl rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-400">{error}</p>
          <p className="mt-2 text-sm text-white/40">URLを確認して再度お試しください。</p>
        </div>
      )}

      {report && (
        <div className="space-y-8">
          {/* Site preview with OG image */}
          {(report.ogImage || report.siteTitle) && (
            <div className="mx-auto max-w-xl overflow-hidden rounded-lg border border-white/10 bg-white/5">
              {report.ogImage && (
                <div className="aspect-[1200/630] w-full overflow-hidden bg-black/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={report.ogImage}
                    alt={report.siteTitle || "Site preview"}
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
              <div className="flex items-center gap-3 px-4 py-3">
                {report.favicon && (
                  <div className="h-5 w-5 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={report.favicon}
                      alt="Favicon"
                      className="h-5 w-5 rounded"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
                <div className="min-w-0">
                  {report.siteTitle && (
                    <p className="truncate text-sm font-medium text-white/80">{report.siteTitle}</p>
                  )}
                  <p className="mt-0.5 truncate text-xs text-white/40">{report.url}</p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            {!report.ogImage && !report.siteTitle && (
              <p className="mb-4 text-sm text-white/50">{report.url}</p>
            )}
            <ScoreCircle
              score={report.totalScore}
              maxScore={report.maxScore}
              grade={report.grade}
            />
            {/* Score trend */}
            {prevScore !== undefined && (() => {
              const currentPct = Math.round((report.totalScore / report.maxScore) * 100);
              const diff = currentPct - prevScore;
              if (diff === 0) return <p className="mt-1 text-xs text-white/40">前回と同じスコアです</p>;
              return (
                <p className={`mt-1 text-xs ${diff > 0 ? "text-green-400" : "text-red-400"}`}>
                  前回比 {diff > 0 ? "+" : ""}{diff}pt {diff > 0 ? "改善" : "低下"}
                </p>
              );
            })()}
            <p className="mt-2 text-sm text-white/40">
              チェック日時: {new Date(report.checkedAt).toLocaleString("ja-JP")}
              {report.responseTimeMs != null && (
                <span className="ml-2">({(report.responseTimeMs / 1000).toFixed(1)}秒)</span>
              )}
              {report.htmlSizeKB != null && (
                <span className="ml-2">HTML: {report.htmlSizeKB}KB</span>
              )}
            </p>
            {/* Site info badges */}
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {report.isHttps !== undefined && (
                <span className={`rounded-full px-3 py-1 text-xs ${report.isHttps ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                  {report.isHttps ? "HTTPS" : "HTTP（非暗号化）"}
                </span>
              )}
              {report.internalLinkCount != null && (
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
                  内部リンク: {report.internalLinkCount}件
                </span>
              )}
              {report.externalLinkCount != null && (
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
                  外部リンク: {report.externalLinkCount}件
                </span>
              )}
              {report.contentLanguage && (
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                  言語: {report.contentLanguage}
                </span>
              )}
              {report.hreflangTags && report.hreflangTags.length > 0 && (
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                  hreflang: {report.hreflangTags.join(", ")}
                </span>
              )}
              {report.accessibility && report.accessibility.imgCount > 0 && (
                <span className={`rounded-full px-3 py-1 text-xs ${
                  report.accessibility.imgWithAlt === report.accessibility.imgCount
                    ? "bg-green-500/10 text-green-400"
                    : report.accessibility.imgWithAlt > 0
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-red-500/10 text-red-400"
                }`}>
                  画像alt: {report.accessibility.imgWithAlt}/{report.accessibility.imgCount}
                </span>
              )}
              {report.ogImageAccessible !== undefined && (
                <span className={`rounded-full px-3 py-1 text-xs ${report.ogImageAccessible ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                  OG画像: {report.ogImageAccessible ? "アクセス可" : "アクセス不可"}
                </span>
              )}
              {report.detectedTech && report.detectedTech.length > 0 && (
                <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-400">
                  {report.detectedTech.filter(t => !["Google Analytics", "Microsoft Clarity"].includes(t)).slice(0, 3).join(" / ") || report.detectedTech[0]}
                </span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer border-white/10 bg-white/5 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
                onClick={handleCopyReport}
              >
                {copied ? "コピーしました" : "レポートをコピー"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer border-white/10 bg-white/5 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
                onClick={handleDownloadReport}
              >
                テキストで保存
              </Button>
              {report.results.some((r) => r.code) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer border-primary/30 bg-primary/10 text-primary transition-all duration-200 hover:bg-primary/20"
                  onClick={handleDownloadZip}
                >
                  ZIPで一括保存
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer border-white/10 bg-white/5 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
                onClick={handleShareX}
              >
                Xでシェア
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer border-[#06C755]/30 bg-[#06C755]/10 text-[#06C755] transition-all duration-200 hover:bg-[#06C755]/20"
                onClick={handleShareLINE}
              >
                LINEで送る
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer border-white/10 bg-white/5 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
                onClick={handleCopyShareUrl}
              >
                {urlCopied ? "URLコピー済み" : "URLをコピー"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer border-primary/30 bg-primary/10 text-primary transition-all duration-200 hover:bg-primary/20"
                onClick={handleRecheck}
              >
                再チェック
              </Button>
            </div>
          </div>

          {/* Accessibility summary */}
          {report.accessibility && (report.accessibility.imgCount > 0 || report.accessibility.ariaLandmarks > 0) && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-3 text-lg font-semibold text-white">アクセシビリティ概要</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {report.accessibility.imgCount > 0 && (
                  <div className="rounded-lg bg-white/[0.03] p-3">
                    <p className="text-xs text-white/40">画像のalt属性</p>
                    <p className={`text-lg font-bold ${
                      report.accessibility.imgWithAlt === report.accessibility.imgCount
                        ? "text-green-400"
                        : report.accessibility.imgWithAlt > 0
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}>
                      {report.accessibility.imgWithAlt}/{report.accessibility.imgCount}
                    </p>
                    <p className="text-xs text-white/30">
                      {report.accessibility.imgWithAlt === report.accessibility.imgCount
                        ? "全画像にalt属性が設定済み"
                        : `${report.accessibility.imgCount - report.accessibility.imgWithAlt}枚にalt属性が未設定`}
                    </p>
                  </div>
                )}
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/40">スキップナビゲーション</p>
                  <p className={`text-lg font-bold ${report.accessibility.hasSkipNav ? "text-green-400" : "text-white/30"}`}>
                    {report.accessibility.hasSkipNav ? "あり" : "なし"}
                  </p>
                  <p className="text-xs text-white/30">
                    {report.accessibility.hasSkipNav
                      ? "キーボードユーザーがコンテンツに直接移動可能"
                      : "キーボードユーザー向けにスキップリンクの追加を推奨"}
                  </p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/40">ARIAランドマーク</p>
                  <p className={`text-lg font-bold ${report.accessibility.ariaLandmarks > 0 || report.accessibility.hasAriaLabels ? "text-green-400" : "text-white/30"}`}>
                    {report.accessibility.ariaLandmarks}件
                  </p>
                  <p className="text-xs text-white/30">
                    {report.accessibility.hasAriaLabels ? "aria-label使用あり" : "ARIA属性の活用を推奨"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Security headers */}
          {report.securityHeaders && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">セキュリティヘッダー</h2>
                <span className={`rounded-full px-3 py-1 text-xs ${
                  report.securityHeaders.score >= 4 ? "bg-green-500/10 text-green-400"
                    : report.securityHeaders.score >= 2 ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-red-500/10 text-red-400"
                }`}>
                  {report.securityHeaders.score}/5
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-5">
                {([
                  { label: "HSTS", ok: report.securityHeaders.hasHsts, desc: "通信の暗号化を強制" },
                  { label: "CSP", ok: report.securityHeaders.hasCsp, desc: "XSS攻撃の防止" },
                  { label: "X-Frame", ok: report.securityHeaders.hasXFrameOptions, desc: "クリックジャッキング防止" },
                  { label: "Nosniff", ok: report.securityHeaders.hasXContentTypeOptions, desc: "MIMEスニッフィング防止" },
                  { label: "Referrer", ok: report.securityHeaders.hasReferrerPolicy, desc: "リファラー情報の制御" },
                ] as const).map((h) => (
                  <div key={h.label} className="rounded-lg bg-white/[0.03] p-3 text-center">
                    <p className={`text-sm font-medium ${h.ok ? "text-green-400" : "text-white/30"}`}>
                      {h.label}
                    </p>
                    <p className="mt-1 text-xs text-white/30">{h.desc}</p>
                  </div>
                ))}
              </div>
              {report.securityHeaders.score < 3 && (
                <p className="mt-3 text-xs text-white/40">
                  セキュリティヘッダーの追加により、サイトの信頼性が向上し、AI検索エンジンからの評価にも好影響があります。
                </p>
              )}
            </div>
          )}

          {/* Performance hints */}
          {report.performanceHints && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-3 text-lg font-semibold text-white">パフォーマンスヒント</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/40">リソースヒント</p>
                  <p className={`text-lg font-bold ${
                    report.performanceHints.preconnectCount + report.performanceHints.prefetchCount > 0
                      ? "text-green-400" : "text-white/30"
                  }`}>
                    {report.performanceHints.preconnectCount + report.performanceHints.prefetchCount}件
                  </p>
                  <p className="text-xs text-white/30">
                    preconnect: {report.performanceHints.preconnectCount} / prefetch: {report.performanceHints.prefetchCount}
                  </p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/40">画像の遅延読み込み</p>
                  <p className={`text-lg font-bold ${
                    report.performanceHints.totalImageCount === 0
                      ? "text-white/30"
                      : report.performanceHints.lazyImageCount > 0
                      ? "text-green-400" : "text-yellow-400"
                  }`}>
                    {report.performanceHints.lazyImageCount}/{report.performanceHints.totalImageCount}
                  </p>
                  <p className="text-xs text-white/30">
                    {report.performanceHints.totalImageCount === 0
                      ? "画像なし"
                      : report.performanceHints.lazyImageCount > 0
                      ? "loading=lazy 設定済み"
                      : "lazy loading の追加を推奨"}
                  </p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/40">スクリプト最適化</p>
                  <p className={`text-lg font-bold ${
                    report.performanceHints.totalScriptCount === 0
                      ? "text-white/30"
                      : (report.performanceHints.deferScriptCount + report.performanceHints.asyncScriptCount) > 0
                      ? "text-green-400" : "text-yellow-400"
                  }`}>
                    {report.performanceHints.deferScriptCount + report.performanceHints.asyncScriptCount}/{report.performanceHints.totalScriptCount}
                  </p>
                  <p className="text-xs text-white/30">
                    defer: {report.performanceHints.deferScriptCount} / async: {report.performanceHints.asyncScriptCount}
                    {report.performanceHints.hasModuleScripts ? " / module使用" : ""}
                  </p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/40">font-display</p>
                  <p className={`text-lg font-bold ${report.performanceHints.hasFontDisplay ? "text-green-400" : "text-white/30"}`}>
                    {report.performanceHints.hasFontDisplay ? "検出" : "未検出"}
                  </p>
                  <p className="text-xs text-white/30">
                    {report.performanceHints.hasFontDisplay
                      ? "フォント読み込み最適化済み"
                      : "font-display: swap の使用を推奨"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Core Web Vitals hints */}
          {report.coreWebVitals && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-3 text-lg font-semibold text-white">Core Web Vitals ヒント</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/40">レンダーブロック</p>
                  <p className={`text-lg font-bold ${
                    report.coreWebVitals.renderBlockingCount === 0
                      ? "text-green-400"
                      : report.coreWebVitals.renderBlockingCount <= 3
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}>
                    {report.coreWebVitals.renderBlockingCount}件
                  </p>
                  <p className="text-xs text-white/30">
                    {report.coreWebVitals.renderBlockingCount === 0
                      ? "ブロッキングリソースなし"
                      : "CSS/JSがレンダリングをブロック"}
                  </p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/40">CLS リスク要因</p>
                  <p className={`text-lg font-bold ${
                    report.coreWebVitals.clsRiskFactors.length === 0
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}>
                    {report.coreWebVitals.clsRiskFactors.length}件
                  </p>
                  <p className="text-xs text-white/30">
                    {report.coreWebVitals.clsRiskFactors.length === 0
                      ? "レイアウトシフトのリスク低"
                      : "レイアウトシフトの可能性"}
                  </p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/40">LCP候補</p>
                  <p className="text-lg font-bold text-white/60">
                    {report.coreWebVitals.lcpCandidate ?? "不明"}
                  </p>
                  <p className="text-xs text-white/30">
                    {report.coreWebVitals.hasFetchPriority
                      ? "fetchpriority=high 設定済み"
                      : "fetchpriority=high の追加を推奨"}
                  </p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/40">インラインCSS</p>
                  <p className={`text-lg font-bold ${
                    report.coreWebVitals.inlineCssSize < 10000
                      ? "text-green-400"
                      : report.coreWebVitals.inlineCssSize < 50000
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}>
                    {report.coreWebVitals.inlineCssSize < 1024
                      ? `${report.coreWebVitals.inlineCssSize}B`
                      : `${Math.round(report.coreWebVitals.inlineCssSize / 1024)}KB`}
                  </p>
                  <p className="text-xs text-white/30">
                    {report.coreWebVitals.inlineCssSize < 10000
                      ? "適切なサイズ"
                      : "外部CSSへの分離を検討"}
                  </p>
                </div>
              </div>
              {report.coreWebVitals.clsRiskFactors.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-medium text-yellow-400/80">CLS リスク詳細:</p>
                  {report.coreWebVitals.clsRiskFactors.map((factor, i) => (
                    <p key={i} className="text-xs text-white/40">- {factor}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Detected technologies */}
          {report.detectedTech && report.detectedTech.length > 0 && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-3 text-lg font-semibold text-white">検出テクノロジー</h2>
              <div className="flex flex-wrap gap-2">
                {report.detectedTech.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-sm text-purple-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-white/40">
                HTMLソースとレスポンスヘッダーから検出されたフレームワーク・CMS・ツールです。
              </p>
            </div>
          )}

          {/* PWA Manifest */}
          {report.pwaManifest?.exists && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-3 text-lg font-semibold text-white">PWA対応状況</h2>
              <div className="grid gap-2 sm:grid-cols-5">
                {([
                  { label: "アプリ名", ok: report.pwaManifest.hasName },
                  { label: "アイコン", ok: report.pwaManifest.hasIcons },
                  { label: "start_url", ok: report.pwaManifest.hasStartUrl },
                  { label: "display", ok: report.pwaManifest.hasDisplay },
                  { label: "テーマカラー", ok: report.pwaManifest.hasThemeColor },
                ] as const).map((item) => (
                  <div key={item.label} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                    <span className={item.ok ? "text-green-400" : "text-white/30"}>
                      {item.ok ? "+" : "-"}
                    </span>
                    <span className="text-sm text-white/60">{item.label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-white/40">
                Web App Manifest（manifest.json）のプロパティ設定状況です。
              </p>
            </div>
          )}

          {/* Social Meta */}
          {report.socialMeta && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-3 text-lg font-semibold text-white">ソーシャルメタ情報</h2>
              <div className="space-y-2">
                {report.socialMeta.ogSiteName && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white/40">og:site_name:</span>
                    <span className="text-white/70">{report.socialMeta.ogSiteName}</span>
                  </div>
                )}
                {report.socialMeta.twitterSite && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white/40">twitter:site:</span>
                    <span className="text-white/70">{report.socialMeta.twitterSite}</span>
                  </div>
                )}
                {report.socialMeta.twitterCreator && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white/40">twitter:creator:</span>
                    <span className="text-white/70">{report.socialMeta.twitterCreator}</span>
                  </div>
                )}
                {report.socialMeta.fbAppId && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white/40">fb:app_id:</span>
                    <span className="text-white/70">{report.socialMeta.fbAppId}</span>
                  </div>
                )}
              </div>
              <p className="mt-3 text-xs text-white/40">
                SNSシェア時のブランド認証・帰属に使用されるメタタグです。
              </p>
            </div>
          )}

          {/* Grade explanation */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="mb-3 text-lg font-semibold text-white">スコアの見方</h2>
            <div className="grid gap-2 sm:grid-cols-5">
              {([
                { grade: "A", range: "90-100", desc: "AI検索に十分対応済み", color: "text-green-400", bg: "bg-green-500/10" },
                { grade: "B", range: "75-89", desc: "概ね対応、微調整で完璧に", color: "text-blue-400", bg: "bg-blue-500/10" },
                { grade: "C", range: "60-74", desc: "基本はあるが改善余地あり", color: "text-yellow-400", bg: "bg-yellow-500/10" },
                { grade: "D", range: "40-59", desc: "多くの項目が未対応", color: "text-orange-400", bg: "bg-orange-500/10" },
                { grade: "F", range: "0-39", desc: "AI検索にほぼ未対応", color: "text-red-400", bg: "bg-red-500/10" },
              ] as const).map((g) => (
                <div
                  key={g.grade}
                  className={`rounded-lg ${g.bg} px-3 py-2 text-center ${report.grade === g.grade ? "ring-1 ring-white/20" : ""}`}
                >
                  <span className={`text-lg font-bold ${g.color}`}>{g.grade}</span>
                  <p className="text-xs text-white/40">{g.range}pt</p>
                  <p className="mt-1 text-xs text-white/50">{g.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <QuickFixGuide report={report} />

          <CheckHistory currentUrl={report.url} />

          <PriorityActions report={report} />

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">詳細結果</h2>
            {report.results.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-white/10 bg-white/5 p-6"
              >
                <div className="mb-2 flex items-center justify-between">
                  <Link
                    href={`/check/${r.id}`}
                    className="cursor-pointer font-semibold text-white transition-all duration-200 hover:text-primary"
                  >
                    {r.message}
                  </Link>
                  <StatusBadge status={r.status} />
                </div>
                {r.details && (
                  <p className="mb-3 text-sm leading-relaxed text-white/50">
                    {r.details}
                  </p>
                )}
                {r.code && (
                  <pre className="overflow-x-auto rounded-lg bg-black/50 p-4 text-xs text-white/70">
                    <code>{r.code}</code>
                  </pre>
                )}
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 rounded-full bg-white/10" role="progressbar" aria-valuenow={r.score} aria-valuemin={0} aria-valuemax={r.maxScore} aria-label={`${r.id}: ${r.score}/${r.maxScore}`}>
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${(r.score / r.maxScore) * 100}%`,
                        backgroundColor: r.status === "pass" ? "#4ade80" : r.status === "warn" ? "#facc15" : "#f87171",
                      }}
                    />
                  </div>
                  <span className="text-xs text-white/30">{r.score}/{r.maxScore}</span>
                </div>
                {r.status !== "pass" && indicatorTips[r.id] && (
                  <div className="mt-3 rounded border border-primary/10 bg-primary/5 px-4 py-2.5">
                    <p className="text-xs leading-relaxed text-primary/80">
                      {indicatorTips[r.id].tip}
                    </p>
                    {indicatorTips[r.id].guide && (
                      <Link
                        href={indicatorTips[r.id].guide!}
                        className="mt-1 inline-block cursor-pointer text-xs text-primary/60 transition-all duration-200 hover:text-primary"
                      >
                        ツールで修正 →
                      </Link>
                    )}
                  </div>
                )}
                {r.id === "structured-data" && r.status !== "pass" && report.suggestedSchemas && report.suggestedSchemas.length > 0 && (
                  <div className="mt-2 rounded border border-white/5 bg-white/[0.02] px-4 py-2.5">
                    <p className="text-xs text-white/50">
                      おすすめスキーマ: {report.suggestedSchemas.map((s, i) => (
                        <span key={s}>
                          <Link
                            href={`/generate/json-ld?type=${s.toLowerCase()}`}
                            className="cursor-pointer text-primary/70 transition-all duration-200 hover:text-primary"
                          >
                            {s}
                          </Link>
                          {i < report.suggestedSchemas!.length - 1 ? ", " : ""}
                        </span>
                      ))}
                      （ページ内容から推定）
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* All fix codes section */}
          {report.results.some((r) => r.code) && (
            <AllFixCodes report={report} />
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-2 text-lg font-semibold text-white">GEOスコアバッジ</h2>
              <p className="mb-4 text-sm text-white/50">
                このスコアをREADMEやサイトに埋め込めます。
              </p>
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/badge?url=${encodeURIComponent(report.url)}&style=flat`}
                  alt="GEO Score Badge"
                  className="h-5"
                />
                <Link
                  href={`/generate/badge?url=${encodeURIComponent(report.url)}`}
                  className="cursor-pointer text-sm text-primary/70 transition-all duration-200 hover:text-primary"
                >
                  埋め込みコードを取得 →
                </Link>
              </div>
            </div>
            <Link
              href={`/check/compare?url1=${encodeURIComponent(report.url)}`}
              className="flex cursor-pointer flex-col justify-center rounded-lg border border-primary/20 bg-primary/5 p-6 transition-all duration-200 hover:border-primary/30 hover:bg-primary/10"
            >
              <h2 className="mb-2 text-lg font-semibold text-white">競合と比較</h2>
              <p className="text-sm text-white/50">
                このサイトと競合サイトのGEOスコアを並べて比較します。
              </p>
            </Link>
          </div>

          {/* Related guides based on grade */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">関連ガイド</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { href: "/guides/geo", title: "GEO対策ガイド", desc: "AI検索最適化の基本と実践" },
                { href: "/guides/checklist", title: "GEO対策チェックリスト", desc: "20項目のインタラクティブリスト" },
                { href: "/guides/geo-vs-seo", title: "GEO vs SEO比較", desc: "何が同じで何が違うのか" },
              ].map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <p className="text-sm font-medium text-white">{guide.title}</p>
                  <p className="mt-1 text-xs text-white/40">{guide.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {!url && !loading && (
        <div className="space-y-12">
          <div className="py-16 text-center text-white/40">
            <p className="text-lg">上のフォームにURLを入力してチェックを開始</p>
            <Link
              href="/check/compare"
              className="mt-4 inline-block cursor-pointer text-sm text-primary/70 transition-all duration-200 hover:text-primary"
            >
              複数サイトを比較する →
            </Link>
          </div>

          <div className="space-y-4">
            <h2 className="text-center text-lg font-semibold text-white/70">人気サイトで試してみる</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { url: "https://openai.com", label: "OpenAI" },
                { url: "https://stripe.com", label: "Stripe" },
                { url: "https://github.com", label: "GitHub" },
                { url: "https://vercel.com", label: "Vercel" },
                { url: "https://notion.so", label: "Notion" },
                { url: "https://shopify.com", label: "Shopify" },
              ].map((site) => (
                <Link
                  key={site.url}
                  href={`/check?url=${encodeURIComponent(site.url)}`}
                  className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <p className="text-sm font-medium text-white/70">{site.label}</p>
                  <p className="mt-0.5 text-xs text-white/30">{site.url}</p>
                </Link>
              ))}
            </div>
          </div>

          <CheckHistory currentUrl="" />
        </div>
      )}
    </div>
  );
}
