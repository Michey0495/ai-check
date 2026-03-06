import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AI Check - AI検索対応度チェッカー & ジェネレーター";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 24,
          }}
        >
          AI Check
        </div>
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          AI検索対応度チェッカー & ジェネレーター
        </div>
        <div
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.4)",
            marginTop: 32,
          }}
        >
          ai-check.ezoai.jp
        </div>
      </div>
    ),
    { ...size }
  );
}
