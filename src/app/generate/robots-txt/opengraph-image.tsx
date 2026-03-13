import { createOgpImage, ogpSize } from "@/lib/ogp-image";

export const runtime = "edge";
export const alt = "robots.txt生成ツール - AI Check";
export const size = ogpSize;
export const contentType = "image/png";

export default function Image() {
  return createOgpImage({
    title: "robots.txt 生成ツール",
    subtitle: "AIクローラー対応のrobots.txtを自動生成",
    tag: "GENERATOR",
    path: "/generate/robots-txt",
  });
}
