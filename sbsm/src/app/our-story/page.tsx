"use client";

import SplitText from "../animation/SplitText";
import TiltedCard from "../animation/TiltedCard";
import DotGrid from "../animation/DotGrid";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="min-h-screen font-['Epilogue','Noto Sans',sans-serif] relative overflow-hidden bg-[#f3ede7]">
      <div className="absolute inset-0 -z-10">
        <DotGrid
          dotSize={10}
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

      {/* Titre */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center px-6 py-24"
      >
        <SplitText
          text="À propos de nous"
          className="text-5xl font-black mb-4 text-[#1c140d]"
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
        <p className="text-lg max-w-2xl mx-auto text-[#1c140d]">
          Découvrez les valeurs, l’histoire et l’équipe derrière chaque miche de pain que nous façonnons.
        </p>
      </motion.section>

      {/* Sections */}
      <div className="max-w-6xl mx-auto px-6 space-y-16 pb-20">

        {/* Notre Histoire */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-10 bg-white/70 p-4 sm:p-6 rounded-xl
      shadow"
        >
          <TiltedCard
            imageSrc="/images/boulangerie.jpg"
            altText="Histoire"
            captionText="Depuis 2020"
            rotateAmplitude={10}
            scaleOnHover={1.05}
          />
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-2xl font-bold text-[#1b140d]">Une aventure locale et familiale</h2>
            <p className="text-[#1c140d]">
              Fondée en 2020, notre boulangerie est née d'une passion partagée pour le pain traditionnel et la viennoiserie artisanale. Chaque jour, nous pétrissons, façonnons et cuisons avec amour.
            </p>
          </div>
        </motion.div>

        {/* Nos valeurs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-10 bg-white/70 p-4 sm:p-6 rounded-xl
  shadow"
        >
          <TiltedCard
            imageSrc="/images/pain2.jpg"
            altText="Valeurs"
            captionText="Authenticité"
            rotateAmplitude={10}
            scaleOnHover={1.05}
          />
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-2xl font-bold text-[#1b140d]">Nos engagements</h2>
            <p className="text-[#1c140d]">
              Nous sélectionnons des ingrédients locaux, utilisons des méthodes artisanales et refusons les conservateurs. Notre objectif : offrir chaque jour le meilleur, avec transparence et passion.
            </p>
          </div>
        </motion.div>

        {/* L’équipe */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-10 bg-white/70 p-4 sm:p-6 rounded-xl
  shadow"
        >
          <TiltedCard
            imageSrc="/images/team.jpg"
            altText="Équipe"
            captionText="Une équipe soudée"
            rotateAmplitude={10}
            scaleOnHover={1.05}
          />
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-2xl font-bold text-[#1b140d]">Une équipe à taille humaine</h2>
            <p className="text-[#1c140d]">
              Derrière chaque baguette, c’est une équipe de passionnés : boulangers, pâtissiers, vendeuses. Tous unis par l’envie de faire plaisir et de faire du bon.
            </p>
          </div>
        </motion.div>

        {/* Localisation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-10 bg-white/70 p-4 sm:p-6 rounded-xl
  shadow"
        >
          <h2 className="text-2xl font-bold text-[#1b140d] mb-2">Où nous trouver ?</h2>
          <p className="text-[#1c140d] mb-4">Retrouvez-nous au cœur de Paris, à deux pas de la place de la République.</p>
          <iframe
            className="w-full rounded-lg h-64"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!..."
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>
      </div>
    </div>
  );
}
