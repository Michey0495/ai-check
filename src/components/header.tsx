"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const guideLinks = [
  { href: "/guides/quick-start", label: "5分で始めるGEO対策" },
  { href: "/guides/geo", label: "GEO対策ガイド" },
  { href: "/guides/geo-vs-seo", label: "GEO vs SEO" },
  { href: "/guides/checklist", label: "チェックリスト" },
  { href: "/guides/industry", label: "業界別GEO対策" },
  { href: "/guides/llms-txt", label: "llms.txt書き方" },
  { href: "/guides/glossary", label: "用語集" },
];

const navLinks = [
  { href: "/check", label: "チェック" },
  { href: "/history", label: "履歴" },
  { href: "/tools", label: "ツール" },
  { href: "/developers", label: "API" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [guidesOpen, setGuidesOpen] = useState(false);
  const guidesRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const isGuideActive = guideLinks.some((link) => isActive(link.href));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (guidesRef.current && !guidesRef.current.contains(e.target as Node)) {
        setGuidesOpen(false);
      }
    }
    if (guidesOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [guidesOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    if (mobileOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [mobileOpen]);

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-white transition-all duration-200 hover:text-primary">
          AI Check
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`cursor-pointer transition-all duration-200 hover:text-white ${
                isActive(link.href) ? "text-white font-medium" : "text-white/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div ref={guidesRef} className="relative">
            <button
              type="button"
              className={`flex cursor-pointer items-center gap-1 transition-all duration-200 hover:text-white ${
                isGuideActive ? "text-white font-medium" : "text-white/70"
              }`}
              onClick={() => setGuidesOpen(!guidesOpen)}
              onKeyDown={(e) => { if (e.key === "Escape") setGuidesOpen(false); }}
              aria-expanded={guidesOpen}
              aria-haspopup="true"
            >
              ガイド
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform duration-200 ${guidesOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              >
                <path d="M3 4.5L6 7.5L9 4.5" />
              </svg>
            </button>
            {guidesOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-white/10 bg-black/95 py-1 shadow-xl backdrop-blur-sm">
                {guideLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block cursor-pointer px-4 py-2 text-sm text-white/70 transition-all duration-200 hover:bg-white/5 hover:text-white"
                    onClick={() => setGuidesOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="cursor-pointer p-2 text-white/70 transition-all duration-200 hover:text-white sm:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={mobileOpen}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {mobileOpen ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-white/10 sm:hidden">
          <div className="mx-auto max-w-5xl space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block cursor-pointer rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:bg-white/5 hover:text-white ${
                  isActive(link.href) ? "bg-white/5 text-white font-medium" : "text-white/70"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-white/5 pt-2">
              <p className="px-3 py-1 text-xs font-medium text-white/30">ガイド</p>
              {guideLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block cursor-pointer rounded-lg px-3 py-2 text-sm text-white/70 transition-all duration-200 hover:bg-white/5 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
