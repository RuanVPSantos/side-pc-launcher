import { useState } from 'react';
import './notifications-page.css';
import '../../styles/forms.css';
import { useNotifications } from '../../../services/hooks/useDatabaseSmart';
import { useRecurringNotifications } from '../../../services/hooks/useRecurringNotifications';
import { SmartNotificationForm, RecurringNotificationForm, RecurringNotificationsList } from '.';

export function NotificationsPage() {
    const { notifications, loading, error, markAsRead, markAsUnread, markAllAsRead, clearAll, createNotification, loadNotifications, updateRecurringStatus } = useNotifications();
    const recurringNotifications = useRecurringNotifications();
    const [showForm, setShowForm] = useState(false);
    const [showRecurringForm, setShowRecurringForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'recurring'>('all');

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success': return '';
            case 'warning': return '';
            case 'error': return '';
            case 'info': return '';
            default: return '';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return '#00d9ff';
            case 'warning': return '#ff9500';
            case 'error': return '#ff4444';
            case 'info': return '#00d9ff';
            default: return '#fff';
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days > 0) return `${days}d atrás`;
        if (hours > 0) return `${hours}h atrás`;
        if (minutes > 0) return `${minutes}min atrás`;
        return 'Agora';
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleCreateNotification = async (data: any) => {
        try {
            // Usar IPC para criar notificação inteligente
            if (typeof window !== 'undefined' && window.electronAPI) {
                const result = await window.electronAPI.invoke('db:notifications:createSmart', data);
                if (result.success) {
                    console.log('✅ Notificação inteligente criada:', result.data);
                    // Recarregar notificações
                    loadNotifications();
                } else {
                    console.error('❌ Erro ao criar notificação:', result.error);
                }
            } else {
                await createNotification(data);
            }
            setShowForm(false);
        } catch (error) {
            console.error('Erro ao criar notificação:', error);
        }
    };

    if (loading) {
        return (
            <div className="notifications-page">
                <div className="page-header">
                    <h1>NOTIFICAÇÕES</h1>
                </div>
                <div style={{ textAlign: 'center', padding: '40px', color: '#00d9ff' }}>
                    Carregando notificações...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="notifications-page">
                <div className="page-header">
                    <h1>NOTIFICAÇÕES</h1>
                </div>
                <div style={{ textAlign: 'center', padding: '40px', color: '#ff4444' }}>
                    Erro: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="notifications-page">
            <div className="page-header">
                <h1>NOTIFICAÇÕES</h1>
                <div className="notifications-stats">
                    <div className="stat-item">
                        <span className="stat-label">TOTAL</span>
                        <span className="stat-value">{notifications.length}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">NÃO LIDAS</span>
                        <span className="stat-value">{unreadCount}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="notifications-tabs">
                <button
                    className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    TODAS AS NOTIFICAÇÕES
                </button>
                <button
                    className={`tab-btn ${activeTab === 'recurring' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recurring')}
                >
                    NOTIFICAÇÕES RECORRENTES
                </button>
            </div>

            <div className="notifications-actions">
                {activeTab === 'all' ? (
                    <>
                        <button
                            className="action-btn primary"
                            onClick={() => setShowForm(true)}
                        >
                            NOVA NOTIFICAÇÃO
                        </button>
                        <button
                            className="action-btn secondary"
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                        >
                            MARCAR TODAS COMO LIDAS
                        </button>
                        <button
                            className="action-btn secondary"
                            onClick={clearAll}
                            disabled={notifications.length === 0}
                        >
                            LIMPAR TODAS
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className="action-btn primary"
                            onClick={() => setShowRecurringForm(true)}
                        >
                            NOVO TEMPLATE
                        </button>
                        <button
                            className="action-btn secondary"
                            onClick={recurringNotifications.loadTemplates}
                        >
                            ATUALIZAR
                        </button>
                        <button
                            className="action-btn secondary"
                            onClick={async () => {
                                try {
                                    if (typeof window !== 'undefined' && window.electronAPI) {
                                        const result = await window.electronAPI.invoke('scheduler:forceProcess');
                                        if (result.success) {
                                            console.log('✅ Processamento forçado executado');
                                            // Recarregar notificações para ver as novas
                                            loadNotifications();
                                        } else {
                                            console.error('❌ Erro no processamento:', result.error);
                                        }
                                    }
                                } catch (error) {
                                    console.error('❌ Erro ao forçar processamento:', error);
                                }
                            }}
                        >
                            PROCESSAR AGORA
                        </button>
                        <button
                            className="action-btn secondary"
                            onClick={async () => {
                                try {
                                    if (typeof window !== 'undefined' && window.electronAPI) {
                                        const result = await window.electronAPI.invoke('scheduler:status');
                                        if (result.success) {
                                            const status = result.data;
                                            alert(`📅 Status do Scheduler:\n\n✅ Rodando: ${status.isRunning ? 'Sim' : 'Não'}\n🔄 Intervalo ativo: ${status.hasInterval ? 'Sim (30s)' : 'Não'}\n\n${status.isRunning ? 'O scheduler está verificando notificações automaticamente.' : 'O scheduler está parado.'}`);
                                        } else {
                                            alert('❌ Erro ao verificar status: ' + result.error);
                                        }
                                    }
                                } catch (error) {
                                    console.error('❌ Erro ao verificar status:', error);
                                    alert('❌ Erro ao verificar status do scheduler');
                                }
                            }}
                        >
                            STATUS SCHEDULER
                        </button>
                    </>
                )}
            </div>

            {/* Content based on active tab */}
            {activeTab === 'all' ? (
                <div className="notifications-list">
                    {notifications.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🔕</div>
                            <div className="empty-text">NENHUMA NOTIFICAÇÃO</div>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                            >
                                <div className="notification-icon">
                                    <span style={{ color: getTypeColor(notification.type) }}>
                                        {getTypeIcon(notification.type)}
                                    </span>
                                </div>

                                <div className="notification-content">
                                    <div className="notification-header">
                                        <h3 className="notification-title">{notification.title}</h3>
                                        <span className="notification-time">{formatTime(new Date(notification.createdAt))}</span>
                                    </div>
                                    <p className="notification-message">{notification.message}</p>

                                    {/* Mostrar informações de recorrência */}
                                    {notification.frequency !== 'ONCE' && (
                                        <div className="notification-meta">
                                            <span className="frequency-badge">
                                                {notification.frequency === 'DAILY' ? 'Diário' :
                                                    notification.frequency === 'WEEKLY' ? 'Semanal' :
                                                        notification.frequency === 'MONTHLY' ? 'Mensal' :
                                                            notification.frequency}
                                            </span>
                                            {notification.isPaused && (
                                                <span className="paused-badge">Pausada</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="notification-actions">
                                    {notification.read ? (
                                        <button
                                            className="action-btn-small secondary"
                                            onClick={() => markAsUnread(notification.id)}
                                            title="Marcar como não lida"
                                        >
                                            📧
                                        </button>
                                    ) : (
                                        <button
                                            className="action-btn-small primary"
                                            onClick={() => markAsRead(notification.id)}
                                            title="Marcar como lida"
                                        >
                                            ✓
                                        </button>
                                    )}

                                    {notification.frequency !== 'ONCE' && (
                                        <button
                                            className="action-btn-small secondary"
                                            onClick={() => updateRecurringStatus(notification.id, !notification.isPaused)}
                                            title={notification.isPaused ? 'Despausar' : 'Pausar'}
                                        >
                                            {notification.isPaused ? '▶️' : '⏸️'}
                                        </button>
                                    )}
                                </div>

                                {!notification.read && <div className="unread-indicator" />}
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <RecurringNotificationsList
                    templates={recurringNotifications.templates}
                    loading={recurringNotifications.loading}
                    error={recurringNotifications.error}
                    onUpdateStatus={recurringNotifications.updateStatus}
                    onDelete={recurringNotifications.deleteTemplate}
                    onEdit={(template: any) => {
                        // TODO: Implementar edição
                        console.log('Editar template:', template);
                    }}
                />
            )}

            <SmartNotificationForm
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSubmit={handleCreateNotification}
                title="NOVA NOTIFICAÇÃO INTELIGENTE"
            />

            <RecurringNotificationForm
                isOpen={showRecurringForm}
                onClose={() => setShowRecurringForm(false)}
                onSubmit={async (data: any) => {
                    try {
                        await recurringNotifications.createTemplate(data);
                        setShowRecurringForm(false);
                    } catch (error) {
                        console.error('Erro ao criar template:', error);
                    }
                }}
                title="NOVO TEMPLATE DE NOTIFICAÇÃO RECORRENTE"
            />
        </div>
    );
}