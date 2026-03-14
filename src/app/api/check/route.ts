import { NextRequest, NextResponse } from "next/server";
import type { CheckResult, CheckReport } from "@/lib/check-indicators";
import { getGrade } from "@/lib/check-indicators";
import { corsHeaders, corsOptionsResponse } from "@/lib/cors";
import {
  checkRateLimit,
  isPrivateHostname,
  RATE_LIMIT,
  safeFetch,
  detectRedirectChain,
  detectSslCertificate,
  detectHttpVersion,
  measureDnsResolution,
  checkRobotsTxt,
  checkLlmsTxt,
  checkStructuredData,
  checkMetaTags,
  checkContentStructure,
  checkSSR,
  checkSitemap,
  analyzeLinks,
  suggestSchemaTypes,
  detectTechnologies,
  checkOgImageAccessibility,
  analyzeAccessibility,
  analyzeSecurityHeaders,
  analyzeImages,
  analyzePerformance,
  analyzeCoreWebVitals,
  analyzePwaManifest,
  analyzeSocialMeta,
  analyzeContentMetrics,
  analyzeFeed,
  analyzeFavicon,
  analyzeOgPreview,
  analyzeHeadingTree,
  analyzeDuplicateMetaTags,
  analyzeCanonical,
  analyzeI18n,
  analyzeAiCrawlerStatus,
  analyzeCrawlDelay,
  analyzeExternalResources,
  analyzeJsonLdBlocks,
  analyzeAiContentPreview,
  analyzeLinkQuality,
  analyzeRichResultsEligibility,
  analyzeMetaRefresh,
} from "@/lib/check-engine";

