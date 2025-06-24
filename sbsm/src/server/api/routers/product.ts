import { z } from "zod";
import { createTRPCRouter, publicProcedure , protectedProcedure
 } from "~/server/api/trpc";
import { db } from "~/server/db";



export const productRouter = createTRPCRouter({
  // 🔄 Obtenir tous les produits
  getAll: publicProcedure.query(async () => {
    return await db.product.findMany();
  }),

  // ➕ Ajouter un produit
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        price: z.number(),
        quantity: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.product.create({
        data: {
          name: input.name,
          price: input.price,
          quantity: input.quantity,
        },
      });
    }),

  // 🗑️ Supprimer un produit
  delete: publicProcedure
    .input(z.string()) // id du produit
    .mutation(async ({ input }) => {
      return await db.product.delete({
        where: { id: input },
      });
    }),
});
