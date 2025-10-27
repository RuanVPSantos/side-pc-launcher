import { RecurringNotificationRepository } from '../data/repositories/RecurringNotificationRepository';
import { NotificationRepository } from '../data/repositories/NotificationRepository';
import { EventReminderRepository } from '../data/repositories/EventReminderRepository';
import { toMySQLDateTime, addTimeToMySQLDateTime } from '../data/utils/dateUtils';

export class NotificationScheduler {
    private static instance: NotificationScheduler;
    private intervalId: NodeJS.Timeout | null = null;
    private isRunning = false;

    private constructor() { }

    static getInstance(): NotificationScheduler {
        if (!NotificationScheduler.instance) {
            NotificationScheduler.instance = new NotificationScheduler();
        }
        return NotificationScheduler.instance;
    }

    /**
     * Start the notification scheduler
     * @param intervalMinutes - How often to check for notifications (default: 1 minute)
     */
    start(intervalMinutes: number = 1): void {
        if (this.isRunning) {
            console.log('📅 Notification scheduler is already running');
            return;
        }

        console.log(`📅 Starting notification scheduler (checking every ${intervalMinutes} minute(s))`);
        this.isRunning = true;

        // Run immediately
        this.processNotifications();

        // Set up interval
        this.intervalId = setInterval(() => {
            this.processNotifications();
        }, intervalMinutes * 60 * 1000);
    }

