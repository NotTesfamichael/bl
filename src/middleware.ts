import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Note: unsafe-inline needed for Next.js
    "style-src 'self' 'unsafe-inline'", // Note: unsafe-inline needed for Tailwind
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'"
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  // Rate limiting headers (basic)
  const rateLimitHeader = response.headers.get("X-RateLimit-Limit") || "100";
  response.headers.set("X-RateLimit-Limit", rateLimitHeader);
  response.headers.set("X-RateLimit-Remaining", "99");

  // API route protection
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Add CORS headers for API routes
    response.headers.set("Access-Control-Allow-Origin", request.nextUrl.origin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: response.headers });
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ]
};
