"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function AgentJsonGenerator() {
  const [agentName, setAgentName] = useState("");
  const [agentUrl, setAgentUrl] = useState("");
  const [description, setDescription] = useState("");
  const [capabilities, setCapabilities] = useState("");
  const [mcpEndpoint, setMcpEndpoint] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  function generate() {
    if (!agentName.trim() || !agentUrl.trim()) return;

    const agentCard: Record<string, unknown> = {
      name: agentName.trim(),
      url: agentUrl.trim(),
      description: description.trim() || undefined,
      version: "1.0.0",
      capabilities: capabilities
        .trim()
        .split(/\r?\n/)
        .map((c) => c.trim())
        .filter(Boolean),
      endpoints: {
        mcp: mcpEndpoint.trim() || `${agentUrl.trim()}/api/mcp`,
      },
      authentication: {
        type: "none",
      },
    };

    const cleaned = JSON.parse(JSON.stringify(agentCard));
    setOutput(JSON.stringify(cleaned, null, 2));
  }

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agent.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <Label className="mb-1.5 text-white/70">エージェント名 *</Label>
          <Input
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="例: AI Check Agent"
            maxLength={200}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
        </div>
        <div>
          <Label className="mb-1.5 text-white/70">サイトURL *</Label>
          <Input
            value={agentUrl}
            onChange={(e) => setAgentUrl(e.target.value)}
            placeholder="https://example.com"
            maxLength={2048}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
        </div>
        <div>
          <Label className="mb-1.5 text-white/70">説明</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="このエージェントが提供する機能の概要"
            rows={3}
            maxLength={1000}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
        </div>
        <div>
          <Label className="mb-1.5 text-white/70">
            機能一覧（1行に1機能）
          </Label>
          <Textarea
            value={capabilities}
            onChange={(e) => setCapabilities(e.target.value)}
            placeholder={`GEOスコアチェック\nllms.txt生成\nrobots.txt生成`}
            rows={4}
            maxLength={3000}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
        </div>
        <div>
          <Label className="mb-1.5 text-white/70">
            MCPエンドポイント（任意）
          </Label>
          <Input
            value={mcpEndpoint}
            onChange={(e) => setMcpEndpoint(e.target.value)}
            placeholder="https://example.com/api/mcp"
            maxLength={2048}
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
