// Supplementary analysis functions for check reports

import type { CheckReport } from "@/lib/check-indicators";
import { isPrivateHostname } from "./security";
import { safeFetch, type FetchResult } from "./network";

export function analyzeLinks(html: string, baseUrl: string) {
  const linkHrefs = html.match(/<a[^>]*href=["']([^"'#]+)["']/gi) ?? [];
  let internalLinkCount = 0;
  let externalLinkCount = 0;
  for (const link of linkHrefs) {
    const hrefMatch = link.match(/href=["']([^"'#]+)["']/i);
    if (!hrefMatch) continue;
    const href = hrefMatch[1];
    if (href.startsWith("/") || href.startsWith(baseUrl)) {
      internalLinkCount++;
    } else if (href.startsWith("http")) {
      externalLinkCount++;
    }
  }
  return { internalLinkCount, externalLinkCount };
}

export function suggestSchemaTypes(html: string): string[] {
  const suggested: string[] = [];
  const lowerHtml = html.toLowerCase();
  if (lowerHtml.includes("cart") || lowerHtml.includes("add to cart") || lowerHtml.includes("price") || lowerHtml.includes("カート") || lowerHtml.includes("価格")) {
    suggested.push("Product");
  }
  if (lowerHtml.includes("<article") || lowerHtml.includes("published") || lowerHtml.includes("投稿日") || lowerHtml.includes("公開日")) {
    suggested.push("Article");
  }
  if (/<h[2-3][^>]*>.*(?:faq|よくある質問|q&a)/i.test(html)) {
    suggested.push("FAQPage");
  }
  if (lowerHtml.includes("recipe") || lowerHtml.includes("レシピ") || lowerHtml.includes("材料")) {
    suggested.push("Recipe");
  }
  if (lowerHtml.includes("event") || lowerHtml.includes("イベント") || lowerHtml.includes("開催日")) {
    suggested.push("Event");
  }
  if (lowerHtml.includes("course") || lowerHtml.includes("コース") || lowerHtml.includes("受講")) {
    suggested.push("Course");
  }
  if (suggested.length === 0) {
    suggested.push("WebSite");
  }
  return suggested;
}

export function detectTechnologies(html: string, responseHdrs: Record<string, string>): string[] {
  const tech: string[] = [];
  if (responseHdrs["x-powered-by"]?.toLowerCase().includes("next.js") || html.includes("__next") || html.includes("_next/static")) {
    tech.push("Next.js");
  }
  if (responseHdrs["x-powered-by"]?.toLowerCase().includes("express")) {
    tech.push("Express");
  }
  if (html.includes("wp-content") || html.includes("wp-includes") || responseHdrs["x-powered-by"]?.toLowerCase().includes("wordpress") || html.includes('name="generator" content="WordPress')) {
    tech.push("WordPress");
  }
  if (html.includes("Shopify.theme") || html.includes("cdn.shopify.com")) {
    tech.push("Shopify");
  }
  if (html.includes("__nuxt") || html.includes("/_nuxt/")) {
    tech.push("Nuxt.js");
  }
  if (html.includes("__gatsby") || html.includes("/static/") && html.includes("gatsby")) {
    tech.push("Gatsby");
  }
  if (html.includes("__remixContext") || html.includes("remix")) {
    if (html.includes("__remixContext")) tech.push("Remix");
  }
  if (html.includes("data-reactroot") || html.includes("__REACT") || html.includes("react-root")) {
    if (!tech.some(t => ["Next.js", "Gatsby", "Remix"].includes(t))) {
      tech.push("React");
    }
  }
  if (html.includes("ng-version") || html.includes("ng-app")) {
    tech.push("Angular");
  }
  if (html.includes("data-v-") || html.includes("__vue")) {
    if (!tech.includes("Nuxt.js")) tech.push("Vue.js");
  }
  if (html.includes("data-svelte") || html.includes("__sveltekit")) {
    tech.push("SvelteKit");
  } else if (html.includes("svelte") && html.includes(".svelte-")) {
    tech.push("Svelte");
  }
  if (html.includes("data-turbo") || html.includes("turbolinks")) {
    tech.push("Ruby on Rails");
  }
  if (html.includes('content="Hugo')) {
    tech.push("Hugo");
  }
  if (html.includes("data-astro-") || html.includes("astro-island") || html.includes("/_astro/")) {
    tech.push("Astro");
  }
  if (html.includes("_qwik") || html.includes("qwikloader")) {
    tech.push("Qwik");
  }
  if (html.includes("solidjs") || html.includes("_$") && html.includes("solid")) {
    tech.push("SolidJS");
  }
  if (html.includes('content="Ghost') || html.includes("ghost-") && html.includes("ghost.org")) {
    tech.push("Ghost");
  }
  if (html.includes("cdn.contentful.com") || html.includes("contentful")) {
    tech.push("Contentful");
  }
  if (html.includes("strapi") || responseHdrs["x-powered-by"]?.toLowerCase().includes("strapi")) {
    tech.push("Strapi");
  }
  if (html.includes('content="Jekyll')) {
    tech.push("Jekyll");
  }
  if (html.includes("webflow.com") || html.includes("wf-page")) {
    tech.push("Webflow");
  }
  if (html.includes("wix.com") || html.includes("wixsite")) {
    tech.push("Wix");
  }
  if (html.includes("squarespace.com") || html.includes("squarespace-cdn")) {
    tech.push("Squarespace");
  }
  if (html.includes("googletagmanager.com") || html.includes("google-analytics.com") || html.includes("gtag")) {
    tech.push("Google Analytics");
  }
  if (html.includes("clarity.ms")) {
    tech.push("Microsoft Clarity");
  }
  if (html.includes("hotjar.com") || html.includes("_hjSettings")) {
    tech.push("Hotjar");
  }
  if (html.includes("plausible.io")) {
    tech.push("Plausible Analytics");
  }
  return tech;
}

export async function checkOgImageAccessibility(ogImageUrl: string | undefined, baseUrl: string): Promise<boolean | undefined> {
  if (!ogImageUrl) return undefined;
  try {
    const ogUrl = ogImageUrl.startsWith("http") ? ogImageUrl : `${baseUrl}${ogImageUrl.startsWith("/") ? "" : "/"}${ogImageUrl}`;
    const ogParsed = new URL(ogUrl);
    if (isPrivateHostname(ogParsed.hostname)) return undefined;
    const ogRes = await fetch(ogUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
      redirect: "follow",
      headers: { "User-Agent": "AI-Check-Bot/1.0" },
    }).catch(() => null);
    return ogRes?.ok ?? false;
  } catch {
    return false;
  }
}

export function analyzeAccessibility(html: string) {
  const imgTags = html.match(/<img[^>]*>/gi) ?? [];
  const imgCount = imgTags.length;
  const imgWithAlt = imgTags.filter((tag) => /\balt=["'][^"']*["']/i.test(tag)).length;
  const hasSkipNav = /skip.*nav|skip.*content|skiplink/i.test(html);
  const ariaLandmarks = (html.match(/role=["'](banner|navigation|main|contentinfo|complementary|search)["']/gi) ?? []).length;
  const hasAriaLabels = /aria-label=/i.test(html);
  return { imgCount, imgWithAlt, hasSkipNav, ariaLandmarks, hasAriaLabels };
}

export function analyzeSecurityHeaders(responseHdrs: Record<string, string>): CheckReport["securityHeaders"] {
  const hasHsts = !!responseHdrs["strict-transport-security"];
  const hasCsp = !!responseHdrs["content-security-policy"] || !!responseHdrs["content-security-policy-report-only"];
  const hasXFrameOptions = !!responseHdrs["x-frame-options"];
  const hasXContentTypeOptions = responseHdrs["x-content-type-options"]?.includes("nosniff") ?? false;
  const hasReferrerPolicy = !!responseHdrs["referrer-policy"];
  const hasPermissionsPolicy = !!responseHdrs["permissions-policy"];
  const hasCrossOriginOpenerPolicy = !!responseHdrs["cross-origin-opener-policy"];
  const hasCrossOriginResourcePolicy = !!responseHdrs["cross-origin-resource-policy"];
  const score = [hasHsts, hasCsp, hasXFrameOptions, hasXContentTypeOptions, hasReferrerPolicy, hasPermissionsPolicy, hasCrossOriginOpenerPolicy, hasCrossOriginResourcePolicy].filter(Boolean).length;
  return { hasHsts, hasCsp, hasXFrameOptions, hasXContentTypeOptions, hasReferrerPolicy, hasPermissionsPolicy, hasCrossOriginOpenerPolicy, hasCrossOriginResourcePolicy, score };
}

export function analyzeImages(html: string) {
  const imgTags = html.match(/<img[^>]*>/gi) ?? [];
  const imgCount = imgTags.length;
  const imgSrcs = imgTags.map((tag) => {
    const srcMatch = tag.match(/\bsrc=["']([^"']+)["']/i);
    return srcMatch?.[1] ?? "";
  }).filter(Boolean);
  const srcsetSrcs = imgTags.flatMap((tag) => {
    const srcsetMatch = tag.match(/\bsrcset=["']([^"']+)["']/i);
    return srcsetMatch ? srcsetMatch[1].split(",").map((s) => s.trim().split(/\s+/)[0]) : [];
  });
  const allImageSrcs = [...imgSrcs, ...srcsetSrcs];
  const sourceSrcs = (html.match(/<source[^>]*(?:srcset|src)=["']([^"']+)["']/gi) ?? []).flatMap((tag) => {
    const m = tag.match(/(?:srcset|src)=["']([^"']+)["']/i);
    return m ? m[1].split(",").map((s) => s.trim().split(/\s+/)[0]) : [];
  });
  const allSrcsForFormat = [...allImageSrcs, ...sourceSrcs];
  const webpCount = allSrcsForFormat.filter((s) => /\.webp(\?|$)/i.test(s) || /image\/webp/i.test(s)).length;
  const avifCount = allSrcsForFormat.filter((s) => /\.avif(\?|$)/i.test(s) || /image\/avif/i.test(s)).length;
  const pictureElementCount = (html.match(/<picture[\s>]/gi) ?? []).length;
  const srcsetCount = imgTags.filter((tag) => /\bsrcset=/i.test(tag)).length;

  return {
    imgCount,
    imgTags,
    allImageSrcs,
    imageOptimization: imgCount > 0 ? {
      totalImages: imgCount,
      webpCount,
      avifCount,
      pictureElementCount,
      srcsetCount,
      modernFormatRatio: allImageSrcs.length > 0 ? Math.round(((webpCount + avifCount) / allImageSrcs.length) * 100) : 0,
    } : undefined,
  };
}

export function analyzePerformance(html: string, imgCount: number) {
  const preconnectCount = (html.match(/<link[^>]*rel=["']preconnect["']/gi) ?? []).length;
  const prefetchCount = (html.match(/<link[^>]*rel=["'](?:dns-prefetch|prefetch|preload)["']/gi) ?? []).length;
  const lazyImageCount = (html.match(/<img[^>]*loading=["']lazy["']/gi) ?? []).length;
  const hasFontDisplay = /font-display\s*:/i.test(html);
  const scriptTags = html.match(/<script[^>]*>/gi) ?? [];
  const totalScriptCount = scriptTags.filter((s) => !s.includes("application/ld+json") && !s.includes("application/json")).length;
  const deferScriptCount = scriptTags.filter((s) => /\bdefer\b/i.test(s)).length;
  const asyncScriptCount = scriptTags.filter((s) => /\basync\b/i.test(s)).length;
  const hasModuleScripts = scriptTags.some((s) => /type=["']module["']/i.test(s));

  return {
    preconnectCount,
    prefetchCount,
    lazyImageCount,
    totalImageCount: imgCount,
    hasFontDisplay,
    hasModuleScripts,
    deferScriptCount,
    asyncScriptCount,
    totalScriptCount,
    scriptTags,
  };
}

export function analyzeCoreWebVitals(html: string, imgTags: string[], scriptTags: string[], hasFontDisplay: boolean) {
  const heroImgMatch = html.match(/<(?:img|video|source)[^>]*(?:src|srcset)=["']([^"']+)["'][^>]*>/i);
  const lcpCandidate = heroImgMatch
    ? (heroImgMatch[0].startsWith("<video") ? "video" : "img")
    : (/<h1[^>]*>/i.test(html) ? "h1" : undefined);

  const imgsWithoutDimensions = imgTags.filter((tag) => {
    const hasWidth = /\bwidth\s*=\s*["']?\d/i.test(tag);
    const hasHeight = /\bheight\s*=\s*["']?\d/i.test(tag);
    return !hasWidth || !hasHeight;
  }).length;

  const clsRiskFactors: string[] = [];
  if (imgsWithoutDimensions > 0) {
    clsRiskFactors.push(`width/height未指定の画像: ${imgsWithoutDimensions}枚`);
  }
  const iframeTags = html.match(/<iframe[^>]*>/gi) ?? [];
  const iframesWithoutDimensions = iframeTags.filter((tag) => {
    return !(/\bwidth\s*=\s*["']?\d/i.test(tag) && /\bheight\s*=\s*["']?\d/i.test(tag));
  }).length;
  if (iframesWithoutDimensions > 0) {
    clsRiskFactors.push(`width/height未指定のiframe: ${iframesWithoutDimensions}件`);
  }
  if (html.includes("googlesyndication") || html.includes("adsbygoogle")) {
    clsRiskFactors.push("広告スクリプト検出（レイアウトシフトの原因になりやすい）");
  }
  const fontFacesCount = (html.match(/@font-face/gi) ?? []).length;
  if (fontFacesCount > 0 && !hasFontDisplay) {
    clsRiskFactors.push(`@font-faceにfont-display未設定（${fontFacesCount}件）`);
  }

  const renderBlockingCss = (html.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) ?? [])
    .filter((tag) => !/\bmedia=["']print["']/i.test(tag) && !/\bmedia=["']not all["']/i.test(tag));
  const renderBlockingJs = scriptTags
    .filter((s) => !s.includes("application/ld+json") && !s.includes("application/json"))
    .filter((s) => !/\bdefer\b/i.test(s) && !/\basync\b/i.test(s) && !/type=["']module["']/i.test(s))
    .filter((s) => /\bsrc=["']/i.test(s));
  const renderBlockingCount = renderBlockingCss.length + renderBlockingJs.length;

  const inlineStyles = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) ?? [];
  const inlineCssSize = inlineStyles.reduce((sum, s) => sum + new TextEncoder().encode(s).length, 0);

  const hasFetchPriority = imgTags.some((tag) => /fetchpriority=["']high["']/i.test(tag));

  return {
    lcpCandidate,
    lcpImageCount: imgsWithoutDimensions,
    clsRiskFactors,
    renderBlockingCount,
    inlineCssSize,
    hasViewportMeta: /<meta[^>]*name=["']viewport["']/i.test(html),
    hasFetchPriority,
  };
}

export async function analyzePwaManifest(html: string, baseUrl: string, manifestRes: FetchResult): Promise<CheckReport["pwaManifest"]> {
  const manifestLinkMatch = html.match(/<link[^>]*rel=["']manifest["'][^>]*href=["']([^"']+)["']/i);
  const manifestSource = manifestLinkMatch
    ? (manifestLinkMatch[1].startsWith("http") ? manifestLinkMatch[1] : `${baseUrl}${manifestLinkMatch[1].startsWith("/") ? "" : "/"}${manifestLinkMatch[1]}`)
    : null;
  const manifestText = manifestSource
    ? (await safeFetch(manifestSource)).text
    : (manifestRes.ok ? manifestRes.text : "");
  if (manifestText) {
    try {
      const manifest = JSON.parse(manifestText);
      return {
        exists: true,
        hasName: !!(manifest.name || manifest.short_name),
        hasIcons: Array.isArray(manifest.icons) && manifest.icons.length > 0,
        hasStartUrl: !!manifest.start_url,
        hasDisplay: !!manifest.display,
        hasThemeColor: !!manifest.theme_color,
      };
    } catch {
      return { exists: true, hasName: false, hasIcons: false, hasStartUrl: false, hasDisplay: false, hasThemeColor: false };
    }
  }
  return undefined;
}

export function analyzeSocialMeta(html: string): CheckReport["socialMeta"] | undefined {
  const twitterSiteMatch = html.match(/<meta[^>]*name=["']twitter:site["'][^>]*content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:site["']/i);
  const twitterCreatorMatch = html.match(/<meta[^>]*name=["']twitter:creator["'][^>]*content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:creator["']/i);
  const fbAppIdMatch = html.match(/<meta[^>]*property=["']fb:app_id["'][^>]*content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']fb:app_id["']/i);
  const ogSiteNameMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:site_name["']/i);
  const socialMeta = {
    twitterSite: twitterSiteMatch?.[1],
    twitterCreator: twitterCreatorMatch?.[1],
    fbAppId: fbAppIdMatch?.[1],
    ogSiteName: ogSiteNameMatch?.[1],
  };
  const hasSocialMeta = !!(socialMeta.twitterSite || socialMeta.fbAppId || socialMeta.ogSiteName);
  return hasSocialMeta ? socialMeta : undefined;
}

export function analyzeContentMetrics(html: string) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch?.[1] ?? html;
  const textOnly = bodyHtml
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const charCount = textOnly.length;
  const words = textOnly.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;
  const htmlBytes = new TextEncoder().encode(html).length;
  const textBytes = new TextEncoder().encode(textOnly).length;
  const textToHtmlRatio = htmlBytes > 0 ? Math.round((textBytes / htmlBytes) * 10000) / 100 : 0;
  const paragraphs = bodyHtml.match(/<p[^>]*>/gi) ?? [];
  const paragraphCount = paragraphs.length;
  const sentences = textOnly.split(/[.!?。！？]+/).filter((s) => s.trim().length > 0);
  const averageSentenceLength = sentences.length > 0 ? Math.round(wordCount / sentences.length) : 0;
  return { wordCount, charCount, paragraphCount, textToHtmlRatio, averageSentenceLength };
}

export function analyzeFeed(html: string, baseUrl: string) {
  const rssLinks = html.match(/<link[^>]*type=["']application\/rss\+xml["'][^>]*>/gi) ?? [];
  const atomLinks = html.match(/<link[^>]*type=["']application\/atom\+xml["'][^>]*>/gi) ?? [];
  const feedUrls: string[] = [];
  for (const link of [...rssLinks, ...atomLinks]) {
    const hrefMatch = link.match(/href=["']([^"']+)["']/i);
    if (hrefMatch) {
      const feedHref = hrefMatch[1].startsWith("http") ? hrefMatch[1] : `${baseUrl}${hrefMatch[1].startsWith("/") ? "" : "/"}${hrefMatch[1]}`;
      feedUrls.push(feedHref);
    }
  }
  const hasRss = rssLinks.length > 0;
  const hasAtom = atomLinks.length > 0;
  return (hasRss || hasAtom) ? { hasRss, hasAtom, feedUrls } : undefined;
}

export function analyzeFavicon(html: string, pwaManifest: CheckReport["pwaManifest"]) {
  const faviconLinks = html.match(/<link[^>]*rel=["'][^"']*icon[^"']*["'][^>]*>/gi) ?? [];
  const hasAppleTouchIcon = faviconLinks.some((l) => /apple-touch-icon/i.test(l));
  const hasSvgIcon = faviconLinks.some((l) => /type=["']image\/svg\+xml["']/i.test(l) || /\.svg/i.test(l));
  const faviconSizes: string[] = [];
  for (const link of faviconLinks) {
    const sizeMatch = link.match(/sizes=["']([^"']+)["']/i);
    if (sizeMatch) {
      faviconSizes.push(...sizeMatch[1].split(/\s+/));
    }
  }
  const hasFaviconLink = faviconLinks.length > 0 || /<link[^>]*rel=["'](?:icon|shortcut icon)["']/i.test(html);
  return {
    hasFavicon: hasFaviconLink,
    hasAppleTouchIcon,
    hasSvgIcon,
    sizes: faviconSizes,
    hasWebManifestIcons: pwaManifest?.hasIcons ?? false,
  };
}

export function analyzeOgPreview(html: string) {
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
  const ogUrlMatch = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:url["']/i);
  return (ogTitleMatch || ogDescMatch) ? {
    ogTitle: ogTitleMatch?.[1]?.trim(),
    ogDescription: ogDescMatch?.[1]?.trim(),
    ogUrl: ogUrlMatch?.[1]?.trim(),
  } : undefined;
}

export function analyzeHeadingTree(html: string) {
  const headingTreeMatches = [...html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)];
  const tree = headingTreeMatches.slice(0, 30).map((m) => ({
    level: parseInt(m[1], 10),
    text: m[2].replace(/<[^>]+>/g, "").trim().slice(0, 100),
  })).filter((h) => h.text.length > 0);
  return tree.length > 0 ? tree : undefined;
}

export function analyzeDuplicateMetaTags(html: string) {
  const duplicates: { tag: string; count: number }[] = [];
  const titleTagCount = (html.match(/<title[^>]*>/gi) ?? []).length;
  if (titleTagCount > 1) duplicates.push({ tag: "title", count: titleTagCount });
  const descTagCount = (html.match(/<meta[^>]*name=["']description["']/gi) ?? []).length
    + (html.match(/<meta[^>]*content=["'][^"']+["'][^>]*name=["']description["']/gi) ?? []).filter(
      (m) => !(html.match(/<meta[^>]*name=["']description["']/gi) ?? []).some((o) => o === m)
    ).length;
  if (descTagCount > 1) duplicates.push({ tag: "meta description", count: descTagCount });
  const ogTitleTagCount = (html.match(/property=["']og:title["']/gi) ?? []).length;
  if (ogTitleTagCount > 1) duplicates.push({ tag: "og:title", count: ogTitleTagCount });
  const ogDescTagCount = (html.match(/property=["']og:description["']/gi) ?? []).length;
  if (ogDescTagCount > 1) duplicates.push({ tag: "og:description", count: ogDescTagCount });
  const canonicalTagCount = (html.match(/<link[^>]*rel=["']canonical["']/gi) ?? []).length;
  if (canonicalTagCount > 1) duplicates.push({ tag: "canonical", count: canonicalTagCount });
  return duplicates.length > 0 ? duplicates : undefined;
}

export function analyzeCanonical(html: string, url: string) {
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    ?? html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  const canonicalUrl = canonicalMatch?.[1];
  const canonicalMismatch = canonicalUrl ? (canonicalUrl !== url && canonicalUrl !== url.replace(/\/$/, "") && canonicalUrl !== url + "/") : undefined;
  return { canonicalUrl, canonicalMismatch };
}

export function analyzeI18n(html: string, responseHdrs: Record<string, string>) {
  const contentLanguage = responseHdrs["content-language"] ?? "";
  const hreflangMatches = html.match(/<link[^>]*rel=["']alternate["'][^>]*hreflang=["']([^"']+)["']/gi) ?? [];
  const hreflangTags = hreflangMatches.map((m) => {
    const match = m.match(/hreflang=["']([^"']+)["']/i);
    return match?.[1] ?? "";
  }).filter(Boolean);
  return { contentLanguage, hreflangTags };
}

export function analyzeExternalResources(html: string, baseUrl: string) {
  const domains = new Set<string>();
  const cssLinks = html.match(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi) ?? [];
  let externalCss = 0;
  for (const link of cssLinks) {
    const hrefMatch = link.match(/href=["']([^"']+)["']/i);
    if (hrefMatch) {
      const href = hrefMatch[1];
      if (href.startsWith("http") && !href.startsWith(baseUrl)) {
        externalCss++;
        try { domains.add(new URL(href).hostname); } catch {}
      }
    }
  }
  const scriptTags = html.match(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi) ?? [];
  let externalJs = 0;
  for (const tag of scriptTags) {
    const srcMatch = tag.match(/src=["']([^"']+)["']/i);
    if (srcMatch) {
      const src = srcMatch[1];
      if (src.startsWith("http") && !src.startsWith(baseUrl)) {
        externalJs++;
        try { domains.add(new URL(src).hostname); } catch {}
      }
    }
  }
  // Also check external font/image preloads
  const preloads = html.match(/<link[^>]*rel=["']preload["'][^>]*href=["']([^"']+)["']/gi) ?? [];
  for (const link of preloads) {
    const hrefMatch = link.match(/href=["']([^"']+)["']/i);
    if (hrefMatch) {
      const href = hrefMatch[1];
      if (href.startsWith("http") && !href.startsWith(baseUrl)) {
        try { domains.add(new URL(href).hostname); } catch {}
      }
    }
  }
  const thirdPartyDomains = [...domains].sort();
  return { externalCss, externalJs, totalExternal: externalCss + externalJs, thirdPartyDomains };
}

export function analyzeAiContentPreview(html: string) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch?.[1] ?? html;
  // Strip non-content elements
  const cleaned = bodyHtml
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  const textOnly = cleaned
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const excerpt = textOnly.slice(0, 500) + (textOnly.length > 500 ? "..." : "");

  // Extract main topics from h1-h3 headings
  const headings = [...cleaned.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)];
  const mainTopics = headings
    .map((m) => m[1].replace(/<[^>]+>/g, "").trim())
    .filter((t) => t.length > 0 && t.length < 100)
    .slice(0, 5);

  // Estimate reading time (Japanese ~600 chars/min, English ~200 words/min)
  const charCount = textOnly.length;
  const estimatedReadingTimeMin = Math.max(1, Math.round(charCount / 600));

  return { excerpt, mainTopics, estimatedReadingTimeMin };
}

export function analyzeLinkQuality(html: string) {
  const allLinks = html.match(/<a[^>]*>/gi) ?? [];
  let followCount = 0;
  let nofollowCount = 0;
  let sponsoredCount = 0;
  let ugcCount = 0;
  for (const link of allLinks) {
    const relMatch = link.match(/\brel=["']([^"']+)["']/i);
    const relValue = relMatch?.[1]?.toLowerCase() ?? "";
    if (relValue.includes("nofollow")) {
      nofollowCount++;
    } else {
      followCount++;
    }
    if (relValue.includes("sponsored")) sponsoredCount++;
    if (relValue.includes("ugc")) ugcCount++;
  }
  return (allLinks.length > 0) ? { followCount, nofollowCount, sponsoredCount, ugcCount } : undefined;
}

const RICH_RESULTS_MAP: Record<string, string> = {
  Product: "商品リッチリザルト（価格・在庫・レビュー表示）",
  Article: "記事リッチリザルト（公開日・著者表示）",
  NewsArticle: "ニュース記事リッチリザルト（トップニュース掲載候補）",
  FAQPage: "FAQリッチリザルト（質問と回答の直接表示）",
  HowTo: "ハウツーリッチリザルト（手順のステップ表示）",
  Recipe: "レシピリッチリザルト（調理時間・材料表示）",
  Event: "イベントリッチリザルト（日時・場所表示）",
  Course: "コースリッチリザルト（講座情報表示）",
  VideoObject: "動画リッチリザルト（サムネイル・再生時間表示）",
  LocalBusiness: "ローカルビジネスリッチリザルト（地図・営業時間表示）",
  Organization: "組織ナレッジパネル（ロゴ・連絡先表示）",
  BreadcrumbList: "パンくずリストリッチリザルト（階層ナビ表示）",
  WebSite: "サイトリンク検索ボックス（サイト内検索表示）",
  SoftwareApplication: "ソフトウェアリッチリザルト（評価・価格表示）",
  Review: "レビューリッチリザルト（星評価表示）",
  JobPosting: "求人リッチリザルト（給与・勤務地表示）",
  Book: "書籍リッチリザルト（著者・価格表示）",
};

export function analyzeRichResultsEligibility(jsonLdTypes: string[]) {
  const results: { type: string; eligible: string }[] = [];
  for (const t of jsonLdTypes) {
    const types = t.split(",").map((s) => s.trim());
    for (const type of types) {
      if (RICH_RESULTS_MAP[type] && !results.some((r) => r.type === type)) {
        results.push({ type, eligible: RICH_RESULTS_MAP[type] });
      }
    }
  }
  return results.length > 0 ? results : undefined;
}

export function analyzeSnippetControl(html: string, responseHeaders: Record<string, string>) {
  const robotsMeta = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']robots["']/i)?.[1]
    ?? "";
  const googlebotMeta = html.match(/<meta[^>]*name=["']googlebot["'][^>]*content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']googlebot["']/i)?.[1]
    ?? "";
  const xRobotsTag = responseHeaders["x-robots-tag"] ?? "";
  const combined = [robotsMeta, googlebotMeta, xRobotsTag].join(", ").toLowerCase();

  const maxSnippetMatch = combined.match(/max-snippet\s*:\s*(-?\d+)/);
  const maxImagePreviewMatch = combined.match(/max-image-preview\s*:\s*(none|standard|large)/i);
  const maxVideoPreviewMatch = combined.match(/max-video-preview\s*:\s*(-?\d+)/);

  const maxSnippet = maxSnippetMatch ? parseInt(maxSnippetMatch[1], 10) : undefined;
  const maxImagePreview = maxImagePreviewMatch ? maxImagePreviewMatch[1].toLowerCase() as "none" | "standard" | "large" : undefined;
  const maxVideoPreview = maxVideoPreviewMatch ? parseInt(maxVideoPreviewMatch[1], 10) : undefined;

  if (maxSnippet === undefined && maxImagePreview === undefined && maxVideoPreview === undefined) return undefined;
  return { maxSnippet, maxImagePreview, maxVideoPreview };
}

export function detectOpenSearch(html: string): string | undefined {
  const match = html.match(/<link[^>]*type=["']application\/opensearchdescription\+xml["'][^>]*>/i);
  if (!match) return undefined;
  const titleMatch = match[0].match(/title=["']([^"']+)["']/i);
  return titleMatch?.[1] ?? "OpenSearch";
}

export function analyzeMetaRefresh(html: string): { delay: number; url?: string } | undefined {
  const match = html.match(/<meta[^>]*http-equiv=["']refresh["'][^>]*content=["'](\d+)(?:\s*;\s*url=([^"']+))?["']/i)
    ?? html.match(/<meta[^>]*content=["'](\d+)(?:\s*;\s*url=([^"']+))?["'][^>]*http-equiv=["']refresh["']/i);
  if (!match) return undefined;
  return {
    delay: parseInt(match[1], 10),
    url: match[2]?.trim(),
  };
}

export function analyzeJsonLdBlocks(html: string) {
  const jsonLdBlocks = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  const types: string[] = [];
  for (const block of jsonLdBlocks) {
    const contentMatch = block.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    if (!contentMatch) continue;
    try {
      const data = JSON.parse(contentMatch[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item["@type"]) {
          const t = Array.isArray(item["@type"]) ? item["@type"].join(", ") : item["@type"];
          types.push(t);
        }
        // Check @graph
        if (Array.isArray(item["@graph"])) {
          for (const node of item["@graph"]) {
            if (node["@type"]) {
              const t = Array.isArray(node["@type"]) ? node["@type"].join(", ") : node["@type"];
              types.push(t);
            }
          }
        }
      }
    } catch {
      // parse error - already handled by structured data checker
    }
  }
  return { blockCount: jsonLdBlocks.length, types };
}

export async function analyzeAiPlugin(
  baseUrl: string,
  agentRes: FetchResult
): Promise<{
  hasAiPlugin: boolean;
  hasAgentJson: boolean;
  aiPluginName?: string;
  aiPluginDescription?: string;
  agentJsonVersion?: string;
  hasSecurityTxt: boolean;
  securityTxtContact?: string;
  hasHumansTxt: boolean;
} | undefined> {
  let hasAiPlugin = false;
  let aiPluginName: string | undefined;
  let aiPluginDescription: string | undefined;
  let hasSecurityTxt = false;
  let securityTxtContact: string | undefined;
  let hasHumansTxt = false;

  const [aiPluginRes, securityTxtRes, humansTxtRes] = await Promise.all([
    safeFetch(`${baseUrl}/.well-known/ai-plugin.json`),
    safeFetch(`${baseUrl}/.well-known/security.txt`),
    safeFetch(`${baseUrl}/humans.txt`),
  ]);

  try {
    if (aiPluginRes.ok && aiPluginRes.text.length > 10) {
      const data = JSON.parse(aiPluginRes.text);
      if (data.name_for_human || data.name_for_model) {
        hasAiPlugin = true;
        aiPluginName = data.name_for_human ?? data.name_for_model;
        aiPluginDescription = data.description_for_human ?? data.description_for_model;
      }
    }
  } catch {
    // ignore parse errors
  }

  if (securityTxtRes.ok && securityTxtRes.text.length > 10) {
    const text = securityTxtRes.text;
    if (text.includes("Contact:") || text.includes("contact:")) {
      hasSecurityTxt = true;
      const contactMatch = text.match(/^Contact:\s*(.+)$/im);
      if (contactMatch) {
        securityTxtContact = contactMatch[1].trim();
      }
    }
  }

  let hasAgentJson = false;
  let agentJsonVersion: string | undefined;
  if (agentRes.ok && agentRes.text.length > 10) {
    try {
      const data = JSON.parse(agentRes.text);
      if (data.name || data.url) {
        hasAgentJson = true;
        agentJsonVersion = data.version;
      }
    } catch {
      // ignore
    }
  }

  if (humansTxtRes.ok && humansTxtRes.text.length > 10) {
    const text = humansTxtRes.text.toLowerCase();
    if (text.includes("team") || text.includes("site") || text.includes("author") || text.includes("developer")) {
      hasHumansTxt = true;
    }
  }

  if (!hasAiPlugin && !hasAgentJson && !hasSecurityTxt && !hasHumansTxt) return undefined;
  return { hasAiPlugin, hasAgentJson, aiPluginName, aiPluginDescription, agentJsonVersion, hasSecurityTxt, securityTxtContact, hasHumansTxt };
}
