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

### 2.1 Visão em camadas — FRONT → API → DB

```mermaid
flowchart TB
    subgraph FRONT["🖥️ FRONTEND — Next.js 14 + React + Tailwind"]
        MAP["Mapa (Leaflet)"]
        CRON["Cronograma de Fornadas"]
        RES["Reservas & Assinaturas"]
        DASH["Dashboard Padaria"]
        AUTH_UI["Login / Cadastro"]
    end

    subgraph API["⚙️ API — Next.js API Routes + Services"]
        AUTH["Auth (JWT)"]
        EST["Estabelecimentos"]
        SCHED["Cronograma"]
        RESV["Reservas"]
        SUB["Assinaturas"]
        PAY["Pagamentos (mock)"]
        AGENTS["Agentes IA"]
    end

    subgraph DB["🗄️ BANCO DE DADOS — SQLite / PostgreSQL"]
        TABLES["Users · Establishments · BakeSchedules\nReservations · Subscriptions · Payments\nDeliveryRoutes · AgentLogs"]
    end

    FRONT -->|"HTTPS / REST"| API
    API -->|"Prisma ORM"| DB

    AGENTS --> DEMAND["PCP — Previsão de Demanda"]
    AGENTS --> MATCH["Matchmaking Dinâmico"]
    AGENTS --> ROUTE["Otimização de Rotas"]
    AGENTS --> RETAIN["Retenção & Upsell"]
```

### 2.2 Diagrama de componentes

```mermaid
graph LR
    subgraph Cliente
        C1[Consumidor]
        C2[Operador]
        C3[ADM Padaria]
    end

    subgraph Frontend
        P1[/mapa]
        P2[/cronograma]
        P3[/reservas]
        P4[/assinaturas]
        P5[/dashboard]
    end

    subgraph Backend
        R1[API Routes]
        R2[Services Layer]
        R3[Agents Layer]
    end

    subgraph Dados
        DB[(SQLite)]
    end

    C1 --> P1 & P2 & P3 & P4
    C2 --> P5
    C3 --> P5
    P1 & P2 & P3 & P4 & P5 --> R1
    R1 --> R2
    R2 --> R3
    R2 --> DB
    R3 --> DB
```

### 2.3 Fluxo principal do sistema

```mermaid
flowchart LR
    A[Usuário] --> B{Tipo?}
    B -->|Consumidor| C[Mapa / Cronograma]
    B -->|Operador/ADM| D[Dashboard Padaria]
    C --> E[Reserva ou Assinatura]
    E --> F[Pagamento]
    F --> G{Aprovado?}
    G -->|Sim| H[Confirmação]
    G -->|Não| I[Cancelamento]
    D --> J[Gestão de Fornadas]
    J --> K[Agentes IA]
    K --> L[Sugestões & Rotas]
```

---

## 3. Tipos de Usuários e Permissões

| Papel | Permissões |
|-------|-----------|
| **Consumidor** | Visualizar mapa e cronogramas; criar reservas; assinar planos; pagar; receber notificações |
| **Estabelecimento — ADM** | CRUD completo do estabelecimento; gerenciar operadores; cronograma de fornadas; relatórios; rotas |
| **Estabelecimento — Operador** | Atualizar status de fornadas; confirmar reservas; marcar entregas |

### 3.1 Diagrama de papéis e acesso

```mermaid
flowchart TD
    U[Usuário autenticado] --> R{Role JWT}

    R -->|CONSUMER| C[Consumidor]
    R -->|ESTABLISHMENT_ADMIN| A[ADM Padaria]
    R -->|ESTABLISHMENT_OPERATOR| O[Operador]

    C --> C1[Ver mapa e cronograma]
    C --> C2[Criar reserva]
    C --> C3[Assinar plano]
    C --> C4[Matchmaking IA]

    O --> O1[Atualizar status fornada]
    O --> O2[Confirmar reservas]
    O --> O3[Executar agentes IA]

    A --> A1[Tudo do Operador]
    A --> A2[CRUD estabelecimento]
    A --> A3[Gerenciar produtos]
    A --> A4[Relatórios e rotas]
```

### 3.2 Matriz de permissões

| Ação | Consumidor | Operador | ADM |
|------|:----------:|:--------:|:---:|
| Ver mapa / cronograma | ✅ | ✅ | ✅ |
| Criar reserva | ✅ | ❌ | ❌ |
| Criar / atualizar fornada | ❌ | ✅ | ✅ |
| Gerenciar estabelecimento | ❌ | ❌ | ✅ |
| Executar agentes IA | ❌ | ✅ | ✅ |
| Matchmaking (buscar pão quente) | ✅ | ✅ | ✅ |

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

