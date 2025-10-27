import { db } from '../database';
import { EventReminder } from '../models/types';
import { toMySQLDateTime } from '../utils/dateUtils';

export class EventReminderRepository {
    static async createForEvent(eventId: number, eventName: string, startDate: Date, endDate: Date) {
        const reminders = [];

        // Create start reminder (24 hours before start date)
        if (startDate) {
            const startTrigger = new Date(startDate);
            startTrigger.setHours(startTrigger.getHours() - 24);

            // Only create if trigger date is in the future
            if (startTrigger > new Date()) {
                const startTriggerFormatted = toMySQLDateTime(startTrigger);
                const startResult = await db.query(`
                    INSERT INTO event_reminders (eventId, eventName, reminderType, triggerDate)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                    eventName = VALUES(eventName),
                    triggerDate = VALUES(triggerDate),
                    isProcessed = FALSE
                `, [eventId, eventName, 'start', startTriggerFormatted]);
                reminders.push(startResult);
            }
        }

        // Create end reminder (on the end date)
        if (endDate) {
            const endTrigger = new Date(endDate);
            endTrigger.setHours(9, 0, 0, 0); // Set to 9 AM on the end date

            // Only create if trigger date is in the future
            if (endTrigger > new Date()) {
                const endTriggerFormatted = toMySQLDateTime(endTrigger);
                const endResult = await db.query(`
                    INSERT INTO event_reminders (eventId, eventName, reminderType, triggerDate)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                    eventName = VALUES(eventName),
                    triggerDate = VALUES(triggerDate),
                    isProcessed = FALSE
                `, [eventId, eventName, 'end', endTriggerFormatted]);
                reminders.push(endResult);
            }
        }

        return reminders;
    }

    static async getUnprocessed(): Promise<EventReminder[]> {
        return await db.query(`
            SELECT * FROM event_reminders 
            WHERE isProcessed = FALSE 
            AND triggerDate <= NOW()
            ORDER BY triggerDate ASC
        `);
    }

    static async markAsProcessed(id: number, notificationId: number) {
        return await db.query(
            'UPDATE event_reminders SET isProcessed = TRUE, notificationId = ? WHERE id = ?',
            [notificationId, id]
        );
    }

    static async deleteByEvent(eventId: number) {
        return await db.query('DELETE FROM event_reminders WHERE eventId = ?', [eventId]);
    }

    static async updateEventReminders(eventId: number, eventName: string, startDate: Date, endDate: Date) {
        // Delete existing reminders for this event
        await this.deleteByEvent(eventId);

        // Create new reminders with updated information
        return await this.createForEvent(eventId, eventName, startDate, endDate);
    }

    static async getByEvent(eventId: number): Promise<EventReminder[]> {
        return await db.query(
            'SELECT * FROM event_reminders WHERE eventId = ? ORDER BY triggerDate ASC',
            [eventId]
        );
    }

    static async getAll(): Promise<EventReminder[]> {
        return await db.query('SELECT * FROM event_reminders ORDER BY triggerDate DESC');
    }

    static async getPending(): Promise<EventReminder[]> {
        return await db.query(`
            SELECT * FROM event_reminders 
            WHERE isProcessed = FALSE 
            AND triggerDate > NOW()
            ORDER BY triggerDate ASC
        `);
    }

    static async cleanupProcessed(olderThanDays: number = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        return await db.query(
            'DELETE FROM event_reminders WHERE isProcessed = TRUE AND createdAt < ?',
            [cutoffDate]
        );
    }
}