# Sistema de Notificações - Documento de Design

## Visão Geral

O sistema de notificações será uma extensão do sistema atual, adicionando funcionalidades avançadas de recorrência, integração com eventos e gerenciamento de estado. O design mantém a arquitetura existente (Repository Pattern + Service Layer + IPC) e adiciona novos componentes especializados.

## Arquitetura

### Arquitetura Geral
```
┌─────────────────────────────────────────────────────────────┐
│                    RENDERER PROCESS                         │
├─────────────────────────────────────────────────────────────┤
│  UI Components                                              │
│  ├── NotificationManagementPage                             │
│  ├── RecurringNotificationForm                              │
│  ├── EventReminderWidget                                    │
│  └── NotificationStatusControls                             │
├─────────────────────────────────────────────────────────────┤
│  Services                                                   │
│  ├── NotificationService (enhanced)                         │
│  ├── RecurringNotificationService                           │
│  └── EventReminderService                                   │
├─────────────────────────────────────────────────────────────┤
│  Hooks                                                      │
│  ├── useRecurringNotifications                              │
│  ├── useEventReminders                                      │
│  └── useNotificationManagement                              │
└─────────────────────────────────────────────────────────────┘
                              │ IPC
┌─────────────────────────────────────────────────────────────┐
│                     MAIN PROCESS                            │
├─────────────────────────────────────────────────────────────┤
│  Repositories                                               │
│  ├── NotificationRepository (enhanced)                      │
│  ├── RecurringNotificationRepository                        │
│  └── EventReminderRepository                                │
├─────────────────────────────────────────────────────────────┤
│  Background Services                                        │
│  ├── NotificationScheduler                                  │
│  ├── RecurrenceCalculator                                   │
│  └── EventWatcher                                           │
├─────────────────────────────────────────────────────────────┤
│  Database Layer                                             │
│  └── MySQL Database (extended schema)                       │
└─────────────────────────────────────────────────────────────┘
```

## Componentes e Interfaces

### 1. Modelos de Dados Estendidos

#### Notification (Enhanced)
```typescript
interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    
    // Campos de recorrência
    frequency: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    isActive: boolean;
    isPaused: boolean;  // NOVO: para pausar notificações recorrentes
    
    // Campos de agendamento
    nextShow?: Date;
    showTime?: string;  // HH:MM format
    weekdays?: string;  // "1,2,3,4,5" para seg-sex
    monthDay?: number;  // 1-31 para notificações mensais
    
    // Campos de controle
    read: boolean;
    readAt?: Date;
    showCount: number;
    maxShows?: number;
    
    // Campos de categorização
    priority: number;
    category?: string;
    tags?: string;
    
    // Campos de relacionamento
    sourceType?: 'manual' | 'event_start' | 'event_end';
    sourceId?: number;  // ID do evento relacionado
    
    // Timestamps
    createdAt: Date;
    updatedAt?: Date;
}
```

#### EventReminder (Novo)
```typescript
interface EventReminder {
    id: number;
    eventId: number;
    eventName: string;
    reminderType: 'start' | 'end';
    triggerDate: Date;
    notificationId?: number;  // Referência à notificação criada
    isProcessed: boolean;
    createdAt: Date;
}
```

#### RecurringNotificationTemplate (Novo)
```typescript
interface RecurringNotificationTemplate {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    isActive: boolean;
    isPaused: boolean;
    
    // Configurações de agendamento
    showTime: string;
    weekdays?: string;
    monthDay?: number;
    
    // Controle de execução
    lastExecuted?: Date;
    nextExecution: Date;
    executionCount: number;
    maxExecutions?: number;
    
    // Metadados
    priority: number;
    category?: string;
    tags?: string;
    
    createdAt: Date;
    updatedAt?: Date;
}
```

### 2. Repositórios

#### NotificationRepository (Enhanced)
```typescript
class NotificationRepository {
    // Métodos existentes mantidos
    static async getAll(): Promise<Notification[]>
    static async getToShow(): Promise<Notification[]>
    static async create(data: any): Promise<any>
    static async markAsRead(id: number): Promise<any>
    
    // Novos métodos
    static async getBySourceEvent(eventId: number): Promise<Notification[]>
    static async updateRecurringStatus(id: number, isPaused: boolean): Promise<any>
    static async getRecurringNotifications(): Promise<Notification[]>
    static async deleteRecurringNotification(id: number): Promise<any>
    static async getNotificationHistory(templateId: number): Promise<Notification[]>
}
```