### 4.8 Fluxograma — Ciclo de vida da fornada

```mermaid
stateDiagram-v2
    [*] --> SCHEDULED: ADM/Operador cria fornada
    SCHEDULED --> BAKING: Operador inicia fornada
    BAKING --> READY: Pão saiu do forno
    READY --> SOLD_OUT: Estoque esgotado
    SCHEDULED --> SOLD_OUT: Reservas esgotam quantidade
    BAKING --> SOLD_OUT: Reservas esgotam quantidade
    SOLD_OUT --> [*]
```

### 4.9 Fluxograma — Reserva com pagamento

```mermaid
sequenceDiagram
    actor C as Consumidor
    participant F as Frontend
    participant A as API
    participant P as Payment Mock
    participant D as Database

    C->>F: Seleciona fornada + quantidade
    F->>A: POST /api/reservations
    A->>D: Busca fornada (available > 0)
    A->>P: processPayment(valor)
    alt Pagamento aprovado
        P-->>A: APPROVED
        A->>D: Cria Payment + Reservation CONFIRMED
        A->>D: Decrementa available
        A-->>F: 201 Reserva confirmada
        F-->>C: Exibe confirmação
    else Pagamento recusado
        P-->>A: FAILED
        A->>D: Cria Payment + Reservation CANCELLED
        A-->>F: 402 Pagamento falhou
        F-->>C: Exibe erro
    end
```

### 4.10 Fluxograma — Assinatura com cashback

```mermaid
sequenceDiagram
    actor C as Consumidor
    participant F as Frontend
    participant A as API
    participant P as Payment Mock
    participant D as Database

    C->>F: Escolhe plano (daily/weekly/monthly)
    F->>A: POST /api/subscriptions
    A->>P: processPayment(preço do plano)
    alt Aprovado
        P-->>A: APPROVED
        A->>D: Cria Subscription ACTIVE
        A->>D: Cashback 5% acumulado
        A-->>F: 201 Assinatura ativa
    else Recusado
        P-->>A: FAILED
        A->>D: Subscription CANCELLED
        A-->>F: 402 Erro
    end
```

### 4.11 Fluxograma — Autenticação

```mermaid
flowchart TD
    A[Acesso à rota protegida] --> B{Token JWT presente?}
    B -->|Não| C[401 Não autorizado]
    B -->|Sim| D{Token válido?}
    D -->|Não| C
    D -->|Sim| E{Role permitida?}
    E -->|Não| F[403 Permissão negada]
    E -->|Sim| G[Executa operação]
```

### 4.12 Fluxograma — Mapa e matchmaking

```mermaid
flowchart TD
    A[Consumidor abre /mapa] --> B[Obtém geolocalização]
    B --> C[GET /api/establishments?lat&lng&radius]
    C --> D[Exibe padarias no mapa Leaflet]
    D --> E{Clica 'Encontrar Pão Quente'?}
    E -->|Sim| F[POST /api/agents/matchmaking]
    F --> G[Agente busca fornadas no raio]
    G --> H[Calcula score: status + distância + estoque]
    H --> I[Retorna bestMatch]
    I --> J[Exibe padaria ideal com pão quente]
    E -->|Não| K[Navega manualmente no mapa]
```

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

### 5.5 Diagrama — Ecossistema de agentes IA

```mermaid
flowchart TB
    subgraph Entradas
        E1[Assinaturas ativas]
        E2[Histórico de pedidos]
        E3[Localização do consumidor]
        E4[Fornadas do dia]
        E5[Endereços de entrega]
    end

    subgraph Agentes
        A1[🤖 PCP Autônomo]
        A2[🤖 Matchmaking]
        A3[🤖 Otimização de Rotas]
        A4[🤖 Retenção & Upsell]
    end

    subgraph Saídas
        S1[Sugestão de quantidade/horário]
        S2[Padaria ideal + score]
        S3[Rota otimizada de entrega]
        S4[Notificação personalizada]
    end

    E1 & E2 --> A1 --> S1
    E3 & E4 --> A2 --> S2
    E1 & E5 --> A3 --> S3
    E2 & E4 --> A4 --> S4

    A1 & A2 & A3 & A4 --> LOG[(AgentLog)]
```

### 5.6 Fluxograma — Agente de Matchmaking

