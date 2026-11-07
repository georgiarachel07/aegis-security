# Contributing

Aegis Shield is made by Georgia Rachel. Contributions should preserve attribution and explain user-visible behavior.

1. Fork/clone the repository and create a feature branch.
2. Keep remote code out of the extension; MV3 executes only packaged scripts.
3. Add focused tests for trust boundaries, rule matching, verdicts or retention when changing those behaviors.
4. Run `npm test`, load the extension unpacked, and follow `docs/testing.md`.
5. Describe permissions and privacy impact in your pull request. Never include API keys, personal browsing traces or harmful live samples.

Rule additions need hostname-boundary checks and breakage assessment. Prefer minimal permissions, bounded data, clear unknown states and explicit consent. Use textContent for external data. Do not claim a heuristic or zero detections proves safety.
