import { useState, useEffect, useCallback } from 'react';

// Hook para lembretes de eventos
export function useEventReminders() {
    const [reminders, setReminders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadReminders = useCallback(async () => {
        console.log('[IPC] Carregando lembretes de eventos...');

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            console.error('[IPC] electronAPI não disponível para lembretes');
            setError('Electron API não disponível');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const result = await window.electronAPI.invoke('db:eventReminders:getAll');
            console.log('[IPC] Lembretes resultado:', result);

            if (result.success) {
                setReminders(result.data);
                setError(null);
                console.log('[IPC] ✅ Lembretes carregados:', result.data.length);
            } else {
                setError(result.error);
                console.error('[IPC] ❌ Erro ao carregar lembretes:', result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar lembretes';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro na chamada de lembretes:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createForEvent = useCallback(async (eventId: number, eventName: string, startDate: Date, endDate: Date) => {
        console.log('[IPC] Criando lembretes para evento:', eventId, eventName);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:eventReminders:createForEvent', eventId, eventName, startDate, endDate);
            console.log('[IPC] Lembretes criados:', result);

            if (result.success) {
                await loadReminders(); // Recarregar lista
                console.log('[IPC] ✅ Lembretes criados para evento:', eventId);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao criar lembretes';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao criar lembretes:', err);
            throw err;
        }
    }, [loadReminders]);

    const getUnprocessed = useCallback(async () => {
        console.log('[IPC] Buscando lembretes não processados...');

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:eventReminders:getUnprocessed');
            console.log('[IPC] Lembretes não processados:', result);

            if (result.success) {
                console.log('[IPC] ✅ Lembretes não processados:', result.data.length);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao buscar lembretes não processados';
            console.error('[IPC] ❌ Erro ao buscar lembretes não processados:', err);
            throw err;
        }
    }, []);

    const markAsProcessed = useCallback(async (id: number, notificationId: number) => {
        console.log('[IPC] Marcando lembrete como processado:', id, notificationId);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:eventReminders:markAsProcessed', id, notificationId);
            console.log('[IPC] Lembrete marcado como processado:', result);

            if (result.success) {
                setReminders(prev =>
                    prev.map(r => r.id === id ? { ...r, isProcessed: true, notificationId } : r)
                );
                console.log('[IPC] ✅ Lembrete marcado como processado:', id);
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao marcar como processado';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao marcar como processado:', err);
            throw err;
        }
    }, []);

    const deleteByEvent = useCallback(async (eventId: number) => {
        console.log('[IPC] Deletando lembretes do evento:', eventId);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:eventReminders:deleteByEvent', eventId);
            console.log('[IPC] Lembretes deletados:', result);

            if (result.success) {
                await loadReminders(); // Recarregar lista
                console.log('[IPC] ✅ Lembretes deletados para evento:', eventId);
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar lembretes';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao deletar lembretes:', err);
            throw err;
        }
    }, [loadReminders]);

    const updateEventReminders = useCallback(async (eventId: number, eventName: string, startDate: Date, endDate: Date) => {
        console.log('[IPC] Atualizando lembretes do evento:', eventId, eventName);

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:eventReminders:updateEventReminders', eventId, eventName, startDate, endDate);
            console.log('[IPC] Lembretes atualizados:', result);

            if (result.success) {
                await loadReminders(); // Recarregar lista
                console.log('[IPC] ✅ Lembretes atualizados para evento:', eventId);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar lembretes';
            setError(errorMsg);
            console.error('[IPC] ❌ Erro ao atualizar lembretes:', err);
            throw err;
        }
    }, [loadReminders]);

    const getPending = useCallback(async () => {
        console.log('[IPC] Buscando lembretes pendentes...');

        if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.invoke) {
            throw new Error('Electron API não disponível');
        }

        try {
            const result = await window.electronAPI.invoke('db:eventReminders:getPending');
            console.log('[IPC] Lembretes pendentes:', result);

            if (result.success) {
                console.log('[IPC] ✅ Lembretes pendentes:', result.data.length);
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao buscar lembretes pendentes';
            console.error('[IPC] ❌ Erro ao buscar lembretes pendentes:', err);
            throw err;
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadReminders();
        }, 100);

        return () => clearTimeout(timer);
    }, [loadReminders]);

    return {
        reminders,
        loading,
        error,
        loadReminders,
        createForEvent,
        getUnprocessed,
        markAsProcessed,
        deleteByEvent,
        updateEventReminders,
        getPending
    };
}