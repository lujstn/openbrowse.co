import type { ReactNode } from "react";

// @nonobvious(must-hold) every full-width band on the site measures its content against
// this one value: the section wrapper, the hero, the header nav and the footer. Two bands
// a few pixels apart do not read as two widths, they read as one width drawn badly, and
// the only defence against that is having a single place to change.
export const CONTAINER = "mx-auto w-full max-w-[1180px]";

export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`border-t border-line px-5 py-16 sm:px-8 sm:py-24 ${className}`}
    >
      <div className={CONTAINER}>{children}</div>
    </section>
  );
}

export function SectionHead({
  title,
  standfirst,
  children,
  level = 2,
}: {
  title: string;
  standfirst?: string;
  children?: ReactNode;
  level?: 1 | 2;
}) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <header className="mb-10 max-w-[68ch]">
      <Heading
        className={`font-semibold text-ink text-balance ${
          level === 1 ? "text-display" : "text-title"
        }`}
      >
        {title}
      </Heading>
      {standfirst ? (
        <p className="mt-4 text-lede text-muted text-pretty">{standfirst}</p>
      ) : null}
      {children}
    </header>
  );
}
