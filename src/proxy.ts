import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin protection. A signed-in admin carries the `coconut_admin` cookie set by /admin/login.
 * The cookie value is a SHA-256 hash of ADMIN_PASSWORD (computed with Web Crypto so it runs in proxy runtime).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  const expected = await expectedToken();
  const cookie = request.cookies.get("coconut_admin")?.value;
  if (!expected || cookie !== expected) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export async function expectedToken(): Promise<string | null> {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`coconut:${pw}`));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const config = { matcher: ["/admin/:path*"] };
