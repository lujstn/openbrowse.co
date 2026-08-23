import type { Metadata } from "next";
import Link from "next/link";
import models from "@/data/models.json";
import { Section, SectionHead } from "@/components/section";
import { Chip, Label, ModelToken } from "@/components/ui";
import { CompareStat } from "@/components/compare-stat";
import { RunsTable } from "@/components/runs-table";
import { JsonLd } from "@/components/json-ld";
import { benchmarkDataset, breadcrumb, techArticle } from "@/lib/schema";
import { articleOpenGraph } from "@/lib/metadata";
import { benchmarkAnalysis, evidence, headings, site } from "@/content/landing";
import {
  baseline,
  champion,
  percentFaster,
  percentLess,
  reasoningContrast,
  runs,
  shape,
  task,
} from "@/lib/benchmark";

const TITLE = evidence.title;
// @nonobvious(must-hold) the tab title and the H1 say the same thing at different lengths rather than
// different things: the H1 has to name the section a reader has landed in, the title tag has to win a search
// for browser agent benchmarks, and both now carry the term. The run count is interpolated in both, because a
// hand-typed count is the first thing to drift when a row is added.
const SEO_TITLE = `Browser agent benchmarks: ${shape.runs} runs, measured`;
const DESCRIPTION = `${shape.runs} runs of our extraction benchmark task across ${shape.runtimes} runtimes and ${shape.models} models, plus which model to reach for and how much reasoning to give it.`;

export const metadata: Metadata = {
  title: SEO_TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/benchmarks", types: { "text/markdown": "/benchmarks.md" } },
  openGraph: {
    ...articleOpenGraph,
    title: SEO_TITLE,
    description: DESCRIPTION,
    url: `${site.url}/benchmarks`,
  },
};

const STATUS_TONE = { supported: "green", "coming-soon": "orange" } as const;

export default function Page() {
  return (
    <>
      <JsonLd data={benchmarkDataset()} />
      <JsonLd
        data={techArticle({
          title: SEO_TITLE,
          description: DESCRIPTION,
          url: "/benchmarks",
        })}
      />
      <JsonLd
        data={breadcrumb([
          { name: "Home", url: "/" },
          { name: TITLE, url: "/benchmarks" },
        ])}
      />

      <Section className="border-t-0 pt-14">
        <SectionHead level={1} title={TITLE} standfirst={evidence.intro(shape)} />

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

        <RunsTable rows={runs} highlight={champion.id} />

        <div className="mt-8 grid gap-x-12 gap-y-6 md:grid-cols-2">
          <p className="text-[15px] leading-relaxed text-muted">
            {evidence.honesty}
          </p>
          <p className="text-[15px] leading-relaxed text-muted">
            {evidence.costsNote}
          </p>
        </div>
      </Section>

      <Section id="reading">
        <SectionHead title={benchmarkAnalysis.h2} />
        <dl className="border-t border-line">
          {benchmarkAnalysis.points.map((point) => (
            <div
              key={point.title}
              className="grid gap-x-10 gap-y-3 border-b border-line-faint py-7 sm:grid-cols-[minmax(0,17rem)_1fr]"
            >
              <dt className="text-[16px] font-semibold text-ink text-balance">
                {point.title}
              </dt>
              <dd className="max-w-[68ch] text-[15px] leading-relaxed text-muted">
                {point.body}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="reasoning">
        <SectionHead
          title={headings.reasoning}
          standfirst={models.finding.summary}
        />
        {/* @nonobvious(means) the two families are set side by side rather than listed, because the finding is the contrast itself: read as a list, the two rows look like two unrelated tuning tips */}
        <div className="grid gap-3 md:grid-cols-2">
          {reasoningContrast.map((item) => (
            <div
              key={item.family}
              className="rounded-md border border-line bg-raised p-5"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[16px] font-semibold text-ink">
                  {item.family}
                </h3>
                {/* @nonobvious(means) teal and purple are the same hues the runs table gives low and high reasoning, so the card colour repeats the direction the card is arguing for; green and orange read as good and bad, which neither direction is */}
                <Chip color={item.family === "OpenAI" ? "teal" : "purple"}>
                  {item.verdict}
                </Chip>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                {item.text}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-[76ch] text-[15px] leading-relaxed text-muted">
          More reasoning is not simply better, and the right answer moves in
          opposite directions depending on who made the model. This is why a
          session that sends no{" "}
          <code className="font-mono text-body">reasoningEffort</code> runs at
          the level measured here rather than at whatever the provider would
          have chosen unprompted.
        </p>
      </Section>

      <Section id="picking">
        <SectionHead
          title={headings.picking}
          standfirst="Three starting points, depending on what you are optimising for."
        />
        <div className="grid gap-3 md:grid-cols-3">
          {models.recommendations.map((rec) => (
            <div
              key={rec.id}
              className="rounded-md border border-line bg-raised p-5"
            >
              <Label>{rec.label}</Label>
              <ul className="mt-3.5 space-y-2">
                {rec.picks.map((pick) => (
                  <li
                    key={`${pick.model}-${pick.reasoningEffort}`}
                    className="flex flex-wrap items-center gap-1.5"
                  >
                    <ModelToken name={pick.model} />
                    <Chip color="gray">{pick.reasoningEffort}</Chip>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[14px] leading-relaxed text-dim">
                {rec.rationale}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 space-y-3">
          {models.providers.map((provider) => (
            <div
              key={provider.name}
              className="rounded-md border border-line bg-raised p-5"
            >
              <div className="flex items-center gap-3">
                <h3 className="text-[15px] font-semibold text-ink">
                  {provider.name}
                </h3>
                <Chip
                  color={
                    STATUS_TONE[provider.status as keyof typeof STATUS_TONE]
                  }
                >
                  {provider.status === "supported" ? "supported" : "coming soon"}
                </Chip>
              </div>
              {provider.models.length ? (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {provider.models.map((model) => (
                    <li key={model}>
                      <ModelToken name={model} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-[14px] text-dim">Not available yet.</p>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section id="method">
        <SectionHead title={headings.method} />
        <p className="max-w-[76ch] text-[15px] leading-relaxed text-muted">
          OpenBrowse runs on any Debian or Ubuntu machine, from a Raspberry Pi
          to a VPS, and installs in about ten minutes. Point an existing
          browser-use-sdk client at it, send it the same task file these runs
          used, and compare what comes back against the rows above.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
          <Link
            href="/docs"
            className="text-accent hover:text-accent-hi hover:underline"
          >
            Getting started
          </Link>
          <a
            href={task.specUrl}
            className="text-accent hover:text-accent-hi hover:underline"
          >
            The task on GitHub
          </a>
        </div>
      </Section>
    </>
  );
}
