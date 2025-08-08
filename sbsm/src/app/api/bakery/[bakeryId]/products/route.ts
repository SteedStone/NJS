import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../server/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bakeryId: string }> }
) {
  try {
    const { bakeryId } = await params;
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get('includeArchived') === 'true';

    // Get products for this specific bakery
    const products = await db.product.findMany({
      where: {
        bakeryId: bakeryId,
        ...(includeArchived ? {} : { archived: false }),
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching bakery products:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des produits" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bakeryId: string }> }
) {
  try {
    const { bakeryId } = await params;
    const data = await request.json();

    // Create product for this specific bakery
    const product = await db.product.create({
      data: {
        name: data.name,
        price: parseFloat(data.price),
        quantity: parseInt(data.quantity),
        image: data.image || null,
        description: data.description || null,
        categories: data.categories || [],
        types: data.types || [],
        bakeryId: bakeryId,
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating bakery product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du produit" },
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
    const { productId, quantity, archived } = await request.json();

    const updateData: any = {};
    
    if (quantity !== undefined) {
      updateData.quantity = parseInt(quantity);
    }
    
    if (archived !== undefined) {
      updateData.archived = archived;
    }

    // Update product for this bakery only
    const product = await db.product.update({
      where: { 
        id: productId,
        bakeryId: bakeryId // Ensure we only update products belonging to this bakery
      },
      data: updateData
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating bakery product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du produit" },
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
    const { productId, deleteAllArchived } = await request.json();

    if (deleteAllArchived) {
      // Find archived products for this bakery
      const archivedProducts = await db.product.findMany({
        where: {
          bakeryId: bakeryId,
          archived: true
        }
      });

      // Filter out products that are used in orders
      const productsToDelete = [];
      const productsWithOrders = [];

      for (const product of archivedProducts) {
        const hasOrders = await db.orderItem.findFirst({
          where: { productId: product.id }
        });

        if (hasOrders) {
          productsWithOrders.push(product.name);
        } else {
          productsToDelete.push(product.id);
        }
      }

      // Delete products that are not used in orders
      let deletedCount = 0;
      if (productsToDelete.length > 0) {
        const result = await db.product.deleteMany({
          where: {
            id: { in: productsToDelete }
          }
        });
        deletedCount = result.count;
      }

      let message = `${deletedCount} produits supprimés`;
      if (productsWithOrders.length > 0) {
        message += `. ${productsWithOrders.length} produits gardés car utilisés dans des commandes: ${productsWithOrders.join(', ')}`;
      }

      return NextResponse.json({ 
        message,
        deletedCount,
        skippedCount: productsWithOrders.length,
        skippedProducts: productsWithOrders
      });
    } else if (productId) {
      // Check if product exists and belongs to this bakery
      const product = await db.product.findFirst({
        where: { 
          id: productId,
          bakeryId: bakeryId 
        }
      });

      if (!product) {
        return NextResponse.json(
          { error: "Produit introuvable ou non autorisé" },
          { status: 404 }
        );
      }

      // Check if product is used in any orders
      const ordersWithProduct = await db.orderItem.findFirst({
        where: { productId: productId }
      });

      if (ordersWithProduct) {
        return NextResponse.json(
          { error: "Impossible de supprimer ce produit car il est utilisé dans des commandes. Archivez-le plutôt." },
          { status: 400 }
        );
      }

      // Delete specific product for this bakery only
      await db.product.delete({
        where: { id: productId }
      });

      return NextResponse.json({ message: "Produit supprimé" });
    } else {
      return NextResponse.json(
        { error: "ID du produit manquant" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du produit" },
      { status: 500 }
    );
  }
}