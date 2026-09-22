# Contexto: Arquitetura

## Camadas
```
FRONT (Next.js + React + Tailwind + Leaflet)
  ↓ REST/HTTPS
API (Next.js API Routes + Services)
  ↓ Prisma ORM
DB (SQLite dev / PostgreSQL prod)
```

## Princípios
- Monolito modular com separação clara de responsabilidades
- API RESTful com autenticação JWT
- Services layer para lógica de negócio e agentes IA
- Context files alimentam desenvolvimento assistido por IA

## Autenticação
- JWT com roles: CONSUMER, ESTABLISHMENT_ADMIN, ESTABLISHMENT_OPERATOR
- Middleware verifica token e role em rotas protegidas

## Integrações Futuras
- Stripe (pagamentos reais)
- Firebase (push notifications)
- OpenAI/Anthropic (agentes com LLM)
