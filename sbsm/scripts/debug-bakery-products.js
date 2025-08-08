// Debug script to check what products each bakery API returns
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BAKERIES = [
  { id: "1", name: "Boulangerie Centrale" },
  { id: "2", name: "Pain d'Or" },
  { id: "3", name: "Le Croissant Doré" }
];

async function debugBakeryProducts() {
  try {
    console.log('🔍 Debugging bakery product APIs...\n');

    for (const bakery of BAKERIES) {
      console.log(`=== ${bakery.name} (ID: ${bakery.id}) ===`);
      
      // Simulate what the API does
      const products = await prisma.product.findMany({
        where: {
          bakeryId: bakery.id,
          archived: false,
        },
        orderBy: { createdAt: 'desc' }
      });

      console.log(`API would return: ${products.length} products`);
      
      if (products.length > 0) {
        products.forEach(p => {
          console.log(`  - ${p.name} (bakeryId: ${p.bakeryId}, qty: ${p.quantity})`);
        });
      }
      
      // Also check what products exist with no bakeryId
      const unassignedProducts = await prisma.product.findMany({
        where: {
          bakeryId: null,
          archived: false,
        }
      });
      
      if (unassignedProducts.length > 0) {
        console.log(`\n⚠️  Found ${unassignedProducts.length} products with no bakeryId:`);
        unassignedProducts.forEach(p => {
          console.log(`  - ${p.name} (qty: ${p.quantity})`);
        });
      }
      
      console.log('');
    }

    // Test the actual API endpoint
    console.log('🌐 Testing actual API endpoints...');
    for (const bakery of BAKERIES) {
      try {
        const response = await fetch(`http://localhost:3001/api/bakery/${bakery.id}/products`);
        const data = await response.json();
        console.log(`${bakery.name} API returned: ${Array.isArray(data) ? data.length : 'Error'} products`);
        
        if (Array.isArray(data) && data.length > 0) {
          data.forEach(p => {
            console.log(`  - ${p.name} (qty: ${p.quantity})`);
          });
        }
      } catch (error) {
        console.log(`${bakery.name} API error:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugBakeryProducts();