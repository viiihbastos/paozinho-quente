import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";
import { processPayment } from "@/lib/payment";

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const reservations = await prisma.reservation.findMany({
    where: { userId: user.userId },
    include: {
      bakeSchedule: {
        include: { product: true, establishment: true },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reservations);
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!requireRole(user, ["CONSUMER"])) {
    return NextResponse.json({ error: "Apenas consumidores podem reservar" }, { status: 403 });
  }

  const { bakeScheduleId, quantity, paymentMethod } = await req.json();

  if (!bakeScheduleId || !quantity) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  const schedule = await prisma.bakeSchedule.findUnique({
    where: { id: bakeScheduleId },
    include: { product: true },
  });

  if (!schedule) {
    return NextResponse.json({ error: "Fornada não encontrada" }, { status: 404 });
  }
  if (schedule.status === "SOLD_OUT" || schedule.available < quantity) {
    return NextResponse.json({ error: "Quantidade indisponível" }, { status: 400 });
  }

  const totalPrice = schedule.product.price * quantity;
  const paymentResult = await processPayment(totalPrice, paymentMethod ?? "card");

  const reservation = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        amount: totalPrice,
        method: paymentMethod ?? "card",
        status: paymentResult.status,
        type: "RESERVATION",
        externalId: paymentResult.externalId,
      },
    });

    const res = await tx.reservation.create({
      data: {
        userId: user.userId,
        bakeScheduleId,
        quantity,
        totalPrice,
        status: paymentResult.success ? "CONFIRMED" : "CANCELLED",
        paymentId: payment.id,
      },
      include: {
        bakeSchedule: { include: { product: true, establishment: true } },
        payment: true,
      },
    });

    if (paymentResult.success) {
      const newAvailable = schedule.available - quantity;
      await tx.bakeSchedule.update({
        where: { id: bakeScheduleId },
        data: {
          available: newAvailable,
          status: newAvailable === 0 ? "SOLD_OUT" : schedule.status,
        },
      });
    }

    return res;
  });

  return NextResponse.json(reservation, { status: paymentResult.success ? 201 : 402 });
}
