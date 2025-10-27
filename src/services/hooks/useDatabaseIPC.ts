import { useState, useEffect, useCallback } from 'react';

// Hook para projetos via IPC
export function useProjects() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProjects = useCallback(async () => {
        console.log('[IPC] Carregando projetos...');

        // Verificar se electronAPI está disponível
        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            console.error('[IPC] electronAPI não disponível');
            setError('Electron API não disponível');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('[IPC] Chamando db:projects:getAll...');

            const result = await window.electronAPI.invoke('db:projects:getAll');
            console.log('[IPC] Resultado:', result);

            if (result.success) {
                setProjects(result.data);
                setError(null);
                console.log('[IPC] ✅ Projetos carregados:', result.data.length);
            } else {
                setError(result.error);
                console.error('[IPC] ❌ Erro do servidor:', result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar projetos';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro na chamada:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createProject = useCallback(async (data: any) => {
        console.log('[IPC] Criando projeto:', data);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:projects:create', data);
            console.log('[IPC] Resultado criação:', result);

            if (result.success) {
                setProjects(prev => [result.data, ...prev]);
                console.log('[IPC] ✅ Projeto criado:', result.data);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao criar projeto';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao criar:', err);
            throw err;
        }
    }, []);

    const updateProject = useCallback(async (id: number, data: any) => {
        console.log('[IPC] Atualizando projeto:', id, data);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:projects:update', id, data);
            console.log('[IPC] Resultado atualização:', result);

            if (result.success) {
                setProjects(prev => prev.map(p => p.id === id ? result.data : p));
                console.log('[IPC] ✅ Projeto atualizado:', result.data);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar projeto';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao atualizar:', err);
            throw err;
        }
    }, []);

    const deleteProject = useCallback(async (id: number) => {
        console.log('[IPC] Deletando projeto:', id);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:projects:delete', id);
            console.log('[IPC] Resultado deleção:', result);

            if (result.success) {
                setProjects(prev => prev.filter(p => p.id !== id));
                console.log('[IPC] ✅ Projeto deletado:', id);
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar projeto';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao deletar:', err);
            throw err;
        }
    }, []);

    useEffect(() => {
        // Aguardar um pouco para garantir que electronAPI esteja disponível
        const timer = setTimeout(() => {
            loadProjects();
        }, 100);

        return () => clearTimeout(timer);
    }, [loadProjects]);

    return {
        projects,
        loading,
        error,
        loadProjects,
        createProject,
        updateProject,
        deleteProject
    };
}

// Hook para notificações via IPC
export function useNotifications() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadNotifications = useCallback(async () => {
        console.log('[IPC] Carregando notificações...');

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            console.error('[IPC] electronAPI não disponível para notificações');
            setError('Electron API não disponível');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const result = await window.electronAPI.invoke('db:notifications:getAll');
            console.log('[IPC] Notificações resultado:', result);

            if (result.success) {
                setNotifications(result.data);
                setError(null);
                console.log('[IPC] ✅ Notificações carregadas:', result.data.length);
            } else {
                setError(result.error);
                console.error('[IPC] ❌ Erro ao carregar notificações:', result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar notificações';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro na chamada de notificações:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createNotification = useCallback(async (data: any) => {
        console.log('[IPC] Criando notificação:', data);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:notifications:create', data);
            console.log('[IPC] Notificação criada:', result);

            if (result.success) {
                setNotifications(prev => [result.data, ...prev]);
                console.log('[IPC] ✅ Notificação criada:', result.data);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao criar notificação';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao criar notificação:', err);
            throw err;
        }
    }, []);

    const markAsRead = useCallback(async (id: number) => {
        console.log('[IPC] Marcando como lida:', id);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:notifications:markAsRead', id);

            if (result.success) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, read: true } : n)
                );
                console.log('[IPC] ✅ Notificação marcada como lida:', id);
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao marcar como lida';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao marcar como lida:', err);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        console.log('[IPC] Marcando todas como lidas...');

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:notifications:markAllAsRead');

            if (result.success) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                console.log('[IPC] ✅ Todas marcadas como lidas');
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao marcar todas como lidas';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao marcar todas como lidas:', err);
        }
    }, []);

    const clearAll = useCallback(async () => {
        console.log('[IPC] Limpando todas notificações...');

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:notifications:clearAll');

            if (result.success) {
                setNotifications([]);
                console.log('[IPC] ✅ Todas notificações limpas');
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao limpar notificações';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao limpar notificações:', err);
        }
    }, []);

    // NEW: Marcar notificação como não lida
    const markAsUnread = useCallback(async (id: number) => {
        console.log('[IPC] Marcando como não lida:', id);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:notifications:markAsUnread', id);

            if (result.success) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, read: false, readAt: null } : n)
                );
                console.log('[IPC] ✅ Notificação marcada como não lida:', id);
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao marcar como não lida';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao marcar como não lida:', err);
        }
    }, []);

    // NEW: Pausar/despausar notificação recorrente
    const updateRecurringStatus = useCallback(async (id: number, isPaused: boolean) => {
        console.log('[IPC] Atualizando status recorrente:', id, isPaused);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:notifications:updateRecurringStatus', id, isPaused);

            if (result.success) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, isPaused } : n)
                );
                console.log('[IPC] ✅ Status recorrente atualizado:', id, isPaused);
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar status recorrente';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao atualizar status recorrente:', err);
        }
    }, []);

    useEffect(() => {
        // Aguardar um pouco para garantir que electronAPI esteja disponível
        const timer = setTimeout(() => {
            loadNotifications();
        }, 100);

        return () => clearTimeout(timer);
    }, [loadNotifications]);

    return {
        notifications,
        loading,
        error,
        loadNotifications,
        createNotification,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        clearAll,
        updateRecurringStatus
    };
}

