"use client";

import { useState } from "react";

export function CurlCopy({ curl }: { curl: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(curl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
          curl
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="cursor-pointer text-xs text-white/40 transition-all duration-200 hover:text-white/60"
        >
          {copied ? "コピー済み" : "コピー"}
        </button>
      </div>
      <pre className="mt-1 overflow-x-auto rounded-lg border border-white/10 bg-black/50 p-3 text-xs leading-relaxed text-white/50">
        {curl}
      </pre>
    </div>
  );
}
