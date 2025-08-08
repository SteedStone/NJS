import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

const prisma = new PrismaClient();

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
    const bakery = await prisma.bakery.findFirst({
      where: { name: customer.bakery }
    });

    if (paymentMethod === "bakery") {
      // First, find all the correct bakery-specific products
      const orderItems = [];
      
      for (const item of cart) {
        // Find the product that belongs to the selected bakery
        const bakeryProduct = await prisma.product.findFirst({
          where: {
            AND: [
              { 
                OR: [
                  { id: item.productId },
                  { name: item.name } // fallback in case productId is from different bakery
                ]
              },
              { bakeryId: bakery?.id }
            ]
          }
        });

        if (bakeryProduct) {
          orderItems.push({
            productId: bakeryProduct.id,
            quantity: item.quantity,
          });

          // Update inventory
          await prisma.product.update({
            where: { id: bakeryProduct.id },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        } else {
          console.warn(`Product not found for bakery ${customer.bakery}:`, item);
        }
      }

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

      const order = await prisma.order.create({
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