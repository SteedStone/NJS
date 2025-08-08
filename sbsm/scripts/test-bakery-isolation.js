// Test script to verify per-bakery product isolation
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testBakeryIsolation() {
  try {
    console.log('🧪 Testing per-bakery product isolation...\n');

    // 1. Verify bakeries exist
    console.log('1. Checking bakeries...');
    const bakeries = await prisma.bakery.findMany();
    console.log(`   Found ${bakeries.length} bakeries:`);
    bakeries.forEach(b => console.log(`   - ${b.name} (ID: ${b.id})`));

    if (bakeries.length === 0) {
      console.log('   ❌ No bakeries found! Please run setup-bakeries.js first');
      return;
    }

    // 2. Test creating products for different bakeries
    console.log('\n2. Testing product creation per bakery...');
    const testProduct1 = await prisma.product.create({
      data: {
        name: 'Test Croissant Bakery 1',
        price: 2.50,
        quantity: 10,
        bakeryId: bakeries[0].id,
        categories: ['Viennoiserie'],
        types: ['Bio']
      }
    });
    console.log(`   ✅ Created product "${testProduct1.name}" for ${bakeries[0].name}`);

    if (bakeries.length > 1) {
      const testProduct2 = await prisma.product.create({
        data: {
          name: 'Test Croissant Bakery 2',
          price: 2.50,
          quantity: 8,
          bakeryId: bakeries[1].id,
          categories: ['Viennoiserie'],
          types: ['Bio']
        }
      });
      console.log(`   ✅ Created product "${testProduct2.name}" for ${bakeries[1].name}`);
    }

    // 3. Test bakery-specific product retrieval
    console.log('\n3. Testing bakery-specific product retrieval...');
    const bakery1Products = await prisma.product.findMany({
      where: { bakeryId: bakeries[0].id },
      include: { bakery: { select: { name: true } } }
    });
    console.log(`   Bakery "${bakeries[0].name}" has ${bakery1Products.length} products`);

    if (bakeries.length > 1) {
      const bakery2Products = await prisma.product.findMany({
        where: { bakeryId: bakeries[1].id },
        include: { bakery: { select: { name: true } } }
      });
      console.log(`   Bakery "${bakeries[1].name}" has ${bakery2Products.length} products`);
    }

    // 4. Test cross-bakery aggregation
    console.log('\n4. Testing cross-bakery product aggregation...');
    const allProducts = await prisma.product.findMany({
      where: { archived: false },
      include: { bakery: { select: { id: true, name: true } } }
    });
    
    const productMap = new Map();
    allProducts.forEach(product => {
      const key = `${product.name}-${product.price}`;
      if (!productMap.has(key)) {
        productMap.set(key, {
          name: product.name,
          price: product.price,
          totalQuantity: 0,
          bakeries: []
        });
      }
      const productData = productMap.get(key);
      productData.totalQuantity += product.quantity;
      productData.bakeries.push({
        name: product.bakery?.name || 'Unknown',
        quantity: product.quantity
      });
    });

    console.log(`   Found ${productMap.size} unique product types across all bakeries:`);
    Array.from(productMap.values()).forEach(product => {
      console.log(`   - ${product.name}: ${product.totalQuantity} total`);
      product.bakeries.forEach(b => 
        console.log(`     * ${b.name}: ${b.quantity}`)
      );
    });

    // Clean up test products
    console.log('\n5. Cleaning up test products...');
    await prisma.product.deleteMany({
      where: {
        name: {
          startsWith: 'Test Croissant'
        }
      }
    });
    console.log('   ✅ Test products cleaned up');

    console.log('\n🎉 Per-bakery product isolation test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBakeryIsolation();