import { prisma } from "@/lib/db";

export type AgentType =
  | "DEMAND_PREDICTION"
  | "MATCHMAKING"
  | "ROUTE_OPTIMIZATION"
  | "RETENTION_UPSELL";

export interface Agent<TInput, TOutput> {
  type: AgentType;
  execute(input: TInput): Promise<TOutput>;
}

export async function logAgentRun<TInput, TOutput>(
  agentType: AgentType,
  input: TInput,
  output: TOutput
): Promise<void> {
  await prisma.agentLog.create({
    data: {
      agentType,
      input: JSON.stringify(input),
      output: JSON.stringify(output),
    },
  });
}
