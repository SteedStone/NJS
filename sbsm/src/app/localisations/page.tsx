// app/localisation/page.tsx ou pages/localisation.tsx
"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const Map = dynamic(() => import("../_components/Map"), { ssr: false });

export default function LocalisationPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Nos Boulangeries</h1>
      <Map />
    </div>
  );
}
