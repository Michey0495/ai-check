import { createOgpImage, ogpSize } from "@/lib/ogp-image";

export const runtime = "edge";
export const alt = "GEO対策ツール一覧 - AI Check";
export const size = ogpSize;
export const contentType = "image/png";

export default function Image() {
  return createOgpImage({
    title: "GEO対策ツール一覧",
    subtitle: "llms.txt・robots.txt・JSON-LD・agent.json・バッジ生成",
    tag: "TOOLS",
    path: "/tools",
  });
}
