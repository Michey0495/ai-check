import { createOgpImage, ogpSize } from "@/lib/ogp-image";

export const alt = "チェック項目解説 - AI Check";
export const size = ogpSize;
export const contentType = "image/png";

const indicatorLabels: Record<string, { title: string; subtitle: string }> = {
  "robots-txt": {
    title: "AIクローラーアクセス",
    subtitle: "robots.txtのAIクローラー許可設定をチェック",
  },
  "llms-txt": {
    title: "llms.txt チェック",
    subtitle: "AI向けサイト説明ファイルの存在と品質を評価",
  },
  "structured-data": {
    title: "構造化データ チェック",
    subtitle: "JSON-LD構造化データの設置状況を検証",
  },
  "meta-tags": {
    title: "メタタグ & 鮮度",
    subtitle: "title・description・OGPの最適化状況を確認",
  },
  "content-structure": {
    title: "コンテンツ構造",
    subtitle: "セマンティックHTMLの使用状況を分析",
  },
  ssr: {
    title: "SSR チェック",
    subtitle: "サーバーサイドレンダリングの対応状況を確認",
  },
  sitemap: {
    title: "サイトマップ チェック",
    subtitle: "sitemap.xmlの存在とURL構成を検証",
  },
};

export default function Image({ params }: { params: { indicator: string } }) {
  const data = indicatorLabels[params.indicator];
  if (!data) {
    return createOgpImage({
      title: "GEOスコアチェック項目",
      subtitle: "AI検索対応度の各指標を解説",
      tag: "CHECK",
      path: "/check",
    });
  }

  return createOgpImage({
    title: data.title,
    subtitle: data.subtitle,
    tag: "CHECK INDICATOR",
    path: `/check/${params.indicator}`,
  });
}
