"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ScheduleCard from "@/components/ScheduleCard";
import {
  api,
  type BakeSchedule,
  type Establishment,
  type DemandSuggestion,
  type RouteResult,
  type UpsellNotification,
} from "@/lib/api-client";

export default function DashboardPage() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [schedules, setSchedules] = useState<BakeSchedule[]>([]);
  const [selectedEst, setSelectedEst] = useState("");
  const [demand, setDemand] = useState<DemandSuggestion[]>([]);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [notifications, setNotifications] = useState<UpsellNotification[]>([]);
  const [newSchedule, setNewSchedule] = useState({
    productId: "",
    scheduledAt: "",
    quantity: "20",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    loadData();
  }, []);

  async function loadData() {
    const ests = await api.getEstablishments();
    setEstablishments(ests);
    if (ests.length > 0) {
      setSelectedEst(ests[0].id);
      loadSchedules(ests[0].id);
      if (ests[0].products.length > 0) {
        setNewSchedule((s) => ({ ...s, productId: ests[0].products[0].id }));
      }
    }
  }

  async function loadSchedules(estId: string) {
    const data = await api.getSchedules(estId);
    setSchedules(data);
  }

  async function handleCreateSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEst) return;
    try {
      await api.createSchedule({
        establishmentId: selectedEst,
        ...newSchedule,
      });
      loadSchedules(selectedEst);
      alert("Fornada criada!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro");
    }
  }

  async function handleUpdateStatus(id: string, status: string) {
    await api.updateScheduleStatus(id, status);
    loadSchedules(selectedEst);
  }

  async function runAgent(type: string) {
    if (!selectedEst) return;
    try {
      if (type === "demand") {
        const result = await api.runDemandPrediction(selectedEst);
        setDemand(result.suggestions);
      } else if (type === "route") {
        const result = await api.runRouteOptimization(selectedEst);
        setRoute(result);
      } else if (type === "retention") {
        const result = await api.runRetention(selectedEst);
        setNotifications(result.notifications);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro no agente");
    }
  }

  const currentEst = establishments.find((e) => e.id === selectedEst);

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-bread-800 mb-6">Dashboard da Padaria</h1>

        {establishments.length > 1 && (
          <select
            value={selectedEst}
            onChange={(e) => {
              setSelectedEst(e.target.value);
              loadSchedules(e.target.value);
            }}
            className="border rounded-lg px-3 py-2 mb-6"
          >
            {establishments.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Nova Fornada</h2>
            <form onSubmit={handleCreateSchedule} className="bg-white rounded-xl p-4 shadow border border-bread-100 space-y-3">
              <select
                value={newSchedule.productId}
                onChange={(e) => setNewSchedule({ ...newSchedule, productId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                {currentEst?.products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — R$ {p.price.toFixed(2)}</option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={newSchedule.scheduledAt}
                onChange={(e) => setNewSchedule({ ...newSchedule, scheduledAt: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
              <input
                type="number"
                value={newSchedule.quantity}
                onChange={(e) => setNewSchedule({ ...newSchedule, quantity: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Quantidade"
                min="1"
              />
              <button type="submit" className="w-full bg-bread-500 text-white py-2 rounded-lg hover:bg-bread-600">
                Criar Fornada
              </button>
            </form>

            <h2 className="text-xl font-semibold mt-8 mb-4">Fornadas Ativas</h2>
            <div className="space-y-3">
              {schedules.map((s) => (
                <ScheduleCard
                  key={s.id}
                  schedule={s}
                  isOperator
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Agentes de IA</h2>
            <div className="grid gap-3 mb-6">
              <button
                onClick={() => runAgent("demand")}
                className="bg-white border border-bread-200 rounded-xl p-4 text-left hover:bg-bread-50"
              >
                <span className="font-medium">🤖 PCP — Previsão de Demanda</span>
                <p className="text-sm text-gray-600">Sugere quantidade por fornada</p>
              </button>
              <button
                onClick={() => runAgent("route")}
                className="bg-white border border-bread-200 rounded-xl p-4 text-left hover:bg-bread-50"
              >
                <span className="font-medium">🤖 Otimização de Rotas</span>
                <p className="text-sm text-gray-600">Agrupa entregas por proximidade</p>
              </button>
              <button
                onClick={() => runAgent("retention")}
                className="bg-white border border-bread-200 rounded-xl p-4 text-left hover:bg-bread-50"
              >
                <span className="font-medium">🤖 Retenção & Upsell</span>
                <p className="text-sm text-gray-600">Notificações personalizadas</p>
              </button>
            </div>

            {demand.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow border border-bread-100 mb-4">
                <h3 className="font-semibold mb-2">Sugestões de Demanda</h3>
                {demand.map((d) => (
                  <div key={d.productId} className="text-sm border-b py-2 last:border-0">
                    <strong>{d.productName}</strong>: {d.suggestedQuantity} un. — Confiança: {(d.confidence * 100).toFixed(0)}%
                    <p className="text-gray-500 text-xs">{d.reasoning}</p>
                  </div>
                ))}
              </div>
            )}

            {route && (
              <div className="bg-white rounded-xl p-4 shadow border border-bread-100 mb-4">
                <h3 className="font-semibold mb-2">Rota Otimizada</h3>
                <p className="text-sm">{route.totalDistanceKm} km — ~{route.estimatedMinutes} min</p>
                {route.stops.map((s) => (
                  <p key={s.order} className="text-sm text-gray-600">
                    {s.order}. {s.userName} — {s.address}
                  </p>
                ))}
              </div>
            )}

            {notifications.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow border border-bread-100">
                <h3 className="font-semibold mb-2">Notificações de Upsell</h3>
                {notifications.map((n, i) => (
                  <div key={i} className="text-sm border-b py-2 last:border-0">
                    <p className="text-gray-700">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
