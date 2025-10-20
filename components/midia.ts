/**
 * Music Player Widget Component
 * Componente dinâmico com props e métodos de atualização
 */

interface MusicData {
  artist: string;
  track: string;
  album: string;
}

export class MusicWidget {
  private element: HTMLDivElement;
  private data: MusicData;
  private carouselImages: string[] = [];
  private currentImageIndex = 0;
  private carouselInterval: number | null = null;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'widget music-widget';

    // Initial state
    this.data = {
      artist: 'No artist',
      track: 'No track',
      album: 'No album'
    };

    this.loadCarouselImages();
    this.render();
    this.startCarousel();
  }

  private loadCarouselImages(): void {
    // Lista de todas as imagens do carrossel (apenas nomes de arquivo)
    this.carouselImages = [
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.24 (1).jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.24 (2).jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.24.jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.25 (1).jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.25 (2).jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.25 (3).jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.26 (1).jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.26.jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.27.jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.28.jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.30.jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.31 (1).jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.31 (2).jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.31 (3).jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.32 (1).jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.34 (1).jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.34.jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.35 (1).jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.36 (1).jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.36 (2).jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.36 (3).jpeg',
      'carroussel/WhatsApp Image 2025-10-17 at 22.23.36.jpeg'
    ];

    console.log('[CAROUSEL] Total de imagens carregadas:', this.carouselImages.length);
    console.log('[CAROUSEL] Lista de imagens:', this.carouselImages);

    // Embaralhar imagens
    this.shuffleImages();

    console.log('[CAROUSEL] Imagens embaralhadas. Primeira imagem:', this.carouselImages[0]);
  }

  private shuffleImages(): void {
    for (let i = this.carouselImages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.carouselImages[i], this.carouselImages[j]] = [this.carouselImages[j], this.carouselImages[i]];
    }
  }

  private startCarousel(): void {
    // Default to 10 seconds (will be configurable via IPC later)
    const intervalSeconds = 10;
    const intervalMs = intervalSeconds * 1000;

    this.carouselInterval = window.setInterval(() => {
      this.nextImage();
    }, intervalMs);
  }

  private nextImage(): void {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.carouselImages.length;
    this.updateCarouselImage();
  }

  private async updateCarouselImage(): Promise<void> {
    const img = this.element.querySelector('.carousel-image') as HTMLImageElement;
    if (img && this.carouselImages.length > 0) {
      console.log('[CAROUSEL] Atualizando imagem:', this.carouselImages[this.currentImageIndex]);
      const imagePath = this.carouselImages[this.currentImageIndex];

      // Adicionar handlers ANTES de definir o src
      img.onload = () => {
        console.log('[CAROUSEL] ✅ Imagem carregada:', imagePath);
      };

      img.onerror = () => {
        console.error('[CAROUSEL] ❌ ERRO ao carregar imagem:', imagePath);
        console.error('[CAROUSEL] Índice:', this.currentImageIndex);
        console.error('[CAROUSEL] Total de imagens:', this.carouselImages.length);
      };

      // Carregar imagem via IPC ou fallback
      const src = await this.loadStaticImage(imagePath);
      img.src = src;
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
        console.error('[CAROUSEL] Error loading image via IPC:', filePath, error);
      }
    }
    return `/${filePath}`;
  }

  private render(): void {
    const hasImages = this.carouselImages.length > 0;

    const carouselHTML = hasImages
      ? `<div class="carousel-container">
           <img class="carousel-image" alt="Album Art" />
         </div>`
      : '';

    this.element.innerHTML = `
      <div class="widget-title">MUSIC PLAYER</div>
      <div class="music-content">
        ${carouselHTML}
        <div class="track-info">
          <div class="artist" title="${this.data.artist}">${this.data.artist}</div>
          <div class="track-name" title="${this.data.track}">${this.data.track}</div>
          <div class="album" title="${this.data.album}">${this.data.album}</div>
        </div>
      </div>
      <div class="music-controls">
        <button class="control-btn">⏮</button>
        <button class="control-btn play-btn">▶/⏸</button>
        <button class="control-btn">⏭</button>
      </div>
    `;

    // Carregar imagem inicial de forma assíncrona
    if (hasImages) {
      this.updateCarouselImage();
    }
  }

  // Método público para atualizar dados
  public updateData(data: Partial<MusicData>): void {
    this.data = { ...this.data, ...data };
    this.render();
  }

  public getElement(): HTMLDivElement {
    return this.element;
  }

  public destroy(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }
}