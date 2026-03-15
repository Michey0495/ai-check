import { NextRequest, NextResponse } from "next/server";
import { GRADE_HEX_COLORS } from "@/lib/grade-colors";

export const maxDuration = 30;

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

const badgeRateMap = new Map<string, { count: number; resetAt: number }>();
const BADGE_RATE_LIMIT = 30;
const BADGE_RATE_WINDOW_MS = 60_000;
let badgeLastCleanup = Date.now();

function checkBadgeRate(ip: string): boolean {
  const now = Date.now();
  if (badgeRateMap.size > 5_000 || now - badgeLastCleanup > 60_000) {
    for (const [key, val] of badgeRateMap) {
      if (now > val.resetAt) badgeRateMap.delete(key);
    }
    badgeLastCleanup = now;
  }
  const entry = badgeRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    badgeRateMap.set(ip, { count: 1, resetAt: now + BADGE_RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= BADGE_RATE_LIMIT) return false;
  entry.count++;
  return true;
}

const gradeColors = GRADE_HEX_COLORS;

function generateBadgeSvg(grade: string, score: number, style: string): string {
  const safeGrade = escapeXml(String(grade).slice(0, 2));
  const safeScore = Number.isFinite(score) ? score : 0;
  const color = gradeColors[grade] ?? "#fff";

  if (style === "flat") {
    const labelWidth = 80;
    const valueWidth = 70;
    const totalWidth = labelWidth + valueWidth;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="GEO Score: ${safeGrade} ${safeScore}/100">
  <title>GEO Score: ${safeGrade} ${safeScore}/100</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${totalWidth}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#111"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}20"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="14" fill="rgba(255,255,255,0.8)">GEO Score</text>
    <text x="${labelWidth + valueWidth / 2}" y="14" fill="${color}" font-weight="bold">${safeGrade} ${safeScore}/100</text>
  </g>
</svg>`;
  }

  // Default: "card" style
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" role="img" aria-label="GEO Score: ${safeGrade} ${safeScore}/100">
  <title>GEO Score: ${safeGrade} ${safeScore}/100</title>
  <rect width="200" height="80" rx="8" fill="#111" stroke="${color}40" stroke-width="1"/>
  <text x="20" y="28" font-family="system-ui,sans-serif" font-size="11" fill="rgba(255,255,255,0.5)">GEO SCORE</text>
  <text x="20" y="55" font-family="system-ui,sans-serif" font-size="28" font-weight="bold" fill="${color}">${safeGrade}</text>
  <text x="55" y="55" font-family="system-ui,sans-serif" font-size="14" fill="rgba(255,255,255,0.5)">${safeScore}/100</text>
  <text x="180" y="70" font-family="system-ui,sans-serif" font-size="8" fill="rgba(255,255,255,0.2)" text-anchor="end">ai-check.ezoai.jp</text>
</svg>`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const rawStyle = searchParams.get("style") ?? "flat";
  const style = ["flat", "card"].includes(rawStyle) ? rawStyle : "flat";

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkBadgeRate(ip)) {
    return new NextResponse("Rate limited", { status: 429 });
  }

  if (!url) {
    return new NextResponse(
      generateBadgeSvg("?", 0, style).replace(
        /GEO Score: \? 0\/100/g,
        "GEO Score: URL required"
      ),
      {
        status: 400,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "no-cache",
        },
      }
    );
  }

  // Validate URL format and protocol
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return new NextResponse(generateBadgeSvg("?", 0, style), {
        status: 400,
        headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-cache" },
      });
    }
  } catch {
    return new NextResponse(generateBadgeSvg("?", 0, style), {
      status: 400,
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-cache" },
    });
  }

  try {
    // Call our own check API internally
    const baseUrl = request.nextUrl.origin;
    const res = await fetch(`${baseUrl}/api/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const svg = generateBadgeSvg("?", 0, style);
      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, s-maxage=60",
        },
      });
    }

    const report = await res.json();
    const score = report.maxScore > 0 ? Math.round((report.totalScore / report.maxScore) * 100) : 0;
    const svg = generateBadgeSvg(report.grade, score, style);

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch {
    const svg = generateBadgeSvg("?", 0, style);
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, s-maxage=60",
      },
    });
  }
}
