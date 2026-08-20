import Link from "next/link";
import { siGithub } from "simple-icons";
import { Mark } from "@/components/wordmark";
import { site } from "@/content/landing";
import { CONTAINER } from "@/components/section";

const LINKS = [
  { label: "Benchmarks", href: "/benchmarks" },
  { label: "Docs", href: "/docs" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-raised/85 px-5 backdrop-blur-md sm:px-8">
      <nav
        aria-label="Primary"
        className={`${CONTAINER} flex h-14 items-center gap-7`}
      >
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-bold tracking-[-0.02em] text-ink"
        >
          <Mark />
          OpenBrowse
        </Link>

        <ul className="flex items-center gap-6">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="whitespace-nowrap text-[13px] text-muted transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <a
          href={site.repo}
          aria-label="OpenBrowse on GitHub"
          className="group ml-auto inline-flex size-8 shrink-0 items-center justify-center rounded-sm text-dim transition-colors hover:bg-panel hover:text-ink"
        >
          <svg
            role="img"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-[18px] transition-transform duration-200 group-hover:scale-110"
            fill="currentColor"
          >
            <path d={siGithub.path} />
          </svg>
        </a>
      </nav>
    </header>
  );
}
