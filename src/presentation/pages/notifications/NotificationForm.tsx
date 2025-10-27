import { useState, useEffect } from 'react';
import { Modal } from '../../components';

interface NotificationFormData {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
}

interface NotificationFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: NotificationFormData) => Promise<void>;
    initialData?: Partial<NotificationFormData>;
    title: string;
}

export function NotificationForm({ isOpen, onClose, onSubmit, initialData, title }: NotificationFormProps) {
    const [formData, setFormData] = useState<NotificationFormData>({
        title: '',
        message: '',
        type: 'info'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                message: initialData.message || '',
                type: initialData.type || 'info'
            });
        } else {
            setFormData({
                title: '',
                message: '',
                type: 'info'
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.message.trim()) return;

        try {
            setLoading(true);
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Erro ao salvar notificação:', error);
        } finally {
            setLoading(false);
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="notification-form">
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
                        rows={4}
                        required
                    />
                </div>

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