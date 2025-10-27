import { useState } from 'react';
import { useProjectDetail } from '../../../services/hooks/useDatabaseSmart';

interface ProjectDetailProps {
    projectId: number;
    onBack: () => void;
}

export function ProjectDetailPage({ projectId, onBack }: ProjectDetailProps) {
    const { project, addComment, addFolder, addLink, addFocusDate } = useProjectDetail(projectId);
    const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'folders' | 'links' | 'calendar'>('overview');

    // Estados para formulários
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [showFolderForm, setShowFolderForm] = useState(false);
    const [showLinkForm, setShowLinkForm] = useState(false);
    const [showCalendarForm, setShowCalendarForm] = useState(false);

    // Estados dos formulários
    const [newComment, setNewComment] = useState('');
    const [newFolder, setNewFolder] = useState({ name: '', path: '' });
    const [newLink, setNewLink] = useState({ name: '', url: '' });
    const [newFocusDate, setNewFocusDate] = useState({ startDate: '', endDate: '' });

    if (!project) {
        return (
            <div className="project-detail-page">
                <div className="loading">Carregando projeto...</div>
            </div>
        );
    }

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        await addComment(newComment);
        setNewComment('');
        setShowCommentForm(false);
    };

    const handleAddFolder = async () => {
        if (!newFolder.name.trim() || !newFolder.path.trim()) return;
        await addFolder(newFolder.name, newFolder.path);
        setNewFolder({ name: '', path: '' });
        setShowFolderForm(false);
    };

    const handleAddLink = async () => {
        if (!newLink.name.trim() || !newLink.url.trim()) return;
        await addLink(newLink.name, newLink.url);
        setNewLink({ name: '', url: '' });
        setShowLinkForm(false);
    };

    const handleAddFocusDate = async () => {
        if (!newFocusDate.startDate || !newFocusDate.endDate) return;
        await addFocusDate(newFocusDate.startDate, newFocusDate.endDate);
        setNewFocusDate({ startDate: '', endDate: '' });
        setShowCalendarForm(false);
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
            console.log('🔗 Abrindo link:', url);
            if (typeof window !== 'undefined' && window.electronAPI) {
                const result = await window.electronAPI.invoke('system:openUrl', url);
                if (result.success) {
                    console.log('✅ Link aberto com sucesso');
                } else {
                    console.error('❌ Erro ao abrir link:', result.error);
                    // Fallback para window.open se o IPC falhar
                    window.open(url, '_blank');
                }
            } else {
                console.error('❌ Electron API não disponível, usando fallback');
                window.open(url, '_blank');
            }
        } catch (error) {
            console.error('❌ Erro ao abrir link:', error);
            // Fallback para window.open
            window.open(url, '_blank');
        }
    };

    return (
        <div className="project-detail-page">
            <div className="project-detail-header">
                <button className="back-btn" onClick={onBack}>
                    ← Voltar
                </button>
                <div className="project-info">
                    <h1 className="project-title">{project.name}</h1>
                    <div className="project-meta">
                        <span className={`project-status ${project.status}`}>
                            {project.status.toUpperCase()}
                        </span>
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
                    COMENTÁRIOS ({project.ProjectComment.length})
                </button>
                <button
                    className={`tab ${activeTab === 'folders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('folders')}
                >
                    PASTAS ({project.ProjectFolder.length})
                </button>
                <button
                    className={`tab ${activeTab === 'links' ? 'active' : ''}`}
                    onClick={() => setActiveTab('links')}
                >
                    LINKS ({project.ProjectUsefullLink.length})
                </button>
                <button
                    className={`tab ${activeTab === 'calendar' ? 'active' : ''}`}
                    onClick={() => setActiveTab('calendar')}
                >
                    CRONOGRAMA ({project.DateFocus.length})
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
                                {project.technologies.map((tech: any, index: number) => (
                                    <span key={index} className="tech-tag">{tech.technology.name}</span>
                                ))}
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
                            <h3>PROGRESSO</h3>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>
                            <span className="progress-text">{project.progress}%</span>
                        </div>
                    </div>
                )}

                {activeTab === 'comments' && (
                    <div className="comments-tab">
                        <div className="tab-header">
                            <h3>COMENTÁRIOS</h3>
                            <button
                                className="add-btn"
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
                                    <button onClick={() => setShowCommentForm(false)}>Cancelar</button>
                                    <button onClick={handleAddComment}>Adicionar</button>
                                </div>
                            </div>
                        )}

                        <div className="comments-list">
                            {project.ProjectComment.map((comment: any) => (
                                <div key={comment.id} className="comment-item">
                                    <div className="comment-content">{comment.content}</div>
                                    <div className="comment-date">
                                        {comment.createdAt.toLocaleDateString()}
                                    </div>
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
                                    <button onClick={() => setShowFolderForm(false)}>Cancelar</button>
                                    <button onClick={handleAddFolder}>Adicionar</button>
                                </div>
                            </div>
                        )}

                        <div className="folders-list">
                            {project.ProjectFolder.map((folder: any) => (
                                <div key={folder.id} className="folder-item">
                                    <div className="folder-path">{folder.path}</div>
                                    <button
                                        className="open-folder-btn"
                                        onClick={() => openFolder(folder.path)}
                                    >
                                        ABRIR
                                    </button>
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
                                    <button onClick={() => setShowLinkForm(false)}>Cancelar</button>
                                    <button onClick={handleAddLink}>Adicionar</button>
                                </div>
                            </div>
                        )}

                        <div className="links-list">
                            {project.ProjectUsefullLink.map((link: any) => (
                                <div key={link.id} className="link-item">
                                    <div className="link-info">
                                        <div className="link-name">{link.name}</div>
                                        <div className="link-url">{link.url}</div>
                                    </div>
                                    <button
                                        className="open-link-btn"
                                        onClick={() => openLink(link.url)}
                                    >
                                        ABRIR
                                    </button>
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
                                    <button onClick={() => setShowCalendarForm(false)}>Cancelar</button>
                                    <button onClick={handleAddFocusDate}>Adicionar</button>
                                </div>
                            </div>
                        )}

                        <div className="calendar-list">
                            {project.DateFocus.map((focusDate: any) => (
                                <div key={focusDate.id} className="calendar-item">
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
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}