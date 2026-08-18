import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHead } from "@/components/section";
import { Panel } from "@/components/ui";
import { CompareStat } from "@/components/compare-stat";
import { BenchmarkTable } from "@/components/benchmark-table";
import { FaqList } from "@/components/sections";
import { JsonLd } from "@/components/json-ld";
import { breadcrumb, faqPage, techArticle } from "@/lib/schema";
import { comparison, dropIn, headings, site } from "@/content/landing";
import {
  baseline,
  champion,
  delta,
  formatRatio,
  headlineRuns,
  likeForLike,
  runs,
  percentFaster,
  percentLess,
} from "@/lib/benchmark";

const TITLE = headings.vs;
const DESCRIPTION = `A dimension-by-dimension comparison of the self-hosted open-source runtime against the managed service, including measured cost, token and latency differences on an identical extraction task.`;

// @nonobvious(must-hold) the matched pair is interpolated and the whole clause disappears if no same-model row exists, rather than degrading to a hand-written figure: this answer is emitted as FAQPage JSON-LD, so a stale number here is a false claim in Google's structured data
const matchedPair = likeForLike
  ? ` That row changes model as well as runtime, so the conservative comparison is the matched pair: ${likeForLike.cloud.model} at reasoning ${likeForLike.cloud.reasoning} costs $${likeForLike.openbrowse.costUsd.toFixed(2)} here against $${likeForLike.cloud.costUsd.toFixed(2)} on the cloud, on ${formatRatio(likeForLike.tokenRatio)} fewer tokens, though it takes ${likeForLike.secondsSlower} seconds longer.`
  : "";

const FAQ = [
  {
    q: "Is OpenBrowse a drop-in replacement for Browser Use Cloud?",
    a: "For the v3 REST surface, yes. It implements the same sessions, profiles, structured output and cost-cap endpoints, so an existing browser-use-sdk client moves across by changing baseUrl and apiKey. What you take on is running the machine, and the one behavioural difference worth settling first is network egress, covered below.",
  },
  {
    q: "How much cheaper is OpenBrowse in practice?",
    a: `On the reference extraction task OpenBrowse completed the same work for $${champion.costUsd.toFixed(2)} in LLM tokens against $${baseline.costUsd.toFixed(2)} for Browser Use Cloud, using ${formatRatio(delta.tokens)} fewer tokens and finishing ${percentFaster(baseline.seconds, champion.seconds)}.${matchedPair} OpenBrowse charges no per-task platform fee, so the total gap is larger than the token comparison alone.`,
  },
  {
    q: "Where does the token gap actually come from?",
    a: "read_pages opens a listing in parallel waves of up to six real tabs and reads inside embedded cross-origin panels, which is most of the token gap. Structured output is a live answer store rather than a final validation pass, with per-field coverage and a completeness gate the agent has to pass before it can finish. Values with no evidence on the page are refused at that boundary, which is why the cloud run invented job seniority on the reference task and this one did not.",
  },
  {
    q: "Can I migrate my existing profiles?",
    a: "Yes. OpenBrowse imports the Playwright storage-state format a cloud profile export gives you, cookies plus per-origin localStorage. Import one and the local profile id matches the cloud id, so existing profileId references keep working unchanged.",
  },
  {
    q: "What does Browser Use Cloud do better?",
    a: "It runs a managed US residential proxy by default, so the sites your agent visits see a residential IP rather than your server's, and there is no proxy layer here at all. It records sessions and captures screenshots, and it has skills, workspaces and hosted integrations, none of which have an equivalent. It is also somebody else's machine, with somebody else's uptime. If your current jobs lean on that proxy, test that before you migrate anything else.",
  },
  {
    q: "Which v3 request fields does OpenBrowse accept but ignore?",
    a: "Three: proxyCountryCode, enableRecording and skills. All are part of the v3 request body, so a client that sets them still compiles and runs, and the matching response fields (recordingUrls, screenshotUrl, workspaceId, proxyCountryCode) come back empty or null. Better to find that out on this page than in production.",
  },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/vs/browser-use-cloud" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${site.url}/vs/browser-use-cloud`,
    type: "article",
  },
};

export default function Page() {
  const cloudWins = comparison.rows.filter((r) => r.advantage === "cloud").length;
  const TH =
    "px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.05em] text-label border-b border-line align-bottom";

  return (
    <>
      <JsonLd
        data={techArticle({
          title: TITLE,
          description: DESCRIPTION,
          url: "/vs/browser-use-cloud",
        })}
      />
      <JsonLd data={faqPage(FAQ)} />
      <JsonLd
        data={breadcrumb([
          { name: "Home", url: "/" },
          { name: TITLE, url: "/vs/browser-use-cloud" },
        ])}
      />

      <Section wide className="border-t-0 pt-14">
        <SectionHead
          level={1}
          title={TITLE}
          standfirst="Both run AI browser agents behind the same v3 API. The difference is who owns the machine, and what the agent is allowed to invent."
        />

        <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
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

        <Panel label="Identical task, identical schema, identical cost cap" padded={false}>
          <BenchmarkTable rows={headlineRuns} highlight={champion.id} />
        </Panel>
        <p className="mt-6 max-w-[76ch] text-[15px] leading-relaxed text-muted">
          {`All ${runs.length} runs, every model tried, and the exact task specification are on the `}
          <Link href="/benchmarks" className="text-accent hover:underline">
            benchmarks page
          </Link>
          .
        </p>
      </Section>

      <Section id="dimensions" wide>
        <SectionHead
          title={headings.dimensions}
          standfirst={comparison.standfirst}
        />
        <Panel label={`${comparison.rows.length} dimensions`} padded={false}>
          <div className="md:overflow-x-auto">
            <table className="stack-table w-full border-collapse text-left md:min-w-[780px]">
              <thead>
                <tr>
                  <th scope="col" className={`${TH} w-[16%]`}>
                    <span className="sr-only">Dimension</span>
                  </th>
                  <th scope="col" className={`${TH} w-[34%]`}>
                    Browser Use Cloud
                  </th>
                  <th scope="col" className={`${TH} w-[50%] text-ink`}>
                    OpenBrowse
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr
                    key={row.dimension}
                    className="transition-colors hover:bg-panel/60"
                  >
                    <th
                      scope="row"
                      className="border-b border-line-faint px-4 py-3.5 align-top text-[13px] font-medium text-ink"
                    >
                      {row.dimension}
                    </th>
                    <td
                      data-label="Browser Use Cloud"
                      className={`border-b border-line-faint px-4 py-3.5 align-top text-[13px] leading-relaxed ${
                        row.advantage === "cloud" ? "text-body" : "text-dim"
                      }`}
                    >
                      {row.cloud}
                    </td>
                    <td
                      data-label="OpenBrowse"
                      className={`border-b border-line-faint px-4 py-3.5 align-top text-[13px] leading-relaxed ${
                        row.advantage === "cloud" ? "text-dim" : "text-body"
                      }`}
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
          {`${comparison.columnNote} Of these, ${cloudWins} go to the managed service, and those are the ones to check against your own setup before you move anything.`}
        </p>
      </Section>

      <Section id="migrating">
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
                  line.type === "add"
                    ? "+"
                    : line.type === "remove"
                      ? "-"
                      : " ";
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
        <p className="mt-6 max-w-[70ch] text-[14px] leading-relaxed text-muted">
          {dropIn.after}
        </p>
      </Section>

      <Section id="faqs">
        <SectionHead title={headings.faqs} />
        <FaqList items={FAQ} />
      </Section>
    </>
  );
}
