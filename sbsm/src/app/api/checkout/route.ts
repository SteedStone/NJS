import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cart, customer } = body;

    if (!cart || !customer?.email || !customer?.name || !customer?.phone || !customer?.bakery || !customer?.time) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const line_items = cart.map((item: any) => {
      const price = parseFloat(item.price);
      if (isNaN(price)) throw new Error(`Prix invalide pour l’article ${item.name}`);

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
        customerPhone: customer.phone || "",        // ✅ ajouté
        customerBakery: customer.bakery || "", 
        customerTime: customer.time || "", // ✅ ajouté
        cart: JSON.stringify(cart),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erreur dans /api/checkout:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}