"use client";

import type { CheckReport } from "@/lib/check-indicators";

const AI_CRAWLER_LABELS: Record<string, string> = {
  GPTBot: "ChatGPT",
  "ChatGPT-User": "ChatGPT (User)",
  ClaudeBot: "Claude",
  "anthropic-ai": "Anthropic",
  PerplexityBot: "Perplexity",
  "Google-Extended": "Gemini",
  Bytespider: "ByteDance",
  CCBot: "Common Crawl",
  "Applebot-Extended": "Apple AI",
  "cohere-ai": "Cohere",
};

export function AiCrawlerStatusSection({ report }: { report: CheckReport }) {
  if (!report.aiCrawlerStatus || report.aiCrawlerStatus.length === 0) return null;

  const allowedCount = report.aiCrawlerStatus.filter((c) => c.allowed).length;
  const totalCount = report.aiCrawlerStatus.length;

  return (
    <div id="sec-ai-crawlers" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">AIクローラー個別ステータス</h2>
        <span className={`rounded-full px-3 py-1 text-xs ${
          allowedCount === totalCount ? "bg-green-500/10 text-green-400"
            : allowedCount > 0 ? "bg-yellow-500/10 text-yellow-400"
            : "bg-red-500/10 text-red-400"
        }`}>
          {allowedCount}/{totalCount} 許可
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {report.aiCrawlerStatus.map((crawler) => (
          <div
            key={crawler.name}
            className={`rounded-lg p-3 text-center ${
              crawler.allowed ? "bg-green-500/5" : "bg-red-500/5"
            }`}
          >
            <p className={`text-sm font-medium ${crawler.allowed ? "text-green-400" : "text-red-400"}`}>
              {crawler.allowed ? "+" : "-"}
            </p>
            <p className="mt-1 text-xs font-medium text-white/70">
              {AI_CRAWLER_LABELS[crawler.name] ?? crawler.name}
            </p>
            <p className="text-[10px] text-white/30">{crawler.name}</p>
          </div>
        ))}
      </div>
      {allowedCount < totalCount && (
        <p className="mt-3 text-xs text-white/40">
          ブロックされているクローラーがあります。robots.txtで個別にAllowを設定するか、グローバルブロック（Disallow: /）を解除してください。
        </p>
      )}
    </div>
  );
}

export function ExternalResourcesSection({ report }: { report: CheckReport }) {
  if (!report.externalResourceCount) return null;

  const { externalCss, externalJs, totalExternal } = report.externalResourceCount;

  return (
    <div id="sec-ext-resources" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">外部リソース</h2>
        <span className={`rounded-full px-3 py-1 text-xs ${
          totalExternal <= 5 ? "bg-green-500/10 text-green-400"
            : totalExternal <= 15 ? "bg-yellow-500/10 text-yellow-400"
            : "bg-red-500/10 text-red-400"
        }`}>
          {totalExternal}件
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-white/[0.03] p-3 text-center">
          <p className="text-lg font-bold text-white">{externalCss}</p>
          <p className="text-xs text-white/40">外部CSS</p>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-3 text-center">
          <p className="text-lg font-bold text-white">{externalJs}</p>
          <p className="text-xs text-white/40">外部JavaScript</p>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-3 text-center">
          <p className={`text-lg font-bold ${
            totalExternal <= 5 ? "text-green-400" : totalExternal <= 15 ? "text-yellow-400" : "text-red-400"
          }`}>{totalExternal}</p>
          <p className="text-xs text-white/40">合計</p>
        </div>
      </div>
      {report.externalResourceCount.thirdPartyDomains && report.externalResourceCount.thirdPartyDomains.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs text-white/40">外部ドメイン ({report.externalResourceCount.thirdPartyDomains.length})</p>
          <div className="flex flex-wrap gap-1">
            {report.externalResourceCount.thirdPartyDomains.map((domain) => (
              <span key={domain} className="rounded bg-white/5 px-2 py-0.5 text-xs text-white/50 font-mono">{domain}</span>
            ))}
          </div>
        </div>
      )}
      {totalExternal > 10 && (
        <p className="mt-3 text-xs text-white/40">
          外部リソースが多いとページ読み込み速度に影響します。不要なリソースの削除やセルフホスティングを検討してください。
        </p>
      )}
    </div>
  );
}

