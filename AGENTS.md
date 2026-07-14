## Agent skills

### Issue tracker

Issues tracked on GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Default six-role label vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix, pending-review). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout with CONTEXT.md at root and docs/adr/. See `docs/agents/domain.md`.

### Security rules

- **NEVER** read, open, or display the contents of `.env` files. These files contain secrets and credentials.
