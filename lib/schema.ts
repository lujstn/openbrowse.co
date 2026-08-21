import { site } from "@/content/landing";
import { gitConfig } from "@/lib/shared";
import benchmarks from "@/data/benchmarks.json";
import release from "@/data/release.json";

// @nonobvious(means) every node carries a stable @id so the same author, publisher and site are one entity
// across all 30 pages rather than 30 lookalike copies a consumer has to guess are the same person
const AUTHOR_ID = `${site.url}#author`;
const ORGANISATION_ID = `${site.url}#organisation`;
const WEBSITE_ID = `${site.url}#website`;

const author = {
  "@type": "Person",
  "@id": AUTHOR_ID,
  name: site.author,
  url: release.orcid,
  identifier: release.orcid,
  sameAs: [`https://github.com/${gitConfig.user}`, "https://x.com/lujstn", "https://lujstn.com"],
};

// @nonobvious(forced-by) a static export has no request time, so the build stamp is the only honest dateModified available
const BUILD_DATE = new Date().toISOString().slice(0, 10);

const publisher = {
  "@type": "Organization",
  "@id": ORGANISATION_ID,
  name: site.name,
  url: site.url,
};

const partOfSite = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: site.name,
  url: site.url,
};

export function softwareApplication() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${site.url}#software`,
    name: site.name,
    alternateName: "OpenBrowse self-hosted browser agents",
    description: site.abstract,
    // @nonobvious(must-hold) at least five unrelated products ship under names one letter away from this one,
    // the nearest of which is also an MIT-licensed AI browser with live viewing, so a consumer resolving the
    // bare string "OpenBrowse" has no way to tell them apart without being told which entity this is not
    disambiguatingDescription:
      "OpenBrowse (openbrowse.co) is a self-hosted server that runs AI browser agents behind the Browser Use v3 REST API. It is not a desktop web browser, and it is unrelated to the separate projects named OpenBrowser and BrowserOS.",
    url: site.url,
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Browser automation",
    operatingSystem: "Linux (Debian, Ubuntu, Raspberry Pi OS)",
    softwareVersion: release.version,
    datePublished: release.dateReleased,
    license: "https://opensource.org/licenses/MIT",
    isAccessibleForFree: true,
    author,
    maintainer: author,
    codeRepository: site.repo,
    programmingLanguage: "Python",
    identifier: `https://doi.org/${release.doi}`,
    sameAs: [site.repo, site.pypi, `https://doi.org/${release.doi}`],
    // @nonobvious(deliberately-missing) no aggregateRating or review: Google requires one for the Software app rich result, and inventing ratings for an open-source project with none breaks their structured-data spam policy
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
}

export function website() {
  return {
    "@context": "https://schema.org",
    ...partOfSite,
    description: site.abstract,
    inLanguage: "en-GB",
    publisher,
    isFamilyFriendly: true,
  };
}

export function softwareSourceCode() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "@id": `${site.url}#sourcecode`,
    name: site.name,
    url: site.url,
    description: site.abstract,
    codeRepository: site.repo,
    targetProduct: { "@id": `${site.url}#software` },
    programmingLanguage: { "@type": "ComputerLanguage", name: "Python" },
    runtimePlatform: "Python 3.11+",
    license: "https://opensource.org/licenses/MIT",
    author,
    identifier: site.doiUrl,
  };
}

export function techArticle({
  title,
  description,
  url,
  image,
  datePublished = release.dateReleased,
  dateModified = BUILD_DATE,
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description,
    url: `${site.url}${url}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${site.url}${url}` },
    // @nonobvious(deliberately-missing) image is omitted rather than defaulted when a caller has none: the
    // marketing pages' Open Graph images are emitted by Next's file convention under content-hashed paths
    // this module cannot know, and a plausible guess would be a structured-data error pointing at a 404
    ...(image ? { image: `${site.url}${image}` } : {}),
    author,
    publisher,
    datePublished,
    dateModified,
    inLanguage: "en-GB",
    // @nonobvious(must-hold) an Article cannot be part of another Article, and this was hardcoded to the
    // documentation collection even on marketing pages that are not in it; the site is the one containing
    // work that is true for every page carrying this type
    isPartOf: partOfSite,
  };
}

export function faqPage(items: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function benchmarkDataset() {
  const { task, conditions, runs } = benchmarks;
  // @nonobvious(must-hold) these counts are derived, not written: a retriever quotes them, so they cannot disagree with the dataset they describe
  const models = new Set(runs.map((r) => r.model)).size;
  const runtimes = new Set(runs.map((r) => r.runtime)).size;
  const levels = new Set(runs.map((r) => r.reasoning)).size;
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "OpenBrowse vs Browser Use Cloud extraction benchmark",
    description: `${task.summary} ${runs.length} runs across ${runtimes} runtimes, ${models} models and ${levels} reasoning levels, recording wall-clock time, token use, LLM cost and records recovered. ${conditions.note}`,
    url: `${site.url}/benchmarks`,
    identifier: site.doiUrl,
    license: "https://opensource.org/licenses/MIT",
    creator: author,
    isAccessibleForFree: true,
    measurementTechnique: [
      "Wall-clock run duration",
      "Total LLM tokens consumed",
      "LLM spend in USD",
      "Records recovered against expected schema",
    ],
    variableMeasured: [
      { "@type": "PropertyValue", name: "seconds", description: "Wall-clock duration of the run" },
      { "@type": "PropertyValue", name: "tokens", description: "Total LLM tokens consumed" },
      { "@type": "PropertyValue", name: "costUsd", description: "LLM token spend in US dollars" },
      { "@type": "PropertyValue", name: "records", description: "Records recovered out of 14 expected" },
    ],
    // @nonobvious(must-hold) no distribution is declared because the site serves no data file: a DataDownload pointing at a URL that 404s is a structured-data error Google reports, and the runs are already published as a semantic table on the page itself
  };
}

export function breadcrumb(trail: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.url}`,
    })),
  };
}
