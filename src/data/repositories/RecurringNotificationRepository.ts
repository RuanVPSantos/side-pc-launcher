import { db } from '../database';
import { RecurringNotificationTemplate } from '../models/types';
import { toMySQLDateTime } from '../utils/dateUtils';

export class RecurringNotificationRepository {
    static async create(template: Omit<RecurringNotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
        // Convert nextExecution to MySQL datetime format
        const nextExecutionFormatted = toMySQLDateTime(template.nextExecution);

        return await db.query(`
            INSERT INTO recurring_notification_templates (
                title, message, type, frequency, isActive, isPaused,
                showTime, weekdays, monthDay, lastExecuted, nextExecution,
                executionCount, maxExecutions, priority, category, tags
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            template.title,
            template.message,
            template.type,
            template.frequency,
            template.isActive,
            template.isPaused,
            template.showTime,
            template.weekdays || null,
            template.monthDay || null,
            template.lastExecuted || null,
            nextExecutionFormatted,
            template.executionCount,
            template.maxExecutions || null,
            template.priority,
            template.category || null,
            template.tags || null
        ]);
    }

    static async getAll(): Promise<RecurringNotificationTemplate[]> {
        return await db.query('SELECT * FROM recurring_notification_templates ORDER BY createdAt DESC');
    }

    static async getActive(): Promise<RecurringNotificationTemplate[]> {
        return await db.query(
            'SELECT * FROM recurring_notification_templates WHERE isActive = TRUE AND isPaused = FALSE ORDER BY nextExecution ASC'
        );
    }

    static async updateStatus(id: number, isActive: boolean, isPaused: boolean) {
        return await db.query(
            'UPDATE recurring_notification_templates SET isActive = ?, isPaused = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [isActive, isPaused, id]
        );
    }

    static async update(id: number, data: Partial<RecurringNotificationTemplate>) {
        const fields = [];
        const values = [];

        // Build dynamic update query
        if (data.title !== undefined) {
            fields.push('title = ?');
            values.push(data.title);
        }
        if (data.message !== undefined) {
            fields.push('message = ?');
            values.push(data.message);
        }
        if (data.type !== undefined) {
            fields.push('type = ?');
            values.push(data.type);
        }
        if (data.frequency !== undefined) {
            fields.push('frequency = ?');
            values.push(data.frequency);
        }
        if (data.showTime !== undefined) {
            fields.push('showTime = ?');
            values.push(data.showTime);
        }
        if (data.weekdays !== undefined) {
            fields.push('weekdays = ?');
            values.push(data.weekdays);
        }
        if (data.monthDay !== undefined) {
            fields.push('monthDay = ?');
            values.push(data.monthDay);
        }
        if (data.priority !== undefined) {
            fields.push('priority = ?');
            values.push(data.priority);
        }
        if (data.category !== undefined) {
            fields.push('category = ?');
            values.push(data.category);
        }
        if (data.tags !== undefined) {
            fields.push('tags = ?');
            values.push(data.tags);
        }
        if (data.maxExecutions !== undefined) {
            fields.push('maxExecutions = ?');
            values.push(data.maxExecutions);
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        fields.push('updatedAt = CURRENT_TIMESTAMP');
        values.push(id);

        return await db.query(
            `UPDATE recurring_notification_templates SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
    }

    static async delete(id: number) {
        return await db.query('DELETE FROM recurring_notification_templates WHERE id = ?', [id]);
    }

    static async getReadyForExecution(): Promise<RecurringNotificationTemplate[]> {
        return await db.query(`
            SELECT * FROM recurring_notification_templates 
            WHERE isActive = TRUE 
            AND isPaused = FALSE 
            AND nextExecution <= NOW()
            AND (maxExecutions IS NULL OR executionCount < maxExecutions)
            ORDER BY nextExecution ASC
        `);
    }

    static async updateLastExecution(id: number, nextExecution: Date) {
        // Convert nextExecution to MySQL datetime format
        const nextExecutionFormatted = toMySQLDateTime(nextExecution);

        return await db.query(
            'UPDATE recurring_notification_templates SET lastExecuted = NOW(), nextExecution = ?, executionCount = executionCount + 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [nextExecutionFormatted, id]
        );
    }

    static async getById(id: number): Promise<RecurringNotificationTemplate | null> {
        return await db.queryOne('SELECT * FROM recurring_notification_templates WHERE id = ?', [id]);
    }
}