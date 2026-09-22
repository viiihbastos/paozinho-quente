"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@/lib/api-client";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  }

  return (
    <header className="bg-bread-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold flex items-center gap-2">
          🍞 Paozinho Quente
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/mapa" className="hover:underline">Mapa</Link>
          <Link href="/cronograma" className="hover:underline">Cronograma</Link>
          {user ? (
            <>
              <Link href="/reservas" className="hover:underline">Reservas</Link>
              <Link href="/assinaturas" className="hover:underline">Assinaturas</Link>
              {(user.role === "ESTABLISHMENT_ADMIN" || user.role === "ESTABLISHMENT_OPERATOR") && (
                <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              )}
              <span className="opacity-80">{user.name}</span>
              <button onClick={logout} className="bg-bread-700 px-3 py-1 rounded hover:bg-bread-800">
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">Entrar</Link>
              <Link href="/cadastro" className="bg-white text-bread-600 px-3 py-1 rounded font-medium hover:bg-bread-100">
                Cadastrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
