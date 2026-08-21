# Getting started

> Install OpenBrowse on a Raspberry Pi or any Debian machine, run your first browser agent, and point an existing browser-use-sdk client at it.

*Source: https://openbrowse.co/docs*

OpenBrowse is a self-hosted replacement for Browser Use Cloud. It serves the same v3 REST API that the `browser-use-sdk` client already speaks, so an existing integration moves across by changing two lines. Almost everything else, retry logic, polling, profile ids and output schemas, stays exactly as it is; the handful of things that do not are listed below.

It was built and benchmarked on a Raspberry Pi 5 with 16GB of RAM, and runs on any Debian or Ubuntu machine, including a VPS. You pay only for LLM tokens; there is no per-task platform fee.

## Before you start

You need a Debian or Ubuntu machine with SSH access, and an API key from Anthropic or OpenAI, or both. Tailscale is optional but is the easiest way to reach the box from outside your network.

## Install

The agent drives a real browser on a virtual X display and streams it over VNC, so those packages have to be there before anything will run. A fresh Raspberry Pi OS image also has no `uv`, so the last line installs it; skip that line if you would rather use pipx or a virtual environment below.

```bash
sudo apt update
sudo apt install -y xvfb x11vnc novnc websockify \
  libnss3 libatk-bridge2.0-0 libdrm2 libxcomposite1 libxdamage1 \
  libxrandr2 libgbm1 libpango-1.0-0 libasound2 libxshmfence1 libgtk-3-0

curl -LsSf https://astral.sh/uv/install.sh | sh
```

Then install OpenBrowse and start it:

```bash
uv tool install openbrowse
openbrowse start
```

