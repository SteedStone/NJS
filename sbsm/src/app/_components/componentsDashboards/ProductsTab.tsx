import React from "react";
import type { Product} from "./types";

type ProductsTabProps = {
  products: Product[];
  restockValue: { [id: string]: number };
  setRestockValue: React.Dispatch<React.SetStateAction<{ [id: string]: number }>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
};

export default function ProductsTab({
  products,
  restockValue,
  setRestockValue,
  setProducts,
}: ProductsTabProps) {
  const handleRestock = async (productId: string) => {
    const quantityToAdd = restockValue[productId] || 0;
    if (quantityToAdd <= 0) return;

    const res = await fetch("/api/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: productId, quantityToAdd }),
    });

    if (res.ok) {
      const updated = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? { ...p, quantity: updated.quantity } : p))
      );
      setRestockValue((prev) => ({ ...prev, [productId]: 0 }));
    }
  };

  const handleArchive = async (productId: string) => {
    const res = await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: productId, archive: true }),
    });

    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, archived: true } : p))
      );
    }
  };

  const handleDelete = async (productId: string) => {
    const confirmDelete = confirm("Supprimer ce produit définitivement ?");
    if (!confirmDelete) return;

    const res = await fetch(`/api/products?id=${productId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } else {
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <ul className="space-y-2">
      {products.filter((p) => !p.archived).map((product) => (
        <li
          key={product.id}
          className="p-4 border rounded-xl bg-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
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
              onClick={() => handleRestock(product.id)}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              ➕ Restocker
            </button>
            <button
              onClick={() => handleArchive(product.id)}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Archiver
            </button>
            <button
              onClick={() => handleDelete(product.id)}
              className="bg-red-800 text-white px-3 py-1 rounded text-sm"
            >
              🗑 Supprimer
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}