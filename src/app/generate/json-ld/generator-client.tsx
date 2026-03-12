"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const SCHEMA_TYPES = [
  { id: "WebSite", name: "WebSite（Webサイト）" },
  { id: "Organization", name: "Organization（組織）" },
  { id: "FAQPage", name: "FAQPage（よくある質問）" },
  { id: "Article", name: "Article（記事）" },
  { id: "NewsArticle", name: "NewsArticle（ニュース記事）" },
  { id: "LocalBusiness", name: "LocalBusiness（店舗）" },
  { id: "Product", name: "Product（製品）" },
  { id: "Event", name: "Event（イベント）" },
  { id: "Course", name: "Course（講座・コース）" },
  { id: "VideoObject", name: "VideoObject（動画）" },
  { id: "BreadcrumbList", name: "BreadcrumbList（パンくずリスト）" },
  { id: "HowTo", name: "HowTo（手順）" },
];

type FieldValues = Record<string, string>;

interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
  type?: "input" | "textarea";
  required?: boolean;
}

const EXTRA_FIELDS: Record<string, FieldDef[]> = {
  Article: [
    { key: "author", label: "著者名", placeholder: "山田太郎" },
    { key: "datePublished", label: "公開日", placeholder: "2026-03-13" },
    { key: "image", label: "アイキャッチ画像URL", placeholder: "https://example.com/image.jpg" },
  ],
  NewsArticle: [
    { key: "author", label: "著者名", placeholder: "山田太郎" },
    { key: "datePublished", label: "公開日", placeholder: "2026-03-13" },
    { key: "image", label: "アイキャッチ画像URL", placeholder: "https://example.com/image.jpg" },
    { key: "publisher", label: "メディア名", placeholder: "日経新聞" },
  ],
  LocalBusiness: [
    { key: "address", label: "住所", placeholder: "東京都渋谷区..." },
    { key: "telephone", label: "電話番号", placeholder: "03-1234-5678" },
    { key: "openingHours", label: "営業時間", placeholder: "Mo-Fr 09:00-18:00" },
  ],
  Product: [
    { key: "brand", label: "ブランド名", placeholder: "ブランド名" },
    { key: "price", label: "価格", placeholder: "9800" },
    { key: "currency", label: "通貨", placeholder: "JPY" },
    { key: "availability", label: "在庫状態", placeholder: "InStock" },
    { key: "image", label: "商品画像URL", placeholder: "https://example.com/product.jpg" },
  ],
  Event: [
    { key: "startDate", label: "開始日時", placeholder: "2026-04-01T10:00:00+09:00" },
    { key: "endDate", label: "終了日時", placeholder: "2026-04-01T18:00:00+09:00" },
    { key: "location", label: "会場名", placeholder: "東京国際フォーラム" },
    { key: "locationAddress", label: "会場住所", placeholder: "東京都千代田区丸の内3-5-1" },
    { key: "image", label: "イベント画像URL", placeholder: "https://example.com/event.jpg" },
  ],
  Course: [
    { key: "provider", label: "提供者・組織名", placeholder: "スクール名" },
    { key: "courseMode", label: "受講形式", placeholder: "online / onsite / blended" },
    { key: "price", label: "受講料", placeholder: "50000" },
    { key: "currency", label: "通貨", placeholder: "JPY" },
  ],
  VideoObject: [
    { key: "thumbnailUrl", label: "サムネイルURL", placeholder: "https://example.com/thumb.jpg" },
    { key: "uploadDate", label: "公開日", placeholder: "2026-03-13" },
    { key: "duration", label: "再生時間（ISO 8601）", placeholder: "PT10M30S" },
    { key: "embedUrl", label: "埋め込みURL", placeholder: "https://www.youtube.com/embed/xxx" },
  ],
  FAQPage: [
    {
      key: "faq",
      label: "FAQ（質問|回答 の形式で1行1件）",
      placeholder: "GEO対策とは?|AI検索エンジンへの最適化手法です\nllms.txtとは?|AI向けサイト説明ファイルです",
      type: "textarea",
    },
  ],
  BreadcrumbList: [
    {
      key: "items",
      label: "パンくず（名前|URL の形式で1行1件、順番通り）",
      placeholder: "ホーム|https://example.com\nブログ|https://example.com/blog\n記事タイトル|https://example.com/blog/article",
      type: "textarea",
    },
  ],
  HowTo: [
    { key: "totalTime", label: "所要時間（ISO 8601）", placeholder: "PT30M" },
    {
      key: "steps",
      label: "手順（1行1ステップ）",
      placeholder: "材料を準備する\n下ごしらえをする\n調理する",
      type: "textarea",
    },
  ],
};

