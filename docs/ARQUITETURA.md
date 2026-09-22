# Arquitetura — Sistema de Localização de Paozinho Quente

## 1. Visão Geral

O **Paozinho Quente** conecta consumidores a padarias que informam quando o pão acaba de sair do forno. O sistema garante que o cliente chegue (ou receba) no momento certo — com pão quente.

### Problema

- Toda vez que vou à padoca, o paozinho não está quente
- Não tenho tempo para comprar o paozinho na padoca

### Solução

Plataforma com cronograma de fornadas em tempo real, mapa de padarias próximas, reservas com pagamento antecipado, assinaturas recorrentes e agentes de IA que otimizam demanda, matchmaking e rotas de entrega.

---

## 2. Diagrama de Arquitetura (Camadas)

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  Next.js 14 (App Router) + React + Tailwind CSS                 │
│  • Mapa interativo (Leaflet)                                    │
│  • Dashboard Estabelecimento (ADM / Operador)                   │
│  • App Consumidor (visualização, reserva, assinatura)           │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API (Backend)                           │
│  Next.js API Routes + Services Layer                            │
│  • Auth (JWT)          • Estabelecimentos    • Cronograma         │
│  • Usuários            • Reservas            • Assinaturas      │
│  • Pagamentos (mock)   • Agentes IA          • Notificações     │
└────────────────────────────┬────────────────────────────────────┘
                             │ Prisma ORM
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BANCO DE DADOS                              │
│  SQLite (dev) / PostgreSQL (prod)                               │
│  Users, Establishments, BakeSchedules, Orders, Subscriptions,   │
│  Payments, DeliveryRoutes, AgentLogs                            │
└─────────────────────────────────────────────────────────────────┘
```

### Fluxo principal

```
FRONT → API → DB
  │       │
  │       └── Agentes IA (serviços assíncronos)
  │             ├── Previsão de Demanda (PCP)
  │             ├── Matchmaking Dinâmico
  │             ├── Otimização de Rotas
  │             └── Retenção & Upsell
  └── Mapa + Cronograma + Reservas
```

---

## 3. Tipos de Usuários e Permissões

| Papel | Permissões |
|-------|-----------|
| **Consumidor** | Visualizar mapa e cronogramas; criar reservas; assinar planos; pagar; receber notificações |
| **Estabelecimento — ADM** | CRUD completo do estabelecimento; gerenciar operadores; cronograma de fornadas; relatórios; rotas |
| **Estabelecimento — Operador** | Atualizar status de fornadas; confirmar reservas; marcar entregas |

---

## 4. Módulos Funcionais

### 4.1 Cadastro de Estabelecimento
- Nome, endereço, coordenadas (lat/lng), horário de funcionamento
- Produtos oferecidos (pão francês, pão de queijo, etc.)
- Vinculação a usuário ADM

### 4.2 Cronograma de Paozinho Quente
- Fornadas programadas com horário previsto de saída
- Status: `scheduled` → `baking` → `ready` → `sold_out`
- Quantidade estimada e disponível para reserva

### 4.3 Mapa de Padarias Próximas
- Busca por raio (km) a partir da localização do consumidor
- Filtro por padarias com fornada `ready` ou `baking` (prestes a sair)
- Exibição de distância e próximo horário de pão quente

### 4.4 Cadastro de Usuário
- Email, senha, nome, endereço (consumidor)
- Roles: `CONSUMER`, `ESTABLISHMENT_ADMIN`, `ESTABLISHMENT_OPERATOR`

### 4.5 Assinaturas (Subscription)
- Planos mensais com entrega recorrente
- Integração com gateway de pagamento (Stripe mock)
- Cashback acumulado por fidelidade

### 4.6 Sistema de Agendamento e Reserva
- Reserva vinculada a uma fornada específica
- Pagamento na reserva (pré-pago)
- Confirmação automática ou manual pelo operador

### 4.7 Pagamento
- Mock gateway para desenvolvimento
- Webhook simulado para confirmação
- Suporte a pagamento único (reserva) e recorrente (assinatura)

---

## 5. Agentes de IA (Diferenciais)

### 5.1 Agente de Previsão de Demanda (PCP Autônomo)
- **Entrada:** assinaturas ativas + histórico de pedidos ad-hoc
- **Saída:** sugestão de quantidade por fornada e horário
- **Algoritmo:** média móvel ponderada + sazonalidade por dia da semana

### 5.2 Agente de Matchmaking Dinâmico
- **Entrada:** pedido ad-hoc (produto, localização, urgência)
- **Saída:** padaria otimizada com pão recém-saído ou prestes a sair
- **Critérios:** distância, status da fornada, entregadores disponíveis

### 5.3 Agente de Otimização de Rotas de Assinatura
- **Entrada:** pedidos recorrentes do dia + endereços
- **Saída:** rota otimizada agrupando vizinhos/bairros
- **Algoritmo:** nearest-neighbor + clustering por bairro

### 5.4 Agente de Retenção e Upsell
- **Entrada:** histórico de compras do consumidor + fornadas do dia
- **Saída:** notificação contextual com oferta personalizada
- **Exemplo:** "Você costuma pedir pão de queijo às sextas. A Padaria X acabou de tirar uma fornada!"

---

## 6. Modelo de Dados (Entidades)

```
User ──┬── Establishment (1:N via admin)
       ├── Subscription (1:N)
       └── Order/Reservation (1:N)

