import type { Metadata } from "next";
import { TrustPageContent } from "@/components/trust-page";
import { site } from "@/content/landing";
import { trustPages } from "@/content/trust";
import { pageOpenGraph } from "@/lib/metadata";

const page = trustPages.privacy;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: "/privacy", types: { "text/markdown": "/privacy.md" } },
  openGraph: { ...pageOpenGraph, title: page.title, description: page.description, url: new URL("/privacy", site.url).toString() },
};

export default function Page() {
  return <TrustPageContent page={page} />;
}
