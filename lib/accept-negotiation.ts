type MediaRange = {
  type: string;
  subtype: string;
  quality: number;
  position: number;
};

function parseQuality(value: string | undefined) {
  if (value === undefined) return 1;
  if (!/^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(value)) return 0;
  return Number(value);
}

function parseAccept(value: string | null): MediaRange[] {
  if (!value) return [];

  return value.split(",").flatMap((entry, position) => {
    const [mediaType, ...parameters] = entry.trim().toLowerCase().split(";");
    const [type, subtype] = mediaType.trim().split("/");
    if (!type || !subtype) return [];
    const quality = parseQuality(
      parameters
        .map((parameter) => parameter.trim().split("=", 2))
        .find(([key]) => key === "q")?.[1],
    );
    return [{ type, subtype, quality, position }];
  });
}

function score(range: MediaRange, target: string) {
  const [type, subtype] = target.split("/");
  if (range.type !== "*" && range.type !== type) return null;
  if (range.subtype !== "*" && range.subtype !== subtype) return null;
  return {
    quality: range.quality,
    specificity: Number(range.type !== "*") + Number(range.subtype !== "*"),
    position: range.position,
  };
}

function bestScore(ranges: MediaRange[], target: string) {
  return ranges
    .map((range) => score(range, target))
    .filter((value): value is NonNullable<typeof value> => value !== null)
    .sort(
      (a, b) =>
        b.quality - a.quality || b.specificity - a.specificity || a.position - b.position,
    )[0];
}

/** Returns true only when Markdown is explicitly preferred over HTML. */
export function prefersMarkdown(accept: string | null) {
  const ranges = parseAccept(accept);
  const markdown = bestScore(ranges, "text/markdown");
  if (!markdown || markdown.quality === 0) return false;

  const html = bestScore(ranges, "text/html");
  if (!html || html.quality === 0) return true;
  if (markdown.quality !== html.quality) return markdown.quality > html.quality;
  if (markdown.specificity !== html.specificity) return markdown.specificity > html.specificity;
  return markdown.position < html.position;
}
