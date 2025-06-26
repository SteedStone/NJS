// app/contact/page.tsx
"use client";

export default function ContactPage() {
    return (
      <div className="min-h-screen bg-[#fcfaf8] px-4 py-10 md:px-10 text-[#1c140d]">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Contactez-nous</h1>
  
        <p className="mb-6 max-w-2xl">
          Une question, une remarque ou besoin d'aide ? N'hésitez pas à nous contacter via le formulaire ci-dessous ou par e-mail.
        </p>
  
        <form className="grid grid-cols-1 gap-4 max-w-xl">
          <input
            type="text"
            placeholder="Nom"
            className="border border-[#f3ede7] rounded px-4 py-2 bg-white"
            required
          />
          <input
            type="email"
            placeholder="Adresse e-mail"
            className="border border-[#f3ede7] rounded px-4 py-2 bg-white"
            required
          />
          <textarea
            placeholder="Votre message"
            rows={6}
            className="border border-[#f3ede7] rounded px-4 py-2 bg-white"
            required
          ></textarea>
          <button
            type="submit"
            className="bg-[#1c140d] text-white px-6 py-2 rounded hover:opacity-90"
          >
            Envoyer
          </button>
        </form>
  
        <div className="mt-10 text-sm text-gray-600">
          Vous pouvez également nous écrire à :{" "}
          <a href="mailto:contact@monsite.fr" className="text-[#9a734c] underline">
            contact@monsite.fr
          </a>
        </div>
      </div>
    );
  }
  