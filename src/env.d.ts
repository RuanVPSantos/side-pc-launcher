/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// For Electron main process
interface NodeJS {
  env: {
    NODE_ENV: 'development' | 'production';
    // Add other Node.js environment variables here
  };
}

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;
