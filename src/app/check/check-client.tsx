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

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-400",
  B: "text-blue-400",
  C: "text-yellow-400",
  D: "text-orange-400",
  F: "text-red-400",
};

const STROKE_COLORS: Record<string, string> = {
  A: "#4ade80",
  B: "#60a5fa",
  C: "#facc15",
  D: "#fb923c",
  F: "#f87171",
};

const DOWNLOAD_NAME_MAP: Record<string, string> = {
  "robots-txt": "robots.txt",
  "llms-txt": "llms.txt",
  "structured-data": "schema.jsonld",
  "meta-tags": "meta-tags.html",
  "content-structure": "content-structure.html",
  "ssr": "ssr-guide.txt",
  "sitemap": "sitemap.xml",
};

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

  if (report.imageOptimization) {
    const img = report.imageOptimization;
    lines.push("");
    lines.push("--- 画像最適化 ---");
    lines.push(`画像数: ${img.totalImages}枚`);
    if (img.webpCount > 0) lines.push(`WebP: ${img.webpCount}枚`);
    if (img.avifCount > 0) lines.push(`AVIF: ${img.avifCount}枚`);
    lines.push(`次世代フォーマット使用率: ${img.modernFormatRatio}%`);
    if (img.srcsetCount > 0) lines.push(`srcset（レスポンシブ画像）: ${img.srcsetCount}枚`);
    if (img.pictureElementCount > 0) lines.push(`<picture>要素: ${img.pictureElementCount}件`);
  }

  if (report.contentLanguage || (report.hreflangTags && report.hreflangTags.length > 0)) {
    lines.push("");
    lines.push("--- 多言語対応 ---");
    if (report.contentLanguage) lines.push(`Content-Language: ${report.contentLanguage}`);
    if (report.hreflangTags && report.hreflangTags.length > 0) lines.push(`hreflang: ${report.hreflangTags.join(", ")}`);
  }

  if (report.redirectChain) {
    lines.push("");
    lines.push("--- リダイレクト ---");
    lines.push(`リダイレクト回数: ${report.redirectChain.hops}回`);
    if (report.redirectChain.statusCodes?.length) {
      lines.push(`ステータスコード: ${report.redirectChain.statusCodes.map((c) => `${c} (${c === 301 ? "恒久" : c === 302 ? "一時" : c === 307 ? "一時" : c === 308 ? "恒久" : ""})`).join(" → ")}`);
    }
    lines.push(`最終URL: ${report.redirectChain.finalUrl}`);
    if (report.redirectChain.hasHttpToHttps) lines.push("HTTP→HTTPSリダイレクト: あり");
    if (report.redirectChain.hasWwwRedirect) lines.push("wwwリダイレクト: あり");
  }

  if (report.canonicalUrl) {
    lines.push("");
    lines.push("--- canonical URL ---");
    lines.push(`canonical: ${report.canonicalUrl}`);
    if (report.canonicalMismatch) lines.push("⚠ canonical URLとアクセスURLが一致しません");
  }

  if (report.contentEncoding || report.serverHeader || report.httpVersion) {
    lines.push("");
    lines.push("--- サーバー情報 ---");
    if (report.httpVersion) lines.push(`HTTPプロトコル: ${report.httpVersion}`);
    if (report.contentEncoding) lines.push(`コンテンツ圧縮: ${report.contentEncoding}`);
    if (report.serverHeader) lines.push(`Server: ${report.serverHeader}`);
  }

  if (report.sslCertificate) {
    lines.push("");
    lines.push("--- SSL/TLS証明書 ---");
    lines.push(`発行元: ${report.sslCertificate.issuer}`);
    lines.push(`プロトコル: ${report.sslCertificate.protocol}`);
    lines.push(`有効期限: ${new Date(report.sslCertificate.validTo).toLocaleDateString("ja-JP")}`);
    lines.push(`残り日数: ${report.sslCertificate.daysRemaining}日`);
    if (report.sslCertificate.daysRemaining < 30) lines.push("⚠ 証明書の有効期限が30日以内です。更新を検討してください。");
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

  if (report.contentMetrics && report.contentMetrics.wordCount > 0) {
    lines.push("");
    lines.push("--- コンテンツ分析 ---");
    lines.push(`単語数: ${report.contentMetrics.wordCount.toLocaleString()}`);
    lines.push(`文字数: ${report.contentMetrics.charCount.toLocaleString()}`);
    lines.push(`段落数: ${report.contentMetrics.paragraphCount}`);
    lines.push(`テキスト/HTML比率: ${report.contentMetrics.textToHtmlRatio}%`);
    lines.push(`平均文長: ${report.contentMetrics.averageSentenceLength}語/文`);
  }

  if (report.feedDetection) {
    lines.push("");
    lines.push("--- フィード検出 ---");
    if (report.feedDetection.hasRss) lines.push("RSS: あり");
    if (report.feedDetection.hasAtom) lines.push("Atom: あり");
    if (report.feedDetection.feedUrls.length > 0) {
      report.feedDetection.feedUrls.forEach((u) => lines.push(`  ${u}`));
    }
  }

  if (report.faviconAnalysis) {
    lines.push("");
    lines.push("--- ファビコン分析 ---");
    lines.push(`favicon: ${report.faviconAnalysis.hasFavicon ? "あり" : "なし"}`);
    lines.push(`apple-touch-icon: ${report.faviconAnalysis.hasAppleTouchIcon ? "あり" : "なし"}`);
    lines.push(`SVGアイコン: ${report.faviconAnalysis.hasSvgIcon ? "あり" : "なし"}`);
    if (report.faviconAnalysis.sizes.length > 0) lines.push(`サイズ: ${report.faviconAnalysis.sizes.join(", ")}`);
    lines.push(`manifest icons: ${report.faviconAnalysis.hasWebManifestIcons ? "あり" : "なし"}`);
  }

  if (report.ogPreview) {
    lines.push("");
    lines.push("--- OGプレビュー ---");
    if (report.ogPreview.ogTitle) lines.push(`og:title: ${report.ogPreview.ogTitle}`);
    if (report.ogPreview.ogDescription) lines.push(`og:description: ${report.ogPreview.ogDescription}`);
    if (report.ogPreview.ogUrl) lines.push(`og:url: ${report.ogPreview.ogUrl}`);
    if (report.ogImage) lines.push(`og:image: ${report.ogImage}`);
  }

  if (report.headingTree && report.headingTree.length > 0) {
    lines.push("");
    lines.push("--- 見出し構造 ---");
    for (const h of report.headingTree) {
      lines.push(`${"  ".repeat(h.level - 1)}h${h.level}: ${h.text}`);
    }
  }

  if (report.duplicateMetaTags && report.duplicateMetaTags.length > 0) {
    lines.push("");
    lines.push("--- 重複メタタグ警告 ---");
    for (const d of report.duplicateMetaTags) {
      lines.push(`${d.tag}: ${d.count}個検出（推奨: 1個）`);
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

function ScoreSimulator({ report }: { report: CheckReport }) {
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
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
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
  const [badgeCopied, setBadgeCopied] = useState("");
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

  const handleDownloadJson = useCallback(() => {
    if (!report) return;
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    let hostname = "site";
    try { hostname = new URL(report.url).hostname; } catch { /* use default */ }
    a.download = `ai-check-${hostname}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(blobUrl);
  }, [report]);

  const handleDownloadZip = useCallback(() => {
    if (!report) return;
    const files: { name: string; content: string }[] = [];
    for (const r of report.results) {
      if (r.code) {
        files.push({ name: DOWNLOAD_NAME_MAP[r.id] ?? `${r.id}.txt`, content: r.code });
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
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      const container = img.parentElement;
                      if (container) container.style.display = "none";
                    }}
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
              <p className="mb-4 truncate text-sm text-white/50">{report.url}</p>
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
              {report.redirectChain && report.redirectChain.hops > 0 && (
                <span className={`rounded-full px-3 py-1 text-xs ${report.redirectChain.hops <= 1 ? "bg-green-500/10 text-green-400" : report.redirectChain.hops <= 2 ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"}`}>
                  リダイレクト: {report.redirectChain.hops}回{report.redirectChain.hasHttpToHttps ? " (HTTPS)" : ""}
                </span>
              )}
              {report.canonicalMismatch && (
                <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
                  canonical不一致
                </span>
              )}
              {report.httpVersion && (
                <span className={`rounded-full px-3 py-1 text-xs ${report.httpVersion.includes("2") || report.httpVersion.includes("3") ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                  {report.httpVersion}
                </span>
              )}
              {report.sslCertificate && (
                <span className={`rounded-full px-3 py-1 text-xs ${report.sslCertificate.daysRemaining > 30 ? "bg-green-500/10 text-green-400" : report.sslCertificate.daysRemaining > 7 ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"}`}>
                  SSL: {report.sslCertificate.protocol} ({report.sslCertificate.daysRemaining}日)
                </span>
              )}
              {report.contentEncoding && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                  圧縮: {report.contentEncoding}
                </span>
              )}
              {report.serverHeader && (
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
                  Server: {report.serverHeader}
                </span>
              )}
              {report.detectedTech && report.detectedTech.length > 0 && (
                <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-400">
                  {report.detectedTech.filter(t => !["Google Analytics", "Microsoft Clarity"].includes(t)).slice(0, 3).join(" / ") || report.detectedTech[0]}
                </span>
              )}
              {report.contentMetrics && report.contentMetrics.wordCount > 0 && (
                <span className={`rounded-full px-3 py-1 text-xs ${report.contentMetrics.textToHtmlRatio >= 25 ? "bg-green-500/10 text-green-400" : report.contentMetrics.textToHtmlRatio >= 10 ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"}`}>
                  テキスト比率: {report.contentMetrics.textToHtmlRatio}%
                </span>
              )}
              {report.feedDetection && (
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                  フィード: {[report.feedDetection.hasRss && "RSS", report.feedDetection.hasAtom && "Atom"].filter(Boolean).join("+")}
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
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer border-white/10 bg-white/5 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
                onClick={handleDownloadJson}
              >
                JSONで保存
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
              <Button
                variant="outline"
                size="sm"
                className="no-print cursor-pointer border-white/10 bg-white/5 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
                onClick={() => window.print()}
              >
                印刷 / PDF
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

          {/* SSL/TLS Certificate */}
          {report.sslCertificate && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">SSL/TLS証明書</h2>
                <span className={`rounded-full px-3 py-1 text-xs ${
                  report.sslCertificate.daysRemaining > 30 ? "bg-green-500/10 text-green-400"
                    : report.sslCertificate.daysRemaining > 7 ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-red-500/10 text-red-400"
                }`}>
                  {report.sslCertificate.daysRemaining > 30 ? "有効" : report.sslCertificate.daysRemaining > 0 ? "期限間近" : "期限切れ"}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/40">発行元</p>
                  <p className="text-sm font-medium text-white">{report.sslCertificate.issuer}</p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/40">プロトコル</p>
                  <p className={`text-sm font-medium ${report.sslCertificate.protocol.includes("1.3") ? "text-green-400" : "text-white"}`}>
                    {report.sslCertificate.protocol}
                  </p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/40">有効期限</p>
                  <p className="text-sm font-medium text-white">
                    {new Date(report.sslCertificate.validTo).toLocaleDateString("ja-JP")}
                  </p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/40">残り日数</p>
                  <p className={`text-lg font-bold ${
                    report.sslCertificate.daysRemaining > 30 ? "text-green-400"
                      : report.sslCertificate.daysRemaining > 7 ? "text-yellow-400"
                      : "text-red-400"
                  }`}>
                    {report.sslCertificate.daysRemaining}日
                  </p>
                </div>
              </div>
              {report.sslCertificate.subjectAltNames && report.sslCertificate.subjectAltNames.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-white/40 mb-1">SAN (対象ドメイン)</p>
                  <div className="flex flex-wrap gap-1">
                    {report.sslCertificate.subjectAltNames.map((san) => (
                      <span key={san} className="rounded bg-white/5 px-2 py-0.5 text-xs text-white/60">{san}</span>
                    ))}
                  </div>
                </div>
              )}
              {report.sslCertificate.daysRemaining <= 30 && (
                <p className="mt-3 text-xs text-yellow-400/80">
                  SSL証明書の有効期限が{report.sslCertificate.daysRemaining}日以内です。早めに更新を行ってください。
                </p>
              )}
              {report.httpVersion && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-white/40">HTTPプロトコル:</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    report.httpVersion.includes("2") || report.httpVersion.includes("3") ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                  }`}>
                    {report.httpVersion}
                  </span>
                  {!report.httpVersion.includes("2") && !report.httpVersion.includes("3") && (
                    <span className="text-xs text-white/30">HTTP/2以上への移行を推奨</span>
                  )}
                </div>
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

          {/* Image optimization */}
          {report.imageOptimization && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-3 text-lg font-semibold text-white">画像最適化</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/40">次世代フォーマット</p>
                  <p className={`text-lg font-bold ${
                    report.imageOptimization.modernFormatRatio >= 50
                      ? "text-green-400"
                      : report.imageOptimization.modernFormatRatio > 0
                      ? "text-yellow-400"
                      : "text-white/30"
                  }`}>
                    {report.imageOptimization.modernFormatRatio}%
                  </p>
                  <p className="text-xs text-white/30">
                    WebP: {report.imageOptimization.webpCount} / AVIF: {report.imageOptimization.avifCount}
                  </p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/40">レスポンシブ画像</p>
                  <p className={`text-lg font-bold ${
                    report.imageOptimization.srcsetCount > 0 ? "text-green-400" : "text-white/30"
                  }`}>
                    {report.imageOptimization.srcsetCount}/{report.imageOptimization.totalImages}
                  </p>
                  <p className="text-xs text-white/30">
                    {report.imageOptimization.srcsetCount > 0 ? "srcset属性で最適サイズ配信" : "srcset未使用"}
                  </p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/40">{`<picture>`}要素</p>
                  <p className={`text-lg font-bold ${
                    report.imageOptimization.pictureElementCount > 0 ? "text-green-400" : "text-white/30"
                  }`}>
                    {report.imageOptimization.pictureElementCount}件
                  </p>
                  <p className="text-xs text-white/30">
                    {report.imageOptimization.pictureElementCount > 0
                      ? "フォーマットフォールバック対応"
                      : "picture要素で次世代フォーマット配信を推奨"}
                  </p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/40">画像数</p>
                  <p className="text-lg font-bold text-white/60">
                    {report.imageOptimization.totalImages}枚
                  </p>
                  <p className="text-xs text-white/30">ページ内の総画像数</p>
                </div>
              </div>
              {report.imageOptimization.modernFormatRatio === 0 && report.imageOptimization.totalImages > 0 && (
                <p className="mt-3 text-xs text-yellow-400/70">
                  WebP/AVIF等の次世代画像フォーマットを使用するとファイルサイズが30〜50%削減でき、ページ速度が向上します。
                </p>
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
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
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

          {/* Redirect Chain & Canonical */}
          {(report.redirectChain || report.canonicalUrl) && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-3 text-lg font-semibold text-white">リダイレクト & canonical URL</h2>
              {report.redirectChain && report.redirectChain.hops > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-sm text-white/60">
                    リダイレクト: <span className={report.redirectChain.hops <= 1 ? "text-green-400" : report.redirectChain.hops <= 2 ? "text-yellow-400" : "text-red-400"}>{report.redirectChain.hops}回</span>
                    {report.redirectChain.hasHttpToHttps && <span className="ml-2 rounded bg-green-500/10 px-2 py-0.5 text-xs text-green-400">HTTP→HTTPS</span>}
                    {report.redirectChain.hasWwwRedirect && <span className="ml-2 rounded bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">www正規化</span>}
                  </p>
                  <div className="space-y-1">
                    {report.redirectChain.chain.map((u, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="text-white/30">{i === 0 ? "開始" : i === report.redirectChain!.chain.length - 1 ? "最終" : `${i}回目`}</span>
                        {i > 0 && report.redirectChain!.statusCodes?.[i - 1] && (
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                            report.redirectChain!.statusCodes[i - 1] === 301 || report.redirectChain!.statusCodes[i - 1] === 308
                              ? "bg-green-500/10 text-green-400"
                              : "bg-yellow-500/10 text-yellow-400"
                          }`}>
                            {report.redirectChain!.statusCodes[i - 1]}
                            {report.redirectChain!.statusCodes[i - 1] === 301 ? " 恒久" : report.redirectChain!.statusCodes[i - 1] === 302 ? " 一時" : report.redirectChain!.statusCodes[i - 1] === 307 ? " 一時" : report.redirectChain!.statusCodes[i - 1] === 308 ? " 恒久" : ""}
                          </span>
                        )}
                        <span className="text-white/50 truncate">{u}</span>
                      </div>
                    ))}
                  </div>
                  {report.redirectChain.hops >= 3 && (
                    <p className="mt-2 text-xs text-yellow-400/70">リダイレクトが3回以上あります。ページ読み込み速度に影響する可能性があります。</p>
                  )}
                </div>
              )}
              {report.canonicalUrl && (
                <div>
                  <p className="text-sm text-white/60">
                    canonical: <span className="text-white/70">{report.canonicalUrl}</span>
                  </p>
                  {report.canonicalMismatch && (
                    <p className="mt-1 text-xs text-yellow-400/70">canonical URLとアクセスURLが異なります。SEOの正規化設定を確認してください。</p>
                  )}
                </div>
              )}
              <p className="mt-3 text-xs text-white/40">
                リダイレクトチェーンが長いとクローラーの巡回効率が低下します。canonical URLは検索エンジンに正規ページを指定します。
              </p>
            </div>
          )}

          {/* Content Readability Metrics */}
          {report.contentMetrics && report.contentMetrics.wordCount > 0 && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-3 text-lg font-semibold text-white">コンテンツ分析</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{report.contentMetrics.wordCount.toLocaleString()}</p>
                  <p className="text-xs text-white/40">単語数</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{report.contentMetrics.charCount.toLocaleString()}</p>
                  <p className="text-xs text-white/40">文字数</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{report.contentMetrics.paragraphCount}</p>
                  <p className="text-xs text-white/40">段落数</p>
                </div>
                <div className="text-center">
                  <p className={`text-lg font-bold ${report.contentMetrics.textToHtmlRatio >= 25 ? "text-green-400" : report.contentMetrics.textToHtmlRatio >= 10 ? "text-yellow-400" : "text-red-400"}`}>
                    {report.contentMetrics.textToHtmlRatio}%
                  </p>
                  <p className="text-xs text-white/40">テキスト/HTML比率</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{report.contentMetrics.averageSentenceLength}</p>
                  <p className="text-xs text-white/40">平均文長（語数）</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-white/40">
                テキスト/HTML比率が高いほどコンテンツ密度が高く、AI検索エンジンが有用な情報を抽出しやすくなります。推奨: 25%以上。
              </p>
            </div>
          )}

          {/* RSS/Atom Feed Detection */}
          {report.feedDetection && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-3 text-lg font-semibold text-white">フィード検出</h2>
              <div className="flex flex-wrap gap-2">
                {report.feedDetection.hasRss && (
                  <span className="rounded bg-green-500/10 px-3 py-1 text-sm text-green-400">RSS</span>
                )}
                {report.feedDetection.hasAtom && (
                  <span className="rounded bg-green-500/10 px-3 py-1 text-sm text-green-400">Atom</span>
                )}
              </div>
              {report.feedDetection.feedUrls.length > 0 && (
                <div className="mt-2 space-y-1">
                  {report.feedDetection.feedUrls.map((u, i) => (
                    <p key={i} className="truncate text-xs text-white/50">{u}</p>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs text-white/40">
                RSS/Atomフィードは、AIクローラーやアグリゲーターがコンテンツの更新を検知するために利用します。
              </p>
            </div>
          )}

          {/* Favicon Completeness */}
          {report.faviconAnalysis && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-3 text-lg font-semibold text-white">ファビコン分析</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                {[
                  { label: "favicon", ok: report.faviconAnalysis.hasFavicon },
                  { label: "apple-touch-icon", ok: report.faviconAnalysis.hasAppleTouchIcon },
                  { label: "SVGアイコン", ok: report.faviconAnalysis.hasSvgIcon },
                  { label: "サイズ指定", ok: report.faviconAnalysis.sizes.length > 0 },
                  { label: "manifest icons", ok: report.faviconAnalysis.hasWebManifestIcons },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <span className={item.ok ? "text-green-400" : "text-white/30"}>
                      {item.ok ? "\u2713" : "\u2015"}
                    </span>
                    <span className="text-white/60">{item.label}</span>
                  </div>
                ))}
              </div>
              {report.faviconAnalysis.sizes.length > 0 && (
                <p className="mt-2 text-xs text-white/50">
                  検出サイズ: {report.faviconAnalysis.sizes.join(", ")}
                </p>
              )}
              <p className="mt-3 text-xs text-white/40">
                複数サイズのファビコンとapple-touch-iconを設定すると、ブラウザ・検索結果・ブックマークでの表示品質が向上します。
              </p>
            </div>
          )}

          {/* Duplicate Meta Tag Warning */}
          {report.duplicateMetaTags && report.duplicateMetaTags.length > 0 && (
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-6">
              <h2 className="mb-3 text-lg font-semibold text-yellow-400">重複メタタグ検出</h2>
              <div className="space-y-2">
                {report.duplicateMetaTags.map((d) => (
                  <div key={d.tag} className="flex items-center gap-2 text-sm">
                    <span className="text-yellow-400">!</span>
                    <span className="text-white/70">
                      <span className="font-mono text-yellow-300">&lt;{d.tag}&gt;</span> が {d.count} 個検出されました（推奨: 1個）
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-white/40">
                重複したメタタグは検索エンジンの混乱を招き、意図しないタグが優先される可能性があります。各メタタグはページ内に1つだけ設置してください。
              </p>
            </div>
          )}

          {/* OG / Social Preview Card */}
          {(report.ogPreview || report.ogImage) && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-3 text-lg font-semibold text-white">ソーシャルシェアプレビュー</h2>
              <p className="mb-4 text-xs text-white/40">SNS（X/Twitter、LINE、Facebook等）でシェアされた際の表示イメージ</p>
              <div className="mx-auto max-w-lg overflow-hidden rounded-xl border border-white/10 bg-black">
                {report.ogImage && (
                  <div className="aspect-[1200/630] w-full overflow-hidden bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={report.ogImage.startsWith("http") ? report.ogImage : `${new URL(report.url).origin}${report.ogImage.startsWith("/") ? "" : "/"}${report.ogImage}`}
                      alt="OG画像プレビュー"
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <p className="mb-1 truncate text-xs text-white/40">
                    {(() => { try { return new URL(report.ogPreview?.ogUrl ?? report.url).hostname; } catch { return report.url; } })()}
                  </p>
                  <p className="mb-1 truncate text-sm font-semibold text-white">
                    {report.ogPreview?.ogTitle ?? report.siteTitle ?? "(og:title 未設定)"}
                  </p>
                  <p className="line-clamp-2 text-xs text-white/50">
                    {report.ogPreview?.ogDescription ?? "(og:description 未設定)"}
                  </p>
                </div>
              </div>
              {(!report.ogPreview?.ogTitle || !report.ogPreview?.ogDescription || !report.ogImage) && (
                <div className="mt-3 space-y-1">
                  {!report.ogPreview?.ogTitle && (
                    <p className="text-xs text-yellow-400">og:title が未設定です。SNSシェア時にページタイトルが表示されない可能性があります。</p>
                  )}
                  {!report.ogPreview?.ogDescription && (
                    <p className="text-xs text-yellow-400">og:description が未設定です。SNSシェア時に説明文が表示されません。</p>
                  )}
                  {!report.ogImage && (
                    <p className="text-xs text-yellow-400">og:image が未設定です。SNSシェア時にサムネイル画像が表示されません。</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Heading Hierarchy Tree */}
          {report.headingTree && report.headingTree.length > 0 && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-3 text-lg font-semibold text-white">見出し構造ツリー</h2>
              <div className="space-y-0.5 font-mono text-sm">
                {report.headingTree.map((h, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <span style={{ paddingLeft: `${(h.level - 1) * 16}px` }} className="flex shrink-0 items-center gap-1">
                      {h.level > 1 && <span className="text-white/20">{"└".padStart(1)}</span>}
                      <span className={`inline-block w-6 shrink-0 rounded px-1 text-center text-xs font-bold ${
                        h.level === 1 ? "bg-primary/20 text-primary" : h.level === 2 ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-white/50"
                      }`}>
                        h{h.level}
                      </span>
                    </span>
                    <span className="truncate text-white/70">{h.text}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-white/40">
                見出しは h1 → h2 → h3 の順で階層的に使用し、h1はページ内に1つだけ配置するのが推奨です。
                AIクローラーは見出し構造からコンテンツの意味を理解します。
              </p>
            </div>
          )}

          {/* Score breakdown chart */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">スコア内訳</h2>
            <div className="space-y-3">
              {report.results.map((r) => {
                const pct = r.maxScore > 0 ? Math.round((r.score / r.maxScore) * 100) : 0;
                return (
                  <div key={r.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <Link href={`/check/${r.id}`} className="cursor-pointer text-white/70 transition-all duration-200 hover:text-white">
                        {r.message.split(":")[0]}
                      </Link>
                      <span className={`font-mono text-xs ${r.status === "pass" ? "text-green-400" : r.status === "warn" ? "text-yellow-400" : "text-red-400"}`}>
                        {r.score}/{r.maxScore}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/5">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          r.status === "pass" ? "bg-green-500" : r.status === "warn" ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-sm font-semibold text-white">合計</span>
              <span className="font-mono text-sm font-bold text-white">{report.totalScore}/{report.maxScore}</span>
            </div>
          </div>

          {/* Grade explanation */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="mb-3 text-lg font-semibold text-white">スコアの見方</h2>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
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

          <ScoreSimulator report={report} />

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
              <p className="mb-3 text-sm text-white/50">
                このスコアをREADMEやサイトに埋め込めます。
              </p>
              <div className="mb-3 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/badge?url=${encodeURIComponent(report.url)}&style=flat`}
                  alt="GEO Score Badge"
                  className="h-5"
                />
              </div>
              <div className="space-y-2">
                {[
                  { label: "Markdown", key: "md", code: `[![GEO Score](https://ai-check.ezoai.jp/api/badge?url=${encodeURIComponent(report.url)})](https://ai-check.ezoai.jp/check?url=${encodeURIComponent(report.url)})` },
                  { label: "HTML", key: "html", code: `<a href="https://ai-check.ezoai.jp/check?url=${encodeURIComponent(report.url)}"><img src="https://ai-check.ezoai.jp/api/badge?url=${encodeURIComponent(report.url)}" alt="GEO Score" /></a>` },
                ].map((item) => (
                  <button
                    key={item.key}
                    className="flex w-full cursor-pointer items-center justify-between rounded bg-black/30 px-3 py-2 text-left text-xs transition-all duration-200 hover:bg-black/50"
                    onClick={() => {
                      navigator.clipboard.writeText(item.code).catch(() => {});
                      setBadgeCopied(item.key);
                      setTimeout(() => setBadgeCopied(""), 2000);
                    }}
                  >
                    <span className="text-white/40">{item.label}</span>
                    <span className="text-white/60">{badgeCopied === item.key ? "コピー済み" : "コピー"}</span>
                  </button>
                ))}
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
