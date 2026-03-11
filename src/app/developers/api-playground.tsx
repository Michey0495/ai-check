"use client";

import { useState } from "react";

type ApiMethod = "GET" | "POST";

interface EndpointOption {
  label: string;
  method: ApiMethod;
  path: string;
  defaultBody: string;
  hint: string;
}

const ENDPOINTS: EndpointOption[] = [
  {
    label: "GEOスコアチェック (GET)",
    method: "GET",
    path: "/api/check?url=https://example.com",
    defaultBody: "",
    hint: "URLパラメータを編集してチェック対象を変更",
  },
  {
    label: "GEOスコアチェック (POST)",
    method: "POST",
    path: "/api/check",
    defaultBody: JSON.stringify({ url: "https://example.com" }, null, 2),
    hint: "urlフィールドにチェック対象URLを指定",
  },
  {
    label: "バッチチェック (POST)",
    method: "POST",
    path: "/api/check/batch",
    defaultBody: JSON.stringify(
      { urls: ["https://example.com", "https://example.org"] },
      null,
      2
    ),
    hint: "最大10件のURLを一括チェック",
  },
  {
    label: "llms.txt 生成 (POST)",
    method: "POST",
    path: "/api/generate",
    defaultBody: JSON.stringify(
      {
        type: "llms-txt",
        data: {
          siteName: "My Site",
          siteUrl: "https://example.com",
          description: "サイトの説明文",
          pages: [{ path: "/", title: "トップ", description: "トップページ" }],
        },
      },
      null,
      2
    ),
    hint: "サイト情報を入力してllms.txtを生成",
  },
  {
    label: "robots.txt 生成 (POST)",
    method: "POST",
    path: "/api/generate",
    defaultBody: JSON.stringify(
      {
        type: "robots-txt",
        data: { sitemapUrl: "https://example.com/sitemap.xml" },
      },
      null,
      2
    ),
    hint: "サイトマップURLを指定してrobots.txtを生成",
  },
  {
    label: "MCP Server (POST)",
    method: "POST",
    path: "/api/mcp",
    defaultBody: JSON.stringify(
      {
        jsonrpc: "2.0",
        method: "tools/list",
        params: {},
        id: 1,
      },
      null,
      2
    ),
    hint: "JSON-RPC 2.0でMCPツール一覧を取得",
  },
];

export function ApiPlayground() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [path, setPath] = useState(ENDPOINTS[0].path);
  const [body, setBody] = useState(ENDPOINTS[0].defaultBody);
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);

  const endpoint = ENDPOINTS[selectedIdx];

  function handleEndpointChange(idx: number) {
    setSelectedIdx(idx);
    setPath(ENDPOINTS[idx].path);
    setBody(ENDPOINTS[idx].defaultBody);
    setResponse("");
    setStatus(null);
    setElapsed(null);
  }

  async function handleSend() {
    setLoading(true);
    setResponse("");
    setStatus(null);
    setElapsed(null);

    const start = performance.now();
    try {
      const options: RequestInit = {
        method: endpoint.method,
        headers: { "Content-Type": "application/json" },
      };
      if (endpoint.method === "POST" && body.trim()) {
        options.body = body;
      }

      const res = await fetch(path, options);
      const end = performance.now();
      setElapsed(Math.round(end - start));
      setStatus(res.status);

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("json")) {
        const json = await res.json();
        setResponse(JSON.stringify(json, null, 2));
      } else {
        const text = await res.text();
        setResponse(text);
      }
    } catch (err) {
      const end = performance.now();
      setElapsed(Math.round(end - start));
      setResponse(
        `Error: ${err instanceof Error ? err.message : "リクエスト失敗"}`
      );
      setStatus(0);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (response) navigator.clipboard.writeText(response);
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">
        API Playground
      </h3>
      <p className="mb-4 text-sm text-white/50">
        APIをブラウザから直接テスト。エンドポイントを選択してリクエストを送信。
      </p>

      {/* Endpoint selector */}
      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-white/40">
          エンドポイント
        </label>
        <select
          value={selectedIdx}
          onChange={(e) => handleEndpointChange(Number(e.target.value))}
          className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white/80 focus:border-primary/50 focus:outline-none"
        >
          {ENDPOINTS.map((ep, i) => (
            <option key={i} value={i}>
              {ep.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-white/30">{endpoint.hint}</p>
      </div>

      {/* Method + Path */}
      <div className="mb-4 flex items-center gap-2">
        <span
          className={`rounded px-2 py-0.5 text-xs font-bold ${
            endpoint.method === "GET"
              ? "bg-green-500/20 text-green-400"
              : "bg-blue-500/20 text-blue-400"
          }`}
        >
          {endpoint.method}
        </span>
        <input
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 font-mono text-sm text-white/80 focus:border-primary/50 focus:outline-none"
        />
      </div>

      {/* Request body */}
      {endpoint.method === "POST" && (
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-white/40">
            Request Body (JSON)
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            spellCheck={false}
            className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 font-mono text-xs leading-relaxed text-white/70 focus:border-primary/50 focus:outline-none"
          />
        </div>
      )}

      {/* Send button */}
      <button
        type="button"
        onClick={handleSend}
        disabled={loading}
        className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black transition-all duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "送信中..." : "リクエスト送信"}
      </button>

      {/* Response */}
      {(response || loading) && (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-white/40">
                Response
              </span>
              {status !== null && (
                <span
                  className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                    status >= 200 && status < 300
                      ? "bg-green-500/20 text-green-400"
                      : status >= 400
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {status}
                </span>
              )}
              {elapsed !== null && (
                <span className="text-xs text-white/30">{elapsed}ms</span>
              )}
            </div>
            {response && (
              <button
                type="button"
                onClick={handleCopy}
                className="cursor-pointer text-xs text-white/40 transition-all duration-200 hover:text-white/60"
              >
                コピー
              </button>
            )}
          </div>
          <pre className="max-h-96 overflow-auto rounded-lg border border-white/10 bg-black/50 p-4 text-xs leading-relaxed text-white/70">
            {loading ? "リクエスト送信中..." : response}
          </pre>
        </div>
      )}
    </div>
  );
}
