import { headings } from "@/content/landing";
import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { baseline, champion, delta, formatRatio } from "@/lib/benchmark";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "OpenBrowse compared with Browser Use Cloud";

export default function Image() {
  return ogImage({
    kicker: "comparison",
    title: headings.vs,
    stats: [
      { label: "openbrowse", value: `$${champion.costUsd.toFixed(2)}` },
      { label: "bu cloud", value: `$${baseline.costUsd.toFixed(2)}` },
      { label: "cheaper", value: formatRatio(delta.cost) },
    ],
  });
}
