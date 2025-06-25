import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get("admin_logged_in")?.value === "true";

  // Protéger uniquement les routes du dashboard
  if (request.nextUrl.pathname.startsWith("/admin/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

// Appliquer le middleware uniquement à certaines routes
export const config = {
  matcher: ["/admin/dashboard/:path*"],
};
