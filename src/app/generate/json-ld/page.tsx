import type { Metadata } from "next";
import { JsonLdGenerator } from "./generator-client";

export const metadata: Metadata = {
  title: "JSON-LD 構造化データ生成ツール",
  description:
    "Schema.org準拠のJSON-LD構造化データをフォーム入力だけで自動生成。WebSite, Organization, FAQPage等に対応。",
};

export default function JsonLdPage() {
  return (
    <div className="py-16">
      <h1 className="mb-2 text-3xl font-bold text-white">
        JSON-LD 構造化データ生成
      </h1>
      <p className="mb-8 text-white/50">
        Schema.org準拠の構造化データをフォーム入力で自動生成。HTMLの
        {"<head>"}にそのまま貼り付け可能。
      </p>
      <JsonLdGenerator />
    </div>
  );
}
