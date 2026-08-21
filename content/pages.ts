import {
  benchmark,
  benchmarkAnalysis,
  differentiators,
  dropIn,
  evidence,
  headings,
  hero,
  pricing,
} from "@/content/landing";

export type MarketingPage = {
  url: string;
  name: string;
  summary: string;
  headings: string[];
};

// @nonobvious(mirrors) the source for both the page map llms.txt publishes and the assertion in scripts/check-export.mjs that compares it against the exported HTML. Headings are references, not literals, so a page and its map cannot hold different strings.
export const marketingPages: MarketingPage[] = [
  {
    url: "/",
    name: "Home",
    summary:
      "What OpenBrowse is, the measured comparison against Browser Use Cloud, what it does that a hosted runner does not, the two-line SDK migration, and the FAQ.",
    headings: [
      hero.h1,
      dropIn.h2,
      benchmark.h2,
      differentiators.h2,
      headings.faqs,
    ],
  },
  {
    url: "/benchmarks",
    name: evidence.title,
    summary:
      "Every run in full, what the runs show, how much reasoning each model family wants, which model to reach for, and how to repeat the task yourself.",
    headings: [
      evidence.title,
      benchmarkAnalysis.h2,
      headings.reasoning,
      headings.picking,
      headings.method,
    ],
  },
  {
    url: "/vs/browser-use-cloud/pricing",
    name: "Pricing",
    summary:
      "Browser Use Cloud's published rates read on a stated date, the same work priced on your own hardware, and the multiplier between the two.",
    headings: [pricing.h1, headings.cloudCharges, headings.selfHostCosts, headings.multiplier],
  },
  {
    url: "/vs/browser-use-cloud",
    name: headings.vs,
    summary:
      "A dimension-by-dimension comparison of the self-hosted runtime against the managed service, including the rows where the managed service wins.",
    headings: [headings.vs, headings.dimensions, dropIn.h2, headings.faqs],
  },
];
