"use client";

import { useState } from "react";
import Link from "next/link";
import CartDropdown from "./CartDropdown";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile-first responsive header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-[#f3ede7] px-4 sm:px-6 lg:px-10 py-3 sm:py-4 shadow-sm">
        <div className="flex justify-between items-center">
          {/* Logo section - responsive sizing */}
          <div className="flex items-center gap-2 sm:gap-4 text-[#1b140d]">
            <svg viewBox="0 0 48 48" className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor">
              <path d="M42.1739 20.1739L27.8261 5.82609C26.3478 4.34783 23.6522 4.34783 22.1739 5.82609L7.82609 20.1739C6.34783 21.6522 6.34783 24.3478 7.82609 25.8261L22.1739 40.1739C23.6522 41.6522 26.3478 41.6522 27.8261 40.1739L42.1739 25.8261C43.6522 24.3478 43.6522 21.6522 42.1739 20.1739Z" />
            </svg>
            <Link className="text-lg sm:text-xl font-bold tracking-tight truncate" href="/">
              The Daily Crumb
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium text-[#1b140d]">
            <Link href="/" className="hover:text-[#eb7f13] transition-colors">
              Accueil
            </Link>
            <Link href="/localisations" className="hover:text-[#eb7f13] transition-colors">
              Nos boulangeries
            </Link>
            <Link href="/our-story" className="hover:text-[#eb7f13] transition-colors">
              À propos
            </Link>
            <CartDropdown />
          </nav>
          
          {/* Mobile navigation - hamburger menu */}
          <div className="md:hidden flex items-center gap-2">
            <CartDropdown />
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#1b140d] hover:text-[#eb7f13] transition-colors"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu dropdown */}
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} mt-4 pb-4 border-t border-[#f3ede7] pt-4`}>
          <nav className="flex flex-col gap-4 text-sm font-medium text-[#1b140d]">
            <Link 
              href="/" 
              className="hover:text-[#eb7f13] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link 
              href="/localisations" 
              className="hover:text-[#eb7f13] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Nos boulangeries
            </Link>
            <Link 
              href="/our-story" 
              className="hover:text-[#eb7f13] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              À propos
            </Link>
          </nav>
        </div>
      </header>

      {/* Responsive main content */}
      <main className="pt-4 sm:pt-6 lg:pt-8 pb-8 sm:pb-12">{children}</main>

      {/* Mobile-responsive footer */}
      <footer className="text-center border-t border-[#f3ede7] py-4 sm:py-6 bg-[#fcfaf8] mt-6 sm:mt-10">
        {/* Mobile-friendly footer links */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-[#9a734c] mb-3 sm:mb-4 px-4">
          <Link href="/contact" className="hover:text-[#eb7f13] transition-colors">
            Contact
          </Link>
          <Link href="/confidentialite" className="hover:text-[#eb7f13] transition-colors">
            Confidentialité
          </Link>
          <Link href="/cgu" className="hover:text-[#eb7f13] transition-colors text-center">
            CGU
          </Link>
          <Link href="/admin/login" className="hover:text-[#eb7f13] transition-colors">
            Admin
          </Link>
        </div>
        <p className="text-[#9a734c] text-xs sm:text-sm px-4">
          © 2024 The Daily Crumb. Tous droits réservés.
        </p>
      </footer>
    </>
  );
}