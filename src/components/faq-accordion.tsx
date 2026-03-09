"use client";

import { useState, useCallback } from "react";

type FaqItem = {
  q: string;
  a: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {items.map((faq, i) => (
        <div
          key={faq.q}
          className="rounded-lg border border-white/10 bg-white/5"
        >
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-between px-6 py-5 text-left transition-all duration-200 hover:bg-white/[0.03]"
            onClick={() => toggle(i)}
            aria-expanded={openIndex === i}
            aria-controls={`faq-panel-${i}`}
          >
            <span className="pr-4 font-semibold text-white">{faq.q}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`shrink-0 text-white/40 transition-transform duration-200 ${
                openIndex === i ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            >
              <path d="M4 6L8 10L12 6" />
            </svg>
          </button>
          <div
            id={`faq-panel-${i}`}
            role="region"
            className={`grid transition-all duration-200 ${
              openIndex === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <p className="px-6 pb-5 text-sm leading-relaxed text-white/50">
                {faq.a}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
