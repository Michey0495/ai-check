"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

type CheckItem = {
  id: string;
  label: string;
  detail: string;
  link?: { href: string; text: string };
};

type CheckCategory = {
  id: string;
  title: string;
  items: CheckItem[];
};

const categories: CheckCategory[] = [
  {
    id: "crawler",
    title: "AIクローラーアクセス",
    items: [
      {
        id: "robots-exist",
        label: "robots.txtがサイトルートに存在する",
        detail: "robots.txtが存在しない場合、クローラーは全ページにアクセス可能ですが、明示的に許可を設定することが推奨されます。",
        link: { href: "/generate/robots-txt", text: "robots.txt生成ツール" },
      },
      {
        id: "robots-gptbot",
        label: "GPTBot（ChatGPT）のアクセスを許可している",
        detail: "User-agent: GPTBot に対して Disallow: / を設定していないことを確認してください。",
      },
      {
        id: "robots-claudebot",
        label: "ClaudeBot（Claude）のアクセスを許可している",
        detail: "User-agent: ClaudeBot に対して Disallow を設定していないことを確認してください。",
      },
      {
        id: "robots-perplexity",
        label: "PerplexityBot のアクセスを許可している",
        detail: "Perplexity AI のクローラーがブロックされていないことを確認してください。",
      },
    ],
  },
  {
    id: "llms",
    title: "llms.txt",
    items: [
      {
        id: "llms-exist",
        label: "llms.txt がサイトルートに設置されている",
        detail: "https://yoursite.com/llms.txt でアクセスできるようにファイルを配置します。",
        link: { href: "/generate/llms-txt", text: "llms.txt生成ツール" },
      },
      {
        id: "llms-content",
        label: "サイト概要・主要ページ・API情報が記載されている",
        detail: "llms.txtには、サイトの一行説明、主要ページのURL一覧、APIエンドポイント情報を含めます。",
        link: { href: "/guides/llms-txt", text: "llms.txt書き方ガイド" },
      },
    ],
  },
  {
    id: "structured",
    title: "構造化データ",
    items: [
      {
        id: "jsonld-exist",
        label: "JSON-LD構造化データが設置されている",
        detail: '<script type="application/ld+json"> タグで各ページに構造化データを設置します。',
        link: { href: "/generate/json-ld", text: "JSON-LD生成ツール" },
      },
      {
        id: "jsonld-type",
        label: "適切なSchema.orgタイプを使用している",
        detail: "WebSite、Organization、Article、FAQPage、Product等、ページの内容に合ったタイプを選択します。",
      },
      {
        id: "jsonld-breadcrumb",
        label: "BreadcrumbList でパンくずリストを記述している",
        detail: "サブページにBreadcrumbList JSON-LDを設置することで、サイト構造をAIに伝えます。",
      },
    ],
  },
  {
    id: "meta",
    title: "メタタグ & OGP",
    items: [
      {
        id: "meta-title",
        label: "全ページに固有の <title> が設定されている",
        detail: "各ページの内容を端的に表すtitleタグを設定します。60文字以内が推奨です。",
      },
      {
        id: "meta-desc",
        label: "全ページに meta description が設定されている",
        detail: "ページの概要を記述するmeta descriptionを設定します。120文字以内が推奨です。",
      },
      {
        id: "meta-ogp",
        label: "OGPタグ（og:title, og:description, og:image）が設定されている",
        detail: "SNS共有時の表示とAI検索エンジンのコンテンツ理解のために、OGPタグを設定します。",
      },
    ],
  },
  {
    id: "content",
    title: "コンテンツ構造",
    items: [
      {
        id: "html-semantic",
        label: "セマンティックHTMLタグ（main, article, section, nav）を使用している",
        detail: "div中心のマークアップではなく、意味のあるHTMLタグを使用してコンテンツの論理構造を明確にします。",
      },
      {
        id: "html-heading",
        label: "見出し階層（h1 > h2 > h3）が正しく構成されている",
        detail: "各ページにh1は1つだけ、h2, h3と階層的に使用します。見出しの飛ばし（h1→h3）は避けます。",
      },
      {
        id: "html-ssr",
        label: "HTMLにコンテンツが含まれている（SSR/SSG）",
        detail: "JavaScriptなしでもHTMLにコンテンツが含まれる状態（SSR/SSG）を確保します。CSRのみだとAIクローラーが読み取れない場合があります。",
      },
    ],
  },
  {
    id: "sitemap",
    title: "サイトマップ",
    items: [
      {
        id: "sitemap-exist",
        label: "sitemap.xml がサイトルートに設置されている",
        detail: "https://yoursite.com/sitemap.xml でアクセスできるようにサイトマップを配置します。",
      },
      {
        id: "sitemap-pages",
        label: "主要ページが全てサイトマップに登録されている",
        detail: "インデックスさせたい全ページのURLと最終更新日をサイトマップに含めます。",
      },
    ],
  },
  {
    id: "agent",
    title: "AI連携（上級）",
    items: [
      {
        id: "agent-json",
        label: "agent.json（A2A Agent Card）を設置している",
        detail: "/.well-known/agent.json にサービスの能力宣言を配置し、AIエージェントによる自動発見を可能にします。",
        link: { href: "/generate/agent-json", text: "agent.json生成ツール" },
      },
      {
        id: "agent-mcp",
        label: "MCP Server APIエンドポイントを提供している",
        detail: "AIエージェントがサービスをツールとして利用できるMCP互換APIを構築します（上級者向け）。",
      },
    ],
  },
];

