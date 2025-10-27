import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { readdir, readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import started from 'electron-squirrel-startup';
import { setupDatabaseIPC } from './main/database';

// Capturar erros não tratados
process.on('uncaughtException', (error) => {
  console.error('❌ ERRO NÃO TRATADO:', error);
  console.error('Stack:', error.stack);
  // Escrever no arquivo também
  require('fs').appendFileSync('/tmp/launcher-error.log', `UNCAUGHT: ${error.message}\n${error.stack}\n\n`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ PROMISE REJEITADA:', reason);
  console.error('Promise:', promise);
  // Escrever no arquivo também
  require('fs').appendFileSync('/tmp/launcher-error.log', `REJECTION: ${reason}\n\n`);
});

console.log('🚀 Iniciando aplicação Electron...');
require('fs').appendFileSync('/tmp/launcher-error.log', `🚀 Iniciando aplicação Electron...\n`);

const execAsync = promisify(exec);

// User config directory
const USER_CONFIG_DIR = path.join(app.getPath('home'), '.config', 'launcher');
const USER_CONFIG_FILE = path.join(USER_CONFIG_DIR, 'config.txt');
const USER_IMAGES_DIR = path.join(USER_CONFIG_DIR, 'carousel-images');

// Default configuration
const DEFAULT_CONFIG = {
  latitude: '-15.8288597',
  longitude: '-48.1306207',
  carouselInterval: 10,
  city: 'Ceilândia',
  country: 'Brazil'
};

// Initialize user config directory
async function initUserConfig() {
  try {
    // Create config directory if it doesn't exist
    if (!existsSync(USER_CONFIG_DIR)) {
      await mkdir(USER_CONFIG_DIR, { recursive: true });
      console.log('[CONFIG] Created config directory:', USER_CONFIG_DIR);
    }

    // Create images directory if it doesn't exist
    if (!existsSync(USER_IMAGES_DIR)) {
      await mkdir(USER_IMAGES_DIR, { recursive: true });
      console.log('[CONFIG] Created images directory:', USER_IMAGES_DIR);
    }

    // Copy default images if the images directory is empty
    const images = await readdir(USER_IMAGES_DIR);
    if (images.length === 0) {
      const defaultImagesPath = app.isPackaged
        ? path.join(process.resourcesPath, 'carroussel')
        : path.join(__dirname, '../public/carroussel');
      const defaultImages = await readdir(defaultImagesPath);
      for (const image of defaultImages) {
        const src = path.join(defaultImagesPath, image);
        const dest = path.join(USER_IMAGES_DIR, image);
        await copyFile(src, dest);
      }
      console.log('[CONFIG] Copied default images to:', USER_IMAGES_DIR);
    }

    // Create default config file if it doesn't exist
    if (!existsSync(USER_CONFIG_FILE)) {
      const defaultConfigText = `# Launcher Configuration File
# Edit this file to customize your launcher settings
# Lines starting with # are comments

# Location Settings (for weather)
LATITUDE=-15.8288597
LONGITUDE=-48.1306207
CITY=Ceilândia
COUNTRY=Brazil

# Carousel Settings
CAROUSEL_INTERVAL=10
`;
      await writeFile(USER_CONFIG_FILE, defaultConfigText);
      console.log('[CONFIG] Created default config file:', USER_CONFIG_FILE);
    }

    console.log('[CONFIG] User config initialized');
    console.log('[CONFIG] Config file:', USER_CONFIG_FILE);
    console.log('[CONFIG] Images folder:', USER_IMAGES_DIR);
  } catch (error) {
    console.error('[CONFIG] Error initializing user config:', error);
  }
}

// Parse config.txt file (simple key=value format)
function parseConfigFile(content: string): Record<string, string> {
  const config: Record<string, string> = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;

    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      config[key.trim()] = valueParts.join('=').trim();
    }
  }

  return config;
}

