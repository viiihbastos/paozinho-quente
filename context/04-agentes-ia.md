# Contexto: Agentes de IA

## 1. Agente de Previsão de Demanda (PCP)
**Arquivo:** `src/services/agents/demand-prediction.ts`
- Analisa assinaturas ativas + histórico de pedidos ad-hoc
- Calcula média móvel ponderada por dia da semana e horário
- Retorna sugestão: `{ productId, suggestedQuantity, scheduledAt, confidence }`

## 2. Agente de Matchmaking Dinâmico
**Arquivo:** `src/services/agents/matchmaking.ts`
- Recebe pedido ad-hoc com localização e produto desejado
- Busca padarias num raio otimizado
- Prioriza: status READY > BAKING (prestes) > SCHEDULED (próximo)
- Retorna: `{ establishmentId, bakeScheduleId, estimatedWaitMinutes, score }`

## 3. Agente de Otimização de Rotas
**Arquivo:** `src/services/agents/route-optimization.ts`
- Agrupa entregas de assinantes por proximidade (clustering)
- Algoritmo nearest-neighbor para sequência de paradas
- Retorna: `{ routeId, stops[], totalDistanceKm, estimatedMinutes }`

## 4. Agente de Retenção e Upsell
**Arquivo:** `src/services/agents/retention-upsell.ts`
- Analisa padrões de compra (produto + dia da semana)
- Cruza com fornadas do dia que estão READY
- Gera notificação personalizada
- Retorna: `{ userId, message, productId, establishmentId, bakeScheduleId }`

## Extensibilidade
Todos os agentes implementam interface `Agent<TInput, TOutput>` e registram logs em `AgentLog`.
Futuro: substituir lógica determinística por chamadas LLM mantendo a mesma interface.
