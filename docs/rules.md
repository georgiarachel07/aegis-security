# Maintaining the starter rules

Made by Georgia Rachel.

The 28 rules are handwritten domain-level starters, not copied filter-list subscriptions. Each has a stable unique numeric ID, priority 1, action block and a `||domain^` boundary pattern. They target subresources including scripts, images, frames, XHR, pings and WebSockets; they do not block top-level navigation.

Domains include Google advertising/analytics endpoints, AppNexus, The Trade Desk, Criteo, Taboola, Outbrain, Comscore, Quantcast, Hotjar, Clarity, Yahoo advertising and common ad exchanges. This list is illustrative, incomplete and requires maintenance. Classification does not mean every request to the domain is malicious.

Before adding a domain, verify its role and ownership, test subdomain/boundary behavior, assess login/content breakage and avoid overbroad first-party domains. Increment IDs without duplicates. Run tests, reload the extension and inspect DNR match events. A production product should use licensed, maintained subscriptions with update validation and provenance.

Reference: [Chrome declarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest).
