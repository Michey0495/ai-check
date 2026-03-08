import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GEOスコアチェック結果 - AI Check";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image({ searchParams }: { searchParams: { url?: string } }) {
  const url = searchParams?.url;

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

  // Display URL-based card (without score, since we can't fetch during OG generation)
  let displayUrl = url;
  try {
    const parsed = new URL(url);
    displayUrl = parsed.hostname + (parsed.pathname !== "/" ? parsed.pathname : "");
  } catch {
    // use raw url
  }

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
