"use client";

import Link from "next/link";
import SplitText from "SplitText";


export default function HomePage() {
  return (
    <div className="bg-[#fcfaf8] min-h-screen font-['Epilogue','Noto Sans',sans-serif]">
      {/* Hero Banner */}
      <section
        className="bg-cover bg-center text-white flex flex-col items-center justify-center text-center px-6 py-32"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1606851091899-bb3fdbec0fa4?auto=format&fit=crop&w=1950&q=80')",
        }}
      >
        
        <SplitText
          text="Hello, GSAP!"
          className="text-2xl font-semibold text-center"
          delay={100}
          duration={0.6}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
          onLetterAnimationComplete={handleAnimationComplete}
        />
        <h1 className="text-5xl font-black mb-4">The Daily Crumb</h1>
        <p className="text-lg max-w-xl mb-6">
          Boulangerie artisanale — pains frais, viennoiseries dorées, douceurs maison, tous les jours.
        </p>
        <Link
          href="/order"
          className="bg-[#eb7f13] text-[#1b140d] font-bold px-6 py-3 rounded-lg hover:bg-[#d67110] transition"
        >
          Commander maintenant
        </Link>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-20 space-y-24">

        {/* Nos Spécialités */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-[#1b140d] text-center">Nos Spécialités</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Pains au levain",
                desc: "Cuits à la perfection, avec une croûte dorée et une mie aérée.",
                img: "https://images.unsplash.com/photo-1607522370275-34c3c1801f43?auto=format&fit=crop&w=800&q=80",
              },
              {
                title: "Viennoiseries",
                desc: "Croissants, pains au chocolat, brioches moelleuses… tous faits maison.",
                img: "https://images.unsplash.com/photo-1576402187878-974f1fd61c5b?auto=format&fit=crop&w=800&q=80",
              },
              {
                title: "Gâteaux personnalisés",
                desc: "Pour toutes les occasions, réalisés avec soin et créativité.",
                img: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl shadow hover:shadow-lg transition">
                <div
                  className="aspect-video rounded-t-xl bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.img})` }}
                />
                <div className="p-4 space-y-1">
                  <h3 className="text-lg font-semibold text-[#1b140d]">{item.title}</h3>
                  <p className="text-sm text-[#9a734c]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* À propos */}
        <section className="flex flex-col md:flex-row items-center gap-10">
          <img
            src="https://images.unsplash.com/photo-1556911073-52527ac437f5?auto=format&fit=crop&w=800&q=80"
            alt="Boulangerie"
            className="w-full md:w-1/2 rounded-xl shadow-md"
          />
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-2xl font-bold text-[#1b140d]">Notre Histoire</h2>
            <p className="text-base text-[#1b140d]">
              Fondée en 2020, notre boulangerie vise à offrir à la communauté des produits frais et faits maison
              chaque jour. Notre passion ? Le goût, l'authenticité, et le partage.
            </p>
            <Link
              href="/our-story"
              className="inline-block mt-2 text-[#eb7f13] font-medium hover:underline"
            >
              En savoir plus →
            </Link>
          </div>
        </section>

        {/* Appel à l'action final */}
        <section className="text-center bg-[#f3ede7] p-12 rounded-xl shadow-inner">
          <h2 className="text-2xl font-bold mb-2 text-[#1b140d]">Envie d’un goûter maison ?</h2>
          <p className="text-sm mb-4 text-[#9a734c]">Commandez dès maintenant et savourez nos créations artisanales.</p>
          <Link
            href="/order"
            className="bg-[#eb7f13] text-[#1b140d] font-semibold px-6 py-3 rounded-lg hover:bg-[#d67110] transition"
          >
            Voir les produits
          </Link>
        </section>
      </main>
    </div>
  );
}
