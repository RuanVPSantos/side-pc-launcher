// Database operations for main process
import { ipcMain, shell } from 'electron';
import { exec } from 'child_process';
import { ProjectRepository } from '../data/repositories/ProjectRepository';
import { NotificationRepository } from '../data/repositories/NotificationRepository';
import { FocusDateRepository } from '../data/repositories/FocusDateRepository';
import { db } from '../data/database';
import { NotificationScheduler } from '../services/notificationScheduler';

export function setupDatabaseIPC() {
    console.log('🔧 Configurando IPC para banco de dados MySQL...');
    console.log('📋 Registrando handlers IPC...');

    // Initialize database
    ipcMain.handle('db:initialize', async () => {
        try {
            console.log('🔄 Inicializando banco MySQL no main process...');
            await db.initialize();
            console.log('✅ Banco MySQL inicializado no main process!');
            return { success: true };
        } catch (error: any) {
            console.error('❌ Erro ao inicializar banco MySQL:', error);
            return { success: false, error: error.message };
        }
    });

    // Projects
    ipcMain.handle('db:projects:getAll', async () => {
        try {
            const projects = await ProjectRepository.getAll();
            return { success: true, data: projects };
        } catch (error: any) {
            console.error('❌ Erro ao buscar projetos:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:projects:create', async (_, data) => {
        try {
            console.log('📝 Criando projeto:', { name: data.name, description: data.description, progress: data.progress, technologies: data.technologies });
            const result = await ProjectRepository.create(data.name, data.description, data.progress, data.technologies);
            console.log('✅ Projeto criado com sucesso:', result);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao criar projeto:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:projects:update', async (_, id, data) => {
        try {
            console.log(`🔄 [UPDATE] Iniciando atualização para projeto ID: ${id}`, { data });

            const allowedFields = ['name', 'description', 'status', 'progress', 'githubUrl'];
            const fieldsToUpdate = Object.keys(data).filter(key => allowedFields.includes(key));

            if (fieldsToUpdate.length === 0) {
                console.error('❌ [UPDATE] Falha: Nenhum campo válido para atualizar.', { data });
                return { success: false, error: 'Nenhum campo válido para atualizar' };
            }

            const setClauses = fieldsToUpdate.map(key => `${key} = ?`).join(', ');
            const values = fieldsToUpdate.map(key => data[key]);
            values.push(id);

            const query = `UPDATE projects SET ${setClauses}, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = ?`;

            console.log('📝 [UPDATE] Query construída:', query);
            console.log('🔢 [UPDATE] Valores para a query:', values);

            // Verificar se há valores undefined
            if (values.some(v => v === undefined)) {
                console.error('❌ [UPDATE] ERRO FATAL: Parâmetros de bind contêm undefined!', { values });
                return { success: false, error: 'Parâmetros de bind não podem conter undefined.' };
            }

            await db.query(query, values);

            const updatedProject = await ProjectRepository.getById(id);

            console.log('✅ [UPDATE] Projeto atualizado com sucesso:', { id });
            return { success: true, data: updatedProject };
        } catch (error: any) {
            console.error('❌ [UPDATE] Erro ao executar a atualização do projeto:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:projects:delete', async (_, id) => {
        try {
            await db.query('DELETE FROM projects WHERE id = ?', [id]);
            return { success: true };
        } catch (error: any) {
            console.error('❌ Erro ao deletar projeto:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:projects:getById', async (_, id) => {
        try {
            console.log('🔍 Buscando projeto com dados relacionados:', id);
            const project = await ProjectRepository.getById(id);
            console.log('📊 Projeto carregado:', project ? {
                id: project.id,
                name: project.name,
                comments: project.comments?.length || 0,
                links: project.links?.length || 0,
                folders: project.folders?.length || 0
            } : 'null');
            return { success: true, data: project };
        } catch (error: any) {
            console.error('❌ Erro ao buscar projeto:', error);
            return { success: false, error: error.message };
        }
    });

    // NEW: Handlers para comentários, links e pastas
    ipcMain.handle('db:projects:addComment', async (_, data) => {
        try {
            console.log('📝 Adicionando comentário ao projeto:', data);
            const result = await db.query(
                'INSERT INTO project_comments (projectId, content, createdAt, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))',
                [data.projectId, data.content]
            );
            console.log('✅ Comentário adicionado com sucesso:', result);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao adicionar comentário:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:projects:addLink', async (_, data) => {
        try {
            console.log('🔗 Adicionando link ao projeto:', data);
            const result = await db.query(
                'INSERT INTO project_links (projectId, name, url, createdAt, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))',
                [data.projectId, data.name, data.url]
            );
            console.log('✅ Link adicionado com sucesso:', result);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao adicionar link:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:projects:addFolder', async (_, data) => {
        try {
            console.log('📁 Adicionando pasta ao projeto:', data);
            const result = await db.query(
                'INSERT INTO project_folders (projectId, name, path, createdAt, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))',
                [data.projectId, data.name, data.path]
            );
            console.log('✅ Pasta adicionada com sucesso:', result);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao adicionar pasta:', error);
            return { success: false, error: error.message };
        }
    });

    // Handlers para deletar
    ipcMain.handle('db:comments:delete', async (_, commentId) => {
        try {
            console.log('🗑️ Deletando comentário:', commentId);
            const result = await db.query('DELETE FROM project_comments WHERE id = ?', [commentId]);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao deletar comentário:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:links:delete', async (_, linkId) => {
        try {
            console.log('🗑️ Deletando link:', linkId);
            const result = await db.query('DELETE FROM project_links WHERE id = ?', [linkId]);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao deletar link:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:folders:delete', async (_, folderId) => {
        try {
            console.log('🗑️ Deletando pasta:', folderId);
            const result = await db.query('DELETE FROM project_folders WHERE id = ?', [folderId]);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao deletar pasta:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:folders:update', async (_, data) => {
        try {
            console.log('✏️ Atualizando pasta:', data);
            const result = await db.query(
                'UPDATE project_folders SET name = ?, path = ?, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = ?',
                [data.name, data.path, data.folderId]
            );
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao atualizar pasta:', error);
            return { success: false, error: error.message };
        }
    });

    // Focus Dates
    console.log('📅 Registrando handler: db:focusDates:getAll');
    ipcMain.handle('db:focusDates:getAll', async () => {
        console.log('🔍 [IPC] Handler db:focusDates:getAll chamado');
        try {
            const focusDates = await db.getAllFocusDates();
            console.log(`📅 [IPC] Focus dates encontradas: ${focusDates.length}`);
            return { success: true, data: focusDates };
        } catch (error: any) {
            console.error('❌ [IPC] Erro ao buscar focus dates:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:projects:addFocusDate', async (_, data) => {
        try {
            const result = await db.createFocusDate(data.startDate, `Focus period`, data.projectId);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao adicionar focus date:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:focusDates:delete', async (_, focusDateId) => {
        console.log('🗑️ [IPC] Deletando focus date:', focusDateId);
        try {
            await db.query('DELETE FROM date_focus WHERE id = ?', [focusDateId]);
            return { success: true };
        } catch (error: any) {
            console.error('❌ Erro ao deletar focus date:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:focusDates:update', async (_, data) => {
        console.log('✏️ [IPC] Atualizando focus date:', data);
        try {
            const result = await db.query(
                'UPDATE date_focus SET startDate = ?, endDate = ?, projectId = ? WHERE id = ?',
                [
                    data.startDate || null,
                    data.endDate || null,
                    data.projectId || null,
                    data.focusDateId
                ]
            );
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao atualizar focus date:', error);
            return { success: false, error: error.message };
        }
    });

    // Notifications
    ipcMain.handle('db:notifications:getAll', async () => {
        try {
            const notifications = await db.getAllNotifications();
            return { success: true, data: notifications };
        } catch (error: any) {
            console.error('❌ Erro ao buscar notificações:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:notifications:create', async (_, data) => {
        try {
            const result = await db.createNotification(data.title, data.message, data.projectId);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao criar notificação:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:notifications:markAsRead', async (_, id) => {
        try {
            const result = await db.query(
                'UPDATE notifications SET `read` = TRUE, readAt = CURRENT_TIMESTAMP(3) WHERE id = ?',
                [id]
            );
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao marcar notificação como lida:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:notifications:markAllAsRead', async () => {
        try {
            await db.query('UPDATE notifications SET `read` = TRUE, readAt = CURRENT_TIMESTAMP(3)');
            return { success: true };
        } catch (error: any) {
            console.error('❌ Erro ao marcar todas notificações como lidas:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:notifications:clearAll', async () => {
        try {
            await db.query('DELETE FROM notifications');
            return { success: true };
        } catch (error: any) {
            console.error('❌ Erro ao limpar notificações:', error);
            return { success: false, error: error.message };
        }
    });

    // Smart notifications handlers (usando estrutura real)
    ipcMain.handle('db:notifications:getToShow', async () => {
        try {
            const notifications = await db.query(
                'SELECT * FROM notifications WHERE isActive = TRUE AND isPaused = FALSE AND `read` = FALSE AND (nextShow IS NULL OR nextShow <= NOW()) LIMIT 5'
            );
            return { success: true, data: notifications };
        } catch (error: any) {
            console.error('❌ Erro ao buscar notificações para mostrar:', error);
            return { success: false, error: error.message };
        }
    });

    // Criar notificação inteligente
    ipcMain.handle('db:notifications:createSmart', async (_, data) => {
        try {
            console.log('📝 Criando notificação inteligente:', data);

            // Inserir notificação com todos os campos incluindo os novos
            const result = await db.query(`
                INSERT INTO notifications (
                    title, message, type, frequency, isActive, isPaused,
                    showTime, weekdays, monthDay, priority, 
                    category, tags, maxShows, nextShow,
                    sourceType, sourceId
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                data.title,
                data.message,
                data.type || 'info',
                data.frequency || 'ONCE',
                data.isActive !== undefined ? data.isActive : true,
                data.isPaused || false,
                data.showTime || null,
                data.weekdays ? data.weekdays.join(',') : null,
                data.monthDay || null,
                data.priority || 1,
                data.category || null,
                data.tags ? data.tags.join(',') : null,
                data.maxShows || null,
                data.nextShow || null,
                data.sourceType || 'manual',
                data.sourceId || null
            ]);

            console.log('✅ Notificação inteligente criada:', result);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao criar notificação inteligente:', error);
            return { success: false, error: error.message };
        }
    });

    // NEW: Handler para marcar notificação como não lida
    ipcMain.handle('db:notifications:markAsUnread', async (_, id) => {
        try {
            const result = await db.query(
                'UPDATE notifications SET `read` = FALSE, readAt = NULL WHERE id = ?',
                [id]
            );
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao marcar notificação como não lida:', error);
            return { success: false, error: error.message };
        }
    });

    // NEW: Handler para pausar/despausar notificação recorrente
    ipcMain.handle('db:notifications:updateRecurringStatus', async (_, id, isPaused) => {
        try {
            const result = await NotificationRepository.updateRecurringStatus(id, isPaused);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao atualizar status de notificação recorrente:', error);
            return { success: false, error: error.message };
        }
    });

    // NEW: Handlers para Recurring Notification Templates
    ipcMain.handle('db:recurringNotifications:getAll', async () => {
        try {
            const { RecurringNotificationRepository } = await import('../data/repositories/RecurringNotificationRepository');
            const templates = await RecurringNotificationRepository.getAll();
            return { success: true, data: templates };
        } catch (error: any) {
            console.error('❌ Erro ao buscar templates de notificações recorrentes:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:recurringNotifications:create', async (_, data) => {
        try {
            const { RecurringNotificationRepository } = await import('../data/repositories/RecurringNotificationRepository');
            const result = await RecurringNotificationRepository.create(data);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao criar template de notificação recorrente:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:recurringNotifications:update', async (_, id, data) => {
        try {
            const { RecurringNotificationRepository } = await import('../data/repositories/RecurringNotificationRepository');
            const result = await RecurringNotificationRepository.update(id, data);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao atualizar template de notificação recorrente:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:recurringNotifications:delete', async (_, id) => {
        try {
            const { RecurringNotificationRepository } = await import('../data/repositories/RecurringNotificationRepository');
            const result = await RecurringNotificationRepository.delete(id);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao deletar template de notificação recorrente:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:recurringNotifications:updateStatus', async (_, id, isActive, isPaused) => {
        try {
            const { RecurringNotificationRepository } = await import('../data/repositories/RecurringNotificationRepository');
            const result = await RecurringNotificationRepository.updateStatus(id, isActive, isPaused);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao atualizar status do template:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:recurringNotifications:getActive', async () => {
        try {
            const { RecurringNotificationRepository } = await import('../data/repositories/RecurringNotificationRepository');
            const templates = await RecurringNotificationRepository.getActive();
            return { success: true, data: templates };
        } catch (error: any) {
            console.error('❌ Erro ao buscar templates ativos:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:recurringNotifications:getReadyForExecution', async () => {
        try {
            const { RecurringNotificationRepository } = await import('../data/repositories/RecurringNotificationRepository');
            const templates = await RecurringNotificationRepository.getReadyForExecution();
            return { success: true, data: templates };
        } catch (error: any) {
            console.error('❌ Erro ao buscar templates prontos para execução:', error);
            return { success: false, error: error.message };
        }
    });

    // NEW: Handlers para Event Reminders
    ipcMain.handle('db:eventReminders:getAll', async () => {
        try {
            const { EventReminderRepository } = await import('../data/repositories/EventReminderRepository');
            const reminders = await EventReminderRepository.getAll();
            return { success: true, data: reminders };
        } catch (error: any) {
            console.error('❌ Erro ao buscar lembretes de eventos:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:eventReminders:createForEvent', async (_, eventId, eventName, startDate, endDate) => {
        try {
            const { EventReminderRepository } = await import('../data/repositories/EventReminderRepository');
            const result = await EventReminderRepository.createForEvent(eventId, eventName, startDate, endDate);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao criar lembretes para evento:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:eventReminders:getUnprocessed', async () => {
        try {
            const { EventReminderRepository } = await import('../data/repositories/EventReminderRepository');
            const reminders = await EventReminderRepository.getUnprocessed();
            return { success: true, data: reminders };
        } catch (error: any) {
            console.error('❌ Erro ao buscar lembretes não processados:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:eventReminders:markAsProcessed', async (_, id, notificationId) => {
        try {
            const { EventReminderRepository } = await import('../data/repositories/EventReminderRepository');
            const result = await EventReminderRepository.markAsProcessed(id, notificationId);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao marcar lembrete como processado:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:eventReminders:deleteByEvent', async (_, eventId) => {
        try {
            const { EventReminderRepository } = await import('../data/repositories/EventReminderRepository');
            const result = await EventReminderRepository.deleteByEvent(eventId);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao deletar lembretes do evento:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:eventReminders:updateEventReminders', async (_, eventId, eventName, startDate, endDate) => {
        try {
            const { EventReminderRepository } = await import('../data/repositories/EventReminderRepository');
            const result = await EventReminderRepository.updateEventReminders(eventId, eventName, startDate, endDate);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Erro ao atualizar lembretes do evento:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('db:eventReminders:getPending', async () => {
        try {
            const { EventReminderRepository } = await import('../data/repositories/EventReminderRepository');
            const reminders = await EventReminderRepository.getPending();
            return { success: true, data: reminders };
        } catch (error: any) {
            console.error('❌ Erro ao buscar lembretes pendentes:', error);
            return { success: false, error: error.message };
        }
    });

    // NEW: Handlers para controle do scheduler
    ipcMain.handle('scheduler:start', async () => {
        try {
            const scheduler = NotificationScheduler.getInstance();
            scheduler.start(1); // Check every 1 minute
            return { success: true };
        } catch (error: any) {
            console.error('❌ Erro ao iniciar scheduler:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('scheduler:stop', async () => {
        try {
            const scheduler = NotificationScheduler.getInstance();
            scheduler.stop();
            return { success: true };
        } catch (error: any) {
            console.error('❌ Erro ao parar scheduler:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('scheduler:status', async () => {
        try {
            const scheduler = NotificationScheduler.getInstance();
            const status = scheduler.getStatus();
            return { success: true, data: status };
        } catch (error: any) {
            console.error('❌ Erro ao obter status do scheduler:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('scheduler:forceProcess', async () => {
        try {
            const scheduler = NotificationScheduler.getInstance();
            await scheduler.forceProcess();
            return { success: true };
        } catch (error: any) {
            console.error('❌ Erro ao forçar processamento:', error);
            return { success: false, error: error.message };
        }
    });

    // Handler para abrir pasta
    ipcMain.handle('system:openFolder', async (_, folderPath: string) => {
        try {
            console.log('📂 Abrindo pasta:', folderPath);

            // Tentar primeiro windsurf, depois w, depois fallbacks
            const windsurfCommand = `windsurf "${folderPath}"`;

            return new Promise((resolve) => {
                exec(windsurfCommand, (error, stdout, stderr) => {
                    if (error) {
                        console.error('❌ Erro ao executar windsurf:', error);
                        // Fallback: tentar comando w
                        const wCommand = `w "${folderPath}"`;
                        exec(wCommand, (wError, wStdout, wStderr) => {
                            if (wError) {
                                console.error('❌ Erro ao executar comando w:', wError);
                                // Fallback: tentar xdg-open para abrir o gerenciador de arquivos
                                const fallbackCommand = `xdg-open "${folderPath}"`;
                                exec(fallbackCommand, (fallbackError) => {
                                    if (fallbackError) {
                                        console.error('❌ Erro com xdg-open:', fallbackError);
                                        // Último fallback: shell.openPath
                                        shell.openPath(folderPath).then(() => {
                                            console.log('✅ Pasta aberta com shell.openPath:', folderPath);
                                            resolve({ success: true, method: 'shell.openPath' });
                                        }).catch((shellError) => {
                                            console.error('❌ Erro com shell.openPath:', shellError);
                                            resolve({ success: false, error: shellError.message });
                                        });
                                    } else {
                                        console.log('✅ Pasta aberta com xdg-open:', folderPath);
                                        resolve({ success: true, method: 'xdg-open' });
                                    }
                                });
                            } else {
                                console.log('✅ Pasta aberta com comando w:', folderPath);
                                resolve({ success: true, method: 'command-w' });
                            }
                        });
                    } else {
                        console.log('✅ Pasta aberta com windsurf:', folderPath);
                        resolve({ success: true, method: 'windsurf' });
                    }
                });
            });
        } catch (error: any) {
            console.error('❌ Erro ao abrir pasta:', error);
            return { success: false, error: error.message };
        }
    });

    // Start the notification scheduler automatically with 30-second intervals
    console.log('📅 Starting notification scheduler automatically...');
    const scheduler = NotificationScheduler.getInstance();
    scheduler.start(0.5); // Check every 30 seconds

    console.log('✅ IPC do banco MySQL configurado!');
}