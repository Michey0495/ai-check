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

const MAX_ARRAY_ITEMS = 50;

function sanitizeLine(str: string): string {
  return str.replace(/[\r\n]/g, " ").trim().slice(0, 500);
}

function limitArray<T>(arr: unknown, max = MAX_ARRAY_ITEMS): T[] {
  return Array.isArray(arr) ? arr.slice(0, max) : [];
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
        const args = (params?.arguments ?? {}) as Record<string, unknown>;

        if (toolName === "check_geo_score") {
          if (typeof args.url !== "string" || !args.url.trim()) {
            return jsonRpcResponse({
              jsonrpc: "2.0",
              error: { code: -32602, message: "url must be a non-empty string" },
              id,
            });
          }
          if (args.url.length > 2048) {
            return jsonRpcResponse({
              jsonrpc: "2.0",
              error: { code: -32602, message: "url exceeds 2048 characters" },
              id,
            });
          }
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
          lines.push(`# ${sanitizeLine(String(args.siteName ?? ""))}`);
          lines.push("");
          if (args.description) {
            lines.push(`> ${sanitizeLine(String(args.description))}`);
            lines.push("");
          }
          if (Array.isArray(args.pages) && args.pages.length > 0) {
            lines.push("## 主要ページ");
            limitArray<string>(args.pages)
              .filter((p): p is string => typeof p === "string")
              .forEach((p) => lines.push(`- ${sanitizeLine(p)}`));
            lines.push("");
          }
          lines.push("## 連絡先");
          lines.push(`- サイト: ${sanitizeLine(String(args.siteUrl ?? ""))}`);

          return jsonRpcResponse({
            jsonrpc: "2.0",
            result: { content: [{ type: "text", text: lines.join("\n") }] },
            id,
          });
        }

        if (toolName === "generate_robots_txt") {
          const crawlers = Array.isArray(args.allowedCrawlers)
            ? limitArray<string>(args.allowedCrawlers).filter((c): c is string => typeof c === "string")
            : ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"];
          const lines: string[] = ["User-agent: *", "Allow: /", ""];
          crawlers.forEach((c: string) => {
            lines.push(`User-agent: ${sanitizeLine(c)}`);
            lines.push("Allow: /");
            lines.push("");
          });
          if (typeof args.sitemapUrl === "string") {
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
          const schemaType = String(args.type ?? "").slice(0, 50);
          if (!validTypes.includes(schemaType)) {
            return jsonRpcResponse({
              jsonrpc: "2.0",
              error: { code: -32602, message: `Invalid schema type. Must be one of: ${validTypes.join(", ")}` },
              id,
            });
          }
          const jsonLd: Record<string, unknown> = {
            "@context": "https://schema.org",
            "@type": schemaType,
            name: args.name,
            url: args.url,
          };

          if (args.description) {
            jsonLd.description = args.description;
          }

          const extra = (typeof args.data === "object" && args.data !== null ? args.data : {}) as Record<string, unknown>;

          if (schemaType === "FAQPage" && Array.isArray(extra.questions)) {
            jsonLd.mainEntity = limitArray<{ question?: string; answer?: string }>(extra.questions)
              .filter((q): q is { question: string; answer: string } => !!q.question && !!q.answer)
              .map((q) => ({
                "@type": "Question",
                name: q.question,
                acceptedAnswer: { "@type": "Answer", text: q.answer },
              }));
          } else if (schemaType === "HowTo" && Array.isArray(extra.steps)) {
            jsonLd.step = limitArray<{ name?: string; text?: string }>(extra.steps)
              .filter((s): s is { name: string; text: string } => !!s.name && !!s.text)
              .map((s, i) => ({
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
            if (typeof extra.offers === "object" && extra.offers !== null) jsonLd.offers = { "@type": "Offer", ...extra.offers };
          } else if (schemaType === "Article") {
            if (extra.author) jsonLd.author = { "@type": "Person", name: extra.author };
            if (extra.datePublished) jsonLd.datePublished = extra.datePublished;
            if (extra.image) jsonLd.image = extra.image;
          }

          if (extra.additionalProperties && typeof extra.additionalProperties === "object" && !Array.isArray(extra.additionalProperties)) {
            const ALLOWED_EXTRA = ["sameAs", "image", "logo", "alternateName", "disambiguatingDescription", "inLanguage", "keywords"];
            for (const [key, value] of Object.entries(extra.additionalProperties as Record<string, unknown>)) {
              if (ALLOWED_EXTRA.includes(key) && !key.startsWith("@")) {
                // Only allow primitive values or arrays of strings
                if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
                  jsonLd[key] = value;
                } else if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
                  jsonLd[key] = value;
                }
              }
            }
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
            description: String(args.description ?? ""),
            url: args.url,
            version: String(args.version ?? "1.0.0"),
            capabilities: limitArray<string>(args.capabilities),
            api_endpoints: limitArray<string>(args.apiEndpoints),
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
          error: { code: -32601, message: "Unknown tool" },
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
