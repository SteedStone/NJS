import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { orderId, status } = await req.json();

    if (!orderId || !["pending", "ready", "picked_up"].includes(status)) {
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Erreur mise à jour status:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}