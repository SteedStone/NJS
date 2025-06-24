import "~/styles/globals.css";
import { CartProvider } from "./context/CartContext";
import CartDropdown from "./_components/CartDropdown"; // adapte le chemin si besoin
import Providers from "./providers"; // Import the Providers component


// app/layout.tsx
import Link from "next/link";


export const metadata = {
  title: "The Daily Crumb",
};



export default function RootLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <html lang="en">
      <body className="bg-[#fcfaf8] font-['Epilogue','Noto Sans',sans-serif]">
         <Providers> 
        <header className="flex justify-between items-center px-10 py-4 border-b border-[#f3ede7]">
          <div className="flex items-center gap-4 text-[#1b140d]">
            <svg viewBox="0 0 48 48" className="w-5 h-5" fill="currentColor">
              <path d="M42.1739 20.1739L27.8261 5.82609..." />
            </svg>
            <Link  className="text-lg font-bold tracking-tight" href="/">The Daily Crumb</Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/locations" className="text-sm font-medium text-[#1b140d]">Locations</Link>
            <Link href="/our-story" className="text-sm font-medium text-[#1b140d]">About Us</Link>
            {/* Remplace le bouton "Order Online" par un bouton "Panier" */}
<CartDropdown />          </nav>
        </header>

        <main>{children}</main>

        <footer className="text-center border-t border-[#f3ede7] py-6">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#9a734c] mb-4">
            <Link href="#">Contact Us</Link>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
          </div>
          <p className="text-[#9a734c] text-sm">© 2024 The Daily Crumb. All rights reserved.</p>
        </footer>
        </Providers>
      </body>
      
    </html>
  );
}
