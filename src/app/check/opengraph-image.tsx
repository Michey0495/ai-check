import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GEOスコアチェック結果 - AI Check";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GRADE_COLORS: Record<string, string> = {
  A: "#4ade80",
  B: "#60a5fa",
  C: "#facc15",
  D: "#fb923c",
  F: "#f87171",
};

export default function Image({ searchParams }: { searchParams: { url?: string; score?: string; grade?: string } }) {
  const url = searchParams?.url;
  const score = searchParams?.score ? parseInt(searchParams.score, 10) : null;
  const grade = searchParams?.grade || null;

  if (!url) {
    return new ImageResponse(
      (
        <div
          style={{
            background: "#000000",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px",
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 700, color: "#fff", marginBottom: 16 }}>
            GEOスコアチェック
          </div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
            URLを入力してAI検索対応度を無料診断
          </div>
          <div style={{ position: "absolute", bottom: 40, fontSize: 20, color: "rgba(255,255,255,0.3)" }}>
            ai-check.ezoai.jp
          </div>
        </div>
      ),
      { ...size }
    );
  }

  let displayUrl = url;
  try {
    const parsed = new URL(url);
    displayUrl = parsed.hostname + (parsed.pathname !== "/" ? parsed.pathname : "");
  } catch {
    // use raw url
  }

  const gradeColor = grade ? (GRADE_COLORS[grade] || "#fff") : "#fff";
  const hasScore = score !== null && !isNaN(score) && grade;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#000000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 60,
            fontSize: 18,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.15em",
          }}
        >
          GEO SCORE REPORT
        </div>
        {hasScore ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 120, fontWeight: 700, color: gradeColor, lineHeight: 1 }}>
                {grade}
              </div>
              <div style={{ fontSize: 48, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
                {score}/100
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: "20px 40px",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 24, color: "rgba(255,255,255,0.7)", maxWidth: 700 }}>
                {displayUrl.length > 50 ? displayUrl.slice(0, 50) + "..." : displayUrl}
              </div>
            </div>
            <div style={{ fontSize: 22, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
              AI検索対応度を7指標でスコア化
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: 64, fontWeight: 700, color: "#fff", marginBottom: 24 }}>
              AI Check
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: "24px 48px",
                marginBottom: 32,
              }}
            >
              <div style={{ fontSize: 28, color: "rgba(255,255,255,0.7)", maxWidth: 700 }}>
                {displayUrl.length > 50 ? displayUrl.slice(0, 50) + "..." : displayUrl}
              </div>
            </div>
            <div style={{ fontSize: 24, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
              AI検索対応度を7指標でスコア化
            </div>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 20,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          ai-check.ezoai.jp/check
        </div>
      </div>
    ),
    { ...size }
  );
}
