# Privacy

Made by Georgia Rachel. No Aegis analytics server exists.

Preferences and user-entered denylist domains are stored in `chrome.storage.local`. API keys, request hostnames, scan results, download basenames, timestamps and counters are stored in `chrome.storage.session`; they are cleared on browser restart, extension reload, disable or update. Storage access is restricted to trusted extension contexts. Data is not encrypted against someone with access to the operating-system/browser profile.

Network logs retain up to 200 events, 60 minute buckets, 50 alerts, 30 scan results and 50 download-review items. They contain hostnames, not browsing paths/query strings, request bodies, headers, passwords or page text. Hostnames and filenames can still reveal sensitive interests. Clearing history resets the logs/counters, not preferences, keys or browser downloads. Forget key removes the saved key separately.

Only explicit user actions send a URL or SHA-256 hash to VirusTotal. Full submitted URL paths and queries are sent because they affect reputation; fragments are removed. File bytes remain local. VirusTotal receives the indicator, API key and normal network metadata such as your IP address. Indicators may be shared in its dataset. Do not submit sensitive information. Refreshing a submitted analysis queries its identifier. There are no automatic visits, uploads, or background reputation scans.

Uninstalling removes extension storage. Incognito use, if manually enabled by the user, can contribute to the same extension session; avoid enabling it if this is unwanted.
