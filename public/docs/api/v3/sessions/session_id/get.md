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
- `401`: Authentication failed.
- `404`: Requested resource was not found.
- `422`: Validation Error
- `429`: Authentication attempts are rate limited.
