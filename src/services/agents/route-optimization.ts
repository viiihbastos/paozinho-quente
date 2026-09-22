import { prisma } from "@/lib/db";
import { haversineDistance } from "@/lib/geo";
import { Agent, logAgentRun } from "./types";

export interface RouteOptimizationInput {
  establishmentId: string;
  date?: Date;
}

export interface RouteStop {
  order: number;
  userId: string;
  userName: string;
  address: string;
  lat: number;
  lng: number;
  reservationId: string;
}

export interface RouteOptimizationOutput {
  routeId: string;
  stops: RouteStop[];
  totalDistanceKm: number;
  estimatedMinutes: number;
}

export class RouteOptimizationAgent
  implements Agent<RouteOptimizationInput, RouteOptimizationOutput>
{
  type = "ROUTE_OPTIMIZATION" as const;

  async execute(input: RouteOptimizationInput): Promise<RouteOptimizationOutput> {
    const date = input.date ?? new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const establishment = await prisma.establishment.findUniqueOrThrow({
      where: { id: input.establishmentId },
    });

    const [subscriptions, reservations] = await Promise.all([
      prisma.subscription.findMany({
        where: {
          establishmentId: input.establishmentId,
          status: "ACTIVE",
        },
        include: { user: true },
      }),
      prisma.reservation.findMany({
        where: {
          status: "CONFIRMED",
          createdAt: { gte: startOfDay, lte: endOfDay },
          bakeSchedule: { establishmentId: input.establishmentId },
        },
        include: { user: true },
      }),
    ]);

    const stopsMap = new Map<string, RouteStop>();

    for (const sub of subscriptions) {
      if (sub.user.lat && sub.user.lng) {
        stopsMap.set(sub.userId, {
          order: 0,
          userId: sub.userId,
          userName: sub.user.name,
          address: sub.user.address ?? "Sem endereço",
          lat: sub.user.lat,
          lng: sub.user.lng,
          reservationId: `sub_${sub.id}`,
        });
      }
    }

    for (const res of reservations) {
      if (res.user.lat && res.user.lng) {
        stopsMap.set(res.userId, {
          order: 0,
          userId: res.userId,
          userName: res.user.name,
          address: res.user.address ?? "Sem endereço",
          lat: res.user.lat,
          lng: res.user.lng,
          reservationId: res.id,
        });
      }
    }

    const stops = Array.from(stopsMap.values());
    const optimized = this.nearestNeighbor(
      establishment.lat,
      establishment.lng,
      stops
    );

    let totalDistance = 0;
    let prevLat = establishment.lat;
    let prevLng = establishment.lng;

    for (const stop of optimized) {
      totalDistance += haversineDistance(prevLat, prevLng, stop.lat, stop.lng);
      prevLat = stop.lat;
      prevLng = stop.lng;
    }
    totalDistance += haversineDistance(prevLat, prevLng, establishment.lat, establishment.lng);

    const estimatedMinutes = Math.ceil(totalDistance * 3 + optimized.length * 5);

    const route = await prisma.deliveryRoute.create({
      data: {
        establishmentId: input.establishmentId,
        date: startOfDay,
        stops: JSON.stringify(optimized),
        totalDistance: Math.round(totalDistance * 100) / 100,
        estimatedMinutes,
        status: "planned",
      },
    });

    const output: RouteOptimizationOutput = {
      routeId: route.id,
      stops: optimized,
      totalDistanceKm: Math.round(totalDistance * 100) / 100,
      estimatedMinutes,
    };

    await logAgentRun(this.type, input, output);
    return output;
  }

  private nearestNeighbor(
    startLat: number,
    startLng: number,
    stops: RouteStop[]
  ): RouteStop[] {
    const remaining = [...stops];
    const result: RouteStop[] = [];
    let curLat = startLat;
    let curLng = startLng;
    let order = 1;

    while (remaining.length > 0) {
      let nearestIdx = 0;
      let nearestDist = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const d = haversineDistance(curLat, curLng, remaining[i].lat, remaining[i].lng);
        if (d < nearestDist) {
          nearestDist = d;
          nearestIdx = i;
        }
      }

      const next = remaining.splice(nearestIdx, 1)[0];
      next.order = order++;
      result.push(next);
      curLat = next.lat;
      curLng = next.lng;
    }

    return result;
  }
}

export const routeOptimizationAgent = new RouteOptimizationAgent();
