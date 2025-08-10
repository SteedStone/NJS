'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return; // Prevent double processing
    const sessionId = searchParams.get("session_id");
    const orderId = searchParams.get("orderId");
    const pin = searchParams.get("pin");
    const paymentType = searchParams.get("payment");

    setProcessed(true); // Mark as being processed
    
    if (paymentType === "bakery" && orderId && pin) {
      // Handle bakery payment flow
      const fetchBakeryOrder = async () => {
        try {
          const res = await fetch(`/api/orders/${orderId}`);
          const data = await res.json();
          setOrder({...data, pin});
        } catch (err) {
          console.error("Erreur récupération commande:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchBakeryOrder();
    } else if (sessionId) {
      // Handle Stripe payment flow
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
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return <p>Traitement de votre commande...</p>;
  }

  if (!order?.items) {
    return <p>Erreur lors de la récupération de votre commande.</p>;
  }

  const paymentType = searchParams.get("payment");
  
  return (
    <div className="text-left">
      <p className="mb-4">Merci {order.name}, votre commande a été confirmée !</p>
      
      {order.pin && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-800">
                Code PIN de retrait
              </h3>
              <div className="text-2xl font-bold text-yellow-900 mt-2">
                {order.pin}
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                Présentez ce code PIN lors du retrait de votre commande en boulangerie.
                {paymentType === "bakery" && (
                  <>
                    <br />
                    <strong>Paiement à effectuer sur place.</strong>
                  </>
                )}
              </p>
              
            </div>
          </div>
        </div>
      )}

      {order.bakeryName && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="font-semibold text-blue-900">Lieu de retrait :</p>
          <p className="text-blue-800">{order.bakeryName}</p>
          {order.time && order.time !== "Aucun horaire" && (
            <p className="text-blue-700 text-sm">Horaire préféré : {order.time}</p>
          )}
        </div>
      )}
      
      <ul className="mb-4 list-disc pl-5">
        {order.items.map((item: any, i: number) => (
          <li key={i}>
            {item.product ? `${item.product.name} — Quantité : ${item.quantity}` : 
             `Produit ID: ${item.productId} — Quantité : ${item.quantity}`}
          </li>
        ))}
      </ul>
      
      <p className="font-bold text-right">
        Un e-mail de confirmation vous a été envoyé à {order.email} ✅
      </p>
      
      {paymentType === "bakery" && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
          <p className="text-green-800 font-medium">
            💡 N'oubliez pas d'apporter votre moyen de paiement pour régler en boulangerie !
          </p>
        </div>
      )}
    </div>
  );
}
