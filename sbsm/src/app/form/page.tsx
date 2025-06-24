"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type CartItem = {
  productId: string;
  quantity: number;

};
type Product = {
  id: string;
  name: string;
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
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, items: cart }),
    });

    if (response.ok) {
      alert("Commande enregistrée !");
      window.location.href = "/"; // ou une page de confirmation
    } else {
      alert("Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Finalisez votre commande</h1>

      <ul className="mb-4 list-disc pl-6 text-sm">
        {cart.map((item, index) => {
          const product = products.find((p) => p.id === item.productId);
          return (
            <li key={index}>
              {product?.name || "Produit inconnu"} — Quantité : {item.quantity}
            </li>
          );
        })}
      </ul>


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
