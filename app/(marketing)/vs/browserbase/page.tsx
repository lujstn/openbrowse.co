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
    a: `LLM tokens. No plan, no browser-hours, no egress charge, no run allowance. On our extraction benchmark task it cost $${champion.costUsd.toFixed(2)}.`,
  },
  {
    q: "Is OpenBrowse open source in a way Browserbase is not?",
    a: "Browserbase open-sources Stagehand and its SDKs, but the infrastructure behind them is proprietary and there is no server to run. OpenBrowse is MIT end to end.",
  },
  {
    q: "Where does the data go?",
    a: "Your machine. The browser, the pages and the extracted data stay there; only the model call leaves, on your key. Browserbase is managed cloud only.",
  },
  {
    q: "How has OpenBrowse been benchmarked?",
    a: `On our extraction benchmark task, ${task.recordsExpected} records behind an embedded cross-origin job board, across several models. Every run recovered all ${task.recordsExpected} without inventing a field. Browserbase has not been put through it.`,
    link: { label: "See the benchmark", href: "/benchmarks" },
  },
  {
    q: "Can I point my existing Playwright code at OpenBrowse?",
    a: "No. There is no connect endpoint, because driving the browser is the part OpenBrowse does for you. Existing automation is a rewrite, not a port.",
  },
  {
    q: "What does Browserbase do better?",
    a: `Residential proxies with country targeting, recorded sessions, verified fingerprints and CAPTCHA solving, ${bb.plans[2].concurrentSessions} concurrent browsers against eight here, and SOC 2 Type II. If your workload turns on any of those, buy theirs.`,
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

        <div className="mb-8 grid gap-4 md:grid-cols-2">
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
          standfirst="Twelve dimensions, from their published documentation and ours."
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
        <p className="mt-3 text-[13px] leading-relaxed text-dim">
          {"Source: "}
          <a href={bb.sourceUrl} className="hover:text-accent" rel="nofollow">
            {new URL(bb.sourceUrl).host + new URL(bb.sourceUrl).pathname}
          </a>
        </p>

      </Section>

      <Section id="measured">
        <SectionHead title={headings.measured} standfirst={browserbase.measuredLead} />

        <Panel label="Our extraction benchmark, same schema, same cost cap" padded={false}>
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
                    Browserbase{" "}
                    <span className="font-normal normal-case tracking-normal text-dim">
                      ({browserbase.notMeasured.toLowerCase()})
                    </span>
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
          {`Compared to Browser Use Cloud, that is ${percentLess(baseline.costUsd, champion.costUsd)} spend, ${formatRatio(delta.tokens)} fewer tokens and ${percentFaster(baseline.seconds, champion.seconds)}, on the same task, the same schema and the same cost cap.`}
        </p>

      </Section>

      <Section id="faqs">
        <SectionHead title={headings.faqs} />
        <FaqList items={FAQ} />
      </Section>
    </>
  );
}
