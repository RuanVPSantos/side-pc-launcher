import { useState, useEffect } from 'react';
import { Modal } from '../../components';

interface RecurringNotificationFormData {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    showTime: string;
    weekdays?: string;
    monthDay?: number;
    priority: 1 | 2 | 3;
    category?: string;
    tags?: string;
    maxExecutions?: number;
    isActive: boolean;
    isPaused: boolean;
    nextExecution: string;
}

interface RecurringNotificationFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: RecurringNotificationFormData) => Promise<void>;
    initialData?: Partial<RecurringNotificationFormData>;
    title: string;
}

const WEEKDAYS = [
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' },
    { value: 0, label: 'Dom' }
];

export function RecurringNotificationForm({ isOpen, onClose, onSubmit, initialData, title }: RecurringNotificationFormProps) {
    const [formData, setFormData] = useState<RecurringNotificationFormData>({
        title: '',
        message: '',
        type: 'info',
        frequency: 'DAILY',
        showTime: '09:00',
        weekdays: '',
        monthDay: 1,
        priority: 1,
        category: '',
        tags: '',
        maxExecutions: undefined,
        isActive: true,
        isPaused: false,
        nextExecution: ''
    });
    const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                message: initialData.message || '',
                type: initialData.type || 'info',
                frequency: initialData.frequency || 'DAILY',
                showTime: initialData.showTime || '09:00',
                weekdays: initialData.weekdays || '',
                monthDay: initialData.monthDay || 1,
                priority: initialData.priority || 1,
                category: initialData.category || '',
                tags: initialData.tags || '',
                maxExecutions: initialData.maxExecutions,
                isActive: initialData.isActive !== undefined ? initialData.isActive : true,
                isPaused: initialData.isPaused !== undefined ? initialData.isPaused : false,
                nextExecution: initialData.nextExecution || ''
            });

            // Parse weekdays
            if (initialData.weekdays) {
                const days = initialData.weekdays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
                setSelectedWeekdays(days);
            }
        } else {
            // Reset form
            setFormData({
                title: '',
                message: '',
                type: 'info',
                frequency: 'DAILY',
                showTime: '09:00',
                weekdays: '',
                monthDay: 1,
                priority: 1,
                category: '',
                tags: '',
                maxExecutions: undefined,
                isActive: true,
                isPaused: false,
                nextExecution: ''
            });
            setSelectedWeekdays([]);
        }
    }, [initialData, isOpen]);

    // Calculate next execution based on frequency and time
    useEffect(() => {
        const calculateNextExecution = () => {
            const now = new Date();
            const [hours, minutes] = formData.showTime.split(':').map(Number);

            let nextExec = new Date();
            nextExec.setHours(hours, minutes, 0, 0);

            // If time has passed today, start from tomorrow
            if (nextExec <= now) {
                nextExec.setDate(nextExec.getDate() + 1);
            }

            switch (formData.frequency) {
                case 'DAILY':
                    // For daily, if weekdays are selected, find next valid day
                    if (selectedWeekdays.length > 0) {
                        while (!selectedWeekdays.includes(nextExec.getDay())) {
                            nextExec.setDate(nextExec.getDate() + 1);
                        }
                    }
                    break;

                case 'WEEKLY':
                    // For weekly, find next occurrence of selected weekdays
                    if (selectedWeekdays.length > 0) {
                        const currentDay = nextExec.getDay();
                        const nextValidDay = selectedWeekdays.find(day => day >= currentDay) || selectedWeekdays[0];

                        if (nextValidDay >= currentDay) {
                            nextExec.setDate(nextExec.getDate() + (nextValidDay - currentDay));
                        } else {
                            nextExec.setDate(nextExec.getDate() + (7 - currentDay + nextValidDay));
                        }
                    } else {
                        // Default to next week same day
                        nextExec.setDate(nextExec.getDate() + 7);
                    }
                    break;

                case 'MONTHLY':
                    // For monthly, set to specified day of month
                    nextExec.setDate(formData.monthDay || 1);
                    if (nextExec <= now) {
                        nextExec.setMonth(nextExec.getMonth() + 1);
                        nextExec.setDate(formData.monthDay || 1);
                    }
                    break;
            }

            setFormData(prev => ({
                ...prev,
                nextExecution: nextExec.toISOString()
            }));
        };

        if (formData.showTime) {
            calculateNextExecution();
        }
    }, [formData.frequency, formData.showTime, formData.monthDay, selectedWeekdays]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            alert('Por favor, preencha o título da notificação');
            return;
        }
        if (!formData.message.trim()) {
            alert('Por favor, preencha a mensagem da notificação');
            return;
        }

        try {
            setLoading(true);

            const submitData = {
                ...formData,
                weekdays: selectedWeekdays.length > 0 ? selectedWeekdays.join(',') : undefined,
                executionCount: 0,
                lastExecuted: null
            };

            console.log('📝 Dados do template:', submitData);
            await onSubmit(submitData);
            onClose();
        } catch (error: any) {
            console.error('❌ Erro ao salvar template:', error);
            alert('Erro ao salvar template: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleWeekday = (day: number) => {
        setSelectedWeekdays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day].sort()
        );
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="recurring-notification-form">
                {/* Informações básicas */}
                <div className="form-section">
                    <h4>Informações Básicas</h4>

                    <div className="form-group">
                        <label htmlFor="title">Título</label>
                        <input
                            type="text"
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Digite o título da notificação"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">Mensagem</label>
                        <textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Digite a mensagem da notificação"
                            rows={3}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="type">Tipo</label>
                            <select
                                id="type"
                                value={formData.type}
                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                                style={{ color: getTypeColor(formData.type) }}
                            >
                                <option value="info">Informação</option>
                                <option value="success">Sucesso</option>
                                <option value="warning">Aviso</option>
                                <option value="error">Erro</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="priority">Prioridade</label>
                            <select
                                id="priority"
                                value={formData.priority}
                                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) as any }))}
                            >
                                <option value={1}>Baixa</option>
                                <option value={2}>Média</option>
                                <option value={3}>Alta</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Configurações de frequência */}
                <div className="form-section">
                    <h4>Agendamento</h4>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="frequency">Frequência</label>
                            <select
                                id="frequency"
                                value={formData.frequency}
                                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
                            >
                                <option value="DAILY">Diariamente</option>
                                <option value="WEEKLY">Semanalmente</option>
                                <option value="MONTHLY">Mensalmente</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="showTime">Horário</label>
                            <input
                                type="time"
                                id="showTime"
                                value={formData.showTime}
                                onChange={(e) => setFormData(prev => ({ ...prev, showTime: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    {(formData.frequency === 'DAILY' || formData.frequency === 'WEEKLY') && (
                        <div className="form-group">
                            <label>Dias da Semana</label>
                            <div className="weekdays-selector">
                                {WEEKDAYS.map(day => (
                                    <button
                                        key={day.value}
                                        type="button"
                                        className={`weekday-btn ${selectedWeekdays.includes(day.value) ? 'active' : ''}`}
                                        onClick={() => toggleWeekday(day.value)}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                            <small>Para diário: selecione os dias específicos. Para semanal: selecione o(s) dia(s) da semana.</small>
                        </div>
                    )}

                    {formData.frequency === 'MONTHLY' && (
                        <div className="form-group">
                            <label htmlFor="monthDay">Dia do Mês</label>
                            <input
                                type="number"
                                id="monthDay"
                                min="1"
                                max="31"
                                value={formData.monthDay}
                                onChange={(e) => setFormData(prev => ({ ...prev, monthDay: parseInt(e.target.value) }))}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="maxExecutions">Máximo de Execuções</label>
                        <input
                            type="number"
                            id="maxExecutions"
                            min="1"
                            value={formData.maxExecutions || ''}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                maxExecutions: e.target.value ? parseInt(e.target.value) : undefined
                            }))}
                            placeholder="Deixe vazio para infinito"
                        />
                    </div>
                </div>

                {/* Organização */}
                <div className="form-section">
                    <h4>Organização</h4>

                    <div className="form-group">
                        <label htmlFor="category">Categoria</label>
                        <input
                            type="text"
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            placeholder="Ex: Trabalho, Pessoal, Projeto"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="tags">Tags</label>
                        <input
                            type="text"
                            id="tags"
                            value={formData.tags}
                            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                            placeholder="Separadas por vírgula: tag1, tag2, tag3"
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="form-section">
                    <h4>Status</h4>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                />
                                Ativo
                            </label>
                        </div>

                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.isPaused}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isPaused: e.target.checked }))}
                                />
                                Pausado
                            </label>
                        </div>
                    </div>
                </div>

                {/* Preview da próxima execução */}
                {formData.nextExecution && (
                    <div className="form-section">
                        <h4>Próxima Execução</h4>
                        <div className="next-execution-preview">
                            {new Date(formData.nextExecution).toLocaleString('pt-BR')}
                        </div>
                    </div>
                )}

                <div className="form-actions">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Salvando...' : 'Salvar Template'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}