`pipx install openbrowse` works the same way if you prefer it. The pip route needs a virtual environment you create and activate first, because Raspberry Pi OS and Debian mark the system Python as externally managed and refuse a bare `pip install`. [Installation](https://openbrowse.co/docs/installation) covers all three.

`openbrowse start` registers it as a systemd service, so it is running now and comes back after every reboot. `openbrowse stop --disable` undoes that, and `openbrowse status` and `openbrowse restart` manage it in between. On a machine without systemd it runs in the foreground instead.

To work on OpenBrowse rather than only run it, clone the repository and run it out of the checkout:

```bash
git clone https://github.com/lujstn/openbrowse.git
cd openbrowse && uv sync
uv run openbrowse serve
```

Open `http://<your-host>:8420`. A fresh install takes you straight to a one-time setup wizard at `/setup`, which walks you through a dashboard password, a model provider key, how much of the machine OpenBrowse may use, and the API bearer key it generates for you, writes `.env`, downloads the browser build up front, and ends by restarting so the whole configuration is live. Once any credential exists the setup routes disappear and the dashboard asks for the password you chose.

That `.env`, and the database and profiles beside it, live in `~/.openbrowse` for an installed copy and in the repository root for a checkout. [Where OpenBrowse keeps its files](https://openbrowse.co/docs/installation#where-openbrowse-keeps-its-files) covers the difference and the variable that overrides it.

Confirm the API is up:

```bash
curl http://<your-host>:8420/health
```

```json
{ "status": "ok" }
```

## Run your first task

Create a session with a task. The API accepts the key either as a bearer token or in the `X-Browser-Use-API-Key` header the SDK sends; both work everywhere.

```bash
curl -X POST http://<your-host>:8420/v3/sessions \
  -H "Authorization: Bearer $OPENBROWSE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Open https://news.ycombinator.com and return the titles of the top five stories.",
    "model": "claude-sonnet-5"
  }'
```

The response carries the session `id` and a `status` of `created`. It does **not** yet carry a `liveUrl`: the instance still has to allocate a virtual display and launch Chromium, which takes a few seconds, and only then does the status become `running` and `liveUrl` get filled in. Poll the session until it reaches a terminal status:

```bash
curl http://<your-host>:8420/v3/sessions/<session-id> \
  -H "Authorization: Bearer $OPENBROWSE_API_KEY"
```

A healthy run looks like this while it is working, then like this when it is done:

```json
{
  "id": "5a2f...",
  "status": "running",
  "liveUrl": "/vnc/5a2f.../view?path=vnc/5a2f.../websockify",
  "output": null
}
```

```json
{
  "id": "5a2f...",
  "status": "stopped",
  "isTaskSuccessful": true,
  "output": { "stories": ["...", "..."] },
  "totalInputTokens": 38911,
  "totalOutputTokens": 2322,
  "totalCostUsd": "0.06",
  "lastStepSummary": "Task completed successfully"
}
```

Three details in there catch people out. `liveUrl` is a path on your own instance, not an absolute URL, and the `?path=` parameter is what points noVNC at the session's socket, so it has to survive whatever you do with it. `output` comes back already parsed when it is valid JSON, so there is nothing to `JSON.parse`. And the cost fields are strings rather than numbers, which is deliberate: they are exact decimal values, not floats.

When `status` is `stopped` (or `idle`, if you set `keepAlive`), the result is in `output`, with `isTaskSuccessful`, token counts and the exact LLM cost alongside it.

If `status` comes back `error`, open the dashboard at `http://<your-host>:8420/` and read that session's step feed. The failure is almost always stated there in plain text, which is faster than working backwards from the API response. The dashboard is also where you watch the live browser view while a run is in progress.

## Point your client at it

```ts
import { BrowserUse } from "browser-use-sdk/v3";

const client = new BrowserUse({
  apiKey: process.env.OPENBROWSE_API_KEY,
  baseUrl: "https://your-host/v3",
});

const session = await client.sessions.create({
  task: "Find every product on this page and return the structured list.",
  model: "claude-sonnet-5",
  outputSchema: mySchema,
});
```

Everything downstream of that survives untouched: retry logic, polling, profile ids, output schemas and cost caps. The instance also understands the cloud's `thinkingLevel` field and maps it onto its own [`reasoningEffort`](https://openbrowse.co/docs/models), so a client that sets a reasoning depth keeps working too.

## What does not carry over

Most of a Browser Use Cloud integration survives the move untouched. A handful of things do not, and one of them will change your results silently rather than erroring, so it is worth five minutes before you migrate anything:

> **Warning:** Browser Use Cloud routes sessions through a managed US residential proxy by default, so the sites your agent visits currently see a residential IP. Here they will see your server. If your jobs touch anything geo-gated, rate-limited by IP, or fussy about datacentre ranges, test that first. Nothing will error; the pages will just come back different.

Alongside the proxy, ten request fields are accepted and then ignored, fourteen of the cloud's model names are rejected outright, omitting `model` gets you a different one than it does on the cloud, and `liveUrl` arrives a few seconds later here than it does there. [Migrating from Browser Use Cloud](https://openbrowse.co/docs/migrating) is the complete list, with what to do about each.

## Where to next

- [Migrating from Browser Use Cloud](https://openbrowse.co/docs/migrating) is the page to read before you move an existing integration.
- [Installation](https://openbrowse.co/docs/installation) covers system packages, the live view, running under systemd, and how updates arrive.
- [The `openbrowse` command](https://openbrowse.co/docs/cli) is the reference for every subcommand.
- [How OpenBrowse works](https://openbrowse.co/docs/concepts) explains the machinery: the step loop, the answer store, and the reviewer.
- [Writing tasks](https://openbrowse.co/docs/tasks) is the highest-leverage page here; prompt shape changes results more than model choice does.
- [Structured output](https://openbrowse.co/docs/structured-output) covers `outputSchema` and the validated answer store.
- [Cost control](https://openbrowse.co/docs/cost) explains what a run costs, and what `maxCostUsd` does on a conversation.
- [Solving CAPTCHAs](https://openbrowse.co/docs/captchas) lists which challenge types are solved, which are only recognised, and what solving costs.
- The complete v3 surface is in the [API reference](https://openbrowse.co/docs/api).
