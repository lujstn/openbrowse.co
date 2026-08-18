import type { ReactNode } from "react";

export function Section({
  id,
  children,
  className = "",
  wide = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <section
      id={id}
      className={`border-t border-line px-5 py-16 sm:px-8 sm:py-24 ${className}`}
    >
      <div className={`mx-auto w-full ${wide ? "max-w-[1180px]" : "max-w-[1100px]"}`}>
        {children}
      </div>
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
