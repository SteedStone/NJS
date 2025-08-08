// Check products and their bakery assignments
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log('📦 Checking products in database...\n');

    const allProducts = await prisma.product.findMany({
      include: {
        bakery: {
          select: { id: true, name: true }
        }
      }
    });

    console.log(`Found ${allProducts.length} total products:`);
    
    const withBakery = allProducts.filter(p => p.bakeryId);
    const withoutBakery = allProducts.filter(p => !p.bakeryId);

    console.log(`- ${withBakery.length} products with bakery assigned`);
    console.log(`- ${withoutBakery.length} products without bakery assigned\n`);

    if (withBakery.length > 0) {
      console.log('Products WITH bakery:');
      withBakery.forEach(p => {
        console.log(`  - ${p.name} → ${p.bakery?.name || 'Unknown'} (ID: ${p.bakeryId})`);
      });
    }

    if (withoutBakery.length > 0) {
      console.log('\nProducts WITHOUT bakery:');
      withoutBakery.forEach(p => {
        console.log(`  - ${p.name} (no bakery assigned)`);
      });
    }

    // Test the cross-bakery API logic
    const productsWithBakery = allProducts.filter(p => p.bakeryId && p.bakery);
    console.log(`\nFiltered for cross-bakery API: ${productsWithBakery.length} products`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();