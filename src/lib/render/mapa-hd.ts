/**
 * Renderizador del mapa HD: amplitud captada por cada electrodo de una
 * rejilla 8×8 sobre el masetero. El electrodo del alumno es un elemento HTML
 * aparte (accesible con teclado), no se dibuja aquí.
 */

/** Rampa secuencial de 5 tonos, de reposo a actividad máxima. */
export type Rampa = [string, string, string, string, string];

export class RenderMapaHD {
  private ctx: CanvasRenderingContext2D;
  private lado = 0;
  /** Amplitud que corresponde al color más intenso (µV). Se ajusta sola hacia arriba. */
  private escala = 120;

  constructor(
    private canvas: HTMLCanvasElement,
    private rampa: Rampa,
    private fondo: string,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D no disponible');
    this.ctx = ctx;
  }

  redimensionar(ladoCss: number): void {
    const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
    this.lado = Math.max(1, Math.round(ladoCss * dpr));
    this.canvas.width = this.lado;
    this.canvas.height = this.lado;
  }

  dibujar(valores: Float32Array): void {
    const { ctx, lado } = this;
    if (!lado) return;
    let max = 0;
    for (const v of valores) max = Math.max(max, v);
    // La escala sube rápido y baja lento, para que el mapa no "parpadee".
    this.escala = Math.max(120, max > this.escala ? max : this.escala * 0.98 + max * 0.02);

    ctx.fillStyle = this.fondo;
    ctx.fillRect(0, 0, lado, lado);
    const celda = lado / 8;
    const separacion = Math.max(1, celda * 0.06);
    for (let fila = 0; fila < 8; fila++) {
      for (let col = 0; col < 8; col++) {
        const t = Math.min(1, valores[fila * 8 + col] / this.escala);
        ctx.fillStyle = this.rampa[Math.min(4, Math.floor(t * 5))];
        ctx.fillRect(col * celda + separacion / 2, fila * celda + separacion / 2, celda - separacion, celda - separacion);
      }
    }
  }
}
