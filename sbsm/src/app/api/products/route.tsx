import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const includeArchived = url.searchParams.get("includeArchived") === "true";

  const products = await prisma.product.findMany({
    where: includeArchived ? {} : { archived: false },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const { name, price, quantity, image, description, categories, types, bakeryId } = await req.json();

  if (!bakeryId) {
    return NextResponse.json({ error: "bakeryId is required" }, { status: 400 });
  }

  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        price: typeof price === 'number' ? price : parseFloat(price),
        quantity: typeof quantity === 'number' ? quantity : parseInt(quantity),
        image,
        description,
        categories,
        types,
        bakeryId,
      },
    });

    return NextResponse.json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}


export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, quantityToAdd } = body;

  if (!id || typeof quantityToAdd !== "number" || quantityToAdd <= 0) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  try {
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        quantity: { increment: quantityToAdd },
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Erreur PATCH /products :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { id, archive } = await req.json();

  if (!id || typeof archive !== "boolean") {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { archived: archive },
  });

  return NextResponse.json(updated);
}


export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400 });
  }

  try {
    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}