const BASE_URL = `http://localhost:${process.env.ACCOUNT_SVC_PORT ?? 3100}`;

type ApiResult<T> = {
  ok: true;
  data: T;
} | {
  ok: false;
  error: string;
};

export async function apiPost<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
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

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`);

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.error || 'Request failed' };
    }

    return { ok: true, data };
  } catch {
    return { ok: false, error: 'Network error. Is the server running?' };
  }
}
