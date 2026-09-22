import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth";
import { routeOptimizationAgent } from "@/services/agents/route-optimization";

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!requireRole(user, ["ESTABLISHMENT_ADMIN", "ESTABLISHMENT_OPERATOR"])) {
    return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
  }

  const { establishmentId, date } = await req.json();
  if (!establishmentId) {
    return NextResponse.json({ error: "establishmentId obrigatório" }, { status: 400 });
  }

  const result = await routeOptimizationAgent.execute({
    establishmentId,
    date: date ? new Date(date) : undefined,
  });

  return NextResponse.json(result);
}
