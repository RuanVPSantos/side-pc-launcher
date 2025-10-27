import { useState, useEffect } from 'react';
import { Modal } from '../../components';

interface SmartNotificationFormData {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    frequency: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    showTime: string;
    weekdays: number[];
    monthDay: number;
    priority: 1 | 2 | 3;
    category: string;
    tags: string[];
    maxShows: number | null;
}

interface SmartNotificationFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SmartNotificationFormData) => Promise<void>;
    initialData?: Partial<SmartNotificationFormData>;
    title: string;
}

const WEEKDAYS = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' }
];

export function SmartNotificationForm({ isOpen, onClose, onSubmit, initialData, title }: SmartNotificationFormProps) {
    const [formData, setFormData] = useState<SmartNotificationFormData>({
        title: '',
        message: '',
        type: 'info',
        frequency: 'ONCE',
        showTime: '09:00',
        weekdays: [],
        monthDay: 1,
        priority: 1,
        category: '',
        tags: [],
        maxShows: null
    });
    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                message: initialData.message || '',
                type: initialData.type || 'info',
                frequency: initialData.frequency || 'ONCE',
                showTime: initialData.showTime || '09:00',
                weekdays: initialData.weekdays || [],
                monthDay: initialData.monthDay || 1,
                priority: initialData.priority || 1,
                category: initialData.category || '',
                tags: initialData.tags || [],
                maxShows: initialData.maxShows || null
            });
        } else {
            setFormData({
                title: '',
                message: '',
                type: 'info',
                frequency: 'ONCE',
                showTime: '09:00',
                weekdays: [],
                monthDay: 1,
                priority: 1,
                category: '',
                tags: [],
                maxShows: null
            });
        }
    }, [initialData, isOpen]);

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
            console.log('📝 Dados do formulário:', formData);
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('❌ Erro ao salvar notificação:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            alert('Erro ao salvar notificação: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    const toggleWeekday = (day: number) => {
        setFormData(prev => ({
            ...prev,
            weekdays: prev.weekdays.includes(day)
                ? prev.weekdays.filter(d => d !== day)
                : [...prev.weekdays, day].sort()
        }));
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

    const getPriorityLabel = (priority: number) => {
        switch (priority) {
            case 1: return 'Baixa';
            case 2: return 'Média';
            case 3: return 'Alta';
            default: return 'Baixa';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="smart-notification-form">
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
                    <h4>Frequência</h4>

                    <div className="form-group">
                        <label htmlFor="frequency">Repetir</label>
                        <select
                            id="frequency"
                            value={formData.frequency}
                            onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
                        >
                            <option value="ONCE">Uma vez</option>
                            <option value="DAILY">Diariamente</option>
                            <option value="WEEKLY">Semanalmente</option>
                            <option value="MONTHLY">Mensalmente</option>
                        </select>
                    </div>

                    {formData.frequency !== 'ONCE' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="showTime">Horário</label>
                                <input
                                    type="time"
                                    id="showTime"
                                    value={formData.showTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, showTime: e.target.value }))}
                                />
                            </div>

                            {(formData.frequency === 'DAILY' || formData.frequency === 'WEEKLY') && (
                                <div className="form-group">
                                    <label>Dias da Semana</label>
                                    <div className="weekdays-selector">
                                        {WEEKDAYS.map(day => (
                                            <button
                                                key={day.value}
                                                type="button"
                                                className={`weekday-btn ${formData.weekdays.includes(day.value) ? 'active' : ''}`}
                                                onClick={() => toggleWeekday(day.value)}
                                            >
                                                {day.label}
                                            </button>
                                        ))}
                                    </div>
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
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="maxShows">Máximo de Exibições</label>
                                <input
                                    type="number"
                                    id="maxShows"
                                    min="1"
                                    value={formData.maxShows || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        maxShows: e.target.value ? parseInt(e.target.value) : null
                                    }))}
                                    placeholder="Deixe vazio para infinito"
                                />
                            </div>
                        </>
                    )}
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
                        <label>Tags</label>
                        <div className="tag-input-container">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                placeholder="Digite uma tag e pressione Enter"
                            />
                            <button type="button" onClick={addTag} className="add-tag-btn">
                                Adicionar
                            </button>
                        </div>
                        <div className="tags-list">
                            {formData.tags.map((tag, index) => (
                                <span key={index} className="tag-item">
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="remove-tag"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}