/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import './modal.css';
import './widgets.css';
import './header.css';

// ========================================
// COMPONENT IMPORTS
// ========================================
import { WeatherWidget } from '../components/weather';
import { MusicWidget } from '../components/midia';
import { QuickLaunchWidget } from '../components/shortcuts';
import { MapWidget } from '../components/map';
import { MatrixWidget } from '../components/cmatrix';

// Global widget instances
let weatherWidget: WeatherWidget;
let musicWidget: MusicWidget;
let mapWidget: MapWidget;

function initializeWidgets() {
  const container = document.getElementById('widgetsContainer');
  if (!container) return;

  // Create widget instances
  weatherWidget = new WeatherWidget();
  musicWidget = new MusicWidget();
  const quickLaunchWidget = new QuickLaunchWidget();
  mapWidget = new MapWidget();
  const matrixWidget = new MatrixWidget();

  // Append widgets to container
  container.appendChild(weatherWidget.getElement());
  container.appendChild(musicWidget.getElement());
  container.appendChild(quickLaunchWidget.getElement());
  container.appendChild(mapWidget.getElement());
  container.appendChild(matrixWidget.getElement());
}

// Type definitions
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
        getPaths: () => Promise<{ configFile: string; imagesDir: string; configDir: string }>;
        openDir: () => Promise<{ success: boolean; error?: string }>;
      };
      static: {
        get: (filePath: string) => Promise<{ success: boolean; data?: string; mimeType?: string; error?: string }>;
      };
    };
  }
}

// Helper function to load static images
async function loadStaticImage(filePath: string): Promise<string> {
  // Try to use IPC if available (production mode)
  if (window.electronAPI?.static) {
    try {
      const result = await window.electronAPI.static.get(filePath);
      if (result.success && result.data && result.mimeType) {
        return `data:${result.mimeType};base64,${result.data}`;
      }
    } catch (error) {
      console.error('[STATIC] Error loading image via IPC:', filePath, error);
    }
  }
  
  // Fallback to direct path (development mode)
  return filePath;
}

// Update time
function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeElement = document.getElementById('time');
  if (timeElement) {
    timeElement.textContent = `${hours}:${minutes}`;
  }
}

// Update date
function updateDate() {
  const now = new Date();
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

  const dayElement = document.getElementById('day');
  const monthElement = document.getElementById('month');
  const yearElement = document.getElementById('year');
  const dayNumberElement = document.getElementById('dayNumber');

  if (dayElement) dayElement.textContent = days[now.getDay()];
  if (monthElement) monthElement.textContent = months[now.getMonth()];
  if (yearElement) yearElement.textContent = `YEAR ${now.getFullYear()}`;
  if (dayNumberElement) dayNumberElement.textContent = String(now.getDate());
}

// Update CPU usage (simulated)
function updateCPU() {
  const cpuUsage = Math.floor(Math.random() * 30) + 50; // 50-80%
  const cpuText = document.getElementById('cpuText');
  const cpuProgress = document.getElementById('cpuProgress');

  if (cpuText) cpuText.textContent = String(cpuUsage);
  if (cpuProgress) {
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (cpuUsage / 100) * circumference;
    cpuProgress.style.strokeDashoffset = String(offset);
  }
}

// Update music player
async function updateMusicPlayer() {
  if (!window.electronAPI || !musicWidget) {
    console.log('[DEBUG] electronAPI or musicWidget not available');
    return;
  }

  try {
    const metadata = await window.electronAPI.player.getMetadata();
    console.log('[DEBUG] Music metadata:', metadata);

    // Update widget using the component method
    musicWidget.updateData({
      artist: metadata.artist || 'No artist',
      track: metadata.title || 'No track',
      album: metadata.album || 'No album'
    });

    // Reattach event listeners after render
    setupMusicControls();
  } catch (error) {
    console.error('[ERROR] Failed to update music player:', error);
  }
}

// Get location (manual override or config.txt or default Ceilândia)
async function getLocation() {
  const manual = localStorage.getItem('manualLocation');
  if (manual) {
    const data = JSON.parse(manual);
    console.log('[DEBUG] Using manual location:', data);
    return data;
  }

  // Try to get from config.txt
  if (window.electronAPI?.config?.get) {
    try {
      const result = await window.electronAPI.config.get();
      if (result.success && result.config) {
        const locationFromConfig = {
          lat: result.config.latitude,
          lon: result.config.longitude,
          city: result.config.city || 'Ceilândia',
          country: result.config.country || 'Brazil'
        };
        console.log('[DEBUG] Using location from config.txt:', locationFromConfig);
        return locationFromConfig;
      }
    } catch (error) {
      console.error('[ERROR] Failed to get location from config.txt:', error);
    }
  }

  // Default location: Ceilândia, DF, Brazil
  const defaultLocation = {
    lat: '-15.8288597',
    lon: '-48.1306207',
    city: 'Ceilândia',
    country: 'Brazil'
  };

  console.log('[DEBUG] Using default location (Ceilândia, DF):', defaultLocation);
  return defaultLocation;
}

