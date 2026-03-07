import { NextRequest, NextResponse } from "next/server";
import type { CheckResult, CheckReport } from "@/lib/check-indicators";
import { getGrade } from "@/lib/check-indicators";

export const maxDuration = 30;

function isPrivateHostname(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return true;
  if (hostname.endsWith(".local") || hostname.endsWith(".internal")) return true;
  const parts = hostname.split(".");
  if (parts.length === 4 && parts.every((p) => /^\d+$/.test(p))) {
    const [a, b] = parts.map(Number);
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    if (a === 0 || a === 127) return true;
  }
  return false;
}

async function safeFetch(url: string, timeoutMs = 10000): Promise<{ ok: boolean; text: string }> {
  try {
    const parsed = new URL(url);
    if (isPrivateHostname(parsed.hostname)) return { ok: false, text: "" };
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "follow",
      headers: { "User-Agent": "AI-Check-Bot/1.0" },
    });
    if (!res.ok) return { ok: false, text: "" };
    const text = await res.text();
    return { ok: true, text };
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

  const aiCrawlers = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "Anthropic"];
  const blocked = aiCrawlers.filter((c) => {
    const pattern = new RegExp(`User-agent:\\s*${c}[\\s\\S]*?Disallow:\\s*/`, "i");
    return pattern.test(robotsText);
  });
  const allowed = aiCrawlers.length - blocked.length;

  if (blocked.length === 0) {
    return {
      id: "robots-txt",
      score: 15,
      maxScore: 15,
      status: "pass",
      message: "AIクローラーアクセス: 全て許可",
      details: `robots.txtが存在し、主要AIクローラー（${aiCrawlers.join(", ")}）がブロックされていません。`,
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
    return {
      id: "llms-txt",
      score: 15,
      maxScore: 15,
      status: "pass",
      message: "llms.txt: 存在",
      details: `llms.txtが存在し、${llmsText.length}文字の内容があります。AIエージェントがサイト情報を理解できます。`,
    };
  }

  return {
    id: "llms-txt",
    score: 10,
    maxScore: 15,
    status: "warn",
    message: "llms.txt: 内容が少ない",
    details: "llms.txtは存在しますが、内容が少ないです。サイト概要、主要ページ、API情報等を追記することを推奨します。",
  };
}

