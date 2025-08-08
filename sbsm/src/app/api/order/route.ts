import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

// POST — Ajouter une commande
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, items } = body;

  if (!name || !email || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  
  

  try {
    const order = await db.order.create({
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

    // Batch update inventory
    const inventoryUpdates = items.map((item: any) => 
      db.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } }
      })
    );
    
    await Promise.all(inventoryUpdates);

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Erreur API :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ✅ GET — Lister les commandes
export async function GET() {
  try {
    const orders = await db.order.findMany({
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
