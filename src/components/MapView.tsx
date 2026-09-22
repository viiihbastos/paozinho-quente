"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Establishment } from "@/lib/api-client";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

interface MapViewProps {
  establishments: Establishment[];
  center?: [number, number];
}

const STATUS_EMOJI: Record<string, string> = {
  READY: "🟢",
  BAKING: "🟡",
  SCHEDULED: "⚪",
  SOLD_OUT: "🔴",
};

export default function MapView({ establishments, center }: MapViewProps) {
  const [mounted, setMounted] = useState(false);
  const defaultCenter: [number, number] = center ?? [-23.5505, -46.6333];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-96 bg-bread-100 rounded-xl flex items-center justify-center">
        Carregando mapa...
      </div>
    );
  }

  return (
    <div className="h-96 rounded-xl overflow-hidden shadow-md">
      <MapContainer center={defaultCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {establishments.map((e) => {
          const readySchedule = e.bakeSchedules?.find((s) => s.status === "READY");
          const nextSchedule = e.bakeSchedules?.[0];
          return (
            <Marker key={e.id} position={[e.lat, e.lng]}>
              <Popup>
                <div className="text-sm">
                  <strong>{e.name}</strong>
                  <p className="text-gray-600">{e.address}</p>
                  {e.distanceKm !== undefined && (
                    <p>{e.distanceKm} km de distância</p>
                  )}
                  {readySchedule && (
                    <p className="text-green-600 font-medium">
                      {STATUS_EMOJI.READY} {readySchedule.product.name} QUENTE AGORA!
                    </p>
                  )}
                  {nextSchedule && !readySchedule && (
                    <p>
                      {STATUS_EMOJI[nextSchedule.status]} Próxima fornada:{" "}
                      {new Date(nextSchedule.scheduledAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