// Load user configuration from config.txt
async function loadUserConfig() {
  try {
    const configData = await readFile(USER_CONFIG_FILE, 'utf-8');
    const parsed = parseConfigFile(configData);

    return {
      latitude: parsed.LATITUDE || DEFAULT_CONFIG.latitude,
      longitude: parsed.LONGITUDE || DEFAULT_CONFIG.longitude,
      carouselInterval: parseInt(parsed.CAROUSEL_INTERVAL || String(DEFAULT_CONFIG.carouselInterval)),
      city: parsed.CITY || DEFAULT_CONFIG.city,
      country: parsed.COUNTRY || DEFAULT_CONFIG.country
    };
  } catch (error) {
    console.error('[CONFIG] Error loading config, using defaults:', error);
    return DEFAULT_CONFIG;
  }
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = async () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    frame: false,
    transparent: true,
    resizable: true,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(process.cwd(), '.vite/build/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // and load the index.html of the app.
  const isProduction = app.isPackaged;

  if (!isProduction) {
    // Try to load from dev server first
    const devServerUrl = process.env.ELECTRON_RENDERER_URL || 'http://localhost:5173';
    console.log('🌐 Loading from dev server:', devServerUrl);

    try {
      await mainWindow.loadURL(devServerUrl);
      // mainWindow.webContents.openDevTools(); // Temporário para debug
    } catch (error) {
      console.error('❌ Failed to load dev server, trying built files:', error);
      // Fallback to built files
      mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
  } else {
    // In production, load from the file system
    console.log('📁 Loading from built files');
    mainWindow.loadFile(
      path.join(__dirname, '../renderer/index.html')
    );
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  try {
    // Initialize user config first
    console.log('🔧 Initializing user config...');
    await initUserConfig();

    // Create the main window first
    console.log('🚀 Creating main window...');
    await createWindow();

    // Initialize database after window is created
    console.log('🔧 Initializing database...');
    try {
      // Set PRISMA_QUERY_ENGINE_LIBRARY for packaged app
      if (app.isPackaged) {
        process.env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(
          process.resourcesPath,
          'app.asar.unpacked',
          'node_modules',
          '@prisma',
          'client'
        );
      }

      const DatabaseService = await import('./data/database');
      await DatabaseService.default.initialize();

      // Setup database IPC handlers
      console.log('🔧 Setting up database IPC handlers...');
      setupDatabaseIPC();
    } catch (error) {
      console.error('❌ Database initialization failed, but continuing:', error);
      // Não fazer quit - deixar a aplicação funcionar sem banco
    }
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    app.quit();
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    try {
      app.quit();
      createWindow();
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      app.quit();
      return;
    }
  }
});

app.on('activate', async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Music Player IPC Handlers
ipcMain.handle('player:get-metadata', async () => {
  try {
    const { stdout } = await execAsync(
      "playerctl metadata --format '{{artist}}|{{title}}|{{album}}|{{status}}' 2>/dev/null || echo 'No player|No track|No album|stopped'"
    );
    const [artist, title, album, status] = stdout.trim().split('|');
    return { artist, title, album, status };
  } catch (error) {
    return { artist: 'No player', title: 'No track', album: 'No album', status: 'stopped' };
  }
});

ipcMain.handle('player:play-pause', async () => {
  try {
    await execAsync('playerctl play-pause 2>/dev/null');
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('player:next', async () => {
  try {
    await execAsync('playerctl next 2>/dev/null');
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('player:previous', async () => {
  try {
    await execAsync('playerctl previous 2>/dev/null');
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

// Weather API Handler
ipcMain.handle('weather:get-data', async (_, location: string) => {
  try {
    // Using wttr.in API (free, no key required)
    const response = await fetch(`https://wttr.in/${location}?format=j1`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

// Get user location
ipcMain.handle('location:get', async () => {
  try {
    const response = await fetch('http://ip-api.com/json/');
    const data = await response.json();
    return {
      success: true,
      lat: data.lat,
      lon: data.lon,
      city: data.city,
      country: data.country
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

// Get user configuration
ipcMain.handle('config:get', async () => {
  try {
    const config = await loadUserConfig();
    return { success: true, config };
  } catch (error) {
    console.error('[CONFIG] Error getting config:', error);
    return { success: false, config: DEFAULT_CONFIG };
  }
});

// Save user configuration
ipcMain.handle('config:set', async (_, newConfig: { latitude: string; longitude: string; city: string; country: string; carouselInterval?: number }) => {
  try {
    const configText = `# Launcher Configuration File
# Edit this file to customize your launcher settings
# Lines starting with # are comments

# Location Settings (for weather and map)
LATITUDE=${newConfig.latitude}
LONGITUDE=${newConfig.longitude}
CITY=${newConfig.city}
COUNTRY=${newConfig.country || 'Brazil'}

# Carousel Settings
CAROUSEL_INTERVAL=${newConfig.carouselInterval || 10}
`;
    await writeFile(USER_CONFIG_FILE, configText);
    console.log('[CONFIG] Configuration saved:', newConfig);
    return { success: true };
  } catch (error) {
    console.error('[CONFIG] Error saving config:', error);
    return { success: false, error: String(error) };
  }
});

// Get config paths (for user reference)
ipcMain.handle('config:getPaths', async () => {
  return {
    configFile: USER_CONFIG_FILE,
    imagesDir: USER_IMAGES_DIR,
    configDir: USER_CONFIG_DIR
  };
});

// Open config directory in file manager
ipcMain.handle('config:openDir', async () => {
  try {
    await shell.openPath(USER_CONFIG_DIR);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

// Get carousel images dynamically
ipcMain.handle('carousel:getImages', async () => {
  try {
    const files = await readdir(USER_IMAGES_DIR);

    // Filter only image files
    const imageFiles = files.filter(file =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    // Return full paths
    const imagePaths = imageFiles.map(file =>
      path.join(USER_IMAGES_DIR, file)
    );

    console.log('[CAROUSEL] Found', imagePaths.length, 'images');
    return { success: true, images: imagePaths };
  } catch (error) {
    console.error('[CAROUSEL] Error reading images:', error);
    return { success: false, error: String(error), images: [] };
  }
});

// Serve static files from public folder
ipcMain.handle('static:get', async (_, filePath: string) => {
  try {
    const publicPath = app.isPackaged
      ? path.join(process.resourcesPath, 'public')
      : path.join(__dirname, '../public');

    const fullPath = path.join(publicPath, filePath);

    // Security check: ensure the path is within public folder
    if (!fullPath.startsWith(publicPath)) {
      return { success: false, error: 'Invalid path' };
    }

    const fileData = await readFile(fullPath);
    const base64 = fileData.toString('base64');

    // Determine MIME type
    let mimeType = 'application/octet-stream';
    if (filePath.endsWith('.svg')) mimeType = 'image/svg+xml';
    else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) mimeType = 'image/jpeg';
    else if (filePath.endsWith('.png')) mimeType = 'image/png';
    else if (filePath.endsWith('.gif')) mimeType = 'image/gif';
    else if (filePath.endsWith('.webp')) mimeType = 'image/webp';

    return { success: true, data: base64, mimeType };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('app:open', async (_, appNameOrLink: string) => {
  try {
    // 1️⃣ Se for um link completo (http ou https), abre direto no navegador
    if (/^https?:\/\//i.test(appNameOrLink)) {
      await shell.openExternal(appNameOrLink);
      return { success: true };
    }

    // 2️⃣ Caso contrário, trata como nome de app
    switch (appNameOrLink) {
      case 'google':
        await shell.openExternal('https://www.google.com');
        break;
      case 'youtube':
        await shell.openExternal('https://www.youtube.com');
        break;
      case 'whatsapp':
        await shell.openExternal('https://web.whatsapp.com');
        break;
      case 'spotify':
        try {
          await execAsync('spotify 2>/dev/null || xdg-open spotify: 2>/dev/null');
        } catch {
          await shell.openExternal('https://open.spotify.com');
        }
        break;
      default:
        return { success: false, error: 'Unknown app or invalid link' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});


ipcMain.handle('system:openUrl', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao abrir link externo:', error);
    return { success: false, error: error.message };
  }
});