/**
 * Visualizer Widget Component
 * Visualizador de áudio com equalizer animado
 */

export class VisualizerWidget {
  private element: HTMLDivElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'widget visualizer-widget';
    this.render();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      <div class="equalizer">
        ${Array(8).fill('<div class="bar"></div>').join('')}
      </div>
    `;
  }

  public getElement(): HTMLDivElement {
    return this.element;
  }
}