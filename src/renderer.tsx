/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * React-based renderer for the Electron app.
 */

import { createRoot } from 'react-dom/client';
import { App } from './presentation/App';
import { theme } from './presentation/styles/theme';

// Type definitions for Electron API
declare global {
  interface Window {
    electronAPI: {
      player: {
        getMetadata: () => Promise<{ artist: string; title: string; album: string; status: string }>;
        playPause: () => Promise<{ success: boolean }>;
        next: () => Promise<{ success: boolean }>;
        previous: () => Promise<{ success: boolean }>;
      };
      weather: {
        getData: (location: string) => Promise<{ success: boolean; data?: any; error?: string }>;
      };
      location: {
        get: () => Promise<{ success: boolean; lat?: number; lon?: number; city?: string; country?: string; error?: string }>;
      };
      app: {
        open: (appName: string) => Promise<{ success: boolean; error?: string }>;
      };
      config: {
        get: () => Promise<{ success: boolean; config?: { latitude: string; longitude: string; city: string; country: string }; error?: string }>;
        set: (config: { latitude: string; longitude: string; city: string; country: string; carouselInterval?: number }) => Promise<{ success: boolean; error?: string }>;
        getPaths: () => Promise<{ configFile: string; imagesDir: string; configDir: string }>;
        openDir: () => Promise<{ success: boolean; error?: string }>;
      };
      static: {
        get: (filePath: string) => Promise<{ success: boolean; data?: string; mimeType?: string; error?: string }>;
      };
    };
  }
}

// Initialize React app
function init() {
  console.log('[REACT] Iniciando aplicação...');

  // Debug: verificar se electronAPI está disponível
  console.log('[DEBUG] Electron API disponível:', {
    hasWindow: typeof window !== 'undefined',
    hasElectronAPI: typeof window !== 'undefined' && !!window.electronAPI,
    hasInvoke: typeof window !== 'undefined' && window.electronAPI && !!window.electronAPI.invoke
  });

  // Testar IPC
  if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.invoke) {
    console.log('[DEBUG] Testando IPC...');
    window.electronAPI.invoke('db:projects:getAll')
      .then(result => console.log('[DEBUG] IPC funcionando:', result))
      .catch(error => console.error('[DEBUG] IPC erro:', error));
  }

  const container = document.getElementById('root');
  if (!container) {
    console.error('[ERROR] Root element not found');
    return;
  }

  try {
    // Initialize theme - theme object is loaded, CSS variables are handled by CSS files
    console.log('[THEME] Tema carregado:', theme.colors.primary);

    const root = createRoot(container);
    root.render(<App />);

    console.log('[REACT] App initialized successfully');
  } catch (error) {
    console.error('[ERROR] Erro na inicialização:', error);

    // Fallback sem tema
    const root = createRoot(container);
    root.render(<App />);
  }
}

// Wait for DOM to load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
