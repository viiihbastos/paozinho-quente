# Contexto: Modelo de Domínio

## Entidades

### User
- id, email, passwordHash, name, role, address, lat, lng

### Establishment
- id, name, address, lat, lng, phone, adminUserId

### Product
- id, establishmentId, name, price, category

### BakeSchedule (Fornada)
- id, establishmentId, productId, scheduledAt, readyAt, quantity, available, status
- Status: SCHEDULED | BAKING | READY | SOLD_OUT

### Reservation (Reserva)
- id, userId, bakeScheduleId, quantity, totalPrice, status, paymentId

### Subscription (Assinatura)
- id, userId, establishmentId, planName, price, frequency, status, cashbackBalance

### Payment
- id, amount, method, status, type (RESERVATION | SUBSCRIPTION), externalId

### DeliveryRoute
- id, establishmentId, date, stops (JSON), totalDistance, status

### AgentLog
- id, agentType, input, output, createdAt

## Regras de Negócio
1. Reserva só é confirmada após pagamento aprovado
2. Quantidade reservada decrementa `available` da fornada
3. Fornada `SOLD_OUT` não aceita novas reservas
4. Operador pode atualizar status da fornada; ADM gerencia tudo
5. Assinatura ativa gera pedido recorrente diário
6. Cashback: 5% do valor pago em assinaturas