export function JsonLdBlocksSection({ report }: { report: CheckReport }) {
  if (!report.jsonLdBlocks || report.jsonLdBlocks.blockCount === 0) return null;

  return (
    <div id="sec-jsonld-blocks" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">JSON-LDブロック詳細</h2>
        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
          {report.jsonLdBlocks.blockCount}ブロック
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {report.jsonLdBlocks.types.map((type, i) => (
          <span
            key={`${type}-${i}`}
            className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm text-primary/80"
          >
            {type}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-white/40">
        検出されたJSON-LDブロック数とスキーマタイプの一覧です。複数のスキーマタイプを適切に設置することで、AI検索エンジンがサイトの内容を正確に理解しやすくなります。
      </p>
    </div>
  );
}

export function AccessibilitySection({ report }: { report: CheckReport }) {
  if (!report.accessibility || (report.accessibility.imgCount === 0 && report.accessibility.ariaLandmarks === 0)) return null;

  return (
    <div id="sec-accessibility" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
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
  );
}

export function SecurityHeadersSection({ report }: { report: CheckReport }) {
  if (!report.securityHeaders) return null;

  return (
    <div id="sec-security" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
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
  );
}

export function SslCertificateSection({ report }: { report: CheckReport }) {
  if (!report.sslCertificate) return null;

  return (
    <div id="sec-ssl" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
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
  );
}

export function PerformanceHintsSection({ report }: { report: CheckReport }) {
  if (!report.performanceHints) return null;

  return (
    <div id="sec-performance" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
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
  );
}

export function CoreWebVitalsSection({ report }: { report: CheckReport }) {
  if (!report.coreWebVitals) return null;

  return (
    <div id="sec-cwv" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
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
  );
}

export function ImageOptimizationSection({ report }: { report: CheckReport }) {
  if (!report.imageOptimization) return null;

  return (
    <div id="sec-image-opt" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
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
          WebP/AVIF等の次世代画像フォーマットを使用するとファイルサイズを大幅に削減でき、ページ速度が向上します。
        </p>
      )}
    </div>
  );
}

export function DetectedTechSection({ report }: { report: CheckReport }) {
  if (!report.detectedTech || report.detectedTech.length === 0) return null;

  return (
    <div id="sec-tech" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
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
  );
}

export function PwaManifestSection({ report }: { report: CheckReport }) {
  if (!report.pwaManifest?.exists) return null;

  return (
    <div id="sec-pwa" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
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
  );
}

export function SocialMetaSection({ report }: { report: CheckReport }) {
  if (!report.socialMeta) return null;

  return (
    <div id="sec-social-meta" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
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
  );
}

export function RedirectCanonicalSection({ report }: { report: CheckReport }) {
  if (!report.redirectChain && !report.canonicalUrl) return null;

  return (
    <div id="sec-redirect" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
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
  );
}

export function ContentMetricsSection({ report }: { report: CheckReport }) {
  if (!report.contentMetrics || report.contentMetrics.wordCount === 0) return null;

  return (
    <div id="sec-content" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
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
        テキスト/HTML比率が高いほどコンテンツ密度が高く、AI検索エンジンが有用な情報を抽出しやすくなります。
      </p>
    </div>
  );
}

export function FeedDetectionSection({ report }: { report: CheckReport }) {
  if (!report.feedDetection) return null;

  return (
    <div id="sec-feed" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
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
  );
}

export function FaviconAnalysisSection({ report }: { report: CheckReport }) {
  if (!report.faviconAnalysis) return null;

  return (
    <div id="sec-favicon" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
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
  );
}

export function DuplicateMetaTagsSection({ report }: { report: CheckReport }) {
  if (!report.duplicateMetaTags || report.duplicateMetaTags.length === 0) return null;

  return (
    <div id="sec-dup-meta" className="scroll-mt-16 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-6">
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
  );
}

export function OgPreviewSection({ report }: { report: CheckReport }) {
  if (!report.ogPreview && !report.ogImage) return null;

  return (
    <div id="sec-og-preview" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
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
              loading="lazy"
              decoding="async"
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
  );
}

export function HeadingTreeSection({ report }: { report: CheckReport }) {
  if (!report.headingTree || report.headingTree.length === 0) return null;

  return (
    <div id="sec-heading-tree" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
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
  );
}

export function AiContentPreviewSection({ report }: { report: CheckReport }) {
  if (!report.aiContentPreview || report.aiContentPreview.excerpt.length === 0) return null;

  return (
    <div id="sec-ai-content" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">AIが見るコンテンツ</h2>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
          読了 約{report.aiContentPreview.estimatedReadingTimeMin}分
        </span>
      </div>
      <p className="mb-3 text-xs text-white/40">
        AIクローラーがインデックスする主要テキストコンテンツのプレビューです（nav/header/footer/script除外）。
      </p>
      {report.aiContentPreview.mainTopics.length > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 text-xs font-medium text-white/60">主要トピック:</p>
          <div className="flex flex-wrap gap-1.5">
            {report.aiContentPreview.mainTopics.map((topic, i) => (
              <span key={i} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary/80">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="rounded-lg bg-black/30 p-4">
        <p className="whitespace-pre-wrap text-xs leading-relaxed text-white/60">
          {report.aiContentPreview.excerpt}
        </p>
      </div>
    </div>
  );
}

export function LinkQualitySection({ report }: { report: CheckReport }) {
  if (!report.linkQuality) return null;
  const total = report.linkQuality.followCount + report.linkQuality.nofollowCount;
  const followPct = total > 0 ? Math.round((report.linkQuality.followCount / total) * 100) : 0;

  return (
    <div id="sec-link-quality" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">リンク品質分析</h2>
        <span className={`rounded-full px-3 py-1 text-xs ${
          followPct >= 80 ? "bg-green-500/10 text-green-400"
            : followPct >= 50 ? "bg-yellow-500/10 text-yellow-400"
            : "bg-red-500/10 text-red-400"
        }`}>
          follow率: {followPct}%
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-green-500/5 p-3 text-center">
          <p className="text-lg font-bold text-green-400">{report.linkQuality.followCount}</p>
          <p className="text-xs text-white/50">follow</p>
        </div>
        <div className="rounded-lg bg-red-500/5 p-3 text-center">
          <p className="text-lg font-bold text-red-400">{report.linkQuality.nofollowCount}</p>
          <p className="text-xs text-white/50">nofollow</p>
        </div>
        <div className="rounded-lg bg-yellow-500/5 p-3 text-center">
          <p className="text-lg font-bold text-yellow-400">{report.linkQuality.sponsoredCount}</p>
          <p className="text-xs text-white/50">sponsored</p>
        </div>
        <div className="rounded-lg bg-blue-500/5 p-3 text-center">
          <p className="text-lg font-bold text-blue-400">{report.linkQuality.ugcCount}</p>
          <p className="text-xs text-white/50">ugc</p>
        </div>
      </div>
      {total > 0 && (
        <div className="mt-3">
          <div className="h-2 w-full rounded-full bg-white/5">
            <div className="h-2 rounded-full bg-green-500" style={{ width: `${followPct}%` }} />
          </div>
          <p className="mt-1 text-xs text-white/40">
            {total}件中{report.linkQuality.followCount}件がfollow（AIクローラーが辿れるリンク）
          </p>
        </div>
      )}
    </div>
  );
}

export function RichResultsSection({ report }: { report: CheckReport }) {
  if (!report.richResultsEligibility || report.richResultsEligibility.length === 0) return null;

  return (
    <div id="sec-rich-results" className="scroll-mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">リッチリザルト適格性</h2>
        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
          {report.richResultsEligibility.length}件対応
        </span>
      </div>
      <p className="mb-3 text-xs text-white/40">
        検出されたJSON-LDスキーマに基づき、Google検索で表示可能なリッチリザルトタイプです。
      </p>
      <div className="space-y-2">
        {report.richResultsEligibility.map((r) => (
          <div key={r.type} className="flex items-start gap-3 rounded-lg bg-black/20 px-4 py-3">
            <span className="mt-0.5 shrink-0 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {r.type}
            </span>
            <p className="text-sm text-white/60">{r.eligible}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
