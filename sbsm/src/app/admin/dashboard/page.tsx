"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

// ⚠️ Ce composant suppose que l'accès est maintenant protégé côté serveur via un cookie + middleware
// Plus besoin de vérifier ici localStorage car la redirection se fait côté serveur.

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  
};

type Order = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
    };
  }[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restockValue, setRestockValue] = useState<{ [id: string]: number }>({});
  const [activeTab, setActiveTab] = useState<"products" | "add" | "orders" | "archived">("products");
  const [showArchived, setShowArchived] = useState(false); // Toggle for showing archived products



  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);
  useEffect(() => {
  fetch("/api/order")
    .then((res) => res.json())
    .then((data) => {
      setOrders(data);
    })
    .catch((err) => {
    });
}, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, quantity, image }),
    });
    if (res.ok) {
      const newProduct = await res.json();
      setProducts([newProduct, ...products]);
      setName("");
      setPrice(0);
      setQuantity(0);
      setImage("");
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
     <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Tableau de bord – Produits 🧁</h1>
    <div className="flex justify-center mb-8 space-x-4">
      <button
        onClick={() => setActiveTab("products")}
        className={`px-4 py-2 rounded font-semibold ${
          activeTab === "products"
            ? "bg-[#1c140d] text-white"
            : "bg-gray-200 text-[#1c140d]"
        }`}
      >
                📦 Produits

      </button>
      <button
        onClick={() => setActiveTab("add")}
        className={`px-4 py-2 rounded font-semibold ${
          activeTab === "add"
            ? "bg-[#1c140d] text-white"
            : "bg-gray-200 text-[#1c140d]"
        }`}
      >
                ➕ Ajouter

      </button>
      <button
        onClick={() => setActiveTab("orders")}
        className={`px-4 py-2 rounded font-semibold ${
          activeTab === "orders"
            ? "bg-[#1c140d] text-white"
            : "bg-gray-200 text-[#1c140d]"
        }`}
      >
        
        📋 Commandes
      </button>
      <button
        onClick={() => setActiveTab("archived")}
        className={`px-4 py-2 rounded font-semibold ${
          activeTab === "archived"
            ? "bg-[#1c140d] text-white"
            : "bg-gray-200 text-[#1c140d]"
        }`}
      >
         Archive
      </button>
    </div>

   
      {activeTab === "add" && (

      <form
        onSubmit={handleAddProduct}
        className="space-y-4 border p-4 rounded-lg bg-white shadow"
      >
        <h2 className="text-lg font-semibold">Ajouter un produit</h2>
        <input
          type="text"
          placeholder="Nom du produit"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Prix (€)"
          value={price || ""}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Quantité disponible"
          value={quantity || ""}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          required
          className="w-full border p-2 rounded"
        />

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="w-full h-32 flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer bg-gray-50"
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="h-full object-contain" />
          ) : (
            <p className="text-gray-500">Glissez une image ou cliquez pour choisir</p>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
          className="hidden"
        />

        <button className="bg-[#1c140d] text-white px-4 py-2 rounded">
          Ajouter
        </button>
      </form>
      )}
      {activeTab === "orders" && (
        <ul className="space-y-2">
          {orders.length === 0 && <p>Aucune commande trouvée.</p>}
          {orders.map((order) => (
            <li key={order.id} className="p-4 border rounded bg-white shadow">
              <p className="font-bold">Commande #{order.id}</p>
              <p>Client : {order.name} ({order.email})</p>
              <p>Date : {new Date(order.createdAt).toLocaleString()}</p>
              <ul className="ml-4 list-disc">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.product.name} — {item.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
      {activeTab === "products" && (

      <ul className="space-y-2">
        {products.map((product) => (
          <li key={product.id} className="p-4 border rounded-xl bg-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="h-24 w-24 object-cover rounded-lg border"
          />
        )}
        <div>
          <p className="font-semibold text-lg text-[#1c140d]">{product.name}</p>
          <p className="text-sm text-gray-600">
            {product.price} € — <span className="font-medium">{product.quantity}</span> en stock
          </p>
        </div>
      </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Ajout"
              value={restockValue[product.id] || ""}
              onChange={(e) =>
                setRestockValue((prev) => ({
                  ...prev,
                  [product.id]: parseInt(e.target.value || "0"),
                }))
              }
              className="w-20 p-1 border rounded text-sm text-center"
            />
            <button
              onClick={async () => {
                const quantityToAdd = restockValue[product.id] || 0;
                if (quantityToAdd <= 0) return;

                const res = await fetch("/api/products", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: product.id, quantityToAdd }),
                });

                if (res.ok) {
                  const updated = await res.json();
                  setProducts((prev) =>
                    prev.map((p) =>
                      p.id === updated.id ? { ...p, quantity: updated.quantity } : p
                    )
                  );
                  setRestockValue((prev) => ({ ...prev, [product.id]: 0 }));
                }
              }}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              ➕ Restocker
            </button>
            <button
              onClick={async () => {
                const quantityToAdd = restockValue[product.id] || 0;
                if (quantityToAdd <= 0) return;

                const res = await fetch("/api/products", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: product.id, quantityToAdd }),
                });

                if (res.ok) {
                  const updated = await res.json();
                  setProducts((prev) =>
                    prev.map((p) =>
                      p.id === updated.id ? { ...p, quantity: updated.quantity } : p
                    )
                  );
                  setRestockValue((prev) => ({ ...prev, [product.id]: 0 }));
                }
              }}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
               Archiver
            </button>
          </div>
        </li>

        ))}
        
        
      </ul>
      )}
      {activeTab === "archived" && (
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Produits archivés</h2>
          <p>Aucune fonctionnalité d'archivage implémentée pour l'instant.</p>
        </div>
      )}
    </div>
      
    
  );
}
