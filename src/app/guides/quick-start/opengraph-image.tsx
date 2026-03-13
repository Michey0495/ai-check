import { createOgpImage, ogpSize } from "@/lib/ogp-image";

export const runtime = "edge";
export const alt = "5分で始めるGEO対策 - AI Check";
export const size = ogpSize;
export const contentType = "image/png";

export default function Image() {
  return createOgpImage({
    title: "5分で始めるGEO対策",
    subtitle: "robots.txt・llms.txt・JSON-LDのクイックスタート",
    tag: "QUICK START",
    path: "/guides/quick-start",
  });
}
