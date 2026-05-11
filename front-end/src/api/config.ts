/**
 * Base URL for the backend API.
 *
 * Defaults to an empty string so requests resolve as same-origin relative
 * URLs (e.g. `/api/clubs`). In dev that's served by the Vite dev server,
 * which proxies `/api/*` to the backend (see `vite.config.ts`). In prod it
 * matches whichever host serves the built frontend.
 *
 * Override with `VITE_API_URL` only if the frontend and backend live on
 * different origins and you want the browser to call the backend directly
 * (in which case the backend must allow that origin via CORS).
 */
export const API_BASE = import.meta.env.VITE_API_URL ?? '';

/**
 * Default timeout for any single API request, in milliseconds. Backed by
 * `AbortController` so the underlying socket is closed instead of dangling
 * — a hung backend now fails the UI fast instead of looking like
 * "the frontend takes forever to load".
 */
export const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Wrap a `fetch` request with a timeout. Callers that already provide a
 * `signal` may pass it via `init.signal`; this helper merges its own abort
 * signal with the caller's so either can cancel.
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  if (init.signal) {
    if (init.signal.aborted) {
      controller.abort();
    } else {
      init.signal.addEventListener('abort', () => controller.abort(), {
        once: true,
      });
    }
  }

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    if (
      err instanceof DOMException &&
      err.name === 'AbortError' &&
      !init.signal?.aborted
    ) {
      throw new Error(
        `Request timed out after ${Math.round(timeoutMs / 1000)}s — is the backend running?`,
      );
    }
    if (err instanceof TypeError) {
      // `fetch` throws TypeError for network-level failures (DNS, CORS,
      // refused connection). Re-throw with a friendlier message.
      throw new Error(
        'Could not reach the server. Check your connection and that the backend is running.',
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function parseJsonSafe<T>(
  res: Response,
  fallbackError = 'Request failed',
): Promise<T> {
  const contentLength = res.headers.get('Content-Length');
  if (contentLength === '0') {
    if (res.ok) {
      return null as unknown as T;
    }
    throw new Error(res.statusText || fallbackError);
  }

  const text = await res.text();
  if (text.length === 0) {
    if (res.ok) {
      return null as unknown as T;
    }
    throw new Error(res.statusText || fallbackError);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Server returned non-JSON (${res.status})`);
  }

  if (!res.ok) {
    const errMessage =
      parsed &&
      typeof parsed === 'object' &&
      'error' in parsed &&
      typeof (parsed as { error?: unknown }).error === 'string'
        ? (parsed as { error: string }).error
        : fallbackError;
    throw new Error(errMessage);
  }

  return parsed as T;
}
