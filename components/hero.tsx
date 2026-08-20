import Link from "next/link";
import { hero, install, site } from "@/content/landing";
import { CopyCommand } from "@/components/copy-command";
import { HeroVideo } from "@/components/hero-video";
import { Mark } from "@/components/wordmark";
import { CONTAINER } from "@/components/section";
import { Panel } from "@/components/ui";

function InstallCard() {
  return (
    <Panel
      label={install.label}
      padded={false}
      actions={
        <>
          <span className="font-mono text-[11px] tabular-nums text-label">
            v{site.version}
          </span>
          <span aria-hidden="true" className="h-3 w-px bg-line-strong" />
          <CopyCommand
            text={install.commands.join("\n")}
            label={install.label.toLowerCase()}
          />
        </>
      }
    >
      <pre className="overflow-x-auto px-4 py-3.5 text-[13px] leading-[1.9]">
        <code className="font-mono">
          {install.commands.map((command) => (
            <span key={command} className="block whitespace-pre">
              {/* @nonobvious(must-hold) the prompt is a separate node so it stays out of the copy button's payload; a pasted "$" is a broken command, and the sigil is what tells a reader this is a shell in the first place */}
              <span aria-hidden="true" className="mr-2.5 select-none text-label">
                $
              </span>
              <span className="text-ink">{command}</span>
            </span>
          ))}
        </code>
      </pre>
      <div className="border-t border-line-faint px-4 py-3">
        <p className="text-[12px] leading-relaxed text-dim">{install.note}</p>
        {/* @nonobvious(forced-by) flex items rather than an inline run: at this width the two commands cannot share a line, and inline text would wrap one of them mid-command, which reads as a different command entirely */}
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[12px] leading-relaxed text-label">
          <span>{install.alternativesLead}</span>
          {install.alternatives.map((alternative) => (
            <code key={alternative} className="font-mono text-muted">
              {alternative}
            </code>
          ))}
        </div>
      </div>
    </Panel>
  );
}

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
      <div className={CONTAINER}>
        <div className="max-w-[24ch]">
          <Mark size={40} animate className="mb-7 text-accent" />
        </div>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-16">
          <div>
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
            <p className="mt-7 font-mono text-[12px] text-dim">
              MIT licensed · self-hosted · no platform or proxy fees
            </p>
          </div>
          {/* @nonobvious(means) the offset is optical, not structural: the display face carries leading above its cap height, so a card aligned to the grid row sits visibly high against the first line of the headline */}
          <div className="lg:pt-2.5">
            <InstallCard />
          </div>
        </div>

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
