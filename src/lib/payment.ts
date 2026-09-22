export type PaymentStatus = "PENDING" | "APPROVED" | "FAILED" | "REFUNDED";

export interface PaymentResult {
  success: boolean;
  externalId: string;
  status: PaymentStatus;
}

export async function processPayment(
  amount: number,
  method: string = "card"
): Promise<PaymentResult> {
  await new Promise((r) => setTimeout(r, 300));

  const approved = Math.random() < 0.95;
  return {
    success: approved,
    externalId: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: approved ? "APPROVED" : "FAILED",
  };
}

export function calculateCashback(amount: number, rate: number = 0.05): number {
  return Math.round(amount * rate * 100) / 100;
}
