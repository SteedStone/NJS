"use client";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import { motion } from "framer-motion";
import OptimizedImage from "./OptimizedImage";

export default function CartDropdown() {
  const { cart, getTotalItems, removeFromCart , getTotalPrice } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="bg-[#f3ede7] text-[#1b140d] text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#e6dbd1] transition-colors"
      >
        🛒 Panier ({getTotalItems()})
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 sm:w-80 max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {cart.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">
              Votre panier est vide.
            </div>
          ) : (
            <>
              <ul className="p-4 space-y-2 text-sm text-[#1b140d] max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      {item.image && (
                        <div className="w-8 h-8 relative overflow-hidden rounded">
                          <OptimizedImage
                            src={item.image}
                            alt={item.name}
                            fill={true}
                            className="w-8 h-8"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          {item.quantity} × {item.price?.toFixed(2)} € = {(item.quantity * (item.price ?? 0)).toFixed(2)} €
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-2 border-t text-sm font-bold text-right">
                Total : {getTotalPrice().toFixed(2)} €
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const query = encodeURIComponent(
                    JSON.stringify(
                      cart.map((item) => ({
                        productId: item.id,
                        quantity: item.quantity,
                      }))
                    )
                  );
                  window.location.href = `/form?cart=${query}`;
                }}
                className="mt-4 mx-4 mb-4 w-[calc(100%-2rem)] bg-[#1c140d] text-white py-2 px-4 rounded hover:bg-[#33261a] transition-colors text-sm"
              >
                Valider ma commande
              </motion.button>
            </>
          )}
        </div>
      )}
    </div>
  );
}