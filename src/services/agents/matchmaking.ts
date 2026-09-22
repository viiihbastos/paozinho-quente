import { prisma } from "@/lib/db";
import { haversineDistance } from "@/lib/geo";
import { Agent, logAgentRun } from "./types";

export interface MatchmakingInput {
  userLat: number;
  userLng: number;
  productName?: string;
  maxRadiusKm?: number;
}

export interface MatchResult {
  establishmentId: string;
  establishmentName: string;
  bakeScheduleId: string;
  productName: string;
  status: string;
  distanceKm: number;
  estimatedWaitMinutes: number;
  score: number;
}

export interface MatchmakingOutput {
  matches: MatchResult[];
  bestMatch: MatchResult | null;
}

const STATUS_SCORE: Record<string, number> = {
  READY: 100,
  BAKING: 80,
  SCHEDULED: 40,
  SOLD_OUT: 0,
};

export class MatchmakingAgent implements Agent<MatchmakingInput, MatchmakingOutput> {
  type = "MATCHMAKING" as const;

  async execute(input: MatchmakingInput): Promise<MatchmakingOutput> {
    const maxRadius = input.maxRadiusKm ?? 5;

    const schedules = await prisma.bakeSchedule.findMany({
      where: {
        status: { not: "SOLD_OUT" },
        available: { gt: 0 },
        scheduledAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        ...(input.productName
          ? { product: { name: { contains: input.productName } } }
          : {}),
      },
      include: {
        establishment: true,
        product: true,
      },
    });

    const matches: MatchResult[] = [];

    for (const schedule of schedules) {
      const dist = haversineDistance(
        input.userLat,
        input.userLng,
        schedule.establishment.lat,
        schedule.establishment.lng
      );

      if (dist > maxRadius) continue;

      let waitMinutes = 0;
      if (schedule.status === "SCHEDULED") {
        waitMinutes = Math.max(
          0,
          Math.round((schedule.scheduledAt.getTime() - Date.now()) / 60000)
        );
      } else if (schedule.status === "BAKING") {
        waitMinutes = 10;
      }

      const statusScore = STATUS_SCORE[schedule.status];
      const distanceScore = Math.max(0, 100 - dist * 20);
      const availabilityScore = Math.min(100, schedule.available * 10);
      const score = statusScore * 0.5 + distanceScore * 0.3 + availabilityScore * 0.2;

      matches.push({
        establishmentId: schedule.establishmentId,
        establishmentName: schedule.establishment.name,
        bakeScheduleId: schedule.id,
        productName: schedule.product.name,
        status: schedule.status,
        distanceKm: Math.round(dist * 100) / 100,
        estimatedWaitMinutes: waitMinutes,
        score: Math.round(score * 100) / 100,
      });
    }

    matches.sort((a, b) => b.score - a.score);
    const output = { matches, bestMatch: matches[0] ?? null };
    await logAgentRun(this.type, input, output);
    return output;
  }
}

export const matchmakingAgent = new MatchmakingAgent();
