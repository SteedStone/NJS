import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../server/db";
import { BAKERIES } from "../../../constants/bakeries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // today
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
    }

    // Get all orders in the period
    const orders = await db.order.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Get all products
    const products = await db.product.findMany({
      where: {
        archived: false
      }
    });

    // Calculate global stats
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + order.items.reduce((orderSum, item) => {
        return orderSum + (item.product.price * item.quantity);
      }, 0);
    }, 0);

    const totalOrders = orders.length;
    const totalProducts = products.length;

    // Calculate bakery-specific stats
    const bakeryStats = await Promise.all(BAKERIES.map(async (bakery) => {
      const bakeryOrders = orders.filter((order) => 
        (order as any).bakeryName === bakery.name || (order as any).bakery === bakery.name
      );

      const revenue = bakeryOrders.reduce((sum, order) => {
        return sum + order.items.reduce((orderSum, item) => {
          return orderSum + (item.product.price * item.quantity);
        }, 0);
      }, 0);

      // Get products count for this specific bakery
      const bakeryProductsCount = await db.product.count({
        where: {
          bakeryId: bakery.id,
          archived: false
        }
      });

      // Get popular products for this bakery
      const productQuantities: { [key: string]: { name: string; quantity: number } } = {};
      
      bakeryOrders.forEach(order => {
        order.items.forEach(item => {
          const key = item.product.id;
          if (!productQuantities[key]) {
            productQuantities[key] = {
              name: item.product.name,
              quantity: 0
            };
          }
          productQuantities[key].quantity += item.quantity;
        });
      });

      const popularProducts = Object.values(productQuantities)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      return {
        bakeryId: bakery.id,
        bakeryName: bakery.name,
        revenue,
        orders: bakeryOrders.length,
        products: bakeryProductsCount,
        popularProducts
      };
    }));

    // Calculate global popular products
    const globalProductQuantities: { [key: string]: { name: string; totalQuantity: number } } = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const key = item.product.id;
        if (!globalProductQuantities[key]) {
          globalProductQuantities[key] = {
            name: item.product.name,
            totalQuantity: 0
          };
        }
        globalProductQuantities[key].totalQuantity += item.quantity;
      });
    });

    const globalPopularProducts = Object.values(globalProductQuantities)
      .sort((a, b) => b.totalQuantity - a.totalQuantity);

    // Get recent orders
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(order => ({
        id: order.id,
        customerName: order.name,
        bakeryName: (order as any).bakeryName || (order as any).bakery || 'Non spécifiée',
        total: order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        status: order.status || 'pending',
        createdAt: order.createdAt.toISOString()
      }));

    const statsData = {
      totalRevenue,
      totalOrders,
      totalProducts,
      bakeryStats,
      globalPopularProducts,
      recentOrders
    };

    return NextResponse.json(statsData);
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des statistiques" },
      { status: 500 }
    );
  }
}