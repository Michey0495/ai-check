"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { UrlCheckForm } from "@/components/url-check-form";
import { Badge } from "@/components/ui/badge";
import type { CheckReport } from "@/lib/check-indicators";

function ScoreCircle({ score, maxScore, grade }: { score: number; maxScore: number; grade: string }) {
  const pct = Math.round((score / maxScore) * 100);
  const gradeColors: Record<string, string> = {
    A: "text-green-400",
    B: "text-blue-400",
    C: "text-yellow-400",
    D: "text-orange-400",
    F: "text-red-400",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-white/10">
        <div className="text-center">
          <span className={`text-4xl font-bold ${gradeColors[grade] ?? "text-white"}`}>{grade}</span>
          <div className="text-sm text-white/50">{pct}/100</div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "pass" | "warn" | "fail" }) {
  const variants: Record<string, { label: string; cls: string }> = {
    pass: { label: "OK", cls: "bg-green-500/20 text-green-400 border-green-500/30" },
    warn: { label: "警告", cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    fail: { label: "要対応", cls: "bg-red-500/20 text-red-400 border-red-500/30" },
  };
  const v = variants[status];
  return <Badge className={`${v.cls} border`}>{v.label}</Badge>;
}

export function CheckPageClient() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") ?? "";
  const [report, setReport] = useState<CheckReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    setError("");
    setReport(null);

    fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setReport(data);
        }
      })
      .catch(() => setError("チェック中にエラーが発生しました。"))
      .finally(() => setLoading(false));
  }, [url]);

  return (
    <div className="py-16">
      <h1 className="mb-8 text-center text-3xl font-bold text-white">
        GEOスコアチェック
      </h1>

      <div className="mx-auto mb-12 max-w-xl">
        <UrlCheckForm size="sm" />
      </div>

      {loading && (
        <div className="py-16 text-center">
          <div className="mb-4 text-lg text-white/70">チェック中...</div>
          <p className="text-sm text-white/40">{url} を分析しています</p>
        </div>
      )}

      {error && (
        <div className="mx-auto max-w-xl rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {report && (
        <div className="space-y-8">
          <div className="text-center">
            <p className="mb-4 text-sm text-white/50">{report.url}</p>
            <ScoreCircle
              score={report.totalScore}
              maxScore={report.maxScore}
              grade={report.grade}
            />
            <p className="mt-2 text-sm text-white/40">
              チェック日時: {new Date(report.checkedAt).toLocaleString("ja-JP")}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">詳細結果</h2>
            {report.results.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-white/10 bg-white/5 p-6"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold text-white">{r.message}</h3>
                  <StatusBadge status={r.status} />
                </div>
                {r.details && (
                  <p className="mb-3 text-sm leading-relaxed text-white/50">
                    {r.details}
                  </p>
                )}
                {r.code && (
                  <pre className="overflow-x-auto rounded-lg bg-black/50 p-4 text-xs text-white/70">
                    <code>{r.code}</code>
                  </pre>
                )}
                <div className="mt-2 text-xs text-white/30">
                  スコア: {r.score}/{r.maxScore}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!url && !loading && (
        <div className="py-16 text-center text-white/40">
          <p className="text-lg">上のフォームにURLを入力してチェックを開始</p>
        </div>
      )}
    </div>
  );
}
