/**
 * Buffer circular de un canal. El motor escribe bloques; el renderizador lee
 * la ventana completa en cada cuadro sin copiar ni pasar por el framework.
 */
export class BufferCircular {
  readonly datos: Float32Array;
  /** Posición donde se escribirá la próxima muestra. */
  escritura = 0;
  /** Total de muestras escritas desde el inicio. */
  total = 0;

  constructor(readonly capacidad: number) {
    this.datos = new Float32Array(capacidad);
  }

  escribir(bloque: Float32Array): void {
    for (let i = 0; i < bloque.length; i++) {
      this.datos[this.escritura] = bloque[i];
      this.escritura = (this.escritura + 1) % this.capacidad;
    }
    this.total += bloque.length;
  }

  limpiar(): void {
    this.datos.fill(0);
    this.escritura = 0;
    this.total = 0;
  }
}
