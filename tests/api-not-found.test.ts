import assert from "node:assert/strict";
import test from "node:test";
import { GET, HEAD } from "../app/api/[...path]/route.ts";

test("unknown API paths return a structured JSON error envelope", async () => {
  const response = GET(new Request("https://openbrowse.co/api/does-not-exist"));
  assert.equal(response.status, 404);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  const body = await response.json();
  assert.deepEqual(Object.keys(body).sort(), ["code", "detail", "message", "resolution"]);
  assert.equal(body.code, "API_ENDPOINT_NOT_FOUND");
});

test("HEAD matches the other verbs and carries no misleading Allow header", () => {
  const response = HEAD(new Request("https://openbrowse.co/api/does-not-exist", { method: "HEAD" }));
  assert.equal(response.status, 404);
  assert.equal(response.headers.get("allow"), null);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
});
