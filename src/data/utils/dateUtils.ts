/**
 * Utility functions for date handling in MySQL database operations
 */

/**
 * Converts a Date object or ISO string to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
 * @param date - Date object, ISO string, or null/undefined
 * @returns MySQL formatted datetime string or null
 */
export function toMySQLDateTime(date: Date | string | null | undefined): string | null {
    if (!date) return null;

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            console.warn('Invalid date provided to toMySQLDateTime:', date);
            return null;
        }

        // Convert to MySQL format: YYYY-MM-DD HH:MM:SS
        return dateObj.toISOString().slice(0, 19).replace('T', ' ');
    } catch (error) {
        console.error('Error converting date to MySQL format:', error);
        return null;
    }
}

/**
 * Converts a MySQL datetime string to JavaScript Date object
 * @param mysqlDateTime - MySQL datetime string (YYYY-MM-DD HH:MM:SS)
 * @returns Date object or null
 */
export function fromMySQLDateTime(mysqlDateTime: string | null | undefined): Date | null {
    if (!mysqlDateTime) return null;

    try {
        // MySQL datetime format: YYYY-MM-DD HH:MM:SS
        // Convert to ISO format for JavaScript Date constructor
        const isoString = mysqlDateTime.replace(' ', 'T') + 'Z';
        const date = new Date(isoString);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn('Invalid MySQL datetime provided:', mysqlDateTime);
            return null;
        }

        return date;
    } catch (error) {
        console.error('Error converting MySQL datetime to Date:', error);
        return null;
    }
}

/**
 * Gets current timestamp in MySQL datetime format
 * @returns Current timestamp as MySQL datetime string
 */
export function getCurrentMySQLDateTime(): string {
    return toMySQLDateTime(new Date()) || '';
}

/**
 * Adds time to a date and returns MySQL datetime format
 * @param date - Base date
 * @param amount - Amount to add
 * @param unit - Unit of time ('minutes', 'hours', 'days', 'weeks', 'months')
 * @returns MySQL formatted datetime string
 */
export function addTimeToMySQLDateTime(
    date: Date | string,
    amount: number,
    unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months'
): string | null {
    try {
        const baseDate = typeof date === 'string' ? new Date(date) : new Date(date);

        if (isNaN(baseDate.getTime())) {
            return null;
        }

        switch (unit) {
            case 'minutes':
                baseDate.setMinutes(baseDate.getMinutes() + amount);
                break;
            case 'hours':
                baseDate.setHours(baseDate.getHours() + amount);
                break;
            case 'days':
                baseDate.setDate(baseDate.getDate() + amount);
                break;
            case 'weeks':
                baseDate.setDate(baseDate.getDate() + (amount * 7));
                break;
            case 'months':
                baseDate.setMonth(baseDate.getMonth() + amount);
                break;
            default:
                throw new Error(`Unsupported time unit: ${unit}`);
        }

        return toMySQLDateTime(baseDate);
    } catch (error) {
        console.error('Error adding time to date:', error);
        return null;
    }
}