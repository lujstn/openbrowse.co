"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

type NavLink = { label: string; href: string; external?: boolean };

export function MobileNav({ links }: { links: readonly NavLink[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((value) => !value)}
        className="-mr-1 inline-flex size-9 shrink-0 items-center justify-center rounded-sm text-muted transition-colors hover:bg-panel hover:text-ink sm:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        >
          {open ? (
            <>
              <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" />
              <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" />
            </>
          ) : (
            <>
              <line x1="3.5" y1="7" x2="20.5" y2="7" />
              <line x1="3.5" y1="12" x2="20.5" y2="12" />
              <line x1="3.5" y1="17" x2="20.5" y2="17" />
            </>
          )}
        </svg>
      </button>

      {mounted &&
        createPortal(
          <div className="sm:hidden">
            <div
              aria-hidden="true"
              onClick={() => setOpen(false)}
              className={`fixed inset-x-0 bottom-0 top-14 z-30 bg-page/70 backdrop-blur-sm transition-opacity duration-200 ${
                open ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            />
            <div
              id="mobile-nav-panel"
              className={`fixed inset-x-0 top-14 z-40 origin-top border-b border-line bg-raised transition duration-200 ${
                open
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-2 opacity-0"
              }`}
            >
              <nav aria-label="Mobile" className="flex flex-col px-5 py-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-1.5 border-b border-line-faint py-3.5 text-[15px] text-muted transition-colors last:border-0 hover:text-ink"
                  >
                    {link.label}
                    {link.external ? (
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="size-3.5 text-dim"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    ) : null}
                  </Link>
                ))}
              </nav>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
