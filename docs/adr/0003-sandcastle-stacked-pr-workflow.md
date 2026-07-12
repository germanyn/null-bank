# Sandcastle: Stacked PR Workflow

Replace Sandcastle's Phase 3 (direct merge to master) with a stacked pull request workflow. Each issue gets its own PR; dependent issues target the previous PR's branch, forming a chain. This gives humans a review gate before any code lands on main, and keeps the git history linear and easy to bisect.

The planner now emits `blocked_by` dependency edges per issue so the orchestrator can compute the correct base branch for each stacked PR. Before creating a stacked PR the agent merges the base branch into the dependent branch, resolving conflicts and running tests so every PR is ready to merge. Issue closing is removed from the agent workflow — humans close issues when they merge PRs.

## Consequences

- Every change gets a review gate (PR approval) before landing on main
- Dependent changes are stacked, so reviewers see incremental diffs
- The planner must understand inter-issue dependencies, not just pick unblocked work
- The git history becomes a chain of PRs rather than a flat merge commit
- Issue close is a human action, not an agent action
