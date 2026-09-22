import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";
import { haversineDistance } from "@/lib/geo";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "0");
  const lng = parseFloat(searchParams.get("lng") ?? "0");
  const radius = parseFloat(searchParams.get("radius") ?? "10");

  const establishments = await prisma.establishment.findMany({
    include: {
      products: true,
      bakeSchedules: {
        where: {
          status: { in: ["SCHEDULED", "BAKING", "READY"] },
          scheduledAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
        },
        include: { product: true },
        orderBy: { scheduledAt: "asc" },
        take: 5,
      },
    },
  });

  const results = establishments
    .map((e) => {
      const distance =
        lat && lng ? haversineDistance(lat, lng, e.lat, e.lng) : null;
      return { ...e, distanceKm: distance ? Math.round(distance * 100) / 100 : null };
    })
    .filter((e) => !lat || !lng || (e.distanceKm !== null && e.distanceKm <= radius))
    .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!requireRole(user, ["ESTABLISHMENT_ADMIN"])) {
    return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
  }

  const { name, address, lat, lng, phone, products } = await req.json();

  if (!name || !address || lat === undefined || lng === undefined) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  const establishment = await prisma.establishment.create({
    data: {
      name,
      address,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      phone,
      adminUserId: user.userId,
      products: products?.length
        ? { create: products.map((p: { name: string; price: number; category?: string }) => ({
            name: p.name,
            price: p.price,
            category: p.category ?? "pao",
          })) }
        : undefined,
    },
    include: { products: true },
  });

  return NextResponse.json(establishment, { status: 201 });
}
