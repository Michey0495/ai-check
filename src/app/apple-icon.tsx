import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.05em",
          }}
        >
          A
        </div>
      </div>
    ),
    { ...size }
  );
}
