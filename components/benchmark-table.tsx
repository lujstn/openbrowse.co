import type { Run } from "@/lib/benchmark";
import { Chip, Dot, ModelToken } from "@/components/ui";

const TH =
  "px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.05em] text-label border-b border-line whitespace-nowrap";
const TD = "px-4 py-3 border-b border-line-faint text-[13px] whitespace-nowrap";

const REASONING_TONE = {
  none: "gray",
  low: "teal",
  medium: "blue",
  high: "purple",
  max: "pink",
} as const;

function Num({
  children,
  best = false,
}: {
  children: React.ReactNode;
  best?: boolean;
}) {
  return (
    <span className={`font-mono tabular-nums ${best ? "text-ok" : "text-body"}`}>
      {children}
    </span>
  );
}

export function BenchmarkTable({
  rows,
  showSteps = false,
  highlight,
}: {
  rows: Run[];
  showSteps?: boolean;
  highlight?: string;
}) {
  const min = {
    seconds: Math.min(...rows.map((r) => r.seconds)),
    tokens: Math.min(...rows.map((r) => r.tokens)),
    costUsd: Math.min(...rows.map((r) => r.costUsd)),
    steps: Math.min(...rows.map((r) => r.steps)),
  };

  return (
    <div className="md:overflow-x-auto">
      <table className="stack-table w-full border-collapse text-left md:min-w-[760px]">
        <thead>
          <tr>
            <th scope="col" className={TH}>
              Runtime
            </th>
            <th scope="col" className={TH}>
              Model
            </th>
            <th scope="col" className={TH}>
              Reasoning
            </th>
            {showSteps ? (
              <th scope="col" className={`${TH} text-right`}>
                Steps
              </th>
            ) : null}
            <th scope="col" className={`${TH} text-right`}>
              Time
            </th>
            <th scope="col" className={`${TH} text-right`}>
              Tokens
            </th>
            <th scope="col" className={`${TH} text-right`}>
              LLM cost
            </th>
            <th scope="col" className={TH}>
              Records
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((run) => {
            const isOb = run.runtime === "OpenBrowse";
            return (
              <tr
                key={run.id}
                className={`transition-colors hover:bg-panel/60 ${
                  run.id === highlight ? "bg-accent/[0.05]" : ""
                }`}
              >
                <th scope="row" className={`${TD} font-normal`}>
                  <span className="inline-flex items-center gap-2">
                    <Dot
                      tone={isOb ? "accent" : "neutral"}
                      label={run.runtime}
                    />
                    <span className={isOb ? "font-medium text-ink" : "text-dim"}>
                      {run.runtime}
                    </span>
                  </span>
                </th>
                <td className={TD} data-label="Model">
                  <ModelToken name={run.model} />
                </td>
                <td className={TD} data-label="Reasoning">
                  <Chip color={REASONING_TONE[run.reasoning as keyof typeof REASONING_TONE]}>
                    {run.reasoning}
                  </Chip>
                </td>
                {showSteps ? (
                  <td className={`${TD} text-right`} data-label="Steps">
                    <Num best={run.steps === min.steps}>{run.steps}</Num>
                  </td>
                ) : null}
                <td className={`${TD} text-right`} data-label="Time">
                  <Num best={run.seconds === min.seconds}>{run.timeDisplay}</Num>
                </td>
                <td className={`${TD} text-right`} data-label="Tokens">
                  <Num best={run.tokens === min.tokens}>{run.tokensDisplay}</Num>
                </td>
                <td className={`${TD} text-right`} data-label="LLM cost">
                  <Num best={run.costUsd === min.costUsd}>
                    ${run.costUsd.toFixed(2)}
                  </Num>
                </td>
                <td className={TD} data-label="Records">
                  <span className="inline-flex items-center gap-2">
                    <Dot
                      tone={run.faithful ? "ok" : "warn"}
                      label={
                        run.faithful
                          ? "all fields grounded"
                          : "some fields hallucinated"
                      }
                    />
                    <span className="font-mono tabular-nums text-body">
                      {run.records}/{run.recordsExpected}
                    </span>
                    {run.faithful ? null : (
                      <span className="font-mono text-[10px] text-warn">
                        invented fields
                      </span>
                    )}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
