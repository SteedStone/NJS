// UPDATED: Improved layout.tsx for a better structure and design
import "~/styles/globals.css";
import { CartProvider } from "./context/CartContext";
import CartDropdown from "./_components/CartDropdown";
import Providers from "./providers";
import Link from "next/link";

export const metadata = {
  title: "The Daily Crumb",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#fcfaf8] font-['Epilogue','Noto Sans',sans-serif]">
        <Providers>
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-[#f3ede7] px-10 py-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 text-[#1b140d]">
                <svg viewBox="0 0 48 48" className="w-6 h-6" fill="currentColor">
                  <path d="M42.1739 20.1739L27.8261 5.82609..." />
                </svg>
                <Link className="text-xl font-bold tracking-tight" href="/">
                  The Daily Crumb
                </Link>
              </div>
              <nav className="flex items-center gap-6 text-sm font-medium text-[#1b140d]">
                <Link href="/">Acceuil</Link>
                <Link href="/localisations">Nos boulangeries</Link>
                <Link href="/our-story">À propos</Link>
                <CartDropdown />
              </nav>
            </div>
          </header>

          <main className="pt-8 pb-12">{children}</main>

          <footer className="text-center border-t border-[#f3ede7] py-6 bg-[#fcfaf8] mt-10">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-[#9a734c] mb-4">
              <Link href="/contact">Contact</Link>
              <Link href="/confidentialite">Confidentialité</Link>
              <Link href="/cgu">Conditions Générales d'Utilisation</Link>
              <Link href="/admin/login">Admin</Link>

            </div>
            <p className="text-[#9a734c] text-sm">
              © 2024 The Daily Crumb. Tous droits réservés.
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
