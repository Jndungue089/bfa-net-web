import { NextResponse, type NextRequest } from "next/server";

// Content-free flag set by the API next to the real (Path=/api, HttpOnly) token cookies, which page requests never carry.
const SESSION_FLAG = "bfa_sess";
const AUTH_PATHS = ["/login", "/register"];
const PUBLIC_PATHS = ["/apk"];

/**
 * 1. Per-request CSP nonce (strict-dynamic, no unsafe-inline for scripts).
 * 2. Optimistic auth gate: redirect on missing session cookies. This is only UX — the backend
 *    validates the JWT on every API call, so a forged cookie gets an empty shell and 401s.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_FLAG);
  
  const isAuthPath = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!hasSession && !isAuthPath && !isPublicPath) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (hasSession && isAuthPath) return NextResponse.redirect(new URL("/dashboard", request.url));

  const nonce = btoa(crypto.randomUUID());
  const dev = process.env.NODE_ENV === "development";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    // Tailwind ships static CSS; inline style attributes (e.g. width bars) need 'unsafe-inline' for style-src-attr only.
    `style-src 'self' ${dev ? "'unsafe-inline'" : `'nonce-${nonce}'`}`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Everything except the proxied API, Next internals and static files.
  matcher: [{ source: "/((?!api|_next/static|_next/image|.*\\.(?:png|jpe?g|webp|svg|ico)$).*)", missing: [{ type: "header", key: "next-router-prefetch" }] }],
};
