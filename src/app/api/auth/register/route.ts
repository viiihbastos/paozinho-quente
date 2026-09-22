import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import type { UserRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role, address, lat, lng } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, senha e nome são obrigatórios" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
    }

    const validRoles: UserRole[] = ["CONSUMER", "ESTABLISHMENT_ADMIN", "ESTABLISHMENT_OPERATOR"];
    const userRole: UserRole = validRoles.includes(role) ? role : "CONSUMER";

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
        name,
        role: userRole,
        address,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
      },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role as UserRole });

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
