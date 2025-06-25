import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId manquant" }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { validated: true },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Erreur lors de la validation :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}