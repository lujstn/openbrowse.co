import assert from "node:assert/strict";
import test from "node:test";
import { canonicalPathFor } from "../lib/markdown-path.ts";

test("maps the home markdown alias back to the site root", () => {
  assert.equal(canonicalPathFor("/index"), "/");
  assert.equal(canonicalPathFor("/index/"), "/");
});

test("leaves real paths intact and strips a trailing slash", () => {
  assert.equal(canonicalPathFor("/"), "/");
  assert.equal(canonicalPathFor("/about"), "/about");
  assert.equal(canonicalPathFor("/docs/authentication"), "/docs/authentication");
  assert.equal(canonicalPathFor("/docs/authentication/"), "/docs/authentication");
});
