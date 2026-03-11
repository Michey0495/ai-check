// 7 indicator checkers for GEO score

import type { CheckResult } from "@/lib/check-indicators";

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
  if (!required) return { type, valid: true, missing: [] };
  const missing = required.filter((prop) => !item[prop]);
  return { type, valid: missing.length === 0, missing };
}

export const AI_CRAWLERS = ["GPTBot", "ChatGPT-User", "ClaudeBot", "anthropic-ai", "PerplexityBot", "Google-Extended", "Bytespider", "CCBot", "Applebot-Extended", "cohere-ai"];

export function analyzeAiCrawlerStatus(robotsText: string | null): { name: string; allowed: boolean }[] {
  if (robotsText === null || robotsText === "") {
    return AI_CRAWLERS.map((name) => ({ name, allowed: true }));
  }
  const hasGlobalBlock = /User-agent:\s*\*\s*\n(?:(?!User-agent:)[^\n]*\n)*?\s*Disallow:\s*\/\s*$/im.test(robotsText);
  return AI_CRAWLERS.map((c) => {
    const escaped = c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const hasSpecificAllow = new RegExp(`User-agent:\\s*${escaped}\\s*\\n(?:(?!User-agent:)[^\\n]*\\n)*?\\s*Allow:\\s*/`, "i").test(robotsText);
    if (hasSpecificAllow) return { name: c, allowed: true };
    const pattern = new RegExp(`User-agent:\\s*${escaped}\\s*\\n(?:(?!User-agent:)[^\\n]*\\n)*?\\s*Disallow:\\s*/`, "i");
    if (pattern.test(robotsText)) return { name: c, allowed: false };
    return { name: c, allowed: !hasGlobalBlock };
  });
}

export function checkRobotsTxt(robotsText: string | null, baseUrl: string): CheckResult {
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

  const hasGlobalBlock = /User-agent:\s*\*\s*\n(?:(?!User-agent:)[^\n]*\n)*?\s*Disallow:\s*\/\s*$/im.test(robotsText);
  const aiCrawlers = ["GPTBot", "ChatGPT-User", "ClaudeBot", "anthropic-ai", "PerplexityBot", "Google-Extended", "Bytespider", "CCBot", "Applebot-Extended", "cohere-ai"];

  const blocked = aiCrawlers.filter((c) => {
    const escaped = c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const hasSpecificAllow = new RegExp(`User-agent:\\s*${escaped}\\s*\\n(?:(?!User-agent:)[^\\n]*\\n)*?\\s*Allow:\\s*/`, "i").test(robotsText);
    if (hasSpecificAllow) return false;
    const pattern = new RegExp(`User-agent:\\s*${escaped}\\s*\\n(?:(?!User-agent:)[^\\n]*\\n)*?\\s*Disallow:\\s*/`, "i");
    if (pattern.test(robotsText)) return true;
    return hasGlobalBlock;
  });
  const allowed = aiCrawlers.length - blocked.length;

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

export function checkLlmsTxt(llmsText: string | null, hostname: string, baseUrl: string): CheckResult {
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

export function checkStructuredData(html: string, baseUrl: string): CheckResult {
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

export function checkMetaTags(html: string, responseHeaders?: Record<string, string>): CheckResult {
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

  const robotsMetaMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']robots["']/i);
  const robotsContent = robotsMetaMatch?.[1]?.toLowerCase() ?? "";
  const xRobotsTag = responseHeaders?.["x-robots-tag"]?.toLowerCase() ?? "";
  const hasNoindex = robotsContent.includes("noindex") || xRobotsTag.includes("noindex");

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

export function checkContentStructure(html: string): CheckResult {
  const hasH1 = /<h1[^>]*>/i.test(html);
  const hasArticle = /<article[^>]*>/i.test(html);
  const hasSection = /<section[^>]*>/i.test(html);
  const hasNav = /<nav[^>]*>/i.test(html);
  const hasMain = /<main[^>]*>/i.test(html);
  const structScore = [hasH1, hasArticle || hasSection, hasNav, hasMain].filter(Boolean).length;

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

  const h1TextMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1Text = h1TextMatch?.[1]?.replace(/<[^>]+>/g, "").trim().slice(0, 80) ?? "";
  const h1Info = h1Text ? ` h1: 「${h1Text}${h1Text.length >= 80 ? "..." : ""}」。` : "";

  const headingSummary = headingLevels.length > 0
    ? ` 見出し構成: ${[...new Set(headingLevels)].sort().map((l) => `h${l}`).join(", ")}（計${headingLevels.length}個）。`
    : "";

  if (structScore >= 3) {
    if (!hierarchyOk) {
      return {
        id: "content-structure",
        score: 12,
        maxScore: 15,
        status: "warn",
        message: "コンテンツ構造: セマンティックHTML使用（見出し階層に改善余地）",
        details: `h1, article/section, nav, main等のセマンティックHTMLタグが使用されています。${h1Info}${headingSummary}${hierarchyNote}`,
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

export function checkSSR(html: string): CheckResult {
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

export function checkSitemap(sitemapText: string | null, baseUrl: string): CheckResult {
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
