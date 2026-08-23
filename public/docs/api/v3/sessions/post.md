# Create Session

> POST /v3/sessions

*Source: https://openbrowse.co/docs/api/v3/sessions/post*

Start a browser session and give the agent its task. The run begins immediately, and the response carries the session id you poll for progress.

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
| `model` | string | Optional. Omit it and the session runs on whatever the instance's DEFAULT_MODEL names, which is gpt-5.6-terra unless its operator changed it. |
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
| `reasoningEffort` | string | Optional. One of default, none, low, medium, high, xhigh or max, validated against the chosen model. Omit it, or send default, and the session runs at the level recommended for that model, which is deliberately not always the provider's own: on gpt-5.6-terra it is none where the provider would use medium. |

## Responses

- `200`: Successful Response
- `401`: Authentication failed.
- `404`: Requested resource was not found.
- `422`: Request validation failed.
- `429`: Authentication attempts are rate limited.
