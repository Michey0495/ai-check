import { createOgpImage, ogpSize } from "@/lib/ogp-image";

export const alt = "業界別GEO対策 - AI Check";
export const size = ogpSize;
export const contentType = "image/png";

const industryLabels: Record<string, { title: string; subtitle: string }> = {
  ec: {
    title: "ECサイト向けGEO対策",
    subtitle: "AI検索で商品を見つけてもらう方法",
  },
  saas: {
    title: "SaaS向けGEO対策",
    subtitle: "AI検索でサービスを推薦されるために",
  },
  media: {
    title: "メディア向けGEO対策",
    subtitle: "AI検索で記事を引用されるために",
  },
  professional: {
    title: "士業向けGEO対策",
    subtitle: "AI検索で専門家として認知されるために",
  },
  local: {
    title: "ローカルビジネス向けGEO対策",
    subtitle: "AI検索で地域のお客様に見つけてもらう方法",
  },
  education: {
    title: "教育向けGEO対策",
    subtitle: "AI検索で講座・教材を見つけてもらう方法",
  },
};

export default function Image({ params }: { params: { industry: string } }) {
  const data = industryLabels[params.industry];
  if (!data) {
    return createOgpImage({
      title: "業界別GEO対策",
      subtitle: "業界特化のAI検索最適化ガイド",
      tag: "INDUSTRY",
    });
  }

  return createOgpImage({
    title: data.title,
    subtitle: data.subtitle,
    tag: "INDUSTRY",
    path: `/for/${params.industry}`,
  });
}
