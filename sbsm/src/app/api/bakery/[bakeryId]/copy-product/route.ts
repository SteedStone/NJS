import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../server/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bakeryId: string }> }
) {
  try {
    const { bakeryId } = await params;
    const { sourceProductId, quantity } = await request.json();

    if (!sourceProductId || !quantity) {
      return NextResponse.json(
        { error: "sourceProductId and quantity are required" },
        { status: 400 }
      );
    }

    // Get the source product
    const sourceProduct = await db.product.findUnique({
      where: { id: sourceProductId },
      include: {
        bakery: {
          select: { name: true }
        }
      }
    });

    if (!sourceProduct) {
      return NextResponse.json(
        { error: "Source product not found" },
        { status: 404 }
      );
    }

    // Check if this product already exists for this bakery
    const existingProduct = await db.product.findFirst({
      where: {
        bakeryId: bakeryId,
        name: sourceProduct.name,
        price: sourceProduct.price
      }
    });

    if (existingProduct) {
      // If product exists, just update the quantity
      const updatedProduct = await db.product.update({
        where: { id: existingProduct.id },
        data: {
          quantity: existingProduct.quantity + parseInt(quantity)
        }
      });

      return NextResponse.json({
        ...updatedProduct,
        message: `Added ${quantity} items to existing product`
      });
    } else {
      // Create a new product for this bakery
      const newProduct = await db.product.create({
        data: {
          name: sourceProduct.name,
          price: sourceProduct.price,
          quantity: parseInt(quantity),
          image: sourceProduct.image,
          description: sourceProduct.description,
          categories: sourceProduct.categories,
          types: sourceProduct.types,
          bakeryId: bakeryId,
        }
      });

      return NextResponse.json({
        ...newProduct,
        message: `Copied "${sourceProduct.name}" from ${sourceProduct.bakery?.name}`
      });
    }

  } catch (error) {
    console.error("Error copying product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la copie du produit" },
      { status: 500 }
    );
  }
}