import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";
import { processPayment, calculateCashback } from "@/lib/payment";

const PLANS: Record<string, { price: number; frequency: string }> = {
  daily: { price: 49.9, frequency: "daily" },
  weekly: { price: 199.9, frequency: "weekly" },
  monthly: { price: 699.9, frequency: "monthly" },
};

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: user.userId },
    include: { establishment: true, payments: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(subscriptions);
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!requireRole(user, ["CONSUMER"])) {
    return NextResponse.json({ error: "Apenas consumidores podem assinar" }, { status: 403 });
  }

  const { establishmentId, planName, paymentMethod } = await req.json();
  const plan = PLANS[planName];

  if (!establishmentId || !plan) {
    return NextResponse.json({ error: "Plano ou estabelecimento inválido" }, { status: 400 });
  }

  const paymentResult = await processPayment(plan.price, paymentMethod ?? "card");

  const subscription = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        amount: plan.price,
        method: paymentMethod ?? "card",
        status: paymentResult.status,
        type: "SUBSCRIPTION",
        externalId: paymentResult.externalId,
      },
    });

    const sub = await tx.subscription.create({
      data: {
        userId: user.userId,
        establishmentId,
        planName,
        price: plan.price,
        frequency: plan.frequency,
        status: paymentResult.success ? "ACTIVE" : "CANCELLED",
        cashbackBalance: paymentResult.success ? calculateCashback(plan.price) : 0,
        payments: { connect: { id: payment.id } },
      },
      include: { establishment: true, payments: true },
    });

    return sub;
  });

  return NextResponse.json(subscription, { status: paymentResult.success ? 201 : 402 });
}
