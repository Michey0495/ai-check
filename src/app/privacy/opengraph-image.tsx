import { createOgpImage, ogpSize } from "@/lib/ogp-image";

export const runtime = "edge";
export const alt = "プライバシーポリシー - AI Check";
export const size = ogpSize;
export const contentType = "image/png";

export default function Image() {
  return createOgpImage({
    title: "プライバシーポリシー",
    subtitle: "データ取り扱いに関するポリシー",
    tag: "PRIVACY",
    path: "/privacy",
  });
}
