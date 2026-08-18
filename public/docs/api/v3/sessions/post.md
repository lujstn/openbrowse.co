# Create Session

> POST /v3/sessions

*Source: https://openbrowse.co/docs/api/v3/sessions/post*



## Request

```bash
curl -X POST "https://your-host/v3/sessions" \
  -H "Authorization: Bearer $OPENBROWSE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Parameters

`x-browser-use-api-key`

## Request body

| Field | Type | Description |
| --- | --- | --- |
| `task` | string |  |
| `model` | string |  |
| `sessionId` | string |  |
| `keepAlive` | boolean |  |
| `maxCostUsd` | number |  |
| `profileId` | string |  |
| `outputSchema` | object |  |
| `sensitiveData` | object |  |
| `systemPromptExtension` | string |  |
| `skills` | boolean | Accepted for compatibility with browser-use-sdk and ignored. |
| `enableRecording` | boolean | Accepted for compatibility with browser-use-sdk and ignored. OpenBrowse does not record sessions, and recordingUrls comes back empty. Use the live view instead. |
| `proxyCountryCode` | string | Accepted for compatibility with browser-use-sdk and ignored. OpenBrowse has no proxy layer, so requests originate from your own machine's IP address whatever you set here. |
| `reasoningEffort` | string |  |

## Responses

- `200`: Successful Response
- `422`: Validation Error
