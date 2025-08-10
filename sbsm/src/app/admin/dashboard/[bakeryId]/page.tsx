"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import ProductsTab from "../../../_components/componentsDashboards/ProductsTab";
import { BAKERIES } from "../../../constants/bakeries";

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  archived?: boolean;
  description?: string;
  categories?: string[];
  types?: string[];
  stock?: Array<{
    bakeryId: string;
    quantity: number;
  }>;
};

type Order = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bakeryId?: string;
  bakeryName?: string;
  bakery?: string;
  createdAt: string;
  validated: boolean;
  pin?: string;
  time?: string;
  status?: "pending" | "ready" | "picked_up";
  paymentMethod?: string;
  isPaid?: boolean;
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

export default function BakeryDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const bakeryId = params.bakeryId as string;

  // Find current bakery
  const currentBakery = BAKERIES.find(b => b.id === bakeryId);

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restockValue, setRestockValue] = useState<{ [id: string]: number }>({});
  const [activeTab, setActiveTab] = useState<"products" | "add" | "copy" | "orders" | "archived" | "history">("products");
  const [loading, setLoading] = useState(true);

  // Add product form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [type, setType] = useState<string[]>([]);
  const [newType, setNewType] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  // Copy products state
  const [otherBakeryProducts, setOtherBakeryProducts] = useState<Product[]>([]);
  const [copyQuantities, setCopyQuantities] = useState<{ [id: string]: number }>({});
  const [selectedSourceBakery, setSelectedSourceBakery] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentBakery) {
      router.push('/admin/bakery-selection');
      return;
    }
    loadData();
  }, [bakeryId, currentBakery, router]);

  const loadData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch(`/api/bakery/${bakeryId}/products?includeArchived=true`),
        fetch(`/api/bakery/${bakeryId}/orders`),
      ]);

      const [productsData, ordersData] = await Promise.all([
        productsRes.json(),
        ordersRes.json(),
      ]);

      setProducts(Array.isArray(productsData) ? productsData : []);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading bakery data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSelection = () => {
    router.push('/admin/bakery-selection');
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout');
    router.push('/admin/login');
  };

  // Load products from other bakeries
  const loadOtherBakeryProducts = async (sourceBakeryId: string) => {
    if (!sourceBakeryId) {
      setOtherBakeryProducts([]);
      return;
    }

    try {
      const response = await fetch(`/api/bakery/${sourceBakeryId}/products`);
      const data = await response.json();
      setOtherBakeryProducts(data.filter((p: Product) => !p.archived));
    } catch (error) {
      console.error("Error loading other bakery products:", error);
      setOtherBakeryProducts([]);
    }
  };

  // Handle copying a product
  const handleCopyProduct = async (sourceProductId: string) => {
    const quantity = copyQuantities[sourceProductId] || 0;
    if (quantity <= 0) {
      alert("Veuillez saisir une quantité valide");
      return;
    }

    try {
      const response = await fetch(`/api/bakery/${bakeryId}/copy-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceProductId,
          quantity,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || "Produit copié avec succès !");
        // Refresh the products list
        loadData();
        // Reset the copy quantity
        setCopyQuantities(prev => ({ ...prev, [sourceProductId]: 0 }));
      } else {
        alert(result.error || "Erreur lors de la copie du produit");
      }
    } catch (error) {
      console.error("Error copying product:", error);
      alert("Erreur lors de la copie du produit");
    }
  };

  // Add product functionality
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/bakery/${bakeryId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price,
          quantity,
          image,
          description,
          categories,
          types: type,
        }),
      });

      if (response.ok) {
        const newProduct = await response.json();
        setProducts(prev => [newProduct, ...prev]);
        
        // Reset form
        setName("");
        setPrice(0);
        setQuantity(0);
        setImage("");
        setDescription("");
        setCategories([]);
        setType([]);
        setPreview(null);
        
        alert("Produit ajouté avec succès !");
      } else {
        alert("Erreur lors de l'ajout du produit");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Erreur lors de l'ajout du produit");
    }
  };

  // Archive product functionality
  const handleArchiveProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/bakery/${bakeryId}/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          archived: true,
        }),
      });

      if (response.ok) {
        setProducts(prev => 
          prev.map(p => p.id === productId ? { ...p, archived: true } : p)
        );
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Erreur lors de l'archivage du produit");
      }
    } catch (error) {
      console.error("Error archiving product:", error);
      alert("Erreur lors de l'archivage du produit");
    }
  };

  // Restore product functionality
  const handleRestoreProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/bakery/${bakeryId}/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          archived: false,
        }),
      });

      if (response.ok) {
        setProducts(prev => 
          prev.map(p => p.id === productId ? { ...p, archived: false } : p)
        );
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Erreur lors de la restauration du produit");
      }
    } catch (error) {
      console.error("Error restoring product:", error);
      alert("Erreur lors de la restauration du produit");
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bakery/${bakeryId}/orders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prev => 
          prev.map(order => order.id === orderId ? updatedOrder : order)
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  // Validate order
  const handleValidateOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/bakery/${bakeryId}/orders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          validated: true,
        }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prev => 
          prev.map(order => order.id === orderId ? updatedOrder : order)
        );
      }
    } catch (error) {
      console.error("Error validating order:", error);
    }
  };

  // Toggle payment status
  const handleTogglePaymentStatus = async (orderId: string, isPaid: boolean) => {
    try {
      const response = await fetch(`/api/bakery/${bakeryId}/orders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          isPaid: !isPaid,
        }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prev => 
          prev.map(order => order.id === orderId ? updatedOrder : order)
        );
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  // Delete product permanently
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement ce produit ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/bakery/${bakeryId}/products`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Erreur lors de la suppression du produit");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Erreur lors de la suppression du produit");
    }
  };

  // Delete all archived products
  const handleDeleteAllArchivedProducts = async () => {
    const archivedProducts = products.filter(p => p.archived);
    if (archivedProducts.length === 0) return;

    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement tous les ${archivedProducts.length} produits archivés ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/bakery/${bakeryId}/products`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteAllArchived: true }),
      });

      if (response.ok) {
        const result = await response.json();
        setProducts(prev => prev.filter(p => !p.archived));
        alert(result.message);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Erreur lors de la suppression des produits");
      }
    } catch (error) {
      console.error("Error deleting archived products:", error);
      alert("Erreur lors de la suppression des produits");
    }
  };

  // Delete order permanently
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement cette commande ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/bakery/${bakeryId}/orders`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Erreur lors de la suppression de la commande");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Erreur lors de la suppression de la commande");
    }
  };

  // Delete all validated orders
  const handleDeleteAllValidatedOrders = async () => {
    const validatedOrders = orders.filter(o => o.validated);
    if (validatedOrders.length === 0) return;

    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement toutes les ${validatedOrders.length} commandes validées ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/bakery/${bakeryId}/orders`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteAllValidated: true }),
      });

      if (response.ok) {
        const result = await response.json();
        setOrders(prev => prev.filter(o => !o.validated));
        alert(result.message);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Erreur lors de la suppression des commandes");
      }
    } catch (error) {
      console.error("Error deleting validated orders:", error);
      alert("Erreur lors de la suppression des commandes");
    }
  };

  // Generate PDF for all orders
  const generateAllOrdersPDF = () => {
    const activeOrders = orders.filter(o => !o.validated);
    if (activeOrders.length === 0) {
      alert("Aucune commande à imprimer");
      return;
    }

    const doc = new jsPDF();
    const margin = 20;
    let y = margin;
    const pageHeight = doc.internal.pageSize.height;

    // Header
    doc.setFontSize(20);
    doc.text(`Commandes - ${currentBakery?.name}`, margin, y);
    doc.setFontSize(12);
    doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, margin, y + 10);
    doc.text(`Total : ${activeOrders.length} commande(s)`, margin, y + 20);
    y += 35;

    activeOrders.forEach((order, index) => {
      // Check if we need a new page
      if (y > pageHeight - 80) {
        doc.addPage();
        y = margin;
      }

      // Order header
      doc.setFontSize(14);
      doc.text(`Commande ${index + 1}`, margin, y);
      doc.setFontSize(10);
      
      y += 8;
      doc.text(`Client : ${order.name}`, margin, y);
      if (order.pin) {
        doc.text(`PIN : ${order.pin}`, 120, y);
      }
      y += 6;
      
      if (order.phone) {
        doc.text(`Tél : ${order.phone}`, margin, y);
        y += 6;
      }
      
      if (order.time && order.time !== "Aucun horaire") {
        doc.text(`Horaire : ${order.time}`, margin, y);
        y += 6;
      }

      // Payment status
      if (order.paymentMethod === 'bakery') {
        const paymentStatus = order.isPaid ? 'PAYÉ' : 'NON PAYÉ';
        doc.text(`Paiement : ${paymentStatus}`, margin, y);
        y += 6;
      } else {
        doc.text(`Paiement : PAYÉ EN LIGNE`, margin, y);
        y += 6;
      }

      // Items
      y += 3;
      let orderTotal = 0;
      order.items.forEach((item) => {
        const itemTotal = item.quantity * item.product.price;
        orderTotal += itemTotal;
        doc.text(`${item.quantity}x ${item.product.name} - ${itemTotal.toFixed(2)} €`, margin + 5, y);
        y += 5;
      });

      // Total
      doc.setFontSize(12);
      doc.text(`Total : ${orderTotal.toFixed(2)} €`, margin, y + 3);
      
      // Separator
      y += 15;
      doc.line(margin, y, 190, y);
      y += 10;
    });

    doc.save(`commandes-${currentBakery?.name}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImage(result);
        setPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Get bakery-specific stats
  const bakeryStats = {
    totalProducts: (products || []).filter((p) => !p.archived).length,
    lowStock: (products || []).filter((p) => !p.archived && (p.quantity || 0) <= 5).length,
    pendingOrders: (orders || []).filter((o) => o.status === 'pending').length,
    readyOrders: (orders || []).filter((o) => o.status === 'ready').length,
  };

  if (!currentBakery) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfaf8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#eb7f13] mx-auto mb-4"></div>
          <p className="text-[#1c140d]">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf8] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-[#1c140d] flex items-center gap-3">
              <span>🏪</span>
              {currentBakery.name}
            </h1>
            <p className="text-gray-600">{currentBakery.address}</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleBackToSelection}
              className="px-4 py-2 bg-gray-200 text-[#1c140d] rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              ← Changer de boulangerie
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-200 text-red-800 rounded-lg hover:bg-red-300 transition-colors text-sm"
            >
              Se déconnecter
            </button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="text-2xl mb-2">📦</div>
            <div className="text-lg font-bold text-[#1c140d]">{bakeryStats.totalProducts}</div>
            <div className="text-sm text-gray-600">Produits actifs</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="text-2xl mb-2">⚠️</div>
            <div className="text-lg font-bold text-orange-600">{bakeryStats.lowStock}</div>
            <div className="text-sm text-gray-600">Stock faible</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="text-2xl mb-2">⏳</div>
            <div className="text-lg font-bold text-yellow-600">{bakeryStats.pendingOrders}</div>
            <div className="text-sm text-gray-600">En attente</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-lg font-bold text-green-600">{bakeryStats.readyOrders}</div>
            <div className="text-sm text-gray-600">Prêtes</div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md mb-8"
        >
          <div className="flex overflow-x-auto">
            {[
              { key: "products", label: "Produits", icon: "📦" },
              { key: "add", label: "Ajouter", icon: "➕" },
              { key: "copy", label: "Copier", icon: "📥" },
              { key: "orders", label: "Commandes", icon: "📋" },
              { key: "archived", label: "Archivés", icon: "📁" },
              { key: "history", label: "Historique", icon: "📊" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-[#eb7f13] border-b-2 border-[#eb7f13]"
                    : "text-gray-600 hover:text-[#1c140d]"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "products" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#1c140d]">
                  Produits - {currentBakery.name}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {products.filter(p => !p.archived).map((product) => (
                  <div
                    key={product.id}
                    className="p-4 border rounded-xl bg-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {product.image && (
                        <div className="h-24 w-24 relative overflow-hidden rounded-lg border">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-lg text-[#1c140d]">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          {product.price} € — <span className="font-medium">{product.quantity}</span> en stock
                        </p>
                        {product.description && (
                          <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                        )}
                        {product.categories && product.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {product.categories.map((cat, idx) => (
                              <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}
                        {product.types && product.types.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.types.map((type, idx) => (
                              <span key={idx} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                {type}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Qté"
                        value={restockValue[product.id] || ""}
                        onChange={(e) => setRestockValue(prev => ({ 
                          ...prev, 
                          [product.id]: parseInt(e.target.value) || 0 
                        }))}
                        className="w-20 border rounded px-2 py-1 text-sm"
                      />
                      <button
                        onClick={async () => {
                          const newQuantity = (product.quantity || 0) + (restockValue[product.id] || 0);
                          try {
                            const response = await fetch(`/api/bakery/${bakeryId}/products`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                productId: product.id,
                                quantity: newQuantity,
                              }),
                            });
                            if (response.ok) {
                              setProducts(prev => 
                                prev.map(p => p.id === product.id ? { ...p, quantity: newQuantity } : p)
                              );
                              setRestockValue(prev => ({ ...prev, [product.id]: 0 }));
                            }
                          } catch (error) {
                            console.error("Error restocking:", error);
                          }
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Restockage
                      </button>
                      <button
                        onClick={() => handleArchiveProduct(product.id)}
                        className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                      >
                        Archiver
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "add" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-[#1c140d] mb-6">
                Ajouter un produit à {currentBakery.name}
              </h2>
              
              <form onSubmit={handleAddProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du produit
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#eb7f13]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value))}
                      required
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#eb7f13]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantité
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      required
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#eb7f13]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                    {preview && (
                      <img
                        src={preview}
                        alt="Preview"
                        className="mt-2 w-32 h-32 object-cover rounded border"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#eb7f13]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégories
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg p-2 bg-white"
                      >
                        <option value="">Choisir une catégorie</option>
                        {PREDEFINED_CATEGORIES.filter(c => !categories.includes(c)).map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
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
                        className="bg-[#1c140d] text-white px-3 py-2 rounded"
                      >
                        Ajouter
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {categories.map((cat) => (
                        <span
                          key={cat}
                          className="bg-[#f3ede7] text-[#1c140d] text-sm px-3 py-1 rounded-full flex items-center"
                        >
                          {cat}
                          <button
                            type="button"
                            onClick={() => setCategories(prev => prev.filter(c => c !== cat))}
                            className="ml-2 text-xs text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Types
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg p-2 bg-white"
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
                        className="bg-[#1c140d] text-white px-3 py-2 rounded"
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
                            onClick={() => setType(prev => prev.filter(typ => typ !== t))}
                            className="ml-2 text-xs text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#eb7f13] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#d67110] transition-colors"
                >
                  Ajouter le produit
                </button>
              </form>
            </div>
          )}

          {activeTab === "copy" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-[#1c140d] mb-6">
                Copier des produits d'autres boulangeries
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choisir une boulangerie source
                </label>
                <select
                  value={selectedSourceBakery}
                  onChange={(e) => {
                    setSelectedSourceBakery(e.target.value);
                    loadOtherBakeryProducts(e.target.value);
                  }}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#eb7f13]"
                >
                  <option value="">Sélectionner une boulangerie...</option>
                  {BAKERIES.filter(b => b.id !== bakeryId).map((bakery) => (
                    <option key={bakery.id} value={bakery.id}>
                      {bakery.name}
                    </option>
                  ))}
                </select>
              </div>

              {otherBakeryProducts.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#1c140d]">
                    Produits disponibles chez {BAKERIES.find(b => b.id === selectedSourceBakery)?.name}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {otherBakeryProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-4 border rounded-xl bg-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          {product.image && (
                            <div className="h-16 w-16 relative overflow-hidden rounded-lg border">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-lg text-[#1c140d]">{product.name}</p>
                            <p className="text-sm text-gray-600">
                              {product.price} € — {product.quantity} en stock
                            </p>
                            {product.description && (
                              <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center gap-2">
                            <label className="text-sm text-gray-600">Quantité à copier</label>
                            <input
                              type="number"
                              min={0}
                              max={undefined}
                              value={copyQuantities[product.id] || 0}
                              onChange={(e) => setCopyQuantities(prev => ({
                                ...prev,
                                [product.id]: parseInt(e.target.value) || 0
                              }))}
                              className="w-20 border rounded px-2 py-1 text-sm text-center"
                            />
                          </div>
                          <button
                            onClick={() => handleCopyProduct(product.id)}
                            disabled={(copyQuantities[product.id] || 0) <= 0}
                            className="bg-[#eb7f13] text-white px-4 py-2 rounded text-sm hover:bg-[#d67110] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Copier
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedSourceBakery ? (
                <p className="text-gray-500 text-center py-8">
                  Aucun produit disponible dans cette boulangerie
                </p>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Sélectionnez une boulangerie pour voir ses produits
                </p>
              )}
            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#1c140d]">
                  Commandes de {currentBakery.name}
                </h2>
                {(orders || []).filter((o) => !o.validated).length > 0 && (
                  <button
                    onClick={generateAllOrdersPDF}
                    className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 flex items-center gap-2"
                  >
                    📄 PDF Toutes les commandes
                  </button>
                )}
              </div>
              
              {(orders || []).filter((o) => !o.validated).length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucune commande en attente
                </p>
              ) : (
                <div className="space-y-4">
                  {(orders || []).filter((o) => !o.validated).map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-[#1c140d]">
                            {order.name}
                          </h3>
                          {order.pin && (
                            <div className="text-lg font-bold text-[#eb7f13] mt-1">
                              PIN: {order.pin}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'ready' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status === 'pending' ? 'En attente' :
                             order.status === 'ready' ? 'Prête' : 'Récupérée'}
                          </span>
                          {order.paymentMethod === 'bakery' && (
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {order.isPaid ? 'Payé' : 'Non payé'}
                            </span>
                          )}
                          {order.paymentMethod === 'stripe' && (
                            <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                              Payé en ligne
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <p>📧 {order.email}</p>
                        {order.phone && <p>📱 {order.phone}</p>}
                        {order.time && <p>⏰ {order.time}</p>}
                        <p>📅 {new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>

                      </div>

                      <div className="mb-3">
                        <h4 className="font-medium mb-2">Articles:</h4>
                        <ul className="space-y-1">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="text-sm flex justify-between">
                              <span>{item.quantity}x {item.product.name}</span>
                              <span>{(item.quantity * item.product.price).toFixed(2)} €</span>

                            </li>
                          ))}
                        </ul>
                        <div className="text-right font-semibold mt-2 pt-2 border-t">
                          Total: {order.items.reduce((sum, item) => 
                            sum + (item.quantity * item.product.price), 0
                          ).toFixed(2)} €
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <button 
                          onClick={() => {
                            const nextStatus = order.status === 'pending' ? 'ready' : 'picked_up';
                            handleUpdateOrderStatus(order.id, nextStatus);
                          }}
                          className="flex-1 bg-[#eb7f13] text-white py-2 px-4 rounded hover:bg-[#d67110] transition-colors text-sm"
                        >
                          {order.status === 'pending' ? 'Marquer comme prête' : 
                           order.status === 'ready' ? 'Marquer comme récupérée' : 'Valider'}
                        </button>
                        
                        {order.paymentMethod === 'bakery' && (
                          <button
                            onClick={() => handleTogglePaymentStatus(order.id, order.isPaid || false)}
                            className={`py-2 px-4 rounded text-sm transition-colors ${
                              order.isPaid 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {order.isPaid ? 'Marquer non payé' : 'Marquer payé'}
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleValidateOrder(order.id)}
                          className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 text-sm"
                        >
                          Archiver
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "archived" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#1c140d]">
                  Produits archivés - {currentBakery.name}
                </h2>
                {products.filter(p => p.archived).length > 0 && (
                  <button
                    onClick={handleDeleteAllArchivedProducts}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                  >
                    Supprimer tout ({products.filter(p => p.archived).length})
                  </button>
                )}
              </div>
              
              {products.filter(p => p.archived).length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucun produit archivé
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {products.filter(p => p.archived).map((product) => (
                    <div
                      key={product.id}
                      className="p-4 border rounded-xl bg-gray-50 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        {product.image && (
                          <div className="h-24 w-24 relative overflow-hidden rounded-lg border">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover opacity-50"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-lg text-gray-600">{product.name}</p>
                          <p className="text-sm text-gray-500">
                            {product.price} € — Archivé
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRestoreProduct(product.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                        >
                          Restaurer
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#1c140d]">
                  Historique des commandes - {currentBakery.name}
                </h2>
                {orders.filter(o => o.validated).length > 0 && (
                  <button
                    onClick={handleDeleteAllValidatedOrders}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                  >
                    Supprimer tout ({orders.filter(o => o.validated).length})
                  </button>
                )}
              </div>
              
              {orders.filter(o => o.validated).length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucune commande dans l'historique
                </p>
              ) : (
                <div className="space-y-4">
                  {orders.filter(o => o.validated).map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 bg-green-50">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-[#1c140d]">
                          {order.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                            Validée
                          </span>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <p>📧 {order.email}</p>
                        {order.phone && <p>📱 {order.phone}</p>}
                        <p>📅 {new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                        <h4 className="font-medium mb-2">Résumé:</h4>
                        {order.items.map((item, idx) => (
                                                    <li key={idx} className="text-sm flex justify-between">
                                                      <span>{item.quantity}x {item.product.name}</span>
                                                    </li>
                                                  ))}

                      </div>
                      <div>
                        <div className="text-right font-semibold">
                          Total: {order.items.reduce((sum, item) => 
                            sum + (item.quantity * item.product.price), 0
                          ).toFixed(2)} €
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}