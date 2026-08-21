# Delete Session

> DELETE /v3/sessions/{session_id}

*Source: https://openbrowse.co/docs/api/v3/sessions/session_id/delete*

Cancel the session if it is still running, then delete it and everything stored against it.

## Request

```bash
curl -X DELETE "https://your-host/v3/sessions/{session_id}" \
  -H "Authorization: Bearer $OPENBROWSE_API_KEY"
```

## Parameters

`session_id`, `x-browser-use-api-key`

## Responses

- `204`: Successful Response
- `422`: Validation Error
