"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { api } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { token, user } = await api.login(email, password);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      router.push(user.role.includes("ESTABLISHMENT") ? "/dashboard" : "/mapa");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-bread-100">
          <h1 className="text-2xl font-bold text-center mb-6">Entrar</h1>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-bread-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-bread-400 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-bread-500 text-white py-3 rounded-lg font-medium hover:bg-bread-600 disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            Não tem conta?{" "}
            <Link href="/cadastro" className="text-bread-600 hover:underline">
              Cadastre-se
            </Link>
          </p>
          <div className="mt-6 p-3 bg-bread-50 rounded-lg text-xs text-gray-600">
            <p className="font-medium mb-1">Contas demo:</p>
            <p>Consumidor: maria@email.com / 123456</p>
            <p>Admin padaria: joao@padaria.com / 123456</p>
          </div>
        </div>
      </main>
    </>
  );
}
