# Testing guide

Made by Georgia Rachel. Use benign fixtures, not live malicious websites or malware.

Run `npm test` with Node 22+. Unit tests cover hostname boundaries, URL validation, download risk patterns, unknown/pending verdicts, bounded logging, manifest resources, sender isolation, settings, consent, rate limits, API errors and concurrent state writes. API tests use mocks; they do not spend VirusTotal quota.

Manual browser checks:

1. Load unpacked on Chrome/Edge. Check the Extensions page for load/worker errors. Click the toolbar icon and confirm a full tab opens.
2. Visit normal HTTP(S) pages. Observe request counters and the recent connection table. Toggle monitoring off and verify new traffic stops being recorded.
3. On a controlled local HTTP page, load a script from a starter-blocked domain. Confirm the request is blocked and the DNR match counter increments. Toggle blocking off and verify the ruleset is disabled.
4. Serve a local page containing `<input type="password">` over HTTP. Verify the modal appears, traps normal interaction and offers leave/proceed. Do not enter a real password. A normal HTTPS form should not warn merely because it has a password field.
5. Add a benign test domain to the local denylist, reload its page, then remove it and reload. Check subdomain matches and non-matching lookalikes.
6. Download a benign, sufficiently slow ZIP file from your own server. Verify pause, cancel and explicit resume; also test a tiny completed file to verify the honest unpaused-review state.
7. Without a key, a reputation query must fail clearly. With your own key, consent to submitting a non-sensitive public URL, then refresh after 16 seconds. Unknown hashes and quota errors must never say safe.
8. Test keyboard-only use, 375/768/1440px widths, reduced motion, chart data table, clear history and forgetting the key. Reopen/reload to verify intended session/persistent storage behavior.

Real VirusTotal calls require a user-owned key and consent; no live-API success is claimed by the automated mock tests.
