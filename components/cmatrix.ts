/**
 * Matrix Widget Component
 * Monitor do sistema com efeito Matrix
 */

export class MatrixWidget {
  private element: HTMLDivElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'widget matrix-widget';
    this.render();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="widget-title">SYSTEM MONITOR</div>
      <canvas id="matrixCanvas" class="matrix-canvas"></canvas>
    `;
  }

  public getElement(): HTMLDivElement {
    return this.element;
  }
}