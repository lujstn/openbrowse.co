# Update Profile

> PUT /v3/profiles/{profile_id}

*Source: https://openbrowse.co/docs/api/v3/profiles/profile_id/put*



## Request

```bash
curl -X PUT "https://your-host/v3/profiles/{profile_id}" \
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
- `422`: Validation Error
