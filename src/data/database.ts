console.log('🔧 Inicializando serviço de banco MySQL...');

import mysql from 'mysql2/promise';

// Configuração do banco
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'futureshade',
    database: process.env.DB_NAME || 'launcher',
    charset: 'utf8mb4'
};

// Classe principal do serviço de banco
class DatabaseService {
    private static connection: mysql.Connection | null = null;
    private static isInitialized = false;

    public static async getConnection(): Promise<mysql.Connection> {
        if (!DatabaseService.connection) {
            console.log('🔌 Conectando ao banco MySQL...');
            try {
                DatabaseService.connection = await mysql.createConnection(dbConfig);
                console.log('✅ MySQL connected successfully');
            } catch (error) {
                console.error('❌ Failed to connect to MySQL:', error);
                throw error;
            }
        }
        return DatabaseService.connection;
    }

    public static async initialize(): Promise<void> {
        if (!DatabaseService.isInitialized) {
            try {
                await DatabaseService.getConnection();
                await DatabaseService.createTables();
                DatabaseService.isInitialized = true;
                console.log('✅ Database initialized successfully');
            } catch (error) {
                console.error('❌ Database initialization failed:', error);
                throw error;
            }
        }
    }

    private static async createTables(): Promise<void> {
        // Run database migrations to ensure schema is up to date
        try {
            const { MigrationService } = await import('./migrations/MigrationService');
            await MigrationService.runPendingMigrations();
            console.log('✅ Database schema is up to date');
        } catch (error) {
            console.error('❌ Failed to run database migrations:', error);
            throw error;
        }
    }

    public static async disconnect(): Promise<void> {
        if (DatabaseService.connection) {
            try {
                await DatabaseService.connection.end();
                DatabaseService.connection = null;
                DatabaseService.isInitialized = false;
                console.log('🔌 MySQL disconnected');
            } catch (error) {
                console.error('❌ Erro ao desconectar:', error);
            }
        }
    }

    // Métodos de conveniência para queries
    public static async query(sql: string, params: any[] = []): Promise<any> {
        const connection = await DatabaseService.getConnection();
        const [rows] = await connection.execute(sql, params);
        return rows;
    }

    public static async queryOne(sql: string, params: any[] = []): Promise<any> {
        const rows = await DatabaseService.query(sql, params);
        return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    }

    // Métodos específicos para projetos (usando estrutura real do banco)
    public static async getAllProjects(): Promise<any[]> {
        const projects = await DatabaseService.query('SELECT * FROM projects ORDER BY updatedAt DESC');

        // Para cada projeto, buscar suas tecnologias
        for (const project of projects) {
            const technologies = await DatabaseService.query(`
                SELECT t.name, t.id 
                FROM technologies t 
                INNER JOIN project_technologies pt ON t.id = pt.technologyId 
                WHERE pt.projectId = ?
            `, [project.id]);

            // Formatar para manter compatibilidade com o formato do Prisma
            project.technologies = technologies.map((tech: any) => ({
                technology: { name: tech.name, id: tech.id }
            }));
        }

        return projects;
    }

    public static async createProject(name: string, description?: string): Promise<any> {
        const result = await DatabaseService.query(
            'INSERT INTO projects (name, description, status) VALUES (?, ?, ?)',
            [name, description || '', 'active']
        );
        return result;
    }

    // Métodos específicos para notificações
    public static async getAllNotifications(): Promise<any[]> {
        return await DatabaseService.query('SELECT * FROM notifications ORDER BY createdAt DESC');
    }

    public static async createNotification(title: string, message?: string, projectId?: number): Promise<any> {
        const result = await DatabaseService.query(
            'INSERT INTO notifications (title, message, type) VALUES (?, ?, ?)',
            [title, message || '', 'info']
        );
        return result;
    }

    // Métodos específicos para focus dates
    public static async getAllFocusDates(): Promise<any[]> {
        return await DatabaseService.query('SELECT * FROM date_focus ORDER BY startDate DESC');
    }

    public static async createFocusDate(date: string, description?: string, projectId?: number): Promise<any> {
        const result = await DatabaseService.query(
            'INSERT INTO date_focus (startDate, endDate, projectId) VALUES (?, ?, ?)',
            [date, date, projectId || null]
        );
        return result;
    }
}

// Exportar instância
export const getDb = () => DatabaseService;
export const db = DatabaseService;
export default DatabaseService;