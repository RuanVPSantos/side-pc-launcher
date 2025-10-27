import { db } from '../database';

export class FocusDateRepository {
    static async getAll() {
        return await db.query('SELECT * FROM date_focus ORDER BY startDate DESC');
    }

    static async create(date: string, description?: string, projectId?: number) {
        return await db.query(
            'INSERT INTO date_focus (startDate, endDate, projectId) VALUES (?, ?, ?)',
            [date, date, projectId || null]
        );
    }

    static async update(id: number, data: any) {
        return await db.query(
            'UPDATE date_focus SET startDate = ?, endDate = ?, projectId = ? WHERE id = ?',
            [
                data.startDate || null,
                data.endDate || null,
                data.projectId || null,
                id
            ]
        );
    }

    static async delete(id: number) {
        return await db.query('DELETE FROM date_focus WHERE id = ?', [id]);
    }
}