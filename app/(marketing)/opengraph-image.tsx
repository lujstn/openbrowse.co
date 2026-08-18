import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { champion, baseline, delta, formatRatio } from "@/lib/benchmark";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "OpenBrowse: the open-source Browser Use Cloud alternative";

export default function Image() {
  return ogImage({
    kicker: "self-hosted browser agents",
    title: "The open-source Browser Use Cloud alternative",
    stats: [
      { label: "cheaper", value: formatRatio(delta.cost) },
      { label: "fewer tokens", value: formatRatio(delta.tokens) },
      { label: "records", value: `${champion.records}/${baseline.recordsExpected}` },
    ],
  });
}
