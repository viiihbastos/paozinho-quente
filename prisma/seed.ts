import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.agentLog.deleteMany();
  await prisma.deliveryRoute.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.bakeSchedule.deleteMany();
  await prisma.product.deleteMany();
  await prisma.establishment.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.create({
    data: {
      email: "joao@padaria.com",
      passwordHash: hash,
      name: "João Silva",
      role: "ESTABLISHMENT_ADMIN",
      address: "Rua das Flores, 100 — Pinheiros, SP",
      lat: -23.567,
      lng: -46.691,
    },
  });

  const operator = await prisma.user.create({
    data: {
      email: "operador@padaria.com",
      passwordHash: hash,
      name: "Carlos Operador",
      role: "ESTABLISHMENT_OPERATOR",
    },
  });

  const consumer = await prisma.user.create({
    data: {
      email: "maria@email.com",
      passwordHash: hash,
      name: "Maria Consumidora",
      role: "CONSUMER",
      address: "Av. Paulista, 500 — Bela Vista, SP",
      lat: -23.563,
      lng: -46.654,
    },
  });

  const consumer2 = await prisma.user.create({
    data: {
      email: "pedro@email.com",
      passwordHash: hash,
      name: "Pedro Santos",
      role: "CONSUMER",
      address: "Rua Augusta, 200 — Consolação, SP",
      lat: -23.555,
      lng: -46.662,
    },
  });

  const padaria1 = await prisma.establishment.create({
    data: {
      name: "Padaria do João",
      address: "Rua das Flores, 100 — Pinheiros, SP",
      lat: -23.567,
      lng: -46.691,
      phone: "(11) 3456-7890",
      adminUserId: admin.id,
      products: {
        create: [
          { name: "Pão Francês", price: 1.5, category: "pao" },
          { name: "Pão de Queijo", price: 3.0, category: "pao" },
          { name: "Croissant", price: 8.0, category: "paes_especiais" },
        ],
      },
    },
    include: { products: true },
  });

  const padaria2 = await prisma.establishment.create({
    data: {
      name: "Forno de Ouro",
      address: "Av. Brigadeiro Faria Lima, 300 — Itaim, SP",
      lat: -23.578,
      lng: -46.686,
      phone: "(11) 9876-5432",
      adminUserId: admin.id,
      products: {
        create: [
          { name: "Pão Francês", price: 1.8, category: "pao" },
          { name: "Pão Integral", price: 2.5, category: "pao" },
          { name: "Baguete", price: 12.0, category: "paes_especiais" },
        ],
      },
    },
    include: { products: true },
  });

  const now = new Date();

  const schedules = [
    { product: padaria1.products[0], status: "READY" as const, hoursAgo: -0.5, qty: 30 },
    { product: padaria1.products[1], status: "BAKING" as const, hoursAgo: 0.2, qty: 20 },
    { product: padaria1.products[0], status: "SCHEDULED" as const, hoursAgo: 2, qty: 40 },
    { product: padaria2.products[0], status: "READY" as const, hoursAgo: -0.3, qty: 25 },
    { product: padaria2.products[2], status: "SCHEDULED" as const, hoursAgo: 1.5, qty: 15 },
  ];

  for (const s of schedules) {
    const scheduledAt = new Date(now.getTime() + s.hoursAgo * 60 * 60 * 1000);
    await prisma.bakeSchedule.create({
      data: {
        establishmentId: s.product.establishmentId,
        productId: s.product.id,
        scheduledAt,
        readyAt: s.status === "READY" ? new Date() : undefined,
        quantity: s.qty,
        available: s.status === "READY" ? s.qty - 5 : s.qty,
        status: s.status,
      },
    });
  }

  await prisma.subscription.create({
    data: {
      userId: consumer.id,
      establishmentId: padaria1.id,
      planName: "daily",
      price: 49.9,
      frequency: "daily",
      status: "ACTIVE",
      cashbackBalance: 2.5,
    },
  });

  const readySchedule = await prisma.bakeSchedule.findFirst({
    where: { status: "READY", establishmentId: padaria1.id },
  });

  if (readySchedule) {
    const payment = await prisma.payment.create({
      data: {
        amount: 3.0,
        status: "APPROVED",
        type: "RESERVATION",
        externalId: "mock_seed_001",
      },
    });

    await prisma.reservation.create({
      data: {
        userId: consumer.id,
        bakeScheduleId: readySchedule.id,
        quantity: 2,
        totalPrice: 3.0,
        status: "CONFIRMED",
        paymentId: payment.id,
      },
    });
  }

  console.log("Seed concluído!");
  console.log("Contas demo:");
  console.log("  Consumidor: maria@email.com / 123456");
  console.log("  Admin: joao@padaria.com / 123456");
  console.log("  Operador: operador@padaria.com / 123456");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
