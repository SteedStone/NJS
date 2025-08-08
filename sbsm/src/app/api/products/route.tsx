import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const includeArchived = url.searchParams.get("includeArchived") === "true";

  const products = await db.product.findMany({
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

  const newProduct = await db.product.create({
    data: {
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      image,
      description,
      categories,
      types,
      bakeryId,
    },
  });

  return NextResponse.json(newProduct);
}


export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, quantityToAdd } = body;

  if (!id || typeof quantityToAdd !== "number" || quantityToAdd <= 0) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  try {
    const updatedProduct = await db.product.update({
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

  const updated = await db.product.update({
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
    await db.product.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}