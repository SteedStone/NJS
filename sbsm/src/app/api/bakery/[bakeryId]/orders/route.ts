import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../server/db";
import { BAKERIES } from "../../../../constants/bakeries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bakeryId: string }> }
) {
  try {
    const { bakeryId } = await params;
    
    // Find the bakery name
    const bakery = BAKERIES.find((b) => b.id === bakeryId);
    if (!bakery) {
      return NextResponse.json(
        { error: "Boulangerie introuvable" },
        { status: 404 }
      );
    }

    // Get orders for this specific bakery using bakeryId relation
    const orders = await db.order.findMany({
      where: {
        OR: [
          { bakeryId: bakeryId },
          { bakeryName: bakery.name } // Fallback for old data
        ]
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching bakery orders:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des commandes" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bakeryId: string }> }
) {
  try {
    const { bakeryId } = await params;
    const { orderId, status, validated, isPaid } = await request.json();

    const updateData: any = {};
    
    if (status !== undefined) {
      updateData.status = status;
    }
    
    if (validated !== undefined) {
      updateData.validated = validated;
    }
    
    if (isPaid !== undefined) {
      updateData.isPaid = isPaid;
    }

    const order = await db.order.update({
      where: { id: orderId },
      data: {
        ...updateData,
        bakeryId: bakeryId // Ensure bakeryId is set when updating
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating bakery order:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la commande" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ bakeryId: string }> }
) {
  try {
    const { bakeryId } = await params;
    const { orderId, deleteAllValidated } = await request.json();

    // Get bakery info
    const bakery = await db.bakery.findUnique({ where: { id: bakeryId } });
    if (!bakery) {
      return NextResponse.json(
        { error: "Boulangerie introuvable" },
        { status: 404 }
      );
    }

    if (deleteAllValidated) {
      // First get all validated orders for this bakery to count them
      const ordersToDelete = await db.order.findMany({
        where: {
          OR: [
            { bakeryId: bakeryId },
            { bakeryName: bakery.name }
          ],
          validated: true
        },
        select: { id: true }
      });

      if (ordersToDelete.length === 0) {
        return NextResponse.json({ 
          message: "Aucune commande validée à supprimer",
          deletedCount: 0 
        });
      }

      // Delete all validated orders for this bakery (OrderItems will be deleted automatically due to cascade)
      const result = await db.order.deleteMany({
        where: {
          id: { in: ordersToDelete.map(o => o.id) }
        }
      });

      return NextResponse.json({ 
        message: `${result.count} commandes supprimées`,
        deletedCount: result.count 
      });
    } else if (orderId) {
      // First find the order to ensure it belongs to this bakery
      const order = await db.order.findFirst({
        where: {
          id: orderId,
          OR: [
            { bakeryId: bakeryId },
            { bakeryName: bakery.name }
          ]
        }
      });

      if (!order) {
        return NextResponse.json(
          { error: "Commande introuvable ou non autorisée" },
          { status: 404 }
        );
      }

      // Delete the order (OrderItems will be deleted automatically due to cascade)
      await db.order.delete({
        where: { id: orderId }
      });

      return NextResponse.json({ message: "Commande supprimée" });
    } else {
      return NextResponse.json(
        { error: "ID de la commande manquant" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la commande" },
      { status: 500 }
    );
  }
}