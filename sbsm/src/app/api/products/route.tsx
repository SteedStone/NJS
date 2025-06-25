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
  const { name, price, quantity, image } = await req.json();

  const newProduct = await prisma.product.create({
    data: {
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      image, // 👈 ajoute cette ligne
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