// src/app/form/FormClient.tsx
'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// Tes types
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

const timeperiod = [
  "Aucun horaire",
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00",
  "20:00 - 21:00",
];

const bakeries = [
  { id: "1", name: "Boulangerie Centrale", lat: 48.8566, lng: 2.3522 },
  { id: "2", name: "Pain d’Or", lat: 48.864716, lng: 2.349014 },
  { id: "3", name: "Le Croissant Doré", lat: 48.86, lng: 2.34 },
];

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function FormClient() {
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [phone, setPhone] = useState("");
  const [selectedBakery, setSelectedBakery] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const cartParam = searchParams.get("cart");
    if (cartParam) {
      setCart(JSON.parse(decodeURIComponent(cartParam)));
    }
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const closest = bakeries.reduce((prev, curr) => {
          const prevDist = haversine(latitude, longitude, prev.lat, prev.lng);
          const currDist = haversine(latitude, longitude, curr.lat, curr.lng);
          return currDist < prevDist ? curr : prev;
        });
        setSelectedBakery(closest.name);
      },
      () => {
        console.warn("Géolocalisation refusée");
      }
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
          customer: { name, email, phone, bakery: selectedBakery, time: time },
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
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
      const product = products.find((p) => p.id === item.productId);
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
                  {item.quantity} × {product?.price.toFixed(2)} € ={" "}
                  {(item.quantity * (product?.price ?? 0)).toFixed(2)} €
                </p>
              </div>
              {item.image && (
                <img
                  src={item.image}
                  alt={product?.name}
                  className="w-12 h-12 object-cover rounded ml-2"
                />
              )}
            </li>
          );
        })}
      </ul>
      <div className="text-right text-sm font-bold">
        Total de la commande : {getTotalPrice().toFixed(2)} €
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
        <input
          type="tel"
          placeholder="Numéro de téléphone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
        <h4 className="text-lg font-semibold mb-2">
          Choisissez votre boulangerie (Par défaut : la plus proche de vous) :
        </h4>
        <select
          value={selectedBakery}
          onChange={(e) => setSelectedBakery(e.target.value)}
          required
          className="w-full border p-2 rounded"
        >
          <option value="">Choisissez une boulangerie</option>
          {bakeries.map((b) => (
            <option key={b.id} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>
        <h4 className="text-lg font-semibold mb-2">
          Choisissez l'horaire de passage (Par défaut : Aucun horaire) :
        </h4>
        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          className="w-full border p-2 rounded"
        >
          <option value="">Choisissez un horaire de passage</option>
          {timeperiod.map((period, index) => (
            <option key={index} value={period}>
              {period}
            </option>
          ))}
        </select>
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
