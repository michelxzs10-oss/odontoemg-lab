/**
 * Renderizador del osciloscopio en Canvas 2D.
 *
 * Barrido como en el equipo clínico: el trazo se escribe de izquierda a derecha
 * y al llegar al borde vuelve a empezar, con un hueco delante del cursor.
 * Dibuja por columna de píxeles el mínimo y el máximo (decimación min/máx),
 * así conserva la forma de la señal aunque haya más muestras que píxeles.
 */
import type { BufferCircular } from '../worker/buffer-circular';

export interface ColoresOsciloscopio {
  fondo: string;
  cuadricula: string;
  ejes: string;
  canales: [string, string];
}

/** Divisiones verticales por canal (±2 div alrededor de la línea base). */
const DIV_VERTICALES = 4;
/** Divisiones horizontales en toda la ventana. */
const DIV_HORIZONTALES = 10;

export class RenderOsciloscopio {
  private ctx: CanvasRenderingContext2D;
  private ancho = 0;
  private alto = 0;
  private dpr = 1;
  /** Escala vertical en µV por división. */
  uvPorDiv = 500;

  constructor(
    private canvas: HTMLCanvasElement,
    private canales: [BufferCircular, BufferCircular],
    private colores: ColoresOsciloscopio,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D no disponible');
    this.ctx = ctx;
  }

  /** Ajusta el tamaño interno al tamaño en pantalla. Limita la densidad a 2× (pantallas Retina). */
  redimensionar(anchoCss: number, altoCss: number): void {
    this.dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
    this.ancho = Math.max(1, Math.round(anchoCss * this.dpr));
    this.alto = Math.max(1, Math.round(altoCss * this.dpr));
    this.canvas.width = this.ancho;
    this.canvas.height = this.alto;
  }

  dibujar(): void {
    const { ctx, ancho, alto } = this;
    if (!ancho || !alto) return;
    ctx.fillStyle = this.colores.fondo;
    ctx.fillRect(0, 0, ancho, alto);
    const altoCanal = alto / this.canales.length;
    this.canales.forEach((buffer, i) => {
      const y0 = i * altoCanal;
      this.cuadricula(y0, altoCanal);
      this.trazo(buffer, y0, altoCanal, this.colores.canales[i]);
    });
  }

  private cuadricula(y0: number, h: number): void {
    const { ctx, ancho, dpr } = this;
    ctx.strokeStyle = this.colores.cuadricula;
    ctx.lineWidth = dpr;
    ctx.beginPath();
    for (let d = 1; d < DIV_HORIZONTALES; d++) {
      const x = Math.round((d * ancho) / DIV_HORIZONTALES) + 0.5;
      ctx.moveTo(x, y0);
      ctx.lineTo(x, y0 + h);
    }
    for (let d = 1; d < DIV_VERTICALES; d++) {
      const y = Math.round(y0 + (d * h) / DIV_VERTICALES) + 0.5;
      ctx.moveTo(0, y);
      ctx.lineTo(ancho, y);
    }
    ctx.stroke();
    ctx.strokeStyle = this.colores.ejes;
    ctx.beginPath();
    ctx.moveTo(0, Math.round(y0 + h / 2) + 0.5);
    ctx.lineTo(ancho, Math.round(y0 + h / 2) + 0.5);
    ctx.stroke();
  }

  private trazo(buffer: BufferCircular, y0: number, h: number, color: string): void {
    const { ctx, ancho, dpr } = this;
    const n = buffer.capacidad;
    const centro = y0 + h / 2;
    const pxPorUv = h / DIV_VERTICALES / this.uvPorDiv;
    const cursor = Math.floor((buffer.escritura / n) * ancho);
    const hueco = Math.max(4 * dpr, Math.round(ancho * 0.015));
    const visibles = Math.min(buffer.total, n);

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2 * dpr;
    ctx.beginPath();
    let abierto = false;
    for (let x = 0; x < ancho; x++) {
      const delante = (x - cursor + ancho) % ancho;
      const i0 = Math.floor((x * n) / ancho);
      const i1 = Math.max(i0 + 1, Math.floor(((x + 1) * n) / ancho));
      // Sin datos todavía en esta columna, o dentro del hueco delante del cursor.
      if (delante < hueco || (buffer.total < n && i0 >= visibles)) {
        abierto = false;
        continue;
      }
      let min = Infinity;
      let max = -Infinity;
      for (let i = i0; i < i1; i++) {
        const v = buffer.datos[i];
        if (v < min) min = v;
        if (v > max) max = v;
      }
      const yMin = Math.max(y0, Math.min(y0 + h, centro - max * pxPorUv));
      const yMax = Math.max(y0, Math.min(y0 + h, centro - min * pxPorUv));
      if (!abierto) {
        ctx.moveTo(x + 0.5, yMin);
        abierto = true;
      } else ctx.lineTo(x + 0.5, yMin);
      ctx.lineTo(x + 0.5, yMax);
    }
    ctx.stroke();
  }
}
