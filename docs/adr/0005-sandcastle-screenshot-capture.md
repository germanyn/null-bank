# Sandcastle Screenshot Capture

Sandcastle captures desktop and mobile screenshots of frontend changes and embeds them in PR bodies, giving reviewers visual proof that the UI renders correctly without spinning up the app locally.

The screenshot step runs inside Phase 3 (PR-creator). After pushing the branch, the agent starts the dev server, parses the diff to identify affected routes via file-path convention (`routes/X.tsx` → `/X`), captures full-page screenshots at 1024px, 1366px, and 375px using Playwright, uploads them via GitHub's native file API, and embeds them in the PR body grouped by route. If screenshots fail, the PR is created without them and a warning is logged. A separate sandbox config handles dev-server startup for the screenshot step; the implementer and reviewer phases remain unchanged.

## Consequences

- Reviewers get visual context without local setup, catching UI regressions and layout issues early
- The PR-creator agent becomes responsible for dev-server lifecycle, Playwright capture, and GitHub upload — it is the most complex phase now
- Routes must follow a file-path convention (`routes/X.tsx`) for the diff-to-route mapping to work; new routes that don't follow this convention won't be captured
- Screenshots add time to Phase 3 (dev-server startup + Playwright runs), but run per-issue so multiple PRs can capture in parallel
- Auth-protected routes will require login automation in the screenshot agent when auth is added to the app
- A manual test script (`screenshot-test.mts`) validates the flow in isolation before wiring it into the orchestrator
