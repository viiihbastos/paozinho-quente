import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const establishmentId = searchParams.get("establishmentId");
  const status = searchParams.get("status");

  const schedules = await prisma.bakeSchedule.findMany({
    where: {
      ...(establishmentId ? { establishmentId } : {}),
      ...(status ? { status: status as "SCHEDULED" | "BAKING" | "READY" | "SOLD_OUT" } : {}),
      scheduledAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    },
    include: {
      product: true,
      establishment: { select: { id: true, name: true, lat: true, lng: true, address: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(schedules);
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!requireRole(user, ["ESTABLISHMENT_ADMIN", "ESTABLISHMENT_OPERATOR"])) {
    return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
  }

  const { establishmentId, productId, scheduledAt, quantity } = await req.json();

  if (!establishmentId || !productId || !scheduledAt || !quantity) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  const schedule = await prisma.bakeSchedule.create({
    data: {
      establishmentId,
      productId,
      scheduledAt: new Date(scheduledAt),
      quantity: parseInt(quantity),
      available: parseInt(quantity),
    },
    include: { product: true, establishment: true },
  });

  return NextResponse.json(schedule, { status: 201 });
}
