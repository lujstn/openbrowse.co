import Link from "next/link";
import { benchmark, differentiators, dropIn, faq, headings } from "@/content/landing";
import { Section, SectionHead } from "@/components/section";
import { CompareStat } from "@/components/compare-stat";
import { BenchmarkTable } from "@/components/benchmark-table";
import { Panel } from "@/components/ui";
import {
  baseline,
  champion,
  headlineRuns,
  percentFaster,
  percentLess,
} from "@/lib/benchmark";

// @nonobvious(must-hold) the heading is visually hidden rather than deleted: these four read as a bare capability strip by design, but a section of prose with no heading in the outline is unreadable to a screen reader and to a retriever building a page map
export function CapabilitiesSection() {
  return (
    <Section id="how-it-differs" wide className="py-12 sm:py-16">
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
    <Section id="benchmark" wide>
      <SectionHead title={benchmark.h2} standfirst={benchmark.standfirst} />

      <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-3">
        <CompareStat
          label="What it cost"
          ours={champion.costUsd}
          theirs={baseline.costUsd}
          ourValue={`$${champion.costUsd.toFixed(2)}`}
          theirValue={`$${baseline.costUsd.toFixed(2)}`}
          saving={percentLess(baseline.costUsd, champion.costUsd)}
        />
        <CompareStat
          label="Tokens burned"
          ours={champion.tokens}
          theirs={baseline.tokens}
          ourValue={champion.tokensDisplay}
          theirValue={baseline.tokensDisplay}
          saving={percentLess(baseline.tokens, champion.tokens)}
        />
        <CompareStat
          label="Time to finish"
          ours={champion.seconds}
          theirs={baseline.seconds}
          ourValue={champion.timeDisplay}
          theirValue={baseline.timeDisplay}
          saving={percentFaster(baseline.seconds, champion.seconds)}
        />
      </div>

      {/* @nonobvious(must-hold) the two sides of those cards ran different models, and the cards are the part that gets screenshotted and quoted away from the table that would have shown it. Naming both configurations here is what stops the headline reading as a rigged comparison. */}
      <p className="mb-8 font-mono text-[12px] leading-relaxed text-dim">
        {`OpenBrowse on ${champion.model} at reasoning ${champion.reasoning}, against Browser Use Cloud on ${baseline.model} at ${baseline.reasoning}.`}
      </p>

      {/* @nonobvious(means) the table is deliberately quieter than the cards above it: it is corroboration for the headline figures, not the thing the reader is meant to land on first */}
      <Panel label="The runs behind those numbers" padded={false} tone="quiet">
        <BenchmarkTable rows={headlineRuns} highlight={champion.id} />
      </Panel>
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
      <p className="mt-6 max-w-[70ch] text-[15px] leading-relaxed text-muted">
        {dropIn.after}
      </p>
      <Link
        href={dropIn.moreHref}
        className="mt-4 inline-block text-[15px] text-accent hover:text-accent-hi hover:underline"
      >
        {dropIn.moreLabel}
      </Link>

      <div className="mt-12 border-t border-line pt-10">
        <h3 className="text-[16px] font-semibold text-ink">
          {dropIn.exampleLead}
        </h3>
        <p className="mt-3 mb-6 max-w-[70ch] text-[15px] leading-relaxed text-muted">
          {dropIn.exampleBody}
        </p>
        <Panel label="A task" padded={false}>
          <pre className="overflow-x-auto px-4 py-3.5 text-[13px] leading-[1.75]">
            <code className="font-mono text-body">
              {dropIn.example.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </code>
          </pre>
        </Panel>
      </div>
    </Section>
  );
}

export function FaqList({
  items,
}: {
  items: readonly { q: string; a: string }[];
}) {
  return (
    <div className="max-w-[80ch] border-t border-line">
      {items.map((item) => (
        <details
          key={item.q}
          className="group border-b border-line-faint [&_summary::-webkit-details-marker]:hidden"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[15px] font-medium text-ink transition-colors hover:text-accent">
            {item.q}
            <span
              aria-hidden="true"
              className="shrink-0 text-[18px] leading-none text-label transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="pb-6 text-[15px] leading-relaxed text-muted">
            {item.a}
          </p>
        </details>
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
