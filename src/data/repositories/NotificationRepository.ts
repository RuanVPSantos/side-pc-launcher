import { db } from '../database';

export class NotificationRepository {
    static async getAll() {
        return await db.query('SELECT * FROM notifications ORDER BY createdAt DESC');
    }

    static async getToShow() {
        return await db.query(
            'SELECT * FROM notifications WHERE isActive = TRUE AND isPaused = FALSE AND `read` = FALSE AND (nextShow IS NULL OR nextShow <= NOW()) LIMIT 5'
        );
    }

    static async create(data: any) {
        return await db.query(`
            INSERT INTO notifications (
                title, message, type, frequency, isActive, isPaused,
                showTime, weekdays, monthDay, priority, 
                category, tags, maxShows, nextShow,
                sourceType, sourceId, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3))
        `, [
            data.title,
            data.message,
            data.type || 'info',
            data.frequency || 'ONCE',
            data.isActive !== undefined ? data.isActive : true,
            data.isPaused || false,
            data.showTime || null,
            data.weekdays ? (Array.isArray(data.weekdays) ? data.weekdays.join(',') : data.weekdays) : null,
            data.monthDay || null,
            data.priority || 1,
            data.category || null,
            data.tags ? (Array.isArray(data.tags) ? data.tags.join(',') : data.tags) : null,
            data.maxShows || null,
            data.nextShow || null,
            data.sourceType || 'manual',
            data.sourceId || null
        ]);
    }

    static async markAsRead(id: number) {
        return await db.query(
            'UPDATE notifications SET `read` = TRUE, readAt = CURRENT_TIMESTAMP(3) WHERE id = ?',
            [id]
        );
    }

    static async markAsUnread(id: number) {
        return await db.query(
            'UPDATE notifications SET `read` = FALSE, readAt = NULL WHERE id = ?',
            [id]
        );
    }

    static async markAllAsRead() {
        return await db.query('UPDATE notifications SET `read` = TRUE, readAt = CURRENT_TIMESTAMP(3)');
    }

    static async clearAll() {
        return await db.query('DELETE FROM notifications');
    }

    // NEW: Enhanced methods for recurring notifications and event integration
    static async getBySourceEvent(eventId: number) {
        return await db.query(
            'SELECT * FROM notifications WHERE sourceType IN (?, ?) AND sourceId = ? ORDER BY createdAt DESC',
            ['event_start', 'event_end', eventId]
        );
    }

    static async updateRecurringStatus(id: number, isPaused: boolean) {
        return await db.query(
            'UPDATE notifications SET isPaused = ?, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = ?',
            [isPaused, id]
        );
    }

    static async getRecurringNotifications() {
        return await db.query(
            'SELECT * FROM notifications WHERE frequency != ? ORDER BY createdAt DESC',
            ['ONCE']
        );
    }

    static async deleteRecurringNotification(id: number) {
        return await db.query('DELETE FROM notifications WHERE id = ?', [id]);
    }

    static async getNotificationHistory(templateId: number) {
        return await db.query(
            'SELECT * FROM notifications WHERE sourceType = ? AND sourceId = ? ORDER BY createdAt DESC',
            ['template', templateId]
        );
    }
}