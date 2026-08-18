# Exposing it safely

> Reach your OpenBrowse instance from outside its network using Tailscale, either privately or publicly over TLS, without opening a router port.

*Source: https://openbrowse.co/docs/exposing*

OpenBrowse runs on plain Python and Chromium and listens on a single port, so it port-forwards like anything else. That is rarely what you want. The instance holds your provider API keys and live session cookies for every site your agents log into, so putting it directly on the public internet gives an attacker a high-value target with one bearer token in front of it.

[Tailscale](https://tailscale.com/) is the better default. It gives you two options, and the first is enough for most people.

## Private access from your own devices

```bash
tailscale up
```

Your instance is now reachable from any device on your tailnet, at a stable hostname, with no port opened on your router and nothing exposed publicly.

Point your client at the tailnet hostname:

```ts
const client = new BrowserUse({
  apiKey: process.env.OPENBROWSE_API_KEY,
  baseUrl: "https://your-pi.tail0a1b2c.ts.net/v3",
});
```

Find the hostname with `tailscale status`.

## Public access over TLS

If the calling application does not live on your tailnet, for example a CI job or a hosted backend, Tailscale Funnel publishes the instance on the public internet over HTTPS with a certificate handled for you.

```bash
sudo tailscale funnel --bg 8420
```

`--bg` runs it as a background daemon managed by Tailscale, so it survives reboots without a separate systemd unit.

```bash
tailscale funnel status
curl https://your-pi.tail0a1b2c.ts.net/health
```

Turn it off again with:

```bash
sudo tailscale funnel --bg off
```

> **Warning:** Funnel makes the instance publicly reachable. The only thing between the internet and your agents is `API_KEY`, so make it long and random, rotate it if it ever appears in a log or a shell history, and prefer private tailnet access whenever the caller can reach it.

## What the server does on its own

Failed authentication attempts are throttled per client IP, and a throttled request comes back as `429` with a `Retry-After` header saying how long to wait: the first five failures are free, then each further failure doubles a lockout interval, starting at one second and capped at fifteen minutes, until a successful authentication clears the record. The throttle honours `X-Forwarded-For`, so it identifies real visitors correctly behind Funnel or a reverse proxy. It covers the API, the dashboard, and the VNC websocket handshake alike, and its state is in memory, resetting on restart.

This blunts online guessing; it does not substitute for a strong key.

## Hardening

- **Generate `API_KEY` with a CSPRNG.** `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`. Do not reuse a key from anywhere else.
- **Set `DASHBOARD_PASSWORD` explicitly.** It defaults to `API_KEY`, which means anyone who has the API token also has the dashboard, including the live browser view of every session.
- **Never set `ALLOW_INSECURE_NO_AUTH` on an exposed instance.** It exists for local development only and disables every check described above.
- **Cap spending.** Every session accepts `maxCostUsd`, and `CLOUD_MAX_COST_FACTOR` scales incoming caps down if your callers were written against hosted pricing. See [cost control](https://openbrowse.co/docs/cost).
- **Keep `data/` off backups you do not control.** It contains cookie jars that are live credentials for the sites your profiles are logged into.
- **Prefer HTTPS.** Funnel is HTTPS only. If you terminate TLS yourself, do not fall back to plain HTTP for convenience; the bearer token travels on every request.

## Next

[Profiles](https://openbrowse.co/docs/profiles) covers keeping agents logged in, including importing existing Browser Use Cloud profiles.
