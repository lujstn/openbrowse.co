# Put Storage State

> PUT /v3/profiles/{profile_id}/storage-state

*Source: https://openbrowse.co/docs/api/v3/profiles/profile_id/storage-state/put*

Import a cookie jar into a profile, creating the profile if it does not exist yet.

## Request

```bash
curl -X PUT "https://your-host/v3/profiles/{profile_id}/storage-state" \
  -H "Authorization: Bearer $OPENBROWSE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Parameters

`profile_id`, `x-browser-use-api-key`

## Request body

| Field | Type | Description |
| --- | --- | --- |
| `cookies` | array |  |
| `origins` | array |  |

## Responses

- `200`: Successful Response
- `400`: Invalid storage state.
- `401`: Authentication failed.
- `422`: Request validation failed.
- `429`: Authentication attempts are rate limited.
