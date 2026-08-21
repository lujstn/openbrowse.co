// @nonobvious(must-hold) a literal "</script>" anywhere in the serialised data would close this tag early
// and spill the remainder into the document as markup; escaping the angle bracket is inert inside JSON and
// is what stops a future FAQ answer or page description from breaking the page it is describing
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
