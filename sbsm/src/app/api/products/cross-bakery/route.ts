import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../server/db";

export async function GET(request: NextRequest) {
  try {
    // Get all active products from all bakeries
    const products = await db.product.findMany({
      where: { 
        archived: false,
        NOT: {
          bakeryId: null
        }
      },
      include: {
        bakery: {
          select: {
            id: true,
            name: true,
            address: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group products by name to show cross-bakery availability
    const productMap = new Map();

    products.forEach(product => {
      // Skip products without bakery (shouldn't happen with the where clause, but safety first)
      if (!product.bakery) {
        console.warn(`Product ${product.id} has no bakery assigned, skipping`);
        return;
      }

      const key = `${product.name}-${product.price}`;
      
      if (!productMap.has(key)) {
        productMap.set(key, {
          id: product.id, // Use first product ID as primary
          name: product.name,
          price: product.price,
          image: product.image,
          description: product.description,
          categories: product.categories,
          types: product.types,
          totalQuantity: 0,
          availability: []
        });
      }

      const productData = productMap.get(key);
      productData.totalQuantity += product.quantity;
      productData.availability.push({
        bakeryId: product.bakery.id,
        bakeryName: product.bakery.name,
        bakeryAddress: product.bakery.address,
        quantity: product.quantity,
        productId: product.id // Individual product ID for this bakery
      });
    });

    const aggregatedProducts = Array.from(productMap.values());

    return NextResponse.json(aggregatedProducts);
  } catch (error) {
    console.error("Error fetching cross-bakery products:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des produits" },
      { status: 500 }
    );
  }
}