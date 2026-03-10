import { NextRequest, NextResponse } from "next/server";
import { corsHeaders, corsOptionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return corsOptionsResponse();
}

export const maxDuration = 60;

const BATCH_MAX = 10;

export async function POST(request: NextRequest) {
  try {
    let body: { urls?: string[] };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "リクエストボディが不正です。JSON形式で送信してください。" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "urlsフィールドに1つ以上のURLを配列で指定してください。" },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (urls.length > BATCH_MAX) {
      return NextResponse.json(
        { error: `一度にチェックできるURLは最大${BATCH_MAX}件です。` },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Validate all URLs first
    for (const url of urls) {
      if (typeof url !== "string" || !url.trim()) {
        return NextResponse.json(
          { error: `無効なURLが含まれています: ${url}` },
          { status: 400, headers: corsHeaders() }
        );
      }
      try {
        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          return NextResponse.json(
            { error: `http/httpsのURLを指定してください: ${url}` },
            { status: 400, headers: corsHeaders() }
          );
        }
      } catch {
        return NextResponse.json(
          { error: `有効なURLを指定してください: ${url}` },
          { status: 400, headers: corsHeaders() }
        );
      }
    }

    // Call the single check API for each URL concurrently
    const baseApiUrl = request.nextUrl.origin;
    const results = await Promise.all(
      urls.map(async (url) => {
        try {
          const res = await fetch(`${baseApiUrl}/api/check`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": request.headers.get("x-forwarded-for") ?? "unknown",
            },
            body: JSON.stringify({ url }),
            signal: AbortSignal.timeout(25000),
          });
          const data = await res.json();
          return { url, status: res.ok ? ("ok" as const) : ("error" as const), ...data };
        } catch {
          return { url, status: "error" as const, error: "チェックに失敗しました。" };
        }
      })
    );

    return NextResponse.json(
      { results, count: results.length },
      { headers: corsHeaders() }
    );
  } catch {
    return NextResponse.json(
      { error: "バッチチェック中にエラーが発生しました。" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