// Initialize map
async function initMap() {
  if (!mapWidget) {
    console.log('[DEBUG] mapWidget not available');
    return;
  }

  try {
    // Get location (manual or default)
    const loc = await getLocation();
    console.log('[DEBUG] Using location for map:', loc);

    // Update map widget with location data
    mapWidget.updateData({
      city: loc.city,
      country: loc.country || '',
      lat: parseFloat(loc.lat),
      lon: parseFloat(loc.lon)
    });

    // Wait for DOM to be ready, then render cyberpunk map on canvas
    setTimeout(() => {
      const mapCanvas = document.getElementById('mapCanvas') as HTMLCanvasElement;
      console.log('[DEBUG] Map canvas found:', !!mapCanvas);
      if (mapCanvas) {
        console.log('[DEBUG] Rendering cyberpunk map...');
        renderCyberpunkMap(mapCanvas, parseFloat(loc.lat), parseFloat(loc.lon));
      } else {
        console.error('[ERROR] Map canvas not found in DOM');
      }
    }, 100);
  } catch (error) {
    console.error('[ERROR] Failed to initialize map:', error);
  }
}

// Render cyberpunk-style map
function renderCyberpunkMap(canvas: HTMLCanvasElement, lat: number, lon: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('[ERROR] Could not get canvas context');
    return;
  }

  console.log('[DEBUG] Canvas element:', canvas);
  console.log('[DEBUG] Canvas offsetWidth:', canvas.offsetWidth, 'offsetHeight:', canvas.offsetHeight);

  let pulseRadius = 0;
  let pulseDirection = 1;

  // Set canvas size
  const resizeCanvas = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    console.log('[DEBUG] Canvas resized to:', canvas.width, 'x', canvas.height);
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function drawMap() {
    if (!ctx || !canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas (transparent background)
    ctx.clearRect(0, 0, width, height);

    // Draw subtle grid
    ctx.strokeStyle = 'rgba(0, 217, 255, 0.15)';
    ctx.lineWidth = 1;

    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Calculate DF position on map
    // DF coordinates: lat=-15.8288597, lon=-48.1306207
    // Map projection: equirectangular (longitude -180 to 180, latitude -90 to 90)
    const centerX = width / 2;
    const centerY = height / 2;

    // Convert lat/lon to x/y
    // Longitude: -180 (left) to 180 (right), -48 is west
    // Latitude: 90 (top) to -90 (bottom), -15 is south
    const dfX = centerX + (lon / 140) * (width / 2); // lon=-48 → negative offset (west)
    const dfY = centerY - (lat / 52) * (height / 2);  // lat=-15 → positive offset (south)

    // Animate pulse
    pulseRadius += pulseDirection * 0.3;
    if (pulseRadius > 15) pulseDirection = -1;
    if (pulseRadius < 0) pulseDirection = 1;

    // Mark Brazil/DF location with animated pulse
    // Outer pulsing circle
    ctx.strokeStyle = `rgba(255, 0, 100, ${0.8 - (pulseRadius / 20)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(dfX, dfY, 8 + pulseRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Middle circle
    ctx.strokeStyle = 'rgba(255, 0, 100, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(dfX, dfY, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Inner marker (solid)
    ctx.fillStyle = '#ff0064';
    ctx.beginPath();
    ctx.arc(dfX, dfY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw corner brackets
    const bracketSize = 20;
    const margin = 20;
    ctx.strokeStyle = 'rgba(0, 217, 255, 0.6)';
    ctx.lineWidth = 2;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(margin + bracketSize, margin);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin, margin + bracketSize);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - margin - bracketSize, margin);
    ctx.lineTo(width - margin, margin);
    ctx.lineTo(width - margin, margin + bracketSize);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(margin, height - margin - bracketSize);
    ctx.lineTo(margin, height - margin);
    ctx.lineTo(margin + bracketSize, height - margin);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - margin - bracketSize, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.lineTo(width - margin, height - margin - bracketSize);
    ctx.stroke();
  }

  // Animation loop
  function animate() {
    drawMap();
    requestAnimationFrame(animate);
  }
  animate();
}

// Get weather icon based on condition
function getWeatherIcon(condition: string): string {
  const conditionLower = condition.toLowerCase();

  // Map weather conditions to emoji icons
  if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
    return '☀️';
  } else if (conditionLower.includes('partly cloudy') || conditionLower.includes('partly')) {
    return '⛅';
  } else if (conditionLower.includes('cloudy') || conditionLower.includes('overcast')) {
    return '☁️';
  } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('shower')) {
    return '🌧️';
  } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
    return '⛈️';
  } else if (conditionLower.includes('snow') || conditionLower.includes('sleet')) {
    return '❄️';
  } else if (conditionLower.includes('fog') || conditionLower.includes('mist') || conditionLower.includes('haze')) {
    return '🌫️';
  } else if (conditionLower.includes('wind')) {
    return '💨';
  }

  return '🌡️'; // Default icon
}

// Update weather
async function updateWeather() {
  if (!window.electronAPI || !weatherWidget) {
    console.log('[DEBUG] electronAPI or weatherWidget not available');
    return;
  }

  try {
    // Get location (manual or default Ceilândia)
    const loc = await getLocation();
    const weatherQuery = `${loc.lat},${loc.lon}`;
    console.log('[DEBUG] Weather query:', weatherQuery);

    const result = await window.electronAPI.weather.getData(weatherQuery);
    console.log('[DEBUG] Weather result:', result);

    if (result.success && result.data) {
      const current = result.data.current_condition[0];
      const forecast = result.data.weather;
      const location = result.data.nearest_area[0];

      console.log('[DEBUG] Weather location:', location);

      const cityName = loc.city || (location ? location.areaName[0].value : 'Unknown');
      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

      // Get today's date to ensure we start from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      console.log('[DEBUG] Today:', today.toDateString());
      console.log('[DEBUG] All forecast dates:', forecast.map((d: any) => d.date));

      // Filter out any days before today and take 5 days starting from today
      const validForecast = forecast.filter((day: any) => {
        const forecastDate = new Date(day.date);
        forecastDate.setHours(0, 0, 0, 0);
        return forecastDate >= today;
      });

      console.log('[DEBUG] Valid forecast dates:', validForecast.map((d: any) => d.date));

      // Prepare forecast data (today + next 4 days = 5 days total)
      const forecastData = validForecast.slice(0, 5).map((day: any, index: number) => {
        const date = new Date(day.date);
        const dayName = days[date.getDay()];
        const weatherCondition = day.hourly[0]?.weatherDesc[0]?.value || day.weatherDesc[0]?.value || 'Clear';
        const icon = getWeatherIcon(weatherCondition);

        console.log(`[DEBUG] Showing day ${index}: ${day.date} (${dayName})`);

        return {
          day: dayName,
          icon: icon,
          minTemp: parseInt(day.mintempC),
          maxTemp: parseInt(day.maxtempC)
        };
      });

      // Update widget using the component method
      weatherWidget.updateData({
        location: cityName.toUpperCase(),
        currentTemp: parseInt(current.temp_C),
        minTemp: parseInt(forecast[0].mintempC),
        maxTemp: parseInt(forecast[0].maxtempC),
        status: current.weatherDesc[0].value.toUpperCase(),
        forecast: forecastData
      });
    }
  } catch (error) {
    console.error('[ERROR] Failed to update weather:', error);
  }
}

// Setup music controls
function setupMusicControls() {
  if (!window.electronAPI) {
    console.log('[DEBUG] electronAPI not available for music controls');
    return;
  }

  const controls = document.querySelectorAll('.music-widget .control-btn');
  console.log('[DEBUG] Found', controls.length, 'music control buttons');

  controls.forEach((btn, index) => {
    // Remove old listeners by cloning the element
    const newBtn = btn.cloneNode(true);
    btn.parentNode?.replaceChild(newBtn, btn);

    // Add new listener
    newBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      console.log('[DEBUG] Music button clicked, index:', index);

      try {
        if (index === 0) {
          console.log('[DEBUG] Calling previous()');
          const result = await window.electronAPI.player.previous();
          console.log('[DEBUG] Previous result:', result);
        } else if (index === 1) {
          console.log('[DEBUG] Calling playPause()');
          const result = await window.electronAPI.player.playPause();
          console.log('[DEBUG] PlayPause result:', result);
        } else if (index === 2) {
          console.log('[DEBUG] Calling next()');
          const result = await window.electronAPI.player.next();
          console.log('[DEBUG] Next result:', result);
        }
        setTimeout(updateMusicPlayer, 500);
      } catch (error) {
        console.error('[ERROR] Music control failed:', error);
      }
    });
  });
}

// Setup app shortcuts
function setupAppShortcuts() {
  if (!window.electronAPI) {
    console.log('[DEBUG] electronAPI not available for shortcuts');
    return;
  }

  const shortcuts = document.querySelectorAll('.shortcut-item');
  console.log('[DEBUG] Found', shortcuts.length, 'shortcut buttons');

  shortcuts.forEach((shortcut) => {
    const appName = shortcut.getAttribute('data-app');
    console.log('[DEBUG] Setting up shortcut for:', appName);

    shortcut.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      console.log('[DEBUG] Shortcut clicked:', appName);

      if (appName) {
        try {
          const result = await window.electronAPI.app.open(appName);
          console.log('[DEBUG] App open result:', result);

          if (!result.success) {
            console.error('[ERROR] Failed to open app:', result.error);
          }
        } catch (error) {
          console.error('[ERROR] Exception opening app:', error);
        }
      }
    });
  });
}

// Matrix effect
function initMatrix() {
  const canvas = document.getElementById('matrixCanvas') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set canvas size
  const resizeCanvas = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops: number[] = Array(columns).fill(1);

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?';

  function draw() {
    if (!ctx || !canvas) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00d9ff';
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 50);
}

// Setup settings modal
function setupSettingsModal() {
  const modal = document.getElementById('settingsModal');
  const settingsBtn = document.getElementById('settingsBtn');
  const closeBtn = document.getElementById('closeModal');
  const saveBtn = document.getElementById('saveLocation');
  const resetBtn = document.getElementById('resetLocation');

  if (!modal || !settingsBtn || !closeBtn || !saveBtn || !resetBtn) {
    console.error('[ERROR] Modal elements not found');
    return;
  }

  // Open modal
  settingsBtn.addEventListener('click', async () => {
    modal.classList.add('active');
    await loadLocationData();
  });

  // Close modal
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  // Save manual location
  saveBtn.addEventListener('click', () => {
    const lat = (document.getElementById('manualLat') as HTMLInputElement).value;
    const lon = (document.getElementById('manualLon') as HTMLInputElement).value;
    const city = (document.getElementById('manualCity') as HTMLInputElement).value;

    if (lat && lon && city) {
      const locationData = { lat, lon, city, country: '' };
      localStorage.setItem('manualLocation', JSON.stringify(locationData));
      console.log('[DEBUG] Saved manual location:', locationData);

      // Reload data
      modal.classList.remove('active');
      initMap();
      updateWeather();
    } else {
      alert('Please fill all fields');
    }
  });

  // Reset to auto
  resetBtn.addEventListener('click', () => {
    localStorage.removeItem('manualLocation');
    console.log('[DEBUG] Reset to auto location');

    // Clear inputs
    (document.getElementById('manualLat') as HTMLInputElement).value = '';
    (document.getElementById('manualLon') as HTMLInputElement).value = '';
    (document.getElementById('manualCity') as HTMLInputElement).value = '';

    // Reload data
    modal.classList.remove('active');
    initMap();
    updateWeather();
  });
}

// Load location data into modal
async function loadLocationData() {
  if (!window.electronAPI) return;

  try {
    // Get auto-detected location
    const location = await window.electronAPI.location.get();
    console.log('[DEBUG] Loading location data:', location);

    if (location.success) {
      const detectedCity = document.getElementById('detectedCity');
      const detectedCountry = document.getElementById('detectedCountry');
      const detectedLat = document.getElementById('detectedLat');
      const detectedLon = document.getElementById('detectedLon');

      if (detectedCity) detectedCity.textContent = location.city || 'Unknown';
      if (detectedCountry) detectedCountry.textContent = location.country || 'Unknown';
      if (detectedLat) detectedLat.textContent = location.lat?.toFixed(4) || 'Unknown';
      if (detectedLon) detectedLon.textContent = location.lon?.toFixed(4) || 'Unknown';
    }

    // Load manual location if exists
    const manual = await getLocation();
    if (manual) {
      (document.getElementById('manualLat') as HTMLInputElement).value = manual.lat;
      (document.getElementById('manualLon') as HTMLInputElement).value = manual.lon;
      (document.getElementById('manualCity') as HTMLInputElement).value = manual.city;
    }
  } catch (error) {
    console.error('[ERROR] Failed to load location data:', error);
  }
}

// Initialize
function init() {
  // Initialize widgets first
  initializeWidgets();

  // Then setup everything else
  updateTime();
  updateDate();
  updateCPU();
  updateMusicPlayer();
  updateWeather();
  initMatrix();
  initMap();
  setupMusicControls();
  setupAppShortcuts();
  setupSettingsModal();

  // Update time every second
  setInterval(updateTime, 1000);

  // Update CPU every 2 seconds
  setInterval(updateCPU, 2000);

  // Update music player every 3 seconds
  setInterval(updateMusicPlayer, 3000);

  // Update weather every 10 minutes
  setInterval(updateWeather, 600000);
}

// Wait for DOM to load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}