// src/app/success/page.tsx
import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

function Loading() {
  return <p>Chargement de votre commande...</p>;
}

export default function SuccessPage() {
  return (
    <div className="p-6 max-w-lg mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Paiement réussi 🧾</h1>
      <Suspense fallback={<Loading />}>
        <SuccessClient />
      </Suspense>
    </div>
  );
}