```mermaid
flowchart TD
    START([Pedido ad-hoc]) --> A[Recebe lat/lng + produto]
    A --> B[Busca fornadas no raio de 5km]
    B --> C{Fornada disponível?}
    C -->|Não| D[Retorna lista vazia]
    C -->|Sim| E[Calcula distância Haversine]
    E --> F[Score = status×0.5 + distância×0.3 + estoque×0.2]
    F --> G[Ordena por score decrescente]
    G --> H[Retorna bestMatch]
    H --> END([Consumidor recebe padaria ideal])
    D --> END
```

### 5.7 Fluxograma — Agente PCP (Previsão de Demanda)

```mermaid
flowchart TD
    START([Trigger diário]) --> A[Conta assinaturas ativas]
    A --> B[Agrega histórico 30 dias por produto]
    B --> C[Calcula média móvel por produto]
    C --> D[Aplica peso do dia da semana]
    D --> E[Sugere quantidade + horário da fornada]
    E --> F[Calcula confidence baseado em volume histórico]
    F --> G[Registra em AgentLog]
    G --> END([ADM visualiza sugestões no dashboard])
```

### 5.8 Fluxograma — Agente de Rotas

```mermaid
flowchart TD
    START([Início do dia]) --> A[Coleta assinantes + reservas confirmadas]
    A --> B[Agrupa endereços únicos]
    B --> C[Algoritmo Nearest-Neighbor a partir da padaria]
    C --> D[Calcula distância total + tempo estimado]
    D --> E[Salva DeliveryRoute no banco]
    E --> END([Operador segue rota otimizada])
```

---

## 6. Modelo de Dados (Entidades)

### 6.1 Diagrama entidade-relacionamento (ER)

```mermaid
erDiagram
    User ||--o{ Establishment : "administra"
    User ||--o{ Reservation : "faz"
    User ||--o{ Subscription : "assina"

    Establishment ||--o{ Product : "oferece"
    Establishment ||--o{ BakeSchedule : "programa"
    Establishment ||--o{ Subscription : "recebe"
    Establishment ||--o{ DeliveryRoute : "planeja"

    Product ||--o{ BakeSchedule : "fornada de"

    BakeSchedule ||--o{ Reservation : "reservada em"

    Reservation ||--o| Payment : "paga com"
    Subscription ||--o{ Payment : "cobrança"

    User {
        string id PK
        string email
        string role
        float lat
        float lng
    }

    Establishment {
        string id PK
        string name
        float lat
        float lng
        string adminUserId FK
    }

    BakeSchedule {
        string id PK
        string status
        int quantity
        int available
        datetime scheduledAt
    }

    Reservation {
        string id PK
        int quantity
        float totalPrice
        string status
    }

    Subscription {
        string id PK
        string planName
        float cashbackBalance
        string status
    }

    Payment {
        string id PK
        float amount
        string type
        string status
    }
```

### 6.2 Visão simplificada

```mermaid
flowchart TB
    User -->|1:N admin| Establishment
    User -->|1:N| Reservation
    User -->|1:N| Subscription

    Establishment -->|1:N| Product
    Establishment -->|1:N| BakeSchedule
    Establishment -->|1:N| DeliveryRoute

    Product -->|1:N| BakeSchedule
    BakeSchedule -->|1:N| Reservation

    Reservation -->|1:1| Payment
    Subscription -->|1:N| Payment
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

### 9.1 Diagrama de integração da API

```mermaid
flowchart LR
    subgraph Auth
        R1[POST /auth/register]
        R2[POST /auth/login]
    end

    subgraph Core
        R3[GET/POST /establishments]
        R4[GET/POST /schedules]
        R5[PATCH /schedules/id]
        R6[GET/POST /reservations]
        R7[GET/POST /subscriptions]
    end

    subgraph Agentes
        R8[POST /agents/demand-prediction]
        R9[POST /agents/matchmaking]
        R10[POST /agents/route-optimization]
        R11[POST /agents/retention]
    end

    FE[Frontend Pages] --> Auth & Core & Agentes
    Auth --> JWT[JWT Token]
    JWT --> Core & Agentes
    Core --> DB[(Database)]
    Agentes --> DB
```

### 9.2 Fluxo de deploy

```mermaid
flowchart LR
    DEV[Desenvolvimento local] -->|npm run dev| LOCAL[localhost:3000]
    LOCAL -->|npm run build| BUILD[Next.js Build]
    BUILD -->|Deploy| PROD[Vercel / Node.js]
    PROD --> PG[(PostgreSQL prod)]
    LOCAL --> SQLITE[(SQLite dev)]
```

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
