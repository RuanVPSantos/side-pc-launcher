/**
 * Map Widget Component
 * Mapa cyberpunk com canvas customizado
 */

interface MapData {
  city: string;
  country: string;
  lat: number;
  lon: number;
}

export class MapWidget {
  private element: HTMLDivElement;
  private data: MapData;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'widget map-widget';
    
    // Initial state
    this.data = {
      city: 'Loading...',
      country: '',
      lat: -15.8288597,
      lon: -48.1306207
    };
    
    this.render();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="widget-title" id="mapTitle">LOCATION - ${this.data.city.toUpperCase()}</div>
      <div class="map-container">
        <div class="map-svg-container">
          <img data-icon="world.svg" class="world-map-svg" alt="World Map" />
        </div>
        <canvas id="mapCanvas" class="map-canvas"></canvas>
        <div class="map-overlay">
          <div class="location-info">
            <div class="location-coords" id="locationCoords">${this.data.lat.toFixed(4)}, ${this.data.lon.toFixed(4)}</div>
          </div>
        </div>
      </div>
    `;
    this.loadMapImage();
  }

  private async loadMapImage(): Promise<void> {
    const img = this.element.querySelector('img[data-icon]') as HTMLImageElement;
    if (img) {
      const iconPath = img.getAttribute('data-icon');
      if (iconPath) {
        const src = await this.loadStaticImage(iconPath);
        img.src = src;
      }
    }
  }

  private async loadStaticImage(filePath: string): Promise<string> {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.static) {
      try {
        const result = await electronAPI.static.get(filePath);
        if (result.success && result.data && result.mimeType) {
          return `data:${result.mimeType};base64,${result.data}`;
        }
      } catch (error) {
        console.error('[MAP] Error loading image:', filePath, error);
      }
    }
    return `/${filePath}`;
  }

  // Método público para atualizar dados
  public updateData(data: Partial<MapData>): void {
    this.data = { ...this.data, ...data };
    this.render();
  }

  public getElement(): HTMLDivElement {
    return this.element;
  }
}