import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { BAKERIES } from "../../constants/bakeries";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});
const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { sessionId } = await req.json();

  try {
    // Check if order already exists for this specific sessionId
    const existingOrder = await prisma.order.findFirst({
      where: {
        sessionId: sessionId
      },
      include: { items: true }
    });

    if (existingOrder) {
      console.log(`Order already exists for session ${sessionId}, returning existing order`);
      return NextResponse.json(existingOrder);
    }

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
    const pin = metadata.pin || generatePIN(); // Use PIN from metadata or generate new one

    // Get all products for the bakery
    const bakeryProducts = await prisma.product.findMany({
      where: {
        OR: [
          { bakeryId: metadata.bakeryId },
          { bakery: { name: metadata.customerBakery } }
        ]
      }
    });

    const orderItems = [];
    
    for (const item of cart) {
      // Find the product that belongs to the selected bakery
      const bakeryProduct = bakeryProducts.find(p => 
        p.id === item.productId || p.name === item.name
      );

      if (!bakeryProduct) {
        throw new Error(`Product not found for bakery ${metadata.customerBakery}: ${item.name}`);
      }

      orderItems.push({
        productId: bakeryProduct.id,
        quantity: item.quantity,
      });

      // Update inventory immediately
      const newQuantity = Math.max(0, bakeryProduct.quantity - item.quantity);
      await prisma.product.update({
        where: { id: bakeryProduct.id },
        data: { quantity: newQuantity },
      });
    }

    // Validate that we have at least one order item
    if (orderItems.length === 0) {
      throw new Error(`No valid products found for bakery ${metadata.customerBakery}. Cannot create empty order.`);
    }

    // Create order data
    const orderData: any = {
      name: metadata.customerName,
      email: metadata.customerEmail,
      phone: metadata.customerPhone || "",
      bakeryName: metadata.customerBakery || "",
      time: metadata.customerTime || "",
      paymentMethod: metadata.paymentMethod || "stripe",
      isPaid: true, // Stripe payments are always paid
      status: "pending",
      sessionId: sessionId, // Store sessionId to prevent duplicates
      items: {
        create: orderItems
      },
      pin: pin,
    };

    // Only add bakeryId if it exists
    if (metadata.bakeryId) {
      orderData.bakeryId = metadata.bakeryId;
    }
    
    const order = await prisma.order.create({
      data: orderData,
      include: { items: true },
    });

    // Send confirmation email (don't fail the order if email fails)
    try {
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
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Continue anyway - order was created successfully
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Erreur lors de la confirmation de commande:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération de la session Stripe." }, { status: 500 });
  }
}