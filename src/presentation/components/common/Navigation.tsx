import '../../styles/navigation.css';

interface NavigationProps {
    currentPage: number;
    onPageChange: (page: number) => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
    const pages = [
        { id: 0, icon: '◆', label: 'Home' },
        { id: 1, icon: '▲', label: 'Projects' },
        { id: 2, icon: '●', label: 'Alerts' }
    ];

    return (
        <nav className="navigation">
            <div className="nav-container">
                {pages.map((page) => (
                    <button
                        key={page.id}
                        className={`nav-item ${currentPage === page.id ? 'active' : ''}`}
                        onClick={() => onPageChange(page.id)}
                    >
                        <span className="nav-icon">{page.icon}</span>
                        <span className="nav-label">{page.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
}