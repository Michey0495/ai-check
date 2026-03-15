"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GRADE_BADGE_COLORS } from "@/lib/grade-colors";

type HistoryEntry = {
  url: string;
  totalScore: number;
  maxScore: number;
  grade: string;
  checkedAt: string;
  previousScore?: number;
};

const HISTORY_KEY = "aicheck-history";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): string {
  return localStorage.getItem(HISTORY_KEY) ?? "[]";
}

function getServerSnapshot(): string {
  return "[]";
}

function ScoreTrendChart({ entries }: { entries: HistoryEntry[] }) {
  // Sort by date ascending for the chart
  const sorted = [...entries]
    .sort((a, b) => new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime())
    .slice(-20); // last 20 entries

  if (sorted.length < 2) return null;

  const w = 600;
  const h = 200;
  const px = 40; // padding x
  const py = 20; // padding y
  const chartW = w - px * 2;
  const chartH = h - py * 2;

  const scores = sorted.map((e) => (e.maxScore > 0 ? Math.round((e.totalScore / e.maxScore) * 100) : 0));
  const minScore = Math.max(0, Math.min(...scores) - 10);
  const maxScore = Math.min(100, Math.max(...scores) + 10);
  const range = maxScore - minScore || 1;

  const points = scores.map((s, i) => ({
    x: px + (i / (sorted.length - 1)) * chartW,
    y: py + chartH - ((s - minScore) / range) * chartH,
    score: s,
    date: sorted[i].checkedAt,
    grade: sorted[i].grade,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = pathD + ` L${points[points.length - 1].x},${py + chartH} L${points[0].x},${py + chartH} Z`;

  // Grid lines
  const gridLines = [0, 25, 50, 75, 100].filter((v) => v >= minScore && v <= maxScore);

  return (
    <div className="mb-8 rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="mb-3 text-sm text-white/50">スコア推移</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="GEOスコア推移チャート">
        {/* Grid */}
        {gridLines.map((v) => {
          const y = py + chartH - ((v - minScore) / range) * chartH;
          return (
            <g key={v}>
              <line x1={px} y1={y} x2={w - px} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={px - 6} y={y} fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="end" dominantBaseline="middle">
                {v}
              </text>
            </g>
          );
        })}
        {/* Area fill */}
        <path d={areaD} fill="url(#trendGradient)" />
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(96,165,250,0.3)" />
            <stop offset="100%" stopColor="rgba(96,165,250,0)" />
          </linearGradient>
        </defs>
        {/* Line */}
        <path d={pathD} fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinejoin="round" />
        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#000" stroke="#60a5fa" strokeWidth="2" />
            {/* Show score on first, last, and every 5th point */}
            {(i === 0 || i === points.length - 1 || i % 5 === 0) && (
              <text x={p.x} y={p.y - 10} fill="rgba(255,255,255,0.5)" fontSize="9" textAnchor="middle">
                {p.score}
              </text>
            )}
          </g>
        ))}
        {/* Date labels */}
        {points
          .filter((_, i) => i === 0 || i === points.length - 1 || (points.length > 6 && i === Math.floor(points.length / 2)))
          .map((p, i) => (
            <text key={i} x={p.x} y={h - 2} fill="rgba(255,255,255,0.5)" fontSize="8" textAnchor="middle">
              {new Date(p.date).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
            </text>
          ))}
      </svg>
    </div>
  );
}

const gradeColors = GRADE_BADGE_COLORS;

export function HistoryClient() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [sortBy, setSortBy] = useState<"date" | "score">("date");
  const [confirmClear, setConfirmClear] = useState(false);

  let entries: HistoryEntry[] = [];
  try {
    entries = JSON.parse(raw);
  } catch {
    entries = [];
  }

  const sorted = [...entries].sort((a, b) => {
    if (sortBy === "score") {
      const aPct = a.maxScore > 0 ? a.totalScore / a.maxScore : 0;
      const bPct = b.maxScore > 0 ? b.totalScore / b.maxScore : 0;
      return bPct - aPct;
    }
    return new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime();
  });

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    window.dispatchEvent(new Event("storage"));
    setConfirmClear(false);
  };

  const removeEntry = (url: string) => {
    try {
      const current: HistoryEntry[] = JSON.parse(
        localStorage.getItem(HISTORY_KEY) ?? "[]"
      );
      const updated = current.filter((e) => e.url !== url);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch {
      localStorage.removeItem(HISTORY_KEY);
      window.dispatchEvent(new Event("storage"));
    }
  };

  // Stats
  const avgScore =
    entries.length > 0
      ? Math.round(
          entries.reduce(
            (sum, e) =>
              sum + (e.maxScore > 0 ? (e.totalScore / e.maxScore) * 100 : 0),
            0
          ) / entries.length
        )
      : 0;
  const gradeDistribution = entries.reduce(
    (acc, e) => {
      acc[e.grade] = (acc[e.grade] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-12 text-center">
        <p className="mb-4 text-lg text-white/50">
          まだチェック履歴がありません
        </p>
        <p className="mb-6 text-sm text-white/30">
          GEOスコアチェックを実行すると、ここに履歴が表示されます。
        </p>
        <Link href="/check">
          <Button>GEOスコアをチェック</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Summary */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-2xl font-bold text-primary">{entries.length}</p>
          <p className="text-sm text-white/40">チェック済みサイト</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-2xl font-bold text-white">{avgScore}</p>
          <p className="text-sm text-white/40">平均スコア</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {gradeDistribution["A"] ?? 0}
          </p>
          <p className="text-sm text-white/40">Aランク</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-2xl font-bold text-red-400">
            {(gradeDistribution["D"] ?? 0) + (gradeDistribution["F"] ?? 0)}
          </p>
          <p className="text-sm text-white/40">要改善 (D/F)</p>
        </div>
      </div>

      {/* Grade Distribution Bar */}
      {entries.length > 1 && (
        <div className="mb-8">
          <p className="mb-2 text-sm text-white/50">グレード分布</p>
          <div className="flex h-6 overflow-hidden rounded-full">
            {(["A", "B", "C", "D", "F"] as const).map((grade) => {
              const count = gradeDistribution[grade] ?? 0;
              if (count === 0) return null;
              const pct = (count / entries.length) * 100;
              const colors: Record<string, string> = {
                A: "bg-green-500",
                B: "bg-blue-500",
                C: "bg-yellow-500",
                D: "bg-orange-500",
                F: "bg-red-500",
              };
              return (
                <div
                  key={grade}
                  className={`${colors[grade]} flex items-center justify-center text-xs font-bold text-black`}
                  style={{ width: `${pct}%`, minWidth: count > 0 ? "24px" : 0 }}
                  title={`${grade}: ${count}件`}
                >
                  {pct >= 10 ? grade : ""}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Score Trend Chart */}
      <ScoreTrendChart entries={entries} />

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("date")}
            className={`rounded-md px-3 py-1.5 text-sm transition-all duration-200 ${
              sortBy === "date"
                ? "bg-primary/20 text-primary"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            日付順
          </button>
          <button
            onClick={() => setSortBy("score")}
            className={`rounded-md px-3 py-1.5 text-sm transition-all duration-200 ${
              sortBy === "score"
                ? "bg-primary/20 text-primary"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            スコア順
          </button>
        </div>
        <div>
          {confirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-400">全履歴を削除しますか?</span>
              <button
                onClick={clearHistory}
                className="rounded-md bg-red-500/20 px-3 py-1.5 text-sm text-red-400 transition-all duration-200 hover:bg-red-500/30"
              >
                削除する
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="rounded-md px-3 py-1.5 text-sm text-white/50 transition-all duration-200 hover:text-white/70"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="rounded-md px-3 py-1.5 text-sm text-white/40 transition-all duration-200 hover:text-red-400"
            >
              履歴をクリア
            </button>
          )}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {sorted.map((entry) => {
          const pct =
            entry.maxScore > 0
              ? Math.round((entry.totalScore / entry.maxScore) * 100)
              : 0;
          const prevPct = entry.previousScore;
          const diff = prevPct !== undefined ? pct - prevPct : null;

          return (
            <div
              key={entry.url + entry.checkedAt}
              className="group rounded-lg border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:border-white/20"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`${gradeColors[entry.grade] ?? "bg-white/10 text-white/50"} border`}
                    >
                      {entry.grade}
                    </Badge>
                    <span className="font-mono text-lg font-bold text-white">
                      {pct}
                    </span>
                    <span className="text-sm text-white/30">/100</span>
                    {diff !== null && diff !== 0 && (
                      <span
                        className={`text-sm font-medium ${diff > 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {diff > 0 ? "+" : ""}
                        {diff}pt
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-white/60">
                    {entry.url}
                  </p>
                  <p className="mt-0.5 text-xs text-white/30">
                    {new Date(entry.checkedAt).toLocaleString("ja-JP")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/check?url=${encodeURIComponent(entry.url)}`}
                    className="rounded-md bg-primary/10 px-3 py-1.5 text-sm text-primary transition-all duration-200 hover:bg-primary/20"
                  >
                    再チェック
                  </Link>
                  <Link
                    href={`/check/compare?url1=${encodeURIComponent(entry.url)}`}
                    className="rounded-md bg-white/5 px-3 py-1.5 text-sm text-white/50 transition-all duration-200 hover:bg-white/10 hover:text-white/70"
                  >
                    比較
                  </Link>
                  <button
                    onClick={() => removeEntry(entry.url)}
                    className="rounded-md px-3 py-1.5 text-sm text-white/30 opacity-0 transition-all duration-200 hover:text-red-400 group-hover:opacity-100"
                    aria-label={`${entry.url}の履歴を削除`}
                  >
                    削除
                  </button>
                </div>
              </div>
              {/* Score Bar */}
              <div className="mt-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 90
                        ? "bg-green-500"
                        : pct >= 75
                          ? "bg-blue-500"
                          : pct >= 60
                            ? "bg-yellow-500"
                            : pct >= 40
                              ? "bg-orange-500"
                              : "bg-red-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <Link href="/check">
          <Button>新しいサイトをチェック</Button>
        </Link>
      </div>
    </div>
  );
}
