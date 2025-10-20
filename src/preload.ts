// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    player: {
        getMetadata: () => ipcRenderer.invoke('player:get-metadata'),
        playPause: () => ipcRenderer.invoke('player:play-pause'),
        next: () => ipcRenderer.invoke('player:next'),
        previous: () => ipcRenderer.invoke('player:previous'),
    },
    weather: {
        getData: (location: string) => ipcRenderer.invoke('weather:get-data', location),
    },
    location: {
        get: () => ipcRenderer.invoke('location:get'),
    },
    config: {
        get: () => ipcRenderer.invoke('config:get'),
        getPaths: () => ipcRenderer.invoke('config:getPaths'),
        openDir: () => ipcRenderer.invoke('config:openDir'),
    },
    app: {
        open: (appName: string) => ipcRenderer.invoke('app:open', appName),
    },
    static: {
        get: (filePath: string) => ipcRenderer.invoke('static:get', filePath),
    },
});
