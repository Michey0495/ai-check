import { createOgpImage, ogpSize } from "@/lib/ogp-image";

export const runtime = "edge";
export const alt = "GEO vs SEO比較ガイド - AI Check";
export const size = ogpSize;
export const contentType = "image/png";

export default function Image() {
  return createOgpImage({
    title: "GEO vs SEO",
    subtitle: "AI検索最適化と従来のSEOの違いを比較",
    tag: "GUIDE",
    path: "/guides/geo-vs-seo",
  });
}
