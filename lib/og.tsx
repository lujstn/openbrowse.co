import { ImageResponse } from "next/og";
import { OG_SIZE } from "./shared";

export { OG_CONTENT_TYPE, OG_SIZE } from "./shared";

const MARK_PATHS = [
  "M290.705 369.914C290.705 369.914 210.213 396.956 210.213 396.956C206.233 398.293 201.92 398.257 197.962 396.856C148.001 379.164 115.992 340.272 102.051 289.137C88.11 238.002 100.116 183.282 134.184 142.681",
  "M323.368 335.617C323.368 335.617 323.368 197.851 323.368 197.851C323.368 189.565 317.701 182.353 309.65 180.395C309.65 180.395 209.618 156.063 209.618 156.063C198.308 153.312 187.407 161.879 187.407 173.519C187.407 173.519 187.407 386.246 187.407 386.246",
  "M227.468 87.842C290.827 75.641 355.374 102.279 391.688 155.613C428.002 208.947 429.129 278.765 394.556 333.244",
  "M297.945 429.25C324.428 425.197 350.031 416.68 373.665 404.061",
];

export function ogImage({
  title,
  kicker,
  stats,
}: {
  title: string;
  kicker: string;
  stats?: { label: string; value: string }[];
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          padding: "72px 76px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="46" height="46" viewBox="0 0 512 512" fill="none">
            <g
              fill="none"
              stroke="#60a5fa"
              strokeWidth={31.847}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {MARK_PATHS.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
          </svg>
          <span
            style={{ color: "#ffffff", fontSize: 30, fontWeight: 600, letterSpacing: -0.6 }}
          >
            OpenBrowse
          </span>
          <span style={{ color: "#333333", fontSize: 26 }}>/</span>
          <span style={{ color: "#888888", fontSize: 24, letterSpacing: 1.6 }}>
            {kicker.toUpperCase()}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: title.length > 46 ? 62 : 76,
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: -2.2,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            borderTop: "1px solid #222222",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", gap: 52 }}>
            {(stats ?? []).map((stat) => (
              <div
                key={stat.label}
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                <span style={{ color: "#e5e5e5", fontSize: 34, fontWeight: 600 }}>
                  {stat.value}
                </span>
                <span style={{ color: "#666666", fontSize: 18, letterSpacing: 1.4 }}>
                  {stat.label.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
          <span style={{ color: "#60a5fa", fontSize: 22 }}>openbrowse.co</span>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
