import { db } from '../database';

export class MigrationService {
    private static readonly MIGRATIONS_TABLE = 'schema_migrations';

    /**
     * Initialize the migrations system by creating the migrations tracking table
     */
    static async initialize(): Promise<void> {
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS ${this.MIGRATIONS_TABLE} (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    migration_name VARCHAR(255) NOT NULL UNIQUE,
                    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_migration_name (migration_name)
                )
            `);
            console.log('✅ Migration system initialized');
        } catch (error) {
            console.error('❌ Failed to initialize migration system:', error);
            throw error;
        }
    }

    /**
     * Check if a migration has already been executed
     */
    static async isMigrationExecuted(migrationName: string): Promise<boolean> {
        try {
            const result = await db.queryOne(
                `SELECT id FROM ${this.MIGRATIONS_TABLE} WHERE migration_name = ?`,
                [migrationName]
            );
            return result !== null;
        } catch (error) {
            console.error(`❌ Failed to check migration status for ${migrationName}:`, error);
            throw error;
        }
    }

    /**
     * Mark a migration as executed
     */
    static async markMigrationExecuted(migrationName: string): Promise<void> {
        try {
            await db.query(
                `INSERT INTO ${this.MIGRATIONS_TABLE} (migration_name) VALUES (?)`,
                [migrationName]
            );
            console.log(`✅ Migration ${migrationName} marked as executed`);
        } catch (error) {
            console.error(`❌ Failed to mark migration ${migrationName} as executed:`, error);
            throw error;
        }
    }

    /**
     * Execute a migration from SQL content
     */
    static async executeMigrationFromSQL(migrationName: string, sqlContent: string): Promise<void> {
        // Check if migration was already executed
        if (await this.isMigrationExecuted(migrationName)) {
            console.log(`⏭️ Migration ${migrationName} already executed, skipping`);
            return;
        }

        try {
            console.log(`🔄 Executing migration: ${migrationName}`);

            // Split by semicolon and execute each statement
            const statements = sqlContent
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

            // Execute each statement
            for (const statement of statements) {
                if (statement.trim()) {
                    await db.query(statement);
                }
            }

            // Mark as executed
            await this.markMigrationExecuted(migrationName);
            console.log(`✅ Migration ${migrationName} executed successfully`);

        } catch (error) {
            console.error(`❌ Failed to execute migration ${migrationName}:`, error);
            throw error;
        }
    }

    /**
     * Execute all embedded migrations
     */
    static async executeEmbeddedMigrations(): Promise<void> {
        // Create base tables first
        await this.executeSingleMigration('000_create_projects_table', `
            CREATE TABLE IF NOT EXISTS projects (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                status ENUM('active', 'completed', 'paused') DEFAULT 'active',
                progress INT DEFAULT 0,
                githubUrl VARCHAR(255),
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_createdAt (createdAt)
            )
        `);

        await this.executeSingleMigration('000_create_technologies_table', `
            CREATE TABLE IF NOT EXISTS technologies (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL UNIQUE,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await this.executeSingleMigration('000_create_project_technologies_table', `
            CREATE TABLE IF NOT EXISTS project_technologies (
                id INT PRIMARY KEY AUTO_INCREMENT,
                projectId INT NOT NULL,
                technologyId INT NOT NULL,
                FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
                FOREIGN KEY (technologyId) REFERENCES technologies(id) ON DELETE CASCADE,
                UNIQUE KEY unique_project_tech (projectId, technologyId),
                INDEX idx_project (projectId),
                INDEX idx_technology (technologyId)
            )
        `);

        await this.executeSingleMigration('000_create_notifications_table', `
            CREATE TABLE IF NOT EXISTS notifications (
                id INT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(255) NOT NULL,
                message TEXT,
                type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
                frequency ENUM('ONCE', 'DAILY', 'WEEKLY', 'MONTHLY') DEFAULT 'ONCE',
                isActive BOOLEAN DEFAULT TRUE,
                \`read\` BOOLEAN DEFAULT FALSE,
                readAt DATETIME NULL,
                nextShow DATETIME NULL,
                showCount INT DEFAULT 0,
                maxShows INT NULL,
                showTime TIME NULL,
                weekdays VARCHAR(20) NULL,
                monthDay INT NULL,
                priority INT DEFAULT 1,
                category VARCHAR(100) NULL,
                tags TEXT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_active (isActive),
                INDEX idx_read (\`read\`),
                INDEX idx_nextShow (nextShow)
            )
        `);

        await this.executeSingleMigration('000_create_date_focus_table', `
            CREATE TABLE IF NOT EXISTS date_focus (
                id INT PRIMARY KEY AUTO_INCREMENT,
                startDate DATETIME NOT NULL,
                endDate DATETIME NOT NULL,
                projectId INT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL,
                INDEX idx_projectId (projectId),
                INDEX idx_startDate (startDate)
            )
        `);

        // Execute migrations step by step with error handling
        await this.executeSingleMigration('001_extend_notifications_table', `
            ALTER TABLE notifications 
            ADD COLUMN isPaused BOOLEAN DEFAULT FALSE AFTER isActive
        `);

        await this.executeSingleMigration('001_add_source_columns', `
            ALTER TABLE notifications 
            ADD COLUMN sourceType ENUM('manual', 'event_start', 'event_end', 'template') DEFAULT 'manual' AFTER tags,
            ADD COLUMN sourceId INT NULL AFTER sourceType
        `);

        await this.executeSingleMigration('001_add_notification_indexes', `
            ALTER TABLE notifications 
            ADD INDEX idx_source (sourceType, sourceId),
            ADD INDEX idx_recurring (frequency, isActive, isPaused)
        `);

        await this.executeSingleMigration('001_create_recurring_templates', `
            CREATE TABLE IF NOT EXISTS recurring_notification_templates (
                id INT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
                frequency ENUM('DAILY', 'WEEKLY', 'MONTHLY') NOT NULL,
                isActive BOOLEAN DEFAULT TRUE,
                isPaused BOOLEAN DEFAULT FALSE,
                showTime TIME NOT NULL,
                weekdays VARCHAR(20) NULL,
                monthDay INT NULL,
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
                INDEX idx_frequency (frequency, isActive),
                INDEX idx_category (category),
                INDEX idx_priority (priority)
            )
        `);

        await this.executeSingleMigration('001_create_event_reminders', `
            CREATE TABLE IF NOT EXISTS event_reminders (
                id INT PRIMARY KEY AUTO_INCREMENT,
                eventId INT NOT NULL,
                eventName VARCHAR(255) NOT NULL,
                reminderType ENUM('start', 'end') NOT NULL,
                triggerDate DATETIME NOT NULL,
                notificationId INT NULL,
                isProcessed BOOLEAN DEFAULT FALSE,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (notificationId) REFERENCES notifications(id) ON DELETE SET NULL,
                INDEX idx_processing (isProcessed, triggerDate),
                INDEX idx_event (eventId),
                INDEX idx_trigger_date (triggerDate),
                UNIQUE KEY unique_event_reminder (eventId, reminderType)
            )
        `);

        await this.executeSingleMigration('001_update_source_type_enum', `
            ALTER TABLE notifications 
            MODIFY COLUMN sourceType ENUM('manual', 'event_start', 'event_end', 'template') DEFAULT 'manual'
        `);

        await this.executeSingleMigration('002_create_project_tables', `
            CREATE TABLE IF NOT EXISTS project_comments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                projectId INT NOT NULL,
                content TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_project (projectId)
            )
        `);

        await this.executeSingleMigration('002_create_project_links', `
            CREATE TABLE IF NOT EXISTS project_links (
                id INT PRIMARY KEY AUTO_INCREMENT,
                projectId INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                url TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_project (projectId)
            )
        `);

        await this.executeSingleMigration('002_create_project_folders', `
            CREATE TABLE IF NOT EXISTS project_folders (
                id INT PRIMARY KEY AUTO_INCREMENT,
                projectId INT NOT NULL,
                name VARCHAR(255) DEFAULT 'Pasta',
                path TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_project (projectId)
            )
        `);

        // Fix updatedAt field issues for existing tables
        await this.executeSingleMigration('002_fix_project_tables_updatedAt', `
            ALTER TABLE project_comments 
            ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        `);

        await this.executeSingleMigration('002_fix_project_links_updatedAt', `
            ALTER TABLE project_links 
            ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        `);

        await this.executeSingleMigration('002_fix_project_folders_updatedAt', `
            ALTER TABLE project_folders 
            ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        `);

        await this.executeSingleMigration('003_add_project_folders_name', `
            ALTER TABLE project_folders 
            ADD COLUMN name VARCHAR(255) DEFAULT 'Pasta' AFTER projectId
        `);

        // Ensure projects table has proper defaults for createdAt and updatedAt
        await this.executeSingleMigration('003_fix_projects_timestamps', `
            ALTER TABLE projects 
            MODIFY COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            MODIFY COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        `);

        // Fix event_reminders updatedAt if it doesn't exist
        await this.executeSingleMigration('003_fix_event_reminders_updatedAt', `
            ALTER TABLE event_reminders 
            ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        `);

        // Increase project description field size to support larger text
        await this.executeSingleMigration('004_increase_description_size', `
            ALTER TABLE projects 
            MODIFY COLUMN description LONGTEXT
        `);

        // Ensure notifications table has updatedAt with proper default
        await this.executeSingleMigration('004_fix_notifications_updatedAt', `
            ALTER TABLE notifications 
            MODIFY COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        `);

    }

    /**
     * Execute a single migration step with error handling
     */
    static async executeSingleMigration(migrationName: string, sql: string): Promise<void> {
        if (await this.isMigrationExecuted(migrationName)) {
            console.log(`⏭️ Migration ${migrationName} already executed, skipping`);
            return;
        }

        try {
            console.log(`🔄 Executing migration step: ${migrationName}`);
            await db.query(sql);
            await this.markMigrationExecuted(migrationName);
            console.log(`✅ Migration step ${migrationName} completed`);
        } catch (error: any) {
            // Handle acceptable errors
            if (error.code === 'ER_DUP_FIELDNAME' ||
                error.code === 'ER_CANT_DROP_FIELD_OR_KEY' ||
                error.code === 'ER_TABLE_EXISTS_ERROR' ||
                error.code === 'ER_DUP_KEYNAME' ||
                error.code === 'ER_DUP_COLUMN_NAME') {
                console.log(`⚠️ Migration step ${migrationName} already applied, marking as executed`);
                await this.markMigrationExecuted(migrationName);
            } else {
                console.error(`❌ Failed to execute migration step ${migrationName}:`, error);
                throw error;
            }
        }
    }

    /**
     * Run all pending migrations
     */
    static async runPendingMigrations(): Promise<void> {
        try {
            await this.initialize();
            await this.executeEmbeddedMigrations();
            console.log('✅ All migrations completed successfully');
        } catch (error) {
            console.error('❌ Migration process failed:', error);
            throw error;
        }
    }

    /**
     * Get list of executed migrations
     */
    static async getExecutedMigrations(): Promise<string[]> {
        try {
            const results = await db.query(
                `SELECT migration_name FROM ${this.MIGRATIONS_TABLE} ORDER BY executed_at`
            );
            return results.map((row: any) => row.migration_name);
        } catch (error) {
            console.error('❌ Failed to get executed migrations:', error);
            throw error;
        }
    }
}