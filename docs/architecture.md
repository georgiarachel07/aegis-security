# Architecture and trust boundaries

Made by Georgia Rachel.

`background.js` registers listeners at module load. Initialization locks down storage access and reconciles the enabled DNR ruleset with local preferences. `state.js` serializes session read/modify/write operations so simultaneous request events do not overwrite each other. Dashboard mutations use a separate promise queue for settings/API pacing. A minute alarm prunes old buckets; no service-worker setInterval is relied upon.

HTTP(S) request events with a valid browser tab enter hostname-only telemetry. Incoming completion/error events annotate matching requests with HTTP status, cache use or failure without retaining headers or response bodies. DNR debug callbacks add separate confirmed block events. These streams overlap and are never combined into a fake network total. A disabled monitor stops new traffic recording while DNR can continue protecting.

The top-frame content script sends only boolean password/form signals. The worker derives the URL from the Chrome-provided sender, never from a caller-supplied URL. Page messages cannot read state or set keys, scan indicators, alter preferences or control downloads. Privileged commands require the exact extension dashboard URL and matching extension ID.

The warning uses a closed shadow root and native modal dialog to block ordinary interaction; Escape cannot dismiss it silently. The explicit proceed action lasts for the current document only. An adversarial page can remove the host or otherwise interfere, so the overlay is advisory, not isolation. No password or script contents are inspected/exfiltrated.

API inputs are validated, fetch targets are fixed to VirusTotal, redirects fail closed, credentials are omitted, requests time out, and remote output is rendered using textContent. No eval, inline script, remote JavaScript or dynamic code execution is used.
