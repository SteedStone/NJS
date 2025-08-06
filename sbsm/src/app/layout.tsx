// UPDATED: Mobile-responsive layout.tsx
import "~/styles/globals.css";
import { CartProvider } from "./context/CartContext";
import CartDropdown from "./_components/CartDropdown";
import Providers from "./providers";
import Link from "next/link";
import ClientLayout from "./_components/ClientLayout";

export const metadata = {
  title: "The Daily Crumb",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <html lang="en">
      <body className="bg-[#fcfaf8] font-['Epilogue','Noto Sans',sans-serif]">
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}