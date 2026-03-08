"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CheckReport } from "@/lib/check-indicators";

type CompareResult = {
  url: string;
  report: CheckReport | null;
  error: string;
  loading: boolean;
};

function ScoreBar({ score, maxScore, status }: { score: number; maxScore: number; status: string }) {
  const pct = (score / maxScore) * 100;
  const color = status === "pass" ? "#4ade80" : status === "warn" ? "#facc15" : "#f87171";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-white/10">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-10 text-right text-xs text-white/40">{score}/{maxScore}</span>
    </div>
  );
}

const gradeColors: Record<string, string> = {
  A: "text-green-400",
  B: "text-blue-400",
  C: "text-yellow-400",
  D: "text-orange-400",
  F: "text-red-400",
};

const MAX_URLS = 5;

export function CompareClient() {
  const searchParams = useSearchParams();
  const initialUrl1 = searchParams.get("url1") ?? "";
  const [urls, setUrls] = useState([initialUrl1, ""]);
  const [results, setResults] = useState<CompareResult[]>([]);
  const [running, setRunning] = useState(false);

  const handleUrlChange = useCallback((index: number, value: string) => {
    setUrls((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const addSlot = useCallback(() => {
    setUrls((prev) => (prev.length < MAX_URLS ? [...prev, ""] : prev));
  }, []);

  const removeSlot = useCallback((index: number) => {
    setUrls((prev) => (prev.length > 2 ? prev.filter((_, i) => i !== index) : prev));
  }, []);

  const handleCompare = useCallback(async () => {
    const validUrls = urls.filter((u) => u.trim().length > 0);
    if (validUrls.length < 2) return;

    setRunning(true);
    const initial: CompareResult[] = validUrls.map((url) => ({
      url: url.trim(),
      report: null,
      error: "",
      loading: true,
    }));
    setResults(initial);

    const promises = validUrls.map(async (url, i) => {
      try {
        let normalizedUrl = url.trim();
        if (!/^https?:\/\//i.test(normalizedUrl)) {
          normalizedUrl = `https://${normalizedUrl}`;
        }
        const res = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: normalizedUrl }),
        });
        const data = await res.json();
        setResults((prev) => {
          const next = [...prev];
          if (data.error) {
            next[i] = { ...next[i], error: data.error, loading: false };
          } else {
            next[i] = { ...next[i], report: data, loading: false };
          }
          return next;
        });
      } catch (err) {
        const msg = err instanceof TypeError ? "ネットワークエラー: サーバーに接続できません" : "チェックに失敗しました";
        setResults((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], error: msg, loading: false };
          return next;
        });
      }
    });

    await Promise.all(promises);
    setRunning(false);
  }, [urls]);

  const hasResults = results.length > 0;
  const reports = results.filter((r) => r.report !== null);

  return (
    <div className="py-16">
      <h1 className="mb-2 text-center text-3xl font-bold text-white">
        GEOスコア比較
      </h1>
      <p className="mb-8 text-center text-white/50">
        複数サイトのAI検索対応度を比較。自サイトと競合を横並びでチェック。
      </p>

      <div className="mx-auto max-w-2xl space-y-3">
        {urls.map((url, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-16 text-right text-sm text-white/40">
              サイト{i + 1}
            </span>
            <Input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => handleUrlChange(i, e.target.value)}
              maxLength={2048}
              aria-label={`サイト${i + 1}のURL`}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
              disabled={running}
            />
            {urls.length > 2 && (
              <button
                type="button"
                onClick={() => removeSlot(i)}
                disabled={running}
                className="cursor-pointer p-1 text-white/30 transition-all duration-200 hover:text-white/60 disabled:opacity-50"
                aria-label={`サイト${i + 1}を削除`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              </button>
            )}
          </div>
        ))}
        {urls.length < MAX_URLS && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={addSlot}
              disabled={running}
              className="cursor-pointer text-sm text-white/40 transition-all duration-200 hover:text-white/70 disabled:opacity-50"
            >
              + サイトを追加
            </button>
          </div>
        )}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleCompare}
            disabled={running || urls.filter((u) => u.trim()).length < 2}
            className="cursor-pointer bg-primary px-8 font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/80 disabled:opacity-50"
          >
            {running ? "比較中..." : "比較する"}
          </Button>
        </div>
        <p className="text-center text-xs text-white/30">最低2サイト / 最大{MAX_URLS}サイトまで</p>
      </div>

      {hasResults && (
        <div className="mt-12 space-y-8">
          {/* Score overview */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {results.map((r, i) => (
              <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
                {r.loading && (
                  <div className="py-4" role="status" aria-live="polite">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />
                    <p className="mt-2 text-sm text-white/40">チェック中...</p>
                  </div>
                )}
                {r.error && (
                  <div className="py-4" role="alert">
                    <p className="text-sm text-red-400">{r.error}</p>
                  </div>
                )}
                {r.report && (
                  <>
                    <p className="mb-2 truncate text-xs text-white/40">{r.report.url}</p>
                    <span className={`text-4xl font-bold ${gradeColors[r.report.grade] ?? "text-white"}`}>
                      {r.report.grade}
                    </span>
                    <p className="mt-1 text-sm text-white/50">
                      {Math.round((r.report.totalScore / r.report.maxScore) * 100)}/100
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Detail comparison */}
          {reports.length >= 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">指標別比較</h2>
              {reports[0].report!.results.map((r) => (
                <div key={r.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="mb-3 text-sm font-medium text-white">{r.message.split(":")[0]}</p>
                  <div className="space-y-2">
                    {reports.map((cr, i) => {
                      const item = cr.report!.results.find((x) => x.id === r.id);
                      if (!item) return null;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-32 truncate text-xs text-white/40">
                            {(() => { try { return new URL(cr.report!.url).hostname; } catch { return cr.report!.url; } })()}
                          </span>
                          <div className="flex-1">
                            <ScoreBar score={item.score} maxScore={item.maxScore} status={item.status} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!hasResults && (
        <div className="mt-12 text-center">
          <p className="text-sm text-white/40">
            単体チェックは{" "}
            <Link href="/check" className="cursor-pointer text-primary/80 transition-all duration-200 hover:text-primary">
              GEOスコアチェック
            </Link>{" "}
            から。
          </p>
        </div>
      )}
    </div>
  );
}