function buildJsonLd(
  schemaType: string,
  siteName: string,
  siteUrl: string,
  description: string,
  fields: FieldValues
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaType,
  };

  switch (schemaType) {
    case "WebSite":
      return { ...base, name: siteName, url: siteUrl, description: description || undefined };

    case "Organization":
      return { ...base, name: siteName, url: siteUrl, description: description || undefined };

    case "FAQPage": {
      const faqItems = (fields.faq || "")
        .split(/\r?\n/)
        .filter((l) => l.includes("|"))
        .map((l) => {
          const [q, ...rest] = l.split("|").map((s) => s.trim());
          return { q, a: rest.join("|") };
        })
        .filter(({ q, a }) => q && a)
        .map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        }));
      return { ...base, mainEntity: faqItems };
    }

    case "Article":
    case "NewsArticle": {
      const result: Record<string, unknown> = {
        ...base,
        headline: siteName,
        url: siteUrl,
        description: description || undefined,
        datePublished: fields.datePublished || new Date().toISOString().split("T")[0],
        image: fields.image || undefined,
      };
      if (fields.author) {
        result.author = { "@type": "Person", name: fields.author };
      }
      if (schemaType === "NewsArticle" && fields.publisher) {
        result.publisher = { "@type": "Organization", name: fields.publisher };
      }
      return result;
    }

    case "LocalBusiness":
      return {
        ...base,
        name: siteName,
        url: siteUrl,
        description: description || undefined,
        address: fields.address
          ? { "@type": "PostalAddress", streetAddress: fields.address }
          : undefined,
        telephone: fields.telephone || undefined,
        openingHoursSpecification: fields.openingHours
          ? { "@type": "OpeningHoursSpecification", dayOfWeek: fields.openingHours }
          : undefined,
      };

    case "Product": {
      const product: Record<string, unknown> = {
        ...base,
        name: siteName,
        url: siteUrl,
        description: description || undefined,
        image: fields.image || undefined,
      };
      if (fields.brand) {
        product.brand = { "@type": "Brand", name: fields.brand };
      }
      if (fields.price) {
        product.offers = {
          "@type": "Offer",
          price: fields.price,
          priceCurrency: fields.currency || "JPY",
          availability: fields.availability
            ? `https://schema.org/${fields.availability}`
            : "https://schema.org/InStock",
        };
      }
      return product;
    }

    case "Event":
      return {
        ...base,
        name: siteName,
        url: siteUrl,
        description: description || undefined,
        startDate: fields.startDate || undefined,
        endDate: fields.endDate || undefined,
        image: fields.image || undefined,
        location: fields.location
          ? {
              "@type": "Place",
              name: fields.location,
              address: fields.locationAddress
                ? { "@type": "PostalAddress", streetAddress: fields.locationAddress }
                : undefined,
            }
          : undefined,
      };

    case "Course":
      return {
        ...base,
        name: siteName,
        url: siteUrl,
        description: description || undefined,
        provider: fields.provider
          ? { "@type": "Organization", name: fields.provider }
          : undefined,
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: fields.courseMode || "online",
          ...(fields.price
            ? {
                offers: {
                  "@type": "Offer",
                  price: fields.price,
                  priceCurrency: fields.currency || "JPY",
                },
              }
            : {}),
        },
      };

    case "VideoObject":
      return {
        ...base,
        name: siteName,
        contentUrl: siteUrl,
        description: description || undefined,
        thumbnailUrl: fields.thumbnailUrl || undefined,
        uploadDate: fields.uploadDate || new Date().toISOString().split("T")[0],
        duration: fields.duration || undefined,
        embedUrl: fields.embedUrl || undefined,
      };

    case "BreadcrumbList": {
      const items = (fields.items || "")
        .split(/\r?\n/)
        .filter((l) => l.includes("|"))
        .map((l, i) => {
          const [name, url] = l.split("|").map((s) => s.trim());
          return {
            "@type": "ListItem",
            position: i + 1,
            name,
            item: url,
          };
        })
        .filter((item) => item.name && item.item);
      return { ...base, itemListElement: items };
    }

    case "HowTo": {
      const steps = (fields.steps || "")
        .split(/\r?\n/)
        .filter((l) => l.trim())
        .map((l, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          text: l.trim(),
        }));
      return {
        ...base,
        name: siteName,
        description: description || undefined,
        totalTime: fields.totalTime || undefined,
        step: steps,
      };
    }

    default:
      return { ...base, name: siteName, url: siteUrl, description: description || undefined };
  }
}

