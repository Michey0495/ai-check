import { createOgpImage, ogpSize } from "@/lib/ogp-image";

export const runtime = "edge";
export const alt = "GEOスコア比較 - AI Check";
export const size = ogpSize;
export const contentType = "image/png";

export default function Image() {
  return createOgpImage({
    title: "GEOスコア比較",
    subtitle: "複数サイトのAI検索対応度を並べて比較",
    tag: "COMPARE",
    path: "/check/compare",
  });
}
