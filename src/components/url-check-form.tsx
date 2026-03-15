"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeUrl } from "@/lib/url-utils";

const HISTORY_KEY = "aicheck-history";

function getHistoryUrls(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const data = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
    return data.map((h: { url: string }) => h.url).filter(Boolean);
  } catch {
    return [];
  }
}

export function UrlCheckForm({ size = "lg" }: { size?: "lg" | "sm" }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl+K to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleInputChange(value: string) {
    setUrl(value);
    setError("");
    setSelectedIdx(-1);

    if (value.trim().length > 0) {
      const history = getHistoryUrls();
      const filtered = history.filter((u) =>
        u.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }

  function handleFocus() {
    if (url.trim().length === 0) {
      const history = getHistoryUrls();
      if (history.length > 0) {
        setSuggestions(history.slice(0, 5));
        setShowSuggestions(true);
      }
    } else if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }

  function selectSuggestion(suggestion: string) {
    setUrl(suggestion);
    setShowSuggestions(false);
    setSelectedIdx(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && selectedIdx >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[selectedIdx]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowSuggestions(false);
    setError("");
    if (!url.trim()) {
      setError("URLを入力してください。");
      return;
    }
    const normalized = normalizeUrl(url);
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
    <div className="w-full" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="flex w-full gap-3">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder={isLg ? "https://example.com（Ctrl+K で検索）" : "https://example.com"}
            value={url}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            aria-label="チェックするURL"
            aria-invalid={!!error}
            aria-describedby={error ? "url-error" : undefined}
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-controls={showSuggestions ? "url-suggestions" : undefined}
            autoComplete="off"
            maxLength={2048}
            className={`w-full border-white/10 bg-white/5 text-white placeholder:text-white/50 ${
              isLg ? "h-14 text-lg" : "h-10"
            } ${error ? "border-red-500/50" : ""}`}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul
              id="url-suggestions"
              role="listbox"
              className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-white/10 bg-black/95 py-1 shadow-xl backdrop-blur-sm"
            >
              {suggestions.map((s, i) => (
                <li
                  key={s}
                  role="option"
                  aria-selected={i === selectedIdx}
                  className={`cursor-pointer px-3 py-2 text-sm transition-all duration-100 ${
                    i === selectedIdx
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white/80"
                  }`}
                  onMouseDown={() => selectSuggestion(s)}
                >
                  <span className="font-mono text-xs">{s}</span>
                </li>
              ))}
              <li role="none" className="border-t border-white/5 px-3 py-1.5 text-xs text-white/40">
                チェック履歴から候補を表示
              </li>
            </ul>
          )}
        </div>
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
