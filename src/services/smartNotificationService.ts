import type { Notification } from '../data/models/types';

export interface CreateSmartNotificationData {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    frequency?: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    showTime?: string; // "09:00" formato HH:mm
    weekdays?: number[]; // [1,2,3,4,5] segunda a sexta
    monthDay?: number; // dia do mês (1-31)
    priority?: 1 | 2 | 3; // 1=baixa, 2=média, 3=alta
    category?: string;
    tags?: string[];
    maxShows?: number; // null = infinito
}

export interface UpdateSmartNotificationData {
    title?: string;
    message?: string;
    type?: 'info' | 'warning' | 'error' | 'success';
    frequency?: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    isActive?: boolean;
    showTime?: string;
    weekdays?: number[];
    monthDay?: number;
    priority?: 1 | 2 | 3;
    category?: string;
    tags?: string[];
    maxShows?: number;
}

class SmartNotificationService {
    // Criar notificação inteligente
    async createSmartNotification(data: CreateSmartNotificationData): Promise<any> {
        const nextShow = this.calculateNextShow(data);

        console.log('Creating smart notification:', data);
        return {
            id: Date.now(),
            title: data.title,
            message: data.message,
            type: data.type,
            frequency: data.frequency || 'ONCE',
            showTime: data.showTime,
            weekdays: data.weekdays?.join(','),
            monthDay: data.monthDay,
            priority: data.priority || 1,
            category: data.category,
            tags: data.tags?.join(','),
            maxShows: data.maxShows,
            nextShow,
            isActive: true,
            read: false,
            showCount: 0,
            createdAt: new Date()
        };
    }

    // Atualizar notificação
    async updateSmartNotification(id: number, data: UpdateSmartNotificationData): Promise<any> {
        console.log(`Updating smart notification ${id}:`, data);
        return { id, ...data };
    }

    // Buscar notificações que devem ser mostradas agora
    async getNotificationsToShow(): Promise<Notification[]> {
        console.log('Getting notifications to show');
        return [];
    }

    // Marcar notificação como mostrada
    async markAsShown(id: number): Promise<any> {
        console.log(`Marking notification ${id} as shown`);
        return { id, shown: true };
    }

    // Marcar como lida
    async markAsRead(id: number): Promise<any> {
        console.log(`Marking notification ${id} as read`);
        return { id, read: true };
    }

    // Buscar notificações por categoria
    async getNotificationsByCategory(category: string): Promise<Notification[]> {
        console.log(`Getting notifications by category: ${category}`);
        return [];
    }

    // Buscar notificações por tags
    async getNotificationsByTag(tag: string): Promise<Notification[]> {
        console.log(`Getting notifications by tag: ${tag}`);
        return [];
    }

    // Buscar notificações não lidas
    async getUnreadNotifications(): Promise<Notification[]> {
        console.log('Getting unread notifications');
        return [];
    }

    // Estatísticas das notificações
    async getNotificationStats() {
        console.log('Getting notification stats');
        return {
            total: 0,
            active: 0,
            unread: 0,
            byType: {},
            byFrequency: {},
            byPriority: {}
        };
    }

    // Calcular próxima exibição
    private calculateNextShow(data: {
        frequency?: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
        showTime?: string;
        weekdays?: number[];
        monthDay?: number;
    }): Date | null {
        if (!data.frequency || data.frequency === 'ONCE') {
            return new Date(); // Mostrar imediatamente
        }

        const now = new Date();
        let nextShow = new Date(now);

        // Definir horário se especificado
        if (data.showTime) {
            const [hours, minutes] = data.showTime.split(':').map(Number);
            nextShow.setHours(hours, minutes, 0, 0);
        }

        switch (data.frequency) {
            case 'DAILY':
                // Se já passou da hora hoje, agendar para amanhã
                if (data.showTime && nextShow <= now) {
                    nextShow.setDate(nextShow.getDate() + 1);
                }

                // Se tem dias da semana específicos
                if (data.weekdays && data.weekdays.length > 0) {
                    while (!data.weekdays.includes(nextShow.getDay())) {
                        nextShow.setDate(nextShow.getDate() + 1);
                    }
                }
                break;

            case 'WEEKLY':
                nextShow.setDate(nextShow.getDate() + 7);
                break;

            case 'MONTHLY':
                if (data.monthDay) {
                    nextShow.setDate(data.monthDay);
                    // Se já passou este mês, ir para o próximo
                    if (nextShow <= now) {
                        nextShow.setMonth(nextShow.getMonth() + 1);
                    }
                } else {
                    nextShow.setMonth(nextShow.getMonth() + 1);
                }
                break;
        }

        return nextShow;
    }

    // Processar notificações pendentes (chamar periodicamente)
    async processNotifications(): Promise<Notification[]> {
        console.log('Processing notifications');
        return [];
    }

    // Limpar notificações antigas e inativas
    async cleanupNotifications(daysOld: number = 30): Promise<number> {
        console.log(`Cleaning up notifications older than ${daysOld} days`);
        return 0;
    }
}

export const smartNotificationService = new SmartNotificationService();