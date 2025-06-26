import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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
    function generatePIN() {
      return Math.floor(1000 + Math.random() * 9000).toString(); // exemple : "4831"
    }

    const cart = JSON.parse(metadata.cart);
    const pin = generatePIN();

    const order = await prisma.order.create({
      data: {
        name: metadata.customerName,
        email: metadata.customerEmail,
        phone: metadata.customerPhone || "",
        bakery: metadata.customerBakery || "",
        time: metadata.customerTime || "", // nouveau champ
        items: {
          create: cart.map((item: any) => ({
            quantity: item.quantity,
            product: { connect: { id: item.productId } },
          })),
        },
        pin : pin, // ← nouveau champ ici

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
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1c140d;">Bonjour ${metadata.customerName},</h2>
          <p>Merci pour votre commande à la boulangerie <strong>${metadata.customerBakery || ""}</strong> !</p>

          <h3 style="margin-top: 20px;">🧺 Récapitulatif de votre commande :</h3>
          <ul style="list-style: none; padding: 0;">
            ${cart.map((item: any) => `
              <li style="padding: 4px 0;">
                ${item.quantity} × <strong>${item.name}</strong> — ${item.price.toFixed(2)} €
              </li>
            `).join("")}
          </ul>

          <p style="margin-top: 10px;"><strong>Total : ${cart.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0).toFixed(2)} €</strong></p>

          <div style="margin: 20px 0; padding: 10px; background-color: #f3ede7; border-radius: 8px;">
            <p style="font-size: 18px; margin: 0;">🎟️ <strong>Code de retrait : <span style="color: #1c140d;">${pin}</span></strong></p>
          </div>

          <p>Veuillez présenter ce code à la boulangerie au moment du retrait.</p>
          <p>À très bientôt,</p>
          <p style="color: #999; font-size: 12px;">Cet email a été généré automatiquement. Ne pas répondre.</p>
        </div>
      `,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Erreur lors de la confirmation de commande:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération de la session Stripe." }, { status: 500 });
  }
}