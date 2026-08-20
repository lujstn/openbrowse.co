# Troubleshooting

> Fixes for the failures that actually happen: Chromium not launching, a blank VNC view, authentication errors, sessions stopping early, and running out of memory.

*Source: https://openbrowse.co/docs/troubleshooting*

The [live view](https://openbrowse.co/docs/live-view) page covers reading the step feed, which diagnoses most failed runs directly. This page covers the rest: the server, the display stack, and the API's error responses.

## Chromium will not start

**Symptom:** sessions fail immediately with a Chromium launch error.

Almost always a missing shared library. Install the full dependency set:

```bash
playwright install-deps
```

Then check that the browser binary actually resolves:

```bash
python3 -c "import cloakbrowser; print(cloakbrowser.ensure_binary())"
```

If the path it prints does not exist, reinstall:

```bash
pip install --force-reinstall cloakbrowser
```

## The live view is blank

**Symptom:** the browser panel in the dashboard loads but shows nothing.

First, give it a moment. Only the virtual display starts with the session; the VNC server and the websocket bridge spawn on your first request to view it, so the first frame of a view you have just opened arrives a beat after the panel does.

If it stays blank, the live view needs three separate processes per session: a virtual display, a VNC server, and a websocket bridge. Confirm all three are installed and on `$PATH`:

```bash
which Xvfb x11vnc websockify
```

Install anything missing:

```bash
sudo apt install -y xvfb x11vnc novnc websockify
```

Then check they started cleanly:

```bash
journalctl -u openbrowse -n 50
```

## Authentication errors

**`401` with `Server authentication is not configured`:** the instance has no `API_KEY`. Set one in `.env` (or run the `/setup` screen on a fresh install) and restart.

**`401` with `Invalid API key`:** the key does not match. The server accepts it either as `Authorization: Bearer <key>` or in the `X-Browser-Use-API-Key` header; check which one your client sends and that no proxy strips it.

**Requests suddenly rejected after repeated failures, with a `429` and a `Retry-After` header:** failed attempts are throttled per client IP with a doubling lockout (five free failures, then 1s doubling up to 15 minutes). Wait, or restart the server to clear the in-memory state, then fix the key rather than retrying it.

**Dashboard returns `503` telling you to open `/setup`:** the instance has neither a dashboard password nor an API key; it is unconfigured.

## The API refuses my request

**`422` with `Session is running, not idle`:** you sent a follow-up task (`sessionId` set) to a session that has not finished. Poll until it is `idle`, or stop it first with strategy `task`. A `keepAlive` session is exempt from the status rule, because it is a conversation rather than a one-shot run, but it is still refused while it is genuinely mid-task.

**`422` with `Task is required when targeting an existing session`:** a follow-up request must carry a `task`.

**`422` naming `reasoningEffort`:** the value is not valid for that model; the error lists the accepted set. The per-model table is in [choosing a model](https://openbrowse.co/docs/models). The same applies to the retired `thinkingEffort` and `modelThinkingEffort` fields, and to sending both `thinkingLevel` and `reasoningEffort` at once.

**`'x' is not a valid model`:** the model name is not in the supported list, also in [choosing a model](https://openbrowse.co/docs/models).

**A session goes straight to `error` with `Profile is in use by running session <id>`:** two runs cannot hold the same browser profile at once. The claim is taken inside the run rather than at request time, so the second session is accepted and reaches `running` before it fails. Wait for the holder to finish, or give the second run its own profile.

**Session errors at launch with `needs OPENAI_API_KEY` (or `ANTHROPIC_API_KEY`):** the model's provider key is missing from `.env`.

## A session stopped before finishing

Read `failureKind` on the session first. It says in one word whether the failure was yours, the site's, or the model provider's, which decides whether retrying the identical request is worth anything:

| `failureKind` | Retrying the same request |
| --- | --- |
| `provider_rate_limit`, `provider_server_error`, `provider_connection_error`, `provider_timeout` | Worth it. Nothing about your task or the site caused this; `failureStatusCode` carries the provider's status |
| `session_timeout` | Only on a quieter host, or with a tighter task |
| `budget_exceeded` | Only with a higher cap; see [cost control](https://openbrowse.co/docs/cost) |
| `invalid_output` | Not as-is. The model's reply was truncated or unusable; a simpler schema usually fixes it |
| `agent_failure` | Not as-is. Either the agent gave up, or the run never started at all: a missing provider key lands here too, before a single step runs. Read the feed to tell which |
| null, on a session that failed | Not classified. A server restart or a profile another session already holds fails outside the classified path; `lastStepSummary` and the feed are the source of truth |

`failureKind` is not the verdict on its own. A run stopped by its cost cap that salvaged a complete, valid answer store is recorded successful and still carries `budget_exceeded`, so read `isTaskSuccessful` alongside it.

Then check the last feed entry, or the `lastStepSummary` on the session. All four below reach `lastStepSummary`; the cost stop and the step timeout are additionally written into the feed as rows, so you will see those either way:

- **`Stopped: Cost $X exceeded budget $Y`:** the `maxCostUsd` cap fired. Whatever the answer store held at that point is preserved in `output`, and the run is recorded a success only if that output validates and passes the completeness gate, so a partial result is visible rather than lost. The session goes `stopped`, or `idle` if it was created with `keepAlive`. Raise the cap, or reduce spend; see [cost control](https://openbrowse.co/docs/cost).
- **`Interrupted by server restart`:** the server went down mid-run. The session is marked `error` at the next startup because it can never resume; run the task again.
- **Status `expired`:** the session was created without a task and never given one; task-less `created` sessions are expired after 15 minutes. Create a new one.
- **`Step timed out and was cancelled before completing`:** one step exceeded the 520-second ceiling; the run continues past it, but repeated timeouts usually mean the host is overloaded.

## Out of memory

**Symptom:** sessions are killed mid-task, the machine becomes unresponsive, or the OOM killer fires.

Each Chromium instance uses roughly 400 to 600MB. Budget 2GB per concurrent session to leave room for the pages it loads, the virtual display and the Python process, so concurrency is bounded by RAM rather than by anything in the application.

```bash
free -h
dmesg | grep -i oom
```

Reduce concurrency in `.env` and restart:

```bash
MAX_CONCURRENT_SESSIONS=1
```

The default is 1; if sessions are being killed at that setting, something else on the box is taking the memory.

Before reaching for swap, try the lighter browser profile, which lowers the per-session memory floor and is close to free on a machine with no real GPU:

```bash
CHROME_LIGHT_FLAGS=1
```

`sudo bash scripts/host_tune.sh --share most` additionally caps the service's memory through systemd, so a runaway session is bounded rather than taking the machine down with it. Both are covered under [sizing it for your machine](https://openbrowse.co/docs/installation#sizing-it-for-your-machine).

If you would rather trade speed for headroom, add swap:

```bash
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile   # set CONF_SWAPSIZE=4096
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

Swap on an SD card is slow and will wear it. On a Raspberry Pi, prefer an SSD or lower concurrency.

Related: the server samples host CPU pressure and posts a `system` warning into a run's feed when it launches under saturation, because an overloaded host misses the timing windows in which embedded panels attach. If a run's failures coincide with that warning, re-run when the box is quiet before concluding the site changed. Where the kernel exposes pressure stall information that reading is stall time rather than load average, which is markedly the better signal; on a Raspberry Pi PSI is compiled out by default and `host_tune.sh` adds the boot flag that enables it.

## Tailscale Funnel is not answering

**Symptom:** the public HTTPS URL returns a connection error or a 502.

Check the funnel is actually up:

```bash
tailscale funnel status
```

If that is empty, bring it back:

```bash
sudo tailscale funnel --bg 8420
```

Confirm the server is listening on the port the funnel points at:

```bash
ss -tlnp | grep 8420
```

And check the obvious one: Funnel is HTTPS only. An `http://` URL will not work.

## An extraction returned fewer records than the page shows

This is usually correct behaviour rather than a bug. Values without on-page evidence are refused at the answer-store boundary, and a field the source genuinely never displays is settled as absent instead of guessed, with the reason recorded in the feed; see [structured output](https://openbrowse.co/docs/structured-output).

If you are confident the data is on the page, the usual causes, in order:

- **The listing is inside a cross-origin iframe that never attached.** This is handled automatically, but check the feed for a `find_links` entry reporting `0 link(s) matched` or a frame filter matching 0 frames, and for `read_pages` shell-read retries that did not recover.
- **The content is behind unusual lazy loading.** The link collector scrolls until the count is stable, but a page with a non-scroll loading trigger (a button, a filter) may need the prompt to say so explicitly.
- **The prompt did not state a completion target.** If the page shows a total, say so: "keep going until your count matches the displayed total" is a materially better instruction than "get all of them". See [writing tasks](https://openbrowse.co/docs/tasks).

Export the run (`full` scope) from the dashboard when you want to attach it to an issue; it contains every action, error and reviewer note.
