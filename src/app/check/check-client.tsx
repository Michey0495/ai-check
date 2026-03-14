"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { UrlCheckForm } from "@/components/url-check-form";
import { Button } from "@/components/ui/button";
import type { CheckReport } from "@/lib/check-indicators";
import { createZip } from "@/lib/zip";
import {
  DOWNLOAD_NAME_MAP,
  indicatorTips,
  getPreviousScore,
  saveToHistory,
  generateReportText,
  generateMarkdownReport,
} from "./check-utils";
import {
  ScoreCircle,
  StatusBadge,
  PriorityActions,
  CheckHistory,
  QuickFixGuide,
  SectionNav,
  ScoreSimulator,
  AllFixCodes,
  CollapsibleGroup,
  ScoreRadarChart,
} from "./check-sections";
import {
  AiCrawlerStatusSection,
  ExternalResourcesSection,
  JsonLdBlocksSection,
  AccessibilitySection,
  SecurityHeadersSection,
  SslCertificateSection,
  PerformanceHintsSection,
  CoreWebVitalsSection,
  ImageOptimizationSection,
  DetectedTechSection,
  PwaManifestSection,
  SocialMetaSection,
  RedirectCanonicalSection,
  ContentMetricsSection,
  FeedDetectionSection,
  FaviconAnalysisSection,
  DuplicateMetaTagsSection,
  OgPreviewSection,
  HeadingTreeSection,
  AiContentPreviewSection,
  LinkQualitySection,
  RichResultsSection,
} from "./check-report-sections";

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(blobUrl);
}

function getHostname(url: string): string {
  try { return new URL(url).hostname; } catch { return "site"; }
}

