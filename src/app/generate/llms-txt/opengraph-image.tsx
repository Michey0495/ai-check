import { createOgpImage, ogpSize } from "@/lib/ogp-image";

export const runtime = "edge";
export const alt = "llms.txt生成ツール - AI Check";
export const size = ogpSize;
export const contentType = "image/png";

export default function Image() {
  return createOgpImage({
    title: "llms.txt 生成ツール",
    subtitle: "AI向けサイト説明ファイルを自動生成",
    tag: "GENERATOR",
    path: "/generate/llms-txt",
  });
}
