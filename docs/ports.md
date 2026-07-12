# Port Conventions

Ports are configured via environment variables with hardcoded fallbacks. The root `.env` file is the single source of truth.

Port 3000 is explicitly avoided — it conflicts with many common development tools (React default, Create React App, etc.).

## Range Convention

Each domain gets a 100-port range. SVC ports start at 3100, MFE ports start at 4300.

| Domain     | SVC Range   | MFE Range   | Env Vars                          |
|------------|-------------|-------------|-----------------------------------|
| account    | 3100–3199   | 4300–4399   | `ACCOUNT_SVC_PORT`, `ACCOUNT_MFE_PORT` |
| transactions | 3200–3299 | 4400–4499   | `TRANSACTIONS_SVC_PORT`, `TRANSACTIONS_MFE_PORT` |

## Per-Domain Breakdown

### account

- **SVC**: `ACCOUNT_SVC_PORT` — default `3100`
- **MFE**: `ACCOUNT_MFE_PORT` — default `4300`

### transactions (future)

- **SVC**: `TRANSACTIONS_SVC_PORT` — default `3200`
- **MFE**: `TRANSACTIONS_MFE_PORT` — default `4400`

## Adding a New Domain

1. Pick the next available 100-port range from the table above.
2. Add `*_SVC_PORT` and `*_MFE_PORT` entries to the root `.env`.
3. Update this table with the new domain.
