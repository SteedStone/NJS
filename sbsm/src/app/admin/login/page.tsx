
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin/bakery-selection");
    } else {
      setError("Mot de passe incorrect.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfaf8] px-4">
      <div className="max-w-sm w-full bg-white shadow-xl rounded-lg p-6">
        <div className="flex flex-col items-center mb-6">
          <svg className="w-10 h-10 text-[#eb7f13]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4z" />
            <path d="M12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" />
          </svg>
          <h1 className="text-xl font-bold text-[#1c140d] mt-2">Connexion Boulanger</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-[#e0dcd7] p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#eb7f13]"
          />
          <button
            type="submit"
            className="w-full bg-[#eb7f13] text-white font-semibold px-4 py-2 rounded hover:bg-[#d67110] transition"
          >
            Se connecter
          </button>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}