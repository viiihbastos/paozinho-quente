"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { api, type Reservation } from "@/lib/api-client";

export default function ReservasPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getReservations();
        setReservations(data);
      } catch {
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-bread-800 mb-6">Minhas Reservas</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Nenhuma reserva ainda</p>
            <a href="/cronograma" className="text-bread-600 hover:underline">
              Ver cronograma de fornadas
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((r) => (
              <div key={r.id} className="bg-white rounded-xl p-4 shadow border border-bread-100">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{r.bakeSchedule.product.name}</h3>
                    <p className="text-sm text-gray-600">
                      {r.bakeSchedule.establishment?.name}
                    </p>
                    <p className="text-sm mt-1">
                      Qtd: {r.quantity} — R$ {r.totalPrice.toFixed(2)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium h-fit ${
                    r.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                    r.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
