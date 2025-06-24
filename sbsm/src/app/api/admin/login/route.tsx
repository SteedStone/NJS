import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });

  // Cookie valable 30 minutes
  res.cookies.set("auth", "admin", {
    httpOnly: true,
    path: "/",
    maxAge: 10, // 30 minutes
    sameSite: "lax",
  });

  return res;
}
