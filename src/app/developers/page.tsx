import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API / 開発者向けドキュメント",
  description:
    "AI Check REST API・MCP Serverの使い方。GEOスコアチェック、llms.txt生成、robots.txt生成、JSON-LD生成、agent.json生成のAPIリファレンス。",
  alternates: { canonical: "https://ai-check.ezoai.jp/developers" },
  openGraph: {
    title: "API / 開発者向けドキュメント",
    description: "AI Check REST API・MCP Serverの使い方。GEOスコアチェック、llms.txt生成、robots.txt生成、JSON-LD生成、agent.json生成のAPIリファレンス。",
    url: "https://ai-check.ezoai.jp/developers",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "AI Check", item: "https://ai-check.ezoai.jp" },
    { "@type": "ListItem", position: 2, name: "開発者向けドキュメント", item: "https://ai-check.ezoai.jp/developers" },
  ],
};

const endpoints = [
  {
    method: "GET",
    path: "/api/check?url=https://example.com",
    description: "URLのGEOスコアをチェック（GETメソッド）。クエリパラメータでURLを指定。ブラウザから直接アクセス可能。",
    request: `// クエリパラメータ
?url=https://example.com   // 必須: チェック対象URL`,
    response: `{
  "url": "https://example.com",
  "totalScore": 65,
  "maxScore": 100,
  "grade": "C",
  "results": [...],
  "checkedAt": "2026-03-10T00:00:00.000Z",
  "accessibility": {
    "imgCount": 12,
    "imgWithAlt": 10,
    "hasSkipNav": true,
    "ariaLandmarks": 3,
    "hasAriaLabels": true
  }
}`,
    notes: "レート制限: 10リクエスト/分（IP単位）。POSTと同じレスポンス形式。",
  },
  {
    method: "POST",
    path: "/api/check",
    description: "URLのGEOスコアをチェック（POSTメソッド）",
    request: `{
  "url": "https://example.com"
}`,
    response: `{
  "url": "https://example.com",
  "totalScore": 65,
  "maxScore": 100,
  "grade": "C",
  "results": [
    {
      "id": "robots-txt",
      "score": 15,
      "maxScore": 15,
      "status": "pass",
      "message": "AIクローラーアクセス: 全て許可",
      "details": "...",
      "code": null
    }
  ],
  "checkedAt": "2026-03-10T00:00:00.000Z"
}`,
    notes: "レート制限: 10リクエスト/分（IP単位）",
  },
  {
    method: "POST",
    path: "/api/generate",
    description: "llms.txt / robots.txt を生成",
    request: `// llms.txt生成
{
  "type": "llms-txt",
  "data": {
    "siteName": "My Site",
    "siteUrl": "https://example.com",
    "description": "サイト説明",
    "pages": [
      { "path": "/", "title": "トップ", "description": "概要" }
    ]
  }
}

// robots.txt生成
{
  "type": "robots-txt",
  "data": {
    "sitemapUrl": "https://example.com/sitemap.xml"
  }
}`,
    response: `{
  "content": "生成されたファイル内容",
  "filename": "llms.txt"
}`,
    notes: null,
  },
  {
    method: "POST",
    path: "/api/check/batch",
    description: "複数URLのGEOスコアを一括チェック（最大10件）",
    request: `{
  "urls": [
    "https://example.com",
    "https://example.org"
  ]
}`,
    response: `{
  "results": [
    {
      "url": "https://example.com",
      "status": "ok",
      "totalScore": 65,
      "maxScore": 100,
      "grade": "C",
      "results": [...],
      "checkedAt": "2026-03-11T00:00:00.000Z"
    },
    {
      "url": "https://example.org",
      "status": "ok",
      ...
    }
  ],
  "count": 2
}`,
    notes: "最大10件まで。レート制限はURL単位で適用。",
  },
  {
    method: "GET",
    path: "/api/badge",
    description: "GEOスコアバッジ（SVG画像）を生成。READMEやサイトに埋め込み可能。",
    request: `// クエリパラメータ
?url=https://example.com   // 必須: チェック対象URL
&style=flat                 // 任意: flat（デフォルト）/ card`,
    response: `<!-- SVG画像が返されます -->
<!-- Content-Type: image/svg+xml -->

<!-- Markdown埋め込み例 -->
[![GEO Score](https://ai-check.ezoai.jp/api/badge?url=https://example.com)](https://ai-check.ezoai.jp/check?url=https://example.com)

<!-- HTML埋め込み例 -->
<a href="https://ai-check.ezoai.jp/check?url=https://example.com">
  <img src="https://ai-check.ezoai.jp/api/badge?url=https://example.com" alt="GEO Score" />
</a>`,
    notes: "結果は1時間キャッシュされます。",
  },
];