function checkStructuredData(html: string, baseUrl: string): CheckResult {
  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatches && jsonLdMatches.length > 0) {
    return {
      id: "structured-data",
      score: 20,
      maxScore: 20,
      status: "pass",
      message: `構造化データ: ${jsonLdMatches.length}件のJSON-LDを検出`,
      details: "JSON-LD構造化データが適切に設置されています。AI検索エンジンがコンテンツを正確に理解できます。",
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

function checkMetaTags(html: string): CheckResult {
  const hasTitle = /<title[^>]*>.+?<\/title>/i.test(html);
  const hasDescription = /<meta[^>]*name=["']description["'][^>]*content=["'][^"']+["']/i.test(html);
  const hasOgTitle = /<meta[^>]*property=["']og:title["']/i.test(html);
  const hasOgDesc = /<meta[^>]*property=["']og:description["']/i.test(html);
  const metaScore = [hasTitle, hasDescription, hasOgTitle, hasOgDesc].filter(Boolean).length;

  if (metaScore >= 4) {
    return {
      id: "meta-tags",
      score: 15,
      maxScore: 15,
      status: "pass",
      message: "メタタグ: 完全",
      details: "title, description, OGPタグが適切に設定されています。",
    };
  } else if (metaScore >= 2) {
    const missing = [];
    if (!hasTitle) missing.push("title");
    if (!hasDescription) missing.push("meta description");
    if (!hasOgTitle) missing.push("og:title");
    if (!hasOgDesc) missing.push("og:description");
    return {
      id: "meta-tags",
      score: 8,
      maxScore: 15,
      status: "warn",
      message: "メタタグ: 一部不足",
      details: `以下のメタタグが不足しています: ${missing.join(", ")}`,
    };
  }
  return {
    id: "meta-tags",
    score: 0,
    maxScore: 15,
    status: "fail",
    message: "メタタグ: 不足",
    details: "基本的なメタタグ（title, description, OGP）が不足しています。",
  };
}

function checkContentStructure(html: string): CheckResult {
  const hasH1 = /<h1[^>]*>/i.test(html);
  const hasArticle = /<article[^>]*>/i.test(html);
  const hasSection = /<section[^>]*>/i.test(html);
  const hasNav = /<nav[^>]*>/i.test(html);
  const hasMain = /<main[^>]*>/i.test(html);
  const structScore = [hasH1, hasArticle || hasSection, hasNav, hasMain].filter(Boolean).length;

  if (structScore >= 3) {
    return {
      id: "content-structure",
      score: 15,
      maxScore: 15,
      status: "pass",
      message: "コンテンツ構造: セマンティックHTML使用",
      details: "h1, article/section, nav, main等のセマンティックHTMLタグが適切に使用されています。",
    };
  } else if (structScore >= 1) {
    return {
      id: "content-structure",
      score: 8,
      maxScore: 15,
      status: "warn",
      message: "コンテンツ構造: 改善の余地あり",
      details: "一部のセマンティックHTMLタグが使用されていますが、article, section, nav, main等の追加を推奨します。",
    };
  }
  return {
    id: "content-structure",
    score: 0,
    maxScore: 15,
    status: "fail",
    message: "コンテンツ構造: セマンティックHTML未使用",
    details: "セマンティックHTMLタグが見つかりません。AIが文書構造を理解しにくい状態です。",
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
    return {
      id: "sitemap",
      score: 10,
      maxScore: 10,
      status: "pass",
      message: `サイトマップ: ${urlCount}ページ検出`,
      details: "sitemap.xmlが存在し、適切にページが登録されています。",
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

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URLを入力してください。" }, { status: 400 });
    }

    if (url.length > 2048) {
      return NextResponse.json({ error: "URLが長すぎます。2048文字以内にしてください。" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "有効なURLを入力してください。" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "http または https のURLを入力してください。" }, { status: 400 });
    }

    if (isPrivateHostname(parsedUrl.hostname)) {
      return NextResponse.json({ error: "プライベートネットワークのURLはチェックできません。" }, { status: 400 });
    }

    const baseUrl = parsedUrl.origin;

    // Fetch all resources concurrently
    const [robotsRes, llmsRes, pageRes, sitemapRes] = await Promise.all([
      safeFetch(`${baseUrl}/robots.txt`),
      safeFetch(`${baseUrl}/llms.txt`),
      safeFetch(url, 15000),
      safeFetch(`${baseUrl}/sitemap.xml`),
    ]);

    const robotsText = robotsRes.ok ? robotsRes.text : (robotsRes.text === "" ? null : "");
    const llmsText = llmsRes.ok ? llmsRes.text : (llmsRes.text === "" ? null : "");
    const html = pageRes.text;
    const sitemapText = sitemapRes.ok ? sitemapRes.text : (sitemapRes.text === "" ? null : "");

    const results: CheckResult[] = [
      checkRobotsTxt(robotsText, baseUrl),
      checkLlmsTxt(llmsText, parsedUrl.hostname, baseUrl),
      checkStructuredData(html, baseUrl),
      checkMetaTags(html),
      checkContentStructure(html),
      checkSSR(html),
      checkSitemap(sitemapText, baseUrl),
    ];

    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const maxScore = results.reduce((sum, r) => sum + r.maxScore, 0);

    const report: CheckReport = {
      url,
      totalScore,
      maxScore,
      grade: getGrade(totalScore, maxScore),
      results,
      checkedAt: new Date().toISOString(),
    };

    return NextResponse.json(report);
  } catch {
    return NextResponse.json({ error: "チェック中にエラーが発生しました。" }, { status: 500 });
  }
}
