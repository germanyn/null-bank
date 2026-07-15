# 0007 JWT cookie authentication and public/private layout split

Null Bank needs login, registration, and protected routes. We decided to authenticate via JWT stored in httpOnly cookies, served behind a reverse proxy on port 8100, with a clear split between public and private UI areas. The Account entity is the sole identity (Customer was dropped), and gets a `name` field for display.

JWTs carry `{ sub: accountNumber, iat, exp }`, signed with HMAC-SHA256, expiring after 24 hours. The signing secret lives in `.env`. Cookies use `SameSite=Strict` to block cross-site requests. A reverse proxy (nginx) on port 8100 routes `/api/*` to backend services and `/` to the shell.

The shell calls `GET /auth/me` on load to detect auth state, showing a loading indicator while it checks. A 401 at any point — initial load or mid-session — redirects to the public login/register page. Public routes (register, login) render without the shell layout; private routes (dashboard, transfers) use the sidebar layout with Balance, Transfers, and Logout links.

Registration auto-logs the user in (sets the cookie) and redirects to the dashboard. Logout calls `POST /auth/logout` which clears the cookie server-side.

**Considered Options**:
- Session IDs stored in DB (rejected: adds DB lookup on every request, no benefit for single-server setup)
- In-memory token on client ( rejected: lost on page refresh, poor UX)
- localStorage for token (rejected: vulnerable to XSS, no benefit over cookies for same-origin)
- Customer as login subject (rejected: Customer was redundant — Account already holds cpfCnpj and is the auth subject)

**Consequences**:
- All API calls must go through the reverse proxy (browser same-origin policy)
- Token revocation requires a blocklist or short expiry + refresh flow (24h expiry chosen to defer this)
- MFEs don't need to manage auth state directly — the browser handles cookie propagation
