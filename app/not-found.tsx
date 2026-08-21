import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Section, SectionHead } from "@/components/section";

const ROUTES = [
  { label: "Documentation", href: "/docs", note: "Install it, run it, and point a client at it." },
  { label: "Benchmarks", href: "/benchmarks", note: "Every run, in full, with the task specification." },
  {
    label: "vs Browser Use Cloud",
    href: "/vs/browser-use-cloud",
    note: "What you gain, and what you give up.",
  },
] as const;

export const metadata: Metadata = {
  title: "Page not found",
  // @nonobvious(forced-by) both keys are declared here to replace the root layout's, not to add to it: Next
  // merges metadata shallowly and swaps nested objects wholesale, so an empty alternates is what stops every
  // 404 on the site declaring itself the canonical homepage. The robots key matters for a different reason:
  // Next injects its own noindex on any 404, and without this the head carried that alongside the root
  // layout's index, follow, leaving a crawler to reconcile two directives that flatly contradict each other.
  alternates: {},
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Section className="border-t-0 pt-14">
          <SectionHead
            level={1}
            title="That page does not exist"
            standfirst="The address may have changed, or it may never have been here. These are the three places worth trying."
          />
          <ul className="grid gap-3 md:grid-cols-3">
            {ROUTES.map((route) => (
              <li key={route.href}>
                <Link
                  href={route.href}
                  className="group block h-full rounded-md border border-line bg-raised p-5 transition-colors hover:border-line-strong"
                >
                  <span className="text-[16px] font-semibold text-ink group-hover:text-accent">
                    {route.label}
                  </span>
                  <span className="mt-2 block text-[14px] leading-relaxed text-dim">
                    {route.note}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
