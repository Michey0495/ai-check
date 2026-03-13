import { createOgpImage, ogpSize } from "@/lib/ogp-image";

export const runtime = "edge";
export const alt = "llms.txt書き方ガイド - AI Check";
export const size = ogpSize;
export const contentType = "image/png";

export default function Image() {
  return createOgpImage({
    title: "llms.txt 書き方ガイド",
    subtitle: "AI向けサイト説明ファイルの書き方を解説",
    tag: "GUIDE",
    path: "/guides/llms-txt",
  });
}
