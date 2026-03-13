import { createOgpImage, ogpSize } from "@/lib/ogp-image";

export const runtime = "edge";
export const alt = "チェック履歴 - AI Check";
export const size = ogpSize;
export const contentType = "image/png";

export default function Image() {
  return createOgpImage({
    title: "チェック履歴",
    subtitle: "過去のGEOスコアチェック結果とスコア推移",
    tag: "HISTORY",
    path: "/history",
  });
}
