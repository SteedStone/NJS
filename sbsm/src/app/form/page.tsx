"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type CartItem = {
  productId: string;
  quantity: number;
  price?: number;
  image?: string;

};
type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};


export default function FormPage() {
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [products, setProducts] = useState<Product[]>([]);


  useEffect(() => {
    const cartParam = searchParams.get("cart");
    if (cartParam) {
      setCart(JSON.parse(decodeURIComponent(cartParam)));
    }
    fetch("/api/products")
    .then((res) => res.json())
    .then((data) => setProducts(data));
    
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // enrichir le panier avec les vrais prix et noms
  const enrichedCart = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      productId: item.productId,
      quantity: item.quantity,
      price: product?.price ?? 0,
      name: product?.name ?? "Produit inconnu",
    };
  });

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cart: enrichedCart,
        customer: { name, email },
      }),
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url; // Redirige vers Stripe
    } else {
      alert("Erreur : aucune URL de paiement reçue.");
    }
  } catch (err) {
    console.error("Erreur lors de l'envoi au paiement :", err);
    alert("Une erreur est survenue.");
  }
};


  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        return total + (product?.price ?? 0) * item.quantity;
      }, 0);
    };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Finalisez votre commande</h1>

      <ul className="mb-4 list-disc pl-6 text-sm">
        {cart.map((item, index) => {
          const product = products.find((p) => p.id === item.productId);
          return (
           <li key={index} className="flex justify-between items-center mb-2">
            <div>
              <p className="font-medium">{product?.name || "Produit inconnu"}</p>
              <p className="text-xs text-gray-500">
                {item.quantity} × {product?.price.toFixed(2)} € = {(item.quantity * (product?.price ?? 0)).toFixed(2)} €
              </p>
            </div>
            {item.image && (
              <img src={item.image} alt={product?.name} className="w-12 h-12 object-cover rounded ml-2" />
            )}
          </li>
          );
        })}
      </ul>
      <div className="text-right text-sm font-bold">
        Total de la commande : {getTotalPrice().toFixed(2)} €
      </div>


      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-[#1c140d] text-white px-4 py-2 rounded-xl text-sm font-semibold"
        >
          Envoyer la commande
        </button>
      </form>
    </div>
  );
}
