# Contexto: Regras de Negócio

## Cronograma de Fornadas
- ADM/Operador cria fornada com horário previsto e quantidade
- Status evolui: SCHEDULED → BAKING → READY → SOLD_OUT
- Consumidor vê apenas fornadas futuras ou em andamento

## Reservas
- Consumidor escolhe fornada + quantidade
- Pagamento é processado antes da confirmação
- Se pagamento falhar, reserva é cancelada
- Quantidade disponível é decrementada atomicamente

## Assinaturas
- Planos: Diário, Semanal (5 dias), Mensal
- Cashback de 5% acumulado a cada pagamento
- Cancelamento mantém cashback disponível por 90 dias

## Permissões
| Ação | CONSUMER | OPERATOR | ADMIN |
|------|----------|----------|-------|
| Ver mapa/cronograma | ✅ | ✅ | ✅ |
| Criar reserva | ✅ | ❌ | ❌ |
| Criar fornada | ❌ | ✅ | ✅ |
| Gerenciar estabelecimento | ❌ | ❌ | ✅ |
| Executar agentes | ❌ | ✅ | ✅ |

## Pagamento
- Mock gateway simula aprovação em 95% dos casos
- Webhook interno confirma pagamento e ativa reserva/assinatura
- Tipos: RESERVATION (único), SUBSCRIPTION (recorrente)
