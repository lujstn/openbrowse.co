# Update Profile

> PATCH /v3/profiles/{profile_id}

*Source: https://openbrowse.co/docs/api/v3/profiles/profile_id/patch*

Update a profile's editable fields. PUT and PATCH behave identically here: both apply only the fields present in the request body.

## Request

```bash
curl -X PATCH "https://your-host/v3/profiles/{profile_id}" \
  -H "Authorization: Bearer $OPENBROWSE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Parameters

`profile_id`, `x-browser-use-api-key`

## Request body

| Field | Type | Description |
| --- | --- | --- |
| `name` | string |  |
| `userId` | string |  |

## Responses

- `200`: Successful Response
- `401`: Authentication failed.
- `404`: Requested resource was not found.
- `422`: Request validation failed.
- `429`: Authentication attempts are rate limited.
