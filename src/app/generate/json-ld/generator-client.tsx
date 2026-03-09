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
  { id: "LocalBusiness", name: "LocalBusiness（店舗）" },
];

export function JsonLdGenerator() {
  const [schemaType, setSchemaType] = useState("WebSite");
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [description, setDescription] = useState("");
  const [extra, setExtra] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  function generate() {
    if (!siteName.trim() || !siteUrl.trim()) return;

    let jsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": schemaType,
    };

    switch (schemaType) {
      case "WebSite":
        jsonLd = {
          ...jsonLd,
          name: siteName.trim(),
          url: siteUrl.trim(),
          description: description.trim() || undefined,
        };
        break;
      case "Organization":
        jsonLd = {
          ...jsonLd,
          name: siteName.trim(),
          url: siteUrl.trim(),
          description: description.trim() || undefined,
        };
        break;
      case "FAQPage":
        jsonLd = {
          ...jsonLd,
          mainEntity: extra
            .trim()
            .split(/\r?\n/)
            .filter((l) => l.includes("|"))
            .map((l) => {
              const [q, a] = l.split("|").map((s) => s.trim());
              return {
                "@type": "Question",
                name: q,
                acceptedAnswer: { "@type": "Answer", text: a },
              };
            }),
        };
        break;
      case "Article":
        jsonLd = {
          ...jsonLd,
          headline: siteName.trim(),
          url: siteUrl.trim(),
          description: description.trim() || undefined,
          datePublished: new Date().toISOString().split("T")[0],
        };
        break;
      case "LocalBusiness":
        jsonLd = {
          ...jsonLd,
          name: siteName.trim(),
          url: siteUrl.trim(),
          description: description.trim() || undefined,
          address: extra.trim()
            ? { "@type": "PostalAddress", streetAddress: extra.trim() }
            : undefined,
        };
        break;
    }

    // Remove undefined values
    const cleaned = JSON.parse(JSON.stringify(jsonLd));
    const formatted = JSON.stringify(cleaned, null, 2);
    setOutput(`<script type="application/ld+json">\n${formatted}\n</script>`);
  }

  function handleCopy() {
    navigator.clipboard.writeText(output).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <Label htmlFor="jsonld-schema-type" className="mb-1.5 text-white/70">スキーマタイプ</Label>
          <select
            id="jsonld-schema-type"
            value={schemaType}
            onChange={(e) => setSchemaType(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white"
          >
            {SCHEMA_TYPES.map((t) => (
              <option key={t.id} value={t.id} className="bg-black">
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="jsonld-site-name" className="mb-1.5 text-white/70">
            {schemaType === "Article" ? "記事タイトル" : "サイト名 / 組織名"} *
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
        <div>
          <Label htmlFor="jsonld-url" className="mb-1.5 text-white/70">URL *</Label>
          <Input
            id="jsonld-url"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://example.com"
            maxLength={2048}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
        </div>
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
        {schemaType === "FAQPage" && (
          <div>
            <Label htmlFor="jsonld-faq" className="mb-1.5 text-white/70">
              FAQ（質問|回答 の形式で1行1件）
            </Label>
            <Textarea
              id="jsonld-faq"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder={`GEO対策とは?|AI検索エンジンへの最適化手法です\nllms.txtとは?|AI向けサイト説明ファイルです`}
              rows={4}
              maxLength={5000}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
            />
          </div>
        )}
        {schemaType === "LocalBusiness" && (
          <div>
            <Label htmlFor="jsonld-address" className="mb-1.5 text-white/70">住所</Label>
            <Input
              id="jsonld-address"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="東京都渋谷区..."
              maxLength={500}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
            />
          </div>
        )}
        <Button
          onClick={generate}
          className="w-full cursor-pointer bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/80"
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
