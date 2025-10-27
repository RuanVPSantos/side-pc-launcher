# API de Notificações Estendida

Este documento descreve todas as funcionalidades disponíveis na API de notificações após a extensão do schema.

## 📋 Funcionalidades Implementadas

### 1. Notificações Básicas

#### Handlers IPC Disponíveis:
- `db:notifications:getAll` - Buscar todas as notificações
- `db:notifications:create` - Criar notificação simples
- `db:notifications:createSmart` - Criar notificação inteligente com todos os campos
- `db:notifications:getToShow` - Buscar notificações para exibir (ativas, não pausadas, não lidas)
- `db:notifications:markAsRead` - Marcar notificação como lida
- `db:notifications:markAsUnread` - **NOVO**: Marcar notificação como não lida
- `db:notifications:markAllAsRead` - Marcar todas como lidas
- `db:notifications:clearAll` - Limpar todas as notificações
- `db:notifications:updateRecurringStatus` - **NOVO**: Pausar/despausar notificação recorrente

### 2. Notificações Recorrentes (Templates)

#### Handlers IPC Disponíveis:
- `db:recurringNotifications:getAll` - Buscar todos os templates
- `db:recurringNotifications:create` - Criar novo template
- `db:recurringNotifications:update` - Atualizar template existente
- `db:recurringNotifications:delete` - Deletar template
- `db:recurringNotifications:updateStatus` - Ativar/desativar ou pausar/despausar template
- `db:recurringNotifications:getActive` - Buscar templates ativos
- `db:recurringNotifications:getReadyForExecution` - Buscar templates prontos para execução

#### Exemplo de Uso:
```javascript
// Criar template de notificação recorrente
const template = {
    title: "Lembrete Diário",
    message: "Hora de fazer backup dos projetos",
    type: "info",
    frequency: "DAILY",
    showTime: "09:00",
    isActive: true,
    isPaused: false,
    priority: 1,
    category: "backup"
};

const result = await window.electronAPI.invoke('db:recurringNotifications:create', template);
```

### 3. Lembretes de Eventos

#### Handlers IPC Disponíveis:
- `db:eventReminders:getAll` - Buscar todos os lembretes
- `db:eventReminders:createForEvent` - Criar lembretes para um evento
- `db:eventReminders:getUnprocessed` - Buscar lembretes não processados
- `db:eventReminders:markAsProcessed` - Marcar lembrete como processado
- `db:eventReminders:deleteByEvent` - Deletar lembretes de um evento
- `db:eventReminders:updateEventReminders` - Atualizar lembretes de um evento
- `db:eventReminders:getPending` - Buscar lembretes pendentes

#### Exemplo de Uso:
```javascript
// Criar lembretes para um evento
const eventId = 123;
const eventName = "Reunião Importante";
const startDate = new Date("2024-12-01T14:00:00");
const endDate = new Date("2024-12-01T16:00:00");

const result = await window.electronAPI.invoke(
    'db:eventReminders:createForEvent', 
    eventId, 
    eventName, 
    startDate, 
    endDate
);
```

## 🗄️ Estrutura do Banco de Dados

### Tabela `notifications` (Estendida)
- **Novos campos**:
  - `isPaused` (BOOLEAN) - Para pausar notificações recorrentes
  - `sourceType` (ENUM) - Tipo da fonte: 'manual', 'event_start', 'event_end'
  - `sourceId` (INT) - ID da fonte (evento, template, etc.)

### Tabela `recurring_notification_templates` (Nova)
- Gerenciamento de templates para notificações recorrentes
- Configuração de agendamento (horário, dias da semana, dia do mês)
- Controle de execução (última execução, próxima execução, contador)
- Metadados (prioridade, categoria, tags)

### Tabela `event_reminders` (Nova)
- Lembretes automáticos para eventos
- Tipos: 'start' (24h antes) e 'end' (no dia do evento)
- Controle de processamento
- Vinculação com notificações criadas

## 🔧 Funcionalidades Principais

### ✅ Marcar como Não Lida
Agora é possível marcar notificações como não lidas:
```javascript
await window.electronAPI.invoke('db:notifications:markAsUnread', notificationId);
```

### ✅ Pausar Notificações Recorrentes
Pausar temporariamente notificações recorrentes sem deletá-las:
```javascript
await window.electronAPI.invoke('db:notifications:updateRecurringStatus', notificationId, true); // pausar
await window.electronAPI.invoke('db:notifications:updateRecurringStatus', notificationId, false); // despausar
```

### ✅ Gerenciamento Completo de Templates
- Criar, editar, deletar templates de notificações recorrentes
- Controlar status (ativo/inativo, pausado/despausado)
- Agendar execuções (diário, semanal, mensal)
- Definir horários específicos e dias da semana

### ✅ Lembretes Automáticos de Eventos
- Criação automática de lembretes para eventos
- Lembrete 24h antes do início
- Lembrete no dia do evento
- Processamento automático e criação de notificações

## 📊 Índices para Performance
- `idx_source` - Para consultas por fonte
- `idx_recurring` - Para notificações recorrentes
- `idx_execution` - Para scheduler de templates
- `idx_processing` - Para processamento de lembretes
- `idx_event` - Para consultas por evento
- `idx_trigger_date` - Para consultas por data de disparo

## 🛠️ Utilitários de Data
Para garantir compatibilidade com MySQL, foi criado um módulo de utilitários de data:

```javascript
import { toMySQLDateTime, fromMySQLDateTime } from '../utils/dateUtils';

// Converter Date para formato MySQL
const mysqlDate = toMySQLDateTime(new Date()); // "2024-12-01 14:30:00"

// Converter string MySQL para Date
const jsDate = fromMySQLDateTime("2024-12-01 14:30:00");
```

## 🚀 Status da Implementação
A extensão do schema está completa e todas as funcionalidades estão disponíveis via IPC. O sistema agora suporta:
- ✅ Notificações básicas com novos campos
- ✅ Marcar como lida/não lida
- ✅ Notificações recorrentes com templates
- ✅ Pausar/despausar notificações
- ✅ Lembretes automáticos de eventos
- ✅ Sistema de migração robusto
- ✅ Índices para performance otimizada
- ✅ Interface de usuário completa
- ✅ Conversão de datas para MySQL
- ✅ Hooks personalizados para React
- ✅ Componentes visuais integrados