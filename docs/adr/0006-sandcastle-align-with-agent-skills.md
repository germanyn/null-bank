# Sandcastle: Align with Agent Skills

Refactor sandcastle's implementer and reviewer prompts to use the same methodology as the `/implement`, `/tdd`, and `/code-review` agent skills. The skill content is inlined into the sandcastle prompt files rather than loaded at runtime, keeping the Docker container simple and self-contained.

The implementer prompt now follows the `/tdd` skill's vertical-slice methodology: seam-first testing, anti-pattern checks (tautological, implementation-coupled, horizontal slicing), mocking at system boundaries only, and the red-before-green loop with refactoring deferred to review. The reviewer prompt now uses the `/code-review` skill's two-axis approach: **Standards** (conformance to `CODING_STANDARDS.md` plus the Fowler smell baseline) and **Spec** (faithfulness to the originating issue/PRD), reported separately without merging.

## Consequences

- Test quality improves: the implementer now writes integration-style tests at public seams instead of implementation-detail tests, matching the `/tdd` skill's proven methodology
- Review depth increases: the reviewer checks both standards compliance AND spec fidelity, catching two categories of issues that the previous single-axis review could miss
- Prompt token cost grows (implement-prompt from 62 to ~130 lines, review-prompt from 55 to ~100 lines), but the methodology is battle-tested across interactive agent sessions
- The orchestrator (`main.mts`) is unchanged — the refactoring is purely prompt-level, so no risk to the plan→execute→PR pipeline
- Stricter TDD (vertical slices, seam-first) may slow some automated runs compared to the lighter RGR approach, but produces more reliable test suites
- The two-axis review may surface more findings (especially smell baseline hits), requiring more reviewer iterations or follow-up if the implementer doesn't address them
