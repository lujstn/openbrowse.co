const PATHS = [
  "M290.705 369.914C290.705 369.914 210.213 396.956 210.213 396.956C206.233 398.293 201.92 398.257 197.962 396.856C148.001 379.164 115.992 340.272 102.051 289.137C88.11 238.002 100.116 183.282 134.184 142.681",
  "M323.368 335.617C323.368 335.617 323.368 197.851 323.368 197.851C323.368 189.565 317.701 182.353 309.65 180.395C309.65 180.395 209.618 156.063 209.618 156.063C198.308 153.312 187.407 161.879 187.407 173.519C187.407 173.519 187.407 386.246 187.407 386.246",
  "M227.468 87.842C290.827 75.641 355.374 102.279 391.688 155.613C428.002 208.947 429.129 278.765 394.556 333.244",
  "M297.945 429.25C324.428 425.197 350.031 416.68 373.665 404.061",
];

export function Mark({
  size = 23,
  animate = false,
  className,
}: {
  size?: number;
  animate?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={31.847}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {PATHS.map((d, i) => (
          <path
            key={d}
            d={d}
            pathLength={1}
            className={animate ? "ob-draw" : undefined}
            style={animate ? { animationDelay: `${i * 110}ms` } : undefined}
          />
        ))}
      </g>
    </svg>
  );
}

export function Wordmark({ animate = false }: { animate?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold tracking-[-0.02em] text-ink">
      <Mark animate={animate} />
      OpenBrowse
    </span>
  );
}
