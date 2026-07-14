const ACCOUNT_BASE = `http://localhost:${process.env.ACCOUNT_SVC_PORT ?? 3100}`;
const TRANSFER_BASE = `http://localhost:${process.env.TRANSFER_SVC_PORT ?? 3300}`;

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function apiPost<T>(
  base: string,
  path: string,
  body: unknown,
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.error || 'Request failed' };
    }

    return { ok: true, data };
  } catch {
    return { ok: false, error: 'Network error. Is the server running?' };
  }
}

export async function apiGet<T>(
  base: string,
  path: string,
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${base}${path}`);
    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.error || 'Request failed' };
    }

    return { ok: true, data };
  } catch {
    return { ok: false, error: 'Network error. Is the server running?' };
  }
}

export { ACCOUNT_BASE, TRANSFER_BASE };
