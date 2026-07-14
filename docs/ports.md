# Port Conventions

Ports are configured via environment variables with hardcoded fallbacks. The root `.env.example` file documents the defaults and is committed to the repo. Copy it to `.env` (which is gitignored) to configure local ports.

Port 3000 is explicitly avoided — it conflicts with many common development tools (React default, Create React App, etc.).

## Range Convention

Each domain gets two 100-port ranges: one for its backend service (SVC) and one for its frontend micro-frontend (MFE).

- **Backend (SVC)** ports start at **3100**.
- **Frontend (MFE)** ports start at **4300**.

| Domain     | SVC (Backend) Range | MFE (Frontend) Range | Env Vars                                  |
|------------|---------------------|----------------------|-------------------------------------------|
| account    | 3100–3199           | 4300–4399            | `ACCOUNT_SVC_PORT`, `ACCOUNT_MFE_PORT`    |
| customer   | 3200–3299           | 4400–4499            | `CUSTOMER_SVC_PORT`, `CUSTOMER_MFE_PORT`  |
| transfer   | 3300–3399           | 4500–4599            | `TRANSFER_SVC_PORT`, `TRANSFER_MFE_PORT`  |

The **shell** (app shell / host) is not a domain service and uses a standalone port:

| Service | Port | Env Var     |
|---------|------|-------------|
| shell   | 5000 | `SHELL_PORT`|

## Per-Domain Breakdown

### account

- **SVC**: `ACCOUNT_SVC_PORT` — default `3100`
- **MFE**: `ACCOUNT_MFE_PORT` — default `4300`

### customer

- **SVC**: `CUSTOMER_SVC_PORT` — default `3200`
- **MFE**: `CUSTOMER_MFE_PORT` — default `4400`

### transfer

- **SVC**: `TRANSFER_SVC_PORT` — default `3300`
- **MFE**: `TRANSFER_MFE_PORT` — default `4500`

### shell

- **Port**: `SHELL_PORT` — default `5000`

## Adding a New Domain

1. Pick the next available 100-port range from the table above.
2. Add `*_SVC_PORT` and `*_MFE_PORT` entries to both `.env.example` and `.env`.
3. Update this table with the new domain.
