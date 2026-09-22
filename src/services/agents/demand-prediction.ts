import { prisma } from "@/lib/db";
import { Agent, logAgentRun } from "./types";

export interface DemandPredictionInput {
  establishmentId: string;
  targetDate?: Date;
}

export interface DemandSuggestion {
  productId: string;
  productName: string;
  suggestedQuantity: number;
  scheduledAt: string;
  confidence: number;
  reasoning: string;
}

export interface DemandPredictionOutput {
  establishmentId: string;
  suggestions: DemandSuggestion[];
}

const DAY_WEIGHTS = [0.8, 0.9, 0.95, 1.0, 1.1, 1.3, 1.2];

export class DemandPredictionAgent
  implements Agent<DemandPredictionInput, DemandPredictionOutput>
{
  type = "DEMAND_PREDICTION" as const;

  async execute(input: DemandPredictionInput): Promise<DemandPredictionOutput> {
    const targetDate = input.targetDate ?? new Date();
    const dayOfWeek = targetDate.getDay();

    const [subscriptions, recentReservations, products] = await Promise.all([
      prisma.subscription.findMany({
        where: { establishmentId: input.establishmentId, status: "ACTIVE" },
      }),
      prisma.reservation.findMany({
        where: {
          status: { in: ["CONFIRMED", "DELIVERED"] },
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          bakeSchedule: { establishmentId: input.establishmentId },
        },
        include: { bakeSchedule: { include: { product: true } } },
      }),
      prisma.product.findMany({ where: { establishmentId: input.establishmentId } }),
    ]);

    const subscriptionDemand = subscriptions.length * 2;
    const historicalByProduct = new Map<string, number[]>();

    for (const r of recentReservations) {
      const pid = r.bakeSchedule.productId;
      const arr = historicalByProduct.get(pid) ?? [];
      arr.push(r.quantity);
      historicalByProduct.set(pid, arr);
    }

    const suggestions: DemandSuggestion[] = products.map((product) => {
      const history = historicalByProduct.get(product.id) ?? [];
      const avgHistorical =
        history.length > 0 ? history.reduce((a, b) => a + b, 0) / history.length : 5;
      const dayWeight = DAY_WEIGHTS[dayOfWeek];
      const suggested = Math.ceil((avgHistorical + subscriptionDemand / products.length) * dayWeight);

      const hours = [6, 7, 8, 9, 17, 18];
      const scheduledAt = new Date(targetDate);
      scheduledAt.setHours(hours[product.name.length % hours.length], 0, 0, 0);

      return {
        productId: product.id,
        productName: product.name,
        suggestedQuantity: suggested,
        scheduledAt: scheduledAt.toISOString(),
        confidence: history.length > 5 ? 0.85 : history.length > 0 ? 0.65 : 0.45,
        reasoning: `${history.length} pedidos nos últimos 30 dias, ${subscriptions.length} assinaturas ativas, peso do dia ${dayWeight}`,
      };
    });

    const output = { establishmentId: input.establishmentId, suggestions };
    await logAgentRun(this.type, input, output);
    return output;
  }
}

export const demandPredictionAgent = new DemandPredictionAgent();
