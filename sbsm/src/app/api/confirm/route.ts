import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-08-16",
});
const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { sessionId } = await req.json();

  try {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "line_items.data.price.product"],
  });
    const metadata = session.metadata;

    if (!metadata?.cart || !metadata.customerEmail || !metadata.customerName) {
      return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
    }

    const cart = JSON.parse(metadata.cart);

    const order = await prisma.order.create({
      data: {
        name: metadata.customerName,
        email: metadata.customerEmail,
        phone: metadata.customerPhone || "",
        bakery: metadata.customerBakery || "",
        items: {
          create: cart.map((item: any) => ({
            quantity: item.quantity,
            product: { connect: { id: item.productId } },
          })),
        },
      },
      include: { items: true },
    });
    for (const item of cart) {
        await prisma.product.update({
            where: { id: item.productId },
            data: {
            quantity: {
                decrement: item.quantity,
            },
            },
        });
        }

    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: metadata.customerEmail,
      subject: "Confirmation de votre commande",
      html: `
        <p>Bonjour ${metadata.customerName},</p>
        <p>Merci pour votre commande ! Voici un récapitulatif :</p>
        <ul>
          ${cart.map((item: any) => `<li>${item.quantity} × ${item.name} — ${item.price.toFixed(2)} €</li>`).join("")}
        </ul>
        <p>Total : ${cart.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0).toFixed(2)} €</p>
        <p>À bientôt !</p>
      `,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Erreur lors de la confirmation de commande:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération de la session Stripe." }, { status: 500 });
  }
}