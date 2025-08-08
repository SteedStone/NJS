import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "~/server/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cart, customer, paymentMethod = "stripe" } = body;

    if (!cart || !customer?.email || !customer?.name || !customer?.phone || !customer?.bakery || !customer?.time) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    // Generate a PIN for the order
    const generatePin = () => Math.floor(1000 + Math.random() * 9000).toString();
    const orderPin = generatePin();

    // Find bakery ID
    const bakery = await db.bakery.findFirst({
      where: { name: customer.bakery }
    });

    if (paymentMethod === "bakery") {
      // Batch fetch all bakery products to avoid N+1 queries
      const productIds = cart.map((item: any) => item.productId);
      const productNames = cart.map((item: any) => item.name);
      
      const bakeryProducts = await db.product.findMany({
        where: {
          AND: [
            { 
              OR: [
                { id: { in: productIds } },
                { name: { in: productNames } }
              ]
            },
            { bakeryId: bakery?.id }
          ]
        }
      });

      // Create order items and batch inventory updates
      const orderItems = [];
      const inventoryUpdates = [];
      
      for (const item of cart as any[]) {
        const bakeryProduct = bakeryProducts.find(p => 
          p.id === item.productId || p.name === item.name
        );

        if (bakeryProduct) {
          orderItems.push({
            productId: bakeryProduct.id,
            quantity: item.quantity,
          });

          inventoryUpdates.push(
            db.product.update({
              where: { id: bakeryProduct.id },
              data: { quantity: { decrement: item.quantity } }
            })
          );
        } else {
          console.warn(`Product not found for bakery ${customer.bakery}:`, item);
        }
      }

      // Execute all inventory updates in parallel
      await Promise.all(inventoryUpdates);

      // Create order directly in database for bakery payment
      const orderData: any = {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        bakeryName: customer.bakery,
        pin: orderPin,
        time: customer.time,
        paymentMethod: "bakery",
        isPaid: false,
        status: "pending",
        items: {
          create: orderItems
        }
      };

      // Only add bakeryId if bakery exists
      if (bakery?.id) {
        orderData.bakeryId = bakery.id;
      }

      const order = await db.order.create({
        data: orderData,
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      return NextResponse.json({ 
        orderId: order.id, 
        pin: orderPin,
        message: "Commande créée avec succès" 
      });
    } else {
      // Stripe payment flow
      const line_items = cart.map((item: any) => {
        const price = parseFloat(item.price);
        if (isNaN(price)) throw new Error(`Prix invalide pour l'article ${item.name}`);

        return {
          price_data: {
            currency: "eur",
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: item.quantity,
        };
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/form?cancelled=true`,
        metadata: {
          customerEmail: customer.email,
          customerName: customer.name,
          customerPhone: customer.phone || "",
          customerBakery: customer.bakery || "", 
          customerTime: customer.time || "",
          cart: JSON.stringify(cart),
          pin: orderPin,
          paymentMethod: "stripe",
          bakeryId: bakery?.id || ""
        },
      });

      return NextResponse.json({ url: session.url });
    }
  } catch (error) {
    console.error("Erreur dans /api/checkout:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}