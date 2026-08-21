import { headings, site } from "@/content/landing";
import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "OpenBrowse compared with Browserbase";

export default function Image() {
  return ogImage({
    kicker: "comparison",
    title: headings.vsBrowserbase,
    stats: [
      { label: "licence", value: site.licence },
      { label: "metered", value: "nothing" },
      { label: "parallel reads", value: "48 URLs" },
    ],
  });
}
