"use client";

import { useState } from "react";
import Link from "next/link";

type HistoryEntry = {
  url: string;
  totalScore: number;
  maxScore: number;
  grade: string;
  checkedAt: string;
};

const HISTORY_KEY = "aicheck-history";

function getGradeColor(grade: string) {
  switch (grade) {
    case "A": return "text-green-400";
    case "B": return "text-blue-400";
    case "C": return "text-yellow-400";
    case "D": return "text-orange-400";
    default: return "text-red-400";
  }
}

function getGradeBg(grade: string) {
  switch (grade) {
    case "A": return "bg-green-500/10";
    case "B": return "bg-blue-500/10";
    case "C": return "bg-yellow-500/10";
    case "D": return "bg-orange-500/10";
    default: return "bg-red-500/10";
  }
}

export function RecentChecks() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as HistoryEntry[];
      return stored.slice(0, 5);
    } catch {
      return [];
    }
  });

  if (history.length === 0) return null;

  return (
    <section className="py-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">最近のチェック</h2>
        <Link
          href="/history"
          className="text-sm text-primary/70 transition-colors hover:text-primary"
        >
          履歴を見る →
        </Link>
      </div>
      <div className="space-y-2">
        {history.map((entry) => {
          const pct = Math.round((entry.totalScore / entry.maxScore) * 100);
          const hostname = (() => {
            try { return new URL(entry.url).hostname; } catch { return entry.url; }
          })();
          return (
            <Link
              key={entry.url + entry.checkedAt}
              href={`/check?url=${encodeURIComponent(entry.url)}`}
              className="flex items-center gap-4 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 transition-all duration-200 hover:border-white/10 hover:bg-white/5"
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${getGradeBg(entry.grade)} ${getGradeColor(entry.grade)}`}>
                {entry.grade}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white/70">{hostname}</p>
                <p className="text-xs text-white/30">
                  {new Date(entry.checkedAt).toLocaleDateString("ja-JP")} チェック
                </p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${getGradeColor(entry.grade)}`}>{pct}</p>
                <p className="text-xs text-white/30">/ 100</p>
              </div>
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full ${entry.grade === "A" ? "bg-green-400" : entry.grade === "B" ? "bg-blue-400" : entry.grade === "C" ? "bg-yellow-400" : entry.grade === "D" ? "bg-orange-400" : "bg-red-400"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
