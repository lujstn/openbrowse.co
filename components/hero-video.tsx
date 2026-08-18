"use client";

import { useEffect, useRef, useState } from "react";

export function HeroVideo({
  src,
  poster,
  width,
  height,
  caption,
}: {
  src: string;
  poster: string;
  width: number;
  height: number;
  caption: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // @nonobvious(forced-by) autoplay is an HTML attribute the browser acts on before any media query can, so reduced-motion has to be honoured here rather than in CSS
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.autoplay = false;
      el.pause();
      setPlaying(false);
    }
  }, []);

  function toggle() {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  return (
    <figure className="m-0">
      <div className="relative overflow-hidden rounded-md border border-line bg-raised shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_24px_60px_-24px_rgba(0,0,0,0.9)]">
        <video
          ref={ref}
          className="block h-auto w-full"
          width={width}
          height={height}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-label={caption}
        >
          <source src={src} type="video/mp4" />
        </video>
        <button
          type="button"
          onClick={toggle}
          className="absolute bottom-3 right-3 rounded-xs border border-line-strong bg-page/80 px-2.5 py-1 text-[11px] font-medium tracking-[0.05em] text-dim uppercase backdrop-blur-sm transition-colors hover:text-ink"
        >
          {playing ? "Pause" : "Play"}
        </button>
      </div>
      <figcaption className="mt-4 max-w-[76ch] text-[13px] leading-relaxed text-label">
        {caption}
      </figcaption>
    </figure>
  );
}
