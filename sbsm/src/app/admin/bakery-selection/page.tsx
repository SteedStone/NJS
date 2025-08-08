"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BAKERIES } from "../../constants/bakeries";

export default function BakerySelectionPage() {
  const [selectedBakery, setSelectedBakery] = useState<string>("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBakeryLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBakery) {
      setError("Veuillez sélectionner une boulangerie");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const bakery = BAKERIES.find(b => b.id === selectedBakery);
      
      if (!bakery) {
        setError("Boulangerie introuvable");
        return;
      }

      // Verify bakery password
      if (password !== bakery.password) {
        setError("Mot de passe incorrect pour cette boulangerie");
        return;
      }

      // Set bakery session
      const response = await fetch('/api/admin/bakery-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bakeryId: bakery.id,
          bakeryName: bakery.name 
        })
      });

      if (response.ok) {
        // Redirect to bakery-specific dashboard
        router.push(`/admin/dashboard/${bakery.id}`);
      } else {
        setError("Erreur de connexion");
      }
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleStatsView = () => {
    router.push('/admin/stats');
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#fcfaf8] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-[#1c140d] mb-2">
            Administration - The Daily Crumb
          </h1>
          <p className="text-gray-600">
            Choisissez la boulangerie à gérer ou consultez les statistiques globales
          </p>
        </motion.div>

        {/* Stats Panel Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStatsView}
            className="w-full bg-gradient-to-r from-[#eb7f13] to-[#d67110] text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-center space-x-3">
              <div className="text-3xl">📊</div>
              <div className="text-left">
                <h3 className="text-xl font-bold">Statistiques Globales</h3>
                <p className="text-orange-100">Vue d'ensemble de toutes les boulangeries</p>
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* Bakery Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-[#1c140d] mb-6 text-center">
            Accès Boulangerie
          </h2>

          <form onSubmit={handleBakeryLogin} className="space-y-6">
            {/* Bakery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BAKERIES.map((bakery) => (
                <motion.div
                  key={bakery.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedBakery === bakery.id
                      ? "border-[#eb7f13] bg-[#f3ede7]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedBakery(bakery.id)}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">🏪</div>
                    <h3 className="font-semibold text-[#1c140d] text-sm">
                      {bakery.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {bakery.address}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Password Input */}
            {selectedBakery && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-[#1c140d] mb-2">
                  Mot de passe de la boulangerie
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eb7f13]"
                  placeholder="Entrez le mot de passe"
                  required
                />
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedBakery || loading}
              className="w-full bg-[#1c140d] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#33261a] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? "Connexion..." : "Accéder au tableau de bord"}
            </button>
          </form>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Se déconnecter complètement
          </button>
        </motion.div>
      </div>
    </div>
  );
}