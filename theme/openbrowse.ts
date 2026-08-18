import { defineTheme } from "@astryxdesign/core/theme";

const PAGE = "#0a0a0a";
const RAISED = "#111111";
const PANEL = "#1a1a1a";
const LINE = "#222222";
const LINE_STRONG = "#333333";
const INK = "#ffffff";
const BODY = "#e5e5e5";
const DIM = "#888888";
const LABEL = "#666666";
const ACCENT = "#60a5fa";

// @nonobvious(means) every token is written as the same value in both slots because the product is dark-only, so a light-mode render must not silently produce a different palette
const both = (value: string): [string, string] => [value, value];

export const openbrowseTheme = defineTheme({
  name: "openbrowse",

  color: { accent: ACCENT, neutralStyle: "cool", contrast: "high" },

  typography: {
    scale: { base: 15, ratio: 1.2 },
    body: {
      family: "-apple-system",
      fallbacks: 'BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    },
    heading: { weight: "semibold", weights: { 1: "semibold", 2: "semibold" } },
    code: {
      family: "SF Mono",
      fallbacks: '"SFMono-Regular", Menlo, Consolas, ui-monospace, monospace',
    },
  },

  radius: { base: 4, multiplier: 1 },

  motion: { fast: 150, medium: 300, slow: 600, ratio: 0.75 },

  tokens: {
    "--color-accent": both(ACCENT),
    "--color-on-accent": both(PAGE),
    "--color-accent-muted": both("rgba(96, 165, 250, 0.14)"),

    "--color-background-body": both(PAGE),
    "--color-background-surface": both(RAISED),
    "--color-background-card": both(RAISED),
    "--color-background-popover": both(PANEL),
    "--color-background-muted": both(PANEL),
    "--color-background-inverted": both(BODY),

    "--color-text-primary": both(BODY),
    "--color-text-secondary": both(DIM),
    "--color-text-disabled": both(LABEL),
    "--color-text-accent": both(ACCENT),

    "--color-icon-primary": both(BODY),
    "--color-icon-secondary": both(DIM),
    "--color-icon-disabled": both(LABEL),
    "--color-icon-accent": both(ACCENT),

    "--color-border": both(LINE),
    "--color-border-emphasized": both(LINE_STRONG),

    "--color-success": both("#34d399"),
    "--color-success-muted": both("rgba(52, 211, 153, 0.14)"),
    "--color-on-success": both(PAGE),
    "--color-warning": both("#f59e0b"),
    "--color-warning-muted": both("rgba(245, 158, 11, 0.14)"),
    "--color-on-warning": both(PAGE),
    "--color-error": both("#f87171"),
    "--color-error-muted": both("rgba(248, 113, 113, 0.14)"),
    "--color-on-error": both(PAGE),

    "--color-overlay": both("rgba(0, 0, 0, 0.66)"),
    "--color-overlay-hover": both("rgba(255, 255, 255, 0.04)"),
    "--color-overlay-pressed": both("rgba(255, 255, 255, 0.07)"),
    "--color-tint-hover": both(RAISED),
    "--color-skeleton": both(PANEL),
    "--color-track": both(PANEL),
    "--color-shadow": both("rgba(0, 0, 0, 0.7)"),
    "--color-neutral": both(DIM),
    "--color-on-dark": both(BODY),
    "--color-on-light": both(PAGE),

    "--color-text-purple": both("#a78bfa"),
    "--color-background-purple": both("rgba(167, 139, 250, 0.13)"),
    "--color-border-purple": both("rgba(167, 139, 250, 0.3)"),
    "--color-text-blue": both(ACCENT),
    "--color-background-blue": both("rgba(96, 165, 250, 0.13)"),
    "--color-border-blue": both("rgba(96, 165, 250, 0.3)"),
    "--color-text-teal": both("#2dd4bf"),
    "--color-background-teal": both("rgba(45, 212, 191, 0.13)"),
    "--color-border-teal": both("rgba(45, 212, 191, 0.3)"),
    "--color-text-pink": both("#f472b6"),
    "--color-background-pink": both("rgba(244, 114, 182, 0.13)"),
    "--color-border-pink": both("rgba(244, 114, 182, 0.3)"),
    "--color-text-green": both("#34d399"),
    "--color-background-green": both("rgba(52, 211, 153, 0.13)"),
    "--color-border-green": both("rgba(52, 211, 153, 0.3)"),
    "--color-text-red": both("#f87171"),
    "--color-background-red": both("rgba(248, 113, 113, 0.13)"),
    "--color-border-red": both("rgba(248, 113, 113, 0.3)"),
    "--color-text-orange": both("#f59e0b"),
    "--color-background-orange": both("rgba(245, 158, 11, 0.13)"),
    "--color-border-orange": both("rgba(245, 158, 11, 0.3)"),
    "--color-text-gray": both(DIM),
    "--color-background-gray": both(PANEL),
    "--color-border-gray": both(LINE_STRONG),

    "--border-width": "1px",
    "--font-weight-medium": "500",

    "--text-label-size": "11px",
    "--text-label-weight": "500",
    "--text-code-size": "12px",

    "--text-display-1-size": "clamp(2.125rem, 1.45rem + 2.7vw, 3.5rem)",
    "--text-display-1-leading": "1.04",
    "--text-display-2-size": "clamp(1.5rem, 1.24rem + 1.05vw, 2.125rem)",
    "--text-display-2-leading": "1.12",
  },

  components: {
    heading: {
      base: { letterSpacing: "-0.024em", textWrap: "balance" },
      "level:1": { letterSpacing: "-0.032em", color: INK },
      "level:2": { color: INK },
      "level:3": { color: INK },
    },
  },
});

export default openbrowseTheme;