function dateSuffix(): string {
  return new Date().toISOString().split("T")[0];
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
  const [badgeLoadError, setBadgeLoadError] = useState(false);
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
      } catch (e) {
        if (!cancelled) {
          const isTimeout = e instanceof DOMException && e.name === "AbortError";
          const isNetwork = e instanceof TypeError && e.message.includes("fetch");
          if (isTimeout) {
            setError("チェックがタイムアウトしました。対象サイトの応答が遅い可能性があります。時間をおいて再度お試しください。");
          } else if (isNetwork) {
            setError("ネットワークエラーが発生しました。インターネット接続を確認してください。");
          } else {
            setError("チェック中に予期しないエラーが発生しました。URLが正しいことを確認し、再度お試しください。");
          }
        }
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
    downloadFile(`ai-check-report-${dateSuffix()}.txt`, generateReportText(report), "text/plain");
  }, [report]);

  const handleDownloadJson = useCallback(() => {
    if (!report) return;
    downloadFile(`ai-check-${getHostname(report.url)}-${dateSuffix()}.json`, JSON.stringify(report, null, 2), "application/json");
  }, [report]);

  const handleDownloadMarkdown = useCallback(() => {
    if (!report) return;
    downloadFile(`ai-check-${getHostname(report.url)}-${dateSuffix()}.md`, generateMarkdownReport(report), "text/markdown");
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
    a.download = `ai-check-${getHostname(report.url)}-${dateSuffix()}.zip`;
    a.click();
    URL.revokeObjectURL(blobUrl);
  }, [report]);

  const getShareUrl = useCallback((report: CheckReport) => {
    const pct = Math.round((report.totalScore / report.maxScore) * 100);
    return `https://ai-check.ezoai.jp/check?url=${encodeURIComponent(report.url)}&score=${pct}&grade=${report.grade}`;
  }, []);

  const handleShareX = useCallback(() => {
    if (!report) return;
    const pct = Math.round((report.totalScore / report.maxScore) * 100);
    const text = `AI検索対応度チェック結果: ${report.grade}ランク (${pct}/100)\n${report.url}\n\n#GEO対策 #AI検索`;
    const shareUrl = getShareUrl(report);
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }, [report, getShareUrl]);

  const handleShareLINE = useCallback(() => {
    if (!report) return;
    const pct = Math.round((report.totalScore / report.maxScore) * 100);
    const shareUrl = getShareUrl(report);
    const text = `AI検索対応度チェック結果: ${report.grade}ランク (${pct}/100) ${shareUrl}`;
    window.open(
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }, [report, getShareUrl]);

  const handleCopyShareUrl = useCallback(() => {
    if (!report) return;
    const shareUrl = getShareUrl(report);
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  }, [report, getShareUrl]);

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
        <div className="space-y-8" aria-live="polite">
          <p className="sr-only">
            チェック完了: {report.url} のGEOスコアは{Math.round((report.totalScore / report.maxScore) * 100)}点、グレード{report.grade}です。
          </p>
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
                    loading="lazy"
                    decoding="async"
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
                      width={20}
                      height={20}
                      className="h-5 w-5 rounded"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
                <div className="min-w-0">
                  {report.siteTitle && (
                    <p className="truncate text-sm font-medium text-white/80">{report.siteTitle}</p>
                  )}
                  <p className="mt-0.5 truncate text-xs text-white/40" title={report.url}>{report.url}</p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            {!report.ogImage && !report.siteTitle && (
              <p className="mb-4 truncate text-sm text-white/50" title={report.url}>{report.url}</p>
            )}
            <ScoreCircle
              score={report.totalScore}
              maxScore={report.maxScore}
              grade={report.grade}
            />
            {/* Score insight */}
            <p className="mt-2 text-sm text-white/50">
              {report.grade === "A"
                ? "AI検索への対応は十分です。現状を維持しましょう。"
                : report.grade === "B"
                ? "概ね対応済み。あと少しの改善でグレードAに到達できます。"
                : report.grade === "C"
                ? "基本的な対応はされていますが、改善の余地があります。"
                : report.grade === "D"
                ? "多くの項目が未対応です。優先度の高い項目から改善しましょう。"
                : "AI検索にほぼ未対応です。まずは下記のクイック改善ガイドをご確認ください。"}
            </p>
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
              {report.dnsResolutionMs != null && (
                <span className={`rounded-full px-3 py-1 text-xs ${report.dnsResolutionMs < 100 ? "bg-green-500/10 text-green-400" : report.dnsResolutionMs < 300 ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"}`}>
                  DNS: {report.dnsResolutionMs}ms
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
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer border-white/10 bg-white/5 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
                onClick={handleDownloadMarkdown}
              >
                Markdownで保存
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
                className="cursor-pointer border-primary/30 bg-primary/10 text-primary transition-all duration-200 hover:bg-primary/20"
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
                className="cursor-pointer border-primary/30 bg-primary/10 text-primary transition-all duration-200 hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleRecheck}
                disabled={loading}
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

          <SectionNav report={report} />

          <ScoreRadarChart report={report} />

          {/* Security & Network */}
          <CollapsibleGroup
            title="セキュリティ & ネットワーク"
            sectionCount={[report.aiCrawlerStatus?.length, report.securityHeaders, report.sslCertificate, report.redirectChain || report.canonicalUrl].filter(Boolean).length}
            defaultOpen
          >
            <AiCrawlerStatusSection report={report} />
            <SecurityHeadersSection report={report} />
            <SslCertificateSection report={report} />
            <RedirectCanonicalSection report={report} />
          </CollapsibleGroup>

          {/* Performance */}
          <CollapsibleGroup
            title="パフォーマンス & 最適化"
            sectionCount={[report.performanceHints, report.coreWebVitals, report.imageOptimization, report.externalResourceCount].filter(Boolean).length}
          >
            <PerformanceHintsSection report={report} />
            <CoreWebVitalsSection report={report} />
            <ImageOptimizationSection report={report} />
            <ExternalResourcesSection report={report} />
          </CollapsibleGroup>

          {/* Content & SEO */}
          <CollapsibleGroup
            title="コンテンツ & SEO"
            sectionCount={[report.aiContentPreview, report.contentMetrics?.wordCount, report.headingTree?.length, report.jsonLdBlocks?.blockCount, report.richResultsEligibility?.length, report.linkQuality, report.duplicateMetaTags?.length, report.feedDetection, report.ogPreview || report.ogImage].filter(Boolean).length}
          >
            <AiContentPreviewSection report={report} />
            <ContentMetricsSection report={report} />
            <HeadingTreeSection report={report} />
            <JsonLdBlocksSection report={report} />
            <RichResultsSection report={report} />
            <LinkQualitySection report={report} />
            <DuplicateMetaTagsSection report={report} />
            <OgPreviewSection report={report} />
            <FeedDetectionSection report={report} />
          </CollapsibleGroup>

          {/* Tech & Social */}
          <CollapsibleGroup
            title="テクノロジー & ソーシャル"
            sectionCount={[report.detectedTech?.length, report.pwaManifest?.exists, report.socialMeta, report.faviconAnalysis, report.accessibility?.imgCount || report.accessibility?.ariaLandmarks].filter(Boolean).length}
          >
            <DetectedTechSection report={report} />
            <PwaManifestSection report={report} />
            <SocialMetaSection report={report} />
            <FaviconAnalysisSection report={report} />
            <AccessibilitySection report={report} />
          </CollapsibleGroup>

          {/* Score breakdown chart */}
          <div id="sec-score-breakdown" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
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
          <div id="sec-grade-guide" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
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

          <div id="sec-detail" className="scroll-mt-16 space-y-4">
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
                {badgeLoadError ? (
                  <p className="text-xs text-white/40">バッジの読み込みに失敗しました</p>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`/api/badge?url=${encodeURIComponent(report.url)}&style=flat`}
                    alt="GEO Score Badge"
                    className="h-5"
                    loading="lazy"
                    decoding="async"
                    onError={() => setBadgeLoadError(true)}
                  />
                )}
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
