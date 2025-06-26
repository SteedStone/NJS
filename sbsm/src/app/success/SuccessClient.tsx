'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return;

    const confirmOrder = async () => {
      try {
        const res = await fetch("/api/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error("Erreur confirmation:", err);
      } finally {
        setLoading(false);
      }
    };

    confirmOrder();
  }, [searchParams]);

  if (loading) {
    return <p>Traitement de votre commande...</p>;
  }

  if (!order?.items) {
    return <p>Erreur lors de la récupération de votre commande.</p>;
  }

  return (
    <div className="text-left">
      <p className="mb-4">Merci {order.name}, votre commande a été confirmée !</p>
      <ul className="mb-4 list-disc pl-5">
        {order.items.map((item: any, i: number) => (
          <li key={i}>
            Produit ID: {item.productId} — Quantité : {item.quantity}
          </li>
        ))}
      </ul>
      <p className="font-bold text-right">
        Un e-mail de confirmation vous a été envoyé à {order.email} ✅
      </p>
    </div>
  );
}
