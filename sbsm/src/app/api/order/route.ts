import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST — Ajouter une commande
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, items } = body;

  if (!name || !email || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  try {
    const order = await prisma.order.create({
      data: {
        name,
        email,
        items: {
          create: items.map((item: { productId: string; quantity: number }) => ({
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    // Mettre à jour les stocks
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Erreur API :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ✅ GET — Lister les commandes
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Erreur GET commandes :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
