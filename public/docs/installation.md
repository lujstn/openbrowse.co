# Installation

> Full installation of OpenBrowse on Debian or Ubuntu, including the virtual display behind the live view, configuration, and running it under systemd.

*Source: https://openbrowse.co/docs/installation*

The quick start on the [getting started](https://openbrowse.co/docs) page is enough to try OpenBrowse. This page covers the full install: the system packages behind the live browser view, every configuration variable the application actually reads, and running it as a service that survives reboots.

## What you need

A Debian or Ubuntu machine with SSH access. OpenBrowse was built and benchmarked on a Raspberry Pi 5 with 16GB of RAM, and runs on any comparable VPS.

Budget roughly **2GB of RAM and one CPU core per concurrent session**. Chromium itself accounts for 400 to 600MB of that; the rest covers the pages it loads, the virtual display it draws into, and the Python process. Concurrency is bounded by memory rather than by anything in the application.

You also need an API key from [Anthropic](https://console.anthropic.com/), [OpenAI](https://platform.openai.com/api-keys), or both.

## System packages

The live view works by running Chromium against a virtual X display and streaming it over VNC, so three separate pieces have to be present: the display (`Xvfb`), the VNC server (`x11vnc`), and the websocket bridge (`websockify` with the noVNC assets) that your browser connects to. Each session gets its own trio, allocated when the session starts and released when it ends.

```bash
sudo apt update && sudo apt upgrade -y

sudo apt install -y xvfb x11vnc novnc websockify
sudo apt install -y python3-venv python3-pip
```

Chromium needs its own set of shared libraries. Installing these up front avoids a launch failure that otherwise only appears when you start your first session:

```bash
sudo apt install -y \
  libnss3 libatk-bridge2.0-0 libdrm2 libxcomposite1 libxdamage1 \
  libxrandr2 libgbm1 libpango-1.0-0 libasound2 libxshmfence1 libgtk-3-0
```

## Install OpenBrowse

```bash
cd ~
git clone https://github.com/lujstn/openbrowse.git
cd openbrowse
```

With `uv`:

```bash
uv sync
```

Or with a plain virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## The browser binary

OpenBrowse does not drive the Chromium from `apt`. It drives a stealth-configured build supplied by **CloakBrowser**, the library that provides the patched binary, and that binary is downloaded the first time a session launches rather than during installation.

That download takes several minutes on a Raspberry Pi, during which the session sits at `running` with a blank live view and nothing in the feed. It looks exactly like a broken VNC stack, and it is not. Fetch it once, up front, and the whole failure mode disappears:

```bash
uv run python -c "import cloakbrowser; print(cloakbrowser.ensure_binary())"
```

The command prints the path to the binary and exits. Every later session starts in seconds.

## Configuration

The simplest path is to start the server and let it configure itself. An unconfigured instance serves a one-time setup screen at `/setup` that generates your API bearer key, collects your provider keys, sets a dashboard password and a concurrency limit, and writes `.env` for you. The screen refuses to overwrite a non-empty `.env`, and once any credential exists it redirects to the dashboard, so a configured instance never exposes it.

> Configuration is read once at startup, so after the setup screen writes `.env` you must restart the server for it to take effect. The setup page says the same thing when it finishes.

To configure by hand instead, create `.env` in the repository root. These are the variables OpenBrowse itself reads. The browser layer also honours the `CLOAKBROWSER_*` overrides its own library defines, and `BROWSER_USE_ACTION_TIMEOUT_S` is set by the application at startup rather than read from your environment:

| Variable | Description |
| --- | --- |
| `API_KEY` | Bearer token authenticating API requests. Required; without it every API call returns 401 |
| `ANTHROPIC_API_KEY` | Anthropic key, for `claude-*` models |
| `OPENAI_API_KEY` | Optional. OpenAI key, for `gpt-*` models |
| `CAPSOLVER_API_KEY` | Optional. [CapSolver](https://capsolver.com/) key for CAPTCHA solving. Without it the CAPTCHA tool is simply not registered |
| `CAPTCHA_MAX_COST_USD` | Optional. Ceiling on what one **run** may spend on CAPTCHA solving in total, default `0.03`. Once a run's solves have reached it, further solves are refused rather than attempted. Each solve's real cost is added to the session total |
| `DASHBOARD_USER` | Optional. Dashboard username, default `admin` |
| `DASHBOARD_PASSWORD` | Optional. Dashboard password. Defaults to `API_KEY` |
| `MAX_CONCURRENT_SESSIONS` | Optional. Concurrent sessions, default 1. Budget roughly 2GB RAM and one core each. Over the cap a session is accepted and queued rather than refused, and the create call returns straight away |
| `KEEP_ALIVE_IDLE_TIMEOUT` | Optional. Seconds a finished `keepAlive` session waits, browser still open, for its next follow-up before closing itself. Default `600`; `0` parks indefinitely, until the session is stopped or its display slot is claimed by a new one |
| `CHROME_LIGHT_FLAGS` | Optional. Set to `1` to start every browser in the lighter profile described under [sizing it for your machine](#sizing-it-for-your-machine). Default off |
| `CLOUD_MAX_COST_FACTOR` | Optional. Scales an incoming `maxCostUsd` to local cost, for callers whose budgets were priced for a hosted service. Above 0 and at most 1; `0.5` turns a `$6` cap into `$3`. Default `1.0`. An out-of-range value stops the server at startup with a clear error |
| `ALLOW_INSECURE_NO_AUTH` | Optional. Set to `1` to run without any authentication. Development only; never expose an instance configured this way |

Generate a strong `API_KEY`:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Treat `.env` as secret. So is everything under `data/`, which holds the SQLite database (`data/browser_use.db`), profile cookie jars (`data/profiles/`), and screenshots. Profile jars are live credentials for every site your profiles are logged into.

## Verify

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8420
```

You should see:

```
2026-08-18 09:14:02,881 [INFO] app.main: Initializing database...
2026-08-18 09:14:03,140 [INFO] app.main: Server ready on 0.0.0.0:8420
INFO:     Application startup complete.
```

The timestamped lines are the application's own; the bare `INFO:` prefix is uvicorn's. Note that `Server ready on` reports the host and port from your configuration, so if you passed `--port` on the command line this line still shows the configured default while the server listens on the port you asked for.

Check the API is answering:

```bash
curl http://<your-host>:8420/health
```

```json
{ "status": "ok" }
```

`/health` is unauthenticated. `/health/details` requires the API key and additionally reports how many sessions are running right now. Then open `http://<your-host>:8420/` for the dashboard, which signs in with `DASHBOARD_USER` and `DASHBOARD_PASSWORD` over HTTP Basic auth.

## Run it as a service

Running under systemd means it restarts on failure and comes back after a reboot.

```bash
sudo nano /etc/systemd/system/openbrowse.service
```

```ini
[Unit]
Description=OpenBrowse
After=network.target tailscaled.service
Wants=tailscaled.service

[Service]
Type=simple
User=<user>
WorkingDirectory=/home/<user>/openbrowse
EnvironmentFile=/home/<user>/openbrowse/.env
ExecStart=/home/<user>/openbrowse/.venv/bin/python -m app.main
ExecStartPost=+/usr/bin/tailscale funnel --bg 8420
ExecStopPost=-+/usr/bin/tailscale funnel --bg off
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

The two `tailscale` lines bring the public tunnel up and down with the service. Remove them to keep the instance on your local network only. See [exposing it safely](https://openbrowse.co/docs/exposing).

```bash
sudo systemctl daemon-reload
sudo systemctl enable openbrowse
sudo systemctl start openbrowse
sudo systemctl status openbrowse
```

Follow the logs with `journalctl -u openbrowse -f`.

If the server is killed mid-run, sessions that were executing are marked as errored with the note `Interrupted by server restart` at the next startup, so nothing is ever left claiming to run forever.

## Sizing it for your machine

Concurrency that suits a Raspberry Pi strands a sixteen-core VPS, and the reverse thrashes the Pi, so the setup screen reads the machine before it asks you anything: cores, total and available memory, current load, whether the kernel exposes pressure stall information, whether this is a Raspberry Pi, whether systemd is in charge, whether the cgroup memory controller is available, whether the root filesystem is on an SD card, and whether the capacity drop-in below has already been written. The last three drive checklist rows rather than the slider. You then choose how much of the device OpenBrowse may have, and a slider recommends a session count bounded by what the hardware can hold.

| Share | Meaning | Fraction of memory |
| --- | --- | --- |
| All of it | The machine's only job | 90% |
| Most of it | A machine that also does something else occasionally | 70% |
| A fair share | A machine with another real job | 40% |

The same card is in Settings, so you can retune later without reinstalling, and a checklist alongside it shows which host-level steps are done and which remain. Probing degrades to a safe default anywhere it cannot read the machine, and nothing is recommended off a guess.

> The slider stops at **8 sessions** however large the machine is, and the recommendation drops by one on a host already running above 0.5 of load per core. Both are bounds on the *recommendation*, not on the software: `MAX_CONCURRENT_SESSIONS` set by hand in `.env` is not clamped, so a large VPS can go past 8 if you have the memory for it.

### The host-level half

Two of those steps are outside the application: systemd does not know OpenBrowse should win a contended CPU, and on a Raspberry Pi the kernel ships with pressure stall information compiled out. `scripts/host_tune.sh` applies both in one idempotent command:

```bash
sudo bash scripts/host_tune.sh --share most --dry-run   # show the plan
sudo bash scripts/host_tune.sh --share most             # apply it
```

It writes a systemd drop-in that weights the service's CPU share and caps its memory at the fraction you chose, appends the `psi=1` boot flag where PSI is missing and this is a Pi, and adds a sudoers entry so the dashboard's one-click tuning button works without a password. Every action prints what it did, repeats are skipped rather than rewritten, and `--dry-run` touches nothing. The memory cap applies from the next service restart; the PSI flag needs a reboot.

The drop-in is written under `openbrowse.service.d`, matching the unit name the application itself restarts by. If you run OpenBrowse under a differently-named unit, pass `--service <name>` so the two agree; otherwise the dashboard will keep reporting the tuning as still to do.

> PSI matters because load average counts runnable processes, which mistakes a healthy burst of tabs for trouble and misses real starvation behind modest numbers. Where PSI is available, OpenBrowse instead measures the fraction of time runnable work sat waiting for a CPU, which is the thing that actually hurts. Hosts without it fall back to per-core load, and the telemetry names which signal it used.

### The lighter browser profile

`CHROME_LIGHT_FLAGS=1` starts every browser without a GPU process, with renderer processes capped at four, a 256MB JavaScript heap per renderer, Chromium's low-end device mode, and no background networking. On hardware with no real GPU, drawing into a virtual display, those are close to free, and they lower the memory floor of every session.

Setup pre-selects it where it earns its keep, meaning a Raspberry Pi, four cores or fewer, or 8GB of memory or less, and leaves it alone on a large host. It stays a checkbox either way.

Site isolation is deliberately left intact. Collapsing it would save more memory again, and it would also break reading pages inside cross-origin frames, which is precisely the case the benchmark task exists to prove. The one trade-off to watch is the JavaScript heap: if a single heavy site misbehaves only with the profile on, that 256MB ceiling is the first thing to suspect.

## Next

Point a client at it from [getting started](https://openbrowse.co/docs), understand what actually happens during a run in [how OpenBrowse works](https://openbrowse.co/docs/concepts), or read the [v3 API reference](https://openbrowse.co/docs/api).
