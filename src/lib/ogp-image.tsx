import { ImageResponse } from "next/og";

export const ogpSize = { width: 1200, height: 630 };

type OgpImageProps = {
  title: string;
  subtitle?: string;
  tag?: string;
  path?: string;
};

export function createOgpImage({ title, subtitle, tag, path }: OgpImageProps) {
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
        {tag && (
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 60,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 16,
                color: "#60a5fa",
                border: "1px solid rgba(96,165,250,0.3)",
                borderRadius: 20,
                padding: "4px 16px",
                background: "rgba(96,165,250,0.1)",
              }}
            >
              {tag}
            </div>
          </div>
        )}
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#60a5fa",
            marginBottom: 16,
            letterSpacing: "0.05em",
          }}
        >
          AI Check
        </div>
        <div
          style={{
            fontSize: title.length > 20 ? 52 : 64,
            fontWeight: 700,
            color: "#fff",
            marginBottom: subtitle ? 20 : 0,
            textAlign: "center",
            maxWidth: 1000,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: 26,
              color: "rgba(255,255,255,0.6)",
              textAlign: "center",
              maxWidth: 800,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
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
          ai-check.ezoai.jp{path ? path : ""}
        </div>
      </div>
    ),
    { ...ogpSize }
  );
}
