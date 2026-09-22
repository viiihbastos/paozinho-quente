const API_BASE = "";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Erro na requisição");
  return data;
}

export const api = {
  register: (body: Record<string, unknown>) =>
    request<{ token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getEstablishments: (lat?: number, lng?: number, radius?: number) => {
    const params = new URLSearchParams();
    if (lat) params.set("lat", String(lat));
    if (lng) params.set("lng", String(lng));
    if (radius) params.set("radius", String(radius));
    return request<Establishment[]>(`/api/establishments?${params}`);
  },

  createEstablishment: (body: Record<string, unknown>) =>
    request<Establishment>("/api/establishments", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getSchedules: (establishmentId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (establishmentId) params.set("establishmentId", establishmentId);
    if (status) params.set("status", status);
    return request<BakeSchedule[]>(`/api/schedules?${params}`);
  },

  createSchedule: (body: Record<string, unknown>) =>
    request<BakeSchedule>("/api/schedules", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateScheduleStatus: (id: string, status: string) =>
    request<BakeSchedule>(`/api/schedules/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  createReservation: (bakeScheduleId: string, quantity: number) =>
    request<Reservation>("/api/reservations", {
      method: "POST",
      body: JSON.stringify({ bakeScheduleId, quantity }),
    }),

  getReservations: () => request<Reservation[]>("/api/reservations"),

  createSubscription: (establishmentId: string, planName: string) =>
    request<Subscription>("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify({ establishmentId, planName }),
    }),

  getSubscriptions: () => request<Subscription[]>("/api/subscriptions"),

  runMatchmaking: (userLat: number, userLng: number, productName?: string) =>
    request<{ matches: MatchResult[]; bestMatch: MatchResult | null }>(
      "/api/agents/matchmaking",
      {
        method: "POST",
        body: JSON.stringify({ userLat, userLng, productName }),
      }
    ),

  runDemandPrediction: (establishmentId: string) =>
    request<{ suggestions: DemandSuggestion[] }>("/api/agents/demand-prediction", {
      method: "POST",
      body: JSON.stringify({ establishmentId }),
    }),

  runRouteOptimization: (establishmentId: string) =>
    request<RouteResult>("/api/agents/route-optimization", {
      method: "POST",
      body: JSON.stringify({ establishmentId }),
    }),

  runRetention: (establishmentId?: string) =>
    request<{ notifications: UpsellNotification[] }>("/api/agents/retention", {
      method: "POST",
      body: JSON.stringify({ establishmentId }),
    }),
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Establishment {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  distanceKm?: number;
  products: Product[];
  bakeSchedules: BakeSchedule[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface BakeSchedule {
  id: string;
  establishmentId: string;
  productId: string;
  scheduledAt: string;
  readyAt?: string;
  quantity: number;
  available: number;
  status: string;
  product: Product;
  establishment?: { id: string; name: string; lat: number; lng: number; address: string };
}

export interface Reservation {
  id: string;
  quantity: number;
  totalPrice: number;
  status: string;
  bakeSchedule: BakeSchedule;
  payment?: { status: string; externalId: string };
}

export interface Subscription {
  id: string;
  planName: string;
  price: number;
  status: string;
  cashbackBalance: number;
  establishment: { name: string };
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

export interface DemandSuggestion {
  productId: string;
  productName: string;
  suggestedQuantity: number;
  scheduledAt: string;
  confidence: number;
  reasoning: string;
}

export interface RouteResult {
  routeId: string;
  stops: { order: number; userName: string; address: string }[];
  totalDistanceKm: number;
  estimatedMinutes: number;
}

export interface UpsellNotification {
  userId: string;
  userName: string;
  message: string;
  productName: string;
  establishmentName: string;
}
