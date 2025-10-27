// Tipos para substituir os tipos do Prisma

export interface Project {
    id: number;
    name: string;
    description: string;
    status: 'active' | 'completed' | 'paused';
    progress: number;
    githubUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Technology {
    id: number;
    name: string;
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    frequency: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    isActive: boolean;
    isPaused: boolean;  // NEW: for pausing recurring notifications
    read: boolean;
    readAt?: Date;
    nextShow?: Date;
    showCount: number;
    maxShows?: number;
    showTime?: string;
    weekdays?: string;
    monthDay?: number;
    priority: number;
    category?: string;
    tags?: string;

    // NEW: Source tracking for event-based notifications
    sourceType: 'manual' | 'event_start' | 'event_end' | 'template';
    sourceId?: number;  // ID of the related event

    createdAt: Date;
    updatedAt?: Date;
}

export interface FocusDate {
    id: number;
    startDate: Date;
    endDate: Date;
    projectId: number;
    createdAt: Date;
}

export interface ProjectWithTechnologies extends Project {
    technologies: {
        technology: Technology;
    }[];
}

// Tipos para métricas do sistema
export interface SystemMetric {
    id: number;
    type: 'cpu' | 'memory' | 'disk' | 'network';
    value: number;
    unit: string;
    timestamp: Date;
}

// Tipos para dados meteorológicos
export interface WeatherData {
    id: number;
    location: string;
    temperature: number;
    humidity: number;
    condition: string;
    icon?: string;
    timestamp: Date;
}

// NEW: Recurring notification templates
export interface RecurringNotificationTemplate {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    isActive: boolean;
    isPaused: boolean;

    // Scheduling configuration
    showTime: string;  // HH:MM format
    weekdays?: string;  // "1,2,3,4,5" for weekdays
    monthDay?: number;  // 1-31 for monthly notifications

    // Execution control
    lastExecuted?: Date;
    nextExecution: Date;
    executionCount: number;
    maxExecutions?: number;

    // Metadata
    priority: number;
    category?: string;
    tags?: string;

    createdAt: Date;
    updatedAt?: Date;
}

// NEW: Event reminders for automatic notifications
export interface EventReminder {
    id: number;
    eventId: number;
    eventName: string;
    reminderType: 'start' | 'end';
    triggerDate: Date;
    notificationId?: number;  // Reference to created notification
    isProcessed: boolean;
    createdAt: Date;
}

// Tipos para configurações da aplicação
export interface AppSettings {
    id: number;
    key: string;
    value: string;
    createdAt: Date;
    updatedAt: Date;
}