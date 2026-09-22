"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { api } from "@/lib/api-client";

export default function CadastroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CONSUMER",
    address: "",
    lat: "-23.5505",
    lng: "-46.6333",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { token, user } = await api.register(form);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      router.push("/mapa");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-bread-100">
          <h1 className="text-2xl font-bold text-center mb-6">Criar Conta</h1>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-bread-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-bread-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Senha</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-bread-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de conta</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-bread-400 outline-none"
              >
                <option value="CONSUMER">Consumidor</option>
                <option value="ESTABLISHMENT_ADMIN">Dono de Padaria (ADM)</option>
                <option value="ESTABLISHMENT_OPERATOR">Operador de Padaria</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Endereço</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-bread-400 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-bread-500 text-white py-3 rounded-lg font-medium hover:bg-bread-600 disabled:opacity-50"
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            Já tem conta?{" "}
            <Link href="/login" className="text-bread-600 hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
