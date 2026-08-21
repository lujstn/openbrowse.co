# Delete Profile

> DELETE /v3/profiles/{profile_id}

*Source: https://openbrowse.co/docs/api/v3/profiles/profile_id/delete*

Delete a profile and the browser state stored against it. The cookies and per-origin storage go with it.

## Request

```bash
curl -X DELETE "https://your-host/v3/profiles/{profile_id}" \
  -H "Authorization: Bearer $OPENBROWSE_API_KEY"
```

## Parameters

`profile_id`, `x-browser-use-api-key`

## Responses

- `204`: Successful Response
- `422`: Validation Error
