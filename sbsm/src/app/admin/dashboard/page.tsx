"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import ProductsTab from "../../_components/componentsDashboards/ProductsTab";



// ⚠️ Ce composant suppose que l'accès est maintenant protégé côté serveur via un cookie + middleware
// Plus besoin de vérifier ici localStorage car la redirection se fait côté serveur.

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  archived?: boolean; // Ajouté pour gérer l'archivage
  
};

type Order = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bakery?: string;
  createdAt: string;
  validated: boolean;
  pin?: string; // Code PIN pour la commande
  time?: string; // Heure de la commande
  status?: "pending" | "ready" | "picked_up";
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


const PREDEFINED_CATEGORIES = [
  "Pâtisserie",
  "Viennoiserie",
  "Boulangerie",
];
const PREDEFINED_TYPES = [
  "Sans gluten",
  "Sans sucre",
  "Vegan",
  "Bio",
  "Complet"
];

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
  const [activeTab, setActiveTab] = useState<"products" | "add" | "orders" | "archived" | "history">("products");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [type, setType] = useState<string[]>([]);
  const [newType, setNewType] = useState("");
  const [bakeryFilter, setBakeryFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);





  const [orderStatuses, setOrderStatuses] = useState<{ [orderId: string]: "pending" | "ready" | "picked" }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          fetch("/api/products?includeArchived=true"),
          fetch("/api/order"),
        ]);

        const [productsData, ordersData] = await Promise.all([
          productsRes.json(),
          ordersRes.json(),
        ]);

        setProducts(productsData);
        setOrders(ordersData);
      } catch (err) {
        console.error("Erreur de chargement :", err);
      } finally {
        setLoading(false); // toujours désactiver le chargement à la fin
      }
    }

    loadData();
  }, []);
  const generateAllOrdersPdf = () => {
    const doc = new jsPDF();
    const margin = 10;
    const pageHeight = doc.internal.pageSize.height;
    let y = margin;

    const filteredOrders = orders.filter(
      (order) => !order.validated && (!bakeryFilter || order.bakery === bakeryFilter)
    );

    if (filteredOrders.length === 0) {
      alert("Aucune commande à exporter.");
      return;
    }

    filteredOrders.forEach((order, idx) => {
      // Hauteur de départ du cadre
      const boxTop = y;

      // Titre encadré
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y, 190, 10, 'F');
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text(`Commande #${order.id}`, margin + 2, y + 7);
      y += 14;

      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      doc.text(`Client : ${order.name} (${order.email})`, margin + 2, y); y += 6;
      doc.text(`Téléphone : ${order.phone || "Non renseigné"}`, margin + 2, y); y += 6;
      doc.text(`Boulangerie : ${order.bakery || "Non renseignée"}`, margin + 2, y); y += 6;
      doc.text(`Date : ${new Date(order.createdAt).toLocaleString()}`, margin + 2, y); y += 6;
      doc.text(`Heure de retrait : ${order.time || "Non renseigné"}`, margin + 2, y); y += 6;
      doc.text(`Code PIN : ${order.pin}`, margin + 2, y); y += 8;

      doc.setFont( "bold");
      doc.text("Produits :", margin + 2, y); y += 6;
      doc.setFont("normal");

      order.items.forEach((item) => {
        doc.text(`• ${item.product.name} x${item.quantity}`, margin + 10, y);
        y += 5;
      });

      y += 6;

      // Encadré visuel
      const boxHeight = y - boxTop;
      doc.setDrawColor(200);
      doc.rect(margin, boxTop, 190, boxHeight);

      // Nouvelle page si on est en bas
      if (y + 30 > pageHeight && idx !== filteredOrders.length - 1) {
        doc.addPage();
        y = margin;
      }
    });

    doc.save("commandes.pdf");
  };



  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, quantity, image, description, categories , types: type}),
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
  const handleValidateOrder = async (orderId: string) => {
    const res = await fetch("/api/order/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, validated: true }),
    });

    if (res.ok) {
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, validated: true } : order
        )
      );
    } else {
      alert("Échec de la validation : code PIN incorrect.");
    }
  };
  const updateOrderStatus = async (orderId: string, status: "pending" | "ready" | "picked_up") => {
    const res = await fetch("/api/order/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });

    if (res.ok) {
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status } : order
        )
      );
    } else {
      alert("Échec de la mise à jour du statut.");
    }
  };
  const getNextStatus = (current: "pending" | "ready" | "picked_up" | undefined): "pending" | "ready" | "picked_up" => {
    switch (current) {
      case "pending":
        return "ready";
      case "ready":
        return "picked_up";
      case "picked_up":
      default:
        return "pending";
    }
  };
  
  


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-t-[#1c140d] border-gray-300 rounded-full"></div>
      </div>
    );
  }
  return (
     <div className="p-4 sm:p-6 lg:p-8 max-w-full sm:max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Tableau de bord – Produits </h1>
    <div className="flex flex-wrap justify-center mb-6 sm:mb-8 gap-2 sm:gap-4">
      <button
        onClick={() => setActiveTab("products")}
        className={`px-3 py-2 sm:px-4 text-sm font-semibold rounded ${
          activeTab === "products"
            ? "bg-[#1c140d] text-white"
            : "bg-gray-200 text-[#1c140d]"
        }`}
      >
                 Produits

      </button>
      <button
        onClick={() => setActiveTab("add")}
        className={`px-4 py-2 rounded font-semibold ${
          activeTab === "add"
            ? "bg-[#1c140d] text-white"
            : "bg-gray-200 text-[#1c140d]"
        }`}
      >
                 Ajouter

      </button>
      <button
        onClick={() => setActiveTab("orders")}
        className={`px-4 py-2 rounded font-semibold ${
          activeTab === "orders"
            ? "bg-[#1c140d] text-white"
            : "bg-gray-200 text-[#1c140d]"
        }`}
      >
        Commandes
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
      <button
        onClick={() => setActiveTab("history")}
        className={`px-4 py-2 rounded font-semibold ${
          activeTab === "history"
            ? "bg-[#1c140d] text-white"
            : "bg-gray-200 text-[#1c140d]"
        }`}
      >
         Historique
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
        <input
          type="text"
          placeholder="Description du produit"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />

        <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Catégories
        </label>

        {/* Menu déroulant pour choisir une catégorie */}
        <div className="flex gap-2">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 bg-white"
          >
            <option value=""> Choisir une catégorie </option>
            {PREDEFINED_CATEGORIES.filter((cat) => !categories.includes(cat)).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              if (newCategory && !categories.includes(newCategory)) {
                setCategories([...categories, newCategory]);
                setNewCategory("");
              }
            }}
            className="bg-[#1c140d] text-white px-3 py-1 rounded"
          >
             Ajouter
          </button>
        </div>

        {/* Affichage des catégories ajoutées */}
        <div className="flex flex-wrap gap-2 mt-2">
          {categories.map((cat) => (
            <span
              key={cat}
              className="bg-[#f3ede7] text-[#1c140d] text-sm px-3 py-1 rounded-full flex items-center"
            >
              {cat}
              <button
                type="button"
                onClick={() =>
                  setCategories((prev) => prev.filter((c) => c !== cat))
                }
                className="ml-2 text-xs text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Types (ex: Sans gluten, Vegan...)</label>
      <div className="flex gap-2">
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 bg-white"
        >
          <option value="">Choisir un type</option>
          {PREDEFINED_TYPES.filter(t => !type.includes(t)).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            if (newType && !type.includes(newType)) {
              setType([...type, newType]);
              setNewType("");
            }
          }}
          className="bg-[#1c140d] text-white px-3 py-1 rounded"
        >
          Ajouter
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {type.map((t) => (
          <span
            key={t}
            className="bg-[#f3ede7] text-[#1c140d] text-sm px-3 py-1 rounded-full flex items-center"
          >
            {t}
            <button
              type="button"
              onClick={() => setType(prev => prev.filter(x => x !== t))}
              className="ml-2 text-xs text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>

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
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Filtrer par boulangerie :</label>
            <select
              onChange={(e) => setBakeryFilter(e.target.value || null)}
              value={bakeryFilter || ""}
              className="border p-2 rounded w-full max-w-xs"
            >
              <option value="">Toutes les boulangeries</option>
              {[...new Set(orders.map(o => o.bakery).filter(Boolean))].map((bakery, i) => (
                <option key={i} value={bakery}>{bakery}</option>
              ))}
            </select>
          </div>
          <button
            onClick={generateAllOrdersPdf}
            className="bg-[#1c140d] text-white px-4 py-2 rounded shadow"
          >
            🧾 Exporter toutes les commandes en PDF
          </button>

          {orders.filter(order => !order.validated && (!bakeryFilter || order.bakery === bakeryFilter)).length === 0 ? (
            <div className="text-gray-500">Aucune commande trouvée.</div>
          ) : (
            <ul className="space-y-2">
              {orders
                .filter(order => !order.validated && (!bakeryFilter || order.bakery === bakeryFilter))
                .map((order, index) => (
                  <li key={order.id} className="p-4 border rounded bg-white shadow">
                    <p className="font-bold">Commande #{order.id}</p>
                    <p>Client : {order.name} ({order.email})</p>
                    <p>Date : {new Date(order.createdAt).toLocaleString()}</p>
                    <p>Téléphone : {order.phone || "Non renseigné"}</p>
                    <p>Boulangerie : {order.bakery || "Non renseignée"}</p>
                    <p>Heure de passage : {order.time || "Non renseigné"}</p>
                    <p>🔐 Code de retrait : <strong>{order.pin}</strong></p>
                    <ul className="ml-4 list-disc">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.product.name} — {item.quantity}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => {
                        const next = getNextStatus(order.status);
                        updateOrderStatus(order.id, next);
                      }}
                      className={`mt-2 px-3 py-1 rounded text-sm font-medium
                        ${order.status === "pending" ? "bg-red-500 text-white" : ""}
                        ${order.status === "ready" ? "bg-orange-400 text-white" : ""}
                        ${order.status === "picked_up" ? "bg-green-600 text-white" : ""}
                      `}
                    >
                      {order.status === "pending" && "⏳ En attente"}
                      {order.status === "ready" && "🚧 Prête"}
                      {order.status === "picked_up" && "✅ Emportée"}
                    </button>
                    <button
                      onClick={() => handleValidateOrder(order.id)}
                      className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      ✔ Valider
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </>
      )}

      {activeTab === "products" && (
      <ProductsTab
        products={products}
        restockValue={restockValue}
        setRestockValue={setRestockValue}
        setProducts={setProducts}
      />
  )}
      {activeTab === "archived" && (
        <ul className="space-y-2">
          {products.filter(p => p.archived).map(product => (
            <li key={product.id} className="p-4 border rounded-xl bg-gray-100 shadow-sm flex justify-between items-center">
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-gray-500">{product.price} € — Stock : {product.quantity}</p>
              </div>
              <button
                onClick={async () => {
                  const res = await fetch("/api/products", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: product.id, archive: false }),
                  });

                  if (res.ok) {
                    setProducts(prev => prev.map(p =>
                      p.id === product.id ? { ...p, archived: false } : p
                    ));
                  }
                }}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                ✅ Rendre disponible
              </button>
            </li>
          ))}
        </ul>
      )}

      {activeTab === "history" && (
        <ul className="space-y-2">
          {orders.filter(order => order.validated && (!bakeryFilter || order.bakery === bakeryFilter)).map(order => (
            <li key={order.id} className="p-4 border rounded bg-white shadow flex justify-between items-start">
              <div>
                <p className="font-bold">Commande #{order.id}</p>
                <p>Client : {order.name} ({order.email})</p>
                <p>Date : {new Date(order.createdAt).toLocaleString()}</p>
                <p>Téléphone : {order.phone || "Non renseigné"}</p>
                <p>Boulangerie : {order.bakery || "Non renseignée"}</p>
                <ul className="ml-4 list-disc">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.product.name} — {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={async () => {
                  const res = await fetch("/api/order/validate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId: order.id, validated: false }),
                  });

                  if (res.ok) {
                    setOrders(prev => prev.map(o =>
                      o.id === order.id ? { ...o, validated: false } : o
                    ));
                  } else {
                    alert("Échec de la désarchivage de la commande.");
                  }
                }}
                className="bg-gray-400 text-white px-3 py-1 rounded text-sm"
              >
                ❌ Rétablir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
      
    
  );
}
