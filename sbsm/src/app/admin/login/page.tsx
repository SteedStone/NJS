"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  if (res.ok) {
    router.push("/admin/dashboard");
  } else {
    setError("Mot de passe incorrect.");
  }
};

  return (
    <div className="p-6 max-w-sm mx-auto mt-10 bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-4">Connexion Boulanger</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-[#1c140d] text-white px-4 py-2 rounded w-full"
        >
          Se connecter
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
}
