import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!requireRole(user, ["ESTABLISHMENT_ADMIN", "ESTABLISHMENT_OPERATOR"])) {
    return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
  }

  const { status } = await req.json();
  const validStatuses = ["SCHEDULED", "BAKING", "READY", "SOLD_OUT"];

  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const updateData: { status: string; readyAt?: Date } = { status };
  if (status === "READY") updateData.readyAt = new Date();

  const schedule = await prisma.bakeSchedule.update({
    where: { id: params.id },
    data: updateData,
    include: { product: true, establishment: true },
  });

  return NextResponse.json(schedule);
}
