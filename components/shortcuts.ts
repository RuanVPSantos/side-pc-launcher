/**
 * Quick Launch Widget Component
 * Atalhos rápidos para aplicativos
 */

export class QuickLaunchWidget {
  private element: HTMLDivElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'widget shortcuts-widget';
    this.render();
    this.loadIcons();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="widget-title">QUICK LAUNCH</div>
      <div class="app-shortcuts">
        <button class="shortcut-item" data-app="google">
          <img data-icon="google.svg" class="shortcut-icon" alt="Google" />
          <span class="shortcut-label">GOOGLE</span>
        </button>
        <button class="shortcut-item" data-app="youtube">
          <img data-icon="youtube.svg" class="shortcut-icon" alt="YouTube" />
          <span class="shortcut-label">YOUTUBE</span>
        </button>
        <button class="shortcut-item" data-app="whatsapp">
          <img data-icon="whatsapp.svg" class="shortcut-icon" alt="WhatsApp" />
          <span class="shortcut-label">WHATSAPP</span>
        </button>
        <button class="shortcut-item" data-app="spotify">
          <img data-icon="spotify.svg" class="shortcut-icon" alt="Spotify" />
          <span class="shortcut-label">SPOTIFY</span>
        </button>
      </div>
    `;
  }

  private async loadIcons(): Promise<void> {
    const icons = this.element.querySelectorAll('img[data-icon]');
    for (const img of Array.from(icons)) {
      const iconPath = img.getAttribute('data-icon');
      if (iconPath) {
        const src = await this.loadStaticImage(iconPath);
        (img as HTMLImageElement).src = src;
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
        console.error('[SHORTCUTS] Error loading icon:', filePath, error);
      }
    }
    return `/${filePath}`;
  }

  public getElement(): HTMLDivElement {
    return this.element;
  }
}