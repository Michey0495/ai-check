import type { CheckReport } from "@/lib/check-indicators";

export type HistoryEntry = {
  url: string;
  totalScore: number;
  maxScore: number;
  grade: string;
  checkedAt: string;
  previousScore?: number;
};

export const HISTORY_KEY = "aicheck-history";
export const MAX_HISTORY = 20;

export const DOWNLOAD_NAME_MAP: Record<string, string> = {
  "robots-txt": "robots.txt",
  "llms-txt": "llms.txt",
  "structured-data": "schema.jsonld",
  "meta-tags": "meta-tags.html",
  "content-structure": "content-structure.html",
  "ssr": "ssr-guide.txt",
  "sitemap": "sitemap.xml",
};

export const indicatorTips: Record<string, { tip: string; guide?: string }> = {
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

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function getPreviousScore(url: string): number | undefined {
  const history = getHistory();
  const prev = history.find((h) => h.url === url);
  return prev ? Math.round((prev.totalScore / prev.maxScore) * 100) : undefined;
}

export function saveToHistory(report: CheckReport) {
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

export function generateReportText(report: CheckReport): string {
  const pct = Math.round((report.totalScore / report.maxScore) * 100);
  const htmlSizeText = report.htmlSizeKB != null ? ` | HTML: ${report.htmlSizeKB}KB` : "";
  const httpsText = report.isHttps !== undefined ? ` | ${report.isHttps ? "HTTPS" : "HTTP"}` : "";
  const dnsText = report.dnsResolutionMs != null ? ` | DNS: ${report.dnsResolutionMs}ms` : "";
  const linkText = report.internalLinkCount != null ? ` | 内部リンク: ${report.internalLinkCount}件 / 外部リンク: ${report.externalLinkCount ?? 0}件` : "";
  const lines = [
    `AI Check - GEOスコアレポート`,
    `================================`,
    `URL: ${report.url}`,
    `スコア: ${pct}/100 (グレード: ${report.grade})`,
    `チェック日時: ${new Date(report.checkedAt).toLocaleString("ja-JP")}${htmlSizeText}${httpsText}${dnsText}${linkText}`,
    ``,
    `--- 詳細結果 ---`,
  ];

  for (const r of report.results) {
    const icon = r.status === "pass" ? "[OK]" : r.status === "warn" ? "[!]" : "[X]";
    lines.push(`${icon} ${r.message} (${r.score}/${r.maxScore})`);
    if (r.details) lines.push(`    ${r.details}`);
  }

  if (report.aiCrawlerStatus && report.aiCrawlerStatus.length > 0) {
    const allowed = report.aiCrawlerStatus.filter((c) => c.allowed);
    const blocked = report.aiCrawlerStatus.filter((c) => !c.allowed);
    lines.push("");
    lines.push(`--- AIクローラーステータス (${allowed.length}/${report.aiCrawlerStatus.length} 許可) ---`);
    if (blocked.length > 0) {
      lines.push(`ブロック中: ${blocked.map((c) => c.name).join(", ")}`);
    }
    lines.push(`許可済み: ${allowed.map((c) => c.name).join(", ")}`);
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

  if (report.externalResourceCount) {
    lines.push("");
    lines.push("--- 外部リソース ---");
    lines.push(`外部CSS: ${report.externalResourceCount.externalCss}件`);
    lines.push(`外部JS: ${report.externalResourceCount.externalJs}件`);
    lines.push(`合計: ${report.externalResourceCount.totalExternal}件`);
    if (report.externalResourceCount.thirdPartyDomains && report.externalResourceCount.thirdPartyDomains.length > 0) {
      lines.push(`外部ドメイン: ${report.externalResourceCount.thirdPartyDomains.join(", ")}`);
    }
  }

  if (report.jsonLdBlocks && report.jsonLdBlocks.blockCount > 0) {
    lines.push("");
    lines.push("--- JSON-LDブロック ---");
    lines.push(`ブロック数: ${report.jsonLdBlocks.blockCount}`);
    if (report.jsonLdBlocks.types.length > 0) {
      lines.push(`スキーマタイプ: ${report.jsonLdBlocks.types.join(", ")}`);
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

export function generateMarkdownReport(report: CheckReport): string {
  const pct = Math.round((report.totalScore / report.maxScore) * 100);
  const lines = [
    `# AI Check - GEOスコアレポート`,
    ``,
    `| 項目 | 値 |`,
    `|------|------|`,
    `| URL | ${report.url} |`,
    `| スコア | **${pct}/100** (グレード: **${report.grade}**) |`,
    `| チェック日時 | ${new Date(report.checkedAt).toLocaleString("ja-JP")} |`,
  ];
  if (report.responseTimeMs != null) lines.push(`| レスポンスタイム | ${(report.responseTimeMs / 1000).toFixed(1)}秒 |`);
  if (report.htmlSizeKB != null) lines.push(`| HTMLサイズ | ${report.htmlSizeKB}KB |`);
  if (report.isHttps !== undefined) lines.push(`| プロトコル | ${report.isHttps ? "HTTPS" : "HTTP"} |`);

  lines.push("", "## 詳細結果", "");
  lines.push("| 指標 | スコア | ステータス |");
  lines.push("|------|--------|-----------|");
  for (const r of report.results) {
    const icon = r.status === "pass" ? "OK" : r.status === "warn" ? "警告" : "要対応";
    lines.push(`| ${r.message.split(":")[0]} | ${r.score}/${r.maxScore} | ${icon} |`);
  }

  if (report.aiCrawlerStatus && report.aiCrawlerStatus.length > 0) {
    lines.push("", "## AIクローラーステータス", "");
    lines.push("| クローラー | ステータス |");
    lines.push("|-----------|-----------|");
    for (const c of report.aiCrawlerStatus) {
      lines.push(`| ${c.name} | ${c.allowed ? "許可" : "ブロック"} |`);
    }
  }

  if (report.securityHeaders) {
    lines.push("", `## セキュリティヘッダー (${report.securityHeaders.score}/5)`, "");
    const headers = [
      { label: "HSTS", ok: report.securityHeaders.hasHsts },
      { label: "CSP", ok: report.securityHeaders.hasCsp },
      { label: "X-Frame-Options", ok: report.securityHeaders.hasXFrameOptions },
      { label: "X-Content-Type-Options", ok: report.securityHeaders.hasXContentTypeOptions },
      { label: "Referrer-Policy", ok: report.securityHeaders.hasReferrerPolicy },
    ];
    lines.push("| ヘッダー | 設定 |");
    lines.push("|----------|------|");
    for (const h of headers) lines.push(`| ${h.label} | ${h.ok ? "あり" : "なし"} |`);
  }

  if (report.detectedTech && report.detectedTech.length > 0) {
    lines.push("", "## 検出テクノロジー", "");
    lines.push(report.detectedTech.map((t) => `\`${t}\``).join("  "));
  }

  if (report.contentMetrics && report.contentMetrics.wordCount > 0) {
    lines.push("", "## コンテンツ分析", "");
    lines.push(`- 単語数: ${report.contentMetrics.wordCount.toLocaleString()}`);
    lines.push(`- 文字数: ${report.contentMetrics.charCount.toLocaleString()}`);
    lines.push(`- テキスト/HTML比率: ${report.contentMetrics.textToHtmlRatio}%`);
  }

  const failItems = report.results.filter((r) => r.status === "fail");
  const warnItems = report.results.filter((r) => r.status === "warn");
  if (failItems.length > 0 || warnItems.length > 0) {
    lines.push("", "## 改善アクション", "");
    for (const item of [...failItems, ...warnItems]) {
      lines.push(`- ${item.message}`);
    }
  }

  lines.push("", "---", `Generated by [AI Check](https://ai-check.ezoai.jp)`);
  return lines.join("\n");
}
