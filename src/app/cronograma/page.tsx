"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ScheduleCard from "@/components/ScheduleCard";
import { api, type BakeSchedule } from "@/lib/api-client";

export default function CronogramaPage() {
  const [schedules, setSchedules] = useState<BakeSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    loadSchedules();
  }, [filter]);

  async function loadSchedules() {
    try {
      const data = await api.getSchedules(undefined, filter || undefined);
      setSchedules(data);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }

  async function handleReserve(scheduleId: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    try {
      await api.createReservation(scheduleId, 1);
      alert("Reserva confirmada com pagamento!");
      loadSchedules();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro na reserva");
    }
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-bread-800 mb-6">Cronograma de Fornadas</h1>

        <div className="flex gap-2 mb-6">
          {["", "READY", "BAKING", "SCHEDULED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === s
                  ? "bg-bread-500 text-white"
                  : "bg-white border border-bread-200 hover:bg-bread-50"
              }`}
            >
              {s === "" ? "Todos" : s === "READY" ? "Quente" : s === "BAKING" ? "Assando" : "Agendado"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Nenhuma fornada encontrada</div>
        ) : (
          <div className="grid gap-4">
            {schedules.map((s) => (
              <ScheduleCard key={s.id} schedule={s} onReserve={handleReserve} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
