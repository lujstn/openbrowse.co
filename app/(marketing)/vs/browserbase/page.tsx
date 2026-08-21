import type { Metadata } from "next";
import Link from "next/link";
import bb from "@/data/browserbase-pricing.json";
import { Section, SectionHead } from "@/components/section";
import { Panel } from "@/components/ui";
import { FaqList } from "@/components/sections";
import { JsonLd } from "@/components/json-ld";
import { breadcrumb, faqPage, techArticle } from "@/lib/schema";
import { articleOpenGraph } from "@/lib/metadata";
import { browserbase, browserbaseCaptured, headings, site } from "@/content/landing";
import { baseline, champion, task } from "@/lib/benchmark";

const TITLE = browserbase.h1;
const SEO_TITLE = `${headings.vsBrowserbase}: the open-source, self-hosted alternative`;
const DESCRIPTION =
  "Browserbase rents a browser you drive. OpenBrowse is the agent, self-hosted and MIT licensed, with no session meter and no CDP connect endpoint.";

const FAQ = [
  {
    q: "Can I point my existing Playwright or Puppeteer code at OpenBrowse?",
    a: "No. Browserbase gives every session a CDP websocket and your code drives the browser through it. OpenBrowse has no connect endpoint at all: you post a task in plain words and its own agent drives. Automation you have already written is a rewrite rather than a port, and if a remote browser for your own script is what you need, Steel is the closer open-source answer, being Apache 2.0 and self-hostable. OpenBrowse substitutes for the agent you were going to build on top of a rented browser, not for the browser.",
  },
  {
    q: "What does Browserbase do better?",
    a: `Six things, and they are the ones to check against your own workload before anything else. Managed residential proxies with country, state and city targeting, which has no equivalent here at all. Recorded, replayable sessions and an inspector. Verified fingerprints, automatic CAPTCHA solving and a Cloudflare signed-agent integration. Concurrency of ${bb.plans[2].concurrentSessions} browsers on a $${bb.plans[2].monthlyUsd} plan, against a hard ceiling of eight here. A public status page and SOC 2 Type II. And the machine being somebody else's to keep running.`,
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
    q: "Have you benchmarked OpenBrowse against Browserbase?",
    a: `No, and this page leaves the column empty rather than filling it with adjectives. The published benchmark is one real extraction task, ${task.recordsExpected} records behind an embedded cross-origin job board, run against Browser Use Cloud and against OpenBrowse across several models and reasoning levels. Browserbase has not been put through it. Everything compared here is architecture and published pricing, both of which you can check today.`,
    link: { label: "See what has been measured", href: "/benchmarks" },
  },
  {
    q: "What does OpenBrowse cost to run instead?",
    a: `LLM tokens, and nothing else. There is no plan, no browser-hour meter, no per-gigabyte egress charge and no agent-run allowance, so the only variable line on the bill is tokens you were buying from the provider anyway, at the provider's own price on your own key. The hardware is a one-off: it was built and benchmarked on a Raspberry Pi 5. For scale, the reference extraction task cost $${champion.costUsd.toFixed(2)} in tokens on the fastest complete OpenBrowse run.`,
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

        <Panel label={browserbase.noCdp.label}>
          <p className="text-[15px] font-medium leading-relaxed text-ink">
            {browserbase.noCdp.title}
          </p>
          <p className="mt-3 max-w-[76ch] text-[15px] leading-relaxed text-muted">
            {browserbase.noCdp.body}
          </p>
        </Panel>

        <p className="mt-6 max-w-[76ch] text-[15px] leading-relaxed text-muted">
          {"Weighing this against a hosted agent runner rather than a hosted browser? "}
          <Link href="/vs/browser-use-cloud" className="text-accent hover:underline">
            The Browser Use Cloud comparison
          </Link>
          {" is the measured one, and "}
          <Link href="/benchmarks" className="text-accent hover:underline">
            the benchmarks
          </Link>
          {" are the evidence under it."}
        </p>
      </Section>

      <Section id="dimensions">
        <SectionHead
          title={headings.dimensions}
          standfirst="Twelve dimensions, split evenly. The six Browserbase wins come first, because they are the ones that decide whether the rest of this page is relevant to you at all."
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
                      className={`border-b border-line-faint px-4 py-3.5 align-top text-[13px] leading-relaxed ${
                        row.advantage === "browserbase" ? "text-dim" : "text-body"
                      }`}
                    >
                      {row.openbrowse}
                      {"note" in row && row.note ? (
                        <span className="mt-2 block text-[12px] leading-relaxed text-dim">
                          {row.note}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <p className="mt-6 max-w-[76ch] text-[15px] leading-relaxed text-muted">
          {`${browserbase.columnNote} ${conceded} of the ${browserbase.rows.length} go to Browserbase, and a table conceding fewer than that would be telling you something other than the truth.`}
        </p>
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
          {`${browserbase.notMeasured}. ${browserbase.measuredNote} The OpenBrowse column is ${champion.model} at reasoning ${champion.reasoning}; both runs recovered all ${task.recordsExpected} records, and only one of them invented fields the page never displayed. The full method, every run and the task specification are on `}
          <Link href="/benchmarks" className="text-accent hover:underline">
            the benchmarks page
          </Link>
          {"."}
        </p>
      </Section>

      <Section id="faqs">
        <SectionHead title={headings.faqs} />
        <FaqList items={FAQ} />
      </Section>
    </>
  );
}
