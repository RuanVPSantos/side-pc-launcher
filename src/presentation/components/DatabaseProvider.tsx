import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface DatabaseContextType {
    isInitialized: boolean;
    isLoading: boolean;
    error: string | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
    isInitialized: false,
    isLoading: true,
    error: null
});

export function useDatabaseContext() {
    return useContext(DatabaseContext);
}

interface DatabaseProviderProps {
    children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Inicialização rápida sem aguardar banco
        console.log('🔄 Iniciando DatabaseProvider (modo rápido)...');

        setTimeout(() => {
            setIsInitialized(true);
            setIsLoading(false);
            console.log('✅ DatabaseProvider inicializado rapidamente');
        }, 100);
    }, []);

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#000000',
                color: '#00d9ff',
                fontSize: '1.2rem'
            }}>
                Carregando...
            </div>
        );
    }

    return (
        <DatabaseContext.Provider value={{ isInitialized, isLoading, error }}>
            {children}
        </DatabaseContext.Provider>
    );
}