const STORAGE_KEY = "aicheck-checklist";

function loadChecked(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveChecked(checked: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
}

export function ChecklistClient() {
  const [checked, setChecked] = useState<Record<string, boolean>>(loadChecked);

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const completedItems = Object.values(checked).filter(Boolean).length;
  const progressPct = Math.round((completedItems / totalItems) * 100);

  const toggle = useCallback((id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      saveChecked(next);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setChecked({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-white">
            進捗: {completedItems}/{totalItems} 項目完了
          </span>
          <span className="text-sm font-bold text-primary">{progressPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {completedItems > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="mt-3 cursor-pointer text-xs text-white/30 transition-all duration-200 hover:text-white/50"
          >
            リセット
          </button>
        )}
      </div>

      {/* Categories */}
      {categories.map((cat) => {
        const catCompleted = cat.items.filter((item) => checked[item.id]).length;
        const allDone = catCompleted === cat.items.length;

        return (
          <div key={cat.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">{cat.title}</h2>
              <span className={`text-xs ${allDone ? "text-green-400" : "text-white/30"}`}>
                {catCompleted}/{cat.items.length}
              </span>
            </div>
            <div className="space-y-2">
              {cat.items.map((item) => {
                const isDone = !!checked[item.id];
                return (
                  <div
                    key={item.id}
                    className={`rounded-lg border p-4 transition-all duration-200 ${
                      isDone
                        ? "border-green-500/20 bg-green-500/5"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className="flex w-full cursor-pointer items-start gap-3 text-left"
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all duration-200 ${
                          isDone
                            ? "border-green-500 bg-green-500 text-black"
                            : "border-white/30 bg-transparent"
                        }`}
                      >
                        {isDone && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      <span className={`text-sm font-medium ${isDone ? "text-white/50 line-through" : "text-white"}`}>
                        {item.label}
                      </span>
                    </button>
                    <p className="mt-2 pl-8 text-xs leading-relaxed text-white/40">
                      {item.detail}
                    </p>
                    {item.link && (
                      <Link
                        href={item.link.href}
                        className="mt-2 inline-block cursor-pointer pl-8 text-xs text-primary/80 transition-all duration-200 hover:text-primary"
                      >
                        {item.link.text} &rarr;
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
