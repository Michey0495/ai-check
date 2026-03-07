"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UrlCheckForm({ size = "lg" }: { size?: "lg" | "sm" }) {
  const [url, setUrl] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = "https://" + normalized;
    }
    router.push(`/check?url=${encodeURIComponent(normalized)}`);
  }

  const isLg = size === "lg";

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-3">
      <Input
        type="text"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        aria-label="チェックするURL"
        maxLength={2048}
        className={`flex-1 border-white/10 bg-white/5 text-white placeholder:text-white/30 ${
          isLg ? "h-14 text-lg" : "h-10"
        }`}
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
  );
}
