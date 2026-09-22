import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { matchmakingAgent } from "@/services/agents/matchmaking";

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { userLat, userLng, productName, maxRadiusKm } = await req.json();

  if (userLat === undefined || userLng === undefined) {
    return NextResponse.json({ error: "Localização obrigatória" }, { status: 400 });
  }

  const result = await matchmakingAgent.execute({
    userLat: parseFloat(userLat),
    userLng: parseFloat(userLng),
    productName,
    maxRadiusKm: maxRadiusKm ? parseFloat(maxRadiusKm) : undefined,
  });

  return NextResponse.json(result);
}
