import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

const gradeColors: Record<string, string> = {
  A: "#4ade80",
  B: "#60a5fa",
  C: "#facc15",
  D: "#fb923c",
  F: "#f87171",
};

function generateBadgeSvg(grade: string, score: number, style: string): string {
  const color = gradeColors[grade] ?? "#fff";

  if (style === "flat") {
    const labelWidth = 80;
    const valueWidth = 70;
    const totalWidth = labelWidth + valueWidth;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="GEO Score: ${grade} ${score}/100">
  <title>GEO Score: ${grade} ${score}/100</title>
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
    <text x="${labelWidth + valueWidth / 2}" y="14" fill="${color}" font-weight="bold">${grade} ${score}/100</text>
  </g>
</svg>`;
  }

  // Default: "card" style
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" role="img" aria-label="GEO Score: ${grade} ${score}/100">
  <title>GEO Score: ${grade} ${score}/100</title>
  <rect width="200" height="80" rx="8" fill="#111" stroke="${color}40" stroke-width="1"/>
  <text x="20" y="28" font-family="system-ui,sans-serif" font-size="11" fill="rgba(255,255,255,0.5)">GEO SCORE</text>
  <text x="20" y="55" font-family="system-ui,sans-serif" font-size="28" font-weight="bold" fill="${color}">${grade}</text>
  <text x="55" y="55" font-family="system-ui,sans-serif" font-size="14" fill="rgba(255,255,255,0.5)">${score}/100</text>
  <text x="180" y="70" font-family="system-ui,sans-serif" font-size="8" fill="rgba(255,255,255,0.2)" text-anchor="end">ai-check.ezoai.jp</text>
</svg>`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const style = searchParams.get("style") ?? "flat";

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

  try {
    // Call our own check API internally
    const baseUrl = request.nextUrl.origin;
    const res = await fetch(`${baseUrl}/api/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
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
    const score = Math.round((report.totalScore / report.maxScore) * 100);
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
