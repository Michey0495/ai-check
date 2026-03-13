import { createOgpImage, ogpSize } from "@/lib/ogp-image";

export const runtime = "edge";
export const alt = "GEO対策チェックリスト - AI Check";
export const size = ogpSize;
export const contentType = "image/png";

export default function Image() {
  return createOgpImage({
    title: "GEO対策チェックリスト",
    subtitle: "7カテゴリ・20項目のインタラクティブチェックリスト",
    tag: "GUIDE",
    path: "/guides/checklist",
  });
}
