import { prisma } from "@/lib/db";
import { Agent, logAgentRun } from "./types";

export interface RetentionInput {
  establishmentId?: string;
}

export interface UpsellNotification {
  userId: string;
  userName: string;
  message: string;
  productId: string;
  productName: string;
  establishmentId: string;
  establishmentName: string;
  bakeScheduleId: string;
}

export interface RetentionOutput {
  notifications: UpsellNotification[];
}

const DAY_NAMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

export class RetentionUpsellAgent implements Agent<RetentionInput, RetentionOutput> {
  type = "RETENTION_UPSELL" as const;

  async execute(input: RetentionInput): Promise<RetentionOutput> {
    const today = new Date().getDay();

    const readySchedules = await prisma.bakeSchedule.findMany({
      where: {
        status: "READY",
        available: { gt: 0 },
        ...(input.establishmentId ? { establishmentId: input.establishmentId } : {}),
      },
      include: {
        product: true,
        establishment: true,
        reservations: {
          where: { status: { in: ["CONFIRMED", "DELIVERED"] } },
          include: { user: true },
        },
      },
    });

    const notifications: UpsellNotification[] = [];
    const notifiedUsers = new Set<string>();

    for (const schedule of readySchedules) {
      const productReservations = await prisma.reservation.findMany({
        where: {
          status: { in: ["CONFIRMED", "DELIVERED"] },
          bakeSchedule: {
            productId: schedule.productId,
            establishmentId: schedule.establishmentId,
          },
          createdAt: { gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
        },
        include: { user: true },
      });

      const dayPatterns = new Map<string, number>();
      for (const r of productReservations) {
        const dow = r.createdAt.getDay();
        const key = `${r.userId}_${dow}`;
        dayPatterns.set(key, (dayPatterns.get(key) ?? 0) + 1);
      }

      for (const [key, count] of Array.from(dayPatterns.entries())) {
        if (count < 2) continue;
        const [userId, dowStr] = key.split("_");
        if (parseInt(dowStr) !== today) continue;
        if (notifiedUsers.has(userId)) continue;

        const user = productReservations.find((r) => r.userId === userId)?.user;
        if (!user) continue;

        notifications.push({
          userId,
          userName: user.name,
          message: `Olá ${user.name}! Notei que você costuma pedir ${schedule.product.name} às ${DAY_NAMES[today]}s. A ${schedule.establishment.name} acabou de tirar uma fornada — quer adicionar à sua entrega de hoje?`,
          productId: schedule.productId,
          productName: schedule.product.name,
          establishmentId: schedule.establishmentId,
          establishmentName: schedule.establishment.name,
          bakeScheduleId: schedule.id,
        });

        notifiedUsers.add(userId);
      }
    }

    const output = { notifications };
    await logAgentRun(this.type, input, output);
    return output;
  }
}

export const retentionUpsellAgent = new RetentionUpsellAgent();
