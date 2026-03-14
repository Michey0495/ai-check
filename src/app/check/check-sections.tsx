"use client";

import { useState, useMemo, useRef, useEffect, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CheckReport } from "@/lib/check-indicators";
import { GRADE_TEXT_COLORS, GRADE_HEX_COLORS } from "@/lib/grade-colors";
import { getHistory, type HistoryEntry } from "./check-utils";

const GRADE_COLORS = GRADE_TEXT_COLORS;
const STROKE_COLORS = GRADE_HEX_COLORS;

const INDICATOR_SHORT_NAMES = [
  "クローラー",
  "llms.txt",
  "構造化",
  "メタタグ",
  "構造",
  "SSR",
  "サイトマップ",
];

export function CollapsibleGroup({
  title,
  sectionCount,
  children,
  defaultOpen = false,
}: {
  title: string;
  sectionCount: number;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (sectionCount === 0) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02]">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between px-6 py-4 text-left transition-all duration-200 hover:bg-white/[0.03]"
      >
        <h2 className="text-lg font-semibold text-white">
          {title}
          <span className="ml-2 text-sm font-normal text-white/40">({sectionCount})</span>
        </h2>
        <span className={`text-sm text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-[9999px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-4 px-4 pb-4 pt-0 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ScoreCircle({ score, maxScore, grade }: { score: number; maxScore: number; grade: string }) {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

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
            stroke={STROKE_COLORS[grade] ?? "#fff"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="text-center">
          <span className={`text-4xl font-bold ${GRADE_COLORS[grade] ?? "text-white"}`}>{grade}</span>
          <div className="text-sm text-white/50">{pct}/100</div>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: "pass" | "warn" | "fail" }) {
  const variants: Record<string, { label: string; cls: string }> = {
    pass: { label: "OK", cls: "bg-green-500/20 text-green-400 border-green-500/30" },
    warn: { label: "警告", cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    fail: { label: "要対応", cls: "bg-red-500/20 text-red-400 border-red-500/30" },
  };
  const v = variants[status];
  return <Badge className={`${v.cls} border`}>{v.label}</Badge>;
}

export function PriorityActions({ report }: { report: CheckReport }) {
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

export function CheckHistory({ currentUrl }: { currentUrl: string }) {
  const allHistory = useSyncExternalStore(subscribeStorage, getHistory, () => emptyHistory);

  const history = useMemo(
    () => allHistory.filter((h) => h.url !== currentUrl),
    [allHistory, currentUrl]
  );

  if (history.length === 0) return null;


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
                {new Date(entry.checkedAt).toLocaleString("ja-JP")}
              </p>
            </div>
            <div className="ml-4 text-right">
              <span className={`text-lg font-bold ${GRADE_COLORS[entry.grade] ?? "text-white"}`}>
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

export function QuickFixGuide({ report }: { report: CheckReport }) {
  const pct = Math.round((report.totalScore / report.maxScore) * 100);
  const failItems = report.results.filter((r) => r.status === "fail");
  const warnItems = report.results.filter((r) => r.status === "warn");

  if (failItems.length === 0 && warnItems.length === 0) return null;

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

  const totalMinutes = steps.reduce((sum, s) => sum + parseInt(s.time, 10), 0);
  const potentialScore = report.results
    .filter((r) => r.status !== "pass")
    .reduce((sum, r) => sum + (r.maxScore - r.score), 0);

  return (
    <div id="sec-quick-fix" className="scroll-mt-16 rounded-lg border border-primary/20 bg-primary/5 p-6">
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
            まずはステップ1から順に対応するのがおすすめです。上位3項目を実施することでスコアの大幅な改善が期待できます。
          </p>
        </div>
      )}
    </div>
  );
}

type SectionDef = { id: string; label: string; exists: boolean };

export function SectionNav({ report }: { report: CheckReport }) {
  const [activeId, setActiveId] = useState("");
  const navRef = useRef<HTMLDivElement>(null);

  const sections = useMemo<SectionDef[]>(() => {
    const s: SectionDef[] = [
      { id: "sec-radar", label: "レーダーチャート", exists: true },
      { id: "sec-score-breakdown", label: "スコア内訳", exists: true },
      { id: "sec-grade-guide", label: "スコアの見方", exists: true },
      { id: "sec-quick-fix", label: "クイック改善", exists: report.results.some((r) => r.status !== "pass") },
      { id: "sec-simulator", label: "シミュレーター", exists: report.results.some((r) => r.status !== "pass") },
      { id: "sec-detail", label: "詳細結果", exists: true },
      { id: "sec-fix-codes", label: "改善コード", exists: report.results.some((r) => r.code) },
      { id: "sec-ai-crawlers", label: "AIクローラー", exists: !!(report.aiCrawlerStatus && report.aiCrawlerStatus.length > 0) },
      { id: "sec-accessibility", label: "アクセシビリティ", exists: !!(report.accessibility && (report.accessibility.imgCount > 0 || report.accessibility.ariaLandmarks > 0)) },
      { id: "sec-security", label: "セキュリティ", exists: !!report.securityHeaders },
      { id: "sec-ssl", label: "SSL/TLS", exists: !!report.sslCertificate },
      { id: "sec-performance", label: "パフォーマンス", exists: !!report.performanceHints },
      { id: "sec-cwv", label: "Core Web Vitals", exists: !!report.coreWebVitals },
      { id: "sec-image-opt", label: "画像最適化", exists: !!report.imageOptimization },
      { id: "sec-tech", label: "テクノロジー", exists: !!(report.detectedTech && report.detectedTech.length > 0) },
      { id: "sec-pwa", label: "PWA", exists: !!report.pwaManifest?.exists },
      { id: "sec-social-meta", label: "ソーシャルメタ", exists: !!report.socialMeta },
      { id: "sec-redirect", label: "リダイレクト", exists: !!(report.redirectChain || report.canonicalUrl) },
      { id: "sec-meta-refresh", label: "meta refresh", exists: !!report.metaRefresh },
      { id: "sec-content", label: "コンテンツ分析", exists: !!(report.contentMetrics && report.contentMetrics.wordCount > 0) },
      { id: "sec-feed", label: "フィード", exists: !!report.feedDetection },
      { id: "sec-favicon", label: "ファビコン", exists: !!report.faviconAnalysis },
      { id: "sec-dup-meta", label: "重複メタタグ", exists: !!(report.duplicateMetaTags && report.duplicateMetaTags.length > 0) },
      { id: "sec-og-preview", label: "シェアプレビュー", exists: !!(report.ogPreview || report.ogImage) },
      { id: "sec-heading-tree", label: "見出し構造", exists: !!(report.headingTree && report.headingTree.length > 0) },
      { id: "sec-ext-resources", label: "外部リソース", exists: !!report.externalResourceCount },
      { id: "sec-jsonld-blocks", label: "JSON-LD詳細", exists: !!(report.jsonLdBlocks && report.jsonLdBlocks.blockCount > 0) },
      { id: "sec-ai-content", label: "AIが見るコンテンツ", exists: !!(report.aiContentPreview && report.aiContentPreview.excerpt.length > 0) },
      { id: "sec-link-quality", label: "リンク品質", exists: !!report.linkQuality },
      { id: "sec-rich-results", label: "リッチリザルト", exists: !!(report.richResultsEligibility && report.richResultsEligibility.length > 0) },
    ];
    return s.filter((x) => x.exists);
  }, [report]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    if (!navRef.current || !activeId) return;
    const activeBtn = navRef.current.querySelector(`[data-section="${activeId}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeId]);

  if (sections.length < 3) return null;

  return (
    <nav aria-label="セクションナビゲーション" className="no-print sticky top-0 z-30 -mx-4 border-b border-white/10 bg-black/90 px-4 py-2 backdrop-blur-sm">
      <div ref={navRef} className="flex gap-1 overflow-x-auto scrollbar-hide" role="tablist">
        {sections.map((s) => (
          <button
            key={s.id}
            data-section={s.id}
            onClick={() => {
              const el = document.getElementById(s.id);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`shrink-0 cursor-pointer rounded-full px-3 py-1 text-xs transition-all duration-200 ${
              activeId === s.id
                ? "bg-primary/20 text-primary"
                : "text-white/40 hover:bg-white/5 hover:text-white/70"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

export function ScoreSimulator({ report }: { report: CheckReport }) {
  const improvableItems = report.results.filter((r) => r.status !== "pass");
  const [fixed, setFixed] = useState<Set<string>>(new Set());

  if (improvableItems.length === 0) return null;

  const simulatedScore = report.results.reduce((sum, r) => {
    if (fixed.has(r.id)) return sum + r.maxScore;
    return sum + r.score;
  }, 0);
  const simulatedPct = Math.round((simulatedScore / report.maxScore) * 100);
  const currentPct = Math.round((report.totalScore / report.maxScore) * 100);
  const improvement = simulatedPct - currentPct;
  const simulatedGrade = simulatedPct >= 90 ? "A" : simulatedPct >= 75 ? "B" : simulatedPct >= 60 ? "C" : simulatedPct >= 40 ? "D" : "F";

  const toggle = (id: string) => {
    setFixed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div id="sec-simulator" className="scroll-mt-16 rounded-lg border border-primary/20 bg-primary/5 p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">改善シミュレーター</h2>
          <p className="mt-1 text-sm text-white/50">
            項目を選択すると、改善後の予測スコアを確認できます
          </p>
        </div>
        {fixed.size > 0 && (
          <div className="text-right">
            <p className={`text-2xl font-bold ${GRADE_COLORS[simulatedGrade]}`}>
              {simulatedGrade} ({simulatedPct})
            </p>
            <p className="text-xs text-green-400">+{improvement}pt</p>
          </div>
        )}
      </div>
      <div className="space-y-2">
        {improvableItems.map((item) => {
          const potential = item.maxScore - item.score;
          const isFixed = fixed.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-200 ${
                isFixed
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                isFixed
                  ? "border-green-500/50 bg-green-500/20 text-green-400"
                  : "border-white/20 text-transparent"
              }`}>
                {isFixed ? "+" : ""}
              </span>
              <span className={`flex-1 text-sm ${isFixed ? "text-green-400" : "text-white/70"}`}>
                {item.message}
              </span>
              <span className="text-xs text-white/30">+{potential}pt</span>
            </button>
          );
        })}
      </div>
      {fixed.size > 0 && (
        <div className="mt-4 rounded border border-white/5 bg-black/20 px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/40">
              現在: {currentPct}/100 ({report.grade})
            </p>
            <p className="text-xs text-white/40">→</p>
            <p className={`text-xs font-medium ${GRADE_COLORS[simulatedGrade]}`}>
              予測: {simulatedPct}/100 ({simulatedGrade})
            </p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="relative h-full">
              <div
                className="absolute h-full rounded-full bg-white/20"
                style={{ width: `${simulatedPct}%`, transition: "width 0.3s ease-out" }}
              />
              <div
                className="absolute h-full rounded-full bg-primary/60"
                style={{ width: `${currentPct}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AllFixCodes({ report }: { report: CheckReport }) {
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
    <div id="sec-fix-codes" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5">
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

export function ScoreRadarChart({ report }: { report: CheckReport }) {
  const cx = 140;
  const cy = 140;
  const r = 100;
  const levels = 4;
  const n = 7;

  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  function point(angle: number, radius: number) {
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  }

  const gridPaths = Array.from({ length: levels }, (_, i) => {
    const lr = (r * (i + 1)) / levels;
    const pts = Array.from({ length: n }, (__, j) => point(startAngle + j * angleStep, lr));
    return pts.map((p, j) => `${j === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
  });

  const axes = Array.from({ length: n }, (_, i) => point(startAngle + i * angleStep, r));

  const gradeColor = STROKE_COLORS[report.grade] ?? "#f87171";

  const dataPts = report.results.map((result, i) => {
    const pct = result.maxScore > 0 ? result.score / result.maxScore : 0;
    return point(startAngle + i * angleStep, r * pct);
  });
  const dataPath = dataPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  const labels = INDICATOR_SHORT_NAMES.map((name, i) => {
    const p = point(startAngle + i * angleStep, r + 20);
    let anchor: "middle" | "end" | "start" = "middle";
    if (p.x < cx - 10) anchor = "end";
    else if (p.x > cx + 10) anchor = "start";
    return { ...p, name, anchor };
  });

  return (
    <div id="sec-radar" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">指標レーダーチャート</h2>
      <div className="flex justify-center">
        <svg viewBox="0 0 280 280" className="w-full max-w-[280px]" role="img" aria-label="GEOスコア レーダーチャート">
          {gridPaths.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          ))}
          {axes.map((p, i) => (
            <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          ))}
          <path d={dataPath} fill={gradeColor} fillOpacity="0.15" stroke={gradeColor} strokeWidth="2" />
          {dataPts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill={gradeColor} />
          ))}
          {labels.map((l, i) => (
            <text key={i} x={l.x} y={l.y} textAnchor={l.anchor} fill="rgba(255,255,255,0.5)" fontSize="10" dominantBaseline="middle">
              {l.name}
            </text>
          ))}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-white/40">
        {report.results.map((result, i) => (
          <span key={result.id}>
            {INDICATOR_SHORT_NAMES[i]}: {result.score}/{result.maxScore}
          </span>
        ))}
      </div>
    </div>
  );
}
