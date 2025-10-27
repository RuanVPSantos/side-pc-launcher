import { useState } from 'react';

export function App() {
    const [currentPage, setCurrentPage] = useState(0);
    const [projects, setProjects] = useState([
        {
            id: 1,
            name: 'LAUNCHER DASHBOARD',
            description: 'Sistema de dashboard personalizado',
            status: 'active',
            progress: 85,
            technologies: ['React', 'TypeScript', 'Electron']
        },
        {
            id: 2,
            name: 'API WEATHER SERVICE',
            description: 'Serviço de previsão do tempo',
            status: 'completed',
            progress: 100,
            technologies: ['Node.js', 'Express']
        }
    ]);

    const [showProjectForm, setShowProjectForm] = useState(false);
    const [newProject, setNewProject] = useState({
        name: '',
        description: '',
        status: 'active',
        progress: 0,
        technologies: ''
    });

    const handleCreateProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProject.name.trim()) return;

        const project = {
            id: Date.now(),
            name: newProject.name,
            description: newProject.description,
            status: newProject.status as any,
            progress: newProject.progress,
            technologies: newProject.technologies.split(',').map(t => t.trim()).filter(t => t)
        };

        setProjects(prev => [project, ...prev]);
        setNewProject({ name: '', description: '', status: 'active', progress: 0, technologies: '' });
        setShowProjectForm(false);

        console.log('✅ Projeto criado:', project);
    };

    const handleDeleteProject = (id: number) => {
        if (confirm('Deletar projeto?')) {
            setProjects(prev => prev.filter(p => p.id !== id));
            console.log('🗑️ Projeto deletado:', id);
        }
    };

    return (
        <div style={{
            padding: '20px',
            background: '#000',
            color: '#00d9ff',
            minHeight: '100vh',
            fontFamily: 'monospace'
        }}>
            <h1 style={{ color: '#00d9ff', marginBottom: '20px' }}>LAUNCHER DASHBOARD</h1>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => setCurrentPage(0)}
                    style={{
                        marginRight: '10px',
                        padding: '10px 20px',
                        background: currentPage === 0 ? '#00d9ff' : 'transparent',
                        color: currentPage === 0 ? '#000' : '#00d9ff',
                        border: '1px solid #00d9ff',
                        cursor: 'pointer'
                    }}
                >
                    HOME
                </button>
                <button
                    onClick={() => setCurrentPage(1)}
                    style={{
                        padding: '10px 20px',
                        background: currentPage === 1 ? '#00d9ff' : 'transparent',
                        color: currentPage === 1 ? '#000' : '#00d9ff',
                        border: '1px solid #00d9ff',
                        cursor: 'pointer'
                    }}
                >
                    PROJETOS ({projects.length})
                </button>
            </div>

            {currentPage === 0 && (
                <div>
                    <h2>CRONOGRAMA</h2>
                    <div style={{
                        background: 'rgba(0, 217, 255, 0.1)',
                        padding: '15px',
                        border: '1px solid #00d9ff',
                        marginBottom: '20px'
                    }}>
                        <div>📅 LAUNCHER DASHBOARD: 21/10 - 25/10 (ATIVO)</div>
                        <div>📅 API WEATHER: 28/10 - 01/11 (PRÓXIMO)</div>
                    </div>

                    <h2>WIDGETS</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div style={{ background: 'rgba(0, 217, 255, 0.1)', padding: '15px', border: '1px solid #00d9ff' }}>
                            <h3>CLIMA</h3>
                            <p>25°C - Ensolarado</p>
                        </div>
                        <div style={{ background: 'rgba(0, 217, 255, 0.1)', padding: '15px', border: '1px solid #00d9ff' }}>
                            <h3>MÚSICA</h3>
                            <p>Player pausado</p>
                        </div>
                    </div>
                </div>
            )}

            {currentPage === 1 && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2>PROJETOS</h2>
                        <button
                            onClick={() => setShowProjectForm(true)}
                            style={{
                                padding: '10px 20px',
                                background: '#00d9ff',
                                color: '#000',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            NOVO PROJETO
                        </button>
                    </div>

                    {showProjectForm && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000
                        }}>
                            <div style={{
                                background: '#000',
                                border: '2px solid #00d9ff',
                                padding: '20px',
                                width: '400px'
                            }}>
                                <h3>NOVO PROJETO</h3>
                                <form onSubmit={handleCreateProject}>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px' }}>Nome:</label>
                                        <input
                                            type="text"
                                            value={newProject.name}
                                            onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                background: '#000',
                                                border: '1px solid #00d9ff',
                                                color: '#fff'
                                            }}
                                            required
                                        />
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px' }}>Descrição:</label>
                                        <textarea
                                            value={newProject.description}
                                            onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                background: '#000',
                                                border: '1px solid #00d9ff',
                                                color: '#fff',
                                                minHeight: '60px'
                                            }}
                                            required
                                        />
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px' }}>Tecnologias (separadas por vírgula):</label>
                                        <input
                                            type="text"
                                            value={newProject.technologies}
                                            onChange={(e) => setNewProject(prev => ({ ...prev, technologies: e.target.value }))}
                                            placeholder="React, TypeScript, Node.js"
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                background: '#000',
                                                border: '1px solid #00d9ff',
                                                color: '#fff'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                        <button
                                            type="button"
                                            onClick={() => setShowProjectForm(false)}
                                            style={{
                                                padding: '10px 20px',
                                                background: 'transparent',
                                                color: '#00d9ff',
                                                border: '1px solid #00d9ff',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            CANCELAR
                                        </button>
                                        <button
                                            type="submit"
                                            style={{
                                                padding: '10px 20px',
                                                background: '#00d9ff',
                                                color: '#000',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            CRIAR
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        {projects.map(project => (
                            <div key={project.id} style={{
                                background: 'rgba(0, 217, 255, 0.1)',
                                border: '1px solid #00d9ff',
                                padding: '20px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                    <h3 style={{ margin: 0 }}>{project.name}</h3>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        color: project.status === 'active' ? '#00d9ff' : project.status === 'completed' ? '#00ff00' : '#ff9500'
                                    }}>
                                        {project.status.toUpperCase()}
                                    </span>
                                </div>
                                <p style={{ marginBottom: '15px', color: '#ccc' }}>{project.description}</p>
                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{ fontSize: '0.9rem', marginBottom: '5px' }}>PROGRESSO: {project.progress}%</div>
                                    <div style={{
                                        width: '100%',
                                        height: '8px',
                                        background: 'rgba(0,0,0,0.5)',
                                        border: '1px solid #00d9ff'
                                    }}>
                                        <div style={{
                                            width: `${project.progress}%`,
                                            height: '100%',
                                            background: '#00d9ff'
                                        }} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{ fontSize: '0.8rem', marginBottom: '5px' }}>TECNOLOGIAS:</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                        {project.technologies.map((tech, i) => (
                                            <span key={i} style={{
                                                fontSize: '0.7rem',
                                                padding: '2px 8px',
                                                background: 'rgba(0, 217, 255, 0.2)',
                                                border: '1px solid rgba(0, 217, 255, 0.5)'
                                            }}>
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteProject(project.id)}
                                    style={{
                                        padding: '8px 16px',
                                        background: 'rgba(255, 68, 68, 0.2)',
                                        color: '#ff4444',
                                        border: '1px solid rgba(255, 68, 68, 0.5)',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    DELETAR
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}