// Hook para detalhes do projeto via IPC
export function useProjectDetail(projectId: number) {
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProject = useCallback(async () => {
        console.log('[IPC] Carregando detalhes do projeto:', projectId);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            console.error('[IPC] electronAPI não disponível para detalhes');
            setError('Electron API não disponível');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const result = await window.electronAPI.invoke('db:projects:getById', projectId);
            console.log('[IPC] Detalhes do projeto:', result);

            if (result.success) {
                if (result.data) {
                    setProject(result.data);
                    setError(null);
                    console.log('[IPC] ✅ Detalhes carregados:', result.data);
                } else {
                    // Projeto não encontrado
                    setProject(null);
                    setError('Projeto não encontrado');
                    console.log('[IPC] ⚠️ Projeto não encontrado:', projectId);
                }
            } else {
                setProject(null);
                setError(result.error);
                console.error('[IPC] ❌ Erro ao carregar detalhes:', result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar projeto';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro na chamada de detalhes:', err);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    const addComment = useCallback(async (content: string) => {
        console.log('[IPC] Adicionando comentário:', content);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:projects:addComment', projectId, content);
            console.log('[IPC] Comentário adicionado:', result);

            if (result.success) {
                await loadProject(); // Recarregar projeto
                console.log('[IPC] ✅ Comentário adicionado:', result.data);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao adicionar comentário';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao adicionar comentário:', err);
            throw err;
        }
    }, [projectId, loadProject]);

    const addFolder = useCallback(async (name: string, path: string) => {
        console.log('[IPC] Adicionando pasta:', name, path);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:projects:addFolder', projectId, name, path);
            console.log('[IPC] Pasta adicionada:', result);

            if (result.success) {
                await loadProject(); // Recarregar projeto
                console.log('[IPC] ✅ Pasta adicionada:', result.data);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao adicionar pasta';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao adicionar pasta:', err);
            throw err;
        }
    }, [projectId, loadProject]);

    const addLink = useCallback(async (name: string, url: string) => {
        console.log('[IPC] Adicionando link:', name, url);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:projects:addLink', projectId, name, url);
            console.log('[IPC] Link adicionado:', result);

            if (result.success) {
                await loadProject(); // Recarregar projeto
                console.log('[IPC] ✅ Link adicionado:', result.data);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao adicionar link';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao adicionar link:', err);
            throw err;
        }
    }, [projectId, loadProject]);

    const addFocusDate = useCallback(async (startDate: string, endDate: string) => {
        console.log('[IPC] Adicionando data de foco:', startDate, endDate);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:projects:addFocusDate', projectId, startDate, endDate);
            console.log('[IPC] Data de foco adicionada:', result);

            if (result.success) {
                await loadProject(); // Recarregar projeto
                console.log('[IPC] ✅ Data de foco adicionada:', result.data);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao adicionar data de foco';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao adicionar data de foco:', err);
            throw err;
        }
    }, [projectId, loadProject]);

    const updateProject = useCallback(async (data: any) => {
        console.log('[IPC] Atualizando projeto:', projectId, data);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:projects:update', projectId, data);
            console.log('[IPC] Projeto atualizado:', result);

            if (result.success) {
                await loadProject(); // Recarregar projeto
                console.log('[IPC] ✅ Projeto atualizado:', result.data);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar projeto';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao atualizar projeto:', err);
            throw err;
        }
    }, [projectId, loadProject]);

    useEffect(() => {
        // Aguardar um pouco para garantir que electronAPI esteja disponível
        const timer = setTimeout(() => {
            loadProject();
        }, 100);

        return () => clearTimeout(timer);
    }, [loadProject]);

    const deleteComment = useCallback(async (commentId: number) => {
        console.log('[IPC] Deletando comentário:', commentId);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:comments:delete', commentId);
            console.log('[IPC] Comentário deletado:', result);

            if (result.success) {
                await loadProject(); // Recarregar projeto
                console.log('[IPC] ✅ Comentário deletado:', result.data);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar comentário';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao deletar comentário:', err);
            throw err;
        }
    }, [loadProject]);

    const deleteFolder = useCallback(async (folderId: number) => {
        console.log('[IPC] Deletando pasta:', folderId);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:folders:delete', folderId);
            console.log('[IPC] Pasta deletada:', result);

            if (result.success) {
                await loadProject(); // Recarregar projeto
                console.log('[IPC] ✅ Pasta deletada:', result.data);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar pasta';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao deletar pasta:', err);
            throw err;
        }
    }, [loadProject]);

    const updateFolder = useCallback(async (folderId: number, name: string, path: string) => {
        console.log('[IPC] Atualizando pasta:', folderId, name, path);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:folders:update', folderId, name, path);
            console.log('[IPC] Pasta atualizada:', result);

            if (result.success) {
                await loadProject(); // Recarregar projeto
                console.log('[IPC] ✅ Pasta atualizada:', result.data);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar pasta';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao atualizar pasta:', err);
            throw err;
        }
    }, [loadProject]);

    const deleteLink = useCallback(async (linkId: number) => {
        console.log('[IPC] Deletando link:', linkId);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:links:delete', linkId);
            console.log('[IPC] Link deletado:', result);

            if (result.success) {
                await loadProject(); // Recarregar projeto
                console.log('[IPC] ✅ Link deletado:', result.data);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar link';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao deletar link:', err);
            throw err;
        }
    }, [loadProject]);

    const deleteFocusDate = useCallback(async (focusDateId: number) => {
        console.log('[IPC] Deletando focus date:', focusDateId);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:focusDates:delete', focusDateId);
            console.log('[IPC] Focus date deletada:', result);

            if (result.success) {
                await loadProject(); // Recarregar projeto
                console.log('[IPC] ✅ Focus date deletada:', result.data);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar focus date';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao deletar focus date:', err);
            throw err;
        }
    }, [loadProject]);

    return {
        project,
        loading,
        error,
        loadProject,
        addComment,
        addFolder,
        addLink,
        addFocusDate,
        updateProject,
        deleteComment,
        deleteFolder,
        updateFolder,
        deleteLink,
        deleteFocusDate
    };
}
// Hook para focus dates via IPC

