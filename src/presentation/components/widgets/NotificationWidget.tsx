import { useState, useEffect } from 'react';

interface PendingNotification {
    id: number;
    title: string;
    message: string;
    type: string;
    priority: number;
    frequency: string;
    nextShow: Date;
}

export function NotificationWidget() {
    const [pendingNotifications, setPendingNotifications] = useState<PendingNotification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPendingNotifications();

        // Verificar notificações a cada minuto
        const interval = setInterval(loadPendingNotifications, 60000);

        return () => clearInterval(interval);
    }, []);

    const loadPendingNotifications = async () => {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                const result = await window.electronAPI.invoke('db:notifications:getToShow');
                if (result.success) {
                    setPendingNotifications(result.data.slice(0, 3)); // Mostrar apenas 3
                }
            }
        } catch (error) {
            console.error('Erro ao carregar notificações pendentes:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsShown = async (id: number) => {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                const result = await window.electronAPI.invoke('db:notifications:markAsShown', id);
                if (result.success) {
                    setPendingNotifications(prev => prev.filter(n => n.id !== id));
                }
            }
        } catch (error) {
            console.error('Erro ao marcar como mostrada:', error);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return '#00d9ff';
            case 'warning': return '#ff9500';
            case 'error': return '#ff4444';
            case 'info': return '#00d9ff';
            default: return '#ffffff';
        }
    };

    const getPriorityIcon = (priority: number) => {
        switch (priority) {
            case 3: return '🔴'; // Alta
            case 2: return '🟡'; // Média
            case 1: return '🟢'; // Baixa
            default: return '⚪';
        }
    };

    const formatNextShow = (nextShow: Date) => {
        const now = new Date();
        const diff = nextShow.getTime() - now.getTime();

        if (diff <= 0) return 'Agora';

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days > 0) return `${days}d`;
        if (hours > 0) return `${hours}h`;
        if (minutes > 0) return `${minutes}min`;
        return 'Agora';
    };

    if (loading) {
        return (
            <div className="widget notification-widget">
                <div className="widget-header">
                    <h3 className="widget-title">NOTIFICAÇÕES</h3>
                </div>
                <div className="notification-content">
                    <div className="loading-state">Carregando...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="widget notification-widget">
            <div className="widget-header">
                <h3 className="widget-title">NOTIFICAÇÕES</h3>
                <div className="widget-subtitle">
                    {pendingNotifications.length} pendente{pendingNotifications.length !== 1 ? 's' : ''}
                </div>
            </div>

            <div className="notification-content">
                {pendingNotifications.length === 0 ? (
                    <div className="empty-notifications">
                        <div className="empty-icon">🔕</div>
                        <div className="empty-text">Nenhuma notificação pendente</div>
                    </div>
                ) : (
                    <div className="notifications-list">
                        {pendingNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="notification-item"
                                style={{ borderLeftColor: getTypeColor(notification.type) }}
                            >
                                <div className="notification-header">
                                    <div className="notification-priority">
                                        {getPriorityIcon(notification.priority)}
                                    </div>
                                    <div className="notification-title">{notification.title}</div>
                                    <div className="notification-time">
                                        {formatNextShow(new Date(notification.nextShow))}
                                    </div>
                                </div>

                                <div className="notification-message">
                                    {notification.message}
                                </div>

                                <div className="notification-actions">
                                    <button
                                        className="show-btn"
                                        onClick={() => markAsShown(notification.id)}
                                    >
                                        Mostrar
                                    </button>
                                    <div className="notification-frequency">
                                        {notification.frequency !== 'ONCE' && (
                                            <span className="frequency-badge">
                                                {notification.frequency === 'DAILY' ? 'Diário' :
                                                    notification.frequency === 'WEEKLY' ? 'Semanal' :
                                                        notification.frequency === 'MONTHLY' ? 'Mensal' :
                                                            notification.frequency}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {pendingNotifications.length > 0 && (
                <div className="notification-footer">
                    <button
                        className="process-all-btn"
                        onClick={() => {
                            // Processar todas as notificações
                            if (typeof window !== 'undefined' && window.electronAPI) {
                                window.electronAPI.invoke('db:notifications:processNotifications')
                                    .then(() => loadPendingNotifications());
                            }
                        }}
                    >
                        Processar Todas
                    </button>
                </div>
            )}
        </div>
    );
}