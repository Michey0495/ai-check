"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STYLES = [
  { id: "flat", label: "フラット", desc: "GitHub風の横長バッジ" },
  { id: "card", label: "カード", desc: "スコアを大きく表示" },
] as const;

function computeInitialBadgeUrl(initialUrl: string): string {
  if (!initialUrl) return "";
  const trimmed = initialUrl.trim();
  if (!trimmed) return "";
  const normalized = /^https?:\/\//.test(trimmed) ? trimmed : "https://" + trimmed;
  const params = new URLSearchParams({ url: normalized, style: "flat" });
  return `https://ai-check.ezoai.jp/api/badge?${params.toString()}`;
}

export function BadgeGenerator() {
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get("url") ?? "";
  const [url, setUrl] = useState(initialUrl);
  const [style, setStyle] = useState<string>("flat");
  const [badgeUrl, setBadgeUrl] = useState(() => computeInitialBadgeUrl(initialUrl));
  const [copied, setCopied] = useState<"md" | "html" | "url" | null>(null);

  function generate() {
    const trimmed = url.trim();
    if (!trimmed) return;
    let normalized = trimmed;
    if (!/^https?:\/\//.test(normalized)) {
      normalized = "https://" + normalized;
    }
    const params = new URLSearchParams({ url: normalized, style });
    setBadgeUrl(`https://ai-check.ezoai.jp/api/badge?${params.toString()}`);
  }

  function handleCopy(type: "md" | "html" | "url") {
    if (!badgeUrl) return;
    let normalized = url.trim();
    if (!/^https?:\/\//.test(normalized)) {
      normalized = "https://" + normalized;
    }
    const checkUrl = `https://ai-check.ezoai.jp/check?url=${encodeURIComponent(normalized)}`;
    let text = "";
    if (type === "url") {
      text = badgeUrl;
    } else if (type === "md") {
      text = `[![GEO Score](${badgeUrl})](${checkUrl})`;
    } else {
      text = `<a href="${checkUrl}"><img src="${badgeUrl}" alt="GEO Score" /></a>`;
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => {});
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <Label htmlFor="badge-url" className="text-white/70">サイトURL</Label>
          <Input
            id="badge-url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-white/30"
            onKeyDown={(e) => { if (e.key === "Enter") generate(); }}
          />
        </div>

        <div>
          <Label id="badge-style-label" className="text-white/70">スタイル</Label>
          <div className="mt-2 flex gap-3" role="radiogroup" aria-labelledby="badge-style-label">
            {STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStyle(s.id)}
                className={`cursor-pointer rounded-lg border px-4 py-3 text-left transition-all duration-200 ${
                  style === s.id
                    ? "border-primary/50 bg-primary/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <p className={`text-sm font-medium ${style === s.id ? "text-primary" : "text-white/70"}`}>
                  {s.label}
                </p>
                <p className="text-xs text-white/40">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={generate}
          className="cursor-pointer bg-primary text-black transition-all duration-200 hover:bg-primary/90"
          disabled={!url.trim()}
        >
          バッジを生成
        </Button>
      </div>

      {badgeUrl && (
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-white">プレビュー</h2>
            <div className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={badgeUrl}
                alt="GEO Score Badge"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <p className="mt-2 text-xs text-white/30">
              バッジはリアルタイムでGEOスコアを取得して表示します。スコアは1時間キャッシュされます。
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">埋め込みコード</h2>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-white/70">Markdown</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy("md")}
                  className="cursor-pointer border-white/10 bg-white/5 text-xs text-white/70 transition-all duration-200 hover:bg-white/10"
                >
                  {copied === "md" ? "コピー済み" : "コピー"}
                </Button>
              </div>
              <pre className="overflow-x-auto text-xs text-white/50">
                <code>{`[![GEO Score](${badgeUrl})](https://ai-check.ezoai.jp/check?url=${encodeURIComponent(url.trim())})`}</code>
              </pre>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-white/70">HTML</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy("html")}
                  className="cursor-pointer border-white/10 bg-white/5 text-xs text-white/70 transition-all duration-200 hover:bg-white/10"
                >
                  {copied === "html" ? "コピー済み" : "コピー"}
                </Button>
              </div>
              <pre className="overflow-x-auto text-xs text-white/50">
                <code>{`<a href="https://ai-check.ezoai.jp/check?url=${encodeURIComponent(url.trim())}"><img src="${badgeUrl}" alt="GEO Score" /></a>`}</code>
              </pre>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-white/70">画像URL</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy("url")}
                  className="cursor-pointer border-white/10 bg-white/5 text-xs text-white/70 transition-all duration-200 hover:bg-white/10"
                >
                  {copied === "url" ? "コピー済み" : "コピー"}
                </Button>
              </div>
              <pre className="overflow-x-auto text-xs text-white/50">
                <code>{badgeUrl}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
