"use client";

import { useState, useEffect } from "react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-20 right-4 z-40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/80 text-white/60 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:text-white print:hidden"
      aria-label="ページトップへ戻る"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M8 12V4M4 7l4-4 4 4" />
      </svg>
    </button>
  );
}
