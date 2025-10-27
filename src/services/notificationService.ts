import { NotificationRepository } from '../data/repositories/NotificationRepository';
import type { Notification } from '../data/models/types';

export interface CreateNotificationData {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
}

export interface UpdateNotificationData {
    title?: string;
    message?: string;
    type?: 'info' | 'warning' | 'error' | 'success';
    read?: boolean;
}

class NotificationService {
    // Buscar todas as notificações
    async getAllNotifications(): Promise<Notification[]> {
        return await NotificationRepository.getAll();
    }

    // Buscar notificações não lidas
    async getUnreadNotifications(): Promise<Notification[]> {
        const all = await NotificationRepository.getAll();
        return all.filter((n: Notification) => !n.read);
    }

    // Buscar notificação por ID
    async getNotificationById(id: number): Promise<Notification | null> {
        const all = await NotificationRepository.getAll();
        return all.find((n: any) => n.id === id) || null;
    }

    // Criar nova notificação
    async createNotification(data: CreateNotificationData): Promise<any> {
        return await NotificationRepository.create(data);
    }

    // Atualizar notificação
    async updateNotification(id: number, data: UpdateNotificationData): Promise<any> {
        console.log(`Updating notification ${id}:`, data);
        return { id, ...data };
    }

    // Marcar notificação como lida
    async markAsRead(id: number): Promise<any> {
        console.log(`Marking notification ${id} as read`);
        return { id, read: true };
    }

    // Marcar todas como lidas
    async markAllAsRead(): Promise<void> {
        console.log('Marking all notifications as read');
    }

    // Deletar notificação
    async deleteNotification(id: number): Promise<void> {
        console.log(`Deleting notification ${id}`);
    }

    // Limpar todas as notificações
    async clearAllNotifications(): Promise<void> {
        console.log('Clearing all notifications');
    }

    // Estatísticas das notificações
    async getNotificationStats() {
        const all = await this.getAllNotifications();
        const total = all.length;
        const unread = all.filter((n: Notification) => !n.read).length;

        const byType = all.reduce((acc: Record<string, number>, item: Notification) => {
            acc[item.type] = (acc[item.type] || 0) + 1;
            return acc;
        }, {});

        return {
            total,
            unread,
            byType
        };
    }

    // Limpar notificações antigas (mais de X dias)
    async cleanOldNotifications(daysOld: number = 30): Promise<number> {
        console.log(`Cleaning notifications older than ${daysOld} days`);
        return 0;
    }
}

export const notificationService = new NotificationService();