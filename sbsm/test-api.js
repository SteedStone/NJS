// Quick test of the bakery API endpoint
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testBakeryAPI() {
  try {
    console.log('Testing bakery API...\n');

    // Check if bakery exists
    const bakery = await prisma.bakery.findUnique({
      where: { id: "1" }
    });

    if (bakery) {
      console.log(`✓ Found bakery: ${bakery.name} (ID: ${bakery.id})`);
    } else {
      console.log('❌ Bakery with ID "1" not found');
    }

    // Check products for this bakery
    const products = await prisma.product.findMany({
      where: { bakeryId: "1" }
    });

    console.log(`Found ${products.length} products for bakery ID "1"`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBakeryAPI();