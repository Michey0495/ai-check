import { NextRequest, NextResponse } from "next/server";
import type { CheckResult, CheckReport } from "@/lib/check-indicators";
import { getGrade } from "@/lib/check-indicators";
import { corsHeaders, corsOptionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return corsOptionsResponse();
}

export const maxDuration = 30;

// Simple in-memory rate limiter (per IP, 10 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ENTRIES = 10_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Prevent unbounded memory growth: purge expired entries periodically
  if (rateLimitMap.size > RATE_LIMIT_MAX_ENTRIES) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function isPrivateHostname(hostname: string): boolean {
  // Strip IPv6 brackets
  const h = hostname.replace(/^\[|\]$/g, "");
  if (h === "localhost" || h === "127.0.0.1" || h === "::1" || h === "0.0.0.0") return true;
  if (h.endsWith(".local") || h.endsWith(".internal")) return true;
  // Block IPv6 private/link-local ranges
  if (h.startsWith("fe80:") || h.startsWith("fc00:") || h.startsWith("fd00:")) return true;
  // Block IPv4-mapped IPv6 (e.g., ::ffff:127.0.0.1, ::ffff:10.0.0.1)
  const v4Mapped = h.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (v4Mapped) return isPrivateIPv4(v4Mapped[1]);
  const parts = h.split(".");
  if (parts.length === 4 && parts.every((p) => /^\d+$/.test(p))) {
    return isPrivateIPv4(h);
  }
  return false;
}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  if (a === 0 || a === 127) return true;
  return false;
}

type FetchResult = { ok: boolean; text: string; headers?: Record<string, string> };

async function safeFetch(url: string, timeoutMs = 10000, returnHeaders = false): Promise<FetchResult> {
  try {
    const parsed = new URL(url);
    if (isPrivateHostname(parsed.hostname)) return { ok: false, text: "" };
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "follow",
      headers: { "User-Agent": "AI-Check-Bot/1.0" },
    });
    if (!res.ok) return { ok: false, text: "" };
    const reader = res.body?.getReader();
    if (!reader) return { ok: false, text: "" };
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let totalSize = 0;
    const MAX_BODY_SIZE = 5 * 1024 * 1024; // 5MB
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalSize += value.byteLength;
      if (totalSize > MAX_BODY_SIZE) {
        reader.cancel();
        return { ok: false, text: "" };
      }
      chunks.push(value);
    }
    const merged = chunks.length === 1
      ? chunks[0]
      : new Uint8Array(await new Blob(chunks).arrayBuffer());
    const text = new TextDecoder().decode(merged);
    const result: FetchResult = { ok: true, text };
    if (returnHeaders) {
      const hdrs: Record<string, string> = {};
      res.headers.forEach((v, k) => { hdrs[k.toLowerCase()] = v; });
      result.headers = hdrs;
    }
    return result;
  } catch {
    return { ok: false, text: "" };
  }
}

function checkRobotsTxt(robotsText: string | null, baseUrl: string): CheckResult {
  if (robotsText === null) {
    return {
      id: "robots-txt",
      score: 5,
      maxScore: 15,
      status: "warn",
      message: "AIクローラーアクセス: 確認不可",
      details: "robots.txtの取得に失敗しました。サーバーへの接続を確認してください。",
    };
  }

  if (robotsText === "") {
    return {
      id: "robots-txt",
      score: 10,
      maxScore: 15,
      status: "warn",
      message: "AIクローラーアクセス: robots.txtなし",
      details: "robots.txtが見つかりません。存在しない場合、全クローラーがアクセス可能ですが、明示的に許可することを推奨します。",
      code: `# robots.txt\nUser-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml`,
    };
  }

  // Check for global block: User-agent: * with Disallow: /
  const hasGlobalBlock = /User-agent:\s*\*\s*\n(?:(?!User-agent:)[^\n]*\n)*?\s*Disallow:\s*\/\s*$/im.test(robotsText);

  const aiCrawlers = ["GPTBot", "ChatGPT-User", "ClaudeBot", "anthropic-ai", "PerplexityBot", "Google-Extended", "Bytespider", "CCBot", "Applebot-Extended", "cohere-ai"];
  const blocked = aiCrawlers.filter((c) => {
    const escaped = c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Check if crawler has specific Allow rule (overrides global block)
    const hasSpecificAllow = new RegExp(`User-agent:\\s*${escaped}\\s*\\n(?:(?!User-agent:)[^\\n]*\\n)*?\\s*Allow:\\s*/`, "i").test(robotsText);
    if (hasSpecificAllow) return false;
    // Check if crawler is specifically blocked
    const pattern = new RegExp(`User-agent:\\s*${escaped}\\s*\\n(?:(?!User-agent:)[^\\n]*\\n)*?\\s*Disallow:\\s*/`, "i");
    if (pattern.test(robotsText)) return true;
    // If global block exists and no specific allow, crawler is blocked
    return hasGlobalBlock;
  });
  const allowed = aiCrawlers.length - blocked.length;

  // Check for Sitemap directive in robots.txt
  const hasSitemapDirective = /^Sitemap:\s*https?:\/\//im.test(robotsText);
  const sitemapNote = hasSitemapDirective
    ? " Sitemapディレクティブが設定されています。"
    : " robots.txtにSitemapディレクティブを追加するとクローラーの巡回効率が向上します。";

  if (blocked.length === 0) {
    return {
      id: "robots-txt",
      score: 15,
      maxScore: 15,
      status: "pass",
      message: "AIクローラーアクセス: 全て許可",
      details: `robots.txtが存在し、主要AIクローラー（${aiCrawlers.join(", ")}）がブロックされていません。${sitemapNote}`,
    };
  } else if (allowed > 0) {
    return {
      id: "robots-txt",
      score: 8,
      maxScore: 15,
      status: "warn",
      message: "AIクローラーアクセス: 一部ブロック",
      details: `以下のAIクローラーがブロックされています: ${blocked.join(", ")}`,
      code: `# robots.txt - AIクローラーを許可する例\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /`,
    };
  } else {
    return {
      id: "robots-txt",
      score: 3,
      maxScore: 15,
      status: "fail",
      message: "AIクローラーアクセス: 全てブロック",
      details: "全ての主要AIクローラーがrobots.txtでブロックされています。",
      code: `# robots.txt - AIクローラーを許可する例\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /`,
    };
  }
}

