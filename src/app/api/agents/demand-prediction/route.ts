import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth";
import { demandPredictionAgent } from "@/services/agents/demand-prediction";

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!requireRole(user, ["ESTABLISHMENT_ADMIN", "ESTABLISHMENT_OPERATOR"])) {
    return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
  }

  const { establishmentId, targetDate } = await req.json();
  if (!establishmentId) {
    return NextResponse.json({ error: "establishmentId obrigatório" }, { status: 400 });
  }

  const result = await demandPredictionAgent.execute({
    establishmentId,
    targetDate: targetDate ? new Date(targetDate) : undefined,
  });

  return NextResponse.json(result);
}
