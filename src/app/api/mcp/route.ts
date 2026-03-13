import { NextRequest, NextResponse } from "next/server";
import { corsHeaders, corsOptionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return corsOptionsResponse();
}

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
  {
    name: "generate_json_ld",
    description: "JSON-LD構造化データを生成します。WebSite、Organization、FAQPage、HowToなど複数のスキーマタイプに対応。",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["WebSite", "Organization", "FAQPage", "HowTo", "Product", "Article"],
          description: "構造化データのスキーマタイプ",
        },
        name: { type: "string", description: "名前（サイト名、組織名、記事タイトル等）" },
        url: { type: "string", description: "対象URL" },
        description: { type: "string", description: "説明文" },
        data: {
          type: "object",
          description: "スキーマタイプ固有の追加データ（FAQのquestions配列、HowToのsteps配列等）",
        },
      },
      required: ["type", "name", "url"],
    },
  },
  {
    name: "generate_agent_json",
    description: "A2A Agent Card（agent.json）を生成します。Google A2A Protocolに準拠したAIエージェント能力宣言ファイル。",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "サービス名" },
        description: { type: "string", description: "サービス説明" },
        url: { type: "string", description: "サービスURL" },
        version: { type: "string", description: "バージョン（デフォルト: 1.0.0）" },
        capabilities: {
          type: "array",
          items: { type: "string" },
          description: "サービスの機能リスト",
        },
        apiEndpoints: {
          type: "array",
          items: { type: "string" },
          description: "APIエンドポイントのリスト",
        },
      },
      required: ["name", "url"],
    },
  },
];

function sanitizeLine(str: string): string {
  return str.replace(/[\r\n]/g, " ").trim();
}

function jsonRpcResponse(data: object, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return jsonRpcResponse(
        { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null },
        400
      );
    }
    const jsonrpc = body.jsonrpc;
    const method = body.method;
    const id = body.id;
    const params = body.params as Record<string, unknown> | undefined;

    if (jsonrpc !== "2.0" || typeof method !== "string") {
      return jsonRpcResponse(
        { jsonrpc: "2.0", error: { code: -32600, message: "Invalid Request" }, id },
        400
      );
    }

    switch (method) {
      case "initialize":
        return jsonRpcResponse({
          jsonrpc: "2.0",
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: { name: "AI Check MCP Server", version: "1.0.0" },
          },
          id,
        });

      case "tools/list":
        return jsonRpcResponse({
          jsonrpc: "2.0",
          result: { tools: TOOLS },
          id,
        });

      case "tools/call": {
        const toolName = params?.name;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const args = (params?.arguments ?? {}) as Record<string, any>;

        if (toolName === "check_geo_score") {
          const checkRes = await fetch(new URL("/api/check", request.url), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: args.url }),
          });
          const result = await checkRes.json();
          return jsonRpcResponse({
            jsonrpc: "2.0",
            result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] },
            id,
          });
        }

        if (toolName === "generate_llms_txt") {
          const lines: string[] = [];
          lines.push(`# ${sanitizeLine(args.siteName ?? "")}`);
          lines.push("");
          if (args.description) {
            lines.push(`> ${sanitizeLine(args.description)}`);
            lines.push("");
          }
          if (args.pages?.length) {
            lines.push("## 主要ページ");
            args.pages.forEach((p: string) => lines.push(`- ${sanitizeLine(p)}`));
            lines.push("");
          }
          lines.push("## 連絡先");
          lines.push(`- サイト: ${sanitizeLine(args.siteUrl ?? "")}`);

          return jsonRpcResponse({
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
            lines.push(`User-agent: ${sanitizeLine(c)}`);
            lines.push("Allow: /");
            lines.push("");
          });
          if (args.sitemapUrl) {
            lines.push(`Sitemap: ${sanitizeLine(args.sitemapUrl)}`);
          }

          return jsonRpcResponse({
            jsonrpc: "2.0",
            result: { content: [{ type: "text", text: lines.join("\n") }] },
            id,
          });
        }

        if (toolName === "generate_json_ld") {
          const validTypes = ["WebSite", "Organization", "FAQPage", "HowTo", "Product", "Article"];
          const schemaType = args.type;
          if (!validTypes.includes(schemaType)) {
            return jsonRpcResponse({
              jsonrpc: "2.0",
              error: { code: -32602, message: `Invalid schema type: ${schemaType}. Must be one of: ${validTypes.join(", ")}` },
              id,
            });
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let jsonLd: Record<string, any> = {
            "@context": "https://schema.org",
            "@type": schemaType,
            name: args.name,
            url: args.url,
          };

          if (args.description) {
            jsonLd.description = args.description;
          }

          const extra = args.data ?? {};

          if (schemaType === "FAQPage" && Array.isArray(extra.questions)) {
            jsonLd.mainEntity = extra.questions
              .filter((q: { question?: string; answer?: string }) => q.question && q.answer)
              .map((q: { question: string; answer: string }) => ({
                "@type": "Question",
                name: q.question,
                acceptedAnswer: { "@type": "Answer", text: q.answer },
              }));
          } else if (schemaType === "HowTo" && Array.isArray(extra.steps)) {
            jsonLd.step = extra.steps
              .filter((s: { name?: string; text?: string }) => s.name && s.text)
              .map((s: { name: string; text: string }, i: number) => ({
                "@type": "HowToStep",
                position: i + 1,
                name: s.name,
                text: s.text,
              }));
          } else if (schemaType === "Organization") {
            if (extra.logo) jsonLd.logo = extra.logo;
            if (extra.sameAs) jsonLd.sameAs = extra.sameAs;
          } else if (schemaType === "Product") {
            if (extra.brand) jsonLd.brand = { "@type": "Brand", name: extra.brand };
            if (extra.offers) jsonLd.offers = { "@type": "Offer", ...extra.offers };
          } else if (schemaType === "Article") {
            if (extra.author) jsonLd.author = { "@type": "Person", name: extra.author };
            if (extra.datePublished) jsonLd.datePublished = extra.datePublished;
            if (extra.image) jsonLd.image = extra.image;
          }

          if (extra.additionalProperties) {
            jsonLd = { ...jsonLd, ...extra.additionalProperties };
          }

          const script = `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
          return jsonRpcResponse({
            jsonrpc: "2.0",
            result: { content: [{ type: "text", text: script }] },
            id,
          });
        }

        if (toolName === "generate_agent_json") {
          const agentCard = {
            name: args.name,
            description: args.description ?? "",
            url: args.url,
            version: args.version ?? "1.0.0",
            capabilities: args.capabilities ?? [],
            api_endpoints: args.apiEndpoints ?? [],
            protocol: "a2a",
            authentication: { type: "none" },
          };

          return jsonRpcResponse({
            jsonrpc: "2.0",
            result: { content: [{ type: "text", text: JSON.stringify(agentCard, null, 2) }] },
            id,
          });
        }

        return jsonRpcResponse({
          jsonrpc: "2.0",
          error: { code: -32601, message: `Unknown tool: ${toolName}` },
          id,
        });
      }

      default:
        return jsonRpcResponse({
          jsonrpc: "2.0",
          error: { code: -32601, message: "Method not found" },
          id,
        });
    }
  } catch {
    return jsonRpcResponse(
      { jsonrpc: "2.0", error: { code: -32603, message: "Internal error" }, id: null },
      500
    );
  }
}
