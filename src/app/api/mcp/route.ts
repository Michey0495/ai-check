import { NextRequest, NextResponse } from "next/server";

const TOOLS = [
  {
    name: "check_geo_score",
    description: "WebサイトのAI検索対応度（GEOスコア）をチェックします。URLを入力すると7つの指標でスコアを算出します。",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "チェックするWebサイトのURL" },
      },
      required: ["url"],
    },
  },
  {
    name: "generate_llms_txt",
    description: "AI向けサイト説明ファイル（llms.txt）を生成します。",
    inputSchema: {
      type: "object",
      properties: {
        siteName: { type: "string", description: "サイト名" },
        siteUrl: { type: "string", description: "サイトURL" },
        description: { type: "string", description: "サイト説明" },
        pages: {
          type: "array",
          items: { type: "string" },
          description: "主要ページのリスト",
        },
      },
      required: ["siteName", "siteUrl"],
    },
  },
  {
    name: "generate_robots_txt",
    description: "AIクローラー対応のrobots.txtを生成します。",
    inputSchema: {
      type: "object",
      properties: {
        sitemapUrl: { type: "string", description: "サイトマップURL" },
        allowedCrawlers: {
          type: "array",
          items: { type: "string" },
          description: "許可するAIクローラーのリスト",
        },
      },
      required: [],
    },
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jsonrpc, method, id, params } = body;

    if (jsonrpc !== "2.0") {
      return NextResponse.json(
        { jsonrpc: "2.0", error: { code: -32600, message: "Invalid Request" }, id },
        { status: 400 }
      );
    }

    switch (method) {
      case "initialize":
        return NextResponse.json({
          jsonrpc: "2.0",
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: { name: "AI Check MCP Server", version: "1.0.0" },
          },
          id,
        });

      case "tools/list":
        return NextResponse.json({
          jsonrpc: "2.0",
          result: { tools: TOOLS },
          id,
        });

      case "tools/call": {
        const toolName = params?.name;
        const args = params?.arguments ?? {};

        if (toolName === "check_geo_score") {
          const checkRes = await fetch(new URL("/api/check", request.url), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: args.url }),
          });
          const result = await checkRes.json();
          return NextResponse.json({
            jsonrpc: "2.0",
            result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] },
            id,
          });
        }

        if (toolName === "generate_llms_txt") {
          const lines: string[] = [];
          lines.push(`# ${args.siteName}`);
          lines.push("");
          if (args.description) {
            lines.push(`> ${args.description}`);
            lines.push("");
          }
          if (args.pages?.length) {
            lines.push("## 主要ページ");
            args.pages.forEach((p: string) => lines.push(`- ${p}`));
            lines.push("");
          }
          lines.push("## 連絡先");
          lines.push(`- サイト: ${args.siteUrl}`);

          return NextResponse.json({
            jsonrpc: "2.0",
            result: { content: [{ type: "text", text: lines.join("\n") }] },
            id,
          });
        }

        if (toolName === "generate_robots_txt") {
          const crawlers = args.allowedCrawlers ?? [
            "GPTBot",
            "ClaudeBot",
            "PerplexityBot",
            "Google-Extended",
          ];
          const lines: string[] = ["User-agent: *", "Allow: /", ""];
          crawlers.forEach((c: string) => {
            lines.push(`User-agent: ${c}`);
            lines.push("Allow: /");
            lines.push("");
          });
          if (args.sitemapUrl) {
            lines.push(`Sitemap: ${args.sitemapUrl}`);
          }

          return NextResponse.json({
            jsonrpc: "2.0",
            result: { content: [{ type: "text", text: lines.join("\n") }] },
            id,
          });
        }

        return NextResponse.json({
          jsonrpc: "2.0",
          error: { code: -32601, message: `Unknown tool: ${toolName}` },
          id,
        });
      }

      default:
        return NextResponse.json({
          jsonrpc: "2.0",
          error: { code: -32601, message: "Method not found" },
          id,
        });
    }
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32603, message: "Internal error" }, id: null },
      { status: 500 }
    );
  }
}
