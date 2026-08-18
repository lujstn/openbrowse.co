import Link from "next/link";
import { hero } from "@/content/landing";
import { HeroVideo } from "@/components/hero-video";
import { Mark } from "@/components/wordmark";

export function Hero() {
  return (
    <section className="px-5 pt-14 pb-16 sm:px-8 sm:pt-20 sm:pb-24">
      {/* @nonobvious(must-hold) the poster is the LCP element, and the video carries preload="none" so nothing fetches it early enough on its own */}
      <link
        rel="preload"
        as="image"
        href="/media/poster-1600.webp"
        fetchPriority="high"
      />
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="max-w-[24ch]">
          <Mark size={40} animate className="mb-7 text-accent" />
        </div>
        <h1 className="max-w-[18ch] text-display font-semibold text-ink text-balance">
          {hero.h1}
        </h1>
        <p className="mt-6 max-w-[60ch] text-lede text-muted text-pretty">
          {hero.sub}
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href={hero.primary.href}
            className="rounded-sm bg-accent px-4 py-2.5 text-[14px] font-medium text-page transition-colors hover:bg-accent-hi active:translate-y-px"
          >
            {hero.primary.label}
          </Link>
          <a
            href={hero.secondary.href}
            className="rounded-sm border border-line-strong px-4 py-2.5 text-[14px] font-medium text-body transition-colors hover:border-dim hover:text-ink active:translate-y-px"
          >
            {hero.secondary.label}
          </a>
        </div>
        {/* @nonobvious(means) a reader arriving from a Browser Use Cloud invoice needs the price before anything else, and "open source" is not the same claim as "no fee": the first mention of cost was otherwise four screens down */}
        <p className="mt-7 font-mono text-[12px] text-dim">
          MIT licensed · self-hosted · no per-task fee · same v3 API as
          browser-use-sdk
        </p>

        <div className="mt-14 sm:mt-20">
          <HeroVideo
            src="/media/demo-1600.mp4"
            poster="/media/poster-1600.webp"
            width={1600}
            height={1066}
            caption={hero.videoCaption}
          />
        </div>
      </div>
    </section>
  );
}
