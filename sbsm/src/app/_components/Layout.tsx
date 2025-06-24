"use client";

import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <nav className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">🥐 Boulangerie NDS</h1>
          <div className="space-x-4">
            <Link href="/" className="hover:underline">Accueil</Link>
            <Link href="/products" className="hover:underline">Produits</Link>
            <Link href="#reservations" className="hover:underline">Réservations</Link>
          </div>
        </nav>
      </header>

      {/* Contenu */}
      <main className="flex-1 container mx-auto p-6">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-4">
        <p className="text-sm text-gray-500">© 2025 Boulangerie NDS. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
