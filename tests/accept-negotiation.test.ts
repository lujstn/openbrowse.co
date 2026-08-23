import assert from "node:assert/strict";
import test from "node:test";
import { prefersMarkdown } from "../lib/accept-negotiation.ts";

test("defaults to HTML without an explicit Markdown preference", () => {
  for (const accept of [null, "*/*", "text/plain", "text/html, */*"]) {
    assert.equal(prefersMarkdown(accept), false, accept ?? "missing");
  }
});

test("selects Markdown when it is the only acceptable representation", () => {
  assert.equal(prefersMarkdown("text/markdown"), true);
  assert.equal(prefersMarkdown("TEXT/MARKDOWN; charset=utf-8"), true);
});

test("honours quality, specificity and client ordering", () => {
  assert.equal(prefersMarkdown("text/markdown;q=0.9, text/html;q=0.8"), true);
  assert.equal(prefersMarkdown("text/markdown;q=0.8, text/html;q=0.9"), false);
  assert.equal(prefersMarkdown("text/*;q=0.9, text/markdown;q=0.8"), false);
  assert.equal(prefersMarkdown("text/html;q=0.8, text/markdown;q=0.8"), false);
  assert.equal(prefersMarkdown("text/markdown;q=0.8, text/html;q=0.8"), true);
});

test("never chooses explicitly unacceptable or malformed Markdown", () => {
  assert.equal(prefersMarkdown("text/markdown;q=0, text/html"), false);
  assert.equal(prefersMarkdown("text/markdown;q=wat, text/html"), false);
  assert.equal(prefersMarkdown("text/markdown;q=1.2, text/html"), false);
});

test("uses the most specific matching range's quality, not a broad wildcard's", () => {
  assert.equal(prefersMarkdown("text/*;q=0.9, text/markdown;q=0.1, text/html;q=0.1"), true);
  assert.equal(prefersMarkdown("text/markdown;q=0, text/*;q=0.9"), false);
});
