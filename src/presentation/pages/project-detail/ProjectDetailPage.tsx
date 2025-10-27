import { useState, useEffect } from 'react';
import './project-detail.css';
import '../../styles/forms.css';
import { useProjectDetail } from '../../../services/hooks/useDatabaseSmart';
import { useEventReminders } from '../../../services/hooks/useEventReminders';

interface ProjectDetailProps {
    projectId: number;
    onBack: () => void;
}

interface ProjectDetail {
    id: number;
    name: string;
    description: string;
    status: string;
    progress: number;
    githubUrl?: string;
    technologies: { technology: { name: string } }[];
    comments: { id: number; content: string; createdAt: Date }[];
    folders: { id: number; path: string; createdAt: Date }[];
    links: { id: number; name: string; url: string; createdAt: Date }[];
    focusDates: { id: number; startDate: Date; endDate: Date }[];
}

export function ProjectDetailPage({ projectId, onBack }: ProjectDetailProps) {
    const { project, loading, error, loadProject, addComment, addFolder, addLink, addFocusDate, updateProject, deleteComment, deleteFolder, updateFolder, deleteLink, deleteFocusDate } = useProjectDetail(projectId);
    const { reminders, loading: remindersLoading, createForEvent, deleteByEvent } = useEventReminders();
    const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'folders' | 'links' | 'calendar'>('overview');

    console.log('🔍 ProjectDetailPage:', { projectId, project, loading, error });

    // Estados para formulários
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [showFolderForm, setShowFolderForm] = useState(false);
    const [showLinkForm, setShowLinkForm] = useState(false);
    const [showCalendarForm, setShowCalendarForm] = useState(false);
    const [editingProgress, setEditingProgress] = useState(false);
    const [editingStatus, setEditingStatus] = useState(false);
    const [editingFolder, setEditingFolder] = useState<{ id: number; name: string; path: string } | null>(null);

    // Estados dos formulários
    const [newComment, setNewComment] = useState('');
    const [newFolder, setNewFolder] = useState({ name: '', path: '' });
    const [newLink, setNewLink] = useState({ name: '', url: '' });
    const [newFocusDate, setNewFocusDate] = useState({ startDate: '', endDate: '' });
    const [tempProgress, setTempProgress] = useState(0);
    const [tempStatus, setTempStatus] = useState('');

    useEffect(() => {
        if (project) {
            setTempProgress(project.progress);
            setTempStatus(project.status);
        }
    }, [project]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            await addComment(newComment);
            setNewComment('');
            setShowCommentForm(false);
        } catch (error) {
            console.error('Erro ao adicionar comentário:', error);
        }
    };

    const handleAddFolder = async () => {
        if (!newFolder.name.trim() || !newFolder.path.trim()) return;
        try {
            await addFolder(newFolder.name, newFolder.path);
            setNewFolder({ name: '', path: '' });
            setShowFolderForm(false);
        } catch (error) {
            console.error('Erro ao adicionar pasta:', error);
        }
    };

    const handleEditFolder = async () => {
        if (!editingFolder || !editingFolder.name.trim() || !editingFolder.path.trim()) return;
        try {
            await updateFolder(editingFolder.id, editingFolder.name, editingFolder.path);
            setEditingFolder(null);
        } catch (error) {
            console.error('Erro ao editar pasta:', error);
        }
    };

    const handleAddLink = async () => {
        if (!newLink.name.trim() || !newLink.url.trim()) return;
        try {
            await addLink(newLink.name, newLink.url);
            setNewLink({ name: '', url: '' });
            setShowLinkForm(false);
        } catch (error) {
            console.error('Erro ao adicionar link:', error);
        }
    };

    const handleAddFocusDate = async () => {
        if (!newFocusDate.startDate || !newFocusDate.endDate) return;
        try {
            await addFocusDate(newFocusDate.startDate, newFocusDate.endDate);
            setNewFocusDate({ startDate: '', endDate: '' });
            setShowCalendarForm(false);
        } catch (error) {
            console.error('Erro ao adicionar período de foco:', error);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (confirm('Tem certeza que deseja deletar este comentário?')) {
            try {
                console.log('🗑️ Deletando comentário:', commentId);
                await deleteComment(commentId);
                console.log('✅ Comentário deletado com sucesso!');
            } catch (error) {
                console.error('❌ Erro ao deletar comentário:', error);
                alert('Erro ao deletar comentário. Tente novamente.');
            }
        }
    };

    const handleDeleteFolder = async (folderId: number) => {
        if (confirm('Tem certeza que deseja remover esta pasta?')) {
            try {
                console.log('🗑️ Deletando pasta:', folderId);
                await deleteFolder(folderId);
                console.log('✅ Pasta deletada com sucesso!');
            } catch (error) {
                console.error('❌ Erro ao deletar pasta:', error);
                alert('Erro ao deletar pasta. Tente novamente.');
            }
        }
    };

    const handleDeleteLink = async (linkId: number) => {
        if (confirm('Tem certeza que deseja deletar este link?')) {
            try {
                console.log('🗑️ Deletando link:', linkId);
                await deleteLink(linkId);
                console.log('✅ Link deletado com sucesso!');
            } catch (error) {
                console.error('❌ Erro ao deletar link:', error);
                alert('Erro ao deletar link. Tente novamente.');
            }
        }
    };

    const handleDeleteFocusDate = async (focusDateId: number) => {
        if (confirm('Tem certeza que deseja deletar este período?')) {
            try {
                console.log('🗑️ Deletando período de foco:', focusDateId);
                await deleteFocusDate(focusDateId);
                console.log('✅ Período de foco deletado com sucesso!');
            } catch (error) {
                console.error('❌ Erro ao deletar período de foco:', error);
                alert('Erro ao deletar período de foco. Tente novamente.');
            }
        }
    };

    const handleSaveProgress = async () => {
        try {
            console.log('Salvando progresso:', tempProgress);
            await updateProject({ progress: tempProgress });
            setEditingProgress(false);
            console.log('✅ Progresso salvo com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao salvar progresso:', error);
            // Reverter para o valor original em caso de erro
            setTempProgress(project?.progress || 0);
        }
    };

    const handleSaveStatus = async () => {
        try {
            console.log('Salvando status:', tempStatus);
            await updateProject({ status: tempStatus });
            setEditingStatus(false);
            console.log('✅ Status salvo com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao salvar status:', error);
            // Reverter para o valor original em caso de erro
            setTempStatus(project?.status || 'active');
        }
    };

    const openFolder = async (path: string) => {
        try {
            console.log('📂 Abrindo pasta:', path);
            if (typeof window !== 'undefined' && window.electronAPI) {
                const result = await window.electronAPI.invoke('system:openFolder', path);
                if (result.success) {
                    console.log('✅ Pasta aberta com sucesso:', result.method);
                } else {
                    console.error('❌ Erro ao abrir pasta:', result.error);
                    alert('Erro ao abrir pasta: ' + result.error);
                }
            } else {
                console.error('❌ Electron API não disponível');
                alert('Funcionalidade não disponível neste ambiente');
            }
        } catch (error) {
            console.error('❌ Erro ao abrir pasta:', error);
            alert('Erro ao abrir pasta');
        }
    };

    const openLink = async (url: string) => {
        try {
            console.log('🔗 Tentando abrir link:', url);

            if (typeof window !== 'undefined' && window.electronAPI) {
                const result = await window.electronAPI.invoke('system:openUrl', url);

                if (result.success) {
                    console.log('✅ Link aberto com sucesso (via shell.openExternal)');
                } else {
                    console.error('❌ Erro ao abrir link:', result.error);
                    alert('Erro ao abrir link: ' + result.error);
                }
            } else {
                console.warn('⚠️ Electron API não disponível, abrindo no navegador padrão...');
                window.open(url, '_blank');
            }
        } catch (error) {
            console.error('❌ Erro inesperado ao abrir link:', error);
            window.open(url, '_blank');
        }
    };


    if (loading) {
        return (
            <div className="project-detail-page">
                <div className="loading">Carregando projeto...</div>
            </div>
        );
    }

    if (!project && !loading) {
        return (
            <div className="project-detail-page">
                <div className="project-not-found">
                    <div className="error-content">
                        <h2>Projeto não encontrado</h2>
                        <p>Este projeto pode ter sido deletado ou não existe mais.</p>
                        <button
                            className="back-to-projects-btn"
                            onClick={onBack}
                        >
                            ← VOLTAR PARA PROJETOS
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="project-detail-page">
            <div className="project-detail-header">
                <button className="back-btn" onClick={onBack}>
                    ← Voltar
                </button>
                <div className="project-info">
                    <h1 className="project-title">{project.name}</h1>
                    <div className="project-meta">
                        <div className="status-section">
                            {!editingStatus ? (
                                <div className="status-display">
                                    <span className={`project-status ${project.status}`}>
                                        {project.status === 'active' ? 'ATIVO' :
                                            project.status === 'completed' ? 'CONCLUÍDO' :
                                                project.status === 'paused' ? 'PAUSADO' :
                                                    project.status.toUpperCase()}
                                    </span>
                                    <button
                                        className="edit-status-btn"
                                        onClick={() => setEditingStatus(true)}
                                        title="Editar status"
                                    >
                                        ✏️
                                    </button>
                                </div>
                            ) : (
                                <div className="status-editor">
                                    <select
                                        value={tempStatus}
                                        onChange={(e) => setTempStatus(e.target.value)}
                                        className="status-select"
                                    >
                                        <option value="active">ATIVO</option>
                                        <option value="completed">CONCLUÍDO</option>
                                        <option value="paused">PAUSADO</option>
                                    </select>
                                    <div className="status-actions">
                                        <button
                                            className="save-status-btn"
                                            onClick={handleSaveStatus}
                                        >
                                            ✓
                                        </button>
                                        <button
                                            className="cancel-status-btn"
                                            onClick={() => {
                                                setTempStatus(project.status);
                                                setEditingStatus(false);
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <span className="project-progress">{project.progress}%</span>
                    </div>
                </div>
            </div>

            <div className="project-tabs">
                <button
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    VISÃO GERAL
                </button>
                <button
                    className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('comments')}
                >
                    COMENTÁRIOS ({project.comments?.length || 0})
                </button>
                <button
                    className={`tab ${activeTab === 'folders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('folders')}
                >
                    PASTAS ({project.folders?.length || 0})
                </button>
                <button
                    className={`tab ${activeTab === 'links' ? 'active' : ''}`}
                    onClick={() => setActiveTab('links')}
                >
                    LINKS ({project.links?.length || 0})
                </button>
                <button
                    className={`tab ${activeTab === 'calendar' ? 'active' : ''}`}
                    onClick={() => setActiveTab('calendar')}
                >
                    CRONOGRAMA ({project.focusDates?.length || 0})
                </button>
            </div>

            <div className="project-content">
                {activeTab === 'overview' && (
                    <div className="overview-tab">
                        <div className="project-description">
                            <h3>DESCRIÇÃO</h3>
                            <p>{project.description}</p>
                        </div>

                        <div className="project-technologies">
                            <h3>TECNOLOGIAS</h3>
                            <div className="tech-tags">
                                {project.technologies && project.technologies.length > 0 ? (
                                    project.technologies.map((tech: any, index: number) => (
                                        <span key={index} className="tech-tag">{tech.technology.name}</span>
                                    ))
                                ) : (
                                    <span className="no-tech">Nenhuma tecnologia definida</span>
                                )}
                            </div>
                        </div>

                        {project.githubUrl && (
                            <div className="project-github">
                                <h3>REPOSITÓRIO</h3>
                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                    {project.githubUrl}
                                </a>
                            </div>
                        )}

                        <div className="project-progress-section">
                            <div className="progress-header">
                                <h3>PROGRESSO</h3>
                                {!editingProgress ? (
                                    <button
                                        className="edit-progress-btn"
                                        onClick={() => setEditingProgress(true)}
                                    >
                                        EDITAR
                                    </button>
                                ) : (
                                    <div className="progress-actions">
                                        <button
                                            className="save-progress-btn"
                                            onClick={handleSaveProgress}
                                        >
                                            SALVAR
                                        </button>
                                        <button
                                            className="cancel-progress-btn"
                                            onClick={() => {
                                                setTempProgress(project.progress);
                                                setEditingProgress(false);
                                            }}
                                        >
                                            CANCELAR
                                        </button>
                                    </div>
                                )}
                            </div>

                            {editingProgress ? (
                                <div className="progress-editor">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={tempProgress}
                                        onChange={(e) => setTempProgress(parseInt(e.target.value))}
                                        className="progress-slider"
                                    />
                                    <span className="progress-value">{tempProgress}%</span>
                                </div>
                            ) : (
                                <div className="progress-display">
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                    <span className="progress-text">{project.progress}%</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'comments' && (
                    <div className="comments-tab">
                        <div className="tab-header">
                            <h3>COMENTÁRIOS</h3>
                            <button
                                className="project-add-btn"
                                onClick={() => setShowCommentForm(true)}
                            >
                                ADICIONAR COMENTÁRIO
                            </button>
                        </div>

                        {showCommentForm && (
                            <div className="comment-form">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Digite seu comentário..."
                                    rows={3}
                                />
                                <div className="form-actions">
                                    <button
                                        className="cancel-btn"
                                        onClick={() => setShowCommentForm(false)}
                                    >
                                        CANCELAR
                                    </button>
                                    <button
                                        className="primary-btn"
                                        onClick={handleAddComment}
                                    >
                                        ADICIONAR
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="comments-list">
                            {(project.comments || []).map((comment: any) => (
                                <div key={comment.id} className="comment-item">
                                    <div className="comment-main">
                                        <div className="comment-content">{comment.content}</div>
                                        <div className="comment-date">
                                            {comment.createdAt.toLocaleDateString()}
                                        </div>
                                    </div>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteComment(comment.id)}
                                        title="Deletar comentário"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'folders' && (
                    <div className="folders-tab">
                        <div className="tab-header">
                            <h3>PASTAS DO PROJETO</h3>
                            <button
                                className="add-btn"
                                onClick={() => setShowFolderForm(true)}
                            >
                                ADICIONAR PASTA
                            </button>
                        </div>

                        {showFolderForm && (
                            <div className="folder-form">
                                <input
                                    type="text"
                                    value={newFolder.name}
                                    onChange={(e) => setNewFolder(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Nome da pasta..."
                                />
                                <input
                                    type="text"
                                    value={newFolder.path}
                                    onChange={(e) => setNewFolder(prev => ({ ...prev, path: e.target.value }))}
                                    placeholder="Caminho da pasta..."
                                />
                                <div className="form-actions">
                                    <button
                                        className="cancel-btn"
                                        onClick={() => setShowFolderForm(false)}
                                    >
                                        CANCELAR
                                    </button>
                                    <button
                                        className="primary-btn"
                                        onClick={handleAddFolder}
                                    >
                                        ADICIONAR
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="folders-list">
                            {(project.folders || []).map((folder: any) => (
                                <div key={folder.id} className="folder-item">
                                    {editingFolder && editingFolder.id === folder.id ? (
                                        <div className="folder-edit-form">
                                            <input
                                                type="text"
                                                value={editingFolder.name}
                                                onChange={(e) => setEditingFolder(prev => prev ? { ...prev, name: e.target.value } : null)}
                                                placeholder="Nome da pasta..."
                                            />
                                            <input
                                                type="text"
                                                value={editingFolder.path}
                                                onChange={(e) => setEditingFolder(prev => prev ? { ...prev, path: e.target.value } : null)}
                                                placeholder="Caminho da pasta..."
                                            />
                                            <div className="edit-actions">
                                                <button
                                                    className="save-btn"
                                                    onClick={handleEditFolder}
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    className="cancel-btn"
                                                    onClick={() => setEditingFolder(null)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="folder-info">
                                                <div className="folder-name">{folder.name || 'Pasta'}</div>
                                                <div className="folder-path">{folder.path}</div>
                                            </div>
                                            <div className="folder-actions">
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => setEditingFolder({ id: folder.id, name: folder.name || 'Pasta', path: folder.path })}
                                                    title="Editar pasta"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="open-folder-btn"
                                                    onClick={() => openFolder(folder.path)}
                                                >
                                                    ABRIR
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDeleteFolder(folder.id)}
                                                    title="Remover pasta"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'links' && (
                    <div className="links-tab">
                        <div className="tab-header">
                            <h3>LINKS ÚTEIS</h3>
                            <button
                                className="add-btn"
                                onClick={() => setShowLinkForm(true)}
                            >
                                ADICIONAR LINK
                            </button>
                        </div>

                        {showLinkForm && (
                            <div className="link-form">
                                <input
                                    type="text"
                                    value={newLink.name}
                                    onChange={(e) => setNewLink(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Nome do link..."
                                />
                                <input
                                    type="url"
                                    value={newLink.url}
                                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                                    placeholder="URL do link..."
                                />
                                <div className="form-actions">
                                    <button
                                        className="cancel-btn"
                                        onClick={() => setShowLinkForm(false)}
                                    >
                                        CANCELAR
                                    </button>
                                    <button
                                        className="primary-btn"
                                        onClick={handleAddLink}
                                    >
                                        ADICIONAR
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="links-list">
                            {(project.links || []).map((link: any) => (
                                <div key={link.id} className="link-item">
                                    <div className="link-info">
                                        <div className="link-name">{link.name}</div>
                                        <div className="link-url">{link.url}</div>
                                    </div>
                                    <div className="link-actions">
                                        <button
                                            className="open-link-btn"
                                            onClick={() => openLink(link.url)}
                                        >
                                            ABRIR
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDeleteLink(link.id)}
                                            title="Deletar link"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'calendar' && (
                    <div className="calendar-tab">
                        <div className="tab-header">
                            <h3>CRONOGRAMA DE FOCO</h3>
                            <button
                                className="add-btn"
                                onClick={() => setShowCalendarForm(true)}
                            >
                                ADICIONAR PERÍODO
                            </button>
                        </div>

                        {showCalendarForm && (
                            <div className="calendar-form">
                                <div className="date-inputs">
                                    <div className="form-group">
                                        <label>Data Início</label>
                                        <input
                                            type="date"
                                            value={newFocusDate.startDate}
                                            onChange={(e) => setNewFocusDate(prev => ({ ...prev, startDate: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Data Fim</label>
                                        <input
                                            type="date"
                                            value={newFocusDate.endDate}
                                            onChange={(e) => setNewFocusDate(prev => ({ ...prev, endDate: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button
                                        className="cancel-btn"
                                        onClick={() => setShowCalendarForm(false)}
                                    >
                                        CANCELAR
                                    </button>
                                    <button
                                        className="primary-btn"
                                        onClick={handleAddFocusDate}
                                    >
                                        ADICIONAR
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="calendar-list">
                            {(project.focusDates || []).map((focusDate: any) => (
                                <div key={focusDate.id} className="calendar-item">
                                    <div className="calendar-info">
                                        <div className="date-range">
                                            <span className="start-date">
                                                {focusDate.startDate.toLocaleDateString()}
                                            </span>
                                            <span className="date-separator">→</span>
                                            <span className="end-date">
                                                {focusDate.endDate.toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="date-duration">
                                            {Math.ceil((focusDate.endDate.getTime() - focusDate.startDate.getTime()) / (1000 * 60 * 60 * 24))} dias
                                        </div>
                                    </div>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteFocusDate(focusDate.id)}
                                        title="Deletar período"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Seção de Lembretes de Eventos */}
                        <div className="event-reminders-section">
                            <div className="section-header">
                                <h4>LEMBRETES DE EVENTOS</h4>
                                <button
                                    className="create-reminders-btn"
                                    onClick={async () => {
                                        try {
                                            if (project && project.focusDates && project.focusDates.length > 0) {
                                                for (const focusDate of project.focusDates) {
                                                    await createForEvent(
                                                        focusDate.id,
                                                        `${project.name} - Período de Foco`,
                                                        focusDate.startDate,
                                                        focusDate.endDate
                                                    );
                                                }
                                                alert('✅ Lembretes criados para todos os períodos de foco!');
                                            } else {
                                                alert('⚠️ Nenhum período de foco encontrado para criar lembretes.');
                                            }
                                        } catch (error) {
                                            console.error('❌ Erro ao criar lembretes:', error);
                                            alert('❌ Erro ao criar lembretes');
                                        }
                                    }}
                                >
                                    CRIAR LEMBRETES
                                </button>
                            </div>

                            {remindersLoading ? (
                                <div className="loading-reminders">Carregando lembretes...</div>
                            ) : (
                                <div className="reminders-list">
                                    {reminders
                                        .filter(reminder => {
                                            // Filtrar lembretes relacionados aos períodos de foco deste projeto
                                            return project?.focusDates?.some((focusDate: any) => focusDate.id === reminder.eventId);
                                        })
                                        .map((reminder: any) => (
                                            <div key={reminder.id} className="reminder-item">
                                                <div className="reminder-info">
                                                    <div className="reminder-title">{reminder.eventName}</div>
                                                    <div className="reminder-details">
                                                        <span className="reminder-type">
                                                            {reminder.reminderType === 'start' ? '🟢 Início' : '🔴 Fim'}
                                                        </span>
                                                        <span className="reminder-date">
                                                            {new Date(reminder.triggerDate).toLocaleDateString('pt-BR')}
                                                        </span>
                                                        <span className="reminder-status">
                                                            {reminder.isProcessed ? '✅ Processado' : '⏳ Pendente'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    className="delete-reminder-btn"
                                                    onClick={async () => {
                                                        try {
                                                            await deleteByEvent(reminder.eventId);
                                                            alert('✅ Lembretes do evento removidos!');
                                                        } catch (error) {
                                                            console.error('❌ Erro ao deletar lembretes:', error);
                                                            alert('❌ Erro ao deletar lembretes');
                                                        }
                                                    }}
                                                    title="Deletar lembretes deste evento"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        ))}

                                    {reminders.filter(reminder =>
                                        project?.focusDates?.some((focusDate: any) => focusDate.id === reminder.eventId)
                                    ).length === 0 && (
                                            <div className="no-reminders">
                                                📅 Nenhum lembrete criado ainda. Clique em "CRIAR LEMBRETES" para gerar lembretes automáticos dos períodos de foco.
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}