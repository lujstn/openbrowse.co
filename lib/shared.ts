export const appName = "OpenBrowse";

// @nonobvious(mirrors) these live here rather than beside the image renderer because page metadata has to
// declare the same dimensions the renderer produces, and importing them from lib/og would pull next/og into
// every page that only wants two numbers
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";
export const docsRoute = "/docs";
export const docsImageRoute = "/og/docs";
export const docsContentRoute = "/llms.mdx/docs";

export const gitConfig = {
  user: "lujstn",
  repo: "openbrowse",
  branch: "main",
};

export const siteRepo = {
  user: "lujstn",
  repo: "openbrowse.co",
  branch: "main",
};
