"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import MapView from "@/components/MapView";
import { api, type Establishment, type MatchResult } from "@/lib/api-client";

export default function MapaPage() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLat, setUserLat] = useState(-23.5505);
  const [userLng, setUserLng] = useState(-46.6333);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
        },
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getEstablishments(userLat, userLng, 10);
        setEstablishments(data);
      } catch {
        /* empty */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userLat, userLng]);

  async function findBestMatch() {
    try {
      const result = await api.runMatchmaking(userLat, userLng);
      setMatch(result.bestMatch);
    } catch {
      alert("Faça login para usar o matchmaking");
    }
  }

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-bread-800">Mapa de Padarias</h1>
          <button
            onClick={findBestMatch}
            className="bg-bread-500 text-white px-4 py-2 rounded-lg hover:bg-bread-600 text-sm font-medium"
          >
            🤖 Encontrar Pão Quente (IA)
          </button>
        </div>

        {match && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-green-800">Melhor match encontrado!</h3>
            <p className="text-sm text-green-700 mt-1">
              {match.establishmentName} — {match.productName} ({match.status}) —{" "}
              {match.distanceKm} km — Score: {match.score}
              {match.estimatedWaitMinutes > 0 && ` — Aguarde ~${match.estimatedWaitMinutes} min`}
            </p>
          </div>
        )}

        {loading ? (
          <div className="h-96 bg-bread-100 rounded-xl animate-pulse" />
        ) : (
          <MapView establishments={establishments} center={[userLat, userLng]} />
        )}

        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {establishments.map((e) => (
            <div key={e.id} className="bg-white rounded-xl p-4 shadow border border-bread-100">
              <h3 className="font-semibold">{e.name}</h3>
              <p className="text-sm text-gray-600">{e.address}</p>
              {e.distanceKm !== undefined && (
                <p className="text-bread-600 text-sm mt-1">{e.distanceKm} km</p>
              )}
              <div className="mt-2 space-y-1">
                {e.bakeSchedules?.slice(0, 3).map((s) => (
                  <div key={s.id} className="text-xs flex justify-between">
                    <span>{s.product.name}</span>
                    <span className={
                      s.status === "READY" ? "text-green-600 font-medium" : "text-gray-500"
                    }>
                      {s.status === "READY" ? "QUENTE!" : new Date(s.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
