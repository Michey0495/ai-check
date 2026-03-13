import { createOgpImage, ogpSize } from "@/lib/ogp-image";

export const runtime = "edge";
export const alt = "GEO対策ガイド - AI Check";
export const size = ogpSize;
export const contentType = "image/png";

export default function Image() {
  return createOgpImage({
    title: "GEO対策ガイド",
    subtitle: "AI検索時代のWebサイト最適化を徹底解説",
    tag: "GUIDE",
    path: "/guides/geo",
  });
}