function checkLlmsTxt(llmsText: string | null, hostname: string, baseUrl: string): CheckResult {
  if (llmsText === null) {
    return {
      id: "llms-txt",
      score: 0,
      maxScore: 15,
      status: "fail",
      message: "llms.txt: 確認不可",
      details: "llms.txtの取得に失敗しました。",
    };
  }

  if (llmsText === "") {
    return {
      id: "llms-txt",
      score: 0,
      maxScore: 15,
      status: "fail",
      message: "llms.txt: 未設置",
      details: "llms.txtが見つかりません。AIエージェントにサイト情報を伝えるために設置を推奨します。",
      code: `# ${hostname}\n\n> サイトの簡潔な説明をここに記載\n\n## 主要ページ\n- [トップ](${baseUrl}/): サイトの概要\n- [サービス](${baseUrl}/services): 提供するサービス\n\n## API\n- なし`,
    };
  }

  if (llmsText.length > 100) {
    // Check content quality
    const hasHeadings = /^##?\s/m.test(llmsText);
    const hasUrls = /https?:\/\//.test(llmsText);
    const hasApiSection = /api/i.test(llmsText);
    const lineCount = llmsText.split("\n").filter((l) => l.trim()).length;
    const qualityItems: string[] = [];
    if (hasHeadings) qualityItems.push("セクション見出しあり");
    if (hasUrls) qualityItems.push("URL記載あり");
    if (hasApiSection) qualityItems.push("API情報あり");
    const qualityText = qualityItems.length > 0 ? ` 品質: ${qualityItems.join("、")}。` : "";

    if (llmsText.length < 300 || !hasHeadings) {
      return {
        id: "llms-txt",
        score: 12,
        maxScore: 15,
        status: "warn",
        message: "llms.txt: 存在（内容の充実を推奨）",
        details: `llms.txtが存在し、${llmsText.length}文字（${lineCount}行）の内容があります。${qualityText}セクション見出し（##）、主要ページURL、API情報を含めるとAIエージェントの理解度が向上します。`,
      };
    }

    return {
      id: "llms-txt",
      score: 15,
      maxScore: 15,
      status: "pass",
      message: "llms.txt: 充実",
      details: `llms.txtが存在し、${llmsText.length}文字（${lineCount}行）の充実した内容があります。${qualityText}AIエージェントがサイト情報を正確に理解できます。`,
    };
  }

  return {
    id: "llms-txt",
    score: 10,
    maxScore: 15,
    status: "warn",
    message: "llms.txt: 内容が少ない",
    details: "llms.txtは存在しますが、内容が少ないです（100文字以下）。サイト概要、主要ページ、API情報等を追記することを推奨します。",
  };
}

// Required/recommended properties per schema type for validation
const SCHEMA_REQUIRED_PROPS: Record<string, string[]> = {
  WebSite: ["name", "url"],
  WebApplication: ["name", "url"],
  Organization: ["name"],
  LocalBusiness: ["name", "address"],
  Product: ["name"],
  Article: ["headline", "author"],
  NewsArticle: ["headline", "author"],
  BlogPosting: ["headline", "author"],
  FAQPage: ["mainEntity"],
  HowTo: ["name", "step"],
  BreadcrumbList: ["itemListElement"],
  SoftwareApplication: ["name"],
  Course: ["name", "provider"],
  Event: ["name", "startDate"],
  Recipe: ["name", "recipeIngredient"],
  VideoObject: ["name", "uploadDate"],
  Person: ["name"],
};

function validateJsonLdItem(item: Record<string, unknown>): { type: string; valid: boolean; missing: string[] } {
  const rawType = item["@type"];
  const type = Array.isArray(rawType) ? rawType[0] : (typeof rawType === "string" ? rawType : "");
  if (!type) return { type: "unknown", valid: false, missing: ["@type"] };

  const required = SCHEMA_REQUIRED_PROPS[type];
  if (!required) return { type, valid: true, missing: [] }; // unknown type, assume valid

  const missing = required.filter((prop) => !item[prop]);
  return { type, valid: missing.length === 0, missing };
}

