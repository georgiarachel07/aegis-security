# Limits and honest interpretation

Made by Georgia Rachel.

- A 28-domain starter ruleset has limited coverage and can break analytics-dependent pages. It does not include cosmetic filter parsing, scriptlets, full filter subscriptions or per-site allowlisting. Turn blocking off if a site breaks.
- No current production phishing feed ships with Aegis. `phishing.aegis.test` is a reserved test fixture; add reviewed domains yourself. Heuristics can produce false positives and false negatives.
- The warning is post-navigation, top-frame only, and not a hardened interstitial. It neither stops prior script execution nor scans iframe password forms.
- Download review is a race with the browser download pipeline. Files can finish before pause, archives can conceal unknown formats, and initial names can be missing. It cannot prevent operating-system file opening. There is no automatic “safe” resume.
- File reports are hash lookups only. Unknown files are not uploaded or detonated. A URL report is not the same thing as a binary-content report.
- Browser-internal pages and extension stores are inaccessible. Existing pages require reload after extension installation/update. HTTP(S) tab traffic is observed, not all operating-system sockets, payloads or byte counts.
- Unpacked-only DNR debug telemetry is not suitable for publishing unchanged to an extension store. Store releases require revised counting and privacy review.
- Session telemetry is bounded. Counters are session totals, while displayed events are a rolling tail. Browser cache, permissions and other extensions affect what Chrome exposes.
- Service-worker or API failures are not proof of safety. Consult the Extensions page for worker errors and Downloads page for paused items.
- No browser integration test can prove detection efficacy against real adversaries. Keep normal browser and OS defenses enabled.
