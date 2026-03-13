import { createOgpImage, ogpSize } from "@/lib/ogp-image";

export const runtime = "edge";
export const alt = "GEO・AI検索用語集 - AI Check";
export const size = ogpSize;
export const contentType = "image/png";

export default function Image() {
  return createOgpImage({
    title: "GEO・AI検索用語集",
    subtitle: "GEO対策に関連する用語を解説",
    tag: "GLOSSARY",
    path: "/guides/glossary",
  });
}
