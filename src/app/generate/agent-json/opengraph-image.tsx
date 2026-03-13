import { createOgpImage, ogpSize } from "@/lib/ogp-image";

export const runtime = "edge";
export const alt = "agent.json生成ツール - AI Check";
export const size = ogpSize;
export const contentType = "image/png";

export default function Image() {
  return createOgpImage({
    title: "agent.json 生成ツール",
    subtitle: "A2A Agent Cardを自動生成",
    tag: "GENERATOR",
    path: "/generate/agent-json",
  });
}
