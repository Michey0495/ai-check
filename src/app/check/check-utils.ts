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

  if (report.crawlDelay) {
    lines.push("");
    lines.push("--- Crawl-delay ---");
    if (report.crawlDelay.hasGlobal) {
      lines.push(`全体: ${report.crawlDelay.globalValue}秒`);
    }
    for (const d of report.crawlDelay.aiCrawlerDelays) {
      lines.push(`${d.name}: ${d.value}秒`);
    }
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

  if (report.aiContentPreview && report.aiContentPreview.excerpt.length > 0) {
    lines.push("");
    lines.push("--- AIが見るコンテンツ ---");
    lines.push(`読了時間: 約${report.aiContentPreview.estimatedReadingTimeMin}分`);
    if (report.aiContentPreview.mainTopics.length > 0) {
      lines.push(`主要トピック: ${report.aiContentPreview.mainTopics.join("、")}`);
    }
    lines.push(`プレビュー: ${report.aiContentPreview.excerpt.slice(0, 200)}...`);
  }

  if (report.linkQuality) {
    const total = report.linkQuality.followCount + report.linkQuality.nofollowCount;
    lines.push("");
    lines.push("--- リンク品質 ---");
    lines.push(`follow: ${report.linkQuality.followCount}件 / nofollow: ${report.linkQuality.nofollowCount}件 (合計: ${total}件)`);
    if (report.linkQuality.sponsoredCount > 0) lines.push(`sponsored: ${report.linkQuality.sponsoredCount}件`);
    if (report.linkQuality.ugcCount > 0) lines.push(`ugc: ${report.linkQuality.ugcCount}件`);
  }

  if (report.richResultsEligibility && report.richResultsEligibility.length > 0) {
    lines.push("");
    lines.push("--- リッチリザルト適格性 ---");
    for (const r of report.richResultsEligibility) {
      lines.push(`${r.type}: ${r.eligible}`);
    }
  }

  if (report.metaRefresh) {
    lines.push("");
    lines.push("--- meta refreshリダイレクト ---");
    lines.push(`遅延: ${report.metaRefresh.delay}秒`);
    if (report.metaRefresh.url) lines.push(`リダイレクト先: ${report.metaRefresh.url}`);
    lines.push("⚠ AIクローラーがmeta refreshを正しく処理できない場合があります。301リダイレクトを推奨。");
  }

  if (report.snippetControl) {
    lines.push("");
    lines.push("--- スニペット制御 ---");
    const sc = report.snippetControl;
    if (sc.maxSnippet !== undefined) lines.push(`max-snippet: ${sc.maxSnippet === -1 ? "無制限" : sc.maxSnippet === 0 ? "スニペット無効" : `${sc.maxSnippet}文字`}`);
    if (sc.maxImagePreview !== undefined) lines.push(`max-image-preview: ${sc.maxImagePreview}`);
    if (sc.maxVideoPreview !== undefined) lines.push(`max-video-preview: ${sc.maxVideoPreview === -1 ? "無制限" : sc.maxVideoPreview === 0 ? "プレビュー無効" : `${sc.maxVideoPreview}秒`}`);
  }
  if (report.openSearch) {
    lines.push("");
    lines.push(`OpenSearch: ${report.openSearch} (検出)`);
  }

  if (report.aiProtocolFiles) {
    lines.push("");
    lines.push("--- Well-Known ファイル ---");
    const ap = report.aiProtocolFiles;
    lines.push(`agent.json (A2A): ${ap.hasAgentJson ? "検出" : "未検出"}${ap.agentJsonVersion ? ` (v${ap.agentJsonVersion})` : ""}`);
    lines.push(`ai-plugin.json (ChatGPT): ${ap.hasAiPlugin ? "検出" : "未検出"}${ap.aiPluginName ? ` (${ap.aiPluginName})` : ""}`);
    lines.push(`security.txt (RFC 9116): ${ap.hasSecurityTxt ? "検出" : "未検出"}${ap.securityTxtContact ? ` (${ap.securityTxtContact})` : ""}`);
    lines.push(`humans.txt: ${ap.hasHumansTxt ? "検出" : "未検出"}`);
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

  if (report.redirectChain) {
    lines.push("", "## リダイレクト", "");
    lines.push(`- リダイレクト回数: ${report.redirectChain.hops}回`);
    if (report.redirectChain.statusCodes?.length) {
      lines.push(`- ステータスコード: ${report.redirectChain.statusCodes.map((c) => `${c} (${c === 301 ? "恒久" : c === 302 ? "一時" : c === 307 ? "一時" : c === 308 ? "恒久" : ""})`).join(" → ")}`);
    }
    lines.push(`- 最終URL: ${report.redirectChain.finalUrl}`);
    if (report.redirectChain.hasHttpToHttps) lines.push("- HTTP→HTTPSリダイレクト: あり");
    if (report.redirectChain.hasWwwRedirect) lines.push("- wwwリダイレクト: あり");
  }

  if (report.canonicalUrl) {
    lines.push("", "## canonical URL", "");
    lines.push(`- canonical: ${report.canonicalUrl}`);
    if (report.canonicalMismatch) lines.push("- **警告**: canonical URLとアクセスURLが一致しません");
  }

  if (report.contentEncoding || report.serverHeader || report.httpVersion) {
    lines.push("", "## サーバー情報", "");
    if (report.httpVersion) lines.push(`- HTTPプロトコル: ${report.httpVersion}`);
    if (report.contentEncoding) lines.push(`- コンテンツ圧縮: ${report.contentEncoding}`);
    if (report.serverHeader) lines.push(`- Server: ${report.serverHeader}`);
  }

  if (report.sslCertificate) {
    lines.push("", "## SSL/TLS証明書", "");
    lines.push(`- 発行元: ${report.sslCertificate.issuer}`);
    lines.push(`- プロトコル: ${report.sslCertificate.protocol}`);
    lines.push(`- 有効期限: ${new Date(report.sslCertificate.validTo).toLocaleDateString("ja-JP")}`);
    lines.push(`- 残り日数: ${report.sslCertificate.daysRemaining}日`);
    if (report.sslCertificate.daysRemaining < 30) lines.push("- **警告**: 証明書の有効期限が30日以内です");
  }

  if (report.crawlDelay) {
    lines.push("", "## Crawl-delay", "");
    if (report.crawlDelay.hasGlobal) lines.push(`- 全体: ${report.crawlDelay.globalValue}秒`);
    for (const d of report.crawlDelay.aiCrawlerDelays) {
      lines.push(`- ${d.name}: ${d.value}秒`);
    }
  }

  if (report.performanceHints) {
    const p = report.performanceHints;
    lines.push("", "## パフォーマンスヒント", "");
    if (p.preconnectCount > 0) lines.push(`- preconnect: ${p.preconnectCount}件`);
    if (p.prefetchCount > 0) lines.push(`- prefetch/preload: ${p.prefetchCount}件`);
    lines.push(`- 画像の遅延読み込み: ${p.lazyImageCount}/${p.totalImageCount}枚`);
    lines.push(`- スクリプト: ${p.totalScriptCount}件（defer: ${p.deferScriptCount}, async: ${p.asyncScriptCount}）`);
  }

  if (report.coreWebVitals) {
    const c = report.coreWebVitals;
    lines.push("", "## Core Web Vitals ヒント", "");
    lines.push(`- レンダーブロッキングリソース: ${c.renderBlockingCount}件`);
    if (c.lcpCandidate) lines.push(`- LCP候補: ${c.lcpCandidate}`);
    lines.push(`- fetchpriority=high: ${c.hasFetchPriority ? "設定済み" : "未設定"}`);
    lines.push(`- インラインCSS: ${c.inlineCssSize < 1024 ? `${c.inlineCssSize}B` : `${Math.round(c.inlineCssSize / 1024)}KB`}`);
    if (c.clsRiskFactors.length > 0) lines.push(`- CLSリスク要因: ${c.clsRiskFactors.join("、")}`);
  }

  if (report.imageOptimization) {
    const img = report.imageOptimization;
    lines.push("", "## 画像最適化", "");
    lines.push(`- 画像数: ${img.totalImages}枚`);
    lines.push(`- 次世代フォーマット使用率: ${img.modernFormatRatio}%`);
    if (img.webpCount > 0) lines.push(`- WebP: ${img.webpCount}枚`);
    if (img.avifCount > 0) lines.push(`- AVIF: ${img.avifCount}枚`);
    if (img.srcsetCount > 0) lines.push(`- srcset（レスポンシブ画像）: ${img.srcsetCount}枚`);
    if (img.pictureElementCount > 0) lines.push(`- picture要素: ${img.pictureElementCount}件`);
  }

  if (report.pwaManifest?.exists) {
    lines.push("", "## PWA対応", "");
    lines.push(`- 名前: ${report.pwaManifest.hasName ? "設定済み" : "未設定"}`);
    lines.push(`- アイコン: ${report.pwaManifest.hasIcons ? "設定済み" : "未設定"}`);
    lines.push(`- start_url: ${report.pwaManifest.hasStartUrl ? "設定済み" : "未設定"}`);
    lines.push(`- display: ${report.pwaManifest.hasDisplay ? "設定済み" : "未設定"}`);
    lines.push(`- テーマカラー: ${report.pwaManifest.hasThemeColor ? "設定済み" : "未設定"}`);
  }

  if (report.ogPreview) {
    lines.push("", "## OGプレビュー", "");
    if (report.ogPreview.ogTitle) lines.push(`- og:title: ${report.ogPreview.ogTitle}`);
    if (report.ogPreview.ogDescription) lines.push(`- og:description: ${report.ogPreview.ogDescription}`);
    if (report.ogPreview.ogUrl) lines.push(`- og:url: ${report.ogPreview.ogUrl}`);
    if (report.ogImage) lines.push(`- og:image: ${report.ogImage}`);
    if (report.ogImageAccessible !== undefined) lines.push(`- OG画像アクセス: ${report.ogImageAccessible ? "OK" : "アクセス不可"}`);
  }

  if (report.headingTree && report.headingTree.length > 0) {
    lines.push("", "## 見出し構造", "");
    for (const h of report.headingTree.slice(0, 15)) {
      lines.push(`${"  ".repeat(h.level - 1)}- h${h.level}: ${h.text}`);
    }
    if (report.headingTree.length > 15) lines.push(`- ... 他${report.headingTree.length - 15}件`);
  }

  if (report.duplicateMetaTags && report.duplicateMetaTags.length > 0) {
    lines.push("", "## 重複メタタグ警告", "");
    for (const d of report.duplicateMetaTags) {
      lines.push(`- **${d.tag}**: ${d.count}個検出（推奨: 1個）`);
    }
  }

  if (report.faviconAnalysis) {
    lines.push("", "## ファビコン分析", "");
    lines.push(`- favicon: ${report.faviconAnalysis.hasFavicon ? "あり" : "なし"}`);
    lines.push(`- apple-touch-icon: ${report.faviconAnalysis.hasAppleTouchIcon ? "あり" : "なし"}`);
    lines.push(`- SVGアイコン: ${report.faviconAnalysis.hasSvgIcon ? "あり" : "なし"}`);
    if (report.faviconAnalysis.sizes.length > 0) lines.push(`- サイズ: ${report.faviconAnalysis.sizes.join(", ")}`);
    lines.push(`- manifest icons: ${report.faviconAnalysis.hasWebManifestIcons ? "あり" : "なし"}`);
  }

  if (report.feedDetection) {
    lines.push("", "## フィード検出", "");
    if (report.feedDetection.hasRss) lines.push("- RSS: あり");
    if (report.feedDetection.hasAtom) lines.push("- Atom: あり");
    if (report.feedDetection.feedUrls.length > 0) {
      report.feedDetection.feedUrls.forEach((u) => lines.push(`  - ${u}`));
    }
  }

  if (report.socialMeta) {
    const parts: string[] = [];
    if (report.socialMeta.ogSiteName) parts.push(`og:site_name: ${report.socialMeta.ogSiteName}`);
    if (report.socialMeta.twitterSite) parts.push(`twitter:site: ${report.socialMeta.twitterSite}`);
    if (report.socialMeta.fbAppId) parts.push(`fb:app_id: ${report.socialMeta.fbAppId}`);
    if (parts.length > 0) {
      lines.push("", "## ソーシャルメタ", "");
      parts.forEach((p) => lines.push(`- ${p}`));
    }
  }

  if (report.externalResourceCount) {
    lines.push("", "## 外部リソース", "");
    lines.push(`- 外部CSS: ${report.externalResourceCount.externalCss}件`);
    lines.push(`- 外部JS: ${report.externalResourceCount.externalJs}件`);
    if (report.externalResourceCount.thirdPartyDomains && report.externalResourceCount.thirdPartyDomains.length > 0) {
      lines.push(`- 外部ドメイン: ${report.externalResourceCount.thirdPartyDomains.join(", ")}`);
    }
  }

  if (report.jsonLdBlocks && report.jsonLdBlocks.blockCount > 0) {
    lines.push("", "## JSON-LDブロック", "");
    lines.push(`- ブロック数: ${report.jsonLdBlocks.blockCount}`);
    if (report.jsonLdBlocks.types.length > 0) {
      lines.push(`- スキーマタイプ: ${report.jsonLdBlocks.types.join(", ")}`);
    }
  }

  if (report.aiContentPreview && report.aiContentPreview.excerpt.length > 0) {
    lines.push("", "## AIが見るコンテンツ", "");
    lines.push(`- 読了時間: 約${report.aiContentPreview.estimatedReadingTimeMin}分`);
    if (report.aiContentPreview.mainTopics.length > 0) {
      lines.push(`- 主要トピック: ${report.aiContentPreview.mainTopics.join("、")}`);
    }
  }

  if (report.linkQuality) {
    const total = report.linkQuality.followCount + report.linkQuality.nofollowCount;
    lines.push("", "## リンク品質", "");
    lines.push(`- follow: ${report.linkQuality.followCount}件 / nofollow: ${report.linkQuality.nofollowCount}件 (合計: ${total}件)`);
    if (report.linkQuality.sponsoredCount > 0) lines.push(`- sponsored: ${report.linkQuality.sponsoredCount}件`);
    if (report.linkQuality.ugcCount > 0) lines.push(`- ugc: ${report.linkQuality.ugcCount}件`);
  }

  if (report.richResultsEligibility && report.richResultsEligibility.length > 0) {
    lines.push("", "## リッチリザルト適格性", "");
    for (const r of report.richResultsEligibility) {
      lines.push(`- **${r.type}**: ${r.eligible}`);
    }
  }

  if (report.metaRefresh) {
    lines.push("", "## meta refreshリダイレクト", "");
    lines.push(`- **警告**: meta http-equiv="refresh" が検出されました（${report.metaRefresh.delay}秒後に ${report.metaRefresh.url || "同ページ"}）`);
    lines.push("- AIクローラーがmeta refreshを正しく処理できない場合があります。サーバーサイドの301リダイレクトを推奨します。");
  }

  if (report.snippetControl) {
    lines.push("", "## スニペット制御", "");
    const sc = report.snippetControl;
    if (sc.maxSnippet !== undefined) lines.push(`- **max-snippet**: ${sc.maxSnippet === -1 ? "無制限" : sc.maxSnippet === 0 ? "スニペット無効" : `${sc.maxSnippet}文字`}`);
    if (sc.maxImagePreview !== undefined) lines.push(`- **max-image-preview**: ${sc.maxImagePreview}`);
    if (sc.maxVideoPreview !== undefined) lines.push(`- **max-video-preview**: ${sc.maxVideoPreview === -1 ? "無制限" : sc.maxVideoPreview === 0 ? "プレビュー無効" : `${sc.maxVideoPreview}秒`}`);
  }
  if (report.openSearch) {
    lines.push("", "## OpenSearch", "");
    lines.push(`- OpenSearch記述ファイル検出: **${report.openSearch}**`);
  }

  if (report.aiProtocolFiles) {
    lines.push("", "## Well-Known ファイル", "");
    const ap = report.aiProtocolFiles;
    lines.push(`- **agent.json (A2A Agent Card)**: ${ap.hasAgentJson ? "検出" : "未検出"}${ap.agentJsonVersion ? ` (v${ap.agentJsonVersion})` : ""}`);
    lines.push(`- **ai-plugin.json (ChatGPTプラグイン)**: ${ap.hasAiPlugin ? "検出" : "未検出"}${ap.aiPluginName ? ` (${ap.aiPluginName})` : ""}`);
    if (ap.hasAiPlugin && ap.aiPluginDescription) {
      lines.push(`  - ${ap.aiPluginDescription.slice(0, 200)}`);
    }
    lines.push(`- **security.txt (RFC 9116)**: ${ap.hasSecurityTxt ? "検出" : "未検出"}${ap.securityTxtContact ? ` (連絡先: ${ap.securityTxtContact})` : ""}`);
    lines.push(`- **humans.txt**: ${ap.hasHumansTxt ? "検出" : "未検出"}`);
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
