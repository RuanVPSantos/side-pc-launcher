import { useState, useEffect, useCallback } from 'react';

// Tipos mock temporários
interface ProjectWithTechnologies {
    id: number;
    name: string;
    description: string;
    status: string;
    progress: number;
    technologies: { technology: { name: string } }[];
}

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: Date;
}

// Dados mock
const mockProjects: ProjectWithTechnologies[] = [
    {
        id: 1,
        name: 'LAUNCHER DASHBOARD',
        description: 'Sistema de dashboard personalizado com widgets interativos',
        status: 'active',
        progress: 85,
        technologies: [
            { technology: { name: 'React' } },
            { technology: { name: 'TypeScript' } },
            { technology: { name: 'Electron' } }
        ]
    },
    {
        id: 2,
        name: 'API WEATHER SERVICE',
        description: 'Serviço de previsão do tempo com múltiplas fontes',
        status: 'completed',
        progress: 100,
        technologies: [
            { technology: { name: 'Node.js' } },
            { technology: { name: 'Express' } },
            { technology: { name: 'OpenWeather' } }
        ]
    }
];

const mockNotifications: Notification[] = [
    {
        id: 1,
        title: 'SISTEMA ATUALIZADO',
        message: 'Dashboard atualizado para versão 1.2.0 com novas funcionalidades',
        type: 'success',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
        id: 2,
        title: 'CLIMA ATUALIZADO',
        message: 'Previsão do tempo sincronizada com nova API',
        type: 'info',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
    }
];

// Hook para projetos
export function useProjects() {
    const [projects, setProjects] = useState<ProjectWithTechnologies[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProjects = useCallback(async () => {
        try {
            setLoading(true);
            // Simular carregamento
            await new Promise(resolve => setTimeout(resolve, 500));
            setProjects(mockProjects);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar projetos');
        } finally {
            setLoading(false);
        }
    }, []);

    const createProject = useCallback(async (data: any) => {
        const newProject: ProjectWithTechnologies = {
            id: Date.now(),
            name: data.name,
            description: data.description,
            status: data.status,
            progress: data.progress || 0,
            technologies: data.technologies.map((tech: string) => ({
                technology: { name: tech }
            }))
        };
        setProjects(prev => [newProject, ...prev]);
        return newProject;
    }, []);

    const updateProject = useCallback(async (id: number, data: any) => {
        const updatedProject = {
            id,
            name: data.name,
            description: data.description,
            status: data.status,
            progress: data.progress || 0,
            technologies: data.technologies.map((tech: string) => ({
                technology: { name: tech }
            }))
        };
        setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
        return updatedProject;
    }, []);

    const deleteProject = useCallback(async (id: number) => {
        setProjects(prev => prev.filter(p => p.id !== id));
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
            // Simular carregamento
            await new Promise(resolve => setTimeout(resolve, 500));
            setNotifications(mockNotifications);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar notificações');
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (id: number) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    const markAllAsRead = useCallback(async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearAll = useCallback(async () => {
        setNotifications([]);
    }, []);

    const createNotification = useCallback(async (data: any) => {
        const newNotification: Notification = {
            id: Date.now(),
            title: data.title,
            message: data.message,
            type: data.type,
            read: false,
            createdAt: new Date()
        };
        setNotifications(prev => [newNotification, ...prev]);
        return newNotification;
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
        clearAll,
        createNotification
    };
}