const mcpTools = [
  {
    name: "check_geo_score",
    description: "GEOスコアチェック",
    params: "url: string (必須)",
  },
  {
    name: "generate_llms_txt",
    description: "llms.txt生成",
    params: "siteName: string (必須), siteUrl: string (必須), description?: string, pages?: string[]",
  },
  {
    name: "generate_robots_txt",
    description: "robots.txt生成",
    params: "sitemapUrl?: string, allowedCrawlers?: string[]",
  },
  {
    name: "generate_json_ld",
    description: "JSON-LD構造化データ生成",
    params: "type: string (必須), name: string (必須), url: string (必須), description?: string, data?: object",
  },
  {
    name: "generate_agent_json",
    description: "agent.json生成",
    params: "name: string (必須), url: string (必須), description?: string, capabilities?: string[], apiEndpoints?: string[]",
  },
];

export default function DevelopersPage() {
  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <h1 className="mb-4 text-3xl font-bold text-white">
        API / 開発者向けドキュメント
      </h1>
      <p className="mb-12 text-lg leading-relaxed text-white/60">
        AI CheckのREST APIとMCP Serverを使って、GEOスコアチェックやファイル生成を自動化できます。
      </p>

      <div className="space-y-16">
        {/* REST API */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-white">REST API</h2>
          <p className="mb-6 text-sm text-white/60">
            ベースURL: <code className="rounded bg-white/10 px-1.5 py-0.5 text-white/80">https://ai-check.ezoai.jp</code>
          </p>

          <div className="space-y-8">
            {endpoints.map((ep) => (
              <div
                key={ep.path}
                className="rounded-lg border border-white/10 bg-white/5 p-6"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary">
                    {ep.method}
                  </span>
                  <code className="text-sm font-semibold text-white">
                    {ep.path}
                  </code>
                </div>
                <p className="mb-4 text-sm text-white/60">{ep.description}</p>

                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                      Request Body
                    </h4>
                    <pre className="overflow-x-auto rounded-lg bg-black/50 border border-white/10 p-4 text-xs leading-relaxed text-white/70">
                      {ep.request}
                    </pre>
                  </div>
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                      Response
                    </h4>
                    <pre className="overflow-x-auto rounded-lg bg-black/50 border border-white/10 p-4 text-xs leading-relaxed text-white/70">
                      {ep.response}
                    </pre>
                  </div>
                  {ep.notes && (
                    <p className="text-xs text-white/40">{ep.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MCP Server */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-white">
            MCP Server
          </h2>
          <p className="mb-4 text-sm text-white/60">
            AI CheckはMCP（Model Context Protocol）に対応しています。AIエージェント（Claude等）からツールとして直接利用できます。
          </p>
          <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/60">
              エンドポイント: <code className="rounded bg-white/10 px-1.5 py-0.5 text-white/80">POST /api/mcp</code>
            </p>
            <p className="mt-1 text-sm text-white/60">
              プロトコル: <code className="rounded bg-white/10 px-1.5 py-0.5 text-white/80">JSON-RPC 2.0</code>
            </p>
          </div>

          <h3 className="mb-4 text-lg font-semibold text-white">利用可能なツール</h3>
          <div className="space-y-3">
            {mcpTools.map((tool) => (
              <div
                key={tool.name}
                className="rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <div className="mb-1 flex items-baseline gap-2">
                  <code className="text-sm font-semibold text-primary">
                    {tool.name}
                  </code>
                  <span className="text-xs text-white/40">
                    {tool.description}
                  </span>
                </div>
                <p className="text-xs text-white/50">
                  パラメータ: {tool.params}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-lg font-semibold text-white">使用例</h3>
            <pre className="overflow-x-auto rounded-lg bg-black/50 border border-white/10 p-4 text-xs leading-relaxed text-white/70">
{`// GEOスコアチェック
curl -X POST https://ai-check.ezoai.jp/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "check_geo_score",
      "arguments": { "url": "https://example.com" }
    },
    "id": 1
  }'`}
            </pre>
          </div>
        </section>

        {/* Error Codes */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-white">
            エラーコード
          </h2>
          <p className="mb-4 text-sm text-white/60">
            APIエラーレスポンスには <code className="rounded bg-white/10 px-1.5 py-0.5 text-white/80">errorCode</code> フィールドが含まれます。プログラムでのエラーハンドリングに活用できます。
          </p>
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 py-3 text-left font-semibold text-white/80">errorCode</th>
                  <th className="px-4 py-3 text-left font-semibold text-white/80">HTTP</th>
                  <th className="px-4 py-3 text-left font-semibold text-white/80">説明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { code: "MISSING_URL", status: "400", desc: "URLが指定されていない" },
                  { code: "INVALID_URL", status: "400", desc: "URLの形式が不正" },
                  { code: "URL_TOO_LONG", status: "400", desc: "URLが2048文字を超過" },
                  { code: "INVALID_PROTOCOL", status: "400", desc: "http/https以外のプロトコル" },
                  { code: "INVALID_BODY", status: "400", desc: "リクエストボディがJSON形式でない" },
                  { code: "SSRF_BLOCKED", status: "400", desc: "プライベートネットワークへのアクセス" },
                  { code: "RATE_LIMITED", status: "429", desc: "レート制限超過（10リクエスト/分）" },
                  { code: "SITE_UNREACHABLE", status: "422", desc: "対象サイトに接続できない" },
                  { code: "MISSING_URLS", status: "400", desc: "バッチAPI: urls配列が未指定" },
                  { code: "BATCH_LIMIT_EXCEEDED", status: "400", desc: "バッチAPI: 10件超過" },
                  { code: "INTERNAL_ERROR", status: "500", desc: "サーバー内部エラー" },
                ].map((err) => (
                  <tr key={err.code}>
                    <td className="px-4 py-2">
                      <code className="text-xs text-primary">{err.code}</code>
                    </td>
                    <td className="px-4 py-2 text-white/50">{err.status}</td>
                    <td className="px-4 py-2 text-white/60">{err.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-black/50 border border-white/10 p-4 text-xs leading-relaxed text-white/70">
{`// エラーレスポンス例
{
  "error": "リクエスト数が上限を超えました。",
  "errorCode": "RATE_LIMITED"
}`}
          </pre>
        </section>

        {/* AI Public Channels */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-white">
            AI公開チャネル
          </h2>
          <p className="mb-4 text-sm text-white/60">
            AI Check自身もAI検索に完全対応しています。以下のエンドポイントからサービス情報を取得できます。
          </p>
          <div className="space-y-3">
            {[
              { path: "/llms.txt", desc: "AI向けサイト説明（マークダウン）" },
              { path: "/.well-known/agent.json", desc: "A2A Agent Card" },
              { path: "/robots.txt", desc: "AIクローラー許可設定" },
              { path: "/sitemap.xml", desc: "サイトマップ" },
              { path: "/api/mcp", desc: "MCP Server（JSON-RPC 2.0）" },
            ].map((ch) => (
              <div
                key={ch.path}
                className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3"
              >
                <code className="text-sm font-semibold text-white/80">
                  {ch.path}
                </code>
                <span className="text-xs text-white/40">{ch.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Related */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-white">関連コンテンツ</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { href: "/check", label: "GEOスコアチェック", desc: "URLを入力してAI検索対応度を診断" },
              { href: "/guides/geo", label: "GEO対策ガイド", desc: "AI検索最適化の基本から実践まで" },
              { href: "/about", label: "AI Checkについて", desc: "サービス概要・機能一覧" },
              { href: "/guides/glossary", label: "用語集", desc: "GEO・AI検索の用語を解説" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:border-primary/30"
              >
                <p className="font-semibold text-white">{item.label}</p>
                <p className="mt-1 text-xs text-white/50">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
