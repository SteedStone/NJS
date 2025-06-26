"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
const iconUrl = require("leaflet/dist/images/marker-icon.png");
const shadowUrl = require("leaflet/dist/images/marker-shadow.png");

// Icône personnalisée
const customIcon = new L.Icon({
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Exemple de données enrichies
const boulangeries = [
  {
    id: 1,
    name: "Boulangerie Centrale",
    lat: 48.8566,
    lng: 2.3522,
    commune: "Paris 1er",
    horaires: "Lun - Sam : 7h - 19h",
  },
  {
    id: 2,
    name: "Pain d’Or",
    lat: 48.864716,
    lng: 2.349014,
    commune: "Paris 2e",
    horaires: "Mar - Dim : 6h30 - 20h",
  },
  {
    id: 3,
    name: "Le Croissant Doré",
    lat: 48.8600,
    lng: 2.3400,
    commune: "Paris 3e",
    horaires: "Tous les jours : 7h - 18h",
  },
];

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 16);
  return null;
}

export default function Map() {
  const [selectedCenter, setSelectedCenter] = useState<[number, number] | null>(null);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Carte */}
      <div className="w-full md:w-3/4 h-[500px]">
        <MapContainer center={[48.8566, 2.3522]} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {boulangeries.map((b) => (
            <Marker key={b.id} position={[b.lat, b.lng]} icon={customIcon}>
              <Popup>{b.name}</Popup>
            </Marker>
          ))}
          {selectedCenter && <ChangeView center={selectedCenter} />}
        </MapContainer>
      </div>

      {/* Cadre latéral */}
      <div className="w-full md:w-1/4 bg-white p-6 shadow-lg rounded-xl h-[500px] overflow-y-auto border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-[#1c140d]">Nos Boulangeries</h2>
        <ul className="space-y-4">
          {boulangeries.map((b) => (
            <li
              key={b.id}
              className="border-b pb-3 last:border-none cursor-pointer hover:bg-gray-100 rounded-md p-2 transition"
              onClick={() => setSelectedCenter([b.lat, b.lng])}
            >
              <p className="font-bold text-[#eb7f13]">{b.commune}</p>
              <p className="text-[#1c140d]">{b.name}</p>
              <p className="text-sm text-gray-600">{b.horaires}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
