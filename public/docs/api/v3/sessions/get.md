# List Sessions

> GET /v3/sessions

*Source: https://openbrowse.co/docs/api/v3/sessions/get*

List sessions with their current status, paginated. Running and finished sessions are both included.

## Request

```bash
curl -X GET "https://your-host/v3/sessions" \
  -H "Authorization: Bearer $OPENBROWSE_API_KEY"
```

## Parameters

`page`, `page_size`, `x-browser-use-api-key`

## Responses

- `200`: Successful Response
- `422`: Validation Error
