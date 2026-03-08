import { NextRequest, NextResponse } from "next/server";
import { corsHeaders, corsOptionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    if (!type || !data) {
      return NextResponse.json(
        { error: "type と data パラメータが必要です。" },
        { status: 400 }
      );
    }

    // Guard against oversized payloads
    const dataStr = JSON.stringify(data);
    if (dataStr.length > 50_000) {
      return NextResponse.json(
        { error: "入力データが大きすぎます。" },
        { status: 400 }
      );
    }

    switch (type) {
      case "llms-txt": {
        const { siteName, siteUrl, description, pages, apiInfo } = data;
        if (!siteName || !siteUrl) {
          return NextResponse.json(
            { error: "siteName と siteUrl は必須です。" },
            { status: 400 }
          );
        }
        const lines: string[] = [];
        lines.push(`# ${siteName}`);
        lines.push("");
        if (description) {
          lines.push(`> ${description}`);
          lines.push("");
        }
        if (pages) {
          lines.push("## 主要ページ");
          (Array.isArray(pages) ? pages : pages.split(/\r?\n/))
            .filter((p: string) => p.trim())
            .forEach((p: string) => lines.push(`- ${p.trim()}`));
          lines.push("");
        }
        if (apiInfo) {
          lines.push("## API");
          lines.push(apiInfo);
          lines.push("");
        }
        lines.push("## 連絡先");
        lines.push(`- サイト: ${siteUrl}`);

        return NextResponse.json({
          success: true,
          type: "llms-txt",
          content: lines.join("\n"),
          filename: "llms.txt",
        });
      }

      case "robots-txt": {
        const { sitemapUrl, allowedCrawlers } = data;
        const crawlers = allowedCrawlers ?? [
          "GPTBot",
          "ClaudeBot",
          "PerplexityBot",
          "Google-Extended",
        ];
        const lines: string[] = [
          "# robots.txt - AIクローラー対応",
          "",
          "User-agent: *",
          "Allow: /",
          "",
        ];
        crawlers.forEach((c: string) => {
          lines.push(`User-agent: ${c}`);
          lines.push("Allow: /");
          lines.push("");
        });
        if (sitemapUrl) {
          lines.push(`Sitemap: ${sitemapUrl}`);
        }

        return NextResponse.json({
          success: true,
          type: "robots-txt",
          content: lines.join("\n"),
          filename: "robots.txt",
        });
      }

      default:
        return NextResponse.json(
          { error: `未対応の生成タイプ: ${type}` },
          { status: 400 }
        );
    }
  } catch {
    return NextResponse.json(
      { error: "生成中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}
