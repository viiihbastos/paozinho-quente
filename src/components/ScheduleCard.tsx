"use client";

import type { BakeSchedule } from "@/lib/api-client";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "Agendado", color: "bg-gray-200 text-gray-700" },
  BAKING: { label: "Assando", color: "bg-yellow-200 text-yellow-800" },
  READY: { label: "Quente!", color: "bg-green-200 text-green-800" },
  SOLD_OUT: { label: "Esgotado", color: "bg-red-200 text-red-800" },
};

interface ScheduleCardProps {
  schedule: BakeSchedule;
  onReserve?: (scheduleId: string) => void;
  onUpdateStatus?: (scheduleId: string, status: string) => void;
  isOperator?: boolean;
}

export default function ScheduleCard({
  schedule,
  onReserve,
  onUpdateStatus,
  isOperator,
}: ScheduleCardProps) {
  const status = STATUS_LABEL[schedule.status] ?? STATUS_LABEL.SCHEDULED;
  const time = new Date(schedule.scheduledAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white rounded-xl shadow p-4 border border-bread-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{schedule.product.name}</h3>
          <p className="text-gray-600 text-sm">
            {schedule.establishment?.name ?? "Padaria"}
          </p>
          <p className="text-bread-600 font-medium mt-1">
            R$ {schedule.product.price.toFixed(2)}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
        <span>Fornada: {time}</span>
        <span>{schedule.available}/{schedule.quantity} disponíveis</span>
      </div>

      <div className="mt-3 flex gap-2">
        {onReserve && schedule.status !== "SOLD_OUT" && schedule.available > 0 && (
          <button
            onClick={() => onReserve(schedule.id)}
            className="flex-1 bg-bread-500 text-white py-2 rounded-lg hover:bg-bread-600 text-sm font-medium"
          >
            Reservar
          </button>
        )}
        {isOperator && onUpdateStatus && (
          <>
            {schedule.status === "SCHEDULED" && (
              <button
                onClick={() => onUpdateStatus(schedule.id, "BAKING")}
                className="px-3 py-2 bg-yellow-400 rounded-lg text-sm hover:bg-yellow-500"
              >
                Iniciar Fornada
              </button>
            )}
            {schedule.status === "BAKING" && (
              <button
                onClick={() => onUpdateStatus(schedule.id, "READY")}
                className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
              >
                Pão Pronto!
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
