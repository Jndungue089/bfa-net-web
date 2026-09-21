import { uuid } from "../uuid";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fieldErrors: Record<string, string[]> = {},
    public readonly traceId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
  get isNetwork() { return this.status === 0; }
  get isUnauthorized() { return this.status === 401; }
}

export interface ApiClientOptions {
  /** "" for the web app (same-origin through the Next.js rewrite); absolute URL for mobile. */
  baseUrl: string;
  clientKind: "web" | "mobile";
  /** Mobile: bearer token from memory. Web relies on HttpOnly cookies instead. */
  getAccessToken?: () => string | null;
  /** Rotates the session. Return true when a fresh access token/cookie is now available. */
  refresh?: () => Promise<boolean>;
  onSessionExpired?: () => void;
  userAgent?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export interface RequestOptions {
  body?: unknown;
  query?: Record<string, string | number | undefined | null>;
  idempotencyKey?: string;
  /**
   * Payload sent as-is (e.g. FormData with a file). Mutually exclusive with `body`. Omit `contentType` for FormData:
   * fetch must set the multipart boundary itself.
   */
  raw?: { data: BodyInit; contentType?: string };
  /** false for login/register/refresh: no bearer, no 401-refresh-retry. */
  auth?: boolean;
  signal?: AbortSignal;
}

interface Problem { status?: number; title?: string; code?: string; errors?: Record<string, string[]>; traceId?: string }

export function createApiClient(opts: ApiClientOptions) {
  const doFetch = opts.fetchImpl ?? ((...a: Parameters<typeof fetch>) => fetch(...a));
  let refreshing: Promise<boolean> | null = null;

  // Single-flight: parallel 401s trigger exactly one rotation (refresh tokens are one-time use).
  const refreshOnce = () => (refreshing ??= (opts.refresh?.() ?? Promise.resolve(false)).finally(() => { refreshing = null; }));

  async function send<T>(method: string, path: string, o: RequestOptions, retried: boolean): Promise<T> {
    const url = new URL(path, opts.baseUrl || "http://local");
    for (const [k, v] of Object.entries(o.query ?? {})) if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    const target = opts.baseUrl ? url.toString() : `${url.pathname}${url.search}`;

    const headers: Record<string, string> = { Accept: "application/json", "X-BFA-Client": opts.clientKind };
    if (o.body !== undefined) headers["Content-Type"] = "application/json";
    if (o.raw?.contentType) headers["Content-Type"] = o.raw.contentType;
    if (o.idempotencyKey) headers["Idempotency-Key"] = o.idempotencyKey;
    if (opts.userAgent) headers["User-Agent"] = opts.userAgent;
    const token = o.auth === false ? null : opts.getAccessToken?.();
    if (token) headers.Authorization = `Bearer ${token}`;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 20_000);
    o.signal?.addEventListener("abort", () => ctrl.abort(), { once: true });

    let res: Response;
    try {
      res = await doFetch(target, {
        method, headers, signal: ctrl.signal, cache: "no-store",
        credentials: opts.clientKind === "web" ? "same-origin" : "omit",
        body: o.raw ? o.raw.data : o.body === undefined ? undefined : JSON.stringify(o.body),
      });
    } catch {
      throw new ApiError(0, "network_error", "Sem ligação ao servidor. Verifique a sua ligação e tente novamente.");
    } finally {
      clearTimeout(timer);
    }

    if (res.status === 401 && o.auth !== false && !retried && opts.refresh) {
      if (await refreshOnce()) return send<T>(method, path, o, true);
      opts.onSessionExpired?.();
    }

    if (res.status === 204) return undefined as T;
    const text = await res.text();
    let json: unknown;
    try { json = text ? JSON.parse(text) : undefined; } catch { json = undefined; }

    if (!res.ok) {
      const p = (json ?? {}) as Problem;
      throw new ApiError(res.status, p.code ?? "error", p.title ?? "Ocorreu um erro inesperado.", p.errors, p.traceId);
    }
    return json as T;
  }

  return {
    get: <T>(path: string, o: RequestOptions = {}) => send<T>("GET", path, o, false),
    post: <T>(path: string, o: RequestOptions = {}) => send<T>("POST", path, o, false),
    patch: <T>(path: string, o: RequestOptions = {}) => send<T>("PATCH", path, o, false),
    put: <T>(path: string, o: RequestOptions = {}) => send<T>("PUT", path, o, false),
    delete: <T>(path: string, o: RequestOptions = {}) => send<T>("DELETE", path, o, false),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

/** Copies server-side field errors onto a form (works with react-hook-form's setError). */
export function applyFieldErrors(
  error: unknown,
  setError: (name: never, err: { type: string; message: string }) => void,
  knownFields: readonly string[],
): boolean {
  if (!(error instanceof ApiError)) return false;
  let applied = false;
  for (const [field, messages] of Object.entries(error.fieldErrors)) {
    if (knownFields.includes(field) && messages[0]) {
      setError(field as never, { type: "server", message: messages[0] });
      applied = true;
    }
  }
  return applied;
}

export { uuid as newIdempotencyKey };
