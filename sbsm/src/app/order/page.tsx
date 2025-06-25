"use client";

import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";

export type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
  categories?: string[];  
  types?: string[];
};


const PREDEFINED_CATEGORIES = [
  "Pâtisserie",
  "Viennoiserie",
];
const PREDEFINED_TYPES = [
  "Sans gluten",
  "Sans sucre",
  "Vegan",
  "Bio"
];

export default function OrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<{[key: string]: number}>({});
  const { cart, addToCart, removeFromCart } = useCart();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");



  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  // Initialize selected quantities
  useEffect(() => {
    const initialQuantities: {[key: string]: number} = {};
    products.forEach(product => {
      initialQuantities[product.id] = 0;
    });
    setSelectedQuantities(initialQuantities);
  }, [products]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [productId]: quantity
    }));
  };

  const handleIncrement = (productId: string) => {
    setSelectedQuantities(prev => {
      const current = prev[productId] || 0;
      const product = products.find(p => p.id === productId);
      if (product && current < product.quantity) {
        return {...prev, [productId]: current + 1};
      }
      return prev;
    });
  };

  const handleDecrement = (productId: string) => {
    setSelectedQuantities(prev => {
      const current = prev[productId] || 0;
      if (current > 0) {
        return {...prev, [productId]: current - 1};
      }
      return prev;
    });
  };

  const handleAddToCart = (product: Product) => {
    const quantity = selectedQuantities[product.id] || 0;
    if (quantity > 0) {
      addToCart(product, quantity);
    }
  };

  const productsExist = products.length > 0;

  return (
  <div className="min-h-screen bg-[#fcfaf8] px-4 py-8 md:px-10 md:py-12 flex gap-8">
    {/* 🧭 MENU LATÉRAL */}
    <aside className="w-48 shrink-0">
      <h2 className="text-lg font-semibold text-[#1c140d] mb-4">Catégories</h2>
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => setSelectedCategories([])}
            className={`w-full text-left px-3 py-1.5 rounded ${
              selectedCategories.length === 0
                ? "bg-[#1c140d] text-white"
                : "text-[#1c140d] hover:bg-gray-200"
            }`}
          >
            Tous les produits
          </button>
        </li>
        {PREDEFINED_CATEGORIES.map((cat) => (
          <li key={cat}>
            <button
              onClick={() => setSelectedCategories([cat])}
              className={`w-full text-left px-3 py-1.5 rounded ${
                selectedCategories.includes(cat)
                  ? "bg-[#1c140d] text-white"
                  : "text-[#1c140d] hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>
    </aside>

    {/* 🧁 CONTENU PRINCIPAL */}
    <main className="flex-1">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#1c140d]">
          {selectedCategories.length === 0
            ? "Tous les produits"
            : selectedCategories[0]}
        </h1>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          placeholder="🔍 Rechercher un produit..."
          className="w-full md:w-64 border px-3 py-1.5 rounded bg-white text-sm"
        />
      </div>

      {/* 📦 AFFICHAGE DES PRODUITS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products
          .filter((p) =>
            selectedCategories.length === 0 ||
            p.categories?.some((cat) => selectedCategories.includes(cat))
          )
          .filter((p) =>
            p.name.toLowerCase().includes(searchTerm)
          )
          .map((product) => {
            const isAvailable = product.quantity > 0;
            const selectedQuantity = selectedQuantities[product.id] || 0;
            const isInCart = cart.some((item) => item.id === product.id);

            return (
              <div
                key={product.id}
                className="flex flex-col gap-3 bg-white rounded-xl p-4 shadow-md h-full"
              >
                <div className="aspect-square w-full overflow-hidden rounded-lg">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${product.image || "/placeholder-image.jpg"}')`,
                    }}
                  ></div>
                </div>

                <div className="flex flex-col gap-2 flex-grow">
                  <p className="text-[#1c140d] text-base font-medium leading-normal line-clamp-2 h-12">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {product.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.types?.map((t, idx) => (
                    <span key={idx} className="text-xs bg-[#f3ede7] text-[#1c140d] px-2 py-0.5 rounded-full">
                      {t}
                    </span>
                  ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    {isAvailable ? product.quantity : 0} disponibles 
                  </p>
                  <p className="text-lg font-bold text-[#1c140d]">
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    }).format(product.price)}
                  </p>

                  <div className="flex items-center justify-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDecrement(product.id)}
                      disabled={!isAvailable || selectedQuantity === 0}
                      className="w-8 h-8 flex items-center justify-center bg-[#f3ede7] rounded-full disabled:opacity-50"
                    >
                      -
                    </motion.button>

                    <input
                      type="number"
                      min={0}
                      max={product.quantity}
                      value={selectedQuantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          product.id,
                          parseInt(e.target.value || "0")
                        )
                      }
                      disabled={!isAvailable}
                      className="w-16 px-2 py-1 border rounded text-center text-sm bg-white"
                    />

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleIncrement(product.id)}
                      disabled={!isAvailable || selectedQuantity >= product.quantity}
                      className="w-8 h-8 flex items-center justify-center bg-[#f3ede7] rounded-full disabled:opacity-50"
                    >
                      +
                    </motion.button>
                  </div>

                  <div className="mt-2">
                    {isInCart ? (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeFromCart(product.id)}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded text-sm"
                      >
                        Retirer du panier
                      </motion.button>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddToCart(product)}
                        disabled={selectedQuantity === 0}
                        className={`w-full bg-[#1c140d] text-white py-2 px-4 rounded text-sm ${
                          selectedQuantity === 0 ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        Ajouter au panier
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* 🛑 Aucun produit trouvé */}
      {products.filter((p) =>
        (selectedCategories.length === 0 || p.categories?.some((cat) => selectedCategories.includes(cat))) &&
        p.name.toLowerCase().includes(searchTerm)
      ).length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          Aucun produit trouvé.
        </p>
      )}
    </main>
  </div>
);
}