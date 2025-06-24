"use client";
import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type CartItem = {
  id: string;
  name: string;
  quantity: number;
  available: number;
  image?: string;
};

export type Product = {
  id: string;
  name: string;
  quantity: number;
  image?: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  getTotalItems: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const getTotalItems = useCallback(() => {
    return cart.length;
  }, [cart]);

  // Add a product to cart with specified quantity
  const addToCart = useCallback((product: Product, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const clampedQuantity = Math.max(1, Math.min(quantity, product.quantity));
      
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: clampedQuantity,
                available: product.quantity,
              }
            : item
        );
      }
      
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          quantity: clampedQuantity,
          available: product.quantity,
          image: product.image,
        },
      ];
    });
  }, []);

  // Remove product from cart
  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Update quantity of existing cart item
  const updateQuantity = useCallback((id: string, quantity: number) => {
    setCart((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;

      const newQuantity = Math.max(0, Math.min(quantity, item.available));
      
      if (newQuantity === 0) {
        return prev.filter((item) => item.id !== id);
      }
      
      return prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
    });
  }, []);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}