# Permission rationale

Made by Georgia Rachel.

| Permission | Purpose |
|---|---|
| `declarativeNetRequest` | Apply packaged subresource block rules without JavaScript intercepting requests. |
| `declarativeNetRequestFeedback` | Exact rule matches for this unpacked development build. |
| `webRequest` | Observe HTTP(S) request metadata; does not read bodies or use blocking listeners. |
| `downloads` | Observe risky download types, attempt to pause, and honor explicit resume/cancel actions. |
| `storage` | Preferences, session API key and bounded telemetry. |
| `alarms` | Clean stale minute buckets across service-worker suspension. |
| HTTP(S) host access | Run phishing checks and observe/block requests on websites; call VirusTotal. |

No clipboard, native messaging, history database, cookies, debugger, geolocation, password values, or `webRequestBlocking` access. `tabs.create`/`tabs.update` do not require the broad `tabs` permission for the operations used here. Host permissions are broad because the user requests browser-wide protection. This is disclosed at installation.
