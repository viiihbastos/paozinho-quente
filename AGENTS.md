# AGENTS.md — Paozinho Quente

Guia para agentes de IA (Cursor, Copilot, etc.) trabalhando neste repositório.

## Projeto

**Paozinho Quente** — sistema de localização de paozinho quente com cronograma de fornadas, mapa, reservas, assinaturas e 4 agentes IA.

## Antes de codar

1. Leia `context/` (5 arquivos de contexto AI-Driven Development)
2. Consulte `docs/ARQUITETURA.md` (diagramas Mermaid)
3. Siga as rules em `.cursor/rules/`

## Estrutura

```
context/          → Contexto de produto, domínio, agentes
docs/             → Arquitetura com diagramas
src/app/api/      → API Routes REST
src/app/          → Páginas Next.js
src/components/   → UI React
src/lib/          → auth, db, geo, payment, api-client
src/services/agents/ → Agentes IA
prisma/           → Schema + seed
```

## Comandos

```bash
npm install
npm run db:setup
npm run dev       # http://localhost:3000
npm run build
```

## Agentes de IA do domínio

| Agente | Responsabilidade |
|--------|-----------------|
| PCP Autônomo | Previsão de demanda por fornada |
| Matchmaking | Padaria ideal com pão quente no raio |
| Rotas | Otimização de entregas de assinantes |
| Retenção & Upsell | Notificações contextuais |

Todos implementam `Agent<TInput, TOutput>` e registram logs em `AgentLog`.

## Convenções

- TypeScript strict, Next.js 14 App Router
- Auth JWT com roles: `CONSUMER`, `ESTABLISHMENT_ADMIN`, `ESTABLISHMENT_OPERATOR`
- UI e mensagens de erro em português
- Diff mínimo, reutilizar abstrações existentes
