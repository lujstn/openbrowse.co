import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import {
  BenchmarkSection,
  CapabilitiesSection,
  DropInSection,
  FaqSection,
} from "@/components/sections";
import { JsonLd } from "@/components/json-ld";
import { faqPage, softwareApplication, softwareSourceCode } from "@/lib/schema";
import { faq, site } from "@/content/landing";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: site.url },
};

export default function Page() {
  return (
    <>
      <JsonLd data={softwareApplication()} />
      <JsonLd data={softwareSourceCode()} />
      <JsonLd data={faqPage(faq)} />
      <Hero />
      <DropInSection />
      <BenchmarkSection />
      <CapabilitiesSection />
      <FaqSection />
    </>
  );
}
