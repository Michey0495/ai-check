"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/check", label: "チェック" },
  { href: "/generate/llms-txt", label: "生成ツール" },
  { href: "/guides/geo", label: "GEO対策ガイド" },
  { href: "/about", label: "About" },
];

export function Header() {
  const [open, setOpen] = useState(false);

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
              className="cursor-pointer text-white/70 transition-all duration-200 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="cursor-pointer p-2 text-white/70 transition-all duration-200 hover:text-white sm:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={open}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
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
      {open && (
        <nav className="border-t border-white/10 sm:hidden">
          <div className="mx-auto max-w-5xl space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block cursor-pointer rounded-lg px-3 py-2 text-sm text-white/70 transition-all duration-200 hover:bg-white/5 hover:text-white"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
