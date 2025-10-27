import { useState } from 'react';
import { HomePage, ProjectsPage, NotificationsPage, ProjectDetailPage } from './pages';
import { Navigation, DatabaseProvider } from './components';

import './styles/index.css';
import './styles/app-animations.css';

export function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const handlePageChange = (page: number) => {
    if (page === currentPage) return;

    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentPage(page);
      setIsTransitioning(false);
    }, 150);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleProjectSelect = (projectId: number) => {
    setSelectedProjectId(projectId);
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
  };

  const renderCurrentPage = () => {
    // Se um projeto está selecionado, mostrar detalhes
    if (selectedProjectId !== null) {
      return (
        <ProjectDetailPage
          projectId={selectedProjectId}
          onBack={handleBackToProjects}
        />
      );
    }

    switch (currentPage) {
      case 0:
        return <HomePage refreshKey={refreshKey} onRefresh={handleRefresh} />;
      case 1:
        return <ProjectsPage onProjectSelect={handleProjectSelect} />;
      case 2:
        return <NotificationsPage />;
      default:
        return <HomePage refreshKey={refreshKey} onRefresh={handleRefresh} />;
    }
  };

  return (
    <DatabaseProvider>
      <div className="dashboard">
        {currentPage === 0 ? (
          <div className={`main-content ${isTransitioning ? 'transitioning' : ''}`}>
            {renderCurrentPage()}
          </div>
        ) : (
          <div className={`page-content ${isTransitioning ? 'transitioning' : ''}`}>
            {renderCurrentPage()}
          </div>
        )}

        {selectedProjectId === null && (
          <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
        )}
      </div>
    </DatabaseProvider>
  );
}
