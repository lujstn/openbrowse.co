import { CompareStat } from "@/components/compare-stat";
import { BenchmarkTable } from "@/components/benchmark-table";
import { Panel } from "@/components/ui";
import {
  baseline,
  champion,
  headlineRuns,
  percentFaster,
  percentLess,
} from "@/lib/benchmark";

// @nonobvious(must-hold) the three cards and the line naming both configurations are one component and not
// two, because the two sides of those cards ran different models and the cards are the part that gets
// screenshotted and quoted away from the table that would have shown it. Rendered separately, one page did
// carry the attribution and the other put the same cards under a caption reading "identical task, identical
// schema, identical cost cap" with no model named anywhere near them.
export function HeadlineStats({ tone }: { tone?: "raised" | "quiet" }) {
  return (
    <>
      <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-3">
        <CompareStat
          label="What it cost"
          ours={champion.costUsd}
          theirs={baseline.costUsd}
          ourValue={`$${champion.costUsd.toFixed(2)}`}
          theirValue={`$${baseline.costUsd.toFixed(2)}`}
          saving={percentLess(baseline.costUsd, champion.costUsd)}
        />
        <CompareStat
          label="Tokens burned"
          ours={champion.tokens}
          theirs={baseline.tokens}
          ourValue={champion.tokensDisplay}
          theirValue={baseline.tokensDisplay}
          saving={percentLess(baseline.tokens, champion.tokens)}
        />
        <CompareStat
          label="Time to finish"
          ours={champion.seconds}
          theirs={baseline.seconds}
          ourValue={champion.timeDisplay}
          theirValue={baseline.timeDisplay}
          saving={percentFaster(baseline.seconds, champion.seconds)}
        />
      </div>

      <p className="mb-8 font-mono text-[12px] leading-relaxed text-dim">
        {`OpenBrowse on ${champion.model} at reasoning ${champion.reasoning}, against Browser Use Cloud on ${baseline.model} at ${baseline.reasoning}.`}
      </p>

      {/* @nonobvious(means) the table is deliberately quieter than the cards above it: it is corroboration for the headline figures, not the thing the reader is meant to land on first */}
      <Panel label="The runs behind those numbers" padded={false} tone={tone}>
        <BenchmarkTable rows={headlineRuns} highlight={champion.id} />
      </Panel>
    </>
  );
}
