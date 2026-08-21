# Stop Session

> POST /v3/sessions/{session_id}/stop

*Source: https://openbrowse.co/docs/api/v3/sessions/session_id/stop/post*

Cancel a running session and close its browser. The default leaves it stopped; strategy "task" leaves it idle, so a later call can give it new work.

## Request

```bash
curl -X POST "https://your-host/v3/sessions/{session_id}/stop" \
  -H "Authorization: Bearer $OPENBROWSE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Parameters

`session_id`, `x-browser-use-api-key`

## Request body

| Field | Type | Description |
| --- | --- | --- |
| `strategy` | string |  |

## Responses

- `200`: Successful Response
- `422`: Validation Error
