import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth";
import { retentionUpsellAgent } from "@/services/agents/retention-upsell";

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!requireRole(user, ["ESTABLISHMENT_ADMIN", "ESTABLISHMENT_OPERATOR"])) {
    return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
  }

  const { establishmentId } = await req.json();

  const result = await retentionUpsellAgent.execute({ establishmentId });

  return NextResponse.json(result);
}