export function useFocusDates() {
    const [focusDates, setFocusDates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadFocusDates = useCallback(async () => {
        console.log('[IPC] 🔄 Carregando focus dates...');

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            console.error('[IPC] ❌ electronAPI não disponível para focus dates');
            setError('Electron API não disponível');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('[IPC] 📡 Chamando db:focusDates:getAll...');
            const result = await window.electronAPI.invoke('db:focusDates:getAll');
            console.log('[IPC] 📥 Focus dates resultado completo:', result);

            if (result.success) {
                console.log('[IPC] 📅 Dados recebidos:', result.data);
                setFocusDates(result.data);
                setError(null);
                console.log('[IPC] ✅ Focus dates carregadas:', result.data.length);
            } else {
                setError(result.error);
                console.error('[IPC] ❌ Erro ao carregar focus dates:', result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar focus dates';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro na chamada de focus dates:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createFocusDate = useCallback(async (projectId: number, startDate: string, endDate: string) => {
        console.log('[IPC] Criando focus date:', projectId, startDate, endDate);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:projects:addFocusDate', projectId, startDate, endDate);
            console.log('[IPC] Focus date criada:', result);

            if (result.success) {
                await loadFocusDates(); // Recarregar lista
                console.log('[IPC] ✅ Focus date criada:', result.data);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao criar focus date';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao criar focus date:', err);
            throw err;
        }
    }, [loadFocusDates]);

    const deleteFocusDate = useCallback(async (focusDateId: number) => {
        console.log('[IPC] Deletando focus date:', focusDateId);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:focusDates:delete', focusDateId);
            console.log('[IPC] Focus date deletada:', result);

            if (result.success) {
                await loadFocusDates(); // Recarregar lista
                console.log('[IPC] ✅ Focus date deletada:', result.data);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar focus date';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao deletar focus date:', err);
            throw err;
        }
    }, [loadFocusDates]);

    useEffect(() => {
        // Aguardar um pouco para garantir que electronAPI esteja disponível
        const timer = setTimeout(() => {
            loadFocusDates();
        }, 100);

        return () => clearTimeout(timer);
    }, [loadFocusDates]);

    const updateFocusDate = useCallback(async (focusDateId: number, data: any) => {
        console.log('[IPC] Atualizando focus date:', focusDateId, data);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:focusDates:update', focusDateId, data);
            console.log('[IPC] Focus date atualizada:', result);

            if (result.success) {
                await loadFocusDates(); // Recarregar lista
                console.log('[IPC] ✅ Focus date atualizada:', result.data);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar focus date';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao atualizar focus date:', err);
            throw err;
        }
    }, [loadFocusDates]);

    return {
        focusDates,
        loading,
        error,
        loadFocusDates,
        createFocusDate,
        deleteFocusDate,
        updateFocusDate
    };
}