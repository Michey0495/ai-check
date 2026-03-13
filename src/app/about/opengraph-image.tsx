import { createOgpImage, ogpSize } from "@/lib/ogp-image";

export const runtime = "edge";
export const alt = "AI Checkについて - AI検索対応度チェッカー";
export const size = ogpSize;
export const contentType = "image/png";

export default function Image() {
  return createOgpImage({
    title: "AI Checkについて",
    subtitle: "AI検索対応度チェッカー & GEO対策ツール",
    tag: "ABOUT",
    path: "/about",
  });
}
