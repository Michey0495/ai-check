import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AI Check - AI検索対応度チェッカー & GEO対策ツール | 無料";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.15em",
            }}
          >
            GEO READINESS TOOL
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#f87171",
              border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: 20,
              padding: "4px 16px",
              background: "rgba(248,113,113,0.1)",
            }}
          >
            Google AI Mode 日本上陸
          </div>
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 16,
            letterSpacing: "-0.02em",
          }}
        >
          AI Check
        </div>
        <div
          style={{
            fontSize: 30,
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
            marginBottom: 40,
          }}
        >
          URLを入力するだけでAI検索対応度を7指標でスコア化
        </div>
        <div
          style={{
            display: "flex",
            gap: 48,
          }}
        >
          {[
            { value: "25%", label: "AI検索シェア" },
            { value: "89%", label: "未対応サイト" },
            { value: "7", label: "チェック指標" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: "#60a5fa",
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.4)",
                  marginTop: 4,
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 20,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          ai-check.ezoai.jp
        </div>
      </div>
    ),
    { ...size }
  );
}
