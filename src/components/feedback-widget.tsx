"use client";

import { useState } from "react";

export function FeedbackWidget({ repoName }: { repoName: string }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"bug" | "feature" | "other">("bug");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const submit = async () => {
    if (!message.trim()) return;
    setSubmitError(false);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message, repo: repoName }),
      });
      if (!res.ok) {
        setSubmitError(true);
        return;
      }
      setSent(true);
      setTimeout(() => {
        setOpen(false);
        setSent(false);
        setMessage("");
      }, 2000);
    } catch {
      setSubmitError(true);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 bg-white/10 text-white/70 px-4 py-2 rounded-full border border-white/10 hover:bg-white/20 hover:text-white transition-all duration-200 text-sm z-50 backdrop-blur-sm cursor-pointer"
      >
        フィードバック
      </button>
    );
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="feedback-title" className="fixed bottom-4 right-4 w-72 max-w-[calc(100vw-2rem)] bg-black/90 border border-white/10 rounded-xl shadow-2xl p-4 z-50 backdrop-blur-md sm:w-80">
      <div className="flex justify-between items-center mb-3">
        <h3 id="feedback-title" className="font-bold text-white text-sm">フィードバック</h3>
        <button onClick={() => setOpen(false)} aria-label="閉じる" className="text-white/40 hover:text-white/70 transition-colors cursor-pointer">&times;</button>
      </div>
      {sent ? (
        <p className="text-green-400 text-center py-4 text-sm">送信しました</p>
      ) : (
        <>
          <div className="flex gap-2 mb-3">
            {(["bug", "feature", "other"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                aria-pressed={type === t}
                className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                  type === t ? "bg-white/20 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {t === "bug" ? "不具合" : t === "feature" ? "要望" : "その他"}
              </button>
            ))}
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            aria-label="フィードバック内容"
            placeholder="ご意見をお聞かせください..."
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white placeholder:text-white/50 h-24 resize-none mb-3 focus:outline-none focus:border-white/20"
          />
          {submitError && (
            <p className="text-red-400 text-xs mb-2">送信に失敗しました。もう一度お試しください。</p>
          )}
          <button
            onClick={submit}
            className="w-full bg-white/10 text-white py-2 rounded-lg text-sm hover:bg-white/20 transition-colors cursor-pointer"
          >
            送信
          </button>
        </>
      )}
    </div>
  );
}
