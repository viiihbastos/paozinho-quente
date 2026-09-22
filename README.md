# 🍞 Paozinho Quente

Sistema de localização de paozinho quente — conecta consumidores a padarias no momento exato em que o pão sai do forno.

Projeto desenvolvido seguindo a metodologia **AI-Driven Development** (curso lgsreal/ai-driven-dev).

## Entregáveis

| Entregável | Local |
|-----------|-------|
| Documento de arquitetura | [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) |
| Arquivos de contexto | [`context/`](context/) |
| Implementação (FRONT → API → DB) | Este repositório |
| Vídeo de demonstração | _A ser gravado pelo aluno_ |

## Funcionalidades

- ✅ Cadastro de Estabelecimento
- ✅ Cronograma de paozinho quente (fornadas em tempo real)
- ✅ Mapa de padarias próximas (Leaflet + OpenStreetMap)
- ✅ Cadastro de usuário (Consumidor, ADM, Operador)
- ✅ Assinaturas com gateway de pagamento mock + cashback
- ✅ Sistema de agendamento e reserva
- ✅ Pagamento na reserva
- ✅ 4 Agentes de IA (PCP, Matchmaking, Rotas, Retenção)

## Arquitetura

```
FRONT (Next.js + React + Tailwind + Leaflet)
  ↓ REST/HTTPS
API (Next.js API Routes + Services)
  ↓ Prisma ORM
DB (SQLite)
```

Detalhes completos em [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

## Quick Start

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env

# Criar banco e popular dados demo
npm run db:setup

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Contas Demo

| Papel | Email | Senha |
|-------|-------|-------|
| Consumidor | maria@email.com | 123456 |
| Admin Padaria | joao@padaria.com | 123456 |
| Operador | operador@padaria.com | 123456 |

## Cursor Rules (AI-Driven Development)

Regras persistentes para o agente do Cursor em `.cursor/rules/`:

| Rule | Escopo |
|------|--------|
| `project.mdc` | Sempre ativa — visão geral e convenções |
| `api-routes.mdc` | `src/app/api/**` |
| `agents-ia.mdc` | `src/services/agents/**` |
| `frontend.mdc` | `src/**/*.tsx` |
| `prisma-database.mdc` | `prisma/**` |
| `ai-driven-dev.mdc` | `context/`, `docs/` |

Ver também [`AGENTS.md`](AGENTS.md) para guia completo de agentes IA.

## Estrutura do Projeto

```
├── .cursor/rules/     # Cursor rules (AI-Driven Development)
├── context/           # Arquivos de contexto (AI-Driven Development)
├── docs/              # Documentação de arquitetura
├── prisma/            # Schema e seed do banco
├── src/
│   ├── app/           # Pages + API Routes
│   ├── components/    # Componentes React
│   ├── lib/           # Utilitários (auth, db, geo, payment)
│   └── services/
│       └── agents/    # Agentes de IA
└── README.md
```

## Agentes de IA

| Agente | Endpoint | Descrição |
|--------|----------|-----------|
| PCP Autônomo | `POST /api/agents/demand-prediction` | Previsão de demanda por fornada |
| Matchmaking | `POST /api/agents/matchmaking` | Encontra padaria com pão quente |
| Rotas | `POST /api/agents/route-optimization` | Otimiza entregas de assinantes |
| Retenção | `POST /api/agents/retention` | Upsell contextual |

## Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS, Leaflet
- **Backend:** Next.js API Routes, TypeScript
- **Banco:** SQLite + Prisma ORM
- **Auth:** JWT + bcryptjs

## Licença

Projeto educacional — AI-Driven Development.
