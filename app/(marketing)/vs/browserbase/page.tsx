import type { Metadata } from "next";
import Link from "next/link";
import bb from "@/data/browserbase-pricing.json";
import { Section, SectionHead } from "@/components/section";
import { Label, Panel } from "@/components/ui";
import { FaqList } from "@/components/sections";
import { JsonLd } from "@/components/json-ld";
import { breadcrumb, faqPage, techArticle } from "@/lib/schema";
import { articleOpenGraph } from "@/lib/metadata";
import { browserbase, browserbaseCaptured, headings, site } from "@/content/landing";
import {
  baseline,
  champion,
  delta,
  formatRatio,
  percentFaster,
  percentLess,
  task,
} from "@/lib/benchmark";

const TITLE = browserbase.h1;
const SEO_TITLE = `${headings.vsBrowserbase}: the open-source alternative`;
const DESCRIPTION =
  "Browserbase rents a browser you drive. OpenBrowse is the agent: MIT, self-hosted on hardware you own, nothing metered, and no page leaving your network.";

const FAQ = [
  {
    q: "What does OpenBrowse cost to run?",
    a: `LLM tokens, and nothing else. There is no plan, no browser-hour meter, no per-gigabyte egress charge and no agent-run allowance, so the only variable line on the bill is tokens you were buying from the provider anyway, at the provider's own price on your own key. The hardware is a one-off: it was built and benchmarked on a Raspberry Pi 5. For scale, the reference extraction task cost $${champion.costUsd.toFixed(2)} in tokens on the fastest complete OpenBrowse run.`,
  },
  {
    q: "Is OpenBrowse open source in a way Browserbase is not?",
    a: "Yes, and that distinction is the whole reason this comparison is worth drawing. Browserbase open-sources Stagehand and its client SDKs, but the browser infrastructure those clients talk to is proprietary and there is no server to run yourself. OpenBrowse is MIT end to end, server and agent and dashboard, with a DOI so it can be cited. That is the difference between renting the infrastructure and owning it.",
  },
  {
    q: "Where does the data actually go?",
    a: "Nowhere you did not send it. The browser runs on your machine, the pages it loads are fetched over your own connection, and the extracted data is written to SQLite on your own disk. The only thing that leaves is the model calls, on an API key you hold. Browserbase is managed cloud only: every page its browser loads crosses their infrastructure, and there is no on-premises or bring-your-own-cloud deployment to opt into.",
  },
  {
    q: "How has OpenBrowse been benchmarked?",
    a: `On one real extraction task: ${task.recordsExpected} records behind an embedded cross-origin job board, run across several models and reasoning levels, with Browser Use Cloud as the hosted comparison. Every OpenBrowse run recovered all ${task.recordsExpected} without inventing a field, and the fastest complete run cost $${champion.costUsd.toFixed(2)} in tokens. Browserbase has not been put through the same task, so its column on this page stays empty rather than being filled with adjectives. Everything else compared here is architecture and published pricing, both of which you can check today.`,
    link: { label: "See what has been measured", href: "/benchmarks" },
  },
  {
    q: "Can I point my existing Playwright or Puppeteer code at OpenBrowse?",
    a: "Not directly, and that is the design rather than a gap. Browserbase gives every session a CDP websocket so your code can drive the browser; OpenBrowse has no connect endpoint because the driving is the part it does for you. Automation you have already written is a rewrite rather than a port. If running that existing code is the job, a remote-browser product is what you want and Browserbase is one of them. OpenBrowse substitutes for the agent you were going to build on top of a rented browser, not for the browser.",
  },
  {
    q: "What does Browserbase do better?",
    a: `Six things, and they are worth checking against your own workload. Managed residential proxies with country, state and city targeting, which has no equivalent here at all. Recorded, replayable sessions and an inspector. Verified fingerprints, automatic CAPTCHA solving and a Cloudflare signed-agent integration. Concurrency of ${bb.plans[2].concurrentSessions} browsers on a $${bb.plans[2].monthlyUsd} plan, against eight here. A public status page and SOC 2 Type II. And the machine being somebody else's to keep running. If your workload turns on any of those, buy theirs. If it turns on what the agent does once the browser is open, that is the other column.`,
  },
];

export const metadata: Metadata = {
  title: SEO_TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/vs/browserbase" },
  openGraph: {
    ...articleOpenGraph,
    title: SEO_TITLE,
    description: DESCRIPTION,
    url: `${site.url}/vs/browserbase`,
  },
};

const TH =
  "px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.05em] text-label border-b border-line align-bottom";
const TD = "px-4 py-3 align-top text-[14px] leading-relaxed";