export async function OPTIONS() {
  return corsOptionsResponse();
}

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json(
      { error: "urlクエリパラメータを指定してください。例: /api/check?url=https://example.com", errorCode: "MISSING_URL" },
      { status: 400, headers: corsHeaders() }
    );
  }
  const syntheticRequest = new NextRequest(request.url, {
    method: "POST",
    headers: request.headers,
    body: JSON.stringify({ url }),
  });
  return POST(syntheticRequest);
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const isBatchInternal = request.headers.get("x-batch-internal") === "1";

  // Skip rate limiting for internal batch calls (already rate-limited by batch endpoint)
  const rateLimit = isBatchInternal
    ? { allowed: true, remaining: RATE_LIMIT, resetAt: Date.now() + 60_000 }
    : checkRateLimit(ip);
  const rateLimitHeaders = {
    "X-RateLimit-Limit": String(RATE_LIMIT),
    "X-RateLimit-Remaining": String(rateLimit.remaining),
    "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetAt / 1000)),
  };
  try {
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "リクエスト数が上限を超えました。しばらく待ってから再度お試しください。", errorCode: "RATE_LIMITED" },
        { status: 429, headers: { ...corsHeaders(), ...rateLimitHeaders } }
      );
    }

    let body: { url?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "リクエストボディが不正です。JSON形式で送信してください。", errorCode: "INVALID_BODY" },
        { status: 400, headers: { ...corsHeaders(), ...rateLimitHeaders } }
      );
    }

    const { url } = body;

    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json({ error: "URLを入力してください。", errorCode: "MISSING_URL" }, { status: 400, headers: { ...corsHeaders(), ...rateLimitHeaders } });
    }

    if (url.length > 2048) {
      return NextResponse.json({ error: "URLが長すぎます。2048文字以内にしてください。", errorCode: "URL_TOO_LONG" }, { status: 400, headers: { ...corsHeaders(), ...rateLimitHeaders } });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "有効なURLを入力してください。", errorCode: "INVALID_URL" }, { status: 400, headers: { ...corsHeaders(), ...rateLimitHeaders } });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "http または https のURLを入力してください。", errorCode: "INVALID_PROTOCOL" }, { status: 400, headers: { ...corsHeaders(), ...rateLimitHeaders } });
    }

    if (isPrivateHostname(parsedUrl.hostname)) {
      return NextResponse.json({ error: "プライベートネットワークのURLはチェックできません。", errorCode: "SSRF_BLOCKED" }, { status: 400, headers: { ...corsHeaders(), ...rateLimitHeaders } });
    }

    const baseUrl = parsedUrl.origin;
    const startTime = Date.now();

    // Fetch all resources concurrently
    const [robotsRes, llmsRes, llmsFullRes, pageRes, sitemapRes, agentRes, manifestRes, redirectInfo, sslCertificate, httpVersion, dnsResolutionMs] = await Promise.all([
      safeFetch(`${baseUrl}/robots.txt`),
      safeFetch(`${baseUrl}/llms.txt`),
      safeFetch(`${baseUrl}/llms-full.txt`),
      safeFetch(url, 15000, true),
      safeFetch(`${baseUrl}/sitemap.xml`),
      safeFetch(`${baseUrl}/.well-known/agent.json`),
      safeFetch(`${baseUrl}/manifest.json`),
      detectRedirectChain(url),
      parsedUrl.protocol === "https:" ? detectSslCertificate(parsedUrl.hostname) : Promise.resolve(undefined),
      detectHttpVersion(url),
      measureDnsResolution(parsedUrl.hostname),
    ]);

    // If main page is unreachable, return a clear error
    if (!pageRes.ok && pageRes.text === "") {
      return NextResponse.json(
        { error: "対象サイトに接続できませんでした。URLが正しいか、サイトが稼働中かご確認ください。", errorCode: "SITE_UNREACHABLE" },
        { status: 422, headers: { ...corsHeaders(), ...rateLimitHeaders } }
      );
    }

    const robotsText = robotsRes.ok ? robotsRes.text : null;
    const llmsText = llmsRes.ok ? llmsRes.text : null;
    const hasLlmsFull = llmsFullRes.ok && llmsFullRes.text.length > 50;
    const html = pageRes.text;
    const sitemapText = sitemapRes.ok ? sitemapRes.text : null;

    // Run 7 indicator checks
    const llmsResult = checkLlmsTxt(llmsText, parsedUrl.hostname, baseUrl);
    if (hasLlmsFull) {
      llmsResult.details += " llms-full.txt（詳細版）も検出されました。";
    }

    const structuredDataResult = checkStructuredData(html, baseUrl);
    if (agentRes.ok && agentRes.text.length > 10) {
      try {
        JSON.parse(agentRes.text);
        structuredDataResult.details += " agent.json（A2A Agent Card）も検出されました。";
        if (structuredDataResult.score < structuredDataResult.maxScore) {
          structuredDataResult.score = Math.min(structuredDataResult.score + 5, structuredDataResult.maxScore);
        }
      } catch {
        // invalid JSON, ignore
      }
    }

    const responseHdrs = pageRes.headers ?? {};
    const { contentLanguage, hreflangTags } = analyzeI18n(html, responseHdrs);

    const metaResult = checkMetaTags(html, pageRes.headers);
    const i18nParts: string[] = [];
    if (contentLanguage) i18nParts.push(`Content-Language: ${contentLanguage}`);
    if (hreflangTags.length > 0) i18nParts.push(`hreflang: ${hreflangTags.join(", ")}`);
    if (i18nParts.length > 0) {
      metaResult.details += ` 多言語対応: ${i18nParts.join("、")}。`;
    }

    const results: CheckResult[] = [
      checkRobotsTxt(robotsText, baseUrl),
      llmsResult,
      structuredDataResult,
      metaResult,
      checkContentStructure(html),
      checkSSR(html),
      checkSitemap(sitemapText, baseUrl),
    ];

    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const maxScore = results.reduce((sum, r) => sum + r.maxScore, 0);
    const responseTimeMs = Date.now() - startTime;

    // Extract preview data
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i);
    let faviconUrl = faviconMatch?.[1];
    if (faviconUrl) {
      if (/^(javascript|data|vbscript):/i.test(faviconUrl)) {
        faviconUrl = undefined;
      } else if (!faviconUrl.startsWith("http")) {
        faviconUrl = faviconUrl.startsWith("/") ? `${baseUrl}${faviconUrl}` : `${baseUrl}/${faviconUrl}`;
      }
    }

    const htmlSizeKB = Math.round((new TextEncoder().encode(html).length) / 1024);
    const isHttps = parsedUrl.protocol === "https:";

    // Run supplementary analyses
    const { internalLinkCount, externalLinkCount } = analyzeLinks(html, baseUrl);
    const suggestedSchemas = suggestSchemaTypes(html);
    const detectedTech = detectTechnologies(html, responseHdrs);
    const ogImageAccessible = await checkOgImageAccessibility(ogImageMatch?.[1], baseUrl);
    const accessibility = analyzeAccessibility(html);
    const securityHeaders = analyzeSecurityHeaders(responseHdrs);
    const { imgCount, imgTags, imageOptimization } = analyzeImages(html);
    const perfData = analyzePerformance(html, imgCount);
    const coreWebVitals = analyzeCoreWebVitals(html, imgTags, perfData.scriptTags, perfData.hasFontDisplay);
    const pwaManifest = await analyzePwaManifest(html, baseUrl, manifestRes);
    const socialMeta = analyzeSocialMeta(html);
    const contentMetrics = analyzeContentMetrics(html);
    const feedDetection = analyzeFeed(html, baseUrl);
    const faviconAnalysis = analyzeFavicon(html, pwaManifest);
    const ogPreview = analyzeOgPreview(html);
    const headingTree = analyzeHeadingTree(html);
    const duplicateMetaTags = analyzeDuplicateMetaTags(html);
    const { canonicalUrl, canonicalMismatch } = analyzeCanonical(html, url);
    const aiCrawlerStatus = analyzeAiCrawlerStatus(robotsRes.ok ? robotsRes.text : null);
    const crawlDelay = analyzeCrawlDelay(robotsRes.ok ? robotsRes.text : null);
    const externalResourceCount = analyzeExternalResources(html, baseUrl);
    const jsonLdBlocks = analyzeJsonLdBlocks(html);
    const aiContentPreview = analyzeAiContentPreview(html);
    const linkQuality = analyzeLinkQuality(html);
    const richResultsEligibility = analyzeRichResultsEligibility(jsonLdBlocks.types);
    const metaRefresh = analyzeMetaRefresh(html);

    const report: CheckReport = {
      url,
      totalScore,
      maxScore,
      grade: getGrade(totalScore, maxScore),
      results,
      checkedAt: new Date().toISOString(),
      responseTimeMs,
      ogImage: ogImageMatch?.[1] || undefined,
      siteTitle: titleMatch?.[1]?.trim() || undefined,
      favicon: faviconUrl || `${baseUrl}/favicon.ico`,
      htmlSizeKB,
      isHttps,
      internalLinkCount,
      externalLinkCount,
      suggestedSchemas,
      accessibility,
      securityHeaders,
      performanceHints: {
        preconnectCount: perfData.preconnectCount,
        prefetchCount: perfData.prefetchCount,
        lazyImageCount: perfData.lazyImageCount,
        totalImageCount: perfData.totalImageCount,
        hasFontDisplay: perfData.hasFontDisplay,
        hasModuleScripts: perfData.hasModuleScripts,
        deferScriptCount: perfData.deferScriptCount,
        asyncScriptCount: perfData.asyncScriptCount,
        totalScriptCount: perfData.totalScriptCount,
      },
      imageOptimization,
      contentLanguage: contentLanguage || undefined,
      hreflangTags: hreflangTags.length > 0 ? hreflangTags : undefined,
      detectedTech: detectedTech.length > 0 ? detectedTech : undefined,
      ogImageAccessible,
      pwaManifest,
      socialMeta,
      redirectChain: redirectInfo.hops > 0 ? redirectInfo : undefined,
      canonicalUrl: canonicalUrl || undefined,
      canonicalMismatch: canonicalMismatch || undefined,
      contentEncoding: responseHdrs["content-encoding"] || undefined,
      serverHeader: responseHdrs["server"] || undefined,
      httpVersion: httpVersion || undefined,
      sslCertificate: sslCertificate || undefined,
      coreWebVitals,
      contentMetrics,
      feedDetection,
      faviconAnalysis,
      ogPreview,
      headingTree,
      duplicateMetaTags,
      dnsResolutionMs: dnsResolutionMs ?? undefined,
      aiCrawlerStatus,
      externalResourceCount: externalResourceCount.totalExternal > 0 ? {
        externalCss: externalResourceCount.externalCss,
        externalJs: externalResourceCount.externalJs,
        totalExternal: externalResourceCount.totalExternal,
        thirdPartyDomains: externalResourceCount.thirdPartyDomains.length > 0 ? externalResourceCount.thirdPartyDomains : undefined,
      } : undefined,
      jsonLdBlocks: jsonLdBlocks.blockCount > 0 ? jsonLdBlocks : undefined,
      aiContentPreview: aiContentPreview.excerpt.length > 0 ? aiContentPreview : undefined,
      linkQuality,
      richResultsEligibility,
      crawlDelay,
      metaRefresh,
    };

    return NextResponse.json(report, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        ...corsHeaders(),
        ...rateLimitHeaders,
      },
    });
  } catch (e) {
    console.error("Check API error:", e);
    return NextResponse.json(
      { error: "チェック中にエラーが発生しました。", errorCode: "INTERNAL_ERROR" },
      { status: 500, headers: { ...corsHeaders(), ...rateLimitHeaders } }
    );
  }
}