export function JsonLdGenerator() {
  const [schemaType, setSchemaType] = useState("WebSite");
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FieldValues>({});
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  function handleTypeChange(newType: string) {
    setSchemaType(newType);
    setFields({});
    setOutput("");
  }

  function updateField(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  const nameLabel =
    schemaType === "Article" || schemaType === "NewsArticle"
      ? "記事タイトル"
      : schemaType === "HowTo"
      ? "手順タイトル"
      : schemaType === "VideoObject"
      ? "動画タイトル"
      : schemaType === "Event"
      ? "イベント名"
      : schemaType === "Course"
      ? "コース名"
      : schemaType === "Product"
      ? "商品名"
      : "サイト名 / 組織名";

  const urlLabel =
    schemaType === "VideoObject" ? "動画URL" : "URL";

  const needsUrl = schemaType !== "FAQPage" && schemaType !== "BreadcrumbList" && schemaType !== "HowTo";
  const needsName = schemaType !== "FAQPage" && schemaType !== "BreadcrumbList";
  const needsDescription = !["FAQPage", "BreadcrumbList"].includes(schemaType);

  function generate() {
    if (needsName && !siteName.trim()) return;
    if (needsUrl && !siteUrl.trim()) return;

    const jsonLd = buildJsonLd(schemaType, siteName.trim(), siteUrl.trim(), description.trim(), fields);
    const cleaned = JSON.parse(JSON.stringify(jsonLd));
    const formatted = JSON.stringify(cleaned, null, 2);
    setOutput(`<script type="application/ld+json">\n${formatted}\n</script>`);
  }

  function handleCopy() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  function handleDownload() {
    const blob = new Blob([output], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "structured-data.html";
    a.click();
    URL.revokeObjectURL(url);
  }

  const extraFields = EXTRA_FIELDS[schemaType] || [];

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <Label htmlFor="jsonld-schema-type" className="mb-1.5 text-white/70">スキーマタイプ</Label>
          <select
            id="jsonld-schema-type"
            value={schemaType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white"
          >
            {SCHEMA_TYPES.map((t) => (
              <option key={t.id} value={t.id} className="bg-black">
                {t.name}
              </option>
            ))}
          </select>
        </div>
        {needsName && (
          <div>
            <Label htmlFor="jsonld-site-name" className="mb-1.5 text-white/70">
              {nameLabel} *
            </Label>
            <Input
              id="jsonld-site-name"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="例: AI Check"
              maxLength={200}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
            />
          </div>
        )}
        {needsUrl && (
          <div>
            <Label htmlFor="jsonld-url" className="mb-1.5 text-white/70">{urlLabel} *</Label>
            <Input
              id="jsonld-url"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://example.com"
              maxLength={2048}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
            />
          </div>
        )}
        {needsDescription && (
          <div>
            <Label htmlFor="jsonld-description" className="mb-1.5 text-white/70">説明</Label>
            <Textarea
              id="jsonld-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="簡潔な説明"
              rows={3}
              maxLength={1000}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
            />
          </div>
        )}
        {extraFields.map((field) => (
          <div key={field.key}>
            <Label htmlFor={`jsonld-${field.key}`} className="mb-1.5 text-white/70">
              {field.label}{field.required ? " *" : ""}
            </Label>
            {field.type === "textarea" ? (
              <Textarea
                id={`jsonld-${field.key}`}
                value={fields[field.key] || ""}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                maxLength={5000}
                className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
              />
            ) : (
              <Input
                id={`jsonld-${field.key}`}
                value={fields[field.key] || ""}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                maxLength={500}
                className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
              />
            )}
          </div>
        ))}
        <Button
          onClick={generate}
          disabled={(needsName && !siteName.trim()) || (needsUrl && !siteUrl.trim())}
          className="w-full cursor-pointer bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          生成
        </Button>
      </div>
      <div>
        {output ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">生成結果</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="cursor-pointer border-white/10 text-white/70 transition-all duration-200 hover:text-white"
                >
                  {copied ? "コピー済み" : "コピー"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="cursor-pointer border-white/10 text-white/70 transition-all duration-200 hover:text-white"
                >
                  ダウンロード
                </Button>
              </div>
            </div>
            <pre className="overflow-x-auto rounded-lg border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/70">
              <code>{output}</code>
            </pre>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-white/10 p-8">
            <p className="text-center text-sm text-white/30">
              フォームに入力して
              <br />
              「生成」をクリック
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
