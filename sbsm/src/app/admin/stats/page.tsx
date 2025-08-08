"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BAKERIES } from "../../constants/bakeries";

type StatsData = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  bakeryStats: {
    bakeryId: string;
    bakeryName: string;
    revenue: number;
    orders: number;
    products: number;
    popularProducts: Array<{
      name: string;
      quantity: number;
    }>;
  }[];
  globalPopularProducts: Array<{
    name: string;
    totalQuantity: number;
  }>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    bakeryName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
};

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const router = useRouter();

  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/admin/stats?period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSelection = () => {
    router.push('/admin/bakery-selection');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfaf8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#eb7f13] mx-auto mb-4"></div>
          <p className="text-[#1c140d]">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf8] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-[#1c140d]">
              📊 Statistiques Globales
            </h1>
            <p className="text-gray-600">Vue d'ensemble de toutes les boulangeries</p>
          </div>
          
          <div className="flex gap-3">
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#eb7f13]"
            >
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
            
            <button
              onClick={handleBackToSelection}
              className="px-4 py-2 bg-gray-200 text-[#1c140d] rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Retour
            </button>
          </div>
        </motion.div>

        {/* Global Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-[#1c140d]">
                  {stats?.totalRevenue?.toFixed(2) || '0.00'} €
                </p>
              </div>
              <div className="text-3xl text-green-500">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Commandes totales</p>
                <p className="text-2xl font-bold text-[#1c140d]">
                  {stats?.totalOrders || 0}
                </p>
              </div>
              <div className="text-3xl text-blue-500">📦</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Produits disponibles</p>
                <p className="text-2xl font-bold text-[#1c140d]">
                  {stats?.totalProducts || 0}
                </p>
              </div>
              <div className="text-3xl text-yellow-500">🍞</div>
            </div>
          </div>
        </motion.div>

        {/* Bakery Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-md mb-8"
        >
          <h2 className="text-xl font-bold text-[#1c140d] mb-6">
            Performance par Boulangerie
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BAKERIES.map((bakery) => {
              const bakeryStats = stats?.bakeryStats?.find(s => s.bakeryId === bakery.id);
              return (
                <div key={bakery.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-[#1c140d] mb-3 flex items-center gap-2">
                    <span>🏪</span>
                    {bakery.name}
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chiffre d'affaires:</span>
                      <span className="font-medium">
                        {bakeryStats?.revenue?.toFixed(2) || '0.00'} €
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Commandes:</span>
                      <span className="font-medium">{bakeryStats?.orders || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Produits en stock:</span>
                      <span className="font-medium">{bakeryStats?.products || 0}</span>
                    </div>
                  </div>

                  {/* Popular products for this bakery */}
                  {bakeryStats?.popularProducts && bakeryStats.popularProducts.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Produits populaires:
                      </p>
                      <div className="space-y-1">
                        {bakeryStats.popularProducts.slice(0, 3).map((product, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="truncate mr-2">{product.name}</span>
                            <span className="text-[#eb7f13] font-medium">
                              {product.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Global Popular Products & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-md"
          >
            <h2 className="text-xl font-bold text-[#1c140d] mb-6">
              🏆 Produits les plus populaires
            </h2>
            
            <div className="space-y-3">
              {stats?.globalPopularProducts?.slice(0, 10).map((product, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-[#eb7f13] text-white text-xs rounded-full flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-[#1c140d]">{product.name}</span>
                  </div>
                  <span className="text-[#eb7f13] font-bold">
                    {product.totalQuantity} vendus
                  </span>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-8">
                  Aucune donnée disponible
                </p>
              )}
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-md"
          >
            <h2 className="text-xl font-bold text-[#1c140d] mb-6">
              📋 Commandes récentes
            </h2>
            
            <div className="space-y-3">
              {stats?.recentOrders?.slice(0, 8).map((order) => (
                <div key={order.id} className="p-3 border border-gray-100 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-[#1c140d] text-sm">
                      {order.customerName}
                    </span>
                    <span className="text-[#eb7f13] font-bold text-sm">
                      {order.total.toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>{order.bakeryName}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'ready' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-8">
                  Aucune commande récente
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}