Establishment ──┬── BakeSchedule (1:N)
                ├── Product (1:N)
                └── DeliveryRoute (1:N)

BakeSchedule ─── Order/Reservation (1:N)

Subscription ─── Payment (1:N)
Order ────────── Payment (1:1)
```

---

## 7. Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS, Leaflet |
| Backend | Next.js API Routes, TypeScript |
| ORM | Prisma |
| Banco | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Agentes | TypeScript services (extensível para LLM) |

---

## 8. Estrutura de Diretórios

```
/
├── context/              # Arquivos de contexto para AI-Driven Development
├── docs/
│   └── ARQUITETURA.md    # Este documento
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/              # Pages + API Routes
│   ├── components/       # UI Components
│   ├── lib/              # Utils, auth, db
│   └── services/
│       └── agents/       # Agentes de IA
└── README.md
```

---

## 9. Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastro de usuário |
| POST | `/api/auth/login` | Login |
| GET | `/api/establishments` | Listar padarias (com filtro geo) |
| POST | `/api/establishments` | Cadastrar padaria |
| GET | `/api/schedules` | Cronograma de fornadas |
| POST | `/api/schedules` | Criar fornada |
| PATCH | `/api/schedules/[id]` | Atualizar status da fornada |
| POST | `/api/reservations` | Criar reserva + pagamento |
| GET | `/api/subscriptions` | Listar assinaturas |
| POST | `/api/subscriptions` | Criar assinatura |
| POST | `/api/agents/demand-prediction` | Executar agente PCP |
| POST | `/api/agents/matchmaking` | Executar matchmaking |
| POST | `/api/agents/route-optimization` | Otimizar rotas |
| POST | `/api/agents/retention` | Gerar upsells |

---

## 10. Decisões Arquiteturais

1. **Monolito modular (Next.js):** simplifica deploy e atende ao escopo do curso; camadas bem separadas permitem extração futura.
2. **SQLite em dev:** zero configuração; migração para PostgreSQL é trivial via Prisma.
3. **Agentes como services TypeScript:** lógica determinística inicial, pronta para integração com LLM (OpenAI/Anthropic) sem refatoração.
4. **Pagamento mock:** simula fluxo completo sem credenciais reais; interface compatível com Stripe.
5. **Context files:** diretório `context/` alimenta o desenvolvimento assistido por IA conforme metodologia AI-Driven Development.

---

## 11. Roadmap

- [x] MVP: cadastros, cronograma, mapa, reservas
- [x] Agentes IA (lógica base)
- [x] Assinaturas + pagamento mock
- [ ] Integração Stripe real
- [ ] Push notifications (Firebase)
- [ ] App mobile (React Native)
- [ ] LLM nos agentes de retenção e matchmaking
