# VirusTotal integration

Made by Georgia Rachel. The adapter is `modules/virustotal.js`.

| Operation | Endpoint | Data shared |
|---|---|---|
| Submit URL | POST `/api/v3/urls` | URL as form-encoded data |
| Refresh analysis | GET `/api/v3/analyses/{id}` | Returned analysis ID |
| Look up file | GET `/api/v3/files/{sha256}` | Locally computed hash only |

Requests use an `x-apikey` header, session-only key storage, a 20-second timeout and a minimum 16-second gap. HTTP 401/403 means key/account access failure; 429 means quota; 404 on a hash is Unknown. Offline/network failures remain errors. Never silently approve a file after an API failure.

There is no file upload or local detonation sandbox. To extend this with a private enterprise sandbox, add explicit consent, documented retention, server-side credential handling, upload limits, authorization and report provenance. Do not embed an organizational secret in a shared extension. Never execute suspicious scripts in the extension context.

References: [URL submission](https://docs.virustotal.com/reference/scan-url), [file reports](https://docs.virustotal.com/reference/file-info), [analysis states](https://docs.virustotal.com/reference/analyses-object).
