"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { api, type Subscription, type Establishment } from "@/lib/api-client";

const PLANS = [
  { id: "daily", name: "Diário", price: 49.9, desc: "Pão fresco todo dia" },
  { id: "weekly", name: "Semanal", price: 199.9, desc: "5 dias por semana" },
  { id: "monthly", name: "Mensal", price: 699.9, desc: "Todo mês com 5% cashback" },
];

export default function AssinaturasPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selectedEst, setSelectedEst] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [subs, ests] = await Promise.all([
          api.getSubscriptions(),
          api.getEstablishments(),
        ]);
        setSubscriptions(subs);
        setEstablishments(ests);
        if (ests.length > 0) setSelectedEst(ests[0].id);
      } catch {
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function subscribe(planId: string) {
    if (!selectedEst) return;
    try {
      await api.createSubscription(selectedEst, planId);
      const subs = await api.getSubscriptions();
      setSubscriptions(subs);
      alert("Assinatura criada com sucesso!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro na assinatura");
    }
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-bread-800 mb-6">Assinaturas</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : (
          <>
            {subscriptions.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Suas Assinaturas</h2>
                <div className="space-y-3">
                  {subscriptions.map((s) => (
                    <div key={s.id} className="bg-white rounded-xl p-4 shadow border border-bread-100 flex justify-between">
                      <div>
                        <h3 className="font-semibold">{s.establishment.name}</h3>
                        <p className="text-sm text-gray-600">
                          Plano {s.planName} — R$ {s.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          s.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100"
                        }`}>
                          {s.status}
                        </span>
                        <p className="text-sm text-bread-600 mt-1">
                          Cashback: R$ {s.cashbackBalance.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-xl font-semibold mb-4">Escolha um Plano</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Padaria</label>
                <select
                  value={selectedEst}
                  onChange={(e) => setSelectedEst(e.target.value)}
                  className="border rounded-lg px-3 py-2 w-full max-w-md"
                >
                  {establishments.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {PLANS.map((plan) => (
                  <div key={plan.id} className="bg-white rounded-xl p-6 shadow border border-bread-100 text-center">
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <p className="text-3xl font-bold text-bread-600 my-3">
                      R$ {plan.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">{plan.desc}</p>
                    <button
                      onClick={() => subscribe(plan.id)}
                      className="w-full bg-bread-500 text-white py-2 rounded-lg hover:bg-bread-600 text-sm font-medium"
                    >
                      Assinar
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
