"use client";

import Link from "next/link";
import SplitText from "./animation/SplitText";
import TiltedCard from "./animation/TiltedCard";
import DotGrid from "./animation/DotGrid";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen font-['Epilogue','Noto Sans',sans-serif] relative overflow-hidden">
      {/* DotGrid background */}
      <div className="absolute inset-0 -z-10">
        <DotGrid
          dotSize={5}
          gap={18}
          baseColor="#f0eae4"
          activeColor="#eb7f13"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="flex flex-col items-center justify-center text-center px-4 sm:px-6 py-16 sm:py-24 lg:py-32"      
        >
        <SplitText
          text="The Daily Crumb"
          className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 text-[#1c140d]"
          delay={100}
          duration={0.6}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
        />
        <p className="text-base sm:text-lg max-w-xl mb-6 text-[#1c140d]">
          Boulangerie artisanale — pains frais, viennoiseries dorées, douceurs maison, tous les jours.
        </p>
        <Link
          href="/order"
          className="bg-[#eb7f13] text-white font-bold px-6 py-3 rounded-lg hover:bg-[#d67110] transition"
        >
          Commander maintenant
        </Link>
      </motion.section>
    

      {/* Specials Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
       className="max-w-6xl mx-auto px-6 py-20"
      >
      <div className="bg-white/70 rounded-xl p-6 shadow-md">

        <h2 className="text-3xl font-bold mb-8 text-[#1b140d] text-center">
          Nos Spécialités
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              img: "/images/Patisserie.jpg",
              title: "Pâtisserie",
              desc: "Cuits à la perfection, avec une croûte dorée et une mie aérée.",
              link: "/order?cat=Pâtisserie",
            },
            {
              img: "/images/Viennoiserie.jpg",
              title: "Viennoiseries",
              desc: "Croissants, pains au chocolat, brioches moelleuses… tous faits maison.",
              link: "/order?cat=Viennoiserie",
            },
            {
              img: "images/pain2.jpg",
              title: "Boulangerie",
              desc: "Pour toutes les occasions, réalisés avec soin et créativité.",
              link: "/order?cat=Boulangerie",
              
            },
          ].map((item, i) => (
            <Link href={item.link} key={i} className="block">
              <TiltedCard
                imageSrc={item.img}
                altText={item.title}
                captionText={item.title}
                rotateAmplitude={12}
                scaleOnHover={1.1}
              />
            </Link>
          ))}
        </div>
      </div>
      </motion.section>

      {/* About Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 px-6 py-16 "
      >
        <div className="bg-white/70 rounded-xl p-6 w-full shadow-inner flex flex-col md:flex-row items-center gap-10">
        <Link href = "/our-story">
          <TiltedCard
            imageSrc="/images/boulangerie.jpg"
            altText="Notre Histoire"
            captionText="Notre Histoire"
            rotateAmplitude={12}
            scaleOnHover={1.1}

          />
        </Link>
        <div className="md:w-1/2 space-y-4">
          <h2 className="text-2xl font-bold text-[#1b140d]">Notre Histoire</h2>
          <p className="text-base text-[#1b140d]">
            Fondée en 2020, notre boulangerie vise à offrir à la communauté des produits frais et faits maison chaque jour.
            Notre passion ? Le goût, l'authenticité, et le partage.
          </p>
          <Link
            href="/our-story"
            className="inline-block mt-2 text-[#eb7f13] font-medium hover:underline"
          >
            En savoir plus →
          </Link>
        </div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
       className="text-center bg-[#f3ede7] p-12 rounded-xl shadow-inner max-w-4xl mx-auto mb-16"
      >
        <h2 className="text-2xl font-bold mb-2 text-[#1b140d]">Envie d’un goûter maison ?</h2>
        <p className="text-sm mb-4 text-[#9a734c]">
          Commandez dès maintenant et savourez nos créations artisanales.
        </p>
        <Link
          href="/order"
          className="bg-[#eb7f13] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#d67110] transition"
        >
          Voir les produits
        </Link>
      </motion.section>
    </div>
  );
}
