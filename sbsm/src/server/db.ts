import { PrismaClient } from "@prisma/client";
import { env } from "~/env";

// 👇 Création du client
const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// 👇 Déclare ici que prisma est bien un PrismaClient
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 👇 Et ici on type explicitement db
export const db: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
