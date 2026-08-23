import assert from "node:assert/strict";
import test from "node:test";
import { isAllowedMcpHost, isAllowedMcpRequest } from "../lib/mcp-security.ts";

function request(url: string, headers?: HeadersInit) {
  return new Request(url, { headers });
}

test("allows the production endpoint over HTTPS", () => {
  assert.equal(isAllowedMcpRequest(request("https://openbrowse.co/mcp")), true);
  assert.equal(
    isAllowedMcpRequest(request("https://openbrowse.co/mcp", { origin: "https://www.openbrowse.co" })),
    true,
  );
});

test("rejects DNS rebinding and insecure production traffic", () => {
  assert.equal(isAllowedMcpRequest(request("https://openbrowse.co/mcp", { host: "internal.example" })), false);
  assert.equal(isAllowedMcpRequest(request("http://openbrowse.co/mcp")), false);
  assert.equal(isAllowedMcpRequest(request("https://openbrowse.co/mcp", { origin: "https://evil.example" })), false);
});

test("permits local HTTP development only for a local origin", () => {
  assert.equal(isAllowedMcpRequest(request("http://localhost:3000/mcp")), true);
  assert.equal(
    isAllowedMcpRequest(request("http://localhost:3000/mcp", { origin: "http://localhost:3001" })),
    true,
  );
  assert.equal(
    isAllowedMcpRequest(request("http://localhost:3000/mcp", { origin: "https://localhost:3001" })),
    false,
  );
});

test("host validation admits any origin but still blocks DNS rebinding and insecure hosts", () => {
  assert.equal(
    isAllowedMcpHost(request("https://openbrowse.co/mcp/server-card", { origin: "https://claude.ai" })),
    true,
  );
  assert.equal(isAllowedMcpHost(request("https://evil.example/mcp/server-card", { host: "evil.example" })), false);
  assert.equal(isAllowedMcpHost(request("http://openbrowse.co/mcp/server-card")), false);
});

test("allows only the configured Vercel preview hostname over HTTPS", () => {
  const original = process.env.VERCEL_URL;
  process.env.VERCEL_URL = "openbrowse-git-mcp-vercel.app";
  try {
    assert.equal(isAllowedMcpRequest(request("https://openbrowse-git-mcp-vercel.app/mcp")), true);
    assert.equal(isAllowedMcpRequest(request("https://other-vercel.app/mcp")), false);
  } finally {
    if (original === undefined) delete process.env.VERCEL_URL;
    else process.env.VERCEL_URL = original;
  }
});
