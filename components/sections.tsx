import Link from "next/link";
import { benchmark, differentiators, dropIn, faq, headings } from "@/content/landing";
import { Section, SectionHead } from "@/components/section";
import { HeadlineStats } from "@/components/headline-stats";
import { Panel } from "@/components/ui";

// @nonobvious(must-hold) the heading is visually hidden rather than deleted: these four read as a bare capability strip by design, but a section of prose with no heading in the outline is unreadable to a screen reader and to a retriever building a page map
export function CapabilitiesSection() {
  return (
    <Section id="how-it-differs" className="py-12 sm:py-16">
      <h2 className="sr-only">{differentiators.h2}</h2>
      <dl className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {differentiators.items.map((item) => (
          <div
            key={item.id}
            className="border-t border-line pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6 lg:first:border-l-0 lg:first:pl-0"
          >
            <dt className="text-[16px] font-semibold text-ink text-balance">
              {item.title}
            </dt>
            <dd className="mt-2.5 text-[14px] leading-relaxed text-muted">
              {item.body}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

export function BenchmarkSection() {
  return (
    <Section id="benchmark">
      <SectionHead title={benchmark.h2} standfirst={benchmark.standfirst} />

      <HeadlineStats tone="quiet" />
    </Section>
  );
}

export function DropInSection() {
  return (
    <Section id="drop-in">
      <SectionHead title={dropIn.h2} standfirst={dropIn.standfirst} />
      <Panel label="client.ts" padded={false}>
        <pre className="overflow-x-auto py-3 text-[13px] leading-[1.75]">
          <code className="font-mono">
            {dropIn.diff.map((line, i) => {
              const tone =
                line.type === "add"
                  ? "bg-ok/[0.08] text-ok"
                  : line.type === "remove"
                    ? "bg-bad/[0.08] text-bad"
                    : "text-muted";
              const sigil =
                line.type === "add" ? "+" : line.type === "remove" ? "-" : " ";
              return (
                <span key={i} className={`block px-4 ${tone}`}>
                  <span className="mr-3 inline-block w-2 select-none opacity-70">
                    {sigil}
                  </span>
                  {line.text || " "}
                </span>
              );
            })}
          </code>
        </pre>
      </Panel>
    </Section>
  );
}

type FaqEntry = {
  q: string;
  a: string;
  link?: { label: string; href: string };
};

function FaqItem({ item }: { item: FaqEntry }) {
  return (
    <details className="group border-b border-line-faint [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-[15px] font-medium text-ink transition-colors hover:text-accent">
        {item.q}
        <span
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-[18px] leading-none text-label transition-transform duration-200 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <p className="text-[15px] leading-relaxed text-muted">{item.a}</p>
      {item.link ? (
        <Link
          href={item.link.href}
          className="group/link mt-4 inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3.5 py-1.5 text-[13px] font-medium text-body transition-colors hover:border-dim hover:text-ink active:translate-y-px"
        >
          {item.link.label}
          {/* @nonobvious(means) the arrow carries the motion rather than the button moving, so a row of these does not reflow the answer above when one is hovered */}
          <span
            aria-hidden="true"
            className="transition-transform duration-200 group-hover/link:translate-x-0.5"
          >
            &rarr;
          </span>
        </Link>
      ) : null}
      <div className="pb-6" />
    </details>
  );
}

// @nonobvious(must-hold) the list is split into two halves rendered as separate columns rather
// than flowed with CSS columns: an accordion opening inside a flowed column re-balances every
// item after it, so the entry a reader just clicked jumps out from under the cursor
export function FaqList({
  items,
}: {
  items: readonly FaqEntry[];
}) {
  const half = Math.ceil(items.length / 2);
  const columns = [items.slice(0, half), items.slice(half)];
  return (
    <div className="grid gap-x-12 md:grid-cols-2">
      {columns.map((column, index) => (
        <div key={index} className="border-t border-line">
          {column.map((item) => (
            <FaqItem key={item.q} item={item} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function FaqSection() {
  return (
    <Section id="faqs">
      <SectionHead title={headings.faqs} />
      <FaqList items={faq} />
    </Section>
  );
}
