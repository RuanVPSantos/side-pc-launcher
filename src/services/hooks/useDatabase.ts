import { useState, useEffect, useCallback } from 'react';
import {
    projectService,
    notificationService,
    systemService,
    weatherService,
    settingsService,
    type ProjectWithTechnologies,
    type CreateProjectData,
    type UpdateProjectData
} from '../../services';
import type { Notification } from '../../data/models/types';

// Hook para projetos
export function useProjects() {
    const [projects, setProjects] = useState<ProjectWithTechnologies[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProjects = useCallback(async () => {
        try {
            setLoading(true);
            const data = await projectService.getAllProjects();
            setProjects(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar projetos');
        } finally {
            setLoading(false);
        }
    }, []);

    const createProject = useCallback(async (data: CreateProjectData) => {
        try {
            const newProject = await projectService.createProject(data);
            setProjects(prev => [newProject, ...prev]);
            return newProject;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar projeto');
            throw err;
        }
    }, []);

    const updateProject = useCallback(async (id: number, data: UpdateProjectData) => {
        try {
            const updatedProject = await projectService.updateProject(id, data);
            setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
            return updatedProject;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar projeto');
            throw err;
        }
    }, []);

    const deleteProject = useCallback(async (id: number) => {
        try {
            await projectService.deleteProject(id);
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao deletar projeto');
            throw err;
        }
    }, []);

    useEffect(() => {
        loadProjects();
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

// Hook para notificações
export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const data = await notificationService.getAllNotifications();
            setNotifications(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar notificações');
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao marcar como lida');
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao marcar todas como lidas');
        }
    }, []);

    const clearAll = useCallback(async () => {
        try {
            await notificationService.clearAllNotifications();
            setNotifications([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao limpar notificações');
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    return {
        notifications,
        loading,
        error,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        clearAll
    };
}

// Hook para métricas do sistema
export function useSystemMetrics() {
    const [metrics, setMetrics] = useState({
        cpu: 0,
        memory: 0,
        disk: 0,
        network: 0
    });
    const [loading, setLoading] = useState(true);

    const updateMetrics = useCallback(async () => {
        try {
            // Simular métricas para desenvolvimento
            await systemService.simulateSystemMetrics();
            const stats = await systemService.getSystemStats();
            setMetrics(stats);
            setLoading(false);
        } catch (err) {
            console.error('Erro ao atualizar métricas:', err);
        }
    }, []);

    useEffect(() => {
        updateMetrics();

        // Atualizar métricas a cada 5 segundos
        const interval = setInterval(updateMetrics, 5000);

        return () => clearInterval(interval);
    }, [updateMetrics]);

    return {
        metrics,
        loading,
        updateMetrics
    };
}

// Hook para dados meteorológicos
export function useWeather() {
    const [weather, setWeather] = useState<{
        temperature: number;
        humidity: number;
        condition: string;
        icon?: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    const updateWeather = useCallback(async () => {
        try {
            const location = await settingsService.getWeatherLocation();

            // Simular dados meteorológicos para desenvolvimento
            const weatherData = await weatherService.simulateWeatherData(location);

            setWeather({
                temperature: weatherData.temperature,
                humidity: weatherData.humidity,
                condition: weatherData.condition,
                icon: weatherData.icon || undefined
            });
            setLoading(false);
        } catch (err) {
            console.error('Erro ao atualizar clima:', err);
        }
    }, []);

    useEffect(() => {
        updateWeather();

        // Atualizar clima a cada 5 minutos
        const interval = setInterval(updateWeather, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [updateWeather]);

    return {
        weather,
        loading,
        updateWeather
    };
}