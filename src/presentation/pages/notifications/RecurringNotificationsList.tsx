import React from 'react';

interface RecurringNotificationTemplate {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    isActive: boolean;
    isPaused: boolean;
    showTime: string;
    weekdays?: string;
    monthDay?: number;
    lastExecuted?: string;
    nextExecution: string;
    executionCount: number;
    maxExecutions?: number;
    priority: number;
    category?: string;
    tags?: string;
    createdAt: string;
}

interface RecurringNotificationsListProps {
    templates: RecurringNotificationTemplate[];
    loading: boolean;
    error: string | null;
    onUpdateStatus: (id: number, isActive: boolean, isPaused: boolean) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onEdit: (template: RecurringNotificationTemplate) => void;
}

export function RecurringNotificationsList({
    templates,
    loading,
    error,
    onUpdateStatus,
    onDelete,
    onEdit
}: RecurringNotificationsListProps) {
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return '#00d9ff';
            case 'warning': return '#ff9500';
            case 'error': return '#ff4444';
            case 'info': return '#00d9ff';
            default: return '#fff';
        }
    };

    const getFrequencyLabel = (frequency: string) => {
        switch (frequency) {
            case 'DAILY': return 'Diário';
            case 'WEEKLY': return 'Semanal';
            case 'MONTHLY': return 'Mensal';
            default: return frequency;
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

    const formatNextExecution = (nextExecution: string) => {
        const date = new Date(nextExecution);
        const now = new Date();
        const diff = date.getTime() - now.getTime();

        if (diff <= 0) return 'Vencida';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}min`;
        return `${minutes}min`;
    };

    const formatWeekdays = (weekdays?: string) => {
        if (!weekdays) return '';

        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const days = weekdays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));

        return days.map(d => dayNames[d]).join(', ');
    };

    const handleToggleActive = async (template: RecurringNotificationTemplate) => {
        try {
            await onUpdateStatus(template.id, !template.isActive, template.isPaused);
        } catch (error) {
            console.error('Erro ao alterar status ativo:', error);
        }
    };

    const handleTogglePaused = async (template: RecurringNotificationTemplate) => {
        try {
            await onUpdateStatus(template.id, template.isActive, !template.isPaused);
        } catch (error) {
            console.error('Erro ao alterar status pausado:', error);
        }
    };

    const handleDelete = async (template: RecurringNotificationTemplate) => {
        if (window.confirm(`Tem certeza que deseja deletar o template "${template.title}"?`)) {
            try {
                await onDelete(template.id);
            } catch (error) {
                console.error('Erro ao deletar template:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="recurring-notifications-list">
                <div className="loading-state">Carregando templates...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="recurring-notifications-list">
                <div className="error-state">Erro: {error}</div>
            </div>
        );
    }

    if (templates.length === 0) {
        return (
            <div className="recurring-notifications-list">
                <div className="empty-state">
                    <div className="empty-icon">🔄</div>
                    <div className="empty-text">NENHUM TEMPLATE DE NOTIFICAÇÃO RECORRENTE</div>
                    <div className="empty-subtitle">Crie templates para automatizar suas notificações</div>
                </div>
            </div>
        );
    }

    return (
        <div className="recurring-notifications-list">
            {templates.map((template) => (
                <div
                    key={template.id}
                    className={`recurring-notification-item ${!template.isActive ? 'inactive' : ''} ${template.isPaused ? 'paused' : ''}`}
                >
                    <div className="template-header">
                        <div className="template-info">
                            <div className="template-priority">
                                {getPriorityIcon(template.priority)}
                            </div>
                            <div className="template-title-section">
                                <h3 className="template-title">{template.title}</h3>
                                <div className="template-meta">
                                    <span
                                        className="template-type"
                                        style={{ color: getTypeColor(template.type) }}
                                    >
                                        {template.type.toUpperCase()}
                                    </span>
                                    <span className="template-frequency">
                                        {getFrequencyLabel(template.frequency)}
                                    </span>
                                    <span className="template-time">
                                        {template.showTime}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="template-status">
                            <div className="status-badges">
                                {!template.isActive && (
                                    <span className="status-badge inactive">Inativo</span>
                                )}
                                {template.isPaused && (
                                    <span className="status-badge paused">Pausado</span>
                                )}
                                {template.isActive && !template.isPaused && (
                                    <span className="status-badge active">Ativo</span>
                                )}
                            </div>

                            <div className="next-execution">
                                <small>Próxima: {formatNextExecution(template.nextExecution)}</small>
                            </div>
                        </div>
                    </div>

                    <div className="template-content">
                        <p className="template-message">{template.message}</p>

                        <div className="template-details">
                            {template.weekdays && (
                                <div className="detail-item">
                                    <strong>Dias:</strong> {formatWeekdays(template.weekdays)}
                                </div>
                            )}

                            {template.frequency === 'MONTHLY' && template.monthDay && (
                                <div className="detail-item">
                                    <strong>Dia do mês:</strong> {template.monthDay}
                                </div>
                            )}

                            <div className="detail-item">
                                <strong>Execuções:</strong> {template.executionCount}
                                {template.maxExecutions && ` / ${template.maxExecutions}`}
                            </div>

                            {template.category && (
                                <div className="detail-item">
                                    <strong>Categoria:</strong> {template.category}
                                </div>
                            )}

                            {template.tags && (
                                <div className="detail-item">
                                    <strong>Tags:</strong> {template.tags}
                                </div>
                            )}

                            {template.lastExecuted && (
                                <div className="detail-item">
                                    <strong>Última execução:</strong> {new Date(template.lastExecuted).toLocaleString('pt-BR')}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="template-actions">
                        <button
                            className={`action-btn-small ${template.isActive ? 'secondary' : 'primary'}`}
                            onClick={() => handleToggleActive(template)}
                            title={template.isActive ? 'Desativar' : 'Ativar'}
                        >
                            {template.isActive ? '🔴' : '🟢'}
                        </button>

                        <button
                            className="action-btn-small secondary"
                            onClick={() => handleTogglePaused(template)}
                            title={template.isPaused ? 'Despausar' : 'Pausar'}
                            disabled={!template.isActive}
                        >
                            {template.isPaused ? '▶️' : '⏸️'}
                        </button>

                        <button
                            className="action-btn-small secondary"
                            onClick={() => onEdit(template)}
                            title="Editar"
                        >
                            ✏️
                        </button>

                        <button
                            className="action-btn-small danger"
                            onClick={() => handleDelete(template)}
                            title="Deletar"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}