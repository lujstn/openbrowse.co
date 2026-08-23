import Link from "next/link";
import { Panel } from "@/components/ui";
import { Section, SectionHead } from "@/components/section";
import type { TrustPage } from "@/content/trust";

export function TrustPageContent({ page }: { page: TrustPage }) {
  const [intro, ...sections] = page.sections;
  return <><Section className="border-t-0 pt-14"><SectionHead level={1} title={page.title} standfirst={page.standfirst} /><div className="max-w-[76ch] space-y-5 text-[15px] leading-relaxed text-muted">{intro?.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></Section>{sections.map((section) => <Section key={section.id} id={section.id}><SectionHead title={section.title} />{section.paragraphs ? <div className="max-w-[76ch] space-y-5 text-[15px] leading-relaxed text-muted">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div> : null}{section.cards ? <div className="grid gap-3 md:grid-cols-3">{section.cards.map((card) => <Panel key={card.label} label={card.label}><p className="text-[14px] leading-relaxed text-muted">{card.body}</p>{card.href && card.linkLabel ? <Link href={card.href} className="mt-4 inline-block text-[13px] text-accent hover:underline">{card.linkLabel}</Link> : null}</Panel>)}</div> : null}</Section>)}</>;
}
