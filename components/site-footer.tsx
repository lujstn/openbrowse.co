import Link from "next/link";
import { machineReadable, site } from "@/content/landing";
import { Mark } from "@/components/wordmark";
import { CopyLink } from "@/components/copy-link";
import { CONTAINER } from "@/components/section";

const COLUMNS = [
  {
    heading: "Documentation",
    links: [
      { label: "Getting started", href: "/docs" },
      { label: "Installation", href: "/docs/installation" },
      { label: "v3 API reference", href: "/docs/api" },
      { label: "Developer resources", href: "/developers" },
    ],
  },
  {
    heading: "Evidence",
    links: [
      { label: "Benchmarks", href: "/benchmarks" },
      { label: "Compare pricing", href: "/vs/browser-use-cloud/pricing" },
      { label: "vs Browser Use Cloud", href: "/vs/browser-use-cloud" },
      { label: "vs Browserbase", href: "/vs/browserbase" },
    ],
  },
  {
    heading: "Project",
    links: [
      { label: "Source", href: site.repo },
      { label: "Issues", href: `${site.repo}/issues` },
      { label: "PyPI", href: site.pypi },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

function LlmsCard() {
  return (
    <div className="rounded-md border border-line bg-raised p-4 sm:col-span-2 lg:col-span-1">
      <h2 className="text-[11px] font-medium uppercase tracking-[0.05em] text-label">
        {machineReadable.heading}
      </h2>
      <ul className="mt-3 divide-y divide-line-faint border-y border-line-faint">
        {machineReadable.files.map((file) => (
          <li
            key={file.href}
            className="group/row flex items-center justify-between gap-4 py-2"
          >
            <a
              href={file.href}
              className="font-mono text-[12px] text-muted transition-colors hover:text-accent"
            >
              {file.label}
            </a>
            <CopyLink href={file.href} label={file.label} compact />
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[12px] leading-5 text-dim">
        {machineReadable.note}
      </p>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line px-5 py-14 sm:px-8">
      <div className={CONTAINER}>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.9fr))_minmax(0,1.5fr)]">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[14px] font-bold tracking-[-0.02em] text-ink">
              <Mark />
              OpenBrowse
            </span>
            <p className="mt-4 max-w-[34ch] text-[13px] leading-6 text-dim">
              {site.tagline}. Free and open source under the MIT licence.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-[11px] font-medium uppercase tracking-[0.05em] text-label">
                {col.heading}
              </h2>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] leading-6 text-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <LlmsCard />
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="text-[13px] leading-6 text-dim">
            &copy; 2026 {site.author}. Citable as{" "}
            <a
              href={site.doiUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="cursor-alias footer-link"
            >
              {site.doi}
            </a>
            .
          </p>
          <p className="text-[13px] leading-6 text-dim">
            Built by{" "}
            <a
              href="https://lujstn.com"
              target="_blank"
              rel="noreferrer noopener"
              className="cursor-alias footer-link"
            >
              @lujstn
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
