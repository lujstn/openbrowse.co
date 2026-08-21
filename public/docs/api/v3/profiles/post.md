# Create Profile

> POST /v3/profiles

*Source: https://openbrowse.co/docs/api/v3/profiles/post*

Create an empty profile, with no cookies and no per-origin storage yet. Fill it by importing a cookie jar, or by letting a session log in while using it.

## Request

```bash
curl -X POST "https://your-host/v3/profiles" \
  -H "Authorization: Bearer $OPENBROWSE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Parameters

`x-browser-use-api-key`

## Request body

| Field | Type | Description |
| --- | --- | --- |
| `name` | string |  |
| `userId` | string |  |

## Responses

- `201`: Successful Response
- `422`: Validation Error