#### RecurringNotificationRepository (Novo)
```typescript
class RecurringNotificationRepository {
    static async create(template: RecurringNotificationTemplate): Promise<any>
    static async getAll(): Promise<RecurringNotificationTemplate[]>
    static async getActive(): Promise<RecurringNotificationTemplate[]>
    static async updateStatus(id: number, isActive: boolean, isPaused: boolean): Promise<any>
    static async update(id: number, data: Partial<RecurringNotificationTemplate>): Promise<any>
    static async delete(id: number): Promise<any>
    static async getReadyForExecution(): Promise<RecurringNotificationTemplate[]>
    static async updateLastExecution(id: number, nextExecution: Date): Promise<any>
}
```

#### EventReminderRepository (Novo)
```typescript
class EventReminderRepository {
    static async createForEvent(eventId: number, eventName: string, startDate: Date, endDate: Date): Promise<any>
    static async getUnprocessed(): Promise<EventReminder[]>
    static async markAsProcessed(id: number, notificationId: number): Promise<any>
    static async deleteByEvent(eventId: number): Promise<any>
    static async updateEventReminders(eventId: number, eventName: string, startDate: Date, endDate: Date): Promise<any>
}
```

### 3. Serviços

#### RecurringNotificationService (Novo)
```typescript
class RecurringNotificationService {
    async createRecurringNotification(data: CreateRecurringNotificationData): Promise<any>
    async updateRecurringNotification(id: number, data: UpdateRecurringNotificationData): Promise<any>
    async pauseRecurringNotification(id: number): Promise<any>
    async resumeRecurringNotification(id: number): Promise<any>
    async deleteRecurringNotification(id: number): Promise<any>
    async getAllRecurringNotifications(): Promise<RecurringNotificationTemplate[]>
    async getNotificationHistory(templateId: number): Promise<Notification[]>
}
```

#### EventReminderService (Novo)
```typescript
class EventReminderService {
    async createEventReminders(event: { id: number, name: string, startDate: Date, endDate: Date }): Promise<any>
    async updateEventReminders(event: { id: number, name: string, startDate: Date, endDate: Date }): Promise<any>
    async deleteEventReminders(eventId: number): Promise<any>
    async processEventReminders(): Promise<void>
}
```

#### NotificationScheduler (Background Service - Main Process)
```typescript
class NotificationScheduler {
    private intervalId?: NodeJS.Timeout;
    
    start(): void
    stop(): void
    private async processRecurringNotifications(): Promise<void>
    private async processEventReminders(): Promise<void>
    private calculateNextExecution(template: RecurringNotificationTemplate): Date
}
```

### 4. Componentes de Interface

#### NotificationManagementPage (Enhanced)
- Lista todas as notificações (simples e recorrentes)
- Filtros por tipo, status, categoria
- Ações em lote (marcar como lida, excluir)
- Navegação para formulários de criação

#### RecurringNotificationForm (Novo)
- Formulário para criar/editar notificações recorrentes
- Seleção de frequência (diária, semanal, mensal)
- Configuração de horários e dias específicos
- Preview da próxima execução

#### EventReminderWidget (Novo)
- Exibe próximos lembretes de eventos
- Integração com dados de projetos/eventos existentes
- Ações rápidas (adiar, marcar como lida)

#### NotificationStatusControls (Novo)
- Controles para pausar/reativar notificações recorrentes
- Visualização do histórico de execuções
- Estatísticas de notificações

## Modelos de Dados

### Schema de Banco de Dados (Extensões)

#### Tabela: notifications (Enhanced)
```sql
ALTER TABLE notifications ADD COLUMN isPaused BOOLEAN DEFAULT FALSE;
ALTER TABLE notifications ADD COLUMN sourceType ENUM('manual', 'event_start', 'event_end') DEFAULT 'manual';
ALTER TABLE notifications ADD COLUMN sourceId INT NULL;
ALTER TABLE notifications ADD INDEX idx_source (sourceType, sourceId);
ALTER TABLE notifications ADD INDEX idx_recurring (frequency, isActive, isPaused);
```

