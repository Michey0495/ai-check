import { createOgpImage, ogpSize } from "@/lib/ogp-image";

export const runtime = "edge";
export const alt = "API / 開発者向けドキュメント - AI Check";
export const size = ogpSize;
export const contentType = "image/png";

export default function Image() {
  return createOgpImage({
    title: "API / 開発者向け",
    subtitle: "REST API・MCP Server・バッチチェック",
    tag: "DEVELOPERS",
    path: "/developers",
  });
}
