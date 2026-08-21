# List Profiles

> GET /v3/profiles

*Source: https://openbrowse.co/docs/api/v3/profiles/get*

List profiles, paginated, with an optional query to narrow the results.

## Request

```bash
curl -X GET "https://your-host/v3/profiles" \
  -H "Authorization: Bearer $OPENBROWSE_API_KEY"
```

## Parameters

`page`, `page_size`, `query`, `x-browser-use-api-key`

## Responses

- `200`: Successful Response
- `422`: Validation Error
