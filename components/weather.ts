/**
 * Weather Widget Component
 * Componente dinâmico com props e métodos de atualização
 */

interface WeatherData {
  location: string;
  currentTemp: number;
  minTemp: number;
  maxTemp: number;
  status: string;
  forecast: Array<{
    day: string;
    icon: string;
    minTemp: number;
    maxTemp: number;
  }>;
}

export class WeatherWidget {
  private element: HTMLDivElement;
  private data: WeatherData;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'widget weather-widget';
    
    // Initial state
    this.data = {
      location: 'LOADING...',
      currentTemp: 0,
      minTemp: 0,
      maxTemp: 0,
      status: 'LOADING...',
      forecast: []
    };
    
    this.render();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="widget-title">WEATHER - ${this.data.location}</div>
      <div class="weather-current">
        <div class="temp-item temp-min">
          <div class="temp-label">MIN</div>
          <div class="temp-value">${this.data.minTemp}°</div>
        </div>
        <div class="temp-item temp-current">
          <div class="temp-label">NOW</div>
          <div class="temp-value">${this.data.currentTemp}°</div>
        </div>
        <div class="temp-item temp-max">
          <div class="temp-label">MAX</div>
          <div class="temp-value">${this.data.maxTemp}°</div>
        </div>
      </div>
      <div class="weather-status">${this.data.status}</div>
      <div class="forecast-table">
        ${this.data.forecast.map(day => `
          <div class="forecast-row">
            <span>${day.day}</span>
            <span>${day.icon}</span>
            <span>${day.minTemp}°</span>
            <span>${day.maxTemp}°</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Método público para atualizar dados
  public updateData(data: Partial<WeatherData>): void {
    this.data = { ...this.data, ...data };
    this.render();
  }

  public getElement(): HTMLDivElement {
    return this.element;
  }
}