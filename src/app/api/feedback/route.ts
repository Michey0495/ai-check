import { NextRequest, NextResponse } from "next/server";

const feedbackRateMap = new Map<string, { count: number; resetAt: number }>();
const FEEDBACK_RATE_LIMIT = 5;
const FEEDBACK_RATE_WINDOW_MS = 300_000;

function checkFeedbackRate(ip: string): boolean {
  const now = Date.now();
  if (feedbackRateMap.size > 5_000) {
    for (const [key, val] of feedbackRateMap) {
      if (now > val.resetAt) feedbackRateMap.delete(key);
    }
  }
  const entry = feedbackRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    feedbackRateMap.set(ip, { count: 1, resetAt: now + FEEDBACK_RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= FEEDBACK_RATE_LIMIT) return false;
  entry.count++;
  return true;
}

/**
 * POST /api/feedback
 * フィードバックを受け取り GitHub Issue として自動作成
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkFeedbackRate(ip)) {
    return NextResponse.json({ error: "送信回数の上限に達しました。しばらくお待ちください。" }, { status: 429 });
  }

  let parsed;
  try {
    parsed = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { type, message, repo } = parsed;

  const ALLOWED_TYPES = ["bug", "feature", "other"];
  if (!type || !ALLOWED_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid feedback type" }, { status: 400 });
  }

  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  if (message.length > 2_000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  const ALLOWED_REPOS = ["ai-check"];
  const targetRepo = typeof repo === "string" && ALLOWED_REPOS.includes(repo) ? repo : "ai-check";

  const labels: Record<string, string> = {
    bug: "bug",
    feature: "enhancement",
    other: "feedback",
  };

  const title = `[${type}] ${message.slice(0, 80)}${message.length > 80 ? "..." : ""}`;
  const body = `## User Feedback\n\n**Type:** ${type}\n\n**Message:**\n${message}\n\n---\n*Auto-created from in-app feedback widget*`;

  // GitHub Personal Access Token (set in Vercel env vars)
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.warn("GITHUB_TOKEN not set — feedback will not create GitHub issues");
  }

  if (token) {
    try {
      const res = await fetch(`https://api.github.com/repos/Michey0495/${targetRepo}/issues`, {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          body,
          labels: [labels[type] || "feedback"],
        }),
      });
      if (!res.ok) {
        console.error("GitHub issue creation failed:", res.status);
        return NextResponse.json({ error: "フィードバックの送信に失敗しました" }, { status: 502 });
      }
    } catch (e) {
      console.error("Failed to create GitHub issue:", e);
      return NextResponse.json({ error: "フィードバックの送信に失敗しました" }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true });
}
