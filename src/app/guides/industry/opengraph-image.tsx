import { createOgpImage, ogpSize } from "@/lib/ogp-image";

export const runtime = "edge";
export const alt = "業界別GEO対策ガイド - AI Check";
export const size = ogpSize;
export const contentType = "image/png";

export default function Image() {
  return createOgpImage({
    title: "業界別GEO対策ガイド",
    subtitle: "EC・SaaS・メディア・士業・ローカル・教育",
    tag: "GUIDE",
    path: "/guides/industry",
  });
}