const MEASURED = [
  {
    metric: "LLM cost",
    openbrowse: `$${champion.costUsd.toFixed(2)}`,
    cloud: `$${baseline.costUsd.toFixed(2)}`,
  },
  { metric: "Tokens", openbrowse: champion.tokensDisplay, cloud: baseline.tokensDisplay },
  { metric: "Time to finish", openbrowse: champion.timeDisplay, cloud: baseline.timeDisplay },
  {
    metric: `Records recovered of ${task.recordsExpected}`,
    openbrowse: String(champion.records),
    cloud: String(baseline.records),
  },
];

export default function Page() {
  const conceded = browserbase.rows.filter((r) => r.advantage === "browserbase").length;

  return (
    <>
      <JsonLd
        data={techArticle({
          title: SEO_TITLE,
          description: DESCRIPTION,
          url: "/vs/browserbase",
          mentions: [{ name: bb.vendor, url: new URL(bb.sourceUrl).origin }],
        })}
      />
      <JsonLd data={faqPage(FAQ)} />
      <JsonLd
        data={breadcrumb([
          { name: "Home", url: "/" },
          { name: TITLE, url: "/vs/browserbase" },
        ])}
      />

      <Section className="border-t-0 pt-14">
        <SectionHead level={1} title={TITLE} standfirst={browserbase.standfirst} />

        <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-3">
          {browserbase.proof.map((stat) => (
            <div key={stat.label} className="rounded-md border border-line bg-raised px-4 py-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <Label>{stat.label}</Label>
                <span className="font-mono text-[22px] leading-none tabular-nums text-ink">
                  {stat.value}
                </span>
              </div>
              <p className="mt-2.5 font-mono text-[11px] text-dim">{stat.detail}</p>
            </div>
          ))}
        </div>

        <p className="max-w-[76ch] text-[15px] leading-relaxed text-muted">{browserbase.scope}</p>

        <p className="mt-5 max-w-[76ch] text-[15px] leading-relaxed text-muted">
          {"Weighing this against a hosted agent runner rather than a hosted browser? "}
          <Link href="/vs/browser-use-cloud" className="text-accent hover:underline">
            The Browser Use Cloud comparison
          </Link>
          {" covers that one, and "}
          <Link href="/benchmarks" className="text-accent hover:underline">
            the benchmarks
          </Link>
          {" are the evidence under it."}
        </p>
      </Section>

      <Section id="dimensions">
        <SectionHead
          title={headings.dimensions}
          standfirst="Twelve dimensions, taken from their published documentation and ours. Six go each way, and the six that go to Browserbase are named as plainly as the six that do not."
        />
        <Panel label={`${browserbase.rows.length} dimensions`} padded={false}>
          <div className="md:overflow-x-auto">
            <table className="stack-table w-full border-collapse text-left md:min-w-[780px]">
              <thead>
                <tr>
                  <th scope="col" className={`${TH} w-[16%]`}>
                    <span className="sr-only">Dimension</span>
                  </th>
                  <th scope="col" className={`${TH} w-[38%]`}>
                    Browserbase
                  </th>
                  <th scope="col" className={`${TH} w-[46%] text-ink`}>
                    OpenBrowse
                  </th>
                </tr>
              </thead>
              <tbody>
                {browserbase.rows.map((row) => (
                  <tr key={row.dimension} className="transition-colors hover:bg-panel/60">
                    <th
                      scope="row"
                      className="border-b border-line-faint px-4 py-3.5 align-top text-[13px] font-medium text-ink"
                    >
                      {row.dimension}
                    </th>
                    <td
                      data-label="Browserbase"
                      className={`border-b border-line-faint px-4 py-3.5 align-top text-[13px] leading-relaxed ${
                        row.advantage === "browserbase" ? "text-body" : "text-dim"
                      }`}
                    >
                      {row.browserbase}
                    </td>
                    <td
                      data-label="OpenBrowse"
                      className="border-b border-line-faint px-4 py-3.5 align-top text-[13px] leading-relaxed text-body"
                    >
                      {row.openbrowse}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <p className="mt-6 max-w-[76ch] text-[15px] leading-relaxed text-muted">
          {`${browserbase.columnNote} ${conceded} of the ${browserbase.rows.length} go to Browserbase, and they are in the table for the same reason the rest of it is: this is what the two products actually are. ${browserbase.sourcesLead} `}
          {[bb.sourceUrl, bb.docsUrl, bb.enterpriseUrl].map((href, i) => (
            <span key={href}>
              {i > 0 ? ", " : ""}
              <a href={href} className="text-accent hover:underline" rel="nofollow">
                {new URL(href).host + new URL(href).pathname}
              </a>
            </span>
          ))}
          {"."}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {browserbase.verdict.map((column) => (
            <Panel key={column.title} label={column.title}>
              <ul className="space-y-2.5">
                {column.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-2.5 text-[14px] leading-relaxed text-muted"
                  >
                    <span aria-hidden="true" className="text-label">
                      &mdash;
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>
      </Section>

      <Section id="pricing">
        <SectionHead title={headings.browserbaseCharges} standfirst={browserbase.pricingLead} />

        <Panel label={`${bb.vendor}, read on ${browserbaseCaptured}`} padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th scope="col" className={`${TH} w-[22%]`}>
                    Item
                  </th>
                  <th scope="col" className={`${TH} w-[32%]`}>
                    Rate
                  </th>
                  <th scope="col" className={TH}>
                    What that means
                  </th>
                </tr>
              </thead>
              <tbody>
                {bb.usage.map((row) => (
                  <tr key={row.item} className="border-b border-line-faint last:border-0">
                    <th scope="row" className={`${TD} font-medium text-ink`}>
                      {row.item}
                    </th>
                    <td className={`${TD} font-mono text-[13px] text-body`}>{row.rate}</td>
                    <td className={`${TD} text-muted`}>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <p className="mt-6 max-w-[76ch] text-[15px] leading-relaxed text-muted">
          {`Plans buy concurrency and an allowance: ${bb.plans
            .map((plan) =>
              plan.monthlyUsd === null
                ? `${plan.name} at custom pricing for ${plan.concurrentSessions} or more`
                : `${plan.name} at $${plan.monthlyUsd} a month for ${plan.concurrentSessions} concurrent browsers`,
            )
            .join(", ")}. ${bb.annualNote} ${bb.billingNote}`}
        </p>

        <p className="mt-5 max-w-[76ch] text-[15px] leading-relaxed text-muted">
          {`Self-hosting removes every one of those meters. What is left is the same LLM tokens at the provider's own price, on a key you hold, plus a machine and the electricity it draws. Nothing here charges for ${bb.meteredDimensions.slice(0, -1).join(", ")} or ${bb.meteredDimensions.at(-1)}, because there is no platform in between to charge for them.`}
        </p>

        <p className="mt-5 max-w-[76ch] text-[14px] leading-relaxed text-dim">
          {`${bb.unverifiedNote} And these are their prices as we read them on ${browserbaseCaptured}; check `}
          <a href={bb.sourceUrl} className="text-accent hover:underline" rel="nofollow">
            their pricing page
          </a>
          {" before making a decision on them."}
        </p>
      </Section>

      <Section id="measured">
        <SectionHead title={headings.measured} standfirst={browserbase.measuredLead} />

        <Panel label="One extraction task, same schema, same cost cap" padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th scope="col" className={`${TH} w-[28%]`}>
                    <span className="sr-only">Measure</span>
                  </th>
                  <th scope="col" className={`${TH} text-ink`}>
                    OpenBrowse
                  </th>
                  <th scope="col" className={TH}>
                    Browser Use Cloud
                  </th>
                  <th scope="col" className={TH}>
                    Browserbase
                  </th>
                </tr>
              </thead>
              <tbody>
                {MEASURED.map((row) => (
                  <tr key={row.metric} className="border-b border-line-faint last:border-0">
                    <th scope="row" className={`${TD} font-medium text-ink`}>
                      {row.metric}
                    </th>
                    <td className={`${TD} font-mono text-[13px] text-body`}>{row.openbrowse}</td>
                    <td className={`${TD} font-mono text-[13px] text-muted`}>{row.cloud}</td>
                    <td className={`${TD} font-mono text-[13px] text-dim`}>
                      <span aria-hidden="true">&mdash;</span>
                      <span className="sr-only">{browserbase.notMeasured}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <p className="mt-6 max-w-[76ch] text-[15px] leading-relaxed text-muted">
          {`That is ${percentLess(baseline.costUsd, champion.costUsd)} spend, ${formatRatio(delta.tokens)} fewer tokens and ${percentFaster(baseline.seconds, champion.seconds)}, on the same task, the same schema and the same cost cap.`}
        </p>

        <p className="mt-5 max-w-[76ch] text-[15px] leading-relaxed text-muted">
          {`${browserbase.notMeasured}. ${browserbase.measuredNote} The OpenBrowse column is ${champion.model} at reasoning ${champion.reasoning}. Both runs recovered all ${task.recordsExpected} records, but the Browser Use Cloud run also populated values the page never displayed, job seniority among them, while no OpenBrowse run invented a field. `}
          <Link href="/benchmarks" className="text-accent hover:underline">
            Every run, the method and the task specification
          </Link>
          {" are published in full."}
        </p>
      </Section>

      <Section id="faqs">
        <SectionHead title={headings.faqs} />
        <FaqList items={FAQ} />
      </Section>
    </>
  );
}
