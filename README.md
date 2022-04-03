# Aegis Security

**Made by Georgia Rachel — creator and developer.**

A free, MIT-licensed Manifest V3 browser security workspace for desktop Chrome and Microsoft Edge. Aegis combines a starter ad/tracker blocker, local phishing heuristics, download review, opt-in VirusTotal reputation checks, and a full-tab dark dashboard. Click the extension icon to open it.

## What it does

- Blocks subresource requests to 24 starter advertising and analytics domains using `declarativeNetRequest`.
- Displays confirmed Aegis rule matches and observed HTTP(S) request events, with a real-time 60-minute chart, hostname-only activity log and third-party filter.
- Warns on locally denied domains and suspicious credential-page signals using a modal overlay with explicit leave/proceed actions.
- Attempts to pause executables, scripts, archives, opaque-source downloads and browser-flagged downloads for human review.
- Submits URLs to VirusTotal only after consent; retrieves pending analysis results on demand.
- Hashes selected files locally with SHA-256 and queries existing VirusTotal file reports. File bytes are never uploaded.
- Keeps preferences locally and browsing logs/API keys in trusted-context session storage. Includes clear-history and forget-key controls.
- Uses no CDN, remote scripts, framework, analytics, telemetry backend, or build step.

## Install in Chrome or Edge

1. Download this repository as a ZIP using **Code → Download ZIP**, then extract it. Alternatively run `git clone https://github.com/georgiarachel07/QuickPick-Safe-Campus-Food-Ordering-THESIS-.git` (access is required while the repository is private).
2. Open `chrome://extensions` in Chrome, or `edge://extensions` in Edge.
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select the extracted folder containing `manifest.json`.
5. Review the requested permissions. Enable the extension and pin its toolbar icon if desired.
6. Click the Aegis toolbar icon. Its full-page dashboard opens in a new tab.
7. Browse ordinary HTTP(S) sites, then return to the dashboard to inspect real events.

The unpacked folder must stay on disk. After editing source files, click **Reload** on the browser's extensions page and reload existing webpages. This is a desktop Chromium extension; Firefox and Safari need separate compatibility work. It does not operate on browser internal pages, extension stores, other extension pages or local files. Existing tabs need a refresh after installation. Private browsing is not enabled by default.

## Set up VirusTotal

1. Obtain your own API key through [VirusTotal](https://www.virustotal.com/). Do not commit or share it.
2. Open **Threat intelligence**, paste the key and select **Save key**. The key is retained only for the current browser session, not synced or exposed to content scripts.
3. Enter a URL **or** select a file up to 50 MiB. Read and tick the sharing consent before submitting.
4. URL checks return a pending analysis. After at least 16 seconds, select **Refresh analysis**. Repeat if the service is still processing.
5. File checks look up the locally calculated hash. An unknown hash means there is no report; it does not mean the file is safe.

URLs and queried hashes may be included in VirusTotal's dataset. Never submit private links, tokens, personal information or confidential indicators. Aegis does not automatically scan visited URLs or downloads. It enforces 16-second spacing, but account-specific daily/minute quotas and licensing terms still apply. Review [VirusTotal's API documentation](https://docs.virustotal.com/reference/overview) and terms before use.

## Understand the results

The dashboard reports **flagged engines / reporting engines**, not a safety probability. “No detections reported” is not “safe.” Old reports can miss new threats. Pending, unavailable, failed and unknown reports remain explicitly inconclusive.

This is a transparent starter security suite, **not a full uBlock Origin replacement, antivirus, or an on-device malware execution sandbox**. VirusTotal provides external reputation/analysis evidence; Aegis never executes suspicious code. The download pause is best effort and may happen after a small download has completed. The page overlay appears after navigation and cannot form a security boundary against a hostile page. Keep browser Safe Browsing/SmartScreen and operating-system protections enabled.

Exact rule-match debug events are an **unpacked-extension feature**. A packaged store release needs a different reporting strategy; do not treat this dashboard's exact-block telemetry as store-ready. Request counts are not bytes, response-body inspection, or full device network monitoring. Third-party classification compares hostnames, so sibling subdomains also count as different hosts. See [limitations](docs/limitations.md).

## Directory structure

```text
manifest.json       MV3 permissions, rules and script registration
background.js       Service worker, event wiring and validated message router
content.js          Isolated phishing-signal collection and warning dialog
dashboard.html      Full-tab accessible dashboard, credited to Georgia Rachel
dashboard.css       Responsive dark UI
dashboard.js        Live rendering, preferences and user-driven checks
rules.json          Starter declarative blocking rules
modules/
  config.js         Defaults and retention limits
  urls.js           Input validation and hostname boundaries
  heuristics.js     Credential-page and download risk signals
  state.js          Serialized session mutations and initialization
  traffic.js        Hostname-only logs and minute buckets
  verdict.js        Evidence normalization
  virustotal.js     API requests, pacing and error handling
  downloads.js      Best-effort pause and explicit review actions
  chart.js          Local canvas chart, with HTML data-table alternative
  dom.js            Safe text-only DOM helpers
tests/              Node built-in test runner tests
docs/               Architecture, privacy, testing and extension guidance
LICENSE             MIT license
```

## Develop and customize

Requires Node.js 22+ only for tests; installation has no dependency or compilation step.

```sh
npm test
```

Edit `rules.json` for curated host rules; use unique numeric IDs and test for breakage. Change `modules/heuristics.js` to add reviewed heuristics. Add denied page domains through the dashboard. Change CSS tokens to customize the visual identity while retaining the MIT notice and creator credit. Never put secrets into code or use remotely hosted executable scripts in Manifest V3. See [architecture](docs/architecture.md), [contributing](CONTRIBUTING.md), [testing](docs/testing.md) and [API integration](docs/virustotal.md).

## Privacy, permissions and security

Read the [privacy policy](docs/privacy.md), [permission rationale](docs/permissions.md) and [security policy](SECURITY.md). Browsing telemetry is bounded and session-only. The only remote integration is a user-requested VirusTotal call. API keys and telemetry are not included in exported files because this extension has no data-export feature. Clearing history does not resume or cancel paused downloads; use the browser's Downloads page if the review list was cleared.

## Commit-date disclosure

This codebase was created in November 2026. At the repository owner's request, its 40 source-import commits have deliberately assigned author/committer dates from April 2022 through November 2026, with month gaps. Those dates are **metadata customization, not evidence that the code existed, was tested or was maintained during those earlier years**. The previous project history remains an ancestor and is also retained on a backup branch. Repository creation dates are not changed.

## License and credit

Copyright © 2026 Georgia Rachel. Released under the [MIT License](LICENSE). You may use, modify and redistribute the project, including commercially, subject to the license notice. **Made by Georgia Rachel.**
