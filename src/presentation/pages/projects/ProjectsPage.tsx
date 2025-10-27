import { useState } from 'react';
import './projects-page.css';
import '../../styles/forms.css';
import { useProjects } from '../../../services/hooks/useDatabaseSmart';
import { ProjectForm } from '.';

interface ProjectsPageProps {
    onProjectSelect?: (projectId: number) => void;
}

export function ProjectsPage({ onProjectSelect }: ProjectsPageProps) {
    const { projects, loading, error, createProject, updateProject, deleteProject } = useProjects();
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState<any>(null);

    // Estados dos filtros
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [technologyFilter, setTechnologyFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('updatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#00d9ff';
            case 'completed': return '#fff';
            case 'paused': return '#888';
            default: return '#fff';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'ATIVO';
            case 'completed': return 'CONCLUÍDO';
            case 'paused': return 'PAUSADO';
            default: return 'DESCONHECIDO';
        }
    };

    const handleCreateProject = async (data: any) => {
        await createProject(data);
        setShowForm(false);
    };

    const handleEditProject = (project: any) => {
        setEditingProject(project);
        setShowForm(true);
    };

    const handleUpdateProject = async (data: any) => {
        if (editingProject) {
            await updateProject(editingProject.id, data);
            setEditingProject(null);
            setShowForm(false);
        }
    };

    const handleDeleteProject = async (id: number) => {
        if (confirm('Tem certeza que deseja deletar este projeto?')) {
            await deleteProject(id);
        }
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingProject(null);
    };

    // Função para ordenar projetos
    const sortProjects = (projectsToSort: any[]) => {
        return [...projectsToSort].sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'progress':
                    aValue = a.progress;
                    bValue = b.progress;
                    break;
                case 'createdAt':
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                    break;
                case 'updatedAt':
                default:
                    aValue = new Date(a.updatedAt || a.createdAt).getTime();
                    bValue = new Date(b.updatedAt || b.createdAt).getTime();
                    break;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    };

    // Função para filtrar projetos
    const filteredProjects = sortProjects(projects.filter(project => {
        // Filtro por status
        if (statusFilter !== 'all' && project.status !== statusFilter) {
            return false;
        }

        // Filtro por tecnologia
        if (technologyFilter !== 'all') {
            const hasTechnology = project.technologies?.some((tech: any) =>
                (tech.technology?.name || tech.name) === technologyFilter
            ) || false;
            if (!hasTechnology) {
                return false;
            }
        }

        // Filtro por busca de texto
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const matchesName = project.name.toLowerCase().includes(searchLower);
            const matchesDescription = project.description.toLowerCase().includes(searchLower);
            const matchesTechnology = project.technologies?.some((tech: any) =>
                (tech.technology?.name || tech.name || '').toLowerCase().includes(searchLower)
            ) || false;

            if (!matchesName && !matchesDescription && !matchesTechnology) {
                return false;
            }
        }

        return true;
    }));

    // Obter todas as tecnologias únicas (com verificação de segurança)
    const allTechnologies = Array.from(
        new Set(
            projects.flatMap(project =>
                project.technologies?.map((tech: any) => tech.technology?.name || tech.name) || []
            )
        )
    ).filter(Boolean).sort();

    if (loading) {
        return (
            <div className="projects-page">
                <div className="page-header">
                    <h1>PROJETOS</h1>
                </div>
                <div style={{ textAlign: 'center', padding: '40px', color: '#00d9ff' }}>
                    Carregando projetos...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="projects-page">
                <div className="page-header">
                    <h1>PROJETOS</h1>
                </div>
                <div style={{ textAlign: 'center', padding: '40px', color: '#ff4444' }}>
                    Erro: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="projects-page">
            <div className="page-header">
                <h1>PROJETOS</h1>
                <div className="projects-stats">
                    <div className="stat-item">
                        <span className="stat-label">TOTAL</span>
                        <span className="stat-value">{projects.length}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">ATIVOS</span>
                        <span className="stat-value">{projects.filter(p => p.status === 'active').length}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">CONCLUÍDOS</span>
                        <span className="stat-value">{projects.filter(p => p.status === 'completed').length}</span>
                    </div>
                </div>
            </div>

            <div className="projects-actions">
                <button
                    className="action-btn primary"
                    onClick={() => setShowForm(true)}
                >
                    NOVO PROJETO
                </button>
            </div>

            <div className="projects-filters">
                <div className="filter-group">
                    <label>BUSCAR:</label>
                    <input
                        type="text"
                        placeholder="Nome, descrição ou tecnologia..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filter-group">
                    <label>STATUS:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">TODOS</option>
                        <option value="active">ATIVO</option>
                        <option value="completed">CONCLUÍDO</option>
                        <option value="paused">PAUSADO</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>TECNOLOGIA:</label>
                    <select
                        value={technologyFilter}
                        onChange={(e) => setTechnologyFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">TODAS</option>
                        {allTechnologies.map(tech => (
                            <option key={tech} value={tech}>{tech}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>ORDENAR POR:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                    >
                        <option value="updatedAt">ÚLTIMA ATUALIZAÇÃO</option>
                        <option value="createdAt">DATA DE CRIAÇÃO</option>
                        <option value="name">NOME</option>
                        <option value="status">STATUS</option>
                        <option value="progress">PROGRESSO</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>ORDEM:</label>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                        className="filter-select"
                    >
                        <option value="desc">DECRESCENTE</option>
                        <option value="asc">CRESCENTE</option>
                    </select>
                </div>

                <div className="filter-results">
                    <span>{filteredProjects.length} de {projects.length} projetos</span>
                </div>
            </div>

            <div className="projects-grid">
                {filteredProjects.map((project) => (
                    <div
                        key={project.id}
                        className="project-card"
                        onClick={() => onProjectSelect?.(project.id)}
                        style={{ cursor: onProjectSelect ? 'pointer' : 'default' }}
                    >
                        <div className="project-header">
                            <h3 className="project-name">{project.name}</h3>
                            <div
                                className="project-status"
                                style={{ color: getStatusColor(project.status) }}
                            >
                                {getStatusText(project.status)}
                            </div>
                        </div>

                        <p className="project-description">{project.description}</p>

                        <div className="project-progress">
                            <div className="progress-label">PROGRESSO: {project.progress}%</div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="project-tech">
                            <div className="tech-label">TECNOLOGIAS:</div>
                            <div className="tech-tags">
                                {(project.technologies || []).map((tech: any, index: number) => (
                                    <span key={index} className="tech-tag">{tech.technology?.name || tech.name || 'N/A'}</span>
                                ))}
                            </div>
                        </div>

                        <div className="project-actions">
                            <button
                                className="project-btn edit"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditProject(project);
                                }}
                            >
                                EDITAR
                            </button>
                            <button
                                className="project-btn delete"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProject(project.id);
                                }}
                            >
                                DELETAR
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <ProjectForm
                isOpen={showForm}
                onClose={handleCloseForm}
                onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
                initialData={editingProject ? {
                    name: editingProject.name,
                    description: editingProject.description,
                    status: editingProject.status,
                    progress: editingProject.progress,
                    technologies: (editingProject.technologies || []).map((t: any) => t.technology?.name || t.name || '')
                } : undefined}
                title={editingProject ? 'EDITAR PROJETO' : 'NOVO PROJETO'}
            />
        </div>
    );
}