function checkStructuredData(html: string, baseUrl: string): CheckResult {
  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatches && jsonLdMatches.length > 0) {
    const schemaTypes: string[] = [];
    let validCount = 0;
    let totalCount = 0;
    let parseErrors = 0;
    const missingProps: string[] = [];

    for (const match of jsonLdMatches) {
      const content = match.replace(/<script[^>]*>|<\/script>/gi, "");
      try {
        const parsed = JSON.parse(content);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          totalCount++;
          if (item["@type"]) {
            const t = Array.isArray(item["@type"]) ? item["@type"].join(", ") : item["@type"];
            schemaTypes.push(t);
            const validation = validateJsonLdItem(item as Record<string, unknown>);
            if (validation.valid) {
              validCount++;
            } else if (validation.missing.length > 0) {
              missingProps.push(`${t}: ${validation.missing.join(", ")}が未設定`);
            }
          } else {
            // No @type
            missingProps.push("@type未設定のJSON-LDあり");
          }
        }
      } catch {
        parseErrors++;
      }
    }

    const hasContext = html.includes('"@context"') && html.includes("schema.org");
    const typesText = schemaTypes.length > 0 ? ` 検出スキーマ: ${schemaTypes.join(", ")}。` : "";
    const parseErrorText = parseErrors > 0 ? ` ${parseErrors}件のJSON-LDにパースエラーがあります。` : "";

    if (parseErrors > 0 && validCount === 0) {
      return {
        id: "structured-data",
        score: 5,
        maxScore: 20,
        status: "warn",
        message: `構造化データ: JSON-LDにパースエラー`,
        details: `${jsonLdMatches.length}件のJSON-LDが検出されましたが、JSONとして正しくパースできません。構文を確認してください。`,
      };
    }

    if (missingProps.length > 0 && validCount < totalCount) {
      return {
        id: "structured-data",
        score: 15,
        maxScore: 20,
        status: "warn",
        message: `構造化データ: ${jsonLdMatches.length}件検出（一部不完全）`,
        details: `JSON-LD構造化データが設置されていますが、推奨プロパティが不足しています。${typesText}不足項目: ${missingProps.join("、")}。${parseErrorText}`,
      };
    }

    if (!hasContext) {
      return {
        id: "structured-data",
        score: 15,
        maxScore: 20,
        status: "warn",
        message: `構造化データ: ${jsonLdMatches.length}件検出（@context未設定）`,
        details: `JSON-LDが検出されましたが、@contextにschema.orgが設定されていない可能性があります。${typesText}@context: "https://schema.org" を設定してください。`,
      };
    }

    return {
      id: "structured-data",
      score: 20,
      maxScore: 20,
      status: "pass",
      message: `構造化データ: ${jsonLdMatches.length}件のJSON-LDを検出`,
      details: `JSON-LD構造化データが適切に設置されています。${typesText}AI検索エンジンがコンテンツを正確に理解できます。${parseErrorText}`,
    };
  }
  return {
    id: "structured-data",
    score: 0,
    maxScore: 20,
    status: "fail",
    message: "構造化データ: JSON-LD未検出",
    details: "JSON-LD構造化データが見つかりません。AI検索エンジンがコンテンツを正確に理解するために設置を推奨します。",
    code: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "サイト名",\n  "url": "${baseUrl}",\n  "description": "サイトの説明"\n}\n</script>`,
  };
}

function checkMetaTags(html: string, responseHeaders?: Record<string, string>): CheckResult {
  const hasTitle = /<title[^>]*>.+?<\/title>/i.test(html);
  const hasDescription = /<meta[^>]*name=["']description["'][^>]*content=["'][^"']+["']/i.test(html);
  const hasOgTitle = /<meta[^>]*property=["']og:title["']/i.test(html);
  const hasOgDesc = /<meta[^>]*property=["']og:description["']/i.test(html);
  const hasOgImage = /<meta[^>]*property=["']og:image["']/i.test(html);
  const hasOgType = /<meta[^>]*property=["']og:type["']/i.test(html);
  const hasTwitterCard = /<meta[^>]*name=["']twitter:card["']/i.test(html);
  const hasCanonical = /<link[^>]*rel=["']canonical["'][^>]*href=["'][^"']+["']/i.test(html);
  const hasLang = /<html[^>]*lang=["'][^"']+["']/i.test(html);
  const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);

  // Detect noindex (blocks search engine indexing)
  const robotsMetaMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']robots["']/i);
  const robotsContent = robotsMetaMatch?.[1]?.toLowerCase() ?? "";
  const xRobotsTag = responseHeaders?.["x-robots-tag"]?.toLowerCase() ?? "";
  const hasNoindex = robotsContent.includes("noindex") || xRobotsTag.includes("noindex");

  // Extract actual values for display
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const titleText = titleMatch?.[1]?.trim() ?? "";
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  const descText = descMatch?.[1]?.trim() ?? "";

  const coreItems = [hasTitle, hasDescription, hasOgTitle, hasOgDesc];
  const coreScore = coreItems.filter(Boolean).length;

  const bonusDetails: string[] = [];
  if (hasOgImage) bonusDetails.push("og:image設定済み");
  if (hasOgType) bonusDetails.push("og:type設定済み");
  if (hasTwitterCard) bonusDetails.push("twitter:card設定済み");
  if (hasCanonical) bonusDetails.push("canonical URL設定済み");
  if (hasLang) bonusDetails.push("lang属性設定済み");
  if (hasViewport) bonusDetails.push("viewport設定済み");

  // Build extracted values summary with length warnings
  const extractedParts: string[] = [];
  const lengthWarnings: string[] = [];
  if (titleText) {
    extractedParts.push(`title: 「${titleText.slice(0, 60)}${titleText.length > 60 ? "..." : ""}」(${titleText.length}文字)`);
    if (titleText.length < 15) lengthWarnings.push("titleが短すぎます（推奨: 30〜60文字）");
    else if (titleText.length > 60) lengthWarnings.push("titleが長すぎます（推奨: 30〜60文字、現在" + titleText.length + "文字）");
  }
  if (descText) {
    extractedParts.push(`description: 「${descText.slice(0, 80)}${descText.length > 80 ? "..." : ""}」(${descText.length}文字)`);
    if (descText.length < 50) lengthWarnings.push("descriptionが短すぎます（推奨: 70〜160文字）");
    else if (descText.length > 160) lengthWarnings.push("descriptionが長すぎます（推奨: 70〜160文字、現在" + descText.length + "文字）");
  }
  const extractedText = extractedParts.length > 0 ? ` 検出値: ${extractedParts.join("、")}。` : "";
  const lengthWarningText = lengthWarnings.length > 0 ? ` 注意: ${lengthWarnings.join("。")}。` : "";

  if (hasNoindex) {
    // noindex overrides everything - it's a critical issue
    const noindexSource = xRobotsTag.includes("noindex")
      ? "X-Robots-Tagレスポンスヘッダー"
      : "meta robotsタグ";
    return {
      id: "meta-tags",
      score: 3,
      maxScore: 15,
      status: "fail",
      message: "メタタグ: noindex検出",
      details: `${noindexSource}に noindex が設定されています。これにより検索エンジン（AI検索含む）にインデックスされません。GEO対策には noindex の解除が必要です。${extractedText}`,
    };
  }

  if (coreScore >= 4) {
    const bonusText = bonusDetails.length > 0 ? ` ${bonusDetails.join("、")}。` : "";
    if (lengthWarnings.length > 0) {
      return {
        id: "meta-tags",
        score: 12,
        maxScore: 15,
        status: "warn",
        message: "メタタグ: 設定済み（文字数に改善余地）",
        details: `title, description, OGPタグが設定されていますが、文字数の最適化が必要です。${bonusText}${extractedText}${lengthWarningText}`,
      };
    }
    return {
      id: "meta-tags",
      score: 15,
      maxScore: 15,
      status: "pass",
      message: "メタタグ: 完全",
      details: `title, description, OGPタグが適切に設定されています。${bonusText}${extractedText}`,
    };
  } else if (coreScore >= 2) {
    const missing = [];
    if (!hasTitle) missing.push("title");
    if (!hasDescription) missing.push("meta description");
    if (!hasOgTitle) missing.push("og:title");
    if (!hasOgDesc) missing.push("og:description");
    const extras: string[] = [];
    if (!hasOgImage) extras.push("og:image");
    if (!hasCanonical) extras.push("canonical URL");
    if (!hasLang) extras.push("lang属性");
    const extrasText = extras.length > 0 ? ` また、${extras.join("・")}の設定も推奨します。` : "";
    return {
      id: "meta-tags",
      score: 8,
      maxScore: 15,
      status: "warn",
      message: "メタタグ: 一部不足",
      details: `以下のメタタグが不足しています: ${missing.join(", ")}${extrasText}${extractedText}${lengthWarningText}`,
    };
  }
  return {
    id: "meta-tags",
    score: 0,
    maxScore: 15,
    status: "fail",
    message: "メタタグ: 不足",
    details: `基本的なメタタグ（title, description, OGP）が不足しています。og:image、canonical URL、lang属性の設定も推奨します。${extractedText}${lengthWarningText}`,
  };
}

function checkContentStructure(html: string): CheckResult {
  const hasH1 = /<h1[^>]*>/i.test(html);
  const hasArticle = /<article[^>]*>/i.test(html);
  const hasSection = /<section[^>]*>/i.test(html);
  const hasNav = /<nav[^>]*>/i.test(html);
  const hasMain = /<main[^>]*>/i.test(html);
  const structScore = [hasH1, hasArticle || hasSection, hasNav, hasMain].filter(Boolean).length;

  // Heading hierarchy analysis
  const h1Count = (html.match(/<h1[^>]*>/gi) ?? []).length;
  const headingMatches = html.match(/<h[1-6][^>]*>/gi) ?? [];
  const headingLevels = headingMatches.map((m) => parseInt(m.charAt(2)));

  let hierarchyOk = true;
  let hierarchyNote = "";
  if (h1Count > 1) {
    hierarchyNote = ` h1タグが${h1Count}個検出されました（推奨: 1個）。`;
    hierarchyOk = false;
  }
  if (headingLevels.length > 1) {
    // Check for heading level skips (e.g., h1 -> h3 without h2)
    let hasSkip = false;
    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] > headingLevels[i - 1] + 1) {
        hasSkip = true;
        break;
      }
    }
    if (hasSkip) {
      hierarchyNote += " 見出しレベルの飛び（例: h1→h3）が検出されました。h1→h2→h3の順に使用することを推奨します。";
      hierarchyOk = false;
    }
  }

  // Extract h1 text for display
  const h1TextMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1Text = h1TextMatch?.[1]?.replace(/<[^>]+>/g, "").trim().slice(0, 80) ?? "";
  const h1Info = h1Text ? ` h1: 「${h1Text}${h1Text.length >= 80 ? "..." : ""}」。` : "";

  const headingSummary = headingLevels.length > 0
    ? ` 見出し構成: ${[...new Set(headingLevels)].sort().map((l) => `h${l}`).join(", ")}（計${headingLevels.length}個）。`
    : "";

  if (structScore >= 3) {
    const warnNote = !hierarchyOk ? hierarchyNote : "";
    if (!hierarchyOk) {
      return {
        id: "content-structure",
        score: 12,
        maxScore: 15,
        status: "warn",
        message: "コンテンツ構造: セマンティックHTML使用（見出し階層に改善余地）",
        details: `h1, article/section, nav, main等のセマンティックHTMLタグが使用されています。${h1Info}${headingSummary}${warnNote}`,
      };
    }
    return {
      id: "content-structure",
      score: 15,
      maxScore: 15,
      status: "pass",
      message: "コンテンツ構造: セマンティックHTML使用",
      details: `h1, article/section, nav, main等のセマンティックHTMLタグが適切に使用されています。${h1Info}${headingSummary}`,
    };
  } else if (structScore >= 1) {
    return {
      id: "content-structure",
      score: 8,
      maxScore: 15,
      status: "warn",
      message: "コンテンツ構造: 改善の余地あり",
      details: `一部のセマンティックHTMLタグが使用されていますが、article, section, nav, main等の追加を推奨します。${h1Info}${headingSummary}${hierarchyNote}`,
    };
  }
  return {
    id: "content-structure",
    score: 0,
    maxScore: 15,
    status: "fail",
    message: "コンテンツ構造: セマンティックHTML未使用",
    details: `セマンティックHTMLタグが見つかりません。AIが文書構造を理解しにくい状態です。${headingSummary}`,
  };
}

function checkSSR(html: string): CheckResult {
  const bodyContent = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const hasContent = bodyContent && bodyContent[1].replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").trim().length > 200;
  if (hasContent) {
    return {
      id: "ssr",
      score: 10,
      maxScore: 10,
      status: "pass",
      message: "SSR: サーバーサイドレンダリング検出",
      details: "HTMLにコンテンツが含まれており、AIクローラーがコンテンツを読み取れます。",
    };
  }
  return {
    id: "ssr",
    score: 0,
    maxScore: 10,
    status: "fail",
    message: "SSR: クライアントサイドレンダリングの可能性",
    details: "HTMLにコンテンツがほとんど含まれていません。CSR（クライアントサイドレンダリング）の場合、AIクローラーがコンテンツを読み取れない可能性があります。",
  };
}

function checkSitemap(sitemapText: string | null, baseUrl: string): CheckResult {
  if (sitemapText === null) {
    return {
      id: "sitemap",
      score: 0,
      maxScore: 10,
      status: "fail",
      message: "サイトマップ: 確認不可",
      details: "sitemap.xmlの取得に失敗しました。",
    };
  }

  if (sitemapText === "") {
    return {
      id: "sitemap",
      score: 0,
      maxScore: 10,
      status: "fail",
      message: "サイトマップ: 未設置",
      details: "sitemap.xmlが見つかりません。AIクローラーがサイト構造を把握するために設置を推奨します。",
      code: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>\n  </url>\n</urlset>`,
    };
  }

  const urlCount = (sitemapText.match(/<url>/gi) ?? []).length;
  if (urlCount > 0) {
    // Check for lastmod dates
    const lastmodCount = (sitemapText.match(/<lastmod>/gi) ?? []).length;
    const hasLastmod = lastmodCount > 0;
    const lastmodPct = Math.round((lastmodCount / urlCount) * 100);
    const lastmodInfo = hasLastmod
      ? ` lastmod設定: ${lastmodCount}/${urlCount}件（${lastmodPct}%）。`
      : " lastmod（最終更新日）が未設定です。設定するとクローラーの効率が向上します。";

    return {
      id: "sitemap",
      score: 10,
      maxScore: 10,
      status: "pass",
      message: `サイトマップ: ${urlCount}ページ検出`,
      details: `sitemap.xmlが存在し、適切にページが登録されています。${lastmodInfo}`,
    };
  }
  return {
    id: "sitemap",
    score: 5,
    maxScore: 10,
    status: "warn",
    message: "サイトマップ: URLが少ない",
    details: "sitemap.xmlは存在しますが、登録URLが少ないです。主要ページを追加してください。",
  };
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json(
      { error: "urlクエリパラメータを指定してください。例: /api/check?url=https://example.com", errorCode: "MISSING_URL" },
      { status: 400, headers: corsHeaders() }
    );
  }
  // Reuse POST logic by creating a synthetic request body
  const syntheticRequest = new NextRequest(request.url, {
    method: "POST",
    headers: request.headers,
    body: JSON.stringify({ url }),
  });
  return POST(syntheticRequest);
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "リクエスト数が上限を超えました。しばらく待ってから再度お試しください。", errorCode: "RATE_LIMITED" },
        { status: 429, headers: corsHeaders() }
      );
    }

    let body: { url?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "リクエストボディが不正です。JSON形式で送信してください。", errorCode: "INVALID_BODY" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const { url } = body;

    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json({ error: "URLを入力してください。", errorCode: "MISSING_URL" }, { status: 400, headers: corsHeaders() });
    }

    if (url.length > 2048) {
      return NextResponse.json({ error: "URLが長すぎます。2048文字以内にしてください。", errorCode: "URL_TOO_LONG" }, { status: 400, headers: corsHeaders() });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "有効なURLを入力してください。", errorCode: "INVALID_URL" }, { status: 400, headers: corsHeaders() });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "http または https のURLを入力してください。", errorCode: "INVALID_PROTOCOL" }, { status: 400, headers: corsHeaders() });
    }

    if (isPrivateHostname(parsedUrl.hostname)) {
      return NextResponse.json({ error: "プライベートネットワークのURLはチェックできません。", errorCode: "SSRF_BLOCKED" }, { status: 400, headers: corsHeaders() });
    }

    const baseUrl = parsedUrl.origin;
    const startTime = Date.now();

    // Fetch all resources concurrently
    const [robotsRes, llmsRes, llmsFullRes, pageRes, sitemapRes, agentRes, manifestRes] = await Promise.all([
      safeFetch(`${baseUrl}/robots.txt`),
      safeFetch(`${baseUrl}/llms.txt`),
      safeFetch(`${baseUrl}/llms-full.txt`),
      safeFetch(url, 15000, true),
      safeFetch(`${baseUrl}/sitemap.xml`),
      safeFetch(`${baseUrl}/.well-known/agent.json`),
      safeFetch(`${baseUrl}/manifest.json`),
    ]);

    // If main page is unreachable, return a clear error
    if (!pageRes.ok && pageRes.text === "") {
      return NextResponse.json(
        { error: "対象サイトに接続できませんでした。URLが正しいか、サイトが稼働中かご確認ください。", errorCode: "SITE_UNREACHABLE" },
        { status: 422, headers: corsHeaders() }
      );
    }

    // ok=true: file found, use text. ok=false: fetch failed (null = unreachable, "" = not found)
    const robotsText = robotsRes.ok ? robotsRes.text : null;
    const llmsText = llmsRes.ok ? llmsRes.text : null;
    const hasLlmsFull = llmsFullRes.ok && llmsFullRes.text.length > 50;
    const html = pageRes.text;
    const sitemapText = sitemapRes.ok ? sitemapRes.text : null;

    // Enrich llms.txt check with llms-full.txt info
    const llmsResult = checkLlmsTxt(llmsText, parsedUrl.hostname, baseUrl);
    if (hasLlmsFull) {
      llmsResult.details += " llms-full.txt（詳細版）も検出されました。";
    }

    // Enrich structured data check with agent.json info
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

    // Content-Language and hreflang detection
    const responseHdrs = pageRes.headers ?? {};
    const contentLanguage = responseHdrs["content-language"] ?? "";
    const hreflangMatches = html.match(/<link[^>]*rel=["']alternate["'][^>]*hreflang=["']([^"']+)["']/gi) ?? [];
    const hreflangTags = hreflangMatches.map((m) => {
      const match = m.match(/hreflang=["']([^"']+)["']/i);
      return match?.[1] ?? "";
    }).filter(Boolean);

    const metaResult = checkMetaTags(html, pageRes.headers);
    // Enrich meta tag result with hreflang/Content-Language info
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

    // Extract og:image, title, and favicon for preview
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i);
    let faviconUrl = faviconMatch?.[1];
    if (faviconUrl && !faviconUrl.startsWith("http")) {
      faviconUrl = faviconUrl.startsWith("/") ? `${baseUrl}${faviconUrl}` : `${baseUrl}/${faviconUrl}`;
    }

    const htmlSizeKB = Math.round((new TextEncoder().encode(html).length) / 1024);

    // Analyze links in the page
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

    // Detect likely schema types from page content
    const suggestedSchemas: string[] = [];
    const lowerHtml = html.toLowerCase();
    if (lowerHtml.includes("cart") || lowerHtml.includes("add to cart") || lowerHtml.includes("price") || lowerHtml.includes("カート") || lowerHtml.includes("価格")) {
      suggestedSchemas.push("Product");
    }
    if (lowerHtml.includes("<article") || lowerHtml.includes("published") || lowerHtml.includes("投稿日") || lowerHtml.includes("公開日")) {
      suggestedSchemas.push("Article");
    }
    if (/<h[2-3][^>]*>.*(?:faq|よくある質問|q&a)/i.test(html)) {
      suggestedSchemas.push("FAQPage");
    }
    if (lowerHtml.includes("recipe") || lowerHtml.includes("レシピ") || lowerHtml.includes("材料")) {
      suggestedSchemas.push("Recipe");
    }
    if (lowerHtml.includes("event") || lowerHtml.includes("イベント") || lowerHtml.includes("開催日")) {
      suggestedSchemas.push("Event");
    }
    if (lowerHtml.includes("course") || lowerHtml.includes("コース") || lowerHtml.includes("受講")) {
      suggestedSchemas.push("Course");
    }
    if (suggestedSchemas.length === 0) {
      suggestedSchemas.push("WebSite");
    }

    const isHttps = parsedUrl.protocol === "https:";

    // CMS/Framework detection
    const detectedTech: string[] = [];
    if (responseHdrs["x-powered-by"]?.toLowerCase().includes("next.js") || html.includes("__next") || html.includes("_next/static")) {
      detectedTech.push("Next.js");
    }
    if (responseHdrs["x-powered-by"]?.toLowerCase().includes("express")) {
      detectedTech.push("Express");
    }
    if (html.includes("wp-content") || html.includes("wp-includes") || responseHdrs["x-powered-by"]?.toLowerCase().includes("wordpress") || html.includes('name="generator" content="WordPress')) {
      detectedTech.push("WordPress");
    }
    if (html.includes("Shopify.theme") || html.includes("cdn.shopify.com")) {
      detectedTech.push("Shopify");
    }
    if (html.includes("__nuxt") || html.includes("/_nuxt/")) {
      detectedTech.push("Nuxt.js");
    }
    if (html.includes("__gatsby") || html.includes("/static/") && html.includes("gatsby")) {
      detectedTech.push("Gatsby");
    }
    if (html.includes("__remixContext") || html.includes("remix")) {
      if (html.includes("__remixContext")) detectedTech.push("Remix");
    }
    if (html.includes("data-reactroot") || html.includes("__REACT") || html.includes("react-root")) {
      if (!detectedTech.some(t => ["Next.js", "Gatsby", "Remix"].includes(t))) {
        detectedTech.push("React");
      }
    }
    if (html.includes("ng-version") || html.includes("ng-app")) {
      detectedTech.push("Angular");
    }
    if (html.includes("data-v-") || html.includes("__vue")) {
      if (!detectedTech.includes("Nuxt.js")) detectedTech.push("Vue.js");
    }
    if (html.includes("data-svelte") || html.includes("__sveltekit")) {
      detectedTech.push("SvelteKit");
    }
    if (html.includes("data-turbo") || html.includes("turbolinks")) {
      detectedTech.push("Ruby on Rails");
    }
    if (html.includes('content="Hugo')) {
      detectedTech.push("Hugo");
    }
    if (html.includes("wix.com") || html.includes("wixsite")) {
      detectedTech.push("Wix");
    }
    if (html.includes("squarespace.com") || html.includes("squarespace-cdn")) {
      detectedTech.push("Squarespace");
    }
    // Detect common analytics/tools
    if (html.includes("googletagmanager.com") || html.includes("google-analytics.com") || html.includes("gtag")) {
      detectedTech.push("Google Analytics");
    }
    if (html.includes("clarity.ms")) {
      detectedTech.push("Microsoft Clarity");
    }

    // OG image accessibility check
    let ogImageAccessible: boolean | undefined;
    const ogImageUrl = ogImageMatch?.[1];
    if (ogImageUrl) {
      try {
        const ogUrl = ogImageUrl.startsWith("http") ? ogImageUrl : `${baseUrl}${ogImageUrl.startsWith("/") ? "" : "/"}${ogImageUrl}`;
        const ogParsed = new URL(ogUrl);
        if (!isPrivateHostname(ogParsed.hostname)) {
          const ogRes = await fetch(ogUrl, {
            method: "HEAD",
            signal: AbortSignal.timeout(5000),
            redirect: "follow",
            headers: { "User-Agent": "AI-Check-Bot/1.0" },
          }).catch(() => null);
          ogImageAccessible = ogRes?.ok ?? false;
        }
      } catch {
        ogImageAccessible = false;
      }
    }

    // Accessibility analysis
    const imgTags = html.match(/<img[^>]*>/gi) ?? [];
    const imgCount = imgTags.length;
    const imgWithAlt = imgTags.filter((tag) => /\balt=["'][^"']*["']/i.test(tag)).length;
    const hasSkipNav = /skip.*nav|skip.*content|skiplink/i.test(html);
    const ariaLandmarks = (html.match(/role=["'](banner|navigation|main|contentinfo|complementary|search)["']/gi) ?? []).length;
    const hasAriaLabels = /aria-label=/i.test(html);

    // Security headers analysis
    const hasHsts = !!responseHdrs["strict-transport-security"];
    const hasCsp = !!responseHdrs["content-security-policy"] || !!responseHdrs["content-security-policy-report-only"];
    const hasXFrameOptions = !!responseHdrs["x-frame-options"];
    const hasXContentTypeOptions = responseHdrs["x-content-type-options"]?.includes("nosniff") ?? false;
    const hasReferrerPolicy = !!responseHdrs["referrer-policy"];
    const secHeaderScore = [hasHsts, hasCsp, hasXFrameOptions, hasXContentTypeOptions, hasReferrerPolicy].filter(Boolean).length;

    // Content encoding / server detection
    const contentEncoding = responseHdrs["content-encoding"] ?? "";
    const serverHeader = responseHdrs["server"] ?? "";

    // Performance hints analysis
    const preconnectCount = (html.match(/<link[^>]*rel=["']preconnect["']/gi) ?? []).length;
    const prefetchCount = (html.match(/<link[^>]*rel=["'](?:dns-prefetch|prefetch|preload)["']/gi) ?? []).length;
    const lazyImageCount = (html.match(/<img[^>]*loading=["']lazy["']/gi) ?? []).length;
    const totalImageCount = imgCount;
    const hasFontDisplay = /font-display\s*:/i.test(html);
    const scriptTags = html.match(/<script[^>]*>/gi) ?? [];
    const totalScriptCount = scriptTags.filter((s) => !s.includes("application/ld+json") && !s.includes("application/json")).length;
    const deferScriptCount = scriptTags.filter((s) => /\bdefer\b/i.test(s)).length;
    const asyncScriptCount = scriptTags.filter((s) => /\basync\b/i.test(s)).length;
    const hasModuleScripts = scriptTags.some((s) => /type=["']module["']/i.test(s));

    // Core Web Vitals hints analysis
    // LCP candidate detection: look for large images/videos above the fold
    const heroImgMatch = html.match(/<(?:img|video|source)[^>]*(?:src|srcset)=["']([^"']+)["'][^>]*>/i);
    const lcpCandidate = heroImgMatch
      ? (heroImgMatch[0].startsWith("<video") ? "video" : "img")
      : (/<h1[^>]*>/i.test(html) ? "h1" : undefined);

    // Count images without explicit width/height (CLS risk)
    const allImgTags = html.match(/<img[^>]*>/gi) ?? [];
    const imgsWithoutDimensions = allImgTags.filter((tag) => {
      const hasWidth = /\bwidth\s*=\s*["']?\d/i.test(tag);
      const hasHeight = /\bheight\s*=\s*["']?\d/i.test(tag);
      return !hasWidth || !hasHeight;
    }).length;

    // CLS risk factors
    const clsRiskFactors: string[] = [];
    if (imgsWithoutDimensions > 0) {
      clsRiskFactors.push(`width/height未指定の画像: ${imgsWithoutDimensions}枚`);
    }
    // Iframes without dimensions
    const iframeTags = html.match(/<iframe[^>]*>/gi) ?? [];
    const iframesWithoutDimensions = iframeTags.filter((tag) => {
      return !(/\bwidth\s*=\s*["']?\d/i.test(tag) && /\bheight\s*=\s*["']?\d/i.test(tag));
    }).length;
    if (iframesWithoutDimensions > 0) {
      clsRiskFactors.push(`width/height未指定のiframe: ${iframesWithoutDimensions}件`);
    }
    // Ads or dynamic injection patterns
    if (html.includes("googlesyndication") || html.includes("adsbygoogle")) {
      clsRiskFactors.push("広告スクリプト検出（レイアウトシフトの原因になりやすい）");
    }
    // Web fonts without font-display
    const fontFacesCount = (html.match(/@font-face/gi) ?? []).length;
    if (fontFacesCount > 0 && !hasFontDisplay) {
      clsRiskFactors.push(`@font-faceにfont-display未設定（${fontFacesCount}件）`);
    }

    // Render-blocking resources
    const renderBlockingCss = (html.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) ?? [])
      .filter((tag) => !/\bmedia=["']print["']/i.test(tag) && !/\bmedia=["']not all["']/i.test(tag));
    const renderBlockingJs = scriptTags
      .filter((s) => !s.includes("application/ld+json") && !s.includes("application/json"))
      .filter((s) => !/\bdefer\b/i.test(s) && !/\basync\b/i.test(s) && !/type=["']module["']/i.test(s))
      .filter((s) => /\bsrc=["']/i.test(s)); // only external scripts
    const renderBlockingCount = renderBlockingCss.length + renderBlockingJs.length;

    // Inline CSS size
    const inlineStyles = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) ?? [];
    const inlineCssSize = inlineStyles.reduce((sum, s) => sum + new TextEncoder().encode(s).length, 0);

    // fetchpriority="high" on images
    const hasFetchPriority = allImgTags.some((tag) => /fetchpriority=["']high["']/i.test(tag));

    // PWA manifest detection
    let pwaManifest: CheckReport["pwaManifest"];
    // Check for manifest link in HTML first, then fallback to /manifest.json
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
        pwaManifest = {
          exists: true,
          hasName: !!(manifest.name || manifest.short_name),
          hasIcons: Array.isArray(manifest.icons) && manifest.icons.length > 0,
          hasStartUrl: !!manifest.start_url,
          hasDisplay: !!manifest.display,
          hasThemeColor: !!manifest.theme_color,
        };
      } catch {
        pwaManifest = { exists: true, hasName: false, hasIcons: false, hasStartUrl: false, hasDisplay: false, hasThemeColor: false };
      }
    }

    // Social meta extraction
    const twitterSiteMatch = html.match(/<meta[^>]*name=["']twitter:site["'][^>]*content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:site["']/i);
    const twitterCreatorMatch = html.match(/<meta[^>]*name=["']twitter:creator["'][^>]*content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:creator["']/i);
    const fbAppIdMatch = html.match(/<meta[^>]*property=["']fb:app_id["'][^>]*content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']fb:app_id["']/i);
    const ogSiteNameMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:site_name["']/i);
    const socialMeta: CheckReport["socialMeta"] = {
      twitterSite: twitterSiteMatch?.[1],
      twitterCreator: twitterCreatorMatch?.[1],
      fbAppId: fbAppIdMatch?.[1],
      ogSiteName: ogSiteNameMatch?.[1],
    };
    const hasSocialMeta = !!(socialMeta.twitterSite || socialMeta.fbAppId || socialMeta.ogSiteName);

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
      accessibility: {
        imgCount,
        imgWithAlt,
        hasSkipNav,
        ariaLandmarks,
        hasAriaLabels,
      },
      securityHeaders: {
        hasHsts,
        hasCsp,
        hasXFrameOptions,
        hasXContentTypeOptions,
        hasReferrerPolicy,
        score: secHeaderScore,
      },
      performanceHints: {
        preconnectCount,
        prefetchCount,
        lazyImageCount,
        totalImageCount,
        hasFontDisplay,
        hasModuleScripts,
        deferScriptCount,
        asyncScriptCount,
        totalScriptCount,
      },
      contentLanguage: contentLanguage || undefined,
      hreflangTags: hreflangTags.length > 0 ? hreflangTags : undefined,
      detectedTech: detectedTech.length > 0 ? detectedTech : undefined,
      ogImageAccessible,
      pwaManifest,
      socialMeta: hasSocialMeta ? socialMeta : undefined,
      contentEncoding: contentEncoding || undefined,
      serverHeader: serverHeader || undefined,
      coreWebVitals: {
        lcpCandidate: lcpCandidate,
        lcpImageCount: imgsWithoutDimensions,
        clsRiskFactors,
        renderBlockingCount,
        inlineCssSize,
        hasViewportMeta: /<meta[^>]*name=["']viewport["']/i.test(html),
        hasFetchPriority,
      },
    };

    return NextResponse.json(report, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        ...corsHeaders(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "チェック中にエラーが発生しました。", errorCode: "INTERNAL_ERROR" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