    /**
     * Stop the notification scheduler
     */
    stop(): void {
        if (!this.isRunning) {
            console.log('📅 Notification scheduler is not running');
            return;
        }

        console.log('📅 Stopping notification scheduler');
        this.isRunning = false;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Process all pending notifications
     */
    private async processNotifications(): Promise<void> {
        try {
            // Process recurring notification templates
            const processedTemplates = await this.processRecurringNotifications();

            // Process event reminders
            const processedReminders = await this.processEventReminders();

            // Only log if something was processed
            if (processedTemplates > 0 || processedReminders > 0) {
                console.log(`✅ Notification processing completed (${processedTemplates} templates, ${processedReminders} reminders)`);
            }
        } catch (error) {
            console.error('❌ Error processing notifications:', error);
        }
    }

    /**
     * Process recurring notification templates
     */
    private async processRecurringNotifications(): Promise<number> {
        try {
            // Get templates ready for execution
            const readyTemplates = await RecurringNotificationRepository.getReadyForExecution();
            if (readyTemplates.length > 0) {
                console.log(`📋 Found ${readyTemplates.length} recurring templates ready for execution`);
            }

            for (const template of readyTemplates) {
                try {
                    console.log(`🔄 Processing template: ${template.title}`);

                    // Create notification from template
                    await NotificationRepository.create({
                        title: template.title,
                        message: template.message,
                        type: template.type,
                        frequency: 'ONCE', // Individual notifications are always ONCE
                        isActive: true,
                        isPaused: false,
                        priority: template.priority,
                        category: template.category,
                        tags: template.tags,
                        sourceType: 'template',
                        sourceId: template.id
                    });

                    // Calculate next execution time
                    const nextExecution = this.calculateNextExecution(template);

                    if (nextExecution) {
                        // Update template with next execution time
                        await RecurringNotificationRepository.updateLastExecution(template.id, nextExecution);
                        console.log(`✅ Template "${template.title}" executed, next execution: ${nextExecution.toLocaleString()}`);
                    } else {
                        // Template has reached max executions or other limit
                        await RecurringNotificationRepository.updateStatus(template.id, false, false);
                        console.log(`🔚 Template "${template.title}" completed (max executions reached)`);
                    }

                } catch (templateError) {
                    console.error(`❌ Error processing template ${template.id}:`, templateError);
                }
            }
            return readyTemplates.length;
        } catch (error) {
            console.error('❌ Error processing recurring notifications:', error);
            return 0;
        }
    }

    /**
     * Process event reminders
     */
    private async processEventReminders(): Promise<number> {
        try {
            // Get unprocessed event reminders
            const unprocessedReminders = await EventReminderRepository.getUnprocessed();
            if (unprocessedReminders.length > 0) {
                console.log(`📋 Found ${unprocessedReminders.length} event reminders to process`);
            }

            for (const reminder of unprocessedReminders) {
                try {
                    console.log(`🔔 Processing event reminder: ${reminder.eventName} (${reminder.reminderType})`);

                    // Create notification for event reminder
                    const notificationResult = await NotificationRepository.create({
                        title: `Lembrete: ${reminder.eventName}`,
                        message: reminder.reminderType === 'start'
                            ? `O evento "${reminder.eventName}" começará em breve!`
                            : `O evento "${reminder.eventName}" está terminando hoje.`,
                        type: 'info',
                        frequency: 'ONCE',
                        isActive: true,
                        isPaused: false,
                        priority: 2,
                        category: 'eventos',
                        sourceType: reminder.reminderType === 'start' ? 'event_start' : 'event_end',
                        sourceId: reminder.eventId
                    });

                    // Mark reminder as processed
                    await EventReminderRepository.markAsProcessed(reminder.id, notificationResult.insertId);
                    console.log(`✅ Event reminder processed: ${reminder.eventName}`);

                } catch (reminderError) {
                    console.error(`❌ Error processing event reminder ${reminder.id}:`, reminderError);
                }
            }
            return unprocessedReminders.length;
        } catch (error) {
            console.error('❌ Error processing event reminders:', error);
            return 0;
        }
    }

    /**
     * Calculate next execution time for a recurring template
     */
    private calculateNextExecution(template: any): Date | null {
        try {
            // Check if template has reached max executions
            if (template.maxExecutions && template.executionCount >= template.maxExecutions) {
                return null;
            }

            const now = new Date();
            const [hours, minutes] = template.showTime.split(':').map(Number);

            let nextExecution = new Date();
            nextExecution.setHours(hours, minutes, 0, 0);

            switch (template.frequency) {
                case 'DAILY':
                    // Add 1 day
                    nextExecution.setDate(nextExecution.getDate() + 1);

                    // If weekdays are specified, find next valid day
                    if (template.weekdays) {
                        const validDays = template.weekdays.split(',').map((d: string) => parseInt(d.trim()));
                        while (!validDays.includes(nextExecution.getDay())) {
                            nextExecution.setDate(nextExecution.getDate() + 1);
                        }
                    }
                    break;

                case 'WEEKLY':
                    // Add 7 days
                    nextExecution.setDate(nextExecution.getDate() + 7);

                    // If specific weekdays are set, adjust accordingly
                    if (template.weekdays) {
                        const validDays = template.weekdays.split(',').map((d: string) => parseInt(d.trim()));
                        const currentDay = nextExecution.getDay();
                        const nextValidDay = validDays.find((day: number) => day > currentDay) || validDays[0];

                        if (nextValidDay > currentDay) {
                            nextExecution.setDate(nextExecution.getDate() + (nextValidDay - currentDay));
                        } else {
                            nextExecution.setDate(nextExecution.getDate() + (7 - currentDay + nextValidDay));
                        }
                    }
                    break;

                case 'MONTHLY':
                    // Add 1 month
                    nextExecution.setMonth(nextExecution.getMonth() + 1);

                    // Set to specific day of month if specified
                    if (template.monthDay) {
                        nextExecution.setDate(template.monthDay);
                    }
                    break;

                default:
                    console.warn(`Unknown frequency: ${template.frequency}`);
                    return null;
            }

            return nextExecution;
        } catch (error) {
            console.error('Error calculating next execution:', error);
            return null;
        }
    }

    /**
     * Get scheduler status
     */
    getStatus(): { isRunning: boolean; hasInterval: boolean } {
        return {
            isRunning: this.isRunning,
            hasInterval: this.intervalId !== null
        };
    }

    /**
     * Force process notifications immediately (for testing)
     */
    async forceProcess(): Promise<void> {
        console.log('🔄 Force processing notifications...');
        await this.processNotifications();
    }
}