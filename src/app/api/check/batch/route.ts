import { NextRequest, NextResponse } from "next/server";
import { corsHeaders, corsOptionsResponse } from "@/lib/cors";
import { checkRateLimit, RATE_LIMIT } from "@/lib/check-engine/security";

export async function OPTIONS() {
  return corsOptionsResponse();
}

export const maxDuration = 60;

const BATCH_MAX = 10;
const PER_URL_TIMEOUT_MS = 15000;

export async function POST(request: NextRequest) {
  try {
    // Parse body first to know URL count for rate limiting
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

    let body: { urls?: string[] };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "リクエストボディが不正です。JSON形式で送信してください。", errorCode: "INVALID_BODY" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "urlsフィールドに1つ以上のURLを配列で指定してください。", errorCode: "MISSING_URLS" },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (urls.length > BATCH_MAX) {
      return NextResponse.json(
        { error: `一度にチェックできるURLは最大${BATCH_MAX}件です。`, errorCode: "BATCH_LIMIT_EXCEEDED" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Validate all URLs first
    for (const url of urls) {
      if (typeof url !== "string" || !url.trim()) {
        return NextResponse.json(
          { error: "無効なURLが含まれています。すべてのURLを文字列で指定してください。", errorCode: "INVALID_URL" },
          { status: 400, headers: corsHeaders() }
        );
      }
      try {
        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          return NextResponse.json(
            { error: `http/httpsのURLを指定してください: ${url}`, errorCode: "INVALID_PROTOCOL" },
            { status: 400, headers: corsHeaders() }
          );
        }
      } catch {
        return NextResponse.json(
          { error: `有効なURLを指定してください: ${url}`, errorCode: "INVALID_URL" },
          { status: 400, headers: corsHeaders() }
        );
      }
    }

    // Rate limit: consume 1 slot per URL in the batch
    const rateResult = checkRateLimit(ip, urls.length);

    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: "リクエスト回数の上限に達しました。しばらく待ってから再度お試しください。", errorCode: "RATE_LIMITED" },
        {
          status: 429,
          headers: {
            ...corsHeaders(),
            "X-RateLimit-Limit": String(RATE_LIMIT),
            "X-RateLimit-Remaining": String(rateResult.remaining),
            "X-RateLimit-Reset": String(Math.ceil(rateResult.resetAt / 1000)),
            "Retry-After": String(Math.ceil((rateResult.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    // Call the single check API for each URL concurrently
    // Use x-batch-internal header to skip double rate-limiting on internal calls
    const baseApiUrl = request.nextUrl.origin;
    const results = await Promise.all(
      urls.map(async (url) => {
        try {
          const res = await fetch(`${baseApiUrl}/api/check`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": ip,
              "x-batch-internal": "1",
            },
            body: JSON.stringify({ url }),
            signal: AbortSignal.timeout(PER_URL_TIMEOUT_MS),
          });
          const data = await res.json();
          return { url, status: res.ok ? ("ok" as const) : ("error" as const), ...data };
        } catch (e) {
          const isTimeout = e instanceof Error && e.name === "AbortError";
          return {
            url,
            status: "error" as const,
            error: isTimeout
              ? "チェックがタイムアウトしました。サイトの応答が遅い可能性があります。"
              : "チェック中にエラーが発生しました。",
          };
        }
      })
    );

    return NextResponse.json(
      { results, count: results.length },
      {
        headers: {
          ...corsHeaders(),
          "X-RateLimit-Limit": String(RATE_LIMIT),
          "X-RateLimit-Remaining": String(rateResult.remaining),
          "X-RateLimit-Reset": String(Math.ceil(rateResult.resetAt / 1000)),
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "バッチチェック中にエラーが発生しました。", errorCode: "INTERNAL_ERROR" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
