import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { bakeryId, bakeryName } = await request.json();

    if (!bakeryId || !bakeryName) {
      return NextResponse.json(
        { error: "Informations de boulangerie manquantes" },
        { status: 400 }
      );
    }

    // Create response with bakery session
    const response = NextResponse.json({ 
      success: true,
      bakeryId,
      bakeryName 
    });

    // Set bakery session cookie (expires in 8 hours)
    response.cookies.set("bakery-session", JSON.stringify({
      bakeryId,
      bakeryName,
      timestamp: Date.now()
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/admin"
    });

    return response;
  } catch (error) {
    console.error("Bakery login error:", error);
    return NextResponse.json(
      { error: "Erreur de connexion" },
      { status: 500 }
    );
  }
}