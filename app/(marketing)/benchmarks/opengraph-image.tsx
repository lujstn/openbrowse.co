import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { delta, formatRatio, runs } from "@/lib/benchmark";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "OpenBrowse benchmark results against Browser Use Cloud";

export default function Image() {
  return ogImage({
    kicker: "benchmarks",
    title: "One task, ten runs, published numbers",
    stats: [
      { label: "cheaper", value: formatRatio(delta.cost) },
      { label: "fewer tokens", value: formatRatio(delta.tokens) },
      { label: "runs", value: String(runs.length) },
    ],
  });
}
