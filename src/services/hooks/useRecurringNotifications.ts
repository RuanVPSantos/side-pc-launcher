import { useState, useEffect, useCallback } from 'react';

// Hook para notificações recorrentes (templates)
export function useRecurringNotifications() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadTemplates = useCallback(async () => {
        console.log('[IPC] Carregando templates de notificações recorrentes...');

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            console.error('[IPC] electronAPI não disponível para templates');
            setError('Electron API não disponível');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const result = await window.electronAPI.invoke('db:recurringNotifications:getAll');
            console.log('[IPC] Templates resultado:', result);

            if (result.success) {
                setTemplates(result.data);
                setError(null);
                console.log('[IPC] ✅ Templates carregados:', result.data.length);
            } else {
                setError(result.error);
                console.error('[IPC] ❌ Erro ao carregar templates:', result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar templates';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro na chamada de templates:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createTemplate = useCallback(async (data: any) => {
        console.log('[IPC] Criando template:', data);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:recurringNotifications:create', data);
            console.log('[IPC] Template criado:', result);

            if (result.success) {
                await loadTemplates(); // Recarregar lista
                console.log('[IPC] ✅ Template criado:', result.data);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao criar template';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao criar template:', err);
            throw err;
        }
    }, [loadTemplates]);

    const updateTemplate = useCallback(async (id: number, data: any) => {
        console.log('[IPC] Atualizando template:', id, data);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:recurringNotifications:update', id, data);
            console.log('[IPC] Template atualizado:', result);

            if (result.success) {
                await loadTemplates(); // Recarregar lista
                console.log('[IPC] ✅ Template atualizado:', result.data);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar template';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao atualizar template:', err);
            throw err;
        }
    }, [loadTemplates]);

    const deleteTemplate = useCallback(async (id: number) => {
        console.log('[IPC] Deletando template:', id);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:recurringNotifications:delete', id);
            console.log('[IPC] Template deletado:', result);

            if (result.success) {
                await loadTemplates(); // Recarregar lista
                console.log('[IPC] ✅ Template deletado:', id);
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar template';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao deletar template:', err);
            throw err;
        }
    }, [loadTemplates]);

    const updateStatus = useCallback(async (id: number, isActive: boolean, isPaused: boolean) => {
        console.log('[IPC] Atualizando status do template:', id, isActive, isPaused);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:recurringNotifications:updateStatus', id, isActive, isPaused);
            console.log('[IPC] Status do template atualizado:', result);

            if (result.success) {
                setTemplates(prev =>
                    prev.map(t => t.id === id ? { ...t, isActive, isPaused } : t)
                );
                console.log('[IPC] ✅ Status do template atualizado:', id);
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar status';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao atualizar status:', err);
            throw err;
        }
    }, []);

    const getActiveTemplates = useCallback(async () => {
        console.log('[IPC] Buscando templates ativos...');

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:recurringNotifications:getActive');
            console.log('[IPC] Templates ativos:', result);

            if (result.success) {
                console.log('[IPC] ✅ Templates ativos carregados:', result.data.length);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao buscar templates ativos';
            console.error('[IPC] ❌ Erro ao buscar templates ativos:', err);
            throw err;
        }
    }, []);

    const getReadyForExecution = useCallback(async () => {
        console.log('[IPC] Buscando templates prontos para execução...');

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:recurringNotifications:getReadyForExecution');
            console.log('[IPC] Templates prontos:', result);

            if (result.success) {
                console.log('[IPC] ✅ Templates prontos carregados:', result.data.length);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao buscar templates prontos';
            console.error('[IPC] ❌ Erro ao buscar templates prontos:', err);
            throw err;
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadTemplates();
        }, 100);

        return () => clearTimeout(timer);
    }, [loadTemplates]);

    return {
        templates,
        loading,
        error,
        loadTemplates,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        updateStatus,
        getActiveTemplates,
        getReadyForExecution
    };
}