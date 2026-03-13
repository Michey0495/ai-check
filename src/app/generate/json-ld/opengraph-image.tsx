import { createOgpImage, ogpSize } from "@/lib/ogp-image";

export const runtime = "edge";
export const alt = "JSON-LD構造化データ生成ツール - AI Check";
export const size = ogpSize;
export const contentType = "image/png";

export default function Image() {
  return createOgpImage({
    title: "JSON-LD 生成ツール",
    subtitle: "12スキーマタイプ対応の構造化データを自動生成",
    tag: "GENERATOR",
    path: "/generate/json-ld",
  });
}
