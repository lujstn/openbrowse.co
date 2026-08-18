# v3 API reference

> Every endpoint in the OpenBrowse v3 REST API, the same surface the browser-use-sdk client already speaks, generated from the running application's OpenAPI schema.

*Source: https://openbrowse.co/docs/api*

OpenBrowse serves the same v3 REST surface as Browser Use Cloud, so an existing `browser-use-sdk` client works against it once you change `baseUrl` and `apiKey`. These 13 operations are generated directly from the application's own OpenAPI schema, so they cannot drift from what your instance actually serves.

## Base URL and authentication

Every request goes to your own instance, under `/v3`, and carries your bearer token:

```bash
curl https://your-host/v3/sessions \
  -H "Authorization: Bearer $OPENBROWSE_API_KEY"
```

The token is the `API_KEY` value written to `.env` during [installation](https://openbrowse.co/docs/installation). There is no separate account system and no per-task billing: your instance answers to whoever holds that token, which is why [exposing it safely](https://openbrowse.co/docs/exposing) matters.

## Profiles

A profile is a persistent browser storage jar, cookies plus localStorage per origin. Attach one to a session and the agent starts already signed in.

| Operation | Method | Path |
| --- | --- | --- |
| [List Profiles](https://openbrowse.co/docs/api/v3/profiles/get) | `GET` | `/v3/profiles` |
| [Create Profile](https://openbrowse.co/docs/api/v3/profiles/post) | `POST` | `/v3/profiles` |
| [Get Profile](https://openbrowse.co/docs/api/v3/profiles/profile_id/get) | `GET` | `/v3/profiles/{profile_id}` |
| [Update Profile](https://openbrowse.co/docs/api/v3/profiles/profile_id/put) | `PUT` | `/v3/profiles/{profile_id}` |
| [Update Profile](https://openbrowse.co/docs/api/v3/profiles/profile_id/patch) | `PATCH` | `/v3/profiles/{profile_id}` |
| [Delete Profile](https://openbrowse.co/docs/api/v3/profiles/profile_id/delete) | `DELETE` | `/v3/profiles/{profile_id}` |
| [Put Storage State](https://openbrowse.co/docs/api/v3/profiles/profile_id/storage-state/put) | `PUT` | `/v3/profiles/{profile_id}/storage-state` |

## Sessions

A session is one agent run. Create one with a task, a model and an output schema, then poll it or read its message stream while it works.

| Operation | Method | Path |
| --- | --- | --- |
| [List Sessions](https://openbrowse.co/docs/api/v3/sessions/get) | `GET` | `/v3/sessions` |
| [Create Session](https://openbrowse.co/docs/api/v3/sessions/post) | `POST` | `/v3/sessions` |
| [Get Session](https://openbrowse.co/docs/api/v3/sessions/session_id/get) | `GET` | `/v3/sessions/{session_id}` |
| [Delete Session](https://openbrowse.co/docs/api/v3/sessions/session_id/delete) | `DELETE` | `/v3/sessions/{session_id}` |
| [List Messages](https://openbrowse.co/docs/api/v3/sessions/session_id/messages/get) | `GET` | `/v3/sessions/{session_id}/messages` |
| [Stop Session](https://openbrowse.co/docs/api/v3/sessions/session_id/stop/post) | `POST` | `/v3/sessions/{session_id}/stop` |

## Errors

Validation failures return `422` with a body describing which field failed and why. Anything that would exceed a session's `maxCostUsd` cap stops the run rather than continuing to spend.
