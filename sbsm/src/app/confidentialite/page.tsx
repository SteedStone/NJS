"use client";

export default function ConfidentialitePage() {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-[#1c140d]">
        <h1 className="text-3xl font-bold mb-6">Politique de Confidentialité</h1>
        <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : 26/06/2025</p>
  
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p>
            Cette politique de confidentialité explique comment <strong>AG Pâtisseries</strong> collecte, utilise, stocke et protège vos données personnelles.
          </p>
        </section>
  
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">2. Données collectées</h2>
          <p>Nous pouvons collecter les données suivantes :</p>
          <ul className="list-disc list-inside pl-4">
            <li>Nom, prénom</li>
            <li>Adresse email</li>
            <li>Adresse de livraison</li>
            <li>Données de commande</li>
            <li>Données de navigation (cookies, IP, etc.)</li>
          </ul>
        </section>
  
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">3. Finalités de la collecte</h2>
          <p>Les données sont utilisées pour :</p>
          <ul className="list-disc list-inside pl-4">
            <li>Traiter les commandes</li>
            <li>Envoyer des confirmations et communications</li>
            <li>Améliorer notre service</li>
            <li>Respecter nos obligations légales</li>
          </ul>
        </section>
  
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">4. Partage des données</h2>
          <p>
            Vos données ne sont jamais revendues. Elles peuvent être partagées uniquement avec :
          </p>
          <ul className="list-disc list-inside pl-4">
            <li>Prestataires logistiques</li>
            <li>Fournisseurs de services de paiement</li>
            <li>Hébergeur du site</li>
          </ul>
        </section>
  
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">5. Cookies</h2>
          <p>
            Nous utilisons des cookies pour améliorer l'expérience utilisateur. Vous pouvez les refuser via les paramètres de votre navigateur.
          </p>
        </section>
  
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">6. Sécurité</h2>
          <p>
            Nous mettons en œuvre toutes les mesures techniques et organisationnelles nécessaires pour protéger vos données personnelles.
          </p>
        </section>
  
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">7. Durée de conservation</h2>
          <p>
            Les données sont conservées le temps nécessaire à la finalité de leur traitement, puis supprimées ou anonymisées.
          </p>
        </section>
  
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">8. Vos droits</h2>
          <p>Vous disposez des droits suivants :</p>
          <ul className="list-disc list-inside pl-4">
            <li>Accès à vos données</li>
            <li>Rectification</li>
            <li>Suppression</li>
            <li>Opposition ou limitation du traitement</li>
          </ul>
          <p>
            Pour exercer vos droits, contactez-nous à : <a href="mailto:contact@sbsm.fr" className="text-blue-600 underline">contact@sbsm.fr</a>
          </p>
        </section>
  
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">9. Modification de la politique</h2>
          <p>
            Cette politique peut être modifiée à tout moment. Les utilisateurs seront informés en cas de changement significatif.
          </p>
        </section>
      </div>
    );
  }
  