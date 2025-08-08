// Assign unassigned products to bakeries for testing
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignUnassignedProducts() {
  try {
    console.log('🔄 Assigning unassigned products to bakeries...\n');

    // Get unassigned products
    const unassignedProducts = await prisma.product.findMany({
      where: { bakeryId: null }
    });

    console.log(`Found ${unassignedProducts.length} unassigned products`);

    if (unassignedProducts.length === 0) {
      console.log('✅ No unassigned products found');
      return;
    }

    // Assign each product to a different bakery (round-robin)
    const bakeryIds = ["1", "2", "3"];
    
    for (let i = 0; i < unassignedProducts.length; i++) {
      const product = unassignedProducts[i];
      const bakeryId = bakeryIds[i % bakeryIds.length];
      
      await prisma.product.update({
        where: { id: product.id },
        data: { bakeryId }
      });
      
      console.log(`✅ Assigned "${product.name}" to bakery ${bakeryId}`);
    }

    console.log('\n🎉 All products have been assigned to bakeries!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignUnassignedProducts();