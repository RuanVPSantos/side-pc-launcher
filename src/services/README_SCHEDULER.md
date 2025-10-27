# 📅 Sistema de Scheduler de Notificações

## Como Funciona

O sistema de scheduler é responsável por processar templates de notificações recorrentes e criar notificações individuais automaticamente.

### 🔄 Fluxo de Funcionamento

1. **Criação de Template**: Usuário cria um template de notificação recorrente
2. **Scheduler Ativo**: Sistema verifica templates a cada 1 minuto
3. **Processamento**: Templates com `nextExecution <= NOW()` são processados
4. **Criação de Notificação**: Uma notificação individual é criada baseada no template
5. **Cálculo da Próxima Execução**: Sistema calcula quando executar novamente
6. **Atualização do Template**: Template é atualizado com nova data de execução

### 📋 Critérios para Processamento

Um template é processado quando:
- ✅ `isActive = TRUE`
- ✅ `isPaused = FALSE`
- ✅ `nextExecution <= NOW()`
- ✅ `executionCount < maxExecutions` (se definido)

### 🕐 Tipos de Frequência

#### DAILY (Diário)
- Executa todos os dias no horário definido
- Se `weekdays` especificado: apenas nos dias da semana selecionados
- Próxima execução: +1 dia (ajustado para weekdays se necessário)

#### WEEKLY (Semanal)  
- Executa semanalmente
- Se `weekdays` especificado: nos dias específicos da semana
- Próxima execução: +7 dias (ou próximo dia válido da semana)

#### MONTHLY (Mensal)
- Executa mensalmente
- Se `monthDay` especificado: no dia específico do mês
- Próxima execução: +1 mês (no dia especificado)

### 🎯 Exemplo de Uso

```javascript
// Template criado:
{
  title: "Backup Diário",
  frequency: "DAILY",
  showTime: "09:00",
  weekdays: "1,2,3,4,5", // Segunda a Sexta
  isActive: true,
  isPaused: false
}

// Resultado:
// - Notificação criada todos os dias úteis às 9h
// - Template atualizado com próxima execução
// - Contador de execuções incrementado
```

### 🔧 Controles Disponíveis

#### Via IPC:
- `scheduler:start` - Iniciar scheduler
- `scheduler:stop` - Parar scheduler  
- `scheduler:status` - Verificar status
- `scheduler:forceProcess` - Forçar processamento imediato

#### Via Interface:
- **PROCESSAR AGORA**: Força processamento imediato
- **STATUS SCHEDULER**: Mostra se está rodando
- **Pausar/Despausar**: Controla templates individuais

### 📊 Logs do Sistema

```
📅 Starting notification scheduler (checking every 1 minute(s))
📅 Processing notifications...
📋 Found 2 recurring templates ready for execution
🔄 Processing template: Backup Diário
✅ Template "Backup Diário" executed, next execution: 24/10/2025, 09:00:00
🔄 Processing template: Reunião Semanal  
✅ Template "Reunião Semanal" executed, next execution: 31/10/2025, 14:00:00
📋 Found 0 event reminders to process
✅ Notification processing completed
```

### 🚀 Inicialização Automática

O scheduler é iniciado automaticamente quando a aplicação é carregada:

```javascript
// Em src/main/database.ts
const scheduler = NotificationScheduler.getInstance();
scheduler.start(1); // Verifica a cada 1 minuto
```

### 🔍 Troubleshooting

#### Template não está sendo processado?
1. Verifique se `isActive = true`
2. Verifique se `isPaused = false`  
3. Confirme se `nextExecution` está no passado
4. Verifique se não atingiu `maxExecutions`

#### Notificações não aparecem?
1. Verifique se foram criadas (logs do scheduler)
2. Confirme se `isActive = true` na notificação criada
3. Verifique se não estão marcadas como lidas

#### Scheduler não está rodando?
1. Use `STATUS SCHEDULER` na interface
2. Verifique logs de inicialização
3. Use `scheduler:start` via IPC se necessário

### 📈 Performance

- **Intervalo**: 1 minuto (configurável)
- **Impacto**: Mínimo - apenas consultas SQL simples
- **Escalabilidade**: Suporta centenas de templates
- **Precisão**: ±1 minuto (dependendo do intervalo)