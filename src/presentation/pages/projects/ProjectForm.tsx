import { useState, useEffect } from 'react';
import { Modal } from '../../components';

interface ProjectFormData {
    name: string;
    description: string;
    status: 'active' | 'completed' | 'paused';
    progress: number;
    technologies: string[];
}

interface ProjectFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProjectFormData) => Promise<void>;
    initialData?: Partial<ProjectFormData>;
    title: string;
}

export function ProjectForm({ isOpen, onClose, onSubmit, initialData, title }: ProjectFormProps) {
    const [formData, setFormData] = useState<ProjectFormData>({
        name: '',
        description: '',
        status: 'active',
        progress: 0,
        technologies: []
    });
    const [techInput, setTechInput] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                status: initialData.status || 'active',
                progress: initialData.progress || 0,
                technologies: initialData.technologies || []
            });
        } else {
            setFormData({
                name: '',
                description: '',
                status: 'active',
                progress: 0,
                technologies: []
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            setLoading(true);
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Erro ao salvar projeto:', error);
        } finally {
            setLoading(false);
        }
    };

    const addTechnology = () => {
        if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
            setFormData(prev => ({
                ...prev,
                technologies: [...prev.technologies, techInput.trim()]
            }));
            setTechInput('');
        }
    };

    const removeTechnology = (tech: string) => {
        setFormData(prev => ({
            ...prev,
            technologies: prev.technologies.filter(t => t !== tech)
        }));
    };

    const handleTechKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTechnology();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="project-form">
                <div className="form-group">
                    <label htmlFor="name">Nome do Projeto</label>
                    <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Digite o nome do projeto"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Descrição</label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descreva o projeto"
                        rows={3}
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            value={formData.status}
                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        >
                            <option value="active">Ativo</option>
                            <option value="paused">Pausado</option>
                            <option value="completed">Concluído</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="progress">Progresso (%)</label>
                        <input
                            type="number"
                            id="progress"
                            min="0"
                            max="100"
                            value={formData.progress}
                            onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Tecnologias</label>
                    <div className="tech-input-container">
                        <input
                            type="text"
                            value={techInput}
                            onChange={(e) => setTechInput(e.target.value)}
                            onKeyPress={handleTechKeyPress}
                            placeholder="Digite uma tecnologia e pressione Enter"
                        />
                        <button type="button" onClick={addTechnology} className="add-tech-btn">
                            Adicionar
                        </button>
                    </div>
                    <div className="tech-tags">
                        {formData.technologies.map((tech, index) => (
                            <span key={index} className="tech-tag">
                                {tech}
                                <button
                                    type="button"
                                    onClick={() => removeTechnology(tech)}
                                    className="remove-tech"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
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