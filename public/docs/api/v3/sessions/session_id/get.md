# Get Session

> GET /v3/sessions/{session_id}

*Source: https://openbrowse.co/docs/api/v3/sessions/session_id/get*

Fetch one session by id, with its status, step count, live view URL and structured output as they stand right now.

## Request

```bash
curl -X GET "https://your-host/v3/sessions/{session_id}" \
  -H "Authorization: Bearer $OPENBROWSE_API_KEY"
```

## Parameters

`session_id`, `x-browser-use-api-key`

## Responses

- `200`: Successful Response
- `422`: Validation Error
