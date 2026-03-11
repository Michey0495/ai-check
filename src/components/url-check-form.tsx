"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UrlCheckForm({ size = "lg" }: { size?: "lg" | "sm" }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!url.trim()) {
      setError("URLを入力してください。");
      return;
    }
    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = "https://" + normalized;
    }
    try {
      const parsed = new URL(normalized);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        setError("http または https のURLを入力してください。");
        return;
      }
    } catch {
      setError("有効なURLを入力してください。");
      return;
    }
    router.push(`/check?url=${encodeURIComponent(normalized)}`);
  }

  const isLg = size === "lg";

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex w-full gap-3">
        <Input
          type="text"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(""); }}
          aria-label="チェックするURL"
          aria-invalid={!!error}
          aria-describedby={error ? "url-error" : undefined}
          maxLength={2048}
          className={`flex-1 border-white/10 bg-white/5 text-white placeholder:text-white/50 ${
            isLg ? "h-14 text-lg" : "h-10"
          } ${error ? "border-red-500/50" : ""}`}
        />
        <Button
          type="submit"
          className={`cursor-pointer bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/80 ${
            isLg ? "h-14 px-8 text-lg" : "h-10 px-6"
          }`}
        >
          チェック
        </Button>
      </form>
      {error && (
        <p id="url-error" className="mt-2 text-sm text-red-400" role="alert">{error}</p>
      )}
    </div>
  );
}
