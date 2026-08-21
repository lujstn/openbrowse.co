# Get Profile

> GET /v3/profiles/{profile_id}

*Source: https://openbrowse.co/docs/api/v3/profiles/profile_id/get*

Fetch a single profile by id. Returns 404 if no profile has that id.

## Request

```bash
curl -X GET "https://your-host/v3/profiles/{profile_id}" \
  -H "Authorization: Bearer $OPENBROWSE_API_KEY"
```

## Parameters

`profile_id`, `x-browser-use-api-key`

## Responses

- `200`: Successful Response
- `422`: Validation Error
