import { useEffect, useRef, useState } from 'react';

interface MapData {
  city: string;
  country: string;
  lat: number;
  lon: number;
}

export function MapWidget() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<MapData>({
    city: 'LOADING...',
    country: '',
    lat: -15.8288597,
    lon: -48.1306207
  });
  const [worldMapSrc, setWorldMapSrc] = useState<string>('');

  const getLocation = async () => {
    const manual = localStorage.getItem('manualLocation');
    if (manual) {
      return JSON.parse(manual);
    }

    if (window.electronAPI?.config?.get) {
      try {
        const result = await window.electronAPI.config.get();
        if (result.success && result.config) {
          return {
            lat: result.config.latitude,
            lon: result.config.longitude,
            city: result.config.city || 'Ceilândia',
            country: result.config.country || 'Brazil'
          };
        }
      } catch (error) {
        console.error('[ERROR] Failed to get location from config.txt:', error);
      }
    }

    return {
      lat: '-15.8288597',
      lon: '-48.1306207',
      city: 'Ceilândia',
      country: 'Brazil'
    };
  };

  const renderCyberpunkMap = (canvas: HTMLCanvasElement, lat: number, lon: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let pulseRadius = 0;
    let pulseDirection = 1;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function drawMap() {
      if (!ctx || !canvas) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Grid
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

      // Position calculation
      const centerX = width / 2;
      const centerY = height / 2;
      const dfX = centerX + (lon / 140) * (width / 2);
      const dfY = centerY - (lat / 52) * (height / 2);

      // Pulse animation
      pulseRadius += pulseDirection * 0.3;
      if (pulseRadius > 15) pulseDirection = -1;
      if (pulseRadius < 0) pulseDirection = 1;

      // Pulsing circle
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

      // Inner marker
      ctx.fillStyle = '#ff0064';
      ctx.beginPath();
      ctx.arc(dfX, dfY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Corner brackets
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

    function animate() {
      drawMap();
      requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  };

  const loadWorldMap = async () => {
    console.log('[MAP] Loading world.svg...');
    
    // Tentar carregar via fetch primeiro (funciona em dev e prod)
    try {
      const response = await fetch('/world.svg');
      if (response.ok) {
        const svgText = await response.text();
        const blob = new Blob([svgText], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        console.log('[MAP] ✅ Loaded via fetch');
        setWorldMapSrc(url);
        return;
      }
    } catch (error) {
      console.log('[MAP] Fetch failed, trying IPC:', error);
    }

    // Fallback para IPC
    if (window.electronAPI?.static) {
      try {
        const result = await window.electronAPI.static.get('world.svg');
        console.log('[MAP] IPC result:', result.success);
        if (result.success && result.data && result.mimeType) {
          const src = `data:${result.mimeType};base64,${result.data}`;
          console.log('[MAP] ✅ Loaded via IPC, length:', result.data.length);
          setWorldMapSrc(src);
        } else {
          console.error('[MAP] ❌ Failed to load world.svg via IPC');
        }
      } catch (error) {
        console.error('[MAP] ❌ Error loading world.svg via IPC:', error);
      }
    }
  };

  useEffect(() => {
    loadWorldMap();
  }, []);

  useEffect(() => {
    const initMap = async () => {
      try {
        const loc = await getLocation();
        console.log('[DEBUG] Using location for map:', loc);

        const lat = parseFloat(loc.lat);
        const lon = parseFloat(loc.lon);

        setData({
          city: loc.city,
          country: loc.country || '',
          lat: lat,
          lon: lon
        });

        // Wait for canvas to be ready
        setTimeout(() => {
          if (canvasRef.current) {
            console.log('[DEBUG] Rendering map canvas');
            renderCyberpunkMap(canvasRef.current, lat, lon);
          } else {
            console.error('[ERROR] Canvas ref not available');
          }
        }, 200);
      } catch (error) {
        console.error('[ERROR] Failed to initialize map:', error);
      }
    };

    initMap();
  }, []);

  return (
    <div className="widget map-widget">
      <div className="widget-title">MAP - {data.city.toUpperCase()}</div>
      <div className="map-container">
        {worldMapSrc ? (
          <div className="map-svg-container">
            <img 
              src={worldMapSrc} 
              alt="World Map" 
              className="world-map-svg"
              style={{ 
                opacity: 0.3,
                filter: 'invert(58%) sepia(94%) saturate(2574%) hue-rotate(160deg) brightness(101%) contrast(101%)'
              }}
              onLoad={() => console.log('[MAP] ✅ World SVG loaded successfully')}
              onError={(e) => console.error('[MAP] ❌ World SVG load error:', e)}
            />
          </div>
        ) : (
          <div style={{ position: 'absolute', color: 'red', zIndex: 10 }}>
            Loading map...
          </div>
        )}
        <canvas ref={canvasRef} id="mapCanvas" className="map-canvas"></canvas>
      </div>
      <div className="map-info">
        <div className="map-coords">
          LAT: {data.lat.toFixed(4)} / LON: {data.lon.toFixed(4)}
        </div>
      </div>
    </div>
  );
}
