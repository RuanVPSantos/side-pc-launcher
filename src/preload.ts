// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Create a type-safe API for the renderer process
const electronAPI = {
    // Player controls
    player: {
        getMetadata: () => ipcRenderer.invoke('player:get-metadata'),
        playPause: () => ipcRenderer.invoke('player:play-pause'),
        next: () => ipcRenderer.invoke('player:next'),
        previous: () => ipcRenderer.invoke('player:previous'),
    },
    // Weather data
    weather: {
        getData: (location: string) => ipcRenderer.invoke('weather:get-data', location),
    },
    // Location services
    location: {
        get: () => ipcRenderer.invoke('location:get'),
    },
    // Configuration
    config: {
        get: () => ipcRenderer.invoke('config:get'),
        set: (config: any) => ipcRenderer.invoke('config:set', config),
        getPaths: () => ipcRenderer.invoke('config:getPaths'),
        openDir: () => ipcRenderer.invoke('config:openDir'),
    },
    // Application controls
    app: {
        open: (appName: string) => ipcRenderer.invoke('app:open', appName),
    },
    // Static file access
    static: {
        get: (filePath: string) => ipcRenderer.invoke('static:get', filePath),
    },
    // IPC event listeners
    on: (channel: string, callback: (...args: any[]) => void) => {
        const subscription = (_event: IpcRendererEvent, ...args: any[]) => callback(...args);
        ipcRenderer.on(channel, subscription);
        return () => ipcRenderer.removeListener(channel, subscription);
    },
    // Direct invoke for any IPC calls
    invoke: (channel: string, ...args: any[]) => {
        return ipcRenderer.invoke(channel, ...args);
    }
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for TypeScript
declare global {
    interface Window {
        electronAPI: typeof electronAPI;
    }
}
