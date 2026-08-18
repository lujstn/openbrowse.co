# Profiles

> Keep agents logged in across sessions, and import your existing Browser Use Cloud profiles so profileId references keep working unchanged.

*Source: https://openbrowse.co/docs/profiles*

A profile is a persistent browser storage jar: cookies plus `localStorage` and `sessionStorage` per origin, held on disk in [Playwright storage-state format](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state). Attach one to a session and the agent starts already logged in to whatever that profile was logged in to, instead of hitting a sign-in wall on every run.

Profiles are the difference between an agent that can read a public listing and one that can work inside an authenticated application.

## Create a profile

```bash
curl -X POST https://your-host/v3/profiles \
  -H "Authorization: Bearer $OPENBROWSE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "my-profile"}'
```

The response carries the profile `id`; pass it as `profileId` when you create a session. A new profile starts with an empty jar, which the first authenticated session fills.

List what exists:

```bash
curl https://your-host/v3/profiles \
  -H "Authorization: Bearer $OPENBROWSE_API_KEY"
```

Each profile in the response includes its `cookieDomains`, the domains the jar currently holds cookies for, and `lastUsedAt`, which updates whenever a session loads the profile. Rename with `PATCH /v3/profiles/{id}`, delete with `DELETE /v3/profiles/{id}` (which also removes the jar from disk).

## Import from Browser Use Cloud

A cloud profile export is the same storage-state shape, cookies plus per-origin `localStorage`, so it imports directly. Import one and **the local profile id matches the cloud id**, so every `profileId` already in your code keeps working.

The import CLI is the recommended route. It creates the profile if it does not exist, normalises the cookies, and backs up any existing jar to `.import-bak`:

```bash
.venv/bin/python -m scripts.import_profiles personal_profile.storage_state.json \
  --profile-id <cloud-profile-id> --name "Personal Profile"
```

A bundle (a JSON list of profile entries, or `{"profiles": [...]}` wrapping one) carries an id per entry, so one command imports many:

```bash
.venv/bin/python -m scripts.import_profiles bundle.json
```

The same thing over the API, which is what the dashboard importer calls. This endpoint also creates the profile if the id does not exist yet:

```bash
curl -X PUT https://your-host/v3/profiles/<profile-id>/storage-state \
  -H "Authorization: Bearer $OPENBROWSE_API_KEY" \
  -H "Content-Type: application/json" \
  --data @personal_profile.storage_state.json
```

Verify with `GET /v3/profiles/<id>`, or the **Profiles** page in the dashboard, which lists the imported `cookieDomains`.

## The storage state format

```json
{
  "cookies": [
    {
      "name": "session",
      "value": "...",
      "domain": "example.com",
      "path": "/",
      "expires": 1999999999,
      "httpOnly": true,
      "secure": true,
      "sameSite": "Lax"
    }
  ],
  "origins": []
}
```

`origins` carries each origin's `localStorage` and `sessionStorage`, which the browser restores on load. When a session ends, the full storage state is written back to the same file, so cookies acquired or refreshed during the run persist, with `localStorage` preserved. The write-back is locked per profile and shielded against shutdown, so two sessions ending at once, or a restart mid-save, cannot truncate a jar.

> **Warning:** These files are live session credentials. Anyone holding one is logged in as you on every site it covers. Never commit them; `data/` is git-ignored for this reason. Treat a profile export with the same care as a password manager export.

## Using a profile

```ts
const session = await client.sessions.create({
  task: "Open the billing page and return every invoice as structured data.",
  model: "claude-sonnet-5",
  profileId: "<profile-id>",
  outputSchema: mySchema,
});
```

For credentials the agent must type rather than carry as cookies, use `sensitiveData` alongside the profile; see [writing tasks](https://openbrowse.co/docs/tasks).

## Next

[Choosing a model](https://openbrowse.co/docs/models) covers which model and reasoning effort to pair with the work, and [troubleshooting](https://openbrowse.co/docs/troubleshooting) covers what to do when a session fails.
