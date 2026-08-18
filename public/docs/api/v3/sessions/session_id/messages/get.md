# List Messages

> GET /v3/sessions/{session_id}/messages

*Source: https://openbrowse.co/docs/api/v3/sessions/session_id/messages/get*



## Request

```bash
curl -X GET "https://your-host/v3/sessions/{session_id}/messages" \
  -H "Authorization: Bearer $OPENBROWSE_API_KEY"
```

## Parameters

`session_id`, `after`, `before`, `limit`, `x-browser-use-api-key`

## Responses

- `200`: Successful Response
- `422`: Validation Error
