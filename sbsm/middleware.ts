import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
      console.log("middleware check", req.nextUrl.pathname); // 👈 test console

  const isAdmin = req.cookies.get("auth")?.value === "admin";
  const isLogin = req.nextUrl.pathname === "/admin/login";

  if (req.nextUrl.pathname.startsWith("/admin") && !isLogin && !isAdmin) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
