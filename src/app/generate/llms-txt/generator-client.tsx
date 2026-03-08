"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function LlmsTxtGenerator() {
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [description, setDescription] = useState("");
  const [pages, setPages] = useState("");
  const [apiInfo, setApiInfo] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  function generate() {
    if (!siteName.trim() || !siteUrl.trim()) return;
    const lines: string[] = [];
    lines.push(`# ${siteName.trim()}`);
    lines.push("");
    if (description.trim()) {
      lines.push(`> ${description.trim()}`);
      lines.push("");
    }
    if (pages.trim()) {
      lines.push("## 主要ページ");
      pages
        .trim()
        .split(/\r?\n/)
        .forEach((p) => {
          const trimmed = p.trim();
          if (trimmed) lines.push(`- ${trimmed}`);
        });
      lines.push("");
    }
    if (apiInfo.trim()) {
      lines.push("## API");
      lines.push(apiInfo.trim());
      lines.push("");
    }
    lines.push("## 連絡先");
    lines.push(`- サイト: ${siteUrl.trim()}`);
    setOutput(lines.join("\n"));
  }

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "llms.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <Label className="mb-1.5 text-white/70">サイト名 *</Label>
          <Input
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="例: AI Check"
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
        </div>
        <div>
          <Label className="mb-1.5 text-white/70">サイトURL *</Label>
          <Input
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="例: https://ai-check.ezoai.jp"
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
        </div>
        <div>
          <Label className="mb-1.5 text-white/70">サイト説明</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="サイトの概要を簡潔に"
            rows={3}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
        </div>
        <div>
          <Label className="mb-1.5 text-white/70">主要ページ（1行に1ページ）</Label>
          <Textarea
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            placeholder={`[トップ](https://example.com/): サイトの概要\n[サービス](https://example.com/services): 提供サービス`}
            rows={4}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
        </div>
        <div>
          <Label className="mb-1.5 text-white/70">API情報（任意）</Label>
          <Textarea
            value={apiInfo}
            onChange={(e) => setApiInfo(e.target.value)}
            placeholder="REST API, MCP Serverなどの情報"
            rows={3}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
        </div>
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