#### Tabela: recurring_notification_templates (Nova)
```sql
CREATE TABLE recurring_notification_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
    frequency ENUM('DAILY', 'WEEKLY', 'MONTHLY') NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    isPaused BOOLEAN DEFAULT FALSE,
    
    showTime TIME NOT NULL,
    weekdays VARCHAR(20) NULL,  -- "1,2,3,4,5"
    monthDay INT NULL,          -- 1-31
    
    lastExecuted DATETIME NULL,
    nextExecution DATETIME NOT NULL,
    executionCount INT DEFAULT 0,
    maxExecutions INT NULL,
    
    priority INT DEFAULT 1,
    category VARCHAR(100) NULL,
    tags TEXT NULL,
    
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_execution (isActive, isPaused, nextExecution),
    INDEX idx_frequency (frequency, isActive)
);
```

#### Tabela: event_reminders (Nova)
```sql
CREATE TABLE event_reminders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    eventId INT NOT NULL,
    eventName VARCHAR(255) NOT NULL,
    reminderType ENUM('start', 'end') NOT NULL,
    triggerDate DATETIME NOT NULL,
    notificationId INT NULL,
    isProcessed BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (notificationId) REFERENCES notifications(id) ON DELETE SET NULL,
    INDEX idx_processing (isProcessed, triggerDate),
    INDEX idx_event (eventId),
    UNIQUE KEY unique_event_reminder (eventId, reminderType)
);
```

## Tratamento de Erros

### Estratégias de Erro
1. **Falhas de Agendamento**: Log de erros + retry automático
2. **Conflitos de Recorrência**: Resolução baseada em timestamp
3. **Eventos Inválidos**: Validação prévia + notificação ao usuário
4. **Falhas de Sincronização**: Mecanismo de reconciliação

### Validações
- Datas futuras para agendamentos
- Horários válidos (00:00-23:59)
- Dias da semana válidos (1-7)
- Dias do mês válidos (1-31)
- Limites de execução razoáveis

## Estratégia de Testes

### Testes Unitários
- Cálculo de próximas execuções
- Validação de dados de entrada
- Lógica de pausar/reativar

### Testes de Integração
- Fluxo completo de criação de notificação recorrente
- Sincronização com eventos
- Processamento em background

### Testes de Interface
- Formulários de criação/edição
- Ações em lote
- Responsividade dos componentes

## Fluxos de Trabalho

### Fluxo 1: Criação de Notificação Recorrente
1. Usuário acessa formulário de notificação recorrente
2. Preenche dados (título, mensagem, frequência, horário)
3. Sistema valida dados e calcula próxima execução
4. Template é salvo na base de dados
5. Scheduler inclui template no ciclo de processamento

### Fluxo 2: Processamento de Notificações Recorrentes
1. Scheduler executa a cada minuto
2. Busca templates prontos para execução
3. Cria notificação individual baseada no template
4. Calcula e atualiza próxima execução
5. Incrementa contador de execuções

### Fluxo 3: Integração com Eventos
1. Sistema detecta criação/modificação de evento
2. EventReminderService cria/atualiza lembretes automáticos
3. Lembretes são processados pelo scheduler
4. Notificações são criadas nos momentos apropriados

### Fluxo 4: Gerenciamento de Status
1. Usuário acessa lista de notificações recorrentes
2. Seleciona ação (pausar, reativar, excluir)
3. Sistema atualiza status do template
4. Scheduler respeita novo status no próximo ciclo

## Migração do Sistema Atual

### Fase 1: Extensão do Schema
- Adicionar colunas à tabela notifications existente
- Criar novas tabelas (recurring_notification_templates, event_reminders)
- Migrar dados existentes mantendo compatibilidade

### Fase 2: Implementação dos Serviços
- Criar novos repositórios e serviços
- Implementar scheduler em background
- Adicionar novos endpoints IPC

### Fase 3: Interface de Usuário
- Estender página de notificações existente
- Criar novos componentes especializados
- Integrar com formulários existentes

### Fase 4: Integração com Eventos
- Conectar com sistema de projetos/eventos existente
- Implementar watchers para mudanças
- Criar lembretes automáticos retroativos

### Compatibilidade
- Manter API existente funcionando
- Notificações simples continuam funcionando normalmente
- Migração gradual sem quebrar funcionalidades atuais