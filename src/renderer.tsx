/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * React-based renderer for the Electron app.
 */

import { createRoot } from 'react-dom/client';
import { App } from './App';

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
  const container = document.getElementById('root');
  if (!container) {
    console.error('[ERROR] Root element not found');
    return;
  }

  const root = createRoot(container);
  root.render(<App />);
  
  console.log('[REACT] App initialized successfully');
}

// Wait for DOM to load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
