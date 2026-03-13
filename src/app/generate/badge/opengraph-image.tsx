import { createOgpImage, ogpSize } from "@/lib/ogp-image";

export const runtime = "edge";
export const alt = "GEOスコアバッジ生成ツール - AI Check";
export const size = ogpSize;
export const contentType = "image/png";

export default function Image() {
  return createOgpImage({
    title: "GEOスコアバッジ生成",
    subtitle: "SVGバッジをMarkdown/HTMLに埋め込み",
    tag: "GENERATOR",
    path: "/generate/badge",
  });
}
