
"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="bg-[#fcfaf8] min-h-screen font-['Epilogue','Noto Sans',sans-serif]">
      

      <section className="bg-cover bg-center text-white flex flex-col items-center justify-center text-center px-6 py-20" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1606851091899-bb3fdbec0fa4?auto=format&fit=crop&w=1950&q=80')" }}>
        <h1 className="text-4xl font-black mb-2">Freshly Baked Goods Delivered Daily</h1>
        <p className="text-base mb-6">Indulge in our artisanal breads, pastries, and cakes, crafted with the finest ingredients.</p>
        <Link href="/order" className="bg-[#eb7f13] text-[#1b140d] font-bold px-5 py-3 rounded-lg hover:bg-[#d67110] transition">Order Now</Link>
      </section>

      <main className="max-w-5xl mx-auto px-4 py-16 space-y-16">
        <section>
          <h2 className="text-3xl font-bold mb-4 text-[#1b140d]">Our Specialties</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6">
            <div className="flex flex-col gap-2">
              <div className="aspect-video rounded-lg bg-cover bg-center" style={{ backgroundImage: "url('https://via.placeholder.com/400x225')" }}></div>
              <h3 className="text-base font-medium text-[#1b140d]">Artisanal Breads</h3>
              <p className="text-sm text-[#9a734c]">Our breads are made with traditional techniques.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-[#1b140d]">Find Us</h2>
          <p className="text-base text-[#1b140d] mb-4">Visit our downtown bakery and enjoy the smell of fresh bread!</p>
        </section>
      </main>

      
    </div>
  );
}

