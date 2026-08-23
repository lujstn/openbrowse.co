import type { Metadata } from "next";
import Link from "next/link";
import cloud from "@/data/cloud-pricing.json";
import { Section, SectionHead } from "@/components/section";
import { Panel } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { breadcrumb, techArticle } from "@/lib/schema";
import { articleOpenGraph } from "@/lib/metadata";
import { headings, pricing, site } from "@/content/landing";
import { champion } from "@/lib/benchmark";

const TITLE = pricing.h1;
const SEO_TITLE = "Browser Use Cloud pricing vs self-hosting";

// @nonobvious(must-hold) the platform's share is computed from their own published multiplier rather than
// typed, so the worked example below cannot contradict the rate table above it the first time either moves
const platformShare = cloud.tokenMultiplier - 1;
const cloudCost = champion.costUsd * cloud.tokenMultiplier;

const CAPTURED = new Date(cloud.capturedOn).toLocaleDateString("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const DESCRIPTION = `Browser Use Cloud's published rates as read on ${CAPTURED}, what the same tokens cost self-hosted, and the multiplier between the two.`;

export const metadata: Metadata = {
  title: SEO_TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/vs/browser-use-cloud/pricing",
    types: { "text/markdown": "/vs/browser-use-cloud/pricing.md" },
  },
  openGraph: {
    ...articleOpenGraph,
    title: SEO_TITLE,
    description: DESCRIPTION,
    url: `${site.url}/vs/browser-use-cloud/pricing`,
  },
};

const TH =
  "px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.05em] text-label border-b border-line align-bottom";
const TD = "px-4 py-3 align-top text-[14px] leading-relaxed";

export default function Page() {
  return (
    <>
      <JsonLd
        data={techArticle({
          title: SEO_TITLE,
          description: DESCRIPTION,
          url: "/vs/browser-use-cloud/pricing",
        })}
      />
      <JsonLd
        data={breadcrumb([
          { name: "Home", url: "/" },
          { name: headings.vs, url: "/vs/browser-use-cloud" },
          { name: "Pricing", url: "/vs/browser-use-cloud/pricing" },
        ])}
      />

      <Section className="border-t-0 pt-14">
        <SectionHead level={1} title={TITLE} standfirst={pricing.standfirst} />
      </Section>

      <Section id="cloud">
        <SectionHead title={headings.cloudCharges} standfirst={pricing.cloudLead} />

        <Panel label={`${cloud.vendor}, read on ${CAPTURED}`} padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th scope="col" className={`${TH} w-[26%]`}>
                    Item
                  </th>
                  <th scope="col" className={`${TH} w-[30%]`}>
                    Rate
                  </th>
                  <th scope="col" className={TH}>
                    What that means
                  </th>
                </tr>
              </thead>
              <tbody>
                {cloud.usage.map((row) => (
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
          <a href={cloud.sourceUrl} className="hover:text-accent" rel="nofollow">
            {new URL(cloud.sourceUrl).host + new URL(cloud.sourceUrl).pathname}
          </a>
        </p>

        <p className="mt-6 max-w-[76ch] text-[15px] leading-relaxed text-muted">
          {`Plans buy concurrency and arrive as credits: ${cloud.plans
            .map((plan) => `${plan.name} at $${plan.monthlyUsd} a month for ${plan.concurrentSessions} concurrent sessions`)
            .join(", ")}. ${cloud.annualNote}`}
        </p>
      </Section>

      <Section id="self-hosted">
        <SectionHead title={headings.selfHostCosts} standfirst={pricing.selfHostLead} />

        <Panel label="OpenBrowse" padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th scope="col" className={`${TH} w-[26%]`}>
                    Item
                  </th>
                  <th scope="col" className={`${TH} w-[30%]`}>
                    Rate
                  </th>
                  <th scope="col" className={TH}>
                    What that means
                  </th>
                </tr>
              </thead>
              <tbody>
                {pricing.selfHostRows.map((row) => (
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
          {pricing.giveUp}{" "}
          <Link href="/vs/browser-use-cloud" className="text-accent hover:underline">
            The full comparison
          </Link>
          {" covers all of that dimension by dimension."}
        </p>
      </Section>

      <Section id="multiplier">
        <SectionHead
          title={headings.multiplier}
          standfirst="Both of their token routes land in the same place, and it is the number worth carrying away."
        />

        <p className="max-w-[76ch] text-[15px] leading-relaxed text-muted">
          {`Managed tokens are billed at ${cloud.tokenMultiplier}× the provider's own rates. Bring your own key instead and you pay the provider directly, plus a ${cloud.byokOrchestrationFee}× orchestration fee. Either way the platform's share is ${Math.round(platformShare * 100)}% of a bill you were always going to pay, and self-hosting is the same tokens at 1×.`}
        </p>

        <p className="mt-5 max-w-[76ch] text-[15px] leading-relaxed text-muted">
          {`Applied to something measured: the fastest complete run on our benchmark cost $${champion.costUsd.toFixed(2)} in tokens on ${champion.model}. The same tokens through the platform would be $${cloudCost.toFixed(2)}, before session time at ${cloud.usage[2].rate} and any egress. On one run that is pennies. It is a percentage, so it scales exactly as your usage does.`}
        </p>
      </Section>
    </>